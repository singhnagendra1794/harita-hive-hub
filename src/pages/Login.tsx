import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MultiAuthForm } from "../components/auth/MultiAuthForm";

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="container max-w-md py-12">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Choose Sign In Method</h1>
        <p className="text-muted-foreground">
          We now support multiple authentication options
        </p>
      </div>
      <MultiAuthForm mode="signin" onToggleMode={() => navigate('/signup')} />
      <div className="mt-4 text-center text-sm">
        <Link to="/forgot-password" className="underline">Forgot your password?</Link>
      </div>
    </div>
  );
};

export default Login;
