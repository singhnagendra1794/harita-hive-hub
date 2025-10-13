import React from 'react';
import { NewsletterComposer } from '@/components/newsletter/NewsletterComposer';
import { DailyNewsletterGenerator } from '@/components/newsletter/DailyNewsletterGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Edit } from 'lucide-react';

const NewsletterNew = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="ai-generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="ai-generator" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Daily Generator
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Manual Post
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai-generator">
          <DailyNewsletterGenerator />
        </TabsContent>
        
        <TabsContent value="manual">
          <NewsletterComposer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsletterNew;