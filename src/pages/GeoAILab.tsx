
import EnhancedGeoAIWorkspace from "../components/geoai/EnhancedGeoAIWorkspace";
import PremiumAccessGate from '../components/premium/PremiumAccessGate';

const GeoAILab = () => {
  return (
    <PremiumAccessGate 
      requiredTier="pro"
      featureName="GeoAI Lab"
      featureDescription="Access advanced AI-powered geospatial analysis tools, machine learning models, and automated data processing capabilities."
    >
      <EnhancedGeoAIWorkspace />
    </PremiumAccessGate>
  );
};

export default GeoAILab;
