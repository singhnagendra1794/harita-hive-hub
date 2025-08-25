import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";

const ResetPassword: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

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

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    checkSession();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Use at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please re-enter the same password.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: "Password updated", description: "Please sign in with your new password." });

      // Clean up and redirect to login
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch {}
      navigate("/login", { replace: true });
    } catch (err: any) {
      toast({
        title: "Could not update password",
        description: err?.message || "Try again or request a new reset link.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container max-w-md py-12 mx-auto">
      <SEOHead
        title="Set New Password | Harita Hive"
        description="Securely set a new password for your Harita Hive account."
        url={`${window.location.origin}/reset-password`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>
            {hasSession === false
              ? "We couldn't detect an active reset session. Request a new link or OTP."
              : "Create a strong password to secure your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Updating..." : "Update password"}
            </Button>

            <div className="pt-2 text-sm">
              <Link to="/forgot-password" className="underline">Need a new link or OTP?</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default ResetPassword;
