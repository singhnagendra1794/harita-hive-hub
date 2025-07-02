
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { VideoUpload } from './VideoUpload';
import { NotesEditor } from './NotesEditor';
import { EbookUpload } from './EbookUpload';
import { CodeSnippetEditor } from './CodeSnippetEditor';
import { PluginToolsUpload } from './PluginToolsUpload';
import { Upload, Save, Eye, FileVideo, FileText, BookOpen, Code, Plugin } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'notes' | 'ebook' | 'code' | 'plugin';
  status: 'draft' | 'published';
  tags: string[];
  course_id?: string;
  module_id?: string;
  created_at: string;
}

export const CreatorConsole = () => {
  const [activeTab, setActiveTab] = useState('videos');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const contentTypes = [
    { id: 'videos', label: 'Videos', icon: FileVideo, description: 'Upload videos or add links' },
    { id: 'notes', label: 'Notes', icon: FileText, description: 'Create rich text content' },
    { id: 'ebooks', label: 'E-books', icon: BookOpen, description: 'Upload PDFs and documents' },
    { id: 'code', label: 'Code Snippets', icon: Code, description: 'Share code examples' },
    { id: 'plugins', label: 'Plugin Tools', icon: Plugin, description: 'Upload tools and resources' }
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'videos':
        return <VideoUpload />;
      case 'notes':
        return <NotesEditor />;
      case 'ebooks':
        return <EbookUpload />;
      case 'code':
        return <CodeSnippetEditor />;
      case 'plugins':
        return <PluginToolsUpload />;
      default:
        return <VideoUpload />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Creator Console</h1>
          <p className="text-muted-foreground">
            Upload and manage your videos, notes, e-books, code snippets, and plugin tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Content Type Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {contentTypes.map((type) => (
          <Card key={type.id} className="cursor-pointer hover:bg-accent/50">
            <CardContent className="p-4 text-center">
              <type.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">{type.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {type.description}
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  0 items
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Upload Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="ebooks">E-books</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4">
          {getTabContent()}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          {getTabContent()}
        </TabsContent>

        <TabsContent value="ebooks" className="space-y-4">
          {getTabContent()}
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          {getTabContent()}
        </TabsContent>

        <TabsContent value="plugins" className="space-y-4">
          {getTabContent()}
        </TabsContent>
      </Tabs>

      {/* Recent Content */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Content</CardTitle>
          <CardDescription>
            Your latest uploads and drafts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content.length > 0 ? (
            <div className="space-y-4">
              {content.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {item.type === 'video' && <FileVideo className="h-8 w-8 text-blue-500" />}
                      {item.type === 'notes' && <FileText className="h-8 w-8 text-green-500" />}
                      {item.type === 'ebook' && <BookOpen className="h-8 w-8 text-purple-500" />}
                      {item.type === 'code' && <Code className="h-8 w-8 text-orange-500" />}
                      {item.type === 'plugin' && <Plugin className="h-8 w-8 text-red-500" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No content yet</h3>
              <p className="text-muted-foreground mb-4">
                Start creating content using the tabs above
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Create Your First Content
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
