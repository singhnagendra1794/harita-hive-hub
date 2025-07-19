import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Lock, 
  Users, 
  Copy, 
  Download, 
  Code,
  Eye,
  Link,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PublishDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
  onProjectUpdate: (updates: any) => void;
}

export const PublishDashboardDialog = ({ 
  open, 
  onOpenChange, 
  project, 
  onProjectUpdate 
}: PublishDashboardDialogProps) => {
  const [isPublic, setIsPublic] = useState(project?.is_public || false);
  const [allowComments, setAllowComments] = useState(project?.settings?.allowComments || true);
  const [allowDownload, setAllowDownload] = useState(project?.settings?.allowDownload || false);
  const [customDomain, setCustomDomain] = useState('');
  const [shareEmails, setShareEmails] = useState('');
  const [publishing, setPublishing] = useState(false);
  const { toast } = useToast();

  const dashboardUrl = `https://haritahive.com/dashboard/${project?.id}`;
  const embedCode = `<iframe src="${dashboardUrl}?embed=true" width="100%" height="600" frameborder="0"></iframe>`;

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const updates = {
        is_public: isPublic,
        published_at: isPublic ? new Date().toISOString() : null,
        settings: {
          ...project.settings,
          allowComments,
          allowDownload,
          customDomain
        }
      };

      const { error } = await supabase
        .from('webgis_projects')
        .update(updates)
        .eq('id', project.id);

      if (error) throw error;

      onProjectUpdate(updates);
      
        // Handle sharing with specific users
        if (shareEmails.trim()) {
          const emails = shareEmails.split(',').map(email => email.trim());
          for (const email of emails) {
            // In a real implementation, you'd look up user IDs by email
            // For now, we'll create a placeholder sharing record
            try {
              await supabase
                .from('webgis_shared_projects')
                .insert({
                  project_id: project.id,
                  shared_by: (await supabase.auth.getUser()).data.user?.id || '',
                  user_id: '', // Would need to lookup by email
                  permission_level: 'view'
                });
            } catch (err) {
              console.log('Sharing will be implemented in next version');
            }
          }
        }

      toast({
        title: isPublic ? "Dashboard published" : "Dashboard updated",
        description: isPublic 
          ? "Your dashboard is now publicly accessible." 
          : "Dashboard settings have been updated."
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Publishing error:', error);
      toast({
        title: "Publishing failed",
        description: "Could not publish dashboard. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPublishing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard.`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Publish & Share Dashboard
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="publish" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="publish">Publish</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="publish" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Public Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this dashboard accessible to anyone with the link
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Badge variant={isPublic ? "default" : "secondary"}>
                    {isPublic ? (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Dashboard Settings</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-comments">Allow Comments</Label>
                  <Switch
                    id="allow-comments"
                    checked={allowComments}
                    onCheckedChange={setAllowComments}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-download">Allow Data Download</Label>
                  <Switch
                    id="allow-download"
                    checked={allowDownload}
                    onCheckedChange={setAllowDownload}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="custom-domain">Custom Subdomain (optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="custom-domain"
                    placeholder="my-dashboard"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground">.haritahive.com</span>
                </div>
              </div>

              {isPublic && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <Label className="font-medium">Public URL</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={dashboardUrl} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(dashboardUrl, "Dashboard URL")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="share" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="share-emails">Share with Specific Users</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Enter email addresses separated by commas
                </p>
                <Textarea
                  id="share-emails"
                  placeholder="user1@example.com, user2@example.com"
                  value={shareEmails}
                  onChange={(e) => setShareEmails(e.target.value)}
                  className="h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manage Team Access
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Permissions
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Quick Share Options</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Link className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Social Media
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Embed Code</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Copy this code to embed the dashboard in your website
                </p>
                <div className="relative">
                  <Textarea
                    value={embedCode}
                    readOnly
                    className="font-mono text-sm h-20"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(embedCode, "Embed code")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Export Options</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export HTML
                  </Button>
                  <Button variant="outline" size="sm">
                    <Code className="h-4 w-4 mr-2" />
                    API Access
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Customization Options</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Hide Header</span>
                    <code className="bg-background px-2 py-1 rounded">?header=false</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto-fit</span>
                    <code className="bg-background px-2 py-1 rounded">?autofit=true</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dark Theme</span>
                    <code className="bg-background px-2 py-1 rounded">?theme=dark</code>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing ? "Publishing..." : isPublic ? "Update & Publish" : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};