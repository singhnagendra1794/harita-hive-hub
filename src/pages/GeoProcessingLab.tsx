
import Layout from "../components/Layout";
import PremiumAccessGate from "../components/premium/PremiumAccessGate";
import EnhancedGeoProcessingWorkspace from "../components/geoprocessing/EnhancedGeoProcessingWorkspace";

const GeoProcessingLab = () => {
  return (
    <Layout>
      <PremiumAccessGate 
        requiredTier="pro"
        featureName="Geo-Processing Lab"
        featureDescription="Access advanced geospatial processing tools, batch operations, and automated workflows for data transformation and analysis."
      >
        <EnhancedGeoProcessingWorkspace />
      </PremiumAccessGate>
    </Layout>
  );
};

export default GeoProcessingLab;