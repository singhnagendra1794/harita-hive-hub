import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { useSuperAdminDelete } from '@/hooks/useSuperAdminDelete';

interface AdminDeleteButtonProps {
  itemId: string;
  itemTitle: string;
  table: string;
  fileUrl?: string;
  storageBucket?: string;
  storageFileName?: string;
  cascadeDeletes?: Array<{
    table: string;
    foreignKey: string;
  }>;
  onDeleteSuccess?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const AdminDeleteButton: React.FC<AdminDeleteButtonProps> = ({
  itemId,
  itemTitle,
  table,
  fileUrl,
  storageBucket,
  storageFileName,
  cascadeDeletes,
  onDeleteSuccess,
  variant = 'destructive',
  size = 'icon',
  className = ''
}) => {
  const { isSuperAdmin, isDeleting, deleteItem } = useSuperAdminDelete();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if not super admin
  if (!isSuperAdmin) {
    return null;
  }

  const handleDelete = async () => {
    const success = await deleteItem({
      table,
      id: itemId,
      fileUrl,
      storageBucket,
      storageFileName,
      cascadeDeletes
    });

    if (success) {
      setIsOpen(false);
      onDeleteSuccess?.();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`hover:bg-destructive hover:text-destructive-foreground ${className}`}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {size !== 'icon' && (
            <span className="ml-1">Delete</span>
          )}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              <strong>Item:</strong> {itemTitle}
            </p>
            <p className="text-destructive font-medium">
              This will permanently remove it from all users and cannot be undone.
            </p>
            {fileUrl && (
              <p className="text-sm text-muted-foreground">
                Associated files will also be removed from storage.
              </p>
            )}
            {cascadeDeletes && cascadeDeletes.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Related data will be automatically cleaned up.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Permanently'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};