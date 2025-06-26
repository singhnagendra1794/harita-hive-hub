
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ShareOptions {
  title: string;
  description?: string;
  hashtags?: string[];
}

export const useContentSharing = () => {
  const [sharing, setSharing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const shareContent = async (
    contentType: string,
    contentId: string,
    platform: 'linkedin' | 'twitter' | 'email' | 'copy_link',
    options: ShareOptions
  ) => {
    if (!user) return;

    setSharing(true);
    try {
      const currentUrl = window.location.href;
      const shareData = {
        title: options.title,
        description: options.description || '',
        hashtags: options.hashtags || [],
        url: currentUrl
      };

      // Record the share in the database
      await supabase
        .from('content_shares')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          share_platform: platform,
          share_data: shareData as any
        });

      // Handle different sharing platforms
      switch (platform) {
        case 'copy_link':
          await navigator.clipboard.writeText(currentUrl);
          toast({
            title: "Link copied!",
            description: "The link has been copied to your clipboard.",
          });
          break;

        case 'linkedin':
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
          window.open(linkedinUrl, '_blank', 'width=600,height=400');
          break;

        case 'twitter':
          const hashtags = options.hashtags?.join(',') || '';
          const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(options.title)}&hashtags=${hashtags}`;
          window.open(twitterUrl, '_blank', 'width=600,height=400');
          break;

        case 'email':
          const subject = encodeURIComponent(options.title);
          const body = encodeURIComponent(`${options.description}\n\n${currentUrl}`);
          window.location.href = `mailto:?subject=${subject}&body=${body}`;
          break;
      }

      toast({
        title: "Content shared!",
        description: `Successfully shared on ${platform}.`,
      });

    } catch (error) {
      console.error('Error sharing content:', error);
      toast({
        title: "Error",
        description: "Failed to share content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  return {
    shareContent,
    sharing
  };
};
