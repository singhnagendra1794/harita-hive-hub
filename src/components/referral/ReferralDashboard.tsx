
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Mail, Share2, Gift, Users, Award } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';

export const ReferralDashboard: React.FC = () => {
  const { referrals, userReferralCode, stats, loading, shareReferral } = useReferrals();
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);

  const handleShare = async (method: 'copy' | 'email' | 'social') => {
    try {
      if (method === 'copy') {
        setCopying(true);
      }
      await shareReferral(method);
      
      if (method === 'copy') {
        toast({
          title: 'Copied!',
          description: 'Referral link copied to clipboard',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to share referral link',
        variant: 'destructive',
      });
    } finally {
      if (method === 'copy') {
        setCopying(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold">{stats.completedReferrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Rewards</p>
                <p className="text-2xl font-bold">{stats.pendingRewards}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm">
              {`${window.location.origin}?ref=${userReferralCode}`}
            </code>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleShare('copy')}
              disabled={copying}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {copying ? 'Copying...' : 'Copy'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleShare('email')}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleShare('social')}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No referrals yet</h3>
              <p className="text-muted-foreground">
                Share your referral link to start earning rewards!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Code: {referral.referral_code}</p>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                    {referral.completed_at && (
                      <p className="text-sm text-green-600">
                        Completed {new Date(referral.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        referral.status === 'completed' ? 'default' :
                        referral.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {referral.status}
                    </Badge>
                    {referral.reward_granted && (
                      <Badge variant="outline" className="text-green-600">
                        Rewarded
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
