import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Recycle, Loader2, ShieldAlert } from "lucide-react";

const ADMIN_EMAIL = "shoaibafridi150@gmail.com";

const AdminSetPassword = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  const isAuthorized = user?.email?.toLowerCase() === ADMIN_EMAIL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password set! You can now sign in with email + password.");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 gradient-eco rounded-lg flex items-center justify-center shadow-eco">
            <Recycle className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground">
            Eco<span className="text-gradient-eco">Link</span>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-2xl shadow-card p-8">
          {!isAuthorized ? (
            <div className="space-y-3 text-center">
              <ShieldAlert className="w-10 h-10 mx-auto text-destructive" />
              <h1 className="font-display text-xl font-bold">Not authorized</h1>
              <p className="text-sm text-muted-foreground">
                This page is only available to the EcoLink admin account.
                Sign in with the admin Google account, then return to this page.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                Back to home
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold mb-2">Set admin password</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Signed in as <span className="font-medium text-foreground">{user?.email}</span>.
                Set a password to enable email + password sign-in for this admin account.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </div>
                <Button type="submit" variant="eco" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Set password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetPassword;