
import AdvancedGeoAILab from "../components/geoai/AdvancedGeoAILab";
import PremiumAccessGate from '../components/premium/PremiumAccessGate';

const GeoAILab = () => {
  return (
    <PremiumAccessGate 
      requiredTier="pro"
      featureName="GeoAI Lab"
      featureDescription="Access the most powerful geospatial AI platform with no-code workflows, hands-on deep learning experiments, and expert-level tooling."
    >
      <AdvancedGeoAILab />
    </PremiumAccessGate>
  );
};

export default GeoAILab;
