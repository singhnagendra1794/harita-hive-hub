import React from 'react';
import LiveSandboxLabs from '@/components/labs/LiveSandboxLabs';
import PremiumAccessGate from '@/components/premium/PremiumAccessGate';

const Labs = () => {
  return (
    <PremiumAccessGate 
      requiredTier="pro"
      featureName="Live Sandbox Labs"
      featureDescription="Access real-world geospatial environments and hands-on missions using live Earth data and industry-standard tools."
    >
      <LiveSandboxLabs />
    </PremiumAccessGate>
  );
};

export default Labs;