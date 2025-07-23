import { useState, useEffect } from 'react';
import { ProjectTemplate } from '@/components/templates/TemplateCard';

// Mock data for demonstration - replace with actual API calls
const mockTemplates: ProjectTemplate[] = [
  {
    id: '1',
    title: 'Urban Flood Risk Mapping',
    description: 'Create flood risk maps using DEM data, rainfall patterns, and urban infrastructure analysis.',
    category: 'environmental',
    type: 'qgis',
    tags: ['QGIS', 'DEM', 'Hydrology', 'Risk Assessment'],
    isPremium: false,
    isFeatured: true,
    downloadCount: 234,
    rating: 4.8,
    ratingCount: 45,
    usedInProjects: 89,
    recommendedCourse: 'GIS for Environmental Analysis',
    difficulty: 'intermediate',
    estimatedTime: '3-4 hours',
    tools: ['QGIS', 'GDAL', 'Python'],
    author: 'HaritaHive Team',
    lastUpdated: '2024-01-15',
    fileSize: '45 MB',
    includes: ['QGIS Project File', 'Sample DEM Data', 'Python Scripts', 'Step-by-Step Guide', 'Video Tutorial']
  },
  {
    id: '2',
    title: 'Land Use Classification with Sentinel-2',
    description: 'Automated land use classification using machine learning and Sentinel-2 satellite imagery.',
    category: 'remote-sensing',
    type: 'python',
    tags: ['Machine Learning', 'Sentinel-2', 'Classification', 'Google Earth Engine'],
    isPremium: true,
    isFeatured: true,
    downloadCount: 156,
    rating: 4.9,
    ratingCount: 32,
    usedInProjects: 67,
    recommendedCourse: 'Remote Sensing with Google Earth Engine',
    difficulty: 'advanced',
    estimatedTime: '4-6 hours',
    tools: ['Python', 'Google Earth Engine', 'scikit-learn'],
    author: 'Dr. Sarah Johnson',
    lastUpdated: '2024-01-20',
    fileSize: '78 MB',
    includes: ['Jupyter Notebooks', 'Training Data', 'Pre-trained Models', 'Complete Documentation', 'Video Walkthrough']
  },
  {
    id: '3',
    title: 'Interactive City Infrastructure Web Map',
    description: 'Build a responsive web map showing city infrastructure with real-time data integration.',
    category: 'web-mapping',
    type: 'web',
    tags: ['Leaflet', 'JavaScript', 'REST API', 'Interactive Maps'],
    isPremium: false,
    isFeatured: false,
    downloadCount: 189,
    rating: 4.6,
    ratingCount: 28,
    usedInProjects: 54,
    recommendedCourse: 'Web GIS Development',
    difficulty: 'intermediate',
    estimatedTime: '2-3 hours',
    tools: ['HTML/CSS', 'JavaScript', 'Leaflet'],
    author: 'Mike Chen',
    lastUpdated: '2024-01-10',
    fileSize: '12 MB',
    includes: ['Complete Web App', 'Sample Data', 'API Integration', 'Setup Instructions', 'Customization Guide']
  },
  {
    id: '4',
    title: 'NDVI Crop Health Monitoring Dashboard',
    description: 'Time-series analysis of crop health using NDVI data with an interactive dashboard.',
    category: 'agriculture',
    type: 'dashboard',
    tags: ['NDVI', 'Time Series', 'Agriculture', 'Dashboard'],
    isPremium: true,
    isFeatured: false,
    downloadCount: 98,
    rating: 4.7,
    ratingCount: 19,
    usedInProjects: 42,
    recommendedCourse: 'Agricultural Remote Sensing',
    difficulty: 'intermediate',
    estimatedTime: '3-4 hours',
    tools: ['Python', 'Streamlit', 'Pandas'],
    author: 'Dr. Maria Rodriguez',
    lastUpdated: '2024-01-12',
    fileSize: '35 MB',
    includes: ['Dashboard Source Code', 'Historical NDVI Data', 'Analysis Scripts', 'Deployment Guide', 'User Manual']
  },
  {
    id: '5',
    title: 'Urban Growth Analysis with QGIS',
    description: 'Analyze urban sprawl patterns using multi-temporal satellite imagery and statistical methods.',
    category: 'urban-planning',
    type: 'qgis',
    tags: ['Urban Planning', 'Time Series', 'Statistical Analysis', 'Change Detection'],
    isPremium: false,
    isFeatured: false,
    downloadCount: 145,
    rating: 4.5,
    ratingCount: 24,
    usedInProjects: 38,
    difficulty: 'beginner',
    estimatedTime: '2-3 hours',
    tools: ['QGIS', 'Excel', 'R'],
    author: 'Urban Planning Lab',
    lastUpdated: '2024-01-08',
    fileSize: '67 MB',
    includes: ['QGIS Project', 'Multi-temporal Data', 'R Scripts', 'Analysis Methods', 'Report Template']
  },
  {
    id: '6',
    title: 'Air Quality Monitoring Network Design',
    description: 'Optimize placement of air quality sensors using spatial interpolation and accessibility analysis.',
    category: 'environmental',
    type: 'notebook',
    tags: ['Air Quality', 'Sensor Networks', 'Optimization', 'Spatial Interpolation'],
    isPremium: true,
    isFeatured: false,
    downloadCount: 76,
    rating: 4.8,
    ratingCount: 15,
    usedInProjects: 29,
    recommendedCourse: 'Environmental Monitoring Systems',
    difficulty: 'advanced',
    estimatedTime: '4-5 hours',
    tools: ['Python', 'Jupyter', 'GeoPandas'],
    author: 'Environmental Research Group',
    lastUpdated: '2024-01-18',
    fileSize: '28 MB',
    includes: ['Jupyter Notebooks', 'Optimization Algorithms', 'Sample Data', 'Validation Methods', 'Research Paper']
  }
];

export const useProjectTemplates = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTemplates(mockTemplates);
      setLoading(false);
    }, 1000);
  }, []);

  const downloadTemplate = async (templateId: string): Promise<void> => {
    // Simulate download process
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
          // In a real implementation, this would trigger a file download
          console.log(`Downloading template: ${template.title}`);
          // Update download count
          setTemplates(prev => 
            prev.map(t => 
              t.id === templateId 
                ? { ...t, downloadCount: t.downloadCount + 1 }
                : t
            )
          );
          resolve();
        } else {
          reject(new Error('Template not found'));
        }
      }, 1500);
    });
  };

  const getTemplateGuide = async (templateId: string): Promise<string> => {
    // Simulate getting guide URL
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
          // In a real implementation, this would return the actual PDF URL
          const guideUrl = `https://guides.haritahive.com/templates/${templateId}/guide.pdf`;
          resolve(guideUrl);
        } else {
          reject(new Error('Guide not found'));
        }
      }, 500);
    });
  };

  const getTemplateById = (templateId: string): ProjectTemplate | undefined => {
    return templates.find(template => template.id === templateId);
  };

  const getTemplatesByCategory = (category: string): ProjectTemplate[] => {
    return templates.filter(template => template.category === category);
  };

  const getFeaturedTemplates = (): ProjectTemplate[] => {
    return templates.filter(template => template.isFeatured);
  };

  const getPopularTemplates = (limit: number = 6): ProjectTemplate[] => {
    return templates
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, limit);
  };

  return {
    templates,
    loading,
    downloadTemplate,
    getTemplateGuide,
    getTemplateById,
    getTemplatesByCategory,
    getFeaturedTemplates,
    getPopularTemplates
  };
};