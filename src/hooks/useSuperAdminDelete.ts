import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DeleteOperation {
  table: string;
  id: string;
  fileUrl?: string;
  storageBucket?: string;
  storageFileName?: string;
  cascadeDeletes?: Array<{
    table: string;
    foreignKey: string;
  }>;
}

export const useSuperAdminDelete = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const isSuperAdmin = user?.email === 'contact@haritahive.com';

  const deleteItem = async (operation: DeleteOperation) => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admin can delete items",
        variant: "destructive"
      });
      return false;
    }

    setIsDeleting(true);
    
    try {
      // 1. Delete associated files from storage first
      if (operation.fileUrl && operation.storageBucket) {
        try {
          const fileName = operation.storageFileName || extractFileNameFromUrl(operation.fileUrl);
          if (fileName) {
            const { error: storageError } = await supabase.storage
              .from(operation.storageBucket)
              .remove([fileName]);
            
            if (storageError) {
              console.warn('Storage delete warning:', storageError);
              // Continue with database delete even if storage fails
            }
          }
        } catch (storageError) {
          console.warn('Storage cleanup failed:', storageError);
        }
      }

      // 2. Handle cascade deletes
      if (operation.cascadeDeletes) {
        for (const cascade of operation.cascadeDeletes) {
          const { error: cascadeError } = await (supabase as any)
            .from(cascade.table)
            .delete()
            .eq(cascade.foreignKey, operation.id);
          
          if (cascadeError) {
            console.warn(`Cascade delete warning for ${cascade.table}:`, cascadeError);
          }
        }
      }

      // 3. Delete main record
      const { error } = await (supabase as any)
        .from(operation.table)
        .delete()
        .eq('id', operation.id);

      if (error) throw error;

      toast({
        title: "✅ Deleted successfully",
        description: "Item removed from frontend & backend"
      });

      return true;
    } catch (error) {
      console.error('Delete operation failed:', error);
      toast({
        title: "❌ Failed to delete",
        description: "Check backend connection or permissions",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const extractFileNameFromUrl = (url: string): string | null => {
    try {
      // Extract filename from Supabase storage URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return fileName || null;
    } catch {
      return null;
    }
  };

  return {
    isSuperAdmin,
    isDeleting,
    deleteItem
  };
};