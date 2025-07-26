import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import BulkUserCreator from '@/components/admin/BulkUserCreator';

const TestSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('test@123Test');
  const [fullName, setFullName] = useState('Test User');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    try {
      console.log('🚀 Testing signup with:', { email, password, fullName });
      
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName.trim(),
            location_country: 'Test Country',
            location_city: 'Test City'
          }
        }
      });
      
      console.log('📝 Signup result:', result);
      
      if (result.error) {
        console.error('❌ Signup error:', result.error);
        toast({
          title: "Signup Failed",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Signup successful!', result.data);
        toast({
          title: "Signup Successful!",
          description: `User created: ${result.data.user?.email}`,
        });
      }
    } catch (error) {
      console.error('💥 Signup exception:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during signup",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Test Signup</h1>
      
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <Button 
          onClick={handleSignup} 
          disabled={loading || !email || !password || !fullName}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test Signup'}
        </Button>
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          This page tests the signup functionality. Check the console for detailed logs.
        </p>
      </div>
      
      <div className="mt-8 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Bulk Professional User Creation</h2>
        <BulkUserCreator />
      </div>
    </div>
  );
};

export default TestSignup;