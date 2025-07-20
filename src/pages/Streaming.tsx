import React from 'react';
import Layout from '@/components/Layout';
import OBSStreamManager from '@/components/streaming/OBSStreamManager';

const Streaming: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Live Streaming</h1>
          <p className="text-xl text-muted-foreground">
            Set up and manage your live streams using OBS Studio with our streaming platform
          </p>
        </div>
        
        <OBSStreamManager />
      </div>
    </Layout>
  );
};

export default Streaming;