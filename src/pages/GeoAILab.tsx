
import AdvancedGeoAILab from "../components/geoai/AdvancedGeoAILab";
import GeoAIUsageTracker from '../components/geoai/enhanced/GeoAIUsageTracker';

const GeoAILab = () => {
  return (
    <GeoAIUsageTracker>
      <AdvancedGeoAILab />
    </GeoAIUsageTracker>
  );
};

export default GeoAILab;
