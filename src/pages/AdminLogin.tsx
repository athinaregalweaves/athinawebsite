import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "@/lib/api";
import { setAdminSession } from "@/lib/authStorage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await loginAdmin(email, password);
      setAdminSession(token, user);
      setPassword("");
      toast({ title: "Welcome back!", description: `Logged in as ${user.name}` });
      navigate("/admin", { replace: true });
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-ivory-warm flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-maroon mb-3">Admin Dashboard</h1>
          <p className="font-body text-base text-foreground/60">Sign in to manage your website</p>
        </div>

        <form onSubmit={handleLogin} className="bg-background border border-border p-8 space-y-6 shadow-sm">
          <div className="space-y-2">
            <label className="font-body text-sm font-normal text-foreground/70 block">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon/40" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-ivory-warm border-border text-foreground text-base placeholder:text-foreground/30 focus-visible:ring-maroon/30 h-12"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-body text-sm font-normal text-foreground/70 block">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon/40" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-ivory-warm border-border text-foreground text-base placeholder:text-foreground/30 focus-visible:ring-maroon/30 h-12"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon hover:bg-maroon-light text-ivory font-body text-base uppercase tracking-[0.1em] font-normal py-6 h-14"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
