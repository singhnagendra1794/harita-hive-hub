import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Upload, 
  File, 
  X, 
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";

interface FileUploaderProps {
  onFilesUploaded: (files: any[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  bucket: string;
}

const FileUploader = ({ 
  onFilesUploaded, 
  acceptedTypes = [], 
  maxFiles = 5,
  bucket
}: FileUploaderProps) => {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    // Check file type if acceptedTypes is provided
    if (acceptedTypes.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        return `File type ${fileExtension} not supported. Accepted types: ${acceptedTypes.join(', ')}`;
      }
    }

    // Check file size (max 1GB for now)
    const maxSize = 1024 * 1024 * 1024; // 1GB
    if (file.size > maxSize) {
      return `File size exceeds 1GB limit. Current size: ${formatFileSize(file.size)}`;
    }

    return null;
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Check max files limit
    if (uploadedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const newUploadedFiles: any[] = [];

    for (const file of files) {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        toast({
          title: "Invalid File",
          description: validationError,
          variant: "destructive",
        });
        continue;
      }

      try {
        // Create unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        // Simulate progress for now (Supabase doesn't support upload progress in current version)
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        const uploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          path: fileName,
          url: publicUrl,
          uploaded_at: new Date().toISOString()
        };

        newUploadedFiles.push(uploadedFile);

      } catch (error: any) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }

    const updatedFiles = [...uploadedFiles, ...newUploadedFiles];
    setUploadedFiles(updatedFiles);
    onFilesUploaded(updatedFiles);
    setUploading(false);
    setUploadProgress({});

    // Clear input
    event.target.value = '';
  }, [uploadedFiles, maxFiles, bucket, user?.id, onFilesUploaded]);

  const removeFile = async (index: number) => {
    const fileToRemove = uploadedFiles[index];
    
    try {
      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileToRemove.path]);

      if (error) throw error;

      const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(updatedFiles);
      onFilesUploaded(updatedFiles);

    } catch (error: any) {
      console.error('Error removing file:', error);
      toast({
        title: "Remove Failed",
        description: `Failed to remove ${fileToRemove.name}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="mb-4">
              <h3 className="text-lg font-medium">Upload Files</h3>
              <p className="text-sm text-muted-foreground">
                Select up to {maxFiles} files to upload
              </p>
              {acceptedTypes.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: {acceptedTypes.join(', ')}
                </p>
              )}
            </div>
            
            <div className="relative">
              <input
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleFileSelect}
                disabled={uploading || uploadedFiles.length >= maxFiles}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button 
                disabled={uploading || uploadedFiles.length >= maxFiles}
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Choose Files"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="truncate">{fileName}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({uploadedFiles.length}/{maxFiles})</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Usage Info */}
      <div className="text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>Files are processed in the cloud and deleted after 7 days</span>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;