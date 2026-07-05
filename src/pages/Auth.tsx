import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Recycle, Loader2, Eye, EyeOff } from "lucide-react";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(1, "Name is required").max(100),
  company: z.string().trim().max(100).optional(),
  location: z.string().trim().max(100).optional(),
  role: z.enum(["lister", "seeker"]),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const initialTab = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const initialRole: "lister" | "seeker" = "seeker";
  const [tab, setTab] = useState(initialTab);
  const [submitting, setSubmitting] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState<"lister" | "seeker">(initialRole);

  const ensureProfileAndRole = async (signedInUser: { id: string; user_metadata?: Record<string, unknown> }) => {
    const metadata = signedInUser.user_metadata ?? {};
    const rawRole = (metadata.role as string | undefined) ?? role;
    const requestedRole: "lister" | "seeker" = rawRole === "lister" ? "lister" : "seeker";
    await supabase.from("profiles").upsert({
      id: signedInUser.id,
      full_name: (metadata.full_name as string | undefined) ?? fullName,
      company: (metadata.company as string | undefined) ?? company,
      location: (metadata.location as string | undefined) ?? location,
    });
    await supabase.from("user_roles").insert({ user_id: signedInUser.id, role: requestedRole });
  };

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.user) await ensureProfileAndRole(data.user);
    toast.success("Welcome back!");
    navigate("/");
  };

  const handleForgotPassword = async () => {
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) {
      toast.error("Enter your email above first, then click Forgot password.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset email sent. Check your inbox.");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({ email, password, fullName, company, location, role });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: parsed.data.fullName,
          company: parsed.data.company ?? "",
          location: parsed.data.location ?? "",
          role: parsed.data.role,
        },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.user && data.session) await ensureProfileAndRole(data.user);
    toast.success("Account created! Check your email to confirm.");
    setTab("signin");
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 gradient-eco rounded-lg flex items-center justify-center shadow-eco">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground">
            Eco<span className="text-gradient-eco">Link</span>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-2xl shadow-card p-8">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-password">Password</Label>
                  <div className="relative">
                    <Input id="si-password" type={showSignInPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                    <button type="button" onClick={() => setShowSignInPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" variant="eco" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sign In
                </Button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-muted-foreground hover:text-foreground underline w-full text-center"
                >
                  Forgot password?
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-password">Password</Label>
                  <div className="relative">
                    <Input id="su-password" type={showSignUpPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                    <button type="button" onClick={() => setShowSignUpPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="su-company">Company</Label>
                    <Input id="su-company" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-location">Location</Label>
                    <Input id="su-location" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>I am a</Label>
                  <RadioGroup value={role} onValueChange={(v) => setRole(v as "lister" | "seeker")} className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="lister" id="r-lister" />
                      <span className="text-sm font-medium">Lister</span>
                    </label>
                    <label className="flex items-center gap-2 border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="seeker" id="r-seeker" />
                      <span className="text-sm font-medium">Seeker</span>
                    </label>
                  </RadioGroup>
                </div>
                <Button type="submit" variant="eco" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogle}>
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;