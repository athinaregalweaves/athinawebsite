import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { loginCustomer, saveCustomerSession } from "@/lib/customerApi";

const DEMO_LOGIN_ENABLED = import.meta.env.DEV;
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, ArrowLeft, Package } from "lucide-react";

const CustomerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (DEMO_LOGIN_ENABLED && email === "customer@gmail.com" && password === "cust123") {
        const demoUser = {
          id: 0, name: "Demo Customer", email: "customer@gmail.com",
          phone: "+91 9876543210", address: "", city: "", state: "", pincode: "", is_verified: true,
        };
        saveCustomerSession("demo-token-local", demoUser);
        toast({
          title: "Welcome!",
          description:
            "Local dev demo only — not available in production. Create a real account on the live site.",
        });
        navigate(redirectTo, { replace: true });
        return;
      }

      const result = await loginCustomer(email, password);
      if ("needsVerification" in result) {
        toast({ title: "Verify Email", description: "Please verify your email with OTP" });
        navigate("/verify-otp", { state: { email: result.email } });
        return;
      }
      saveCustomerSession(result.token, result.user);
      toast({ title: "Welcome back!", description: `Logged in as ${result.user.name}` });
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  const fillDemo = () => {
    if (!DEMO_LOGIN_ENABLED) return;
    setEmail("customer@gmail.com");
    setPassword("cust123");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-[3px] h-8 bg-accent" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl tracking-[0.25em] font-bold text-foreground">ATHINA</span>
              <span className="font-body text-[9px] tracking-[0.4em] uppercase text-accent font-semibold mt-1">Regal Weaves</span>
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-primary mt-4">
            {redirectTo === "/checkout" ? "Sign In to Complete Your Order" : "Sign In"}
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            {redirectTo === "/checkout"
              ? "You're just one step away from your beautiful saree"
              : "Welcome back to your account"}
          </p>
          <Link
            to="/track-order"
            className="mt-6 inline-flex items-center justify-center gap-2 w-full max-w-sm mx-auto py-3 px-4 rounded-md border border-gold/40 bg-charcoal/5 hover:bg-gold/10 text-gold font-body text-xs font-bold uppercase tracking-[0.15em] transition-colors"
          >
            <Package size={18} className="shrink-0" />
            Track your order
          </Link>
        </div>

        <form onSubmit={handleLogin} className="bg-card border border-border p-8 space-y-6">
          <div className="space-y-2">
            <label className="font-body text-sm font-bold text-muted-foreground block">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
              <Input type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/30 h-12"
                placeholder="your@email.com" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-body text-sm font-bold text-muted-foreground block">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
              <Input type="password" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/30 h-12"
                placeholder="Enter your password" required />
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="font-body text-xs text-accent hover:text-accent/80 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-[0.15em] font-bold h-12">
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {DEMO_LOGIN_ENABLED ? (
            <button type="button" onClick={fillDemo}
              className="w-full font-body text-xs text-accent hover:text-accent/80 transition-colors underline">
              Use demo account (dev only)
            </button>
          ) : null}

          <p className="text-center font-body text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to={`/register${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="text-primary font-bold hover:text-primary/80 transition-colors">Create Account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CustomerLogin;
