
import React from 'react';
import EmailPreferences from '@/components/EmailPreferences';
import EmailSchedulerSetup from '@/components/EmailSchedulerSetup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EmailNotificationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preferences">Email Preferences</TabsTrigger>
          <TabsTrigger value="automation">Email Automation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preferences" className="space-y-4">
          <EmailPreferences />
        </TabsContent>
        
        <TabsContent value="automation" className="space-y-4">
          <EmailSchedulerSetup />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailNotificationSettings;
