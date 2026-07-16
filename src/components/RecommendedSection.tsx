import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, MapPin, Package, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSignedMaterialUrl } from "@/lib/materialImage";

interface MaterialRec {
  id: string;
  title: string;
  category: string;
  location: string | null;
  image_url: string | null;
  images: string[] | null;
  reason: string;
}

interface BuyerRec {
  id: string;
  name: string;
  company: string | null;
  location: string | null;
  avatar_url: string | null;
  reason: string;
}

const MaterialRecCard = ({ m, i }: { m: MaterialRec; i: number }) => {
  const rawImg = m.image_url || m.images?.[0];
  const img = useSignedMaterialUrl(rawImg);
  return (
    <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
      <Link to={`/materials/${m.id}`}>
        <Card className="h-full hover:shadow-hover transition-shadow overflow-hidden group">
          {img && (
            <div className="h-32 overflow-hidden bg-muted">
              <img src={img} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
            </div>
          )}
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground line-clamp-1">{m.title}</h3>
              <Badge variant="secondary" className="capitalize shrink-0">{m.category}</Badge>
            </div>
            {m.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {m.location}
              </div>
            )}
            <p className="text-xs text-foreground/80 flex gap-1 items-start">
              <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
              <span className="line-clamp-2">{m.reason}</span>
            </p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

const RecommendedSection = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"materials" | "buyers">("materials");
  const [items, setItems] = useState<(MaterialRec | BuyerRec)[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !session) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.functions.invoke("recommendations");
      if (cancelled) return;
      if (error) {
        setError("Could not load recommendations.");
      } else if (data) {
        setMode(data.mode);
        setItems(data.items ?? []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, session]);

  if (!user) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg gradient-eco flex items-center justify-center shadow-eco">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Recommended for you
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "materials"
                ? "AI-picked materials that match your interests and browsing."
                : "AI-picked buyers who may want the materials you listed."}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <p className="text-muted-foreground">{error}</p>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              Not enough signal yet — {mode === "materials" ? "browse a few materials" : "list a material or complete your profile"} and we'll tailor picks for you.
            </CardContent>
          </Card>
        ) : mode === "materials" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(items as MaterialRec[]).map((m, i) => (
              <MaterialRecCard key={m.id} m={m} i={i} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(items as BuyerRec[]).map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={b.avatar_url ?? undefined} alt={b.name} />
                        <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{b.name}</h3>
                        {b.company && <p className="text-xs text-muted-foreground truncate">{b.company}</p>}
                      </div>
                    </div>
                    {b.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {b.location}
                      </div>
                    )}
                    <p className="text-xs text-foreground/80 flex gap-1 items-start">
                      <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      <span className="line-clamp-3">{b.reason}</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedSection;