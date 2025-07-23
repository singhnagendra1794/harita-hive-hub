import { SpatialTool } from '@/pages/SpatialAnalysisLab';

export const spatialTools: SpatialTool[] = [
  // BASIC TOOLS
  {
    id: 'buffer-analysis',
    name: 'Buffer Analysis',
    description: 'Creates buffer zones around point, line, or polygon features at specified distances',
    category: 'basic',
    difficulty: 'beginner',
    platforms: ['qgis', 'arcgis', 'python', 'r', 'web'],
    inputTypes: ['Vector (Point, Line, Polygon)'],
    outputType: 'Vector (Polygon)',
    processingTime: '< 1 minute',
    tags: ['proximity', 'spatial-analysis', 'buffer', 'distance'],
    useCases: [
      'Find all areas within 500m of schools',
      'Create noise buffer zones around airports',
      'Determine catchment areas for services',
      'Identify protected zones around water bodies'
    ],
    parameters: [
      {
        name: 'Distance',
        type: 'number',
        default: 100,
        description: 'Buffer distance in map units'
      },
      {
        name: 'Segments',
        type: 'number',
        default: 5,
        description: 'Number of segments to approximate curves'
      },
      {
        name: 'End Cap Style',
        type: 'select',
        default: 'Round',
        options: ['Round', 'Flat', 'Square'],
        description: 'Style of buffer end caps'
      },
      {
        name: 'Dissolve Result',
        type: 'boolean',
        default: false,
        description: 'Merge overlapping buffers'
      }
    ],
    codeSnippet: {
      python: `import geopandas as gpd

# Load data
gdf = gpd.read_file('input.shp')

# Create buffer (distance in map units)
buffered = gdf.buffer(distance=100)

# Save result
buffered.to_file('output_buffer.shp')`,
      r: `library(sf)

# Load data
data <- st_read("input.shp")

# Create buffer
buffered <- st_buffer(data, dist = 100)

# Save result
st_write(buffered, "output_buffer.shp")`
    },
    stats: {
      downloads: 15420,
      rating: 4.8,
      reviews: 234
    }
  },
  {
    id: 'clip-analysis',
    name: 'Clip Analysis',
    description: 'Extracts portions of features that fall within a specified boundary area',
    category: 'basic',
    difficulty: 'beginner',
    platforms: ['qgis', 'arcgis', 'python', 'r', 'web'],
    inputTypes: ['Vector/Raster', 'Clipping Boundary'],
    outputType: 'Vector/Raster',
    processingTime: '< 2 minutes',
    tags: ['clip', 'extract', 'boundary', 'subset'],
    useCases: [
      'Extract data for a specific administrative area',
      'Clip satellite imagery to study area',
      'Extract road network within city boundaries',
      'Subset data for focused analysis'
    ],
    parameters: [
      {
        name: 'Clip Layer',
        type: 'text',
        default: '',
        description: 'Layer to use as clipping boundary'
      },
      {
        name: 'Keep Attributes',
        type: 'boolean',
        default: true,
        description: 'Preserve original attributes'
      }
    ],
    stats: {
      downloads: 12800,
      rating: 4.7,
      reviews: 189
    }
  },
  {
    id: 'intersect-analysis',
    name: 'Intersect Analysis',
    description: 'Finds overlapping areas between two or more spatial datasets',
    category: 'basic',
    difficulty: 'beginner',
    platforms: ['qgis', 'arcgis', 'python', 'r', 'web'],
    inputTypes: ['Vector (Polygon)', 'Vector (Polygon)'],
    outputType: 'Vector (Polygon)',
    processingTime: '< 3 minutes',
    tags: ['intersect', 'overlay', 'overlap', 'spatial-join'],
    useCases: [
      'Find areas where land use intersects with flood zones',
      'Identify overlapping administrative boundaries',
      'Determine areas suitable for development',
      'Analyze environmental impacts'
    ],
    stats: {
      downloads: 9650,
      rating: 4.6,
      reviews: 156
    }
  },

  // ADVANCED TOOLS
  {
    id: 'hotspot-analysis',
    name: 'Hotspot Analysis (Getis-Ord)',
    description: 'Identifies statistically significant spatial clusters of high and low values',
    category: 'advanced',
    difficulty: 'intermediate',
    platforms: ['qgis', 'arcgis', 'python', 'r'],
    inputTypes: ['Vector (Point/Polygon)'],
    outputType: 'Vector with Z-scores',
    processingTime: '2-5 minutes',
    tags: ['hotspot', 'clustering', 'statistical', 'getis-ord', 'spatial-autocorrelation'],
    useCases: [
      'Identify crime hotspots in urban areas',
      'Detect disease outbreak clusters',
      'Find high-density commercial areas',
      'Analyze traffic accident patterns'
    ],
    parameters: [
      {
        name: 'Analysis Field',
        type: 'text',
        default: '',
        description: 'Numeric field to analyze for clustering'
      },
      {
        name: 'Conceptualization',
        type: 'select',
        default: 'INVERSE_DISTANCE',
        options: ['INVERSE_DISTANCE', 'FIXED_DISTANCE', 'K_NEAREST_NEIGHBORS'],
        description: 'Method for defining spatial relationships'
      },
      {
        name: 'Distance Band',
        type: 'number',
        default: 1000,
        description: 'Distance threshold for spatial relationships'
      }
    ],
    codeSnippet: {
      python: `from pysal.lib import weights
from esda.getisord import G_Local
import geopandas as gpd

# Load data
gdf = gpd.read_file('data.shp')

# Create spatial weights
w = weights.Queen.from_dataframe(gdf)

# Calculate Getis-Ord G* statistic
g = G_Local(gdf['value'], w)

# Add results to dataframe
gdf['G_stat'] = g.Gs
gdf['p_value'] = g.p_sim`,
      r: `library(spdep)
library(sf)

# Load data
data <- st_read("data.shp")

# Create neighbors
nb <- poly2nb(data)
lw <- nb2listw(nb)

# Calculate Getis-Ord G*
gi_star <- localG(data$value, lw)

# Add to data
data$gi_star <- as.numeric(gi_star)`
    },
    stats: {
      downloads: 7890,
      rating: 4.5,
      reviews: 98
    }
  },
  {
    id: 'ndvi-calculation',
    name: 'NDVI Calculation',
    description: 'Calculates Normalized Difference Vegetation Index from satellite imagery',
    category: 'advanced',
    difficulty: 'intermediate',
    platforms: ['qgis', 'arcgis', 'python', 'r', 'web'],
    inputTypes: ['Raster (Red Band)', 'Raster (NIR Band)'],
    outputType: 'Raster (-1 to 1)',
    processingTime: '1-3 minutes',
    tags: ['vegetation', 'ndvi', 'remote-sensing', 'satellite', 'agriculture'],
    useCases: [
      'Monitor crop health and growth',
      'Assess forest cover changes',
      'Detect drought stress in vegetation',
      'Plan irrigation and fertilization'
    ],
    sector: 'agriculture',
    parameters: [
      {
        name: 'Red Band',
        type: 'text',
        default: 'band_3',
        description: 'Red band identifier'
      },
      {
        name: 'NIR Band',
        type: 'text',
        default: 'band_4',
        description: 'Near-infrared band identifier'
      },
      {
        name: 'Output Range',
        type: 'select',
        default: '-1 to 1',
        options: ['-1 to 1', '0 to 255'],
        description: 'Output value range'
      }
    ],
    codeSnippet: {
      python: `import rasterio
import numpy as np

# Read bands
with rasterio.open('red_band.tif') as red:
    red_data = red.read(1).astype(float)
    
with rasterio.open('nir_band.tif') as nir:
    nir_data = nir.read(1).astype(float)

# Calculate NDVI
ndvi = (nir_data - red_data) / (nir_data + red_data)

# Handle division by zero
ndvi = np.where((nir_data + red_data) == 0, 0, ndvi)`,
      r: `library(raster)

# Read bands
red <- raster("red_band.tif")
nir <- raster("nir_band.tif")

# Calculate NDVI
ndvi <- (nir - red) / (nir + red)

# Save result
writeRaster(ndvi, "ndvi_output.tif")`
    },
    stats: {
      downloads: 11230,
      rating: 4.7,
      reviews: 167
    }
  },
  {
    id: 'viewshed-analysis',
    name: 'Viewshed Analysis',
    description: 'Determines areas visible from specific observation points using elevation data',
    category: 'advanced',
    difficulty: 'advanced',
    platforms: ['qgis', 'arcgis', 'python', 'r'],
    inputTypes: ['DEM (Raster)', 'Observer Points (Vector)'],
    outputType: 'Raster (Visible/Not Visible)',
    processingTime: '3-10 minutes',
    tags: ['viewshed', 'visibility', 'line-of-sight', 'terrain', 'dem'],
    useCases: [
      'Cell tower placement optimization',
      'Scenic route planning',
      'Security camera coverage analysis',
      'Wind turbine visual impact assessment'
    ],
    sector: 'telecom',
    parameters: [
      {
        name: 'Observer Height',
        type: 'number',
        default: 1.75,
        description: 'Height of observer above ground (meters)'
      },
      {
        name: 'Target Height',
        type: 'number',
        default: 0,
        description: 'Height of target objects (meters)'
      },
      {
        name: 'Maximum Distance',
        type: 'number',
        default: 10000,
        description: 'Maximum viewing distance (meters)'
      }
    ],
    stats: {
      downloads: 5670,
      rating: 4.4,
      reviews: 73
    }
  },

  // EXPERT TOOLS
  {
    id: 'object-detection-yolo',
    name: 'Object Detection (YOLO)',
    description: 'AI-powered detection of buildings, roads, and other features from satellite imagery',
    category: 'expert',
    difficulty: 'expert',
    platforms: ['python', 'web'],
    inputTypes: ['Satellite Imagery (RGB)'],
    outputType: 'Vector (Polygons) + Confidence Scores',
    processingTime: '5-20 minutes',
    tags: ['ai', 'machine-learning', 'object-detection', 'yolo', 'deep-learning'],
    useCases: [
      'Automated building footprint extraction',
      'Road network mapping from imagery',
      'Vehicle counting and tracking',
      'Infrastructure damage assessment'
    ],
    parameters: [
      {
        name: 'Model Type',
        type: 'select',
        default: 'YOLOv8',
        options: ['YOLOv5', 'YOLOv8', 'YOLOv9'],
        description: 'YOLO model version'
      },
      {
        name: 'Confidence Threshold',
        type: 'number',
        default: 0.5,
        description: 'Minimum confidence score (0-1)'
      },
      {
        name: 'Object Classes',
        type: 'select',
        default: 'all',
        options: ['all', 'buildings', 'roads', 'vehicles', 'custom'],
        description: 'Types of objects to detect'
      }
    ],
    codeSnippet: {
      python: `from ultralytics import YOLO
import cv2

# Load pre-trained model
model = YOLO('yolov8n.pt')

# Load image
image = cv2.imread('satellite_image.jpg')

# Run inference
results = model(image, conf=0.5)

# Process results
for result in results:
    boxes = result.boxes
    for box in boxes:
        # Extract coordinates and confidence
        x1, y1, x2, y2 = box.xyxy[0]
        confidence = box.conf[0]
        class_id = box.cls[0]`
    },
    stats: {
      downloads: 3240,
      rating: 4.3,
      reviews: 45
    }
  },
  {
    id: 'random-forest-classifier',
    name: 'Random Forest Land Cover Classifier',
    description: 'Machine learning-based supervised classification for land cover mapping',
    category: 'expert',
    difficulty: 'expert',
    platforms: ['python', 'r'],
    inputTypes: ['Multi-band Imagery', 'Training Samples'],
    outputType: 'Classified Raster',
    processingTime: '10-30 minutes',
    tags: ['machine-learning', 'classification', 'random-forest', 'land-cover', 'supervised'],
    useCases: [
      'Land cover and land use mapping',
      'Change detection analysis',
      'Habitat classification',
      'Crop type identification'
    ],
    sector: 'environment',
    parameters: [
      {
        name: 'Number of Trees',
        type: 'number',
        default: 100,
        description: 'Number of trees in the forest'
      },
      {
        name: 'Max Depth',
        type: 'number',
        default: 10,
        description: 'Maximum depth of trees'
      },
      {
        name: 'Training Split',
        type: 'number',
        default: 0.7,
        description: 'Proportion of data for training (0-1)'
      }
    ],
    codeSnippet: {
      python: `from sklearn.ensemble import RandomForestClassifier
import rasterio
import numpy as np

# Load training data
with rasterio.open('multispectral.tif') as src:
    bands = src.read()
    
# Prepare training data
X_train, y_train = prepare_training_data()

# Train Random Forest model
rf = RandomForestClassifier(n_estimators=100, max_depth=10)
rf.fit(X_train, y_train)

# Classify image
classified = rf.predict(bands.reshape(-1, bands.shape[0]))
classified = classified.reshape(bands.shape[1:])`,
      r: `library(randomForest)
library(raster)

# Load data
imagery <- stack("multispectral.tif")
training <- read.csv("training_data.csv")

# Train model
rf_model <- randomForest(class ~ ., data=training, ntree=100)

# Classify
classified <- predict(imagery, rf_model, type="response")`
    },
    stats: {
      downloads: 2890,
      rating: 4.6,
      reviews: 38
    }
  },
  {
    id: 'kriging-interpolation',
    name: 'Kriging Interpolation',
    description: 'Advanced geostatistical interpolation method for spatial prediction',
    category: 'expert',
    difficulty: 'expert',
    platforms: ['qgis', 'arcgis', 'python', 'r'],
    inputTypes: ['Point Data with Values'],
    outputType: 'Interpolated Raster Surface',
    processingTime: '2-8 minutes',
    tags: ['interpolation', 'kriging', 'geostatistics', 'spatial-prediction', 'variogram'],
    useCases: [
      'Rainfall surface interpolation',
      'Soil property mapping',
      'Air quality surface modeling',
      'Groundwater level prediction'
    ],
    parameters: [
      {
        name: 'Kriging Type',
        type: 'select',
        default: 'Ordinary',
        options: ['Ordinary', 'Simple', 'Universal', 'Indicator'],
        description: 'Type of kriging method'
      },
      {
        name: 'Variogram Model',
        type: 'select',
        default: 'Spherical',
        options: ['Spherical', 'Exponential', 'Gaussian', 'Linear'],
        description: 'Variogram model type'
      },
      {
        name: 'Grid Resolution',
        type: 'number',
        default: 100,
        description: 'Output grid cell size'
      }
    ],
    stats: {
      downloads: 1950,
      rating: 4.2,
      reviews: 28
    }
  },

  // SECTOR-SPECIFIC TOOLS
  {
    id: 'flood-risk-mapping',
    name: 'Flood Risk Mapping',
    description: 'Comprehensive flood hazard assessment using DEM, rainfall, and flow data',
    category: 'sector-specific',
    sector: 'disaster-management',
    difficulty: 'advanced',
    platforms: ['qgis', 'arcgis', 'python', 'r'],
    inputTypes: ['DEM', 'Rainfall Data', 'River Network'],
    outputType: 'Flood Risk Zones',
    processingTime: '15-45 minutes',
    tags: ['flood', 'disaster', 'risk-assessment', 'hydrology', 'emergency-planning'],
    useCases: [
      'Emergency evacuation planning',
      'Insurance risk assessment',
      'Land use planning and zoning',
      'Infrastructure vulnerability analysis'
    ],
    parameters: [
      {
        name: 'Return Period',
        type: 'select',
        default: '100-year',
        options: ['10-year', '25-year', '50-year', '100-year', '500-year'],
        description: 'Flood return period'
      },
      {
        name: 'Manning Coefficient',
        type: 'number',
        default: 0.035,
        description: 'Surface roughness coefficient'
      }
    ],
    stats: {
      downloads: 4320,
      rating: 4.5,
      reviews: 67
    }
  },
  {
    id: 'urban-heat-island',
    name: 'Urban Heat Island Mapper',
    description: 'Identifies and maps urban heat island effects using thermal satellite data',
    category: 'sector-specific',
    sector: 'urban-planning',
    difficulty: 'advanced',
    platforms: ['qgis', 'python', 'r', 'web'],
    inputTypes: ['Thermal Satellite Imagery', 'Land Cover Data'],
    outputType: 'Temperature Anomaly Map',
    processingTime: '8-15 minutes',
    tags: ['urban-heat', 'thermal', 'climate', 'temperature', 'urban-planning'],
    useCases: [
      'Urban climate analysis',
      'Green space planning',
      'Energy efficiency planning',
      'Public health assessments'
    ],
    stats: {
      downloads: 2760,
      rating: 4.4,
      reviews: 42
    }
  },
  {
    id: 'crop-health-classifier',
    name: 'Crop Health Classifier',
    description: 'AI-powered assessment of crop health using multispectral imagery and vegetation indices',
    category: 'sector-specific',
    sector: 'agriculture',
    difficulty: 'advanced',
    platforms: ['python', 'r', 'web'],
    inputTypes: ['Multispectral Imagery', 'Field Boundaries'],
    outputType: 'Crop Health Classification',
    processingTime: '10-25 minutes',
    tags: ['agriculture', 'crop-health', 'ndvi', 'multispectral', 'precision-farming'],
    useCases: [
      'Precision agriculture management',
      'Yield prediction and optimization',
      'Pest and disease detection',
      'Irrigation planning'
    ],
    parameters: [
      {
        name: 'Health Threshold',
        type: 'number',
        default: 0.6,
        description: 'NDVI threshold for healthy vegetation'
      },
      {
        name: 'Growth Stage',
        type: 'select',
        default: 'vegetative',
        options: ['seedling', 'vegetative', 'flowering', 'maturity'],
        description: 'Crop growth stage'
      }
    ],
    stats: {
      downloads: 3680,
      rating: 4.6,
      reviews: 54
    }
  },
  {
    id: 'cell-tower-coverage',
    name: 'Cell Tower Coverage Analysis',
    description: 'Calculates cellular network coverage areas considering terrain and signal propagation',
    category: 'sector-specific',
    sector: 'telecom',
    difficulty: 'advanced',
    platforms: ['qgis', 'arcgis', 'python'],
    inputTypes: ['Tower Locations', 'DEM', 'Land Cover'],
    outputType: 'Coverage Zones with Signal Strength',
    processingTime: '5-12 minutes',
    tags: ['telecom', 'coverage', 'signal-strength', 'network-planning', 'telecommunications'],
    useCases: [
      'Network coverage optimization',
      'New tower site selection',
      'Signal quality assessment',
      'Infrastructure planning'
    ],
    parameters: [
      {
        name: 'Frequency Band',
        type: 'select',
        default: '2.4 GHz',
        options: ['800 MHz', '1.8 GHz', '2.4 GHz', '5 GHz'],
        description: 'Operating frequency'
      },
      {
        name: 'Transmit Power',
        type: 'number',
        default: 40,
        description: 'Transmitter power (dBm)'
      },
      {
        name: 'Antenna Height',
        type: 'number',
        default: 30,
        description: 'Antenna height above ground (meters)'
      }
    ],
    stats: {
      downloads: 1890,
      rating: 4.3,
      reviews: 29
    }
  }
];

// Helper functions for filtering
export const getUniqueCategories = () => {
  return [...new Set(spatialTools.map(tool => tool.category))];
};

export const getUniqueSectors = () => {
  return [...new Set(spatialTools.map(tool => tool.sector).filter(Boolean))];
};

export const getUniqueDifficulties = () => {
  return [...new Set(spatialTools.map(tool => tool.difficulty))];
};

export const getUniquePlatforms = () => {
  const platforms = spatialTools.flatMap(tool => tool.platforms);
  return [...new Set(platforms)];
};

export const getToolsByCategory = (category: string) => {
  return spatialTools.filter(tool => tool.category === category);
};

export const getToolsBySector = (sector: string) => {
  return spatialTools.filter(tool => tool.sector === sector);
};