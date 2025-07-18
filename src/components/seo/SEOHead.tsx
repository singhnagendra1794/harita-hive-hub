import React, { useEffect } from 'react';
import { addSchemaMarkup, generateOrganizationSchema, SEOConfig } from '@/utils/seoUtils';

interface SEOHeadProps extends SEOConfig {
  schemaData?: any;
  children?: React.ReactNode;
}

const SEOHead: React.FC<SEOHeadProps> = ({ 
  title, 
  description, 
  keywords,
  image,
  url,
  author,
  publishedDate,
  modifiedDate,
  type = 'website',
  price,
  currency,
  category,
  tags,
  schemaData,
  children 
}) => {
  useEffect(() => {
    // Add organization schema by default
    const organizationSchema = generateOrganizationSchema();
    addSchemaMarkup(organizationSchema);

    // Add custom schema if provided
    if (schemaData) {
      addSchemaMarkup(schemaData);
    }
  }, [schemaData]);

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Harita Hive" />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:alt" content={title} />}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@HaritaHive" />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Article Meta Tags */}
      {type === 'article' && publishedDate && (
        <meta property="article:published_time" content={publishedDate} />
      )}
      {type === 'article' && modifiedDate && (
        <meta property="article:modified_time" content={modifiedDate} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Product Meta Tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency || 'USD'} />
        </>
      )}
      
      {/* Canonical URL */}
      {url && <link rel="canonical" href={url} />}
      
      {/* Additional meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      
      {children}
    </>
  );
};

export default SEOHead;