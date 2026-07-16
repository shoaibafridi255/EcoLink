import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Tag, Clock, Building2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { signMany } from "@/lib/materialImage";

interface MaterialRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  quantity: string | null;
  price_type: string;
  price: number | null;
  location: string | null;
  status: string;
  images: string[] | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
}

const MaterialDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [material, setMaterial] = useState<MaterialRow | null>(null);
  const [listerProfile, setListerProfile] = useState<{ full_name: string | null; company: string | null; location: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [expressing, setExpressing] = useState(false);
  const [signedImages, setSignedImages] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchMaterial = async () => {
      setLoading(true);
      const { data } = await supabase.from("materials").select("*").eq("id", id).maybeSingle();
      if (data) {
        setMaterial(data);
        const { data: profile } = await supabase.from("profiles").select("full_name, company, location").eq("id", data.user_id).maybeSingle();
        setListerProfile(profile);
        // Track view for AI recommendations (fire-and-forget)
        if (user && user.id !== data.user_id) {
          supabase.from("material_views").insert({ user_id: user.id, material_id: data.id });
        }
      }
      setLoading(false);
    };
    fetchMaterial();
  }, [id, user]);

  useEffect(() => {
    if (!material) return;
    const raw = material.images?.length ? material.images : material.image_url ? [material.image_url] : [];
    if (raw.length === 0) { setSignedImages([]); return; }
    let cancelled = false;
    signMany(raw).then((urls) => {
      if (!cancelled) setSignedImages(urls.filter((u): u is string => !!u));
    });
    return () => { cancelled = true; };
  }, [material]);

  const handleExpressInterest = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!material) return;
    if (user.id === material.user_id) { toast.error("You can't message yourself"); return; }

    setExpressing(true);
    // Check for existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("material_id", material.id)
      .eq("seeker_id", user.id)
      .maybeSingle();

    if (existing) {
      navigate(`/messages?c=${existing.id}`);
      setExpressing(false);
      return;
    }

    const { data: conv, error } = await supabase
      .from("conversations")
      .insert({ material_id: material.id, seeker_id: user.id, lister_id: material.user_id })
      .select()
      .single();

    setExpressing(false);
    if (error) { toast.error("Failed to start conversation"); return; }
    navigate(`/messages?c=${conv.id}`);
  };

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><p className="pt-24 text-center text-muted-foreground">Loading…</p></div>;
  if (!material) return <div className="min-h-screen bg-background"><Navbar /><p className="pt-24 text-center text-muted-foreground">Material not found.</p></div>;

  const images = signedImages;
  const pricingLabel = material.price_type === "free" ? "Free" : material.price_type === "fixed" ? `$${material.price}` : "Negotiable";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">← Back</Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              {images.length > 0 ? (
                <>
                  <div className="aspect-square rounded-2xl overflow-hidden border border-border mb-3">
                    <img src={images[selectedImg]} alt={material.title} className="w-full h-full object-cover" />
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {images.map((img, i) => (
                        <button key={i} onClick={() => setSelectedImg(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === selectedImg ? "border-primary" : "border-border"}`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
                  <Tag className="w-16 h-16 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <Badge className="mb-3 capitalize">{material.category}</Badge>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">{material.title}</h1>
              <Badge variant="secondary" className="text-lg px-3 py-1 mb-4">{pricingLabel}</Badge>

              {material.description && (
                <p className="text-muted-foreground mb-6 whitespace-pre-wrap">{material.description}</p>
              )}

              <div className="space-y-3 mb-6">
                {material.quantity && (
                  <div className="flex items-center gap-2 text-sm"><Tag className="w-4 h-4 text-primary" /> Quantity: {material.quantity}</div>
                )}
                {material.location && (
                  <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-primary" /> {material.location}</div>
                )}
                <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-primary" /> Posted {new Date(material.created_at).toLocaleDateString()}</div>
              </div>

              {/* Lister info */}
              {listerProfile && (
                <Card className="mb-6">
                  <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground mb-1">Listed by</p>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">{listerProfile.company || listerProfile.full_name || "Anonymous"}</span>
                    </div>
                    {listerProfile.location && <p className="text-xs text-muted-foreground mt-1 ml-6">{listerProfile.location}</p>}
                  </CardContent>
                </Card>
              )}

              {user?.id !== material.user_id && (
                <Button variant="eco" size="lg" className="w-full gap-2" onClick={handleExpressInterest} disabled={expressing}>
                  <MessageCircle className="w-5 h-5" />
                  {expressing ? "Starting chat…" : "Express Interest"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default MaterialDetail;