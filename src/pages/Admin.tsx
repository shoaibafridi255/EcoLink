import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Package,
  MessageCircle,
  BarChart3,
  Trash2,
  Pencil,
  Leaf,
  TrendingUp,
  ShoppingCart,
  Store,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
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

interface ProfileRow {
  id: string;
  full_name: string | null;
  company: string | null;
  location: string | null;
  created_at: string;
}

interface MaterialRow {
  id: string;
  title: string;
  category: string;
  status: string;
  user_id: string;
  created_at: string;
  location: string | null;
  price_type: string;
  quantity: string | null;
}

interface ConversationRow {
  id: string;
  material_id: string;
  seeker_id: string;
  lister_id: string;
  created_at: string;
}

const Admin = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<(ProfileRow & { role?: string; roles?: string[] })[]>([]);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [editingMaterial, setEditingMaterial] = useState<MaterialRow | null>(null);
  const [savingMaterial, setSavingMaterial] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || role !== "admin")) {
      toast.error("Access denied — admin only");
      navigate("/");
    }
  }, [authLoading, user, role, navigate]);

  useEffect(() => {
    if (role !== "admin") return;
    const fetchData = async () => {
      setLoadingData(true);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, company, location, created_at");
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");
      const rolesByUser = new Map<string, string[]>();
      (roles ?? []).forEach((r) => {
        rolesByUser.set(r.user_id, [...(rolesByUser.get(r.user_id) ?? []), r.role]);
      });
      const getPrimaryRole = (userRoles: string[] = []) =>
        userRoles.includes("admin") ? "admin" : userRoles.includes("lister") ? "lister" : userRoles.includes("seeker") ? "seeker" : "unknown";
      const enrichedUsers = (profiles ?? []).map((p) => ({
        ...p,
        roles: rolesByUser.get(p.id) ?? [],
        role: getPrimaryRole(rolesByUser.get(p.id)),
      }));
      setUsers(enrichedUsers);

      const { data: mats } = await supabase
        .from("materials")
        .select("id, title, category, status, user_id, created_at, location, price_type, quantity")
        .order("created_at", { ascending: false });
      setMaterials(mats ?? []);

      const { data: convs } = await supabase
        .from("conversations")
        .select("id, material_id, seeker_id, lister_id, created_at");
      setConversations(convs ?? []);

      const { count: msgCount } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true });
      setMessageCount(msgCount ?? 0);

      setLoadingData(false);
    };
    fetchData();
  }, [role]);

  // Computed stats
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeListings = materials.filter((m) => m.status === "active").length;
    const totalListings = materials.length;
    const totalConversations = conversations.length;

    // Unique listers who have listed materials
    const uniqueListers = new Set(materials.map((m) => m.user_id)).size;
    // Unique seekers who initiated conversations (buyers)
    const uniqueSeekers = new Set(conversations.map((c) => c.seeker_id)).size;
    // Unique businesses involved in transactions (both sides)
    const businessesTrading = new Set([
      ...conversations.map((c) => c.seeker_id),
      ...conversations.map((c) => c.lister_id),
    ]).size;

    // Waste diverted estimate: count materials that have at least one conversation (interest)
    const materialsWithInterest = new Set(conversations.map((c) => c.material_id));
    const wasteDiverted = materialsWithInterest.size;

    // Category breakdown
    const categoryMap = new Map<string, number>();
    materials.forEach((m) => {
      categoryMap.set(m.category, (categoryMap.get(m.category) ?? 0) + 1);
    });
    const categories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // Listers vs Seekers
    const listerCount = users.filter((u) => u.role === "lister").length;
    const seekerCount = users.filter((u) => u.role === "seeker").length;

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = users.filter(
      (u) => new Date(u.created_at) >= weekAgo
    ).length;
    const newListingsThisWeek = materials.filter(
      (m) => new Date(m.created_at) >= weekAgo
    ).length;

    return {
      totalUsers,
      activeListings,
      totalListings,
      totalConversations,
      uniqueListers,
      uniqueSeekers,
      businessesTrading,
      wasteDiverted,
      categories,
      listerCount,
      seekerCount,
      newUsersThisWeek,
      newListingsThisWeek,
      messageCount,
    };
  }, [users, materials, conversations, messageCount]);

  const handleDeleteMaterial = async (id: string) => {
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) {
      toast.error(`Failed to delete: ${error.message}`);
      return;
    }
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    toast.success("Material deleted");
  };

  const handleSaveMaterial = async () => {
    if (!editingMaterial) return;
    setSavingMaterial(true);
    const { id, title, category, status, price_type, location, quantity } = editingMaterial;
    const { error } = await supabase
      .from("materials")
      .update({ title, category, status, price_type, location, quantity })
      .eq("id", id);
    setSavingMaterial(false);
    if (error) {
      toast.error(`Failed to update: ${error.message}`);
      return;
    }
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, title, category, status, price_type, location, quantity } : m)));
    setEditingMaterial(null);
    toast.success("Material updated");
  };

  const handleRemoveUser = async (profileId: string) => {
    if (profileId === user?.id) {
      toast.error("You cannot remove your own admin account");
      return;
    }
    const { error: matErr } = await supabase.from("materials").delete().eq("user_id", profileId);
    if (matErr) { toast.error(`Failed: ${matErr.message}`); return; }
    const { error: roleErr } = await supabase.from("user_roles").delete().eq("user_id", profileId);
    if (roleErr) { toast.error(`Failed: ${roleErr.message}`); return; }
    const { error: profErr } = await supabase.from("profiles").delete().eq("id", profileId);
    if (profErr) { toast.error(`Failed: ${profErr.message}`); return; }
    setUsers((prev) => prev.filter((u) => u.id !== profileId));
    setMaterials((prev) => prev.filter((m) => m.user_id !== profileId));
    toast.success("User removed from platform");
  };

  const handleRevokeAdmin = async (profileId: string) => {
    if (profileId === user?.id) {
      toast.error("You cannot revoke your own admin role");
      return;
    }
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", profileId)
      .eq("role", "admin");
    if (error) { toast.error(`Failed: ${error.message}`); return; }
    setUsers((prev) => prev.map((u) => u.id === profileId
      ? { ...u, roles: (u.roles ?? []).filter((r) => r !== "admin"), role: (u.roles ?? []).filter((r) => r !== "admin").includes("lister") ? "lister" : "seeker" }
      : u));
    toast.success("Admin role revoked");
  };

  const handleMakeAdmin = async (profileId: string) => {
    const target = users.find((u) => u.id === profileId);
    if (target?.roles?.includes("admin")) return;
    setUpdatingRoleId(profileId);
    const { error } = await supabase.from("user_roles").insert({ user_id: profileId, role: "admin" });
    setUpdatingRoleId(null);
    if (error) {
      toast.error("Failed to assign admin role");
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === profileId
          ? { ...u, roles: Array.from(new Set([...(u.roles ?? []), "admin"])), role: "admin" }
          : u
      )
    );
    toast.success("Admin role assigned");
  };

  if (authLoading || role !== "admin") return null;

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.company ?? "").toLowerCase().includes(q) ||
      (u.location ?? "").toLowerCase().includes(q) ||
      (u.role ?? "").toLowerCase().includes(q)
    );
  });

  const filteredMaterials = materials.filter((m) => {
    if (!materialSearch.trim()) return true;
    const q = materialSearch.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      (m.location ?? "").toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q)
    );
  });

  const V = ({ v }: { v: number | string }) => (
    <span>{loadingData ? "…" : v}</span>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 gradient-eco rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Full platform overview &amp; management
              </p>
            </div>
          </div>

          {/* Primary Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-6">
            {[
              {
                label: "Total Users",
                value: stats.totalUsers,
                icon: Users,
                sub: `${stats.newUsersThisWeek} this week`,
                color: "text-blue-500",
              },
              {
                label: "Active Listings",
                value: stats.activeListings,
                icon: Package,
                sub: `${stats.totalListings} total`,
                color: "text-emerald-500",
              },
              {
                label: "Waste Diverted",
                value: stats.wasteDiverted,
                icon: Leaf,
                sub: "materials with interest",
                color: "text-green-600",
              },
              {
                label: "Conversations",
                value: stats.totalConversations,
                icon: MessageCircle,
                sub: `${stats.messageCount} messages`,
                color: "text-purple-500",
              },
            ].map((s) => (
              <Card key={s.label} className="relative overflow-hidden">
                <CardContent className="py-5 px-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {s.label}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        <V v={s.value} />
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {s.sub}
                      </p>
                    </div>
                    <s.icon className={`w-8 h-8 ${s.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Businesses Selling",
                value: stats.uniqueListers,
                icon: Store,
                color: "text-orange-500",
              },
              {
                label: "Businesses Buying",
                value: stats.uniqueSeekers,
                icon: ShoppingCart,
                color: "text-cyan-500",
              },
              {
                label: "Businesses Trading",
                value: stats.businessesTrading,
                icon: TrendingUp,
                color: "text-primary",
              },
              {
                label: "New Listings (7d)",
                value: stats.newListingsThisWeek,
                icon: BarChart3,
                color: "text-amber-500",
              },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="py-4 px-4 flex items-center gap-3">
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      <V v={s.value} />
                    </p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Role & Category Breakdown */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">User Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-foreground">Listers (Sellers)</span>
                  </div>
                  <Badge variant="secondary">{stats.listerCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-foreground">Seekers (Buyers)</span>
                  </div>
                  <Badge variant="secondary">{stats.seekerCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">Admins</span>
                  </div>
                  <Badge variant="secondary">
                    {users.filter((u) => u.role === "admin").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Top Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.categories.length === 0 && (
                  <p className="text-sm text-muted-foreground">No materials yet</p>
                )}
                {stats.categories.slice(0, 5).map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-foreground capitalize">
                      {c.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full bg-primary/60"
                        style={{
                          width: `${Math.max(
                            20,
                            (c.count / (stats.categories[0]?.count || 1)) * 100
                          )}px`,
                        }}
                      />
                      <Badge variant="outline">{c.count}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <CardTitle>All Users ({filteredUsers.length} / {users.length})</CardTitle>
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search name, company, role…"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Company</th>
                          <th className="py-2 px-3">Location</th>
                          <th className="py-2 px-3">Role</th>
                          <th className="py-2 px-3">Joined</th>
                          <th className="py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr
                            key={u.id}
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-2 px-3 text-foreground font-medium">
                              {u.full_name || "—"}
                            </td>
                            <td className="py-2 px-3">{u.company || "—"}</td>
                            <td className="py-2 px-3">{u.location || "—"}</td>
                            <td className="py-2 px-3">
                              <Badge
                                variant={
                                  u.role === "admin" ? "default" : "secondary"
                                }
                                className="capitalize"
                              >
                                {u.role}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                {u.roles?.includes("admin") ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={u.id === user?.id}
                                    onClick={() => handleRevokeAdmin(u.id)}
                                  >
                                    <ShieldOff className="w-3.5 h-3.5 mr-1" />
                                    Revoke
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={updatingRoleId === u.id}
                                    onClick={() => handleMakeAdmin(u.id)}
                                  >
                                    Make Admin
                                  </Button>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:text-destructive"
                                      disabled={u.id === user?.id}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove user "{u.full_name || 'Unnamed'}"?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This deletes the user's profile, all their listings and roles. The auth account stays but loses access. This cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleRemoveUser(u.id)}>
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <CardTitle>All Materials ({filteredMaterials.length} / {materials.length})</CardTitle>
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={materialSearch}
                        onChange={(e) => setMaterialSearch(e.target.value)}
                        placeholder="Search title, category, status…"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                          <th className="py-2 px-3">Title</th>
                          <th className="py-2 px-3">Category</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Price</th>
                          <th className="py-2 px-3">Location</th>
                          <th className="py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMaterials.map((m) => (
                          <tr
                            key={m.id}
                            className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-2 px-3 text-foreground font-medium">
                              {m.title}
                            </td>
                            <td className="py-2 px-3 capitalize">
                              {m.category}
                            </td>
                            <td className="py-2 px-3">
                              <Badge
                                variant={
                                  m.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="capitalize"
                              >
                                {m.status}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 capitalize">
                              {m.price_type}
                            </td>
                            <td className="py-2 px-3">
                              {m.location || "—"}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingMaterial(m)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete "{m.title}"?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteMaterial(m.id)
                                      }
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Business Transactions ({conversations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Each conversation represents a business expressing interest
                    in purchasing/acquiring materials from another business.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                          <th className="py-2 px-3">Material</th>
                          <th className="py-2 px-3">Seller</th>
                          <th className="py-2 px-3">Buyer</th>
                          <th className="py-2 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conversations.map((c) => {
                          const mat = materials.find(
                            (m) => m.id === c.material_id
                          );
                          const seller = users.find(
                            (u) => u.id === c.lister_id
                          );
                          const buyer = users.find(
                            (u) => u.id === c.seeker_id
                          );
                          return (
                            <tr
                              key={c.id}
                              className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                            >
                              <td className="py-2 px-3 text-foreground font-medium">
                                {mat?.title ?? "—"}
                              </td>
                              <td className="py-2 px-3">
                                {seller?.full_name ?? seller?.company ?? "—"}
                              </td>
                              <td className="py-2 px-3">
                                {buyer?.full_name ?? buyer?.company ?? "—"}
                              </td>
                              <td className="py-2 px-3 text-muted-foreground">
                                {new Date(c.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                        {conversations.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="py-8 text-center text-muted-foreground"
                            >
                              No transactions yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;