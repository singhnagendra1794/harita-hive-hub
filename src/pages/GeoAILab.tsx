
import EnhancedGeoAIWorkspace from "../components/geoai/EnhancedGeoAIWorkspace";
import Layout from '../components/Layout';
import PremiumAccessGate from '../components/premium/PremiumAccessGate';

const GeoAILab = () => {
  return (
    <Layout>
      <PremiumAccessGate 
        requiredTier="pro"
        featureName="GeoAI Lab"
        featureDescription="Access advanced AI-powered geospatial analysis tools, machine learning models, and automated data processing capabilities."
      >
        <EnhancedGeoAIWorkspace />
      </PremiumAccessGate>
    </Layout>
  );
};

export default GeoAILab;
