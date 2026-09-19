import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { verifyOTP, resendOTP, saveCustomerSession } from "@/lib/customerApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, ArrowLeft } from "lucide-react";

const VerifyOTP = () => {
  const location = useLocation();
  const email = (location.state as any)?.email || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!email) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
        <div className="text-center">
          <p className="font-body text-muted-foreground mb-4">No email provided for verification.</p>
          <Link to="/register" className="text-primary font-body font-bold">Go to Registration</Link>
        </div>
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await verifyOTP(email, otp);
      saveCustomerSession(result.token, result.user);
      toast({ title: "Email Verified!", description: "Welcome to Athina Regal Weaves" });
      navigate("/", { replace: true });
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOTP(email);
      toast({ title: "OTP Resent", description: "Check your email for the new code" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} className="text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-primary">Verify Your Email</h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            We sent a 6-digit code to <span className="font-bold text-foreground">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="bg-card border border-border p-8 space-y-6">
          <div className="space-y-2">
            <label className="font-body text-sm font-bold text-muted-foreground block">Enter OTP Code</label>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-[0.5em] font-bold bg-background border-border h-14"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <Button type="submit" disabled={loading || otp.length !== 6}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-sm uppercase tracking-[0.15em] font-bold h-12">
            {loading ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center">
            <p className="font-body text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
            <button type="button" onClick={handleResend} disabled={resending}
              className="font-body text-sm font-bold text-accent hover:text-accent/80 transition-colors disabled:opacity-50">
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
