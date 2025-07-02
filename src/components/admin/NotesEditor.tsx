
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, Eye, FileText, Bold, Italic, List, Link, Image, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotesData {
  title: string;
  content: string;
  markdown_content: string;
  tags: string[];
  visibility: 'draft' | 'published';
  course_id?: string;
  module_id?: string;
}

export const NotesEditor = () => {
  const [notesData, setNotesData] = useState<NotesData>({
    title: '',
    content: '',
    markdown_content: '',
    tags: [],
    visibility: 'draft'
  });
  const [activeTab, setActiveTab] = useState('editor');
  const [tagInput, setTagInput] = useState('');
  const { toast } = useToast();

  const addTag = () => {
    if (tagInput.trim() && !notesData.tags.includes(tagInput.trim())) {
      setNotesData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNotesData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      const replacement = selectedText || placeholder;
      
      let newText = '';
      switch (syntax) {
        case 'bold':
          newText = `**${replacement}**`;
          break;
        case 'italic':
          newText = `*${replacement}*`;
          break;
        case 'list':
          newText = `\n- ${replacement}\n- \n- `;
          break;
        case 'link':
          newText = `[${replacement || 'Link text'}](URL)`;
          break;
        case 'image':
          newText = `![${replacement || 'Alt text'}](Image URL)`;
          break;
        default:
          newText = replacement;
      }

      const newValue = 
        textarea.value.substring(0, start) + 
        newText + 
        textarea.value.substring(end);
      
      setNotesData(prev => ({ ...prev, markdown_content: newValue }));
    }
  };

  const saveNotes = async () => {
    if (!notesData.title || !notesData.content) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would save to your database
      console.log('Saving notes:', notesData);
      
      toast({
        title: "Success",
        description: "Notes saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  const previewMarkdown = (markdown: string) => {
    // Simple markdown to HTML conversion for preview
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notes & Rich Content Editor</CardTitle>
          <CardDescription>
            Create rich text content, tutorials, and documentation with markdown support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notes Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={notesData.title}
                onChange={(e) => setNotesData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a title for your notes"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags (e.g., Tutorial, Guide, Reference)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {notesData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {notesData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="editor">Rich Editor</TabsTrigger>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={notesData.content}
                  onChange={(e) => setNotesData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your content here..."
                  rows={12}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="markdown" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Markdown Editor</Label>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown('bold', 'bold text')}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown('italic', 'italic text')}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown('list', 'List item')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown('link')}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown('image')}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="markdown-editor"
                  value={notesData.markdown_content}
                  onChange={(e) => setNotesData(prev => ({ ...prev, markdown_content: e.target.value }))}
                  placeholder="Write your content in markdown..."
                  rows={12}
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-4 min-h-[300px] bg-muted/30">
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: previewMarkdown(notesData.markdown_content || notesData.content)
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={notesData.visibility}
                onValueChange={(value: 'draft' | 'published') => 
                  setNotesData(prev => ({ ...prev, visibility: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="course">Associate with Course</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select course (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gis-basics">GIS Basics</SelectItem>
                  <SelectItem value="remote-sensing">Remote Sensing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline">Save as Draft</Button>
            <Button onClick={saveNotes}>
              <Save className="h-4 w-4 mr-2" />
              Save Notes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
