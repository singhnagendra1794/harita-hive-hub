
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type SharePlatform = 'linkedin' | 'twitter' | 'email' | 'copy_link';

interface ShareData {
  title?: string;
  description?: string;
  url?: string;
  hashtags?: string[];
}

export const useContentSharing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sharing, setSharing] = useState(false);

  const trackShare = async (contentType: string, contentId: string, platform: SharePlatform, shareData: ShareData) => {
    if (!user) return;

    try {
      await supabase
        .from('content_shares')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          share_platform: platform,
          share_data: shareData
        });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const shareContent = async (
    contentType: string,
    contentId: string,
    platform: SharePlatform,
    shareData: ShareData
  ) => {
    setSharing(true);
    
    try {
      const baseUrl = window.location.origin;
      const shareUrl = shareData.url || `${baseUrl}/${contentType}/${contentId}`;
      
      switch (platform) {
        case 'linkedin':
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
          window.open(linkedinUrl, '_blank', 'width=600,height=400');
          break;
          
        case 'twitter':
          const tweetText = `${shareData.title}\n\n${shareData.description || ''}\n\n${shareData.hashtags?.map(tag => `#${tag}`).join(' ') || ''}`;
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
          window.open(twitterUrl, '_blank', 'width=600,height=400');
          break;
          
        case 'email':
          const emailSubject = shareData.title || 'Check this out';
          const emailBody = `${shareData.description || ''}\n\n${shareUrl}`;
          window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
          break;
          
        case 'copy_link':
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: 'Link Copied!',
            description: 'The link has been copied to your clipboard.',
          });
          break;
      }

      await trackShare(contentType, contentId, platform, { ...shareData, url: shareUrl });
      
      if (platform !== 'copy_link') {
        toast({
          title: 'Content Shared!',
          description: `Shared on ${platform} successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Share Error',
        description: 'Failed to share content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSharing(false);
    }
  };

  const generateShareUrl = (contentType: string, contentId: string, referralCode?: string) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${contentType}/${contentId}`;
    return referralCode ? `${url}?ref=${referralCode}` : url;
  };

  return {
    shareContent,
    generateShareUrl,
    sharing
  };
};
