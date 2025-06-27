
import Layout from "../components/Layout";
import MapPlayground from "../components/map/MapPlayground";

const MapPlaygroundPage = () => {
  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Interactive Map Playground</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, edit, and visualize geospatial data with our interactive mapping tools
          </p>
        </div>
        
        <MapPlayground />
      </div>
    </Layout>
  );
};

export default MapPlaygroundPage;
