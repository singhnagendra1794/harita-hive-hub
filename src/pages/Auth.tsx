import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneSignIn, setPhoneSignIn] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setDebugInfo("Starting signup process...");

    try {
      console.log('Attempting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          }
        }
      });

      setDebugInfo(`Signup response received. User: ${data.user?.id}, Session: ${data.session?.access_token ? 'Yes' : 'No'}`);

      if (error) {
        console.error('Signup error:', error);
        setDebugInfo(`Error: ${error.message}`);
        throw error;
      }

      console.log('Signup response:', data);

      if (data.user && !data.user.email_confirmed_at) {
        setVerificationStep(true);
        setDebugInfo("Email confirmation required. Check your email.");
        toast({
          title: "Check your email!",
          description: "We've sent you a confirmation link. Please check your email and click the link to complete your registration.",
        });
      } else if (data.user && data.user.email_confirmed_at) {
        setDebugInfo("User confirmed, redirecting...");
        toast({
          title: "Success!",
          description: "Account created successfully! Redirecting...",
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else if (data.user) {
        // Handle case where user exists but confirmation status is unclear
        setDebugInfo("User created but confirmation status unclear. Check email or try signing in.");
        toast({
          title: "Account created",
          description: "Please check your email for confirmation or try signing in if you've already confirmed.",
        });
      }
    } catch (error: any) {
      console.error('Signup error details:', error);
      let errorMessage = "An unexpected error occurred.";
      
      if (error.message) {
        if (error.message.includes("already registered")) {
          errorMessage = "This email is already registered. Please try signing in instead.";
        } else if (error.message.includes("invalid email")) {
          errorMessage = "Please enter a valid email address.";
        } else if (error.message.includes("Email rate limit exceeded")) {
          errorMessage = "Too many emails sent. Please wait a few minutes before trying again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setDebugInfo(`Error: ${errorMessage}`);
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setDebugInfo("Attempting to sign in...");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Signin error:', error);
        setDebugInfo(`Sign in error: ${error.message}`);
        throw error;
      }

      setDebugInfo("Sign in successful, redirecting...");
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error: any) {
      console.error('Signin error details:', error);
      let errorMessage = "Sign in failed.";
      
      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email and confirm your account before signing in.";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many sign in attempts. Please wait a few minutes before trying again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setDebugInfo(`Sign in error: ${errorMessage}`);
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailOtpSent && !email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (emailOtpSent && !otp) {
      toast({
        title: "Error",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!emailOtpSent) {
        // Send OTP to email
        const { error } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (error) throw error;

        setEmailOtpSent(true);
        toast({
          title: "OTP Sent!",
          description: "Please check your email for the verification code.",
        });
      } else {
        // Verify OTP
        const { error } = await supabase.auth.verifyOtp({
          email: email,
          token: otp,
          type: 'email'
        });

        if (error) throw error;

        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (error: any) {
      console.error('Email OTP error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process email OTP.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneSignIn && !phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    if (phoneSignIn && !otp) {
      toast({
        title: "Error",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!phoneSignIn) {
        // Send OTP
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone,
        });

        if (error) throw error;

        setPhoneSignIn(true);
        toast({
          title: "OTP Sent!",
          description: "Please check your phone for the verification code.",
        });
      } else {
        // Verify OTP
        const { error } = await supabase.auth.verifyOtp({
          phone: phone,
          token: otp,
          type: 'sms'
        });

        if (error) throw error;

        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (error: any) {
      console.error('Phone signin error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process phone authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook' | 'linkedin_oidc') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Social signin error:', error);
      toast({
        title: "Error",
        description: error.message || "Social sign in failed.",
        variant: "destructive",
      });
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: "We've sent you another confirmation email.",
      });
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend confirmation email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verificationStep) {
    return (
      <Layout>
        <div className="container max-w-md py-12">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                We've sent a confirmation link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Click the link in your email to complete your registration. 
                The link will expire in 24 hours.
              </p>
              
              {debugInfo && (
                <div className="p-3 bg-muted rounded text-xs">
                  <strong>Debug Info:</strong> {debugInfo}
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleResendConfirmation}
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend confirmation email"}
              </Button>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setVerificationStep(false)}
              >
                Back to sign up
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-md py-12">
        {debugInfo && (
          <div className="mb-4 p-3 bg-muted rounded text-sm">
            <strong>Status:</strong> {debugInfo}
          </div>
        )}
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="email-otp">Email OTP</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>
                  Sign in to your HaritaHive account
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <form onSubmit={handleSignIn}>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        placeholder="name@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button className="mt-4" type="submit" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </div>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Button variant="outline" onClick={() => handleSocialSignIn('google')} className="w-full" disabled={loading}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Create account</CardTitle>
                <CardDescription>
                  Join the HaritaHive community
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <form onSubmit={handleSignUp}>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        placeholder="name@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 6 characters
                      </p>
                    </div>
                    <Button className="mt-4" type="submit" disabled={loading}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Button variant="outline" onClick={() => handleSocialSignIn('google')} className="w-full" disabled={loading}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email-otp">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Email OTP Login</CardTitle>
                <CardDescription>
                  Sign in using a one-time code sent to your email
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <form onSubmit={handleEmailOTP}>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="email-otp">Email</Label>
                      <Input
                        id="email-otp"
                        placeholder="name@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={emailOtpSent || loading}
                        required
                      />
                    </div>
                    
                    {emailOtpSent && (
                      <div className="grid gap-1">
                        <Label htmlFor="otp-code">Verification Code</Label>
                        <InputOTP
                          value={otp}
                          onChange={(value) => setOtp(value)}
                          maxLength={6}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    )}
                    
                    <Button className="mt-4" type="submit" disabled={loading}>
                      {loading 
                        ? "Processing..." 
                        : emailOtpSent 
                          ? "Verify Code" 
                          : "Send Verification Code"
                      }
                    </Button>
                    
                    {emailOtpSent && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEmailOtpSent(false);
                          setOtp("");
                        }}
                        disabled={loading}
                      >
                        Change Email
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phone">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Phone Authentication</CardTitle>
                <CardDescription>
                  Sign in using your mobile number
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <form onSubmit={handlePhoneSignIn}>
                  <div className="grid gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+1234567890"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={phoneSignIn || loading}
                        required
                      />
                    </div>
                    
                    {phoneSignIn && (
                      <div className="grid gap-1">
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input
                          id="otp"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                          disabled={loading}
                          required
                        />
                      </div>
                    )}
                    
                    <Button className="mt-4" type="submit" disabled={loading}>
                      {loading 
                        ? "Processing..." 
                        : phoneSignIn 
                          ? "Verify Code" 
                          : "Send Verification Code"
                      }
                    </Button>
                    
                    {phoneSignIn && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setPhoneSignIn(false);
                          setOtp("");
                        }}
                        disabled={loading}
                      >
                        Change Phone Number
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
