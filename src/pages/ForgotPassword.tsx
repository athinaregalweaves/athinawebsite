import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "@/lib/customerApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowLeft, KeyRound } from "lucide-react";

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast({ title: "OTP Sent", description: "If this email exists, an OTP has been sent" });
      setStep("reset");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      toast({ title: "Password Reset!", description: "You can now sign in with your new password" });
      navigate("/login", { replace: true });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={28} className="text-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold text-primary">
            {step === "email" ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            {step === "email" ? "Enter your email to receive a reset code" : `Enter the OTP sent to ${email}`}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOTP} className="bg-card border border-border p-8 space-y-6">
            <div className="space-y-2">
              <label className="font-body text-sm font-bold text-muted-foreground block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background border-border h-12" placeholder="your@email.com" required />
              </div>
            </div>
            <Button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-[0.15em] font-bold h-12">
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="bg-card border border-border p-8 space-y-5">
            <div className="space-y-2">
              <label className="font-body text-sm font-bold text-muted-foreground block">OTP Code</label>
              <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-[0.5em] font-bold bg-background border-border h-14"
                placeholder="000000" maxLength={6} required />
            </div>
            <div className="space-y-2">
              <label className="font-body text-sm font-bold text-muted-foreground block">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 bg-background border-border h-12" placeholder="Min. 6 characters" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-body text-sm font-bold text-muted-foreground block">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-background border-border h-12" placeholder="Repeat password" required />
              </div>
            </div>
            <Button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-[0.15em] font-bold h-12">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
