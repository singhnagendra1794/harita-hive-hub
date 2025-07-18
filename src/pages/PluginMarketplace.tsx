
import { useState } from "react";
import Layout from "../components/Layout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Plus, Star, TrendingUp, Lock, Crown } from "lucide-react";
import PluginCard from "../components/marketplace/PluginCard";
import PluginUploadForm from "../components/marketplace/PluginUploadForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useNavigate } from "react-router-dom";

const PluginMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTech, setSelectedTech] = useState("all");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { canAccessPluginMarketplace, subscription } = usePremiumAccess();
  const { isSuperAdmin } = useUserRoles();
  const navigate = useNavigate();
  
  // Super admin has full access
  const hasFullAccess = isSuperAdmin() || canAccessPluginMarketplace();

  // Comprehensive geospatial tools collection - Industry's most complete marketplace
  const plugins = [
    // Vector Tools
    {
      id: "1",
      title: "Advanced Buffer Tool",
      description: "Create complex buffers with varying distances and custom shapes for advanced spatial analysis.",
      category: "Vector",
      tech_stack: ["Python", "QGIS", "PyQt"],
      tags: ["Vector", "Spatial Analysis", "QGIS"],
      download_count: 1250,
      rating: 4.8,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/buffer-tool.zip",
      github_url: "https://github.com/haritahive/buffer-tool",
      license: "MIT",
      is_featured: true,
      created_at: "2024-01-15",
      version: "1.2.0",
      qgis_version: "3.22+",
      last_updated: "2024-07-10"
    },
    {
      id: "2",
      title: "Polygon Simplifier",
      description: "Reduce polygon complexity while preserving geometric integrity using Douglas-Peucker algorithm.",
      category: "Vector",
      tech_stack: ["Python", "Shapely", "GDAL"],
      tags: ["Vector", "Optimization", "Geometry"],
      download_count: 845,
      rating: 4.6,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/polygon-simplifier.py",
      github_url: "https://github.com/haritahive/polygon-simplifier",
      license: "MIT",
      is_featured: false,
      created_at: "2024-01-18",
      version: "1.0.0",
      qgis_version: "3.16+",
      last_updated: "2024-06-15"
    },
    {
      id: "3",
      title: "Vector Topology Validator",
      description: "Detect and fix topology errors in vector datasets including gaps, overlaps, and slivers.",
      category: "Vector",
      tech_stack: ["Python", "QGIS", "PostGIS"],
      tags: ["Vector", "Quality Control", "Topology"],
      download_count: 1120,
      rating: 4.7,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/topology-validator.zip",
      github_url: "https://github.com/haritahive/topology-validator",
      license: "Apache 2.0",
      is_featured: false,
      created_at: "2024-01-22"
    },

    // Raster Tools
    {
      id: "rasterfusion",
      title: "Harita Hive RasterFusion",
      description: "Industry-leading raster merging and re-projection tool. Align, merge, and preserve statistics across multiple overlapping GeoTIFFs with any CRS. Includes CLI, QGIS plugin, and web integration.",
      category: "Raster",
      tech_stack: ["Python", "GDAL", "QGIS", "WebAssembly"],
      tags: ["Raster", "Merge", "Projection", "Harita Signature"],
      download_count: 3200,
      rating: 4.9,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/rasterfusion.zip",
      github_url: "https://github.com/haritahive/rasterfusion",
      license: "MIT",
      is_featured: true,
      created_at: "2024-01-01",
      is_signature: true,
      version: "2.1.0",
      qgis_version: "3.22+",
      last_updated: "2024-07-12"
    },
    {
      id: "4",
      title: "NDVI Analysis Tool",
      description: "Calculate and visualize Normalized Difference Vegetation Index from satellite imagery.",
      category: "Raster",
      tech_stack: ["Python", "QGIS", "GDAL"],
      tags: ["Raster", "Remote Sensing", "Vegetation"],
      download_count: 1680,
      rating: 4.7,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/ndvi-analysis.qgz",
      github_url: "https://github.com/haritahive/ndvi-analysis",
      license: "BSD-3",
      is_featured: true,
      created_at: "2024-02-10"
    },
    {
      id: "5",
      title: "Raster Mosaic Creator",
      description: "Seamlessly mosaic multiple raster files with color matching and edge blending.",
      category: "Raster",
      tech_stack: ["Python", "GDAL", "OpenCV"],
      tags: ["Raster", "Processing", "Mosaicking"],
      download_count: 1450,
      rating: 4.8,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/raster-mosaic.py",
      github_url: "https://github.com/haritahive/raster-mosaic",
      license: "MIT",
      is_featured: true,
      created_at: "2024-02-05"
    },
    {
      id: "geomerge",
      title: "Harita Hive GeoMerge",
      description: "Seamlessly merge vector or raster layers even with different projections. Industry-leading merge algorithm with automatic CRS detection and alignment.",
      category: "Data Processing",
      tech_stack: ["Python", "GDAL", "QGIS", "GPU"],
      tags: ["Data Processing", "Merge", "CRS", "Harita Signature"],
      download_count: 2850,
      rating: 4.9,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/geomerge.zip",
      github_url: "https://github.com/haritahive/geomerge",
      license: "MIT",
      is_featured: true,
      created_at: "2024-01-01",
      is_signature: true
    },
    {
      id: "6",
      title: "DEM Analysis Suite",
      description: "Extract slope, aspect, hillshade, and watershed from Digital Elevation Models.",
      category: "Raster",
      tech_stack: ["Python", "GDAL", "NumPy"],
      tags: ["Raster", "DEM", "Terrain Analysis"],
      download_count: 2240,
      rating: 4.9,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/dem-analysis.zip",
      github_url: "https://github.com/haritahive/dem-analysis",
      license: "MIT",
      is_featured: true,
      created_at: "2024-01-28"
    },

    // Remote Sensing
    {
      id: "7",
      title: "Satellite Image Classifier",
      description: "Python script for automated land cover classification using machine learning.",
      category: "Remote Sensing",
      tech_stack: ["Python", "scikit-learn", "GDAL", "NumPy"],
      tags: ["Remote Sensing", "ML & AI", "Classification"],
      download_count: 2100,
      rating: 4.9,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/satellite-classifier.py",
      github_url: "https://github.com/haritahive/satellite-classifier",
      license: "MIT",
      is_featured: true,
      created_at: "2024-01-20"
    },
    {
      id: "8",
      title: "Sentinel-2 Downloader",
      description: "Automated download and preprocessing of Sentinel-2 satellite imagery.",
      category: "Remote Sensing",
      tech_stack: ["Python", "Sentinelsat", "GDAL"],
      tags: ["Remote Sensing", "Data Download", "Sentinel"],
      download_count: 1890,
      rating: 4.8,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/sentinel-downloader.py",
      github_url: "https://github.com/haritahive/sentinel-downloader",
      license: "Apache 2.0",
      is_featured: false,
      created_at: "2024-02-12"
    },
    {
      id: "9",
      title: "Change Detection Tool",
      description: "Detect land cover changes between multi-temporal satellite images.",
      category: "Remote Sensing",
      tech_stack: ["Python", "OpenCV", "scikit-image"],
      tags: ["Remote Sensing", "Change Detection", "Time Series"],
      download_count: 1560,
      rating: 4.7,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/change-detection.py",
      github_url: "https://github.com/haritahive/change-detection",
      license: "MIT",
      is_featured: false,
      created_at: "2024-02-18"
    },

    // Spatial Analysis
    {
      id: "10",
      title: "Network Analysis Toolkit",
      description: "Advanced routing, service areas, and network optimization for transportation planning.",
      category: "Spatial Analysis",
      tech_stack: ["Python", "NetworkX", "OSMnx"],
      tags: ["Spatial Analysis", "Network", "Transportation"],
      download_count: 1340,
      rating: 4.8,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/network-analysis.zip",
      github_url: "https://github.com/haritahive/network-analysis",
      license: "BSD-3",
      is_featured: true,
      created_at: "2024-02-08"
    },
    {
      id: "11",
      title: "Hotspot Analysis Tool",
      description: "Identify spatial clusters and hotspots using Getis-Ord Gi* statistics.",
      category: "Spatial Analysis",
      tech_stack: ["Python", "PySAL", "NumPy"],
      tags: ["Spatial Analysis", "Statistics", "Clustering"],
      download_count: 980,
      rating: 4.6,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/hotspot-analysis.py",
      github_url: "https://github.com/haritahive/hotspot-analysis",
      license: "MIT",
      is_featured: false,
      created_at: "2024-02-14"
    },

    // Web GIS
    {
      id: "12",
      title: "Leaflet Heatmap Widget",
      description: "Interactive heatmap visualization component for web mapping applications.",
      category: "Web GIS",
      tech_stack: ["JavaScript", "Leaflet", "D3.js"],
      tags: ["Web GIS", "Visualization", "JavaScript"],
      download_count: 850,
      rating: 4.6,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/heatmap-widget.zip",
      github_url: "https://github.com/haritahive/heatmap-widget",
      license: "MIT",
      is_featured: false,
      created_at: "2024-02-01"
    },
    {
      id: "13",
      title: "Mapbox GL Clustering Plugin",
      description: "Advanced point clustering with custom styling for Mapbox GL JS.",
      category: "Web GIS",
      tech_stack: ["JavaScript", "Mapbox GL", "WebGL"],
      tags: ["Web GIS", "Clustering", "Performance"],
      download_count: 1230,
      rating: 4.7,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/mapbox-clustering.js",
      github_url: "https://github.com/haritahive/mapbox-clustering",
      license: "MIT",
      is_featured: false,
      created_at: "2024-02-20"
    },
    {
      id: "14",
      title: "GeoJSON Editor Widget",
      description: "Interactive web-based editor for creating and modifying GeoJSON features.",
      category: "Web GIS",
      tech_stack: ["JavaScript", "Leaflet", "React"],
      tags: ["Web GIS", "Editor", "GeoJSON"],
      download_count: 760,
      rating: 4.5,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/geojson-editor.zip",
      github_url: "https://github.com/haritahive/geojson-editor",
      license: "Apache 2.0",
      is_featured: false,
      created_at: "2024-02-25"
    },

    // Data Conversion
    {
      id: "15",
      title: "Coordinate Transformer",
      description: "Batch transform coordinates between different coordinate reference systems.",
      category: "Data Conversion",
      tech_stack: ["Python", "pyproj", "pandas"],
      tags: ["Data Conversion", "CRS", "Batch Processing"],
      download_count: 920,
      rating: 4.5,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/coordinate-transformer.py",
      github_url: "https://github.com/haritahive/coordinate-transformer",
      license: "MIT",
      is_featured: false,
      created_at: "2024-02-15"
    },
    {
      id: "16",
      title: "Shapefile to GeoJSON Converter",
      description: "High-performance batch conversion between vector formats with attribute preservation.",
      category: "Data Conversion",
      tech_stack: ["Python", "Fiona", "GDAL"],
      tags: ["Data Conversion", "Vector", "Format Conversion"],
      download_count: 1680,
      rating: 4.8,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/vector-converter.py",
      github_url: "https://github.com/haritahive/vector-converter",
      license: "MIT",
      is_featured: false,
      created_at: "2024-01-25"
    },
    {
      id: "17",
      title: "CSV to Point Layer Tool",
      description: "Convert CSV files with coordinates to vector point layers with automatic CRS detection.",
      category: "Data Conversion",
      tech_stack: ["Python", "GeoPandas", "pandas"],
      tags: ["Data Conversion", "CSV", "Point Data"],
      download_count: 1420,
      rating: 4.6,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/csv-to-points.py",
      github_url: "https://github.com/haritahive/csv-to-points",
      license: "BSD-3",
      is_featured: false,
      created_at: "2024-02-03"
    },

    // Urban Planning
    {
      id: "18",
      title: "Land Use Compatibility Matrix",
      description: "Analyze land use conflicts and compatibility for urban planning projects.",
      category: "Urban Planning",
      tech_stack: ["Python", "QGIS", "NumPy"],
      tags: ["Urban Planning", "Land Use", "Compatibility"],
      download_count: 670,
      rating: 4.4,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/land-use-matrix.zip",
      github_url: "https://github.com/haritahive/land-use-matrix",
      license: "MIT",
      is_featured: false,
      created_at: "2024-02-28"
    },
    {
      id: "19",
      title: "Walkability Index Calculator",
      description: "Calculate pedestrian walkability scores based on street connectivity and amenities.",
      category: "Urban Planning",
      tech_stack: ["Python", "OSMnx", "NetworkX"],
      tags: ["Urban Planning", "Walkability", "OpenStreetMap"],
      download_count: 890,
      rating: 4.7,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/walkability-index.py",
      github_url: "https://github.com/haritahive/walkability-index",
      license: "Apache 2.0",
      is_featured: false,
      created_at: "2024-03-02"
    },

    // Disaster Management
    {
      id: "20",
      title: "Flood Risk Assessment Tool",
      description: "Multi-criteria flood risk analysis using DEM, precipitation, and land use data.",
      category: "Disaster Management",
      tech_stack: ["Python", "GDAL", "NumPy"],
      tags: ["Disaster Management", "Flood", "Risk Assessment"],
      download_count: 1120,
      rating: 4.8,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/flood-risk.zip",
      github_url: "https://github.com/haritahive/flood-risk",
      license: "MIT",
      is_featured: false,
      created_at: "2024-03-05"
    },
    {
      id: "21",
      title: "Emergency Evacuation Router",
      description: "Calculate optimal evacuation routes considering capacity constraints and hazards.",
      category: "Disaster Management",
      tech_stack: ["Python", "NetworkX", "OSMnx"],
      tags: ["Disaster Management", "Evacuation", "Routing"],
      download_count: 780,
      rating: 4.6,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/evacuation-router.py",
      github_url: "https://github.com/haritahive/evacuation-router",
      license: "BSD-3",
      is_featured: false,
      created_at: "2024-03-08"
    },

    // AI/ML Tools
    {
      id: "22",
      title: "Object Detection for Satellite Images",
      description: "Deep learning models for detecting buildings, roads, and vegetation in satellite imagery.",
      category: "ML & AI",
      tech_stack: ["Python", "TensorFlow", "OpenCV"],
      tags: ["ML & AI", "Object Detection", "Deep Learning"],
      download_count: 1560,
      rating: 4.9,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/object-detection.zip",
      github_url: "https://github.com/haritahive/object-detection",
      license: "Apache 2.0",
      is_featured: true,
      created_at: "2024-03-10"
    },
    {
      id: "23",
      title: "Crop Yield Predictor",
      description: "Machine learning model for predicting crop yields using satellite data and weather.",
      category: "ML & AI",
      tech_stack: ["Python", "scikit-learn", "pandas"],
      tags: ["ML & AI", "Agriculture", "Prediction"],
      download_count: 940,
      rating: 4.5,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/crop-predictor.py",
      github_url: "https://github.com/haritahive/crop-predictor",
      license: "MIT",
      is_featured: false,
      created_at: "2024-03-12"
    },

    // 3D Visualization & Analysis
    {
      id: "24",
      title: "3D Terrain Visualizer",
      description: "Create stunning 3D terrain models from DEM data with customizable lighting and materials.",
      category: "3D Visualization",
      tech_stack: ["Python", "Three.js", "WebGL"],
      tags: ["3D", "Terrain", "Visualization"],
      download_count: 1340,
      rating: 4.8,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/3d-terrain.zip",
      github_url: "https://github.com/haritahive/3d-terrain",
      license: "MIT",
      is_featured: true,
      created_at: "2024-03-15"
    },
    {
      id: "25",
      title: "LiDAR Point Cloud Processor",
      description: "Process and analyze LiDAR point clouds for forestry, urban planning, and archaeology applications.",
      category: "3D Visualization",
      tech_stack: ["Python", "Open3D", "NumPy"],
      tags: ["LiDAR", "Point Cloud", "3D"],
      download_count: 980,
      rating: 4.7,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/lidar-processor.py",
      github_url: "https://github.com/haritahive/lidar-processor",
      license: "BSD-3",
      is_featured: false,
      created_at: "2024-03-18"
    },

    // Interpolation & Geostatistics
    {
      id: "26",
      title: "Kriging Interpolation Suite",
      description: "Advanced geostatistical interpolation using ordinary, universal, and indicator kriging methods.",
      category: "Geostatistics",
      tech_stack: ["Python", "PyKrige", "scikit-learn"],
      tags: ["Interpolation", "Kriging", "Statistics"],
      download_count: 1560,
      rating: 4.9,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/kriging-suite.py",
      github_url: "https://github.com/haritahive/kriging-suite",
      license: "MIT",
      is_featured: true,
      created_at: "2024-03-20"
    },
    {
      id: "27",
      title: "Spatial Autocorrelation Analyzer",
      description: "Calculate Moran's I, Geary's C, and other spatial autocorrelation statistics.",
      category: "Geostatistics",
      tech_stack: ["Python", "PySAL", "SciPy"],
      tags: ["Statistics", "Autocorrelation", "Spatial Analysis"],
      download_count: 890,
      rating: 4.6,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/autocorrelation.py",
      github_url: "https://github.com/haritahive/autocorrelation",
      license: "Apache 2.0",
      is_featured: false,
      created_at: "2024-03-22"
    },

    // Agriculture & Environmental
    {
      id: "28",
      title: "Precision Agriculture Toolkit",
      description: "Variable rate application mapping, yield analysis, and field boundary detection for precision farming.",
      category: "Agriculture",
      tech_stack: ["Python", "GDAL", "scikit-image"],
      tags: ["Agriculture", "Precision Farming", "Yield Analysis"],
      download_count: 1120,
      rating: 4.8,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/precision-agriculture.zip",
      github_url: "https://github.com/haritahive/precision-agriculture",
      license: "MIT",
      is_featured: false,
      created_at: "2024-03-25"
    },
    {
      id: "29",
      title: "Water Quality Monitor",
      description: "Analyze water quality parameters from satellite imagery using machine learning algorithms.",
      category: "Environmental",
      tech_stack: ["Python", "TensorFlow", "GDAL"],
      tags: ["Water Quality", "Environmental", "ML & AI"],
      download_count: 760,
      rating: 4.5,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/water-quality.py",
      github_url: "https://github.com/haritahive/water-quality",
      license: "MIT",
      is_featured: false,
      created_at: "2024-03-28"
    },
    {
      id: "30",
      title: "Forest Cover Change Detector",
      description: "Detect deforestation and reforestation using time-series satellite imagery analysis.",
      category: "Environmental",
      tech_stack: ["Python", "OpenCV", "NumPy"],
      tags: ["Forest", "Change Detection", "Environmental"],
      download_count: 1450,
      rating: 4.9,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/forest-change.py",
      github_url: "https://github.com/haritahive/forest-change",
      license: "BSD-3",
      is_featured: true,
      created_at: "2024-04-01"
    },

    // Navigation & Transportation
    {
      id: "31",
      title: "Multi-Modal Route Planner",
      description: "Calculate optimal routes combining walking, cycling, public transit, and driving modes.",
      category: "Transportation",
      tech_stack: ["Python", "NetworkX", "GTFS"],
      tags: ["Routing", "Multi-Modal", "Transportation"],
      download_count: 2100,
      rating: 4.8,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/multimodal-router.zip",
      github_url: "https://github.com/haritahive/multimodal-router",
      license: "Apache 2.0",
      is_featured: true,
      created_at: "2024-04-03"
    },
    {
      id: "32",
      title: "Traffic Flow Simulator",
      description: "Simulate traffic patterns and congestion using agent-based modeling and real traffic data.",
      category: "Transportation",
      tech_stack: ["Python", "SUMO", "OSMnx"],
      tags: ["Traffic", "Simulation", "Transportation"],
      download_count: 890,
      rating: 4.6,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/traffic-simulator.py",
      github_url: "https://github.com/haritahive/traffic-simulator",
      license: "MIT",
      is_featured: false,
      created_at: "2024-04-05"
    },

    // Mining & Geology
    {
      id: "33",
      title: "Geological Structure Mapper",
      description: "Identify and map geological structures, faults, and formations from DEM and imagery data.",
      category: "Geology",
      tech_stack: ["Python", "GDAL", "scikit-image"],
      tags: ["Geology", "Structure", "Mapping"],
      download_count: 670,
      rating: 4.7,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/geological-mapper.py",
      github_url: "https://github.com/haritahive/geological-mapper",
      license: "MIT",
      is_featured: false,
      created_at: "2024-04-08"
    },
    {
      id: "34",
      title: "Mineral Prospectivity Analyzer",
      description: "Analyze geological, geochemical, and geophysical data for mineral exploration targeting.",
      category: "Geology",
      tech_stack: ["Python", "scikit-learn", "GDAL"],
      tags: ["Mining", "Prospectivity", "ML & AI"],
      download_count: 540,
      rating: 4.5,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/mineral-prospectivity.zip",
      github_url: "https://github.com/haritahive/mineral-prospectivity",
      license: "Apache 2.0",
      is_featured: false,
      created_at: "2024-04-10"
    },

    // Climate & Weather
    {
      id: "35",
      title: "Climate Data Processor",
      description: "Process and analyze climate model outputs, weather station data, and reanalysis datasets.",
      category: "Climate",
      tech_stack: ["Python", "xarray", "NetCDF4"],
      tags: ["Climate", "Weather", "Data Processing"],
      download_count: 1230,
      rating: 4.8,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/climate-processor.py",
      github_url: "https://github.com/haritahive/climate-processor",
      license: "MIT",
      is_featured: false,
      created_at: "2024-04-12"
    },
    {
      id: "36",
      title: "Extreme Weather Detector",
      description: "Identify and track extreme weather events using satellite imagery and meteorological data.",
      category: "Climate",
      tech_stack: ["Python", "OpenCV", "TensorFlow"],
      tags: ["Weather", "Extreme Events", "Detection"],
      download_count: 980,
      rating: 4.7,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/weather-detector.zip",
      github_url: "https://github.com/haritahive/weather-detector",
      license: "BSD-3",
      is_featured: false,
      created_at: "2024-04-15"
    },

    // Maritime & Coastal
    {
      id: "37",
      title: "Coastal Erosion Monitor",
      description: "Monitor coastal changes and erosion patterns using multi-temporal satellite imagery.",
      category: "Coastal",
      tech_stack: ["Python", "GDAL", "OpenCV"],
      tags: ["Coastal", "Erosion", "Change Detection"],
      download_count: 780,
      rating: 4.6,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/coastal-erosion.py",
      github_url: "https://github.com/haritahive/coastal-erosion",
      license: "MIT",
      is_featured: false,
      created_at: "2024-04-18"
    },
    {
      id: "38",
      title: "Bathymetry Interpolator",
      description: "Generate high-resolution bathymetric surfaces from sparse depth soundings and sonar data.",
      category: "Coastal",
      tech_stack: ["Python", "SciPy", "GDAL"],
      tags: ["Bathymetry", "Marine", "Interpolation"],
      download_count: 450,
      rating: 4.4,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/bathymetry-interpolator.py",
      github_url: "https://github.com/haritahive/bathymetry-interpolator",
      license: "Apache 2.0",
      is_featured: false,
      created_at: "2024-04-20"
    },

    // Advanced Analytics
    {
      id: "39",
      title: "Spatial Deep Learning Framework",
      description: "Pre-trained models and tools for applying deep learning to geospatial data analysis.",
      category: "ML & AI",
      tech_stack: ["Python", "PyTorch", "torchgeo"],
      tags: ["Deep Learning", "ML & AI", "Framework"],
      download_count: 2450,
      rating: 4.9,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/spatial-deeplearning.zip",
      github_url: "https://github.com/haritahive/spatial-deeplearning",
      license: "MIT",
      is_featured: true,
      created_at: "2024-04-22"
    },
    {
      id: "40",
      title: "Time Series Analyzer",
      description: "Analyze temporal patterns in geospatial time series data with trend detection and forecasting.",
      category: "ML & AI",
      tech_stack: ["Python", "Prophet", "pandas"],
      tags: ["Time Series", "Forecasting", "Trends"],
      download_count: 1680,
      rating: 4.8,
      author: "HaritaHive Team",
      download_url: "https://haritahive.com/downloads/timeseries-analyzer.py",
      github_url: "https://github.com/haritahive/timeseries-analyzer",
      license: "BSD-3",
      is_featured: false,
      created_at: "2024-04-25"
    },

    // NEW HIGH-DEMAND TOOLS FOR GIS PROFESSIONALS

    // Data Cleanup & Preprocessing
    {
      id: "metadata-validator",
      title: "Metadata Validator",
      description: "Validates and auto-generates metadata for shapefiles, rasters, GeoJSON, etc. Ensures FGDC and ISO 19115 compliance.",
      category: "Data Processing",
      tech_stack: ["Python", "GDAL", "lxml"],
      tags: ["Data Processing", "Metadata", "Validation"],
      download_count: 1890,
      rating: 4.8,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/metadata-validator.zip",
      github_url: "https://github.com/haritahive/metadata-validator",
      license: "MIT",
      is_featured: false,
      created_at: "2024-05-01"
    },
    {
      id: "crs-fixer",
      title: "CRS Fixer",
      description: "Auto-detects & reprojects mismatched CRS in bulk datasets. Handles thousands of files with intelligent projection detection.",
      category: "Data Processing",
      tech_stack: ["Python", "pyproj", "GDAL"],
      tags: ["Data Processing", "CRS", "Batch Processing"],
      download_count: 2340,
      rating: 4.9,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/crs-fixer.zip",
      github_url: "https://github.com/haritahive/crs-fixer",
      license: "MIT",
      is_featured: true,
      created_at: "2024-05-02"
    },

    // Performance & File Management
    {
      id: "rasterfusion-pro",
      title: "Harita Hive RasterFusion Pro",
      description: "GPU-accelerated raster merger + tiler with CRS alignment. Industry flagship tool for massive dataset processing with CUDA acceleration.",
      category: "Performance",
      tech_stack: ["Python", "CUDA", "GDAL", "GPU"],
      tags: ["Performance", "GPU", "Raster", "Harita Signature"],
      download_count: 4200,
      rating: 4.9,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/rasterfusion-pro.zip",
      github_url: "https://github.com/haritahive/rasterfusion-pro",
      license: "MIT",
      is_featured: true,
      created_at: "2024-05-03",
      is_signature: true
    },
    {
      id: "geo-optimizer",
      title: "GeoOptimizer",
      description: "Compresses geospatial datasets (GeoTIFF, SHP, etc.) without quality loss. Reduces file sizes by 60-80% using advanced algorithms.",
      category: "Performance",
      tech_stack: ["Python", "GDAL", "LZ4"],
      tags: ["Performance", "Compression", "Optimization"],
      download_count: 1560,
      rating: 4.7,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/geo-optimizer.zip",
      github_url: "https://github.com/haritahive/geo-optimizer",
      license: "Apache 2.0",
      is_featured: false,
      created_at: "2024-05-04"
    },

    // AI-Powered Tools
    {
      id: "land-use-ai-classifier",
      title: "Harita Hive Land Use AI Classifier",
      description: "Uses a pretrained CNN to classify urban, agricultural, forest, water, etc. from imagery. 95%+ accuracy on standard benchmarks.",
      category: "ML & AI",
      tech_stack: ["Python", "TensorFlow", "OpenCV"],
      tags: ["ML & AI", "Land Use", "Classification", "Harita Signature"],
      download_count: 3450,
      rating: 4.9,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/land-use-ai-classifier.zip",
      github_url: "https://github.com/haritahive/land-use-ai-classifier",
      license: "MIT",
      is_featured: true,
      created_at: "2024-05-05",
      is_signature: true
    },
    {
      id: "geospatial-timeseries-forecaster",
      title: "Geospatial Time Series Forecaster",
      description: "ML-based prediction tool for NDVI, rainfall, or land temperature trends. Uses LSTM and Prophet models for accurate forecasting.",
      category: "ML & AI",
      tech_stack: ["Python", "TensorFlow", "Prophet"],
      tags: ["ML & AI", "Time Series", "Forecasting"],
      download_count: 2180,
      rating: 4.8,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/geospatial-timeseries-forecaster.zip",
      github_url: "https://github.com/haritahive/geospatial-timeseries-forecaster",
      license: "MIT",
      is_featured: true,
      created_at: "2024-05-06"
    },
    {
      id: "autoclust",
      title: "AutoClust",
      description: "AI-based clustering of spatial points (e.g., for utilities, crimes, or businesses). Automatically determines optimal cluster count.",
      category: "ML & AI",
      tech_stack: ["Python", "scikit-learn", "DBSCAN"],
      tags: ["ML & AI", "Clustering", "Spatial Analysis"],
      download_count: 1780,
      rating: 4.7,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/autoclust.zip",
      github_url: "https://github.com/haritahive/autoclust",
      license: "MIT",
      is_featured: false,
      created_at: "2024-05-07"
    },

    // Enterprise Integration Tools
    {
      id: "crm-gis-connector",
      title: "CRM–GIS Connector",
      description: "REST/GraphQL connector to sync GIS data with ERP/CRM systems like Salesforce or Zoho. Real-time bidirectional sync.",
      category: "Enterprise",
      tech_stack: ["Python", "REST API", "GraphQL"],
      tags: ["Enterprise", "CRM", "Integration"],
      download_count: 890,
      rating: 4.6,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/crm-gis-connector.zip",
      github_url: "https://github.com/haritahive/crm-gis-connector",
      license: "Apache 2.0",
      is_featured: false,
      created_at: "2024-05-08"
    },
    {
      id: "api-generator",
      title: "API Generator",
      description: "Auto-generates secure APIs for any uploaded geospatial file (GeoJSON, PostGIS, etc). Includes authentication and rate limiting.",
      category: "Enterprise",
      tech_stack: ["Python", "FastAPI", "PostGIS"],
      tags: ["Enterprise", "API", "Automation"],
      download_count: 1240,
      rating: 4.8,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/api-generator.zip",
      github_url: "https://github.com/haritahive/api-generator",
      license: "MIT",
      is_featured: false,
      created_at: "2024-05-09"
    },

    // Urban Planning / Infrastructure
    {
      id: "zoning-map-designer",
      title: "Zoning Map Designer",
      description: "Create zoning plans with overlays (commercial, green, residential). Interactive design with regulatory compliance checking.",
      category: "Urban Planning",
      tech_stack: ["Python", "QGIS", "PostGIS"],
      tags: ["Urban Planning", "Zoning", "Design"],
      download_count: 1450,
      rating: 4.7,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/zoning-map-designer.zip",
      github_url: "https://github.com/haritahive/zoning-map-designer",
      license: "MIT",
      is_featured: false,
      created_at: "2024-05-10"
    },
    {
      id: "buffer-heatmap-combo",
      title: "Buffer + Heatmap Combo",
      description: "Multi-buffer + live heatmap generator with export options. Combines spatial buffering with density visualization.",
      category: "Urban Planning",
      tech_stack: ["Python", "GDAL", "Matplotlib"],
      tags: ["Urban Planning", "Buffer", "Heatmap"],
      download_count: 1890,
      rating: 4.8,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/buffer-heatmap-combo.zip",
      github_url: "https://github.com/haritahive/buffer-heatmap-combo",
      license: "MIT",
      is_featured: false,
      created_at: "2024-05-11"
    },

    // Web GIS & Visualization
    {
      id: "tile-server-launcher",
      title: "Tile Server Launcher",
      description: "One-click server setup to host vector tiles or raster basemaps. Docker-based deployment with auto-scaling.",
      category: "Web GIS",
      tech_stack: ["Docker", "Node.js", "TileServer GL"],
      tags: ["Web GIS", "Tile Server", "Docker"],
      download_count: 2340,
      rating: 4.9,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/tile-server-launcher.zip",
      github_url: "https://github.com/haritahive/tile-server-launcher",
      license: "Apache 2.0",
      is_featured: true,
      created_at: "2024-05-12"
    },
    {
      id: "3d-terrain-viewer",
      title: "3D Terrain Viewer",
      description: "Real-time DEM/DTM viewer using CesiumJS or Deck.gl. Interactive 3D terrain with customizable lighting and materials.",
      category: "3D Visualization",
      tech_stack: ["JavaScript", "CesiumJS", "Deck.gl"],
      tags: ["3D", "Terrain", "Web Visualization"],
      download_count: 1780,
      rating: 4.8,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/3d-terrain-viewer.zip",
      github_url: "https://github.com/haritahive/3d-terrain-viewer",
      license: "MIT",
      is_featured: true,
      created_at: "2024-05-13"
    },
    {
      id: "osm-extractor",
      title: "OpenStreetMap Extractor",
      description: "Download OSM layers by bounding box or city name. Automated extraction with format conversion and filtering options.",
      category: "Data Download",
      tech_stack: ["Python", "OSMnx", "Overpass API"],
      tags: ["OpenStreetMap", "Data Download", "Extraction"],
      download_count: 2890,
      rating: 4.9,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/osm-extractor.zip",
      github_url: "https://github.com/haritahive/osm-extractor",
      license: "MIT",
      is_featured: true,
      created_at: "2024-05-14"
    },

    // Data Conversion & Cleaning
    {
      id: "shx-shp-repair-tool",
      title: "SHX/SHP Repair Tool",
      description: "Fix broken shapefiles, regenerate missing SHX/DBF files. Recovers corrupted spatial data with advanced repair algorithms.",
      category: "Data Conversion",
      tech_stack: ["Python", "GDAL", "Shapely"],
      tags: ["Data Conversion", "Repair", "Shapefile"],
      download_count: 1560,
      rating: 4.7,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/shx-shp-repair-tool.zip",
      github_url: "https://github.com/haritahive/shx-shp-repair-tool",
      license: "MIT",
      is_featured: false,
      created_at: "2024-05-15"
    },
    {
      id: "kml-geojson-csv-converter",
      title: "KML → GeoJSON → CSV Converter",
      description: "Drag-drop format transformer with metadata cleaner. Supports batch conversion with attribute mapping and validation.",
      category: "Data Conversion",
      tech_stack: ["Python", "GDAL", "pandas"],
      tags: ["Data Conversion", "KML", "GeoJSON", "CSV"],
      download_count: 2450,
      rating: 4.8,
      author: "Harita Hive",
      download_url: "https://haritahive.com/downloads/kml-geojson-csv-converter.zip",
      github_url: "https://github.com/haritahive/kml-geojson-csv-converter",
      license: "MIT",
      is_featured: true,
      created_at: "2024-05-16"
    }
  ];

  const categories = [
    "all", "Vector", "Raster", "Remote Sensing", "Spatial Analysis", 
    "Web GIS", "Data Conversion", "Urban Planning", "Disaster Management", 
    "ML & AI", "3D Visualization", "Geostatistics", "Agriculture", 
    "Environmental", "Transportation", "Geology", "Climate", "Coastal",
    "Data Processing", "Performance", "Enterprise", "Data Download"
  ];
  
  const techStack = [
    "all", "Python", "JavaScript", "QGIS", "GDAL", "Leaflet", "Mapbox GL", 
    "TensorFlow", "PyTorch", "scikit-learn", "NumPy", "OpenCV", "React", 
    "Three.js", "WebGL", "xarray", "NetCDF4"
  ];

  // Add state for tag filtering
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedLicense, setSelectedLicense] = useState("all");
  
  const allTags = [
    "all", "Vector", "Raster", "Remote Sensing", "ML & AI", "Web GIS", 
    "Spatial Analysis", "Urban Planning", "Disaster Management", "Data Conversion",
    "3D", "LiDAR", "Interpolation", "Statistics", "Agriculture", "Environmental",
    "Transportation", "Geology", "Climate", "Coastal"
  ];
  const licenses = ["all", "MIT", "Apache 2.0", "BSD-3"];

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || plugin.category === selectedCategory;
    const matchesTech = selectedTech === "all" || plugin.tech_stack.includes(selectedTech);
    const matchesTag = selectedTag === "all" || plugin.tags.includes(selectedTag);
    const matchesLicense = selectedLicense === "all" || plugin.license === selectedLicense;
    
    return matchesSearch && matchesCategory && matchesTech && matchesTag && matchesLicense;
  });

  const featuredPlugins = plugins.filter(p => p.is_featured);
  const totalDownloads = plugins.reduce((sum, p) => sum + p.download_count, 0);

  const handleUpgradeClick = () => {
    navigate("/premium");
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Access Gate for Non-Pro Users */}
        {!hasFullAccess && (
          <div className="mb-8">
            <Card className="border-primary bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Premium Feature</h3>
                      <p className="text-muted-foreground">
                        Plugin marketplace access requires Professional plan ($49/₹3999) or higher
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleUpgradeClick} className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">GIS Plugin Marketplace</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover, download, and share powerful GIS tools created by the community.
            {!hasFullAccess && (
              <span className="block mt-2 text-primary font-medium">
                Upgrade to Professional plan for full access
              </span>
            )}
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{plugins.length}</div>
                <div className="text-sm text-muted-foreground">Total Plugins</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{totalDownloads.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Downloads</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">4.8</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </CardContent>
            </Card>
          </div>

          <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                disabled={!hasFullAccess}
                onClick={hasFullAccess ? undefined : handleUpgradeClick}
              >
                {!hasFullAccess && <Lock className="h-5 w-5 mr-2" />}
                <Plus className="h-5 w-5 mr-2" />
                {hasFullAccess ? "Submit Your Plugin" : "Pro Required"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Plugin</DialogTitle>
              </DialogHeader>
              <PluginUploadForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search plugins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTech} onValueChange={setSelectedTech}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Technology" />
              </SelectTrigger>
              <SelectContent>
                {techStack.map(tech => (
                  <SelectItem key={tech} value={tech}>
                    {tech === "all" ? "All Technologies" : tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    {tag === "all" ? "All Tags" : tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLicense} onValueChange={setSelectedLicense}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="License" />
              </SelectTrigger>
              <SelectContent>
                {licenses.map(license => (
                  <SelectItem key={license} value={license}>
                    {license === "all" ? "All Licenses" : license}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("all")}>×</button>
              </Badge>
            )}
            {selectedTech !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tech: {selectedTech}
                <button onClick={() => setSelectedTech("all")}>×</button>
              </Badge>
            )}
            {selectedTag !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tag: {selectedTag}
                <button onClick={() => setSelectedTag("all")}>×</button>
              </Badge>
            )}
            {selectedLicense !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                License: {selectedLicense}
                <button onClick={() => setSelectedLicense("all")}>×</button>
              </Badge>
            )}
          </div>
        </div>

        {/* Featured Plugins */}
        {featuredPlugins.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-2xl font-bold">Featured Plugins</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPlugins.map(plugin => (
                <div key={plugin.id} className={!hasFullAccess ? "opacity-60" : ""}>
                  <PluginCard plugin={plugin} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Plugins */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Plugins ({filteredPlugins.length})</h2>
            <Select defaultValue="popular">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="downloads">Most Downloads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredPlugins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlugins.map(plugin => (
                <div key={plugin.id} className={!hasFullAccess ? "opacity-60" : ""}>
                  <PluginCard plugin={plugin} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No plugins found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PluginMarketplace;
