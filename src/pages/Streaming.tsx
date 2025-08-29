import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OBSStreamManager from '@/components/streaming/OBSStreamManager';
import StreamRecordings from '@/components/streaming/StreamRecordings';

import { Monitor, Video } from 'lucide-react';

const Streaming: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Live Streaming</h1>
          <p className="text-xl text-muted-foreground">
            Set up and manage your live streams using OBS Studio with AWS-powered infrastructure
          </p>
        </div>
        
        <Tabs defaultValue="streaming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="streaming" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Stream Manager
            </TabsTrigger>
            <TabsTrigger value="recordings" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Recordings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="streaming">
            <OBSStreamManager />
          </TabsContent>
          
          <TabsContent value="recordings">
            <StreamRecordings />
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default Streaming;