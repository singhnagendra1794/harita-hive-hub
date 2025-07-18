
import GeoAIWorkspace from "../components/geoai/GeoAIWorkspace";
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
        <GeoAIWorkspace />
      </PremiumAccessGate>
    </Layout>
  );
};

export default GeoAILab;
