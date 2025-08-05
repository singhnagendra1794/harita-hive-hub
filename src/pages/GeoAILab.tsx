
import GeoAIPhase4Main from '../components/geoai/GeoAIPhase4Main';
import GeoAIUsageTracker from '../components/geoai/enhanced/GeoAIUsageTracker';

const GeoAILab = () => {
  return (
    <GeoAIUsageTracker>
      <GeoAIPhase4Main />
    </GeoAIUsageTracker>
  );
};

export default GeoAILab;
