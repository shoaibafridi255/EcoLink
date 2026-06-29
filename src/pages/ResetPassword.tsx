import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Recycle, Loader2 } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase JS auto-parses the recovery token from the URL hash and emits PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

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
    toast.success("Password updated! You can now sign in with email + password.");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 gradient-eco rounded-lg flex items-center justify-center shadow-eco">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground">
            Eco<span className="text-gradient-eco">Link</span>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-2xl shadow-card p-8">
          <h1 className="font-display text-2xl font-bold mb-2">Set a new password</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Choose a password to sign in with email going forward.
          </p>
          {!ready ? (
            <p className="text-sm text-muted-foreground">
              Waiting for recovery link… Open this page from the password reset email.
            </p>
          ) : (
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
                Update password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;