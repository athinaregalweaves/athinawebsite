import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { registerCustomer } from "@/lib/customerApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, Phone, ArrowLeft } from "lucide-react";

const CustomerRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { toast } = useToast();

  // Pre-fill from saved checkout details
  const savedCheckout = (() => {
    try { return JSON.parse(localStorage.getItem("checkout_details") || "{}"); } catch { return {}; }
  })();

  const [name, setName] = useState(savedCheckout.name || "");
  const [email, setEmail] = useState(savedCheckout.email || "");
  const [phone, setPhone] = useState(savedCheckout.phone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await registerCustomer({ name, email, phone, password });
      toast({ title: "Registration Successful!", description: "Please check your email for OTP verification" });
      navigate("/verify-otp", { state: { email: result.email } });
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-20">
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
            {redirectTo === "/checkout" ? "Quick Sign Up to Place Order" : "Create Account"}
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            {redirectTo === "/checkout"
              ? "Just set a password — your details are already filled in"
              : "Join our community of saree connoisseurs"}
          </p>
        </div>

        <form onSubmit={handleRegister} className="bg-card border border-border p-8 space-y-5">
          <div className="space-y-2">
            <label className="font-body text-sm font-bold text-muted-foreground block">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-background border-border h-12" placeholder="Your full name" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-body text-sm font-bold text-muted-foreground block">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-background border-border h-12" placeholder="your@email.com" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-body text-sm font-bold text-muted-foreground block">Phone Number</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="pl-10 bg-background border-border h-12" placeholder="+91 98765 43210" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-body text-sm font-bold text-muted-foreground block">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-background border-border h-12" placeholder="Min. 6 characters" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-body text-sm font-bold text-muted-foreground block">Confirm Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 bg-background border-border h-12" placeholder="Repeat your password" required />
            </div>
          </div>

          <Button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-[0.15em] font-bold h-12">
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <p className="text-center font-body text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to={`/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="text-primary font-bold hover:text-primary/80 transition-colors">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default CustomerRegister;
