import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Eye } from 'lucide-react';

interface PaymentProof {
  id: string;
  user_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  proof_image_url: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export const PaymentApprovalDashboard: React.FC = () => {
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentProofs();
  }, []);

  const fetchPaymentProofs = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_proofs')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentProofs((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching payment proofs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment proofs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (proofId: string, status: 'approved' | 'rejected', notes: string) => {
    setProcessingId(proofId);
    try {
      // Update payment proof status
      const { error: updateError } = await supabase
        .from('payment_proofs')
        .update({
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', proofId);

      if (updateError) throw updateError;

      // If approved, update user subscription
      if (status === 'approved') {
        const proof = paymentProofs.find(p => p.id === proofId);
        if (proof) {
          let subscriptionTier = 'free';
          if (proof.plan_name.includes('Professional')) {
            subscriptionTier = 'pro';
          } else if (proof.plan_name.includes('Enterprise')) {
            subscriptionTier = 'enterprise';
          }

          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: proof.user_id,
              subscription_tier: subscriptionTier,
              status: 'active',
              started_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            });

          if (subscriptionError) throw subscriptionError;
        }
      }

      toast({
        title: "Success",
        description: `Payment ${status} successfully`,
      });

      // Refresh the list
      await fetchPaymentProofs();
      setSelectedProof(null);
      setAdminNotes('');
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading payment proofs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payment Approval Dashboard</h2>
        <p className="text-muted-foreground">Review and approve payment proofs from users</p>
      </div>

      <div className="grid gap-4">
        {paymentProofs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No payment proofs found</p>
            </CardContent>
          </Card>
        ) : (
          paymentProofs.map((proof) => (
            <Card key={proof.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{proof.plan_name}</CardTitle>
                    <CardDescription>
                      {proof.profiles?.full_name || 'Unknown User'} • {new Date(proof.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(proof.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProof(proof)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Amount</p>
                    <p className="text-lg font-bold">
                      {proof.currency === 'INR' ? '₹' : '$'}{proof.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <p className="capitalize">{proof.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    {getStatusBadge(proof.status)}
                  </div>
                </div>

                {proof.status === 'pending' && (
                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => updatePaymentStatus(proof.id, 'approved', 'Payment approved by admin')}
                      disabled={processingId === proof.id}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProof(proof);
                        setAdminNotes('');
                      }}
                      disabled={processingId === proof.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}

                {proof.admin_notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Admin Notes:</p>
                    <p className="text-sm">{proof.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Payment Proof Details</CardTitle>
              <CardDescription>{selectedProof.plan_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment proof image */}
              <div>
                <Label>Payment Proof</Label>
                <img
                  src={selectedProof.proof_image_url}
                  alt="Payment proof"
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
              </div>

              {/* Payment details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <p className="font-semibold">
                    {selectedProof.currency === 'INR' ? '₹' : '$'}{selectedProof.amount}
                  </p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="capitalize">{selectedProof.payment_method}</p>
                </div>
              </div>

              {selectedProof.status === 'pending' && (
                <>
                  <div>
                    <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                    <Textarea
                      id="admin-notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this payment..."
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => updatePaymentStatus(selectedProof.id, 'approved', adminNotes || 'Payment approved by admin')}
                      disabled={processingId === selectedProof.id}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve Payment
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updatePaymentStatus(selectedProof.id, 'rejected', adminNotes || 'Payment rejected by admin')}
                      disabled={processingId === selectedProof.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject Payment
                    </Button>
                  </div>
                </>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedProof(null);
                  setAdminNotes('');
                }}
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};