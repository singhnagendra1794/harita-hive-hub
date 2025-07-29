import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, Play, Calendar } from "lucide-react";
import LiveNowTab from '@/components/live-classes/LiveNowTab';
import RecordedSessionsTab from '@/components/live-classes/RecordedSessionsTab';
import FutureEventsTab from '@/components/live-classes/FutureEventsTab';


const LiveClasses = () => {
  const [activeTab, setActiveTab] = useState('live-now');

  return (
    <div className="container py-12">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Live Learning Hub
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Real-time live classes, interactive recordings, and AI-powered learning sessions
        </p>
      </div>

      {/* 3-Tab Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live-now" className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            <span className="hidden sm:inline">🔴 Live Now</span>
            <span className="sm:hidden">Live</span>
          </TabsTrigger>
          <TabsTrigger value="recordings" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">🎞️ Recorded Sessions</span>
            <span className="sm:hidden">Recordings</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">📅 Future Events</span>
            <span className="sm:hidden">Events</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="live-now">
            <LiveNowTab />
          </TabsContent>

          <TabsContent value="recordings">
            <RecordedSessionsTab />
          </TabsContent>

          <TabsContent value="events">
            <FutureEventsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default LiveClasses;