import React from 'react';
import PremiumAccessGate from "../components/premium/PremiumAccessGate";
import DragDropWebGISCreator from "../components/webgis/DragDropWebGISCreator";

const WebGISBuilder = () => {
  return (
    <PremiumAccessGate
      requiredTier="pro"
      featureName="Drag-and-Drop Web GIS Creator"
      featureDescription="Build professional web mapping applications with our visual editor. Create interactive maps, add data layers, apply styling, and publish to the web - all without coding."
    >
      <DragDropWebGISCreator />
    </PremiumAccessGate>
  );
};

export default WebGISBuilder;