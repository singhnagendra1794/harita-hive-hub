
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Code, FileText, Heart, ExternalLink, Trash2 } from 'lucide-react';

interface SavedContent {
  id: string;
  title: string;
  type: 'note' | 'code_snippet' | 'newsletter' | 'tutorial';
  description?: string;
  tags: string[];
  saved_at: string;
  url?: string;
}

export const SavedContentGrid = () => {
  const [savedContent, setSavedContent] = useState<SavedContent[]>([
    {
      id: '1',
      title: 'Introduction to QGIS Buffer Analysis',
      type: 'note',
      description: 'Learn how to create buffer zones around geographical features',
      tags: ['QGIS', 'Spatial Analysis', 'Beginner'],
      saved_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Python Script for Raster Processing',
      type: 'code_snippet',
      description: 'Automated raster processing using GDAL and NumPy',
      tags: ['Python', 'GDAL', 'Raster'],
      saved_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Weekly GIS Newsletter #15',
      type: 'newsletter',
      description: 'Latest trends in geospatial technology and career opportunities',
      tags: ['Newsletter', 'Trends', 'Career'],
      saved_at: new Date().toISOString(),
    }
  ]);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'code_snippet':
        return <Code className="h-4 w-4" />;
      case 'newsletter':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'bg-blue-100 text-blue-800';
      case 'code_snippet':
        return 'bg-green-100 text-green-800';
      case 'newsletter':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const removeSavedContent = (id: string) => {
    setSavedContent(prev => prev.filter(content => content.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Saved Content</h2>
          <Badge variant="secondary">{savedContent.length}</Badge>
        </div>
      </div>

      {savedContent.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No saved content</h3>
            <p className="text-muted-foreground">
              Start bookmarking notes, code snippets, and articles to build your personal library.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedContent.map((content) => (
            <Card key={content.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getContentIcon(content.type)}
                    <Badge className={getTypeColor(content.type)}>
                      {content.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSavedContent(content.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                {content.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {content.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3">
                  {content.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {content.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{content.tags.length - 3} more
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Saved {new Date(content.saved_at).toLocaleDateString()}
                  </p>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
