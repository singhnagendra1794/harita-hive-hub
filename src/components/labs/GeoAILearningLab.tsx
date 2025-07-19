import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Code2, 
  Download, 
  Copy, 
  Play, 
  FileText, 
  Database, 
  Globe, 
  Map,
  BarChart3,
  Satellite,
  Brain,
  Layers,
  CheckCircle,
  Crown,
  Terminal,
  Cpu,
  HardDrive,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CodeSample from './CodeSample';
import EnvironmentPanel from './EnvironmentPanel';
import DatasetDownloader from './DatasetDownloader';

const GeoAILearningLab = () => {
  const [activeTab, setActiveTab] = useState('python');
  const [activeCategory, setActiveCategory] = useState('vector');
  const { toast } = useToast();

  const categories = [
    { id: 'vector', name: 'Vector Data Processing', icon: Map },
    { id: 'raster', name: 'Raster Data Processing', icon: Layers },
    { id: 'ai', name: 'Geospatial AI & Analysis', icon: Brain },
    { id: 'remote-sensing', name: 'Remote Sensing', icon: Satellite },
    { id: 'statistics', name: 'Spatial Statistics & Joins', icon: BarChart3 },
    { id: 'database', name: 'Database Integration', icon: Database }
  ];

  const pythonSamples = {
    vector: [
      {
        title: 'Shapefile Analysis with GeoPandas',
        description: 'Load, analyze, and visualize vector data using GeoPandas',
        useCase: 'Analyzing urban land use patterns from municipal boundaries',
        code: `import geopandas as gpd
import matplotlib.pyplot as plt
import pandas as pd
from shapely.geometry import Point
import folium

# Load sample shapefile
gdf = gpd.read_file('data/urban_boundaries.shp')

# Basic statistics
print(f"Total features: {len(gdf)}")
print(f"CRS: {gdf.crs}")
print(f"Total area: {gdf.geometry.area.sum():.2f} sq units")

# Filter by area (keep only large urban areas)
large_areas = gdf[gdf.geometry.area > 1000]

# Calculate centroids
gdf['centroid'] = gdf.geometry.centroid

# Create buffer zones (500m around each boundary)
gdf['buffer'] = gdf.geometry.buffer(500)

# Visualize
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

# Original boundaries
gdf.plot(ax=ax1, color='blue', alpha=0.7)
ax1.set_title('Urban Boundaries')

# With buffers
gdf.plot(ax=ax2, color='blue', alpha=0.5)
gpd.GeoSeries(gdf['buffer']).plot(ax=ax2, color='red', alpha=0.3)
ax2.set_title('Boundaries with 500m Buffer')

plt.tight_layout()
plt.show()

# Export results
large_areas.to_file('results/large_urban_areas.shp')`,
        datasets: ['urban_boundaries.shp', 'land_use_polygons.geojson'],
        environments: {
          python: '3.9+',
          geopandas: '0.14.0',
          matplotlib: '3.7.0',
          shapely: '2.0.0'
        }
      },
      {
        title: 'Point Pattern Analysis',
        description: 'Analyze spatial distribution of point features',
        useCase: 'Crime hotspot analysis using nearest neighbor statistics',
        code: `import geopandas as gpd
import numpy as np
from scipy.spatial.distance import cdist
from sklearn.cluster import DBSCAN
import seaborn as sns

# Load crime incident points
crimes = gpd.read_file('data/crime_points.geojson')

# Extract coordinates
coords = np.column_stack([crimes.geometry.x, crimes.geometry.y])

# Nearest neighbor analysis
def nearest_neighbor_analysis(points):
    distances = cdist(points, points)
    np.fill_diagonal(distances, np.inf)
    nn_distances = np.min(distances, axis=1)
    
    mean_nn = np.mean(nn_distances)
    expected_nn = 0.5 * np.sqrt(len(points) / 
                               (crimes.total_bounds[2] - crimes.total_bounds[0]) *
                               (crimes.total_bounds[3] - crimes.total_bounds[1]))
    
    r_ratio = mean_nn / expected_nn
    return mean_nn, expected_nn, r_ratio

mean_nn, expected_nn, r_ratio = nearest_neighbor_analysis(coords)

print(f"Mean Nearest Neighbor Distance: {mean_nn:.2f}")
print(f"Expected Distance (Random): {expected_nn:.2f}")
print(f"R-ratio: {r_ratio:.2f}")

if r_ratio < 1:
    print("Pattern: CLUSTERED")
elif r_ratio > 1:
    print("Pattern: DISPERSED")
else:
    print("Pattern: RANDOM")

# DBSCAN clustering for hotspots
clustering = DBSCAN(eps=500, min_samples=5)
crimes['cluster'] = clustering.fit_predict(coords)

# Visualize clusters
fig, ax = plt.subplots(figsize=(12, 8))
scatter = crimes.plot(column='cluster', cmap='viridis', 
                     ax=ax, markersize=10, alpha=0.7)
ax.set_title('Crime Hotspot Clusters (DBSCAN)')
plt.show()

# Export hotspot analysis
hotspots = crimes[crimes['cluster'] != -1]
hotspots.to_file('results/crime_hotspots.geojson', driver='GeoJSON')`,
        datasets: ['crime_points.geojson', 'neighborhood_boundaries.shp'],
        environments: {
          python: '3.9+',
          geopandas: '0.14.0',
          scipy: '1.11.0',
          scikit_learn: '1.3.0'
        }
      }
    ],
    raster: [
      {
        title: 'Satellite Image Processing',
        description: 'Process and analyze multi-band satellite imagery',
        useCase: 'NDVI calculation from Landsat imagery for vegetation monitoring',
        code: `import rasterio
import rasterio.plot
import numpy as np
import matplotlib.pyplot as plt
from rasterio.mask import mask
import geopandas as gpd

# Load Landsat bands (Red: Band 4, NIR: Band 5)
with rasterio.open('data/landsat_red.tif') as red_band:
    red = red_band.read(1).astype(float)
    profile = red_band.profile

with rasterio.open('data/landsat_nir.tif') as nir_band:
    nir = nir_band.read(1).astype(float)

# Calculate NDVI: (NIR - Red) / (NIR + Red)
ndvi = np.divide(nir - red, nir + red, 
                out=np.zeros_like(nir), 
                where=(nir + red) != 0)

# Mask water and clouds (typically NDVI < 0)
ndvi_masked = np.where(ndvi < -0.1, np.nan, ndvi)

# Classification thresholds
def classify_vegetation(ndvi_array):
    classes = np.zeros_like(ndvi_array)
    classes[ndvi_array < 0.2] = 1  # Bare soil/water
    classes[(ndvi_array >= 0.2) & (ndvi_array < 0.5)] = 2  # Sparse vegetation
    classes[(ndvi_array >= 0.5) & (ndvi_array < 0.7)] = 3  # Moderate vegetation
    classes[ndvi_array >= 0.7] = 4  # Dense vegetation
    return classes

vegetation_classes = classify_vegetation(ndvi_masked)

# Visualize results
fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# Original RGB composite (if available)
axes[0,0].imshow(red, cmap='Reds', alpha=0.7)
axes[0,0].set_title('Red Band')

axes[0,1].imshow(nir, cmap='RdYlGn', alpha=0.7)
axes[0,1].set_title('NIR Band')

# NDVI
ndvi_plot = axes[1,0].imshow(ndvi_masked, cmap='RdYlGn', vmin=-1, vmax=1)
axes[1,0].set_title('NDVI')
plt.colorbar(ndvi_plot, ax=axes[1,0], fraction=0.046)

# Vegetation classification
class_plot = axes[1,1].imshow(vegetation_classes, cmap='Set3')
axes[1,1].set_title('Vegetation Classes')
plt.colorbar(class_plot, ax=axes[1,1], fraction=0.046)

plt.tight_layout()
plt.show()

# Calculate statistics
valid_ndvi = ndvi_masked[~np.isnan(ndvi_masked)]
print(f"Mean NDVI: {np.mean(valid_ndvi):.3f}")
print(f"Std NDVI: {np.std(valid_ndvi):.3f}")
print(f"Min NDVI: {np.min(valid_ndvi):.3f}")
print(f"Max NDVI: {np.max(valid_ndvi):.3f}")

# Save results
profile.update(dtype=rasterio.float32, count=1)
with rasterio.open('results/ndvi_result.tif', 'w', **profile) as dst:
    dst.write(ndvi_masked.astype(rasterio.float32), 1)`,
        datasets: ['landsat_red.tif', 'landsat_nir.tif', 'study_area.shp'],
        environments: {
          python: '3.9+',
          rasterio: '1.3.8',
          numpy: '1.24.0',
          matplotlib: '3.7.0'
        }
      }
    ],
    ai: [
      {
        title: 'Land Cover Classification with ML',
        description: 'Supervised classification of satellite imagery using Random Forest',
        useCase: 'Automated land cover mapping for urban planning',
        code: `import rasterio
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Load multi-band satellite image
with rasterio.open('data/multispectral_image.tif') as src:
    # Read all bands
    bands = src.read()  # Shape: (bands, height, width)
    profile = src.profile
    
# Reshape for ML (flatten spatial dimensions)
n_bands, height, width = bands.shape
bands_flat = bands.reshape(n_bands, -1).T  # Shape: (pixels, bands)

# Load training data (polygons with land cover labels)
training_data = gpd.read_file('data/training_polygons.shp')

# Extract training pixels
def extract_training_pixels(image_bands, training_polygons):
    from rasterio.features import rasterize
    
    X_train = []
    y_train = []
    
    for idx, row in training_polygons.iterrows():
        # Create mask for this polygon
        mask = rasterize(
            [(row.geometry, 1)], 
            out_shape=(height, width),
            transform=src.transform
        )
        
        # Extract pixel values within polygon
        mask_flat = mask.flatten()
        pixels = bands_flat[mask_flat == 1]
        labels = [row['class_id']] * len(pixels)
        
        X_train.extend(pixels)
        y_train.extend(labels)
    
    return np.array(X_train), np.array(y_train)

X_train, y_train = extract_training_pixels(bands, training_data)

# Train Random Forest classifier
X_train_split, X_test_split, y_train_split, y_test_split = train_test_split(
    X_train, y_train, test_size=0.3, random_state=42, stratify=y_train
)

# Initialize and train classifier
rf_classifier = RandomForestClassifier(
    n_estimators=100,
    max_depth=20,
    random_state=42,
    n_jobs=-1
)

rf_classifier.fit(X_train_split, y_train_split)

# Evaluate model
y_pred = rf_classifier.predict(X_test_split)
print("Classification Report:")
print(classification_report(y_test_split, y_pred))

# Feature importance
feature_names = [f'Band_{i+1}' for i in range(n_bands)]
importances = rf_classifier.feature_importances_
feature_importance_df = pd.DataFrame({
    'feature': feature_names,
    'importance': importances
}).sort_values('importance', ascending=False)

plt.figure(figsize=(10, 6))
sns.barplot(data=feature_importance_df, x='importance', y='feature')
plt.title('Feature Importance in Land Cover Classification')
plt.tight_layout()
plt.show()

# Classify entire image
classified_flat = rf_classifier.predict(bands_flat)
classified_image = classified_flat.reshape(height, width)

# Visualize results
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

# Original image (RGB if available)
if n_bands >= 3:
    rgb = np.dstack([bands[2], bands[1], bands[0]])  # Assuming bands 3,2,1 are RGB
    rgb_normalized = np.clip(rgb / np.percentile(rgb, 98), 0, 1)
    ax1.imshow(rgb_normalized)
ax1.set_title('Original Image')

# Classified image
class_plot = ax2.imshow(classified_image, cmap='Set3')
ax2.set_title('Land Cover Classification')
plt.colorbar(class_plot, ax=ax2)

plt.tight_layout()
plt.show()

# Save classification result
profile.update(dtype=rasterio.uint8, count=1)
with rasterio.open('results/land_cover_classification.tif', 'w', **profile) as dst:
    dst.write(classified_image.astype(rasterio.uint8), 1)

# Calculate area statistics
class_labels = {1: 'Water', 2: 'Urban', 3: 'Forest', 4: 'Agriculture', 5: 'Bare Land'}
pixel_size = abs(src.transform[0] * src.transform[4])  # in map units squared

area_stats = {}
for class_id, class_name in class_labels.items():
    pixel_count = np.sum(classified_image == class_id)
    area_km2 = (pixel_count * pixel_size) / 1000000  # Convert to km²
    area_stats[class_name] = area_km2

print("\\nArea Statistics (km²):")
for class_name, area in area_stats.items():
    print(f"{class_name}: {area:.2f} km²")`,
        datasets: ['multispectral_image.tif', 'training_polygons.shp'],
        environments: {
          python: '3.9+',
          rasterio: '1.3.8',
          scikit_learn: '1.3.0',
          pandas: '2.0.0'
        }
      }
    ]
  };

  const geeSamples = {
    vector: [
      {
        title: 'Administrative Boundary Analysis',
        description: 'Analyze administrative boundaries and calculate statistics',
        useCase: 'Population density analysis by administrative regions',
        code: `// Load administrative boundaries (example: US counties)
var counties = ee.FeatureCollection("TIGER/2018/Counties");

// Filter to specific state (example: California)
var california = counties.filter(ee.Filter.eq('STATEFP', '06'));

// Load population data
var population = ee.Image("JRC/GHSL/P2023A/GHS_POP/2020");

// Calculate population statistics for each county
var populationStats = population.reduceRegions({
  collection: california,
  reducer: ee.Reducer.sum().setOutputs(['total_population']),
  scale: 1000,
  maxPixels: 1e9
});

// Calculate area for population density
var withArea = populationStats.map(function(feature) {
  var area = feature.geometry().area().divide(1000000); // Convert to km²
  var pop = ee.Number(feature.get('total_population'));
  var density = pop.divide(area);
  
  return feature.set({
    'area_km2': area,
    'pop_density': density
  });
});

// Visualize population density
var populationVis = {
  min: 0,
  max: 1000,
  palette: ['white', 'yellow', 'orange', 'red', 'darkred']
};

Map.addLayer(withArea, {}, 'California Counties');
Map.addLayer(population.clip(california.geometry()), populationVis, 'Population Density');

// Center map on California
Map.centerObject(california, 6);

// Export results
Export.table.toDrive({
  collection: withArea,
  description: 'california_population_by_county',
  fileFormat: 'GeoJSON'
});

// Print statistics
print('Total counties:', california.size());
print('Sample county data:', withArea.limit(3));

// Create chart
var chart = ui.Chart.feature.byFeature({
  features: withArea.limit(10),
  xProperty: 'NAME',
  yProperties: ['pop_density']
}).setChartType('ColumnChart')
  .setOptions({
    title: 'Population Density by County (Top 10)',
    hAxis: {title: 'County'},
    vAxis: {title: 'Population per km²'},
    legend: {position: 'none'}
  });

print(chart);`,
        datasets: ['US_Counties.zip', 'Population_Grid.tif'],
        environments: {
          gee: 'JavaScript API',
          earth_engine: 'v0.1.370+',
          browser: 'Chrome/Firefox'
        }
      }
    ],
    raster: [
      {
        title: 'NDVI Time Series Analysis',
        description: 'Analyze vegetation changes over time using Landsat imagery',
        useCase: 'Agricultural monitoring and drought assessment',
        code: `// Define area of interest
var roi = ee.Geometry.Rectangle([-122.5, 37.5, -122.0, 38.0]); // San Francisco Bay Area

// Load Landsat 8 collection
var landsat8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterBounds(roi)
  .filterDate('2020-01-01', '2023-12-31')
  .filterMetadata('CLOUD_COVER', 'less_than', 20);

// Function to calculate NDVI and add date
var addNDVI = function(image) {
  var ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');
  return image.addBands(ndvi)
              .set('date', image.date().format('YYYY-MM-dd'));
};

// Apply NDVI calculation
var landsatNDVI = landsat8.map(addNDVI);

// Create monthly composites
var months = ee.List.sequence(1, 12);
var years = ee.List.sequence(2020, 2023);

var monthlyNDVI = ee.ImageCollection.fromImages(
  years.map(function(year) {
    return months.map(function(month) {
      var filtered = landsatNDVI
        .filter(ee.Filter.calendarRange(year, year, 'year'))
        .filter(ee.Filter.calendarRange(month, month, 'month'));
      
      var composite = filtered.median().clip(roi);
      
      return composite.select('NDVI')
        .set('year', year)
        .set('month', month)
        .set('date', ee.Date.fromYMD(year, month, 1));
    });
  }).flatten()
);

// Calculate NDVI statistics
var ndviStats = monthlyNDVI.map(function(image) {
  var stats = image.select('NDVI').reduceRegion({
    reducer: ee.Reducer.mean().combine({
      reducer2: ee.Reducer.stdDev(),
      sharedInputs: true
    }).combine({
      reducer2: ee.Reducer.minMax(),
      sharedInputs: true
    }),
    geometry: roi,
    scale: 30,
    maxPixels: 1e9
  });
  
  return ee.Feature(null, stats)
    .set('date', image.get('date'))
    .set('year', image.get('year'))
    .set('month', image.get('month'));
});

// Create time series chart
var chart = ui.Chart.feature.byFeature({
  features: ndviStats,
  xProperty: 'date',
  yProperties: ['NDVI_mean']
}).setChartType('LineChart')
  .setOptions({
    title: 'NDVI Time Series (2020-2023)',
    hAxis: {title: 'Date'},
    vAxis: {title: 'Mean NDVI'},
    lineWidth: 2,
    pointSize: 3,
    series: {
      0: {color: 'green'}
    }
  });

print(chart);

// Seasonal analysis
var seasons = ee.List([
  [12, 1, 2], // Winter
  [3, 4, 5],  // Spring
  [6, 7, 8],  // Summer
  [9, 10, 11] // Fall
]);

var seasonNames = ['Winter', 'Spring', 'Summer', 'Fall'];

var seasonalNDVI = seasons.map(function(seasonMonths, index) {
  var seasonal = monthlyNDVI
    .filter(ee.Filter.inList('month', seasonMonths))
    .mean()
    .set('season', seasonNames.get(index));
  
  return seasonal;
});

// Visualize seasonal NDVI
var ndviVis = {
  min: 0,
  max: 1,
  palette: ['brown', 'yellow', 'lightgreen', 'darkgreen']
};

Map.centerObject(roi, 10);

seasonNames.getInfo().forEach(function(season, index) {
  var seasonalImage = ee.Image(seasonalNDVI.get(index));
  Map.addLayer(seasonalImage.select('NDVI'), ndviVis, season + ' NDVI');
});

// Calculate trend analysis (linear regression)
var years_list = ee.List.sequence(2020, 2023);
var yearlyNDVI = years_list.map(function(year) {
  var annual = monthlyNDVI
    .filter(ee.Filter.eq('year', year))
    .mean()
    .set('year', year);
  return annual;
});

// Export time series data
Export.table.toDrive({
  collection: ndviStats,
  description: 'ndvi_time_series_stats',
  fileFormat: 'CSV'
});

print('Monthly NDVI Collection Size:', monthlyNDVI.size());
print('NDVI Statistics Sample:', ndviStats.limit(5));`,
        datasets: ['Landsat8_Collection.zip', 'AOI_Boundary.geojson'],
        environments: {
          gee: 'JavaScript API',
          earth_engine: 'v0.1.370+',
          landsat: 'Collection 2'
        }
      }
    ]
  };

  const postgisSamples = {
    database: [
      {
        title: 'Spatial Database Setup',
        description: 'Create and configure a spatial database with PostGIS',
        useCase: 'Setting up geospatial database for urban planning project',
        code: `-- Create database and enable PostGIS
CREATE DATABASE urban_planning;
\\c urban_planning;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify PostGIS installation
SELECT postgis_version();

-- Create spatial reference system table if needed
SELECT * FROM spatial_ref_sys WHERE srid = 4326;

-- Create main tables for urban planning
CREATE TABLE neighborhoods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    population INTEGER,
    area_km2 REAL,
    geom GEOMETRY(POLYGON, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE points_of_interest (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    address TEXT,
    geom GEOMETRY(POINT, 4326),
    neighborhood_id INTEGER REFERENCES neighborhoods(id)
);

CREATE TABLE transportation_network (
    id SERIAL PRIMARY KEY,
    street_name VARCHAR(100),
    road_type VARCHAR(50),
    speed_limit INTEGER,
    geom GEOMETRY(LINESTRING, 4326)
);

-- Create spatial indexes for performance
CREATE INDEX idx_neighborhoods_geom ON neighborhoods USING GIST(geom);
CREATE INDEX idx_poi_geom ON points_of_interest USING GIST(geom);
CREATE INDEX idx_transport_geom ON transportation_network USING GIST(geom);

-- Insert sample data
INSERT INTO neighborhoods (name, population, area_km2, geom) VALUES
('Downtown', 15000, 2.5, ST_GeomFromText('POLYGON((-122.42 37.77, -122.40 37.77, -122.40 37.79, -122.42 37.79, -122.42 37.77))', 4326)),
('Mission District', 45000, 8.2, ST_GeomFromText('POLYGON((-122.43 37.75, -122.40 37.75, -122.40 37.77, -122.43 37.77, -122.43 37.75))', 4326));

INSERT INTO points_of_interest (name, category, address, geom, neighborhood_id) VALUES
('City Hall', 'Government', '1 Dr Carlton B Goodlett Pl', ST_GeomFromText('POINT(-122.4194 37.7794)', 4326), 1),
('Mission Dolores Park', 'Recreation', '19th St & Dolores St', ST_GeomFromText('POINT(-122.4269 37.7596)', 4326), 2);

-- Create a view for neighborhood statistics
CREATE VIEW neighborhood_stats AS
SELECT 
    n.id,
    n.name,
    n.population,
    n.area_km2,
    ROUND((n.population / n.area_km2)::numeric, 2) as population_density,
    COUNT(p.id) as poi_count,
    ST_Area(ST_Transform(n.geom, 3857)) / 1000000 as area_calculated_km2
FROM neighborhoods n
LEFT JOIN points_of_interest p ON ST_Within(p.geom, n.geom)
GROUP BY n.id, n.name, n.population, n.area_km2, n.geom;

-- Test the setup
SELECT * FROM neighborhood_stats;`,
        datasets: ['neighborhood_boundaries.sql', 'poi_data.csv'],
        environments: {
          postgresql: '14+',
          postgis: '3.3+',
          geos: '3.11+',
          proj: '8.2+'
        }
      },
      {
        title: 'Advanced Spatial Queries',
        description: 'Complex spatial analysis with PostGIS functions',
        useCase: 'Finding optimal locations for new schools based on demographics',
        code: `-- School Site Selection Analysis
-- Find optimal locations for new schools based on multiple criteria

-- 1. Areas with high child population density
WITH child_population AS (
    SELECT 
        n.id,
        n.name,
        n.geom,
        n.population,
        -- Assume 15% of population are school-age children
        ROUND(n.population * 0.15) as estimated_children,
        ROUND((n.population * 0.15) / n.area_km2, 2) as child_density
    FROM neighborhoods n
    WHERE n.population > 5000
),

-- 2. Buffer analysis around existing schools
existing_schools AS (
    SELECT geom FROM points_of_interest 
    WHERE category = 'Education'
),

school_buffers AS (
    SELECT ST_Union(ST_Buffer(ST_Transform(geom, 3857), 1000)) as buffer_geom
    FROM existing_schools
),

-- 3. Areas not well-served by existing schools
underserved_areas AS (
    SELECT 
        cp.*,
        CASE 
            WHEN ST_Intersects(
                ST_Transform(cp.geom, 3857), 
                sb.buffer_geom
            ) THEN 'Served'
            ELSE 'Underserved'
        END as service_status
    FROM child_population cp
    CROSS JOIN school_buffers sb
),

-- 4. Accessibility analysis - distance to major roads
road_accessibility AS (
    SELECT 
        ua.id,
        ua.name,
        ua.child_density,
        ua.service_status,
        ua.geom,
        MIN(ST_Distance(
            ST_Transform(ua.geom, 3857),
            ST_Transform(tn.geom, 3857)
        )) as min_distance_to_road
    FROM underserved_areas ua
    CROSS JOIN transportation_network tn
    WHERE tn.road_type IN ('Primary', 'Secondary')
    GROUP BY ua.id, ua.name, ua.child_density, ua.service_status, ua.geom
),

-- 5. Parks and recreation proximity (bonus points)
recreation_proximity AS (
    SELECT 
        ra.id,
        ra.name,
        ra.child_density,
        ra.service_status,
        ra.min_distance_to_road,
        ra.geom,
        COUNT(p.id) as nearby_parks
    FROM road_accessibility ra
    LEFT JOIN points_of_interest p ON 
        p.category = 'Recreation' AND
        ST_DWithin(
            ST_Transform(ra.geom, 3857),
            ST_Transform(p.geom, 3857),
            2000  -- Within 2km
        )
    GROUP BY ra.id, ra.name, ra.child_density, ra.service_status, ra.min_distance_to_road, ra.geom
),

-- 6. Calculate suitability score
suitability_analysis AS (
    SELECT 
        *,
        -- Scoring algorithm (0-100 scale)
        ROUND(
            -- Child density weight (40%)
            (LEAST(child_density / 100, 1) * 40) +
            -- Underserved area bonus (30%)
            (CASE WHEN service_status = 'Underserved' THEN 30 ELSE 0 END) +
            -- Road accessibility (20%) - closer is better
            (GREATEST(0, (2000 - min_distance_to_road) / 2000) * 20) +
            -- Recreation proximity bonus (10%)
            (LEAST(nearby_parks / 5.0, 1) * 10)
        , 2) as suitability_score
    FROM recreation_proximity
)

-- Final results with recommendations
SELECT 
    name,
    child_density,
    service_status,
    ROUND(min_distance_to_road::numeric) as distance_to_road_m,
    nearby_parks,
    suitability_score,
    CASE 
        WHEN suitability_score >= 80 THEN 'Excellent'
        WHEN suitability_score >= 60 THEN 'Good'
        WHEN suitability_score >= 40 THEN 'Fair'
        ELSE 'Poor'
    END as recommendation_level,
    ST_AsText(ST_Centroid(geom)) as suggested_location
FROM suitability_analysis
WHERE service_status = 'Underserved'
ORDER BY suitability_score DESC;

-- Create optimal school locations as points
CREATE TABLE IF NOT EXISTS proposed_school_sites AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY suitability_score DESC) as site_id,
    name || ' School Site' as site_name,
    suitability_score,
    ST_Centroid(geom) as geom
FROM suitability_analysis
WHERE suitability_score >= 60
AND service_status = 'Underserved';

-- Voronoi diagram for school catchment areas
WITH school_points AS (
    SELECT geom FROM proposed_school_sites
    UNION ALL
    SELECT geom FROM points_of_interest WHERE category = 'Education'
)
SELECT 
    ROW_NUMBER() OVER() as catchment_id,
    (ST_Dump(ST_VoronoiPolygons(ST_Collect(geom)))).geom as catchment_geom
FROM school_points;`,
        datasets: ['demographics.sql', 'transportation.sql', 'existing_schools.sql'],
        environments: {
          postgresql: '14+',
          postgis: '3.3+',
          geos: '3.11+',
          spatial_indexes: 'GIST'
        }
      }
    ]
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied!",
      description: "Code has been copied to clipboard.",
    });
  };

  const handleDownloadDataset = (dataset: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${dataset}...`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">GeoAI Learning Lab</h1>
              <p className="text-xl text-muted-foreground mt-2">
                Interactive playground for geospatial AI, remote sensing, and spatial analysis
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <Badge variant="outline" className="gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Production Ready
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Code2 className="h-4 w-4" />
              Interactive Code
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Sample Datasets
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              Pro Features
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="python" className="gap-2">
                  <Code2 className="h-4 w-4" />
                  Python
                </TabsTrigger>
                <TabsTrigger value="gee" className="gap-2">
                  <Globe className="h-4 w-4" />
                  Google Earth Engine
                </TabsTrigger>
                <TabsTrigger value="postgis" className="gap-2">
                  <Database className="h-4 w-4" />
                  PostGIS
                </TabsTrigger>
              </TabsList>

              {/* Category Navigation */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <Button
                          key={category.id}
                          variant={activeCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveCategory(category.id)}
                          className="gap-2 h-12 flex-col"
                        >
                          <IconComponent className="h-4 w-4" />
                          <span className="text-xs">{category.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Python Tab */}
              <TabsContent value="python" className="space-y-6">
                {pythonSamples[activeCategory as keyof typeof pythonSamples]?.map((sample, index) => (
                  <CodeSample
                    key={index}
                    {...sample}
                    language="python"
                    onCopyCode={handleCopyCode}
                    onDownloadDataset={handleDownloadDataset}
                  />
                ))}
              </TabsContent>

              {/* Google Earth Engine Tab */}
              <TabsContent value="gee" className="space-y-6">
                {geeSamples[activeCategory as keyof typeof geeSamples]?.map((sample, index) => (
                  <CodeSample
                    key={index}
                    {...sample}
                    language="javascript"
                    onCopyCode={handleCopyCode}
                    onDownloadDataset={handleDownloadDataset}
                  />
                ))}
              </TabsContent>

              {/* PostGIS Tab */}
              <TabsContent value="postgis" className="space-y-6">
                {postgisSamples[activeCategory as keyof typeof postgisSamples]?.map((sample, index) => (
                  <CodeSample
                    key={index}
                    {...sample}
                    language="sql"
                    onCopyCode={handleCopyCode}
                    onDownloadDataset={handleDownloadDataset}
                  />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <EnvironmentPanel activeTab={activeTab} />
            <DatasetDownloader />
            
            {/* Professional Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Professional Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Upload custom datasets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Live code execution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Advanced ML models</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Cloud compute access</span>
                  </div>
                </div>
                <Button className="w-full gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoAILearningLab;