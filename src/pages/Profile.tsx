import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Package,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  ImagePlus,
  X,
  BadgeCheck,
  MessageSquare,
  Sparkles,
  Eye,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { useSignedMaterialUrl } from "@/lib/materialImage";

interface Profile {
  full_name: string | null;
  company: string | null;
  location: string | null;
  avatar_url: string | null;
}

interface Material {
  id: string;
  title: string;
  description: string | null;
  category: string;
  quantity: string | null;
  price_type: string;
  price: number | null;
  location: string | null;
  status: string;
  image_url: string | null;
  images: string[] | null;
  created_at: string;
}

const CATEGORIES = [
  "metals", "wood", "textiles", "plastics", "paper", "glass", "chemicals", "electronics", "organic", "other",
];

const emptyMaterial = {
  title: "",
  description: "",
  category: "other",
  quantity: "",
  price_type: "free",
  price: "",
  location: "",
  status: "active",
};

const Profile = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ full_name: "", company: "", location: "", avatar_url: "" });
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [matLoading, setMatLoading] = useState(true);
  const [matForm, setMatForm] = useState(emptyMaterial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  // Fetch profile
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, company, location, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  // Fetch materials
  useEffect(() => {
    if (!user) return;
    setMatLoading(true);
    supabase
      .from("materials")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMaterials(data ?? []);
        setMatLoading(false);
      });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        company: profile.company,
        location: profile.location,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Failed to update profile");
    else toast.success("Profile updated!");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setAvatarUploading(true);
    setAvatarProgress(5);
    // Simulated progress — supabase-js upload doesn't expose upload events.
    const timer = setInterval(() => {
      setAvatarProgress((p) => (p < 90 ? p + Math.max(1, (90 - p) * 0.15) : p));
    }, 200);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      clearInterval(timer);
      setAvatarProgress(0);
      setAvatarUploading(false);
      toast.error("Upload failed");
      return;
    }
    const { data: signed, error: signErr } = await supabase.storage
      .from("avatars")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signErr || !signed) {
      clearInterval(timer);
      setAvatarProgress(0);
      setAvatarUploading(false);
      toast.error("Could not generate image URL");
      return;
    }
    const url = signed.signedUrl;
    const { error: updErr } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", user.id);
    clearInterval(timer);
    setAvatarProgress(100);
    setAvatarUploading(false);
    if (updErr) {
      setAvatarProgress(0);
      toast.error("Could not save profile picture");
      return;
    }
    setProfile((p) => ({ ...p, avatar_url: url }));
    toast.success("Profile picture updated!");
    setTimeout(() => setAvatarProgress(0), 800);
  };

  const openAddMaterial = () => {
    setEditingId(null);
    setMatForm(emptyMaterial);
    setImageFiles([]);
    setExistingImages([]);
    setDialogOpen(true);
  };

  const openEditMaterial = (m: Material) => {
    setEditingId(m.id);
    setMatForm({
      title: m.title,
      description: m.description ?? "",
      category: m.category,
      quantity: m.quantity ?? "",
      price_type: m.price_type,
      price: m.price != null ? String(m.price) : "",
      location: m.location ?? "",
      status: m.status,
    });
    setImageFiles([]);
    setExistingImages(m.images ?? []);
    setDialogOpen(true);
  };

  const handleSaveMaterial = async () => {
    if (!user || !matForm.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const totalImages = existingImages.length + imageFiles.length;
    if (totalImages > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Upload new images
    setUploading(true);
    const uploadedUrls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("material-images").upload(path, file);
      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        setUploading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("material-images").getPublicUrl(path);
      uploadedUrls.push(urlData.publicUrl);
    }
    setUploading(false);

    const allImages = [...existingImages, ...uploadedUrls];

    const payload = {
      title: matForm.title.trim(),
      description: matForm.description.trim() || null,
      category: matForm.category,
      quantity: matForm.quantity.trim() || null,
      price_type: matForm.price_type,
      price: matForm.price ? Number(matForm.price) : null,
      location: matForm.location.trim() || null,
      status: matForm.status,
      user_id: user.id,
      images: allImages as string[],
    };

    if (editingId) {
      const { error } = await supabase.from("materials").update(payload).eq("id", editingId);
      if (error) { toast.error(`Failed to update: ${error.message}`); return; }
      setMaterials((prev) => prev.map((m) => (m.id === editingId ? { ...m, ...payload } : m)));
      toast.success("Material updated!");
    } else {
      const { data, error } = await supabase.from("materials").insert(payload).select().single();
      if (error) { toast.error(`Failed to add: ${error.message}`); return; }
      setMaterials((prev) => [data, ...prev]);
      toast.success("Material added!");
    }
    setDialogOpen(false);
  };

  const handleDeleteMaterial = async (id: string) => {
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) { toast.error(`Failed to delete: ${error.message}`); return; }
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    toast.success("Material deleted");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const total = existingImages.length + imageFiles.length + files.length;
    if (total > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeNewImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  if (loading) return null;

  const activeCount = materials.filter((m) => m.status === "active").length;
  const soldCount = materials.filter((m) => m.status === "sold").length;
  const wasteDiverted = soldCount * 250; // proxy: 250kg per completed transaction
  const displayName = profile.full_name?.trim() || user?.email?.split("@")[0] || "Member";

  return (
    <div className="min-h-screen bg-cream/40">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          {/* ─── Identity Tile ─── */}
          <BentoTile className="md:col-span-4 bg-ink-deep text-cream p-6 flex flex-col items-center text-center shadow-lg">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-ink p-1 ring-2 ring-gold overflow-hidden flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <User className="w-10 h-10 text-cream/70" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gold text-ink-deep text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm inline-flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" /> Verified
              </div>
            </div>
            <h1 className="mt-5 text-2xl font-bold font-display tracking-tight break-words">
              {displayName}
            </h1>
            {role && (
              <p className="text-ink bg-cream px-3 py-0.5 rounded-full text-xs font-semibold mt-2 uppercase tracking-wide">
                {role}
              </p>
            )}
            <div className="mt-6 w-full space-y-2 text-sm">
              <div className="flex justify-between border-b border-ink/40 pb-2">
                <span className="font-medium text-cream/70">Company</span>
                <span className="text-cream truncate ml-2">{profile.company || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-ink/40 pb-2">
                <span className="font-medium text-cream/70">Location</span>
                <span className="text-cream truncate ml-2">{profile.location || "—"}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="font-medium text-cream/70">Email</span>
                <span className="text-cream truncate ml-2 text-xs">{user?.email}</span>
              </div>
            </div>

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <Button
              type="button"
              size="sm"
              className="mt-6 w-full gap-2 bg-cream text-ink-deep hover:bg-cream/90 rounded-xl font-bold"
              disabled={avatarUploading}
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              <ImagePlus className="w-4 h-4" />
              {avatarUploading
                ? "Uploading…"
                : profile.avatar_url
                  ? "Change picture"
                  : "Upload picture"}
            </Button>
            {(avatarUploading || avatarProgress > 0) && (
              <div className="w-full mt-3 space-y-1">
                <Progress value={avatarProgress} className="h-2 bg-ink" />
                <p className="text-[10px] text-cream/70 text-center">{Math.round(avatarProgress)}%</p>
              </div>
            )}
          </BentoTile>

          {/* ─── Right column grid ─── */}
          <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat tiles */}
            <StatTile
              label="Waste Diverted"
              value={
                <>
                  {wasteDiverted.toLocaleString()} <span className="text-sm font-semibold text-ink">kg</span>
                </>
              }
              icon={<Leaf className="w-4 h-4 text-ink" />}
            />
            <StatTile label="Active Listings" value={activeCount} icon={<Package className="w-4 h-4 text-ink" />} />
            <StatTile
              gold
              label="Total Listings"
              value={materials.length}
              icon={<Eye className="w-4 h-4 text-gold" />}
            />
            <StatTile
              label="Conversations"
              value={<MessagesCounter />}
              icon={<MessageSquare className="w-4 h-4 text-ink" />}
            />

            {/* Editable profile info tile */}
            <BentoTile className="col-span-2 lg:col-span-3 bg-white p-6 border border-ink/10">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <h3 className="font-display font-bold text-lg text-ink-deep">Profile Information</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="text-ink hover:text-ink-deep hover:bg-cream font-bold"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FieldRow label="Email">
                  <Input value={user?.email ?? ""} disabled className="bg-cream/50 border-transparent text-sm text-ink-deep/70" />
                </FieldRow>
                <FieldRow label="Full Name">
                  <Input
                    value={profile.full_name ?? ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Your full name"
                    className="bg-cream/50 border-transparent focus-visible:border-ink text-sm"
                  />
                </FieldRow>
                <FieldRow label="Company">
                  <Input
                    value={profile.company ?? ""}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    placeholder="Company or organization"
                    className="bg-cream/50 border-transparent focus-visible:border-ink text-sm"
                  />
                </FieldRow>
                <FieldRow label="Location">
                  <Input
                    value={profile.location ?? ""}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="City, Country"
                    className="bg-cream/50 border-transparent focus-visible:border-ink text-sm"
                  />
                </FieldRow>
              </div>
            </BentoTile>

            {/* Quick actions tile */}
            <BentoTile className="col-span-2 lg:col-span-1 bg-ink p-5 text-white flex flex-col justify-center gap-3">
              <p className="text-[10px] uppercase tracking-widest font-bold text-cream/70">Quick actions</p>
              <Button
                onClick={openAddMaterial}
                className="w-full bg-gold text-ink-deep hover:brightness-110 rounded-2xl py-6 font-bold text-sm shadow-md"
              >
                <Plus className="w-4 h-4 mr-1" /> Post Material
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-6 font-bold text-sm text-cream hover:bg-white/20 hover:text-cream"
              >
                <Link to="/messages">
                  <MessageSquare className="w-4 h-4 mr-1" /> Messages
                </Link>
              </Button>
            </BentoTile>
          </div>

          {/* ─── Materials Bento Tile ─── */}
          <BentoTile className="md:col-span-12 bg-white p-6 md:p-8 border border-ink/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display tracking-tight text-ink-deep">My Materials</h2>
                <p className="text-sm text-ink font-medium">Manage your resource listings</p>
              </div>
              <Button
                onClick={openAddMaterial}
                className="bg-ink-deep text-cream hover:bg-ink rounded-xl font-bold"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Listing
              </Button>
            </div>

            {matLoading ? (
              <p className="text-ink py-8 text-center">Loading…</p>
            ) : materials.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-ink/15 rounded-2xl">
                <Package className="w-12 h-12 mx-auto text-ink/40 mb-3" />
                <p className="text-ink">You haven't listed any materials yet.</p>
                <Button
                  size="sm"
                  className="mt-4 gap-1 bg-ink-deep text-cream hover:bg-ink rounded-xl"
                  onClick={openAddMaterial}
                >
                  <Plus className="w-4 h-4" /> Add Your First Material
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {materials.map((m) => (
                  <MaterialCard
                    key={m.id}
                    material={m}
                    onEdit={() => openEditMaterial(m)}
                    onDelete={() => handleDeleteMaterial(m.id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={openAddMaterial}
                  className="border-2 border-dashed border-ink/25 rounded-2xl flex flex-col items-center justify-center p-6 hover:bg-cream/50 transition-colors group cursor-pointer min-h-[180px]"
                >
                  <div className="w-8 h-8 rounded-full bg-ink/10 text-ink flex items-center justify-center font-bold text-xl mb-2 group-hover:scale-110 transition-transform">
                    +
                  </div>
                  <span className="text-xs font-bold text-ink uppercase tracking-wider">Add Listing</span>
                </button>
              </div>
            )}
          </BentoTile>
        </motion.div>

        {/* ─── Add / Edit Material Dialog ─── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Material" : "Add Material"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title *</Label>
                <Input value={matForm.title} onChange={(e) => setMatForm({ ...matForm, title: e.target.value })} placeholder="e.g. Steel offcuts" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={matForm.description} onChange={(e) => setMatForm({ ...matForm, description: e.target.value })} placeholder="Describe the material…" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={matForm.category} onValueChange={(v) => setMatForm({ ...matForm, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input value={matForm.quantity} onChange={(e) => setMatForm({ ...matForm, quantity: e.target.value })} placeholder="e.g. 500 kg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price Type</Label>
                  <Select value={matForm.price_type} onValueChange={(v) => setMatForm({ ...matForm, price_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="negotiable">Negotiable</SelectItem>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {matForm.price_type === "fixed" && (
                  <div>
                    <Label>Price ($)</Label>
                    <Input type="number" value={matForm.price} onChange={(e) => setMatForm({ ...matForm, price: e.target.value })} placeholder="0.00" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Location</Label>
                  <Input value={matForm.location} onChange={(e) => setMatForm({ ...matForm, location: e.target.value })} placeholder="City" />
                </div>
                {editingId && (
                  <div>
                    <Label>Status</Label>
                    <Select value={matForm.status} onValueChange={(v) => setMatForm({ ...matForm, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            {/* ─── Image Upload ─── */}
            <div>
              <Label>Images (max 5)</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {existingImages.map((url, i) => (
                  <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {imageFiles.map((f, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {existingImages.length + imageFiles.length < 5 && (
                  <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <ImagePlus className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="eco" onClick={handleSaveMaterial} disabled={uploading}>
                {uploading ? "Uploading…" : editingId ? "Save Changes" : "Add Material"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;