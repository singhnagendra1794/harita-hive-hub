
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Phone, Github, AlertCircle } from 'lucide-react';
import { validateEmailComplete } from '@/utils/emailValidation';

interface MultiAuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

export const MultiAuthForm: React.FC<MultiAuthFormProps> = ({ mode, onToggleMode }) => {
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [activeTab, setActiveTab] = useState('email');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{country?: string; city?: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Detect user location on component mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try to get user's location using IP geolocation
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const locationData = await response.json();
          setUserLocation({
            country: locationData.country_name,
            city: locationData.city
          });
          console.log('User location detected:', locationData.country_name, locationData.city);
        }
      } catch (error) {
        console.log('Location detection failed, user can still use the app normally');
        setUserLocation({ country: 'Unknown', city: 'Unknown' });
      }
    };

    detectLocation();
  }, []);

  // Password validation
  const validatePassword = async (password: string) => {
    if (!password || password.length < 6) {
      setPasswordErrors([]);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('validate_password', { 
        password_input: password 
      });
      
      if (error) {
        console.error('Password validation error:', error);
        setPasswordErrors([]);
        return;
      }

      if (data && typeof data === 'object' && 'valid' in data) {
        const validationResult = data as { valid: boolean; errors?: string[] };
        if (!validationResult.valid) {
          setPasswordErrors(validationResult.errors || []);
        } else {
          setPasswordErrors([]);
        }
      } else {
        setPasswordErrors([]);
      }
    } catch (error) {
      console.error('Password validation failed:', error);
      setPasswordErrors([]);
    }
  };

  // Update password validation when password changes
  useEffect(() => {
    if (mode === 'signup' && password) {
      const timeoutId = setTimeout(() => validatePassword(password), 500);
      return () => clearTimeout(timeoutId);
    } else {
      setPasswordErrors([]);
    }
  }, [password, mode]);

  // Email validation
  useEffect(() => {
    if (email && mode === 'signup') {
      const validation = validateEmailComplete(email);
      if (!validation.isValid) {
        setEmailError(validation.error || '');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [email, mode]);

  // Handle post-auth success
  const handleAuthSuccess = (user: any, isSignup: boolean = false) => {
    toast({
      title: isSignup ? "Account Created!" : "Welcome Back!",
      description: isSignup ? "Please check your email to verify your account." : "You have successfully signed in.",
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === 'signup' && !fullName.trim()) return;
    if (mode === 'signup' && emailError) return;

    setLoading(true);
    try {
      let result;
      
      if (mode === 'signup') {
        // Clear any existing auth state first
        await supabase.auth.signOut({ scope: 'global' });
        
        // Get the current origin for redirect
        const redirectUrl = window.location.origin + '/dashboard';
        
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName.trim(),
              location_country: userLocation.country,
              location_city: userLocation.city
            }
          }
        });
        
        console.log('Signup attempt result:', result);
        console.log('Signup data:', result.data);
        console.log('Signup error:', result.error);
        
      } else {
        // Clear any existing auth state first for fresh login
        await supabase.auth.signOut({ scope: 'global' });
        
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        console.log('Signin attempt result:', result);
      }

      if (result.error) {
        console.error('Auth error details:', result.error);
        throw result.error;
      }

      if (result.data.user) {
        if (mode === 'signup') {
          // Send welcome email
          try {
            await supabase.functions.invoke('send-welcome-email', {
              body: {
                userId: result.data.user.id,
                email: result.data.user.email,
                fullName: fullName.trim()
              }
            });
          } catch (welcomeError) {
            console.error('Welcome email failed:', welcomeError);
          }

          // For signup, show email confirmation message
          toast({
            title: "Registration Successful!",
            description: "Welcome to Harita Hive! Please check your email for a confirmation link to complete your registration.",
          });
          
          // If user needs email confirmation, don't redirect yet
          if (!result.data.user.email_confirmed_at) {
            toast({
              title: "Email Verification Required",
              description: "Please check your email and click the verification link to activate your account.",
            });
          }
        } else {
          // For signin, handle success
          handleAuthSuccess(result.data.user, false);
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Provide specific error messaging based on error type
      let errorTitle = mode === 'signup' ? "Signup Failed" : "Login Failed";
      let errorDescription = error.message || "Please try again.";
      
      // Handle specific error cases for international users
      if (error.message?.includes('User already registered')) {
        errorTitle = "Account Already Exists";
        errorDescription = "This email is already registered. Please try logging in instead.";
      } else if (error.message?.includes('Invalid login credentials')) {
        errorTitle = "Invalid Credentials";
        errorDescription = "Please check your email and password and try again.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorTitle = "Email Not Verified";
        errorDescription = "Please check your email and click the verification link.";
      } else if (error.message?.includes('signup_disabled')) {
        errorTitle = "Registration Temporarily Unavailable";
        errorDescription = "New registrations are temporarily disabled. Please try again later or contact support.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorTitle = "Connection Issue";
        errorDescription = "Network connectivity issue detected. If you're outside India, please try again or contact support at contact@haritahive.com";
      } else if (error.message?.includes('rate_limit') || error.message?.includes('too_many_requests')) {
        errorTitle = "Too Many Attempts";
        errorDescription = "Please wait a few minutes before trying again.";
      } else if (error.message?.includes('captcha')) {
        errorTitle = "Security Check Required";
        errorDescription = "Please complete the security verification and try again.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    if (mode === 'signup' && !fullName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: mode === 'signup' ? {
          data: {
            full_name: fullName.trim()
          }
        } : undefined
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      console.error('Phone auth error:', error);
      
      let errorDescription = "Failed to send OTP. Please check your phone number.";
      
      if (error.message?.includes('SMTP') || error.message?.includes('email')) {
        errorDescription = "SMS/Email OTP is currently unavailable. Please try email/password login or contact support.";
      } else if (error.message?.includes('phone')) {
        errorDescription = "Please enter a valid phone number with country code (e.g., +1, +91).";
      }
      
      toast({
        title: "OTP Error",
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!phone || !otp) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      if (data.user) {
        handleAuthSuccess(data.user, false);
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github' | 'linkedin_oidc') => {
    setLoading(true);
    try {
      // Clear any existing auth state first
      await supabase.auth.signOut({ scope: 'global' });
      
      // Get current origin for redirect
      const redirectUrl = window.location.origin + '/dashboard';
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      
      // The redirect will handle the rest
    } catch (error: any) {
      console.error('Social auth error:', error);
      
      let errorDescription = `${provider} sign in failed. Please try again.`;
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorDescription = `Connection issue with ${provider}. If you're outside India, please try email/password or contact support.`;
      }
      
      toast({
        title: "Social Sign In Failed",
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</CardTitle>
        <CardDescription>
          {mode === 'signin' 
            ? 'Sign in to your account using your preferred method' 
            : 'Sign up using your preferred method'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={mode === 'signup' && emailError ? 'border-destructive' : ''}
                />
                {mode === 'signup' && emailError && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {emailError}
                  </div>
                )}
              </div>
                <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === 'signup' ? 8 : 6}
                  className={mode === 'signup' && passwordErrors.length > 0 ? 'border-destructive' : ''}
                />
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Password must contain at least 8 characters, including uppercase, lowercase, number, and special character
                    </p>
                    {passwordErrors.length > 0 && (
                      <div className="space-y-1">
                        {passwordErrors.map((error, index) => (
                          <p key={index} className="text-xs text-destructive flex items-center gap-1">
                            <span>•</span> {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || (mode === 'signup' && (passwordErrors.length > 0 || !!emailError))}
              >
                {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handlePhoneAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="phoneFullName">Full Name</Label>
                    <Input
                      id="phoneFullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +1 for USA, +91 for India, +44 for UK)
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Enter OTP</Label>
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
                <Button 
                  onClick={handleOtpVerification} 
                  className="w-full" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                  }} 
                  className="w-full"
                >
                  Back to Phone Input
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSocialAuth('google')}
            disabled={loading}
            className="w-full"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSocialAuth('github')}
            disabled={loading}
            className="w-full"
          >
            <Github className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSocialAuth('linkedin_oidc')}
            disabled={loading}
            className="w-full"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          </span>
          <Button variant="link" className="p-0" onClick={onToggleMode}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </Button>
        </div>

        {/* Help text for international users */}
        <div className="text-center text-xs text-muted-foreground border-t pt-4">
          <p>Having trouble signing up from outside India?</p>
          <p>Contact us at <strong>contact@haritahive.com</strong> for assistance.</p>
        </div>
      </CardContent>
    </Card>
  );
};
