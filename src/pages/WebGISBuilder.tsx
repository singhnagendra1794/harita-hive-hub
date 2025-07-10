
import { useState } from "react";
import Layout from "../components/Layout";
import MapBuilder from "../components/webgis/MapBuilder";
import ProjectDashboard from "../components/webgis/ProjectDashboard";

const WebGISBuilder = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder'>('dashboard');

  return (
    <Layout>
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
    </Layout>
  );
};

export default WebGISBuilder;
