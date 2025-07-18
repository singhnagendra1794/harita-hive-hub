
import { useState } from "react";
import Layout from "../components/Layout";
import PremiumAccessGate from "../components/premium/PremiumAccessGate";
import MapBuilder from "../components/webgis/MapBuilder";
import ProjectDashboard from "../components/webgis/ProjectDashboard";

const WebGISBuilder = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder'>('dashboard');

  return (
    <Layout>
      <PremiumAccessGate 
        requiredTier="pro"
        featureName="Web GIS Builder"
        featureDescription="Create professional web-based GIS applications with drag-and-drop interface, custom styling, and advanced mapping features."
      >
        <div className="h-screen flex flex-col">
          {currentView === 'dashboard' ? (
            <div className="container py-8 flex-1">
              <ProjectDashboard onCreateNew={() => setCurrentView('builder')} />
            </div>
          ) : (
            <div className="flex-1">
              <MapBuilder />
              {/* Back to Dashboard Button */}
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-3 py-2 bg-background border rounded-md shadow-sm hover:bg-accent transition-colors"
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </PremiumAccessGate>
    </Layout>
  );
};

export default WebGISBuilder;
