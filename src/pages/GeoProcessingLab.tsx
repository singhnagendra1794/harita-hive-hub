
import PremiumAccessGate from "../components/premium/PremiumAccessGate";
import HaritaHiveGeoProcessingLab from "../components/geoprocessing/HaritaHiveGeoProcessingLab";

const GeoProcessingLab = () => {
  return (
    <PremiumAccessGate 
      requiredTier="pro"
      featureName="HaritaHive GeoProcessing Lab"
      featureDescription="World's most advanced browser-based spatial processing platform with real-time cloud processing, AI assistance, and professional-grade tools for raster and vector analysis."
    >
      <HaritaHiveGeoProcessingLab />
    </PremiumAccessGate>
  );
};

export default GeoProcessingLab;