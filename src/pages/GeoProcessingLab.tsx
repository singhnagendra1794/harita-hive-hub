
import PremiumAccessGate from "../components/premium/PremiumAccessGate";
import EnhancedGeoProcessingWorkspace from "../components/geoprocessing/EnhancedGeoProcessingWorkspace";

const GeoProcessingLab = () => {
  return (
    <PremiumAccessGate 
      requiredTier="pro"
      featureName="Enterprise Geo-Processing Lab"
      featureDescription="Access enterprise-grade spatial analysis tools with AI-powered insights, real-time processing, cloud export, and API automation capabilities."
    >
      <EnhancedGeoProcessingWorkspace />
    </PremiumAccessGate>
  );
};

export default GeoProcessingLab;