
import GeoAIPhase3Main from "../components/geoai/GeoAIPhase3Main";
import GeoAIUsageTracker from '../components/geoai/enhanced/GeoAIUsageTracker';

const GeoAILab = () => {
  return (
    <GeoAIUsageTracker>
      <GeoAIPhase3Main />
    </GeoAIUsageTracker>
  );
};

export default GeoAILab;
