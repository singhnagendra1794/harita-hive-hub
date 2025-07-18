import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Shield, Download, IndianRupee, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface ToolPurchaseDialogProps {
  tool: {
    id: string;
    title: string;
    description: string;
    base_price_usd: number;
    base_price_inr: number;
    is_free: boolean;
    version: string;
    license_type: string;
    file_size_mb?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  userCountry: string;
}

const ToolPurchaseDialog: React.FC<ToolPurchaseDialogProps> = ({
  tool,
  isOpen,
  onClose,
  userCountry
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const isIndianUser = userCountry === 'IN';
  const price = isIndianUser ? tool.base_price_inr : tool.base_price_usd;
  const currency = isIndianUser ? 'INR' : 'USD';
  const currencySymbol = isIndianUser ? '₹' : '$';

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to purchase tools.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      // Create order
      const { data, error } = await supabase.functions.invoke('purchase-tool', {
        body: {
          toolId: tool.id,
          amount: price,
          currency: currency
        }
      });

      if (error) throw error;

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Configure Razorpay options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Harita Hive',
        description: `Purchase: ${tool.title}`,
        order_id: data.orderId,
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#6366f1'
        },
        handler: function (response: any) {
          toast({
            title: 'Payment Successful!',
            description: 'Your tool purchase is complete. You can now download it.',
          });
          onClose();
          
          // Trigger download after successful payment
          setTimeout(() => {
            window.location.href = `/download-tool/${tool.id}`;
          }, 1000);
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to initiate purchase. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase Tool
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tool Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{tool.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {tool.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span>Version: {tool.version}</span>
                <Badge variant="outline">{tool.license_type}</Badge>
              </div>
              
              {tool.file_size_mb && (
                <div className="text-sm text-muted-foreground mt-2">
                  Size: {tool.file_size_mb}MB
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Price:</span>
                <div className="flex items-center gap-1">
                  {isIndianUser ? <IndianRupee className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                  <span className="text-xl font-bold">{currencySymbol}{price}</span>
                </div>
              </div>
              
              {isIndianUser && (
                <div className="text-xs text-muted-foreground">
                  ≈ ${tool.base_price_usd} USD
                </div>
              )}
              
              <Separator className="my-3" />
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-600" />
                  <span>Instant download after payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>Secure payment via Razorpay</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>5 downloads allowed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Lifetime access</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Purchase for {currencySymbol}{price}
              </>
            )}
          </Button>

          <div className="text-xs text-center text-muted-foreground">
            Secure payment powered by Razorpay
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolPurchaseDialog;