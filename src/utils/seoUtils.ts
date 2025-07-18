// Advanced SEO utilities for comprehensive meta tag and schema markup management
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  type?: 'website' | 'article' | 'course' | 'product' | 'organization';
  price?: number;
  currency?: string;
  category?: string;
  tags?: string[];
}

export const updatePageSEO = (config: SEOConfig) => {
  const { title, description, keywords, image, url, author, publishedDate, modifiedDate, type = 'website' } = config;
  
  // Update title
  document.title = title;
  
  // Update or create meta tags
  const updateMetaTag = (selector: string, content: string) => {
    let meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement('meta');
      if (selector.includes('property=')) {
        meta.setAttribute('property', selector.split('"')[1]);
      } else {
        meta.setAttribute('name', selector.split('"')[1]);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  // Basic meta tags
  updateMetaTag('meta[name="description"]', description);
  if (keywords) updateMetaTag('meta[name="keywords"]', keywords);
  if (author) updateMetaTag('meta[name="author"]', author);
  updateMetaTag('meta[name="robots"]', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  
  // Open Graph tags
  updateMetaTag('meta[property="og:title"]', title);
  updateMetaTag('meta[property="og:description"]', description);
  updateMetaTag('meta[property="og:type"]', type);
  updateMetaTag('meta[property="og:site_name"]', 'Harita Hive');
  if (url) updateMetaTag('meta[property="og:url"]', url);
  if (image) updateMetaTag('meta[property="og:image"]', image);
  if (image) updateMetaTag('meta[property="og:image:alt"]', title);
  
  // Twitter Card tags
  updateMetaTag('meta[name="twitter:card"]', 'summary_large_image');
  updateMetaTag('meta[name="twitter:title"]', title);
  updateMetaTag('meta[name="twitter:description"]', description);
  updateMetaTag('meta[name="twitter:site"]', '@HaritaHive');
  if (image) updateMetaTag('meta[name="twitter:image"]', image);
  
  // Additional meta tags for articles
  if (type === 'article' && publishedDate) {
    updateMetaTag('meta[property="article:published_time"]', publishedDate);
    if (modifiedDate) updateMetaTag('meta[property="article:modified_time"]', modifiedDate);
    if (author) updateMetaTag('meta[property="article:author"]', author);
  }
  
  // Canonical URL
  if (url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }
};

export const addSchemaMarkup = (schema: any) => {
  // Remove existing schema markup
  const existingSchema = document.getElementById('schema-markup');
  if (existingSchema) {
    existingSchema.remove();
  }
  
  // Add new schema markup
  const script = document.createElement('script');
  script.id = 'schema-markup';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};

export const generateCourseSchema = (course: any) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": course.title,
  "description": course.description,
  "provider": {
    "@type": "Organization",
    "name": "Harita Hive",
    "url": "https://haritahive.com"
  },
  "educationalLevel": course.difficulty_level || "Beginner",
  "courseMode": "online",
  "inLanguage": "en",
  ...(course.price && {
    "offers": {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": "USD"
    }
  })
});

export const generateProductSchema = (product: any) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": product.title,
  "description": product.description,
  "applicationCategory": "GIS Software",
  "operatingSystem": "Cross-platform",
  "offers": {
    "@type": "Offer",
    "price": product.price || "0",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": "Harita Hive"
  }
});

export const generateArticleSchema = (article: any) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "author": {
    "@type": "Person",
    "name": article.author || "Harita Hive Team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Harita Hive",
    "logo": {
      "@type": "ImageObject",
      "url": "https://haritahive.com/logo-512.png"
    }
  },
  "datePublished": article.publishedDate,
  "dateModified": article.modifiedDate || article.publishedDate,
  ...(article.image && {
    "image": {
      "@type": "ImageObject",
      "url": article.image
    }
  })
});

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Harita Hive",
  "url": "https://haritahive.com",
  "logo": "https://haritahive.com/logo-512.png",
  "description": "Leading geospatial learning platform offering GIS education, tools, and community",
  "sameAs": [
    "https://linkedin.com/company/haritahive",
    "https://twitter.com/haritahive",
    "https://github.com/haritahive"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "contact@haritahive.com"
  }
});

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
    updatePageSEO({
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords,
      url: window.location.href,
      type: 'website'
    });
  };
  
  return { updateSEO, ...seo };
};

// Backward compatibility function
export const updatePageSEOLegacy = (title: string, description: string, keywords?: string) => {
  updatePageSEO({ title, description, keywords, url: window.location.href });
};