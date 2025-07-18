

import AdvancedMapPlayground from "../components/map/AdvancedMapPlayground";
import Layout from '../components/Layout';

const MapPlaygroundPage = () => {
  return (
    <Layout>
      <div className="relative h-screen">
        <div className="absolute top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container py-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Web GIS Platform</h1>
              <p className="text-lg text-muted-foreground">
                Advanced mapping with QGIS integration, multi-basemap support, and spatial analysis tools
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-24 h-full">
          <AdvancedMapPlayground />
        </div>
      </div>
    </Layout>
  );
};

export default MapPlaygroundPage;
