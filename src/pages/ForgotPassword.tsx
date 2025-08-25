import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";

const ForgotPassword: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loadingLink, setLoadingLink] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);

  const cleanupAuthState = () => {
    try {
      if (typeof localStorage !== "undefined") {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
            localStorage.removeItem(key);
          }
        });
      }
      if (typeof sessionStorage !== "undefined") {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch {}
  };

  const redirectUrl = `${window.location.origin}/reset-password`;

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoadingLink(true);
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: "global" });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) throw error;

      toast({
        title: "Reset link sent",
        description: "Check your email for the password reset link.",
      });
    } catch (err: any) {
      toast({
        title: "Could not send reset email",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingLink(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) return;
    setLoadingOtp(true);
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: "global" });

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: false,
        },
      });
      if (error) throw error;

      toast({
        title: "OTP sent",
        description: "We emailed you a login code. After logging in, set a new password.",
      });
    } catch (err: any) {
      toast({
        title: "Could not send OTP",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingOtp(false);
    }
  };

  return (
    <main className="container max-w-md py-12 mx-auto">
      <SEOHead
        title="Forgot Password | Harita Hive"
        description="Reset your Harita Hive account password via email link or OTP."
        url={`${window.location.origin}/forgot-password`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your account email. Choose a reset link or OTP login to set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendResetLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="submit" disabled={loadingLink}>
                {loadingLink ? "Sending..." : "Send reset link"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleSendOtp} disabled={loadingOtp}>
                {loadingOtp ? "Sending OTP..." : "Send OTP to email"}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              You will be redirected to set a new password after verifying.
            </p>

            <div className="pt-2 text-sm">
              <Link to="/login" className="underline">Back to login</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default ForgotPassword;
