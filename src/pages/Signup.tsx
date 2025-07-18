
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from '../components/Layout';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MultiAuthForm } from "@/components/auth/MultiAuthForm";

const Signup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <Layout>
      <div className="container max-w-md py-12">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
        <p className="text-muted-foreground">
          Choose your preferred sign up method
        </p>
      </div>
      <MultiAuthForm mode="signup" onToggleMode={() => navigate('/login')} />
      </div>
    </Layout>
  );
};

export default Signup;
