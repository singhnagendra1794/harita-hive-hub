
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Save, Eye, Copy, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeSnippetData {
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  visibility: 'draft' | 'published';
  course_id?: string;
  module_id?: string;
  is_downloadable: boolean;
  github_url?: string;
}

const programmingLanguages = [
  'python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'csharp', 'go', 'rust',
  'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css',
  'bash', 'powershell', 'json', 'yaml', 'xml', 'markdown'
];

export const CodeSnippetEditor = () => {
  const [codeData, setCodeData] = useState<CodeSnippetData>({
    title: '',
    description: '',
    code: '',
    language: 'python',
    tags: [],
    visibility: 'draft',
    is_downloadable: true
  });
  const [tagInput, setTagInput] = useState('');
  const { toast } = useToast();

  const addTag = () => {
    if (tagInput.trim() && !codeData.tags.includes(tagInput.trim())) {
      setCodeData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCodeData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeData.code);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([codeData.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${codeData.title || 'code'}.${getFileExtension(codeData.language)}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getFileExtension = (language: string) => {
    const extensions: { [key: string]: string } = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      swift: 'swift',
      kotlin: 'kt',
      scala: 'scala',
      r: 'r',
      matlab: 'm',
      sql: 'sql',
      html: 'html',
      css: 'css',
      bash: 'sh',
      powershell: 'ps1',
      json: 'json',
      yaml: 'yml',
      xml: 'xml',
      markdown: 'md'
    };
    return extensions[language] || 'txt';
  };

  const saveCodeSnippet = async () => {
    if (!codeData.title || !codeData.code) {
      toast({
        title: "Error",
        description: "Please fill in title and code",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would save to your database
      console.log('Saving code snippet:', codeData);
      
      toast({
        title: "Success",
        description: "Code snippet saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save code snippet",
        variant: "destructive",
      });
    }
  };

  // Simple syntax highlighting for preview
  const highlightCode = (code: string, language: string) => {
    // This is a simple highlighting - in production, you'd use a library like Prism.js
    return code;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Code Snippet Editor</CardTitle>
          <CardDescription>
            Create and share code examples, tutorials, and programming resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Code Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={codeData.title}
                onChange={(e) => setCodeData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title for your code snippet"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={codeData.description}
                onChange={(e) => setCodeData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Explain what this code does and how to use it"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Programming Language</Label>
                <Select
                  value={codeData.language}
                  onValueChange={(value) => setCodeData(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {programmingLanguages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="github-url">GitHub URL (Optional)</Label>
                <Input
                  id="github-url"
                  value={codeData.github_url || ''}
                  onChange={(e) => setCodeData(prev => ({ ...prev, github_url: e.target.value }))}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags (e.g., Algorithm, Data Analysis, Beginner)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {codeData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {codeData.tags.map((tag) => (
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

          {/* Code Editor */}
          <Tabs defaultValue="editor" className="space-y-4">
            <TabsList>
              <TabsTrigger value="editor">Code Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="code">Code</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadCode}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="code"
                  value={codeData.code}
                  onChange={(e) => setCodeData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Paste or write your code here..."
                  rows={16}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span className="text-sm font-medium">{codeData.title || 'Code Preview'}</span>
                    <Badge variant="outline" className="text-xs">
                      {codeData.language}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadCode}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <pre className="p-4 overflow-x-auto bg-slate-950 text-slate-50 text-sm">
                  <code>{codeData.code || '// Your code will appear here...'}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={codeData.visibility}
                onValueChange={(value: 'draft' | 'published') => 
                  setCodeData(prev => ({ ...prev, visibility: value }))
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="downloadable"
              checked={codeData.is_downloadable}
              onChange={(e) => setCodeData(prev => ({ ...prev, is_downloadable: e.target.checked }))}
            />
            <Label htmlFor="downloadable">Allow downloads</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline">Save as Draft</Button>
            <Button onClick={saveCodeSnippet}>
              <Save className="h-4 w-4 mr-2" />
              Save Code Snippet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
