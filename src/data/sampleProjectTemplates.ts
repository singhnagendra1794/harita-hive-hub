export const sampleProjectTemplates = [
  {
    id: "1",
    title: "Urban Heat Island Analysis with Sentinel-2",
    slug: "urban-heat-island-analysis-sentinel-2",
    description: "Comprehensive analysis of urban heat islands using Sentinel-2 thermal infrared data and NDVI calculations",
    use_case: "Identify and quantify urban heat island effects for city planning and climate adaptation strategies",
    sector: "urban_planning",
    skill_level: "intermediate",
    overview: "This template provides a complete workflow for analyzing urban heat islands using satellite imagery. It combines thermal infrared data from Sentinel-2 with vegetation indices to create detailed heat maps and identify cooling zones. The analysis includes data preprocessing, temperature calculation, statistical analysis, and visualization techniques.",
    objectives: [
      "Download and preprocess Sentinel-2 thermal infrared data",
      "Calculate Land Surface Temperature (LST) from thermal bands",
      "Compute NDVI to identify vegetation patterns", 
      "Create urban heat island intensity maps",
      "Generate statistical reports and visualizations"
    ],
    tools_required: ["python", "google_earth_engine", "qgis"],
    estimated_duration: "3-4 hours",
    template_files: [
      {
        name: "urban_heat_analysis.py",
        url: "/templates/urban-heat/urban_heat_analysis.py",
        type: "Python Script",
        size: 15680
      },
      {
        name: "data_preprocessing.py", 
        url: "/templates/urban-heat/data_preprocessing.py",
        type: "Python Script",
        size: 8945
      },
      {
        name: "visualization.py",
        url: "/templates/urban-heat/visualization.py", 
        type: "Python Script",
        size: 12340
      },
      {
        name: "README.md",
        url: "/templates/urban-heat/README.md",
        type: "Documentation",
        size: 5678
      },
      {
        name: "requirements.txt",
        url: "/templates/urban-heat/requirements.txt",
        type: "Dependencies",
        size: 234
      }
    ],
    sample_data_url: "/templates/urban-heat/sample-data.zip",
    sample_data_description: "Sample Sentinel-2 data for Paris city center (10km x 10km area) with thermal and optical bands",
    documentation_url: "/templates/urban-heat/Urban_Heat_Analysis_Guide.pdf",
    preview_images: [
      "/templates/urban-heat/preview1.jpg",
      "/templates/urban-heat/preview2.jpg", 
      "/templates/urban-heat/preview3.jpg"
    ],
    result_images: [
      "/templates/urban-heat/result_heat_map.jpg",
      "/templates/urban-heat/result_ndvi_map.jpg"
    ],
    folder_structure: {
      "scripts/": {
        "urban_heat_analysis.py": "main analysis script",
        "data_preprocessing.py": "data preprocessing utilities",
        "visualization.py": "plotting and visualization functions"
      },
      "data/": {
        "sample_data/": "sample Sentinel-2 data",
        "outputs/": "generated maps and results"
      },
      "docs/": {
        "README.md": "detailed documentation",
        "Urban_Heat_Analysis_Guide.pdf": "step-by-step guide"
      }
    },
    main_script_file: "urban_heat_analysis.py",
    requirements_file: "requirements.txt",
    contributor_name: "Dr. Maria Chen",
    contributor_email: "maria.chen@example.edu",
    organization: "Urban Climate Research Lab",
    license_type: "MIT",
    version: "1.2.0",
    changelog: [
      {
        version: "1.2.0",
        date: "2024-01-15",
        changes: ["Added support for Landsat 8/9 data", "Improved temperature calculation accuracy", "Added automated cloud masking"]
      },
      {
        version: "1.1.0", 
        date: "2023-11-20",
        changes: ["Enhanced visualization options", "Added statistical analysis tools"]
      }
    ],
    download_count: 1247,
    rating_average: 4.6,
    rating_count: 89,
    view_count: 3421,
    status: "published",
    is_featured: true,
    is_verified: true,
    quality_score: 95,
    tags: ["sentinel-2", "thermal", "urban-planning", "climate", "ndvi", "heat-island"],
    keywords: ["urban heat island", "land surface temperature", "thermal infrared", "sentinel-2", "climate analysis"],
    prerequisites: [
      "Basic Python programming knowledge",
      "Understanding of remote sensing concepts",
      "Google Earth Engine account"
    ],
    learning_outcomes: [
      "Master thermal infrared data processing techniques",
      "Learn urban climate analysis methods",
      "Develop skills in satellite data visualization"
    ],
    github_url: "https://github.com/urban-climate/heat-island-analysis",
    documentation_external_url: "https://urban-climate.github.io/heat-island-docs/",
    video_tutorial_url: "https://youtube.com/watch?v=example1",
    blog_post_url: "https://blog.example.com/urban-heat-analysis",
    created_at: "2023-09-15T10:00:00Z",
    updated_at: "2024-01-15T14:30:00Z",
    published_at: "2023-09-20T09:00:00Z",
    last_verified_at: "2024-01-10T16:00:00Z"
  },
  {
    id: "2",
    title: "Agricultural Crop Classification with Random Forest",
    slug: "agricultural-crop-classification-random-forest",
    description: "Machine learning-based crop classification using Sentinel-2 multispectral imagery and Random Forest algorithm",
    use_case: "Automated crop type mapping for precision agriculture and agricultural monitoring",
    sector: "agriculture",
    skill_level: "advanced",
    overview: "This template implements a complete machine learning pipeline for crop classification using Sentinel-2 imagery. It includes feature engineering with vegetation indices, time series analysis, Random Forest model training, and accuracy assessment. Perfect for agricultural monitoring and yield prediction applications.",
    objectives: [
      "Extract multispectral features from Sentinel-2 data",
      "Calculate vegetation indices (NDVI, EVI, SAVI, etc.)",
      "Implement time series analysis for phenology",
      "Train Random Forest classifier for crop types",
      "Validate model accuracy and generate classification maps"
    ],
    tools_required: ["python", "qgis", "r"],
    estimated_duration: "4-6 hours",
    template_files: [
      {
        name: "crop_classification.py",
        url: "/templates/crop-classification/crop_classification.py",
        type: "Python Script",
        size: 22150
      },
      {
        name: "feature_extraction.py",
        url: "/templates/crop-classification/feature_extraction.py",
        type: "Python Script", 
        size: 18765
      },
      {
        name: "model_training.py",
        url: "/templates/crop-classification/model_training.py",
        type: "Python Script",
        size: 13420
      },
      {
        name: "accuracy_assessment.py",
        url: "/templates/crop-classification/accuracy_assessment.py",
        type: "Python Script",
        size: 9870
      }
    ],
    sample_data_url: "/templates/crop-classification/sample-data.zip",
    sample_data_description: "Multi-temporal Sentinel-2 data for agricultural region with ground truth crop labels",
    documentation_url: "/templates/crop-classification/Crop_Classification_Guide.pdf", 
    preview_images: [
      "/templates/crop-classification/preview1.jpg",
      "/templates/crop-classification/preview2.jpg"
    ],
    result_images: [
      "/templates/crop-classification/classification_map.jpg",
      "/templates/crop-classification/accuracy_matrix.jpg"
    ],
    folder_structure: {},
    main_script_file: "crop_classification.py",
    requirements_file: "requirements.txt",
    contributor_name: "Prof. James Rodriguez",
    contributor_email: "j.rodriguez@agri.edu",
    organization: "Agricultural Remote Sensing Institute",
    license_type: "MIT",
    version: "2.1.0",
    changelog: [],
    download_count: 892,
    rating_average: 4.4,
    rating_count: 67,
    view_count: 2156,
    status: "published",
    is_featured: true,
    is_verified: true,
    quality_score: 88,
    tags: ["agriculture", "machine-learning", "sentinel-2", "classification", "random-forest"],
    keywords: ["crop classification", "agriculture", "machine learning", "random forest", "precision agriculture"],
    prerequisites: [
      "Advanced Python programming skills",
      "Machine learning fundamentals",
      "Understanding of agricultural systems"
    ],
    learning_outcomes: [
      "Master ML techniques for remote sensing",
      "Learn agricultural applications of satellite data",
      "Develop crop monitoring systems"
    ],
    github_url: "https://github.com/agri-remote/crop-classification",
    created_at: "2023-08-20T11:00:00Z",
    updated_at: "2024-01-08T10:15:00Z",
    published_at: "2023-08-25T12:00:00Z",
    last_verified_at: "2024-01-05T09:30:00Z"
  },
  {
    id: "3",
    title: "Flood Risk Assessment with QGIS and PostGIS",
    slug: "flood-risk-assessment-qgis-postgis",
    description: "Comprehensive flood risk analysis using DEM data, hydrological modeling, and spatial database management",
    use_case: "Assess flood risk zones for disaster management and urban planning decisions",
    sector: "disaster_management",
    skill_level: "intermediate",
    overview: "This template provides a complete workflow for flood risk assessment using open-source tools. It includes DEM processing, watershed delineation, flow accumulation analysis, and flood zone mapping. The template integrates QGIS for visualization with PostGIS for efficient spatial data management.",
    objectives: [
      "Process Digital Elevation Model (DEM) data",
      "Perform watershed and stream network analysis",
      "Calculate flow accumulation and direction",
      "Model flood scenarios with different return periods",
      "Create flood risk maps and vulnerability assessments"
    ],
    tools_required: ["qgis", "postgis", "sql", "python"],
    estimated_duration: "2-3 hours",
    template_files: [
      {
        name: "flood_analysis.sql",
        url: "/templates/flood-risk/flood_analysis.sql",
        type: "SQL Script",
        size: 8950
      },
      {
        name: "dem_processing.py",
        url: "/templates/flood-risk/dem_processing.py",
        type: "Python Script",
        size: 12640
      },
      {
        name: "flood_modeling.qgz",
        url: "/templates/flood-risk/flood_modeling.qgz",
        type: "QGIS Project",
        size: 45230
      }
    ],
    sample_data_url: "/templates/flood-risk/sample-data.zip",
    sample_data_description: "DEM data, rainfall data, and infrastructure shapefiles for test watershed",
    documentation_url: "/templates/flood-risk/Flood_Risk_Assessment_Guide.pdf",
    preview_images: [
      "/templates/flood-risk/preview1.jpg",
      "/templates/flood-risk/preview2.jpg"
    ],
    result_images: [
      "/templates/flood-risk/flood_zones.jpg",
      "/templates/flood-risk/risk_map.jpg"
    ],
    folder_structure: {},
    main_script_file: "dem_processing.py",
    requirements_file: "requirements.txt",
    contributor_name: "Dr. Sarah Johnson",
    contributor_email: "s.johnson@hydro.org",
    organization: "Hydrology Research Center",
    license_type: "GPL-3.0",
    version: "1.5.0",
    changelog: [],
    download_count: 654,
    rating_average: 4.3,
    rating_count: 43,
    view_count: 1789,
    status: "published",
    is_featured: false,
    is_verified: true,
    quality_score: 82,
    tags: ["flood-risk", "hydrology", "dem", "disaster-management", "qgis", "postgis"],
    keywords: ["flood assessment", "hydrology", "disaster management", "risk analysis", "watershed"],
    prerequisites: [
      "Basic GIS knowledge",
      "Understanding of hydrological concepts",
      "SQL fundamentals"
    ],
    learning_outcomes: [
      "Master hydrological modeling techniques",
      "Learn flood risk assessment methods",
      "Develop disaster management tools"
    ],
    github_url: "https://github.com/hydro-research/flood-risk-assessment",
    created_at: "2023-07-10T09:00:00Z",
    updated_at: "2023-12-20T15:45:00Z",
    published_at: "2023-07-15T10:00:00Z",
    last_verified_at: "2023-12-15T11:20:00Z"
  },
  {
    id: "4",
    title: "Forest Change Detection with NDVI Time Series",
    slug: "forest-change-detection-ndvi-time-series",
    description: "Detect forest changes and deforestation using NDVI time series analysis from Landsat imagery",
    use_case: "Monitor forest cover changes for environmental conservation and illegal logging detection",
    sector: "forestry",
    skill_level: "beginner",
    overview: "This beginner-friendly template demonstrates how to detect forest changes using NDVI time series from Landsat data. It includes cloud masking, time series smoothing, change detection algorithms, and result visualization. Perfect for environmental monitoring and conservation applications.",
    objectives: [
      "Download and preprocess Landsat imagery",
      "Calculate NDVI time series with cloud masking",
      "Apply change detection algorithms",
      "Identify deforestation events and trends",
      "Generate change maps and statistical reports"
    ],
    tools_required: ["python", "google_earth_engine"],
    estimated_duration: "1-2 hours",
    template_files: [
      {
        name: "forest_change_detection.py",
        url: "/templates/forest-change/forest_change_detection.py",
        type: "Python Script",
        size: 14560
      },
      {
        name: "time_series_analysis.py",
        url: "/templates/forest-change/time_series_analysis.py",
        type: "Python Script",
        size: 9840
      }
    ],
    sample_data_url: "/templates/forest-change/sample-data.zip",
    sample_data_description: "Landsat time series data for Amazon rainforest region (2015-2023)",
    documentation_url: "/templates/forest-change/Forest_Change_Detection_Guide.pdf",
    preview_images: [
      "/templates/forest-change/preview1.jpg"
    ],
    result_images: [
      "/templates/forest-change/change_map.jpg",
      "/templates/forest-change/ndvi_trend.jpg"
    ],
    folder_structure: {},
    main_script_file: "forest_change_detection.py",
    requirements_file: "requirements.txt",
    contributor_name: "Dr. Elena Martinez",
    contributor_email: "e.martinez@forestry.org",
    organization: "Forest Conservation Institute",
    license_type: "CC-BY-4.0",
    version: "1.0.0",
    changelog: [],
    download_count: 423,
    rating_average: 4.2,
    rating_count: 28,
    view_count: 987,
    status: "published",
    is_featured: false,
    is_verified: true,
    quality_score: 78,
    tags: ["forestry", "change-detection", "ndvi", "landsat", "time-series"],
    keywords: ["forest monitoring", "deforestation", "change detection", "NDVI", "time series"],
    prerequisites: [
      "Basic Python knowledge",
      "Understanding of vegetation indices",
      "Google Earth Engine account"
    ],
    learning_outcomes: [
      "Learn time series analysis for remote sensing",
      "Master change detection techniques",
      "Develop forest monitoring skills"
    ],
    github_url: "https://github.com/forest-conservation/change-detection",
    created_at: "2023-10-05T14:00:00Z",
    updated_at: "2023-11-12T09:30:00Z",
    published_at: "2023-10-10T11:00:00Z",
    last_verified_at: "2023-11-10T16:45:00Z"
  },
  {
    id: "5",
    title: "Water Quality Monitoring with Sentinel-2",
    slug: "water-quality-monitoring-sentinel-2",
    description: "Monitor water quality parameters using Sentinel-2 imagery and machine learning algorithms",
    use_case: "Assess and monitor water quality in lakes, reservoirs, and coastal areas for environmental management",
    sector: "water_resources",
    skill_level: "intermediate",
    overview: "This template provides tools for monitoring water quality using satellite imagery. It includes algorithms for detecting chlorophyll-a, turbidity, and suspended sediments using Sentinel-2 spectral bands. The workflow covers data preprocessing, feature extraction, and water quality parameter estimation.",
    objectives: [
      "Extract water bodies from satellite imagery",
      "Calculate water quality indices and ratios",
      "Estimate chlorophyll-a concentration",
      "Assess water turbidity and suspended sediments",
      "Create water quality monitoring maps"
    ],
    tools_required: ["python", "qgis", "google_earth_engine"],
    estimated_duration: "2-3 hours",
    template_files: [
      {
        name: "water_quality_analysis.py",
        url: "/templates/water-quality/water_quality_analysis.py",
        type: "Python Script",
        size: 16780
      },
      {
        name: "water_indices.py",
        url: "/templates/water-quality/water_indices.py",
        type: "Python Script",
        size: 11230
      }
    ],
    sample_data_url: "/templates/water-quality/sample-data.zip",
    sample_data_description: "Sentinel-2 data for Lake Geneva with field measurements for validation",
    documentation_url: "/templates/water-quality/Water_Quality_Monitoring_Guide.pdf",
    preview_images: [
      "/templates/water-quality/preview1.jpg",
      "/templates/water-quality/preview2.jpg"
    ],
    result_images: [
      "/templates/water-quality/chlorophyll_map.jpg",
      "/templates/water-quality/turbidity_map.jpg"
    ],
    folder_structure: {},
    main_script_file: "water_quality_analysis.py",
    requirements_file: "requirements.txt",
    contributor_name: "Dr. Michael Thompson",
    contributor_email: "m.thompson@water.edu",
    organization: "Water Resources Research Lab",
    license_type: "MIT",
    version: "1.3.0",
    changelog: [],
    download_count: 567,
    rating_average: 4.5,
    rating_count: 34,
    view_count: 1345,
    status: "published",
    is_featured: false,
    is_verified: true,
    quality_score: 85,
    tags: ["water-quality", "sentinel-2", "monitoring", "chlorophyll", "turbidity"],
    keywords: ["water quality", "environmental monitoring", "chlorophyll", "turbidity", "remote sensing"],
    prerequisites: [
      "Python programming skills",
      "Understanding of water quality parameters",
      "Remote sensing fundamentals"
    ],
    learning_outcomes: [
      "Master water quality assessment techniques",
      "Learn environmental monitoring methods",
      "Develop aquatic remote sensing skills"
    ],
    github_url: "https://github.com/water-research/quality-monitoring",
    created_at: "2023-09-01T08:00:00Z",
    updated_at: "2023-12-05T13:20:00Z",
    published_at: "2023-09-08T10:00:00Z",
    last_verified_at: "2023-12-01T14:15:00Z"
  }
];

export const sampleCollections = [
  {
    id: "1",
    name: "Essential GIS for Beginners",
    description: "Perfect starting templates for GIS newcomers",
    slug: "essential-gis-beginners",
    is_public: true,
    is_featured: true,
    cover_image_url: "/collections/beginners-cover.jpg",
    template_ids: ["4", "3"]
  },
  {
    id: "2", 
    name: "Advanced Remote Sensing",
    description: "Professional-grade templates for remote sensing experts",
    slug: "advanced-remote-sensing",
    is_public: true,
    is_featured: true,
    cover_image_url: "/collections/advanced-cover.jpg",
    template_ids: ["1", "2", "5"]
  },
  {
    id: "3",
    name: "Environmental Monitoring",
    description: "Templates focused on environmental assessment and monitoring",
    slug: "environmental-monitoring", 
    is_public: true,
    is_featured: false,
    cover_image_url: "/collections/environmental-cover.jpg",
    template_ids: ["4", "5"]
  }
];