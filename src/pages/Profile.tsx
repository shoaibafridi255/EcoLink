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
import { User, Package, Plus, Pencil, Trash2, MapPin, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

    const payload: Record<string, unknown> = {
      title: matForm.title.trim(),
      description: matForm.description.trim() || null,
      category: matForm.category,
      quantity: matForm.quantity.trim() || null,
      price_type: matForm.price_type,
      price: matForm.price ? Number(matForm.price) : null,
      location: matForm.location.trim() || null,
      status: matForm.status,
      user_id: user.id,
      images: allImages,
    };

    if (editingId) {
      const { error } = await supabase.from("materials").update(payload).eq("id", editingId);
      if (error) { toast.error("Failed to update"); return; }
      setMaterials((prev) => prev.map((m) => (m.id === editingId ? { ...m, ...payload } : m)));
      toast.success("Material updated!");
    } else {
      const { data, error } = await supabase.from("materials").insert(payload).select().single();
      if (error) { toast.error("Failed to add"); return; }
      setMaterials((prev) => [data, ...prev]);
      toast.success("Material added!");
    }
    setDialogOpen(false);
  };

  const handleDeleteMaterial = async (id: string) => {
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground mb-8">
            Manage your profile information and materials.
            {role && (
              <Badge variant="secondary" className="ml-2 capitalize">{role}</Badge>
            )}
          </p>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" /> Profile</TabsTrigger>
              <TabsTrigger value="materials" className="gap-2"><Package className="w-4 h-4" /> My Materials</TabsTrigger>
            </TabsList>

            {/* ─── Profile Tab ─── */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email ?? ""} disabled className="bg-muted" />
                  </div>
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={profile.full_name ?? ""}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={profile.company ?? ""}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      placeholder="Company or organization"
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={profile.location ?? ""}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                  <Button variant="eco" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── Materials Tab ─── */}
            <TabsContent value="materials">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Your Listings</h2>
                <Button variant="eco" size="sm" onClick={openAddMaterial} className="gap-1">
                  <Plus className="w-4 h-4" /> Add Material
                </Button>
              </div>

              {matLoading ? (
                <p className="text-muted-foreground py-8 text-center">Loading…</p>
              ) : materials.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">You haven't listed any materials yet.</p>
                    <Button variant="eco" size="sm" className="mt-4 gap-1" onClick={openAddMaterial}>
                      <Plus className="w-4 h-4" /> Add Your First Material
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {materials.map((m) => (
                    <Card key={m.id} className="overflow-hidden">
                      <CardContent className="flex items-start gap-4 py-4">
                        {/* Thumbnail */}
                        {(m.images?.length ?? 0) > 0 && (
                          <img
                            src={m.images![0]}
                            alt={m.title}
                            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-foreground truncate">{m.title}</h3>
                            <Badge variant={m.status === "active" ? "default" : "secondary"} className="capitalize text-xs">
                              {m.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize text-xs">{m.category}</Badge>
                          </div>
                          {m.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {m.location && (
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.location}</span>
                            )}
                            {m.price_type === "free" ? "Free" : m.price != null ? `$${m.price}` : m.price_type}
                            {m.quantity && <span>Qty: {m.quantity}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => openEditMaterial(m)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{m.title}"?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteMaterial(m.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
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