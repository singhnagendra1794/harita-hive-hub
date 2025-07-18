// SEO utilities for dynamic meta tag updates
export const updatePageSEO = (title: string, description: string, keywords?: string) => {
  // Update title
  document.title = title;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }
  
  // Update keywords if provided
  if (keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
  }
  
  // Update Open Graph title and description
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', title);
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', description);
  }
  
  // Update Twitter card title and description
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', title);
  }
  
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', description);
  }
};

// Predefined SEO data for different pages
export const seoData = {
  home: {
    title: 'Harita Hive - Master GIS Technology | Geospatial Learning Platform',
    description: 'Transform your career with comprehensive GIS education, cutting-edge geospatial tools, and a thriving professional community. From beginner basics to advanced enterprise solutions.',
    keywords: 'GIS, geospatial, mapping, spatial analysis, QGIS, remote sensing, cartography, location intelligence, GIS training, geospatial education'
  },
  newsletter: {
    title: 'Harita Hive Newsletter | Weekly Geospatial Insights & Updates',
    description: 'Stay updated with the latest geospatial breakthroughs, tools, career opportunities, and industry trends. Join 5,000+ professionals getting weekly insights.',
    keywords: 'GIS newsletter, geospatial news, GIS tools, mapping updates, spatial analysis trends, GIS careers'
  },
  challenge: {
    title: 'GeoAI Dashboard Challenge | Harita Hive',
    description: 'Participate in hands-on GIS challenges and showcase your skills. Build real-world projects and compete with geospatial professionals worldwide.',
    keywords: 'GIS challenge, geospatial competition, GeoAI, mapping challenge, spatial analysis projects'
  },
  geoaiLab: {
    title: 'GeoAI Lab - AI-Powered Geospatial Analysis | Harita Hive',
    description: 'Explore cutting-edge AI tools for geospatial analysis. Upload satellite imagery, perform automated analysis, and generate insights with machine learning.',
    keywords: 'GeoAI, artificial intelligence GIS, machine learning mapping, satellite image analysis, automated spatial analysis'
  },
  webgisBuilder: {
    title: 'WebGIS Builder - Create Interactive Maps | Harita Hive',
    description: 'Build professional web-based GIS applications without coding. Create interactive maps, dashboards, and geospatial applications with our visual builder.',
    keywords: 'WebGIS, interactive maps, web mapping, GIS applications, map builder, geospatial dashboard'
  },
  geoprocessingLab: {
    title: 'Geoprocessing Lab - Spatial Analysis Tools | Harita Hive',
    description: 'Access powerful geoprocessing tools for spatial analysis. Perform buffer analysis, spatial joins, raster processing, and advanced geospatial workflows.',
    keywords: 'geoprocessing, spatial analysis, buffer analysis, raster processing, vector analysis, GIS tools'
  },
  browseUserses: {
    title: 'Browse Courses - GIS Learning Resources | Harita Hive',
    description: 'Discover comprehensive GIS courses from beginner to advanced levels. Learn QGIS, Python for GIS, remote sensing, and geospatial programming.',
    keywords: 'GIS courses, QGIS training, Python GIS, remote sensing courses, geospatial education, mapping tutorials'
  },
  mapPlayground: {
    title: 'Interactive Map Playground | Harita Hive',
    description: 'Experiment with interactive mapping tools. Create visualizations, analyze spatial data, and learn geospatial concepts hands-on.',
    keywords: 'interactive maps, map playground, spatial visualization, GIS learning, mapping tools'
  }
};

// Hook for easy SEO updates in components
export const useSEO = (pageKey: keyof typeof seoData) => {
  const seo = seoData[pageKey];
  
  const updateSEO = () => {
    updatePageSEO(seo.title, seo.description, seo.keywords);
  };
  
  return { updateSEO, ...seo };
};