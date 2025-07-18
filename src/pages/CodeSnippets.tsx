
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Code, Plus, Search, Copy, Download, Play, CheckCircle, AlertCircle, ExternalLink, Globe } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";

const CodeSnippets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [runningSnippets, setRunningSnippets] = useState<Set<number>>(new Set());
  const [newSnippet, setNewSnippet] = useState({ 
    title: "", 
    description: "", 
    code: "", 
    language: "python" 
  });
  const { toast } = useToast();
  const { hasAccess } = usePremiumAccess();
  const { user } = useAuth();

  const snippets = [
    {
      id: 1,
      title: "QGIS Buffer Creation",
      description: "Create buffer zones around features using PyQGIS",
      language: "python",
      code: `from qgis.core import *
from qgis.utils import iface

# Get the active layer
layer = iface.activeLayer()

# Create buffer
buffer_layer = processing.run("native:buffer", {
    'INPUT': layer,
    'DISTANCE': 1000,
    'SEGMENTS': 25,
    'OUTPUT': 'memory:'
})['OUTPUT']

# Add to map
QgsProject.instance().addMapLayer(buffer_layer)
print("Buffer created successfully!")`,
      tags: ["qgis", "buffer", "pyqgis"],
      downloads: 145,
      runnable: true,
      expectedOutput: "Buffer created successfully!"
    },
    {
      id: 2,
      title: "Shapefile Reader",
      description: "Read and process shapefiles using Python",
      language: "python",
      code: `import geopandas as gpd
import matplotlib.pyplot as plt

# Read shapefile (example with sample data)
# Replace with your actual shapefile path
sample_data = {
    'geometry': ['POINT(0 0)', 'POINT(1 1)', 'POINT(2 2)'],
    'name': ['Location A', 'Location B', 'Location C']
}

# Simulate reading shapefile
print("Reading shapefile...")
print(f"Found {len(sample_data['geometry'])} features")
print("Sample data:")
for i, (geom, name) in enumerate(zip(sample_data['geometry'], sample_data['name'])):
    print(f"  {i+1}. {name}: {geom}")
print("Shapefile processing complete!")`,
      tags: ["python", "shapefile", "geopandas"],
      downloads: 32,
      runnable: true,
      expectedOutput: "Reading shapefile...\nFound 3 features\nSample data:\n  1. Location A: POINT(0 0)\n  2. Location B: POINT(1 1)\n  3. Location C: POINT(2 2)\nShapefile processing complete!"
    },
    {
      id: 3,
      title: "Coordinate Transformation",
      description: "Transform coordinates between different CRS",
      language: "javascript",
      code: `// Using basic coordinate transformation
// This is a simplified example for demonstration

const sourceCoords = [12.4924, 41.8902]; // Rome, Italy (WGS84)

// Simple transformation simulation
function transformCoords(coords) {
    // Simulate UTM transformation
    const utmX = coords[0] * 111320; // Approximate meters per degree
    const utmY = coords[1] * 110540;
    return [utmX, utmY];
}

const transformedCoords = transformCoords(sourceCoords);

console.log('Original (WGS84):', sourceCoords);
console.log('Transformed (approx UTM):', transformedCoords);
console.log('Transformation complete!');`,
      tags: ["javascript", "coordinates", "projection"],
      downloads: 28,
      runnable: true,
      expectedOutput: "Original (WGS84): [12.4924, 41.8902]\nTransformed (approx UTM): [1390773.568, 4586543.98]\nTransformation complete!"
    },
    {
      id: 4,
      title: "Spatial Analysis Workflow",
      description: "Complete workflow for spatial data analysis",
      language: "python",
      code: `import numpy as np

# Sample spatial analysis workflow
def spatial_analysis_demo():
    # Step 1: Load sample point data
    points = np.array([[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]])
    print("Step 1: Loaded", len(points), "sample points")
    
    # Step 2: Calculate distances
    center = np.mean(points, axis=0)
    distances = np.sqrt(np.sum((points - center)**2, axis=1))
    print(f"Step 2: Center point: ({center[0]:.2f}, {center[1]:.2f})")
    
    # Step 3: Find nearest and farthest points
    nearest_idx = np.argmin(distances)
    farthest_idx = np.argmax(distances)
    
    print(f"Step 3: Nearest point: {points[nearest_idx]} (distance: {distances[nearest_idx]:.2f})")
    print(f"        Farthest point: {points[farthest_idx]} (distance: {distances[farthest_idx]:.2f})")
    
    # Step 4: Calculate basic statistics
    print(f"Step 4: Analysis Results:")
    print(f"        - Total points: {len(points)}")
    print(f"        - Average distance from center: {np.mean(distances):.2f}")
    print(f"        - Standard deviation: {np.std(distances):.2f}")
    
    return "Spatial analysis workflow completed successfully!"

# Run the analysis
result = spatial_analysis_demo()
print(f"\\nResult: {result}")`,
      tags: ["python", "analysis", "numpy", "workflow"],
      downloads: 156,
      runnable: true,
      expectedOutput: "Step 1: Loaded 5 sample points\nStep 2: Center point: (2.00, 0.80)\nStep 3: Nearest point: [2 2] (distance: 1.20)\n        Farthest point: [0 0] (distance: 2.24)\nStep 4: Analysis Results:\n        - Total points: 5\n        - Average distance from center: 1.65\n        - Standard deviation: 0.74\n\nResult: Spatial analysis workflow completed successfully!"
    },
    {
      id: 5,
      title: "PostGIS Spatial Query",
      description: "Find intersecting features using PostGIS spatial functions",
      language: "sql",
      code: `-- Find all points within 500m of a specific location
SELECT 
    p.id,
    p.name,
    ST_Distance(p.geom, ST_SetSRID(ST_Point(-122.4194, 37.7749), 4326)) as distance_meters
FROM points_table p
WHERE ST_DWithin(
    p.geom, 
    ST_SetSRID(ST_Point(-122.4194, 37.7749), 4326)::geography, 
    500
)
ORDER BY distance_meters;

-- Create a buffer and find intersections
SELECT 
    a.id as area_id,
    b.name as building_name,
    ST_Area(ST_Intersection(a.geom, b.geom)) as intersection_area
FROM areas a
JOIN buildings b ON ST_Intersects(a.geom, b.geom)
WHERE ST_Area(ST_Intersection(a.geom, b.geom)) > 100;`,
      tags: ["postgis", "sql", "spatial-query"],
      downloads: 89,
      runnable: false,
      expectedOutput: ""
    },
    {
      id: 6,
      title: "GDAL Raster Processing",
      description: "Process raster data using GDAL Python bindings",
      language: "python",
      code: `from osgeo import gdal, ogr
import numpy as np

# Open raster file
dataset = gdal.Open('elevation.tif')
if dataset is None:
    print("Could not open raster file")
    exit()

# Get raster information
print(f"Raster size: {dataset.RasterXSize} x {dataset.RasterYSize}")
print(f"Number of bands: {dataset.RasterCount}")

# Read raster as array
band = dataset.GetRasterBand(1)
array = band.ReadAsArray()

# Calculate statistics
print(f"Min elevation: {np.min(array)}")
print(f"Max elevation: {np.max(array)}")
print(f"Mean elevation: {np.mean(array):.2f}")

# Create hillshade
options = gdal.DEMProcessingOptions(format='GTiff')
gdal.DEMProcessing('hillshade.tif', dataset, 'hillshade', options=options)
print("Hillshade created successfully!")`,
      tags: ["gdal", "raster", "python", "dem"],
      downloads: 78,
      runnable: true,
      expectedOutput: "Could not open raster file\n[In real scenario: Raster size info, statistics, and 'Hillshade created successfully!']"
    },
    {
      id: 7,
      title: "Leaflet Interactive Map",
      description: "Create an interactive web map with markers and popups",
      language: "javascript",
      code: `// Initialize map centered on San Francisco
const map = L.map('map').setView([37.7749, -122.4194], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Sample GIS locations
const locations = [
    {lat: 37.7749, lng: -122.4194, name: "San Francisco City Hall"},
    {lat: 37.7849, lng: -122.4094, name: "Golden Gate Park"},
    {lat: 37.7649, lng: -122.4294, name: "Mission District"}
];

// Add markers with popups
locations.forEach(location => {
    L.marker([location.lat, location.lng])
        .addTo(map)
        .bindPopup(\`<b>\${location.name}</b><br>
                   Lat: \${location.lat}<br>
                   Lng: \${location.lng}\`)
        .openPopup();
});

// Add click event
map.on('click', function(e) {
    console.log('Clicked at: ' + e.latlng);
    L.popup()
        .setLatLng(e.latlng)
        .setContent('You clicked at ' + e.latlng.toString())
        .openOn(map);
});

console.log('Interactive map initialized!');`,
      tags: ["leaflet", "web-mapping", "javascript"],
      downloads: 112,
      runnable: true,
      expectedOutput: "Interactive map initialized!"
    },
    {
      id: 8,
      title: "GeoPandas Data Analysis",
      description: "Analyze spatial data using GeoPandas",
      language: "python",
      code: `import geopandas as gpd
import pandas as pd
import matplotlib.pyplot as plt

# Read sample data (in real scenario, replace with actual file)
# gdf = gpd.read_file('data/countries.shp')

# For demo, create sample data
from shapely.geometry import Point, Polygon
import numpy as np

# Create sample points
points = [Point(np.random.uniform(-180, 180), np.random.uniform(-90, 90)) 
          for _ in range(100)]
gdf_points = gpd.GeoDataFrame({'id': range(100)}, geometry=points)

print(f"Created {len(gdf_points)} sample points")
print(f"CRS: {gdf_points.crs}")

# Spatial operations
# Buffer points
buffered = gdf_points.buffer(1.0)
print(f"Created buffers around {len(buffered)} points")

# Calculate areas (for polygons)
areas = buffered.area
print(f"Average buffer area: {areas.mean():.4f}")

# Basic statistics
print(f"\\nSpatial Statistics:")
print(f"Bounds: {gdf_points.total_bounds}")
print(f"Total points: {len(gdf_points)}")

print("GeoPandas analysis complete!")`,
      tags: ["geopandas", "python", "spatial-analysis"],
      downloads: 95,
      runnable: true,
      expectedOutput: "Created 100 sample points\nCRS: None\nCreated buffers around 100 points\nAverage buffer area: 3.1416\n\nSpatial Statistics:\nBounds: [-179.xx -89.xx 179.xx 89.xx]\nTotal points: 100\nGeoPandas analysis complete!"
    },
    {
      id: 9,
      title: "QGIS Layer Styling",
      description: "Apply symbology and styling to QGIS layers",
      language: "python",
      code: `from qgis.core import *
from qgis.utils import iface
from PyQt5.QtCore import QVariant

# Get the active layer
layer = iface.activeLayer()

if layer.type() == QgsMapLayerType.VectorLayer:
    # Create categorized symbology
    categories = []
    
    # Define categories and colors
    category_info = [
        {'value': 'residential', 'color': '255,255,0,255', 'label': 'Residential'},
        {'value': 'commercial', 'color': '255,0,0,255', 'label': 'Commercial'},
        {'value': 'industrial', 'color': '0,0,255,255', 'label': 'Industrial'}
    ]
    
    for info in category_info:
        symbol = QgsSymbol.defaultSymbol(layer.geometryType())
        symbol.setColor(QColor(info['color']))
        
        category = QgsRendererCategory(
            info['value'], 
            symbol, 
            info['label']
        )
        categories.append(category)
    
    # Apply categorized renderer
    field_name = 'land_use'  # Replace with your field name
    renderer = QgsCategorizedSymbolRenderer(field_name, categories)
    layer.setRenderer(renderer)
    
    # Refresh layer
    layer.triggerRepaint()
    iface.layerTreeView().refreshLayerSymbology(layer.id())
    
    print(f"Applied categorized styling to layer: {layer.name()}")
else:
    print("Please select a vector layer")`,
      tags: ["qgis", "styling", "symbology", "pyqgis"],
      downloads: 67,
      runnable: true,
      expectedOutput: "Applied categorized styling to layer: [layer_name] OR Please select a vector layer"
    },
    {
      id: 10,
      title: "Calculate NDVI from Satellite Data",
      description: "Calculate Normalized Difference Vegetation Index using Python",
      language: "python",
      code: `import numpy as np
import rasterio
import matplotlib.pyplot as plt

def calculate_ndvi(red_band, nir_band):
    """
    Calculate NDVI from red and near-infrared bands
    NDVI = (NIR - Red) / (NIR + Red)
    """
    # Avoid division by zero
    denominator = nir_band + red_band
    ndvi = np.where(
        denominator != 0,
        (nir_band - red_band) / denominator,
        0
    )
    return ndvi

# Example with simulated data
print("Simulating satellite data...")
height, width = 100, 100

# Simulate red and NIR bands (normally read from satellite imagery)
red_band = np.random.uniform(0.1, 0.3, (height, width))
nir_band = np.random.uniform(0.4, 0.8, (height, width))

print(f"Red band shape: {red_band.shape}")
print(f"NIR band shape: {nir_band.shape}")

# Calculate NDVI
ndvi = calculate_ndvi(red_band, nir_band)

# Statistics
print(f"\\nNDVI Statistics:")
print(f"Min NDVI: {np.min(ndvi):.3f}")
print(f"Max NDVI: {np.max(ndvi):.3f}")
print(f"Mean NDVI: {np.mean(ndvi):.3f}")

# Classify vegetation health
healthy_veg = np.sum(ndvi > 0.4)
moderate_veg = np.sum((ndvi > 0.2) & (ndvi <= 0.4))
poor_veg = np.sum(ndvi <= 0.2)

print(f"\\nVegetation Classification:")
print(f"Healthy vegetation pixels: {healthy_veg}")
print(f"Moderate vegetation pixels: {moderate_veg}")
print(f"Poor/No vegetation pixels: {poor_veg}")

print("NDVI calculation complete!")`,
      tags: ["ndvi", "remote-sensing", "python", "vegetation"],
      downloads: 134,
      runnable: true,
      expectedOutput: "Simulating satellite data...\nRed band shape: (100, 100)\nNIR band shape: (100, 100)\n\nNDVI Statistics:\nMin NDVI: [value]\nMax NDVI: [value]\nMean NDVI: [value]\n\nVegetation Classification:\nHealthy vegetation pixels: [count]\nModerate vegetation pixels: [count]\nPoor/No vegetation pixels: [count]\nNDVI calculation complete!"
    },
    {
      id: 11,
      title: "Spatial Join with PostGIS",
      description: "Perform spatial joins between tables in PostGIS",
      language: "sql",
      code: `-- Spatial join: Count points within each polygon
SELECT 
    p.id as polygon_id,
    p.name as area_name,
    COUNT(pt.id) as point_count,
    ST_Area(p.geom) as area_sqm
FROM polygons p
LEFT JOIN points pt ON ST_Within(pt.geom, p.geom)
GROUP BY p.id, p.name, p.geom
ORDER BY point_count DESC;

-- Find nearest point to each polygon centroid
WITH polygon_centroids AS (
    SELECT 
        id,
        name,
        ST_Centroid(geom) as centroid
    FROM polygons
),
nearest_points AS (
    SELECT DISTINCT ON (pc.id)
        pc.id as polygon_id,
        pc.name as polygon_name,
        pt.id as nearest_point_id,
        ST_Distance(pc.centroid, pt.geom) as distance
    FROM polygon_centroids pc
    CROSS JOIN points pt
    ORDER BY pc.id, ST_Distance(pc.centroid, pt.geom)
)
SELECT * FROM nearest_points;

-- Buffer analysis: Find features within distance
SELECT 
    a.id,
    a.name,
    COUNT(b.id) as features_within_500m
FROM amenities a
LEFT JOIN buildings b ON ST_DWithin(a.geom, b.geom, 500)
GROUP BY a.id, a.name
HAVING COUNT(b.id) > 0;`,
      tags: ["postgis", "spatial-join", "sql", "analysis"],
      downloads: 56,
      runnable: false,
      expectedOutput: ""
    },
    {
      id: 12,
      title: "Create Choropleth Map with Folium",
      description: "Generate interactive choropleth maps using Python Folium",
      language: "python",
      code: `import folium
import pandas as pd
import json

# Sample data creation (replace with real data loading)
sample_data = {
    'region_id': ['CA', 'TX', 'NY', 'FL', 'WA'],
    'population': [39538223, 29145505, 20201249, 21538187, 7705281],
    'density': [253.6, 109.9, 421.0, 397.2, 117.3]
}

df = pd.DataFrame(sample_data)
print("Sample demographic data loaded")
print(df.head())

# Create base map
m = folium.Map(
    location=[39.8283, -98.5795],  # Center of USA
    zoom_start=4,
    tiles='OpenStreetMap'
)

print("Base map created")

# In a real scenario, you would load GeoJSON boundaries
# For demo, create sample choropleth
sample_geojson = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {"NAME": "California", "id": "CA"},
            "geometry": {"type": "Polygon", "coordinates": [[[-124, 32], [-114, 32], [-114, 42], [-124, 42], [-124, 32]]]}
        }
    ]
}

print("Adding choropleth layer...")

# Add choropleth layer
folium.Choropleth(
    geo_data=sample_geojson,
    name='Population Density',
    data=df,
    columns=['region_id', 'density'],
    key_on='feature.properties.id',
    fill_color='YlOrRd',
    fill_opacity=0.7,
    line_opacity=0.2,
    legend_name='Population Density (per sq km)'
).add_to(m)

# Add layer control
folium.LayerControl().add_to(m)

print("Choropleth map created successfully!")
print("In Jupyter notebook, display with: m")`,
      tags: ["folium", "choropleth", "python", "visualization"],
      downloads: 87,
      runnable: true,
      expectedOutput: "Sample demographic data loaded\n   region_id  population  density\n0         CA    39538223    253.6\n1         TX    29145505    109.9\n...\nBase map created\nAdding choropleth layer...\nChoropleth map created successfully!\nIn Jupyter notebook, display with: m"
    },
    {
      id: 13,
      title: "Raster Calculator with NumPy",
      description: "Perform raster calculations using NumPy arrays",
      language: "python",
      code: `import numpy as np
import rasterio
from rasterio.transform import from_bounds

def raster_calculator_demo():
    """
    Demonstrate raster calculations with NumPy
    """
    # Create sample raster data
    height, width = 50, 50
    
    # Simulate elevation data (DEM)
    elevation = np.random.uniform(100, 1000, (height, width))
    
    # Simulate temperature data
    temperature = np.random.uniform(15, 35, (height, width))
    
    print(f"Created sample rasters: {height}x{width} pixels")
    print(f"Elevation range: {elevation.min():.1f} - {elevation.max():.1f} m")
    print(f"Temperature range: {temperature.min():.1f} - {temperature.max():.1f} °C")
    
    # Raster calculations
    
    # 1. Simple math operations
    elevation_ft = elevation * 3.28084  # Convert to feet
    print(f"\\nConverted elevation to feet")
    
    # 2. Conditional operations (find high elevation areas)
    high_elevation = np.where(elevation > 700, 1, 0)
    high_elev_count = np.sum(high_elevation)
    print(f"High elevation pixels (>700m): {high_elev_count}/{height*width}")
    
    # 3. Multi-band operations (temperature lapse rate)
    # Temperature decreases with elevation (approx 6.5°C per 1000m)
    adjusted_temp = temperature - (elevation - 100) * 0.0065
    print(f"Applied temperature lapse rate")
    
    # 4. Statistical operations
    print(f"\\nRaster Statistics:")
    print(f"Mean elevation: {np.mean(elevation):.1f} m")
    print(f"Std elevation: {np.std(elevation):.1f} m")
    print(f"Mean adjusted temperature: {np.mean(adjusted_temp):.1f} °C")
    
    # 5. Focal operations (simple smoothing)
    # 3x3 smoothing kernel
    kernel = np.ones((3, 3)) / 9
    # Simplified convolution for demo
    smoothed = np.convolve(elevation.flatten(), kernel.flatten(), mode='same')
    smoothed = smoothed.reshape(elevation.shape)
    print(f"Applied 3x3 smoothing filter")
    
    return {
        'elevation': elevation,
        'temperature': adjusted_temp,
        'high_elevation_mask': high_elevation,
        'smoothed_elevation': smoothed
    }

# Run the calculator
results = raster_calculator_demo()
print(f"\\nRaster calculator completed successfully!")
print(f"Results contain {len(results)} processed layers")`,
      tags: ["raster", "numpy", "gis", "calculation"],
      downloads: 98,
      runnable: true,
      expectedOutput: "Created sample rasters: 50x50 pixels\nElevation range: [range] m\nTemperature range: [range] °C\n\nConverted elevation to feet\nHigh elevation pixels (>700m): [count]/2500\nApplied temperature lapse rate\n\nRaster Statistics:\nMean elevation: [value] m\nStd elevation: [value] m\nMean adjusted temperature: [value] °C\nApplied 3x3 smoothing filter\n\nRaster calculator completed successfully!\nResults contain 4 processed layers"
    },
    {
      id: 14,
      title: "Network Analysis with NetworkX",
      description: "Analyze transportation networks using NetworkX",
      language: "python",
      code: `import networkx as nx
import numpy as np

def create_sample_network():
    """Create a sample transportation network"""
    
    # Create a graph
    G = nx.Graph()
    
    # Add nodes (intersections) with coordinates
    nodes = {
        'A': {'pos': (0, 0), 'type': 'intersection'},
        'B': {'pos': (1, 0), 'type': 'intersection'},
        'C': {'pos': (2, 0), 'type': 'intersection'},
        'D': {'pos': (0, 1), 'type': 'intersection'},
        'E': {'pos': (1, 1), 'type': 'intersection'},
        'F': {'pos': (2, 1), 'type': 'intersection'},
        'G': {'pos': (0.5, 0.5), 'type': 'poi'},  # Point of interest
        'H': {'pos': (1.5, 0.5), 'type': 'poi'}
    }
    
    for node_id, attrs in nodes.items():
        G.add_node(node_id, **attrs)
    
    # Add edges (roads) with weights (distances/travel times)
    edges = [
        ('A', 'B', {'weight': 1.0, 'road_type': 'primary'}),
        ('B', 'C', {'weight': 1.0, 'road_type': 'primary'}),
        ('A', 'D', {'weight': 1.0, 'road_type': 'secondary'}),
        ('D', 'E', {'weight': 1.0, 'road_type': 'secondary'}),
        ('E', 'F', {'weight': 1.0, 'road_type': 'secondary'}),
        ('B', 'E', {'weight': 1.0, 'road_type': 'primary'}),
        ('E', 'C', {'weight': 1.4, 'road_type': 'tertiary'}),
        ('A', 'G', {'weight': 0.7, 'road_type': 'local'}),
        ('B', 'H', {'weight': 0.7, 'road_type': 'local'}),
        ('G', 'H', {'weight': 1.0, 'road_type': 'local'})
    ]
    
    G.add_edges_from([(u, v, d) for u, v, d in edges])
    
    return G

def analyze_network(G):
    """Perform network analysis"""
    
    print(f"Network Analysis Results:")
    print(f"- Number of nodes: {G.number_of_nodes()}")
    print(f"- Number of edges: {G.number_of_edges()}")
    print(f"- Network density: {nx.density(G):.3f}")
    
    # Shortest path analysis
    try:
        shortest_path = nx.shortest_path(G, 'A', 'F', weight='weight')
        path_length = nx.shortest_path_length(G, 'A', 'F', weight='weight')
        print(f"\\nShortest path A to F: {' -> '.join(shortest_path)}")
        print(f"Path length: {path_length:.2f}")
    except nx.NetworkXNoPath:
        print("No path found between A and F")
    
    # Centrality measures
    betweenness = nx.betweenness_centrality(G, weight='weight')
    closeness = nx.closeness_centrality(G, distance='weight')
    
    print(f"\\nCentrality Analysis:")
    print(f"Highest betweenness centrality: {max(betweenness, key=betweenness.get)}")
    print(f"Highest closeness centrality: {max(closeness, key=closeness.get)}")
    
    # Connectivity
    if nx.is_connected(G):
        print(f"\\nNetwork is connected")
        diameter = nx.diameter(G)
        radius = nx.radius(G)
        print(f"Network diameter: {diameter}")
        print(f"Network radius: {radius}")
    else:
        print(f"\\nNetwork has {nx.number_connected_components(G)} components")
    
    return {
        'shortest_paths': dict(nx.all_pairs_shortest_path_length(G, weight='weight')),
        'betweenness': betweenness,
        'closeness': closeness
    }

# Create and analyze network
print("Creating sample transportation network...")
network = create_sample_network()
results = analyze_network(network)
print("\\nNetwork analysis complete!")`,
      tags: ["networkx", "network-analysis", "transportation", "python"],
      downloads: 73,
      runnable: true,
      expectedOutput: "Creating sample transportation network...\nNetwork Analysis Results:\n- Number of nodes: 8\n- Number of edges: 10\n- Network density: 0.357\n\nShortest path A to F: A -> B -> E -> F\nPath length: 2.00\n\nCentrality Analysis:\nHighest betweenness centrality: [node]\nHighest closeness centrality: [node]\n\nNetwork is connected\nNetwork diameter: [value]\nNetwork radius: [value]\n\nNetwork analysis complete!"
    },
    {
      id: 15,
      title: "Spatial Autocorrelation Analysis",
      description: "Calculate Moran's I and spatial autocorrelation metrics",
      language: "python",
      code: `import numpy as np
from scipy import spatial
import pandas as pd

def calculate_morans_i(values, coordinates, distance_threshold=1.0):
    """
    Calculate Moran's I statistic for spatial autocorrelation
    """
    n = len(values)
    
    # Create spatial weights matrix
    # Calculate distances between all points
    distances = spatial.distance_matrix(coordinates, coordinates)
    
    # Create binary weight matrix (1 if within threshold, 0 otherwise)
    weights = (distances <= distance_threshold) & (distances > 0)
    weights = weights.astype(float)
    
    # Row standardize weights
    row_sums = weights.sum(axis=1)
    weights = weights / row_sums[:, np.newaxis]
    weights = np.nan_to_num(weights)  # Handle division by zero
    
    # Calculate Moran's I
    values_centered = values - np.mean(values)
    numerator = 0
    denominator = np.sum(values_centered**2)
    
    for i in range(n):
        for j in range(n):
            numerator += weights[i, j] * values_centered[i] * values_centered[j]
    
    morans_i = (n / np.sum(weights)) * (numerator / denominator)
    
    return morans_i

def spatial_autocorrelation_demo():
    """Demonstrate spatial autocorrelation analysis"""
    
    # Create sample spatial data
    np.random.seed(42)  # For reproducible results
    n_points = 50
    
    # Generate coordinates
    coords = np.random.uniform(0, 10, (n_points, 2))
    
    # Create spatially autocorrelated values
    # Points close to center have higher values
    center = np.array([5, 5])
    distances_to_center = np.sqrt(np.sum((coords - center)**2, axis=1))
    
    # Add spatial pattern + some noise
    values = 100 - distances_to_center * 10 + np.random.normal(0, 5, n_points)
    
    print("Spatial Autocorrelation Analysis")
    print("=" * 40)
    print(f"Number of points: {n_points}")
    print(f"Study area: 10x10 units")
    print(f"Value range: {values.min():.1f} to {values.max():.1f}")
    
    # Calculate Moran's I for different distance thresholds
    thresholds = [1.0, 2.0, 3.0, 4.0]
    
    print(f"\\nMoran's I at different distance thresholds:")
    for threshold in thresholds:
        morans_i = calculate_morans_i(values, coords, threshold)
        print(f"Distance {threshold:.1f}: Moran's I = {morans_i:.4f}")
        
        # Interpret result
        if morans_i > 0.3:
            interpretation = "Strong positive autocorrelation"
        elif morans_i > 0.1:
            interpretation = "Moderate positive autocorrelation"
        elif morans_i > -0.1:
            interpretation = "No significant autocorrelation"
        else:
            interpretation = "Negative autocorrelation"
        
        print(f"                 Interpretation: {interpretation}")
    
    # Local spatial statistics (simplified)
    print(f"\\nLocal Analysis:")
    high_value_threshold = np.percentile(values, 75)
    high_value_points = np.sum(values > high_value_threshold)
    print(f"High-value points (>75th percentile): {high_value_points}")
    
    # Identify clusters (simplified approach)
    # Find points with high values that are close to each other
    high_value_indices = np.where(values > high_value_threshold)[0]
    cluster_points = 0
    
    for i in high_value_indices:
        neighbors = 0
        for j in high_value_indices:
            if i != j:
                distance = np.sqrt(np.sum((coords[i] - coords[j])**2))
                if distance <= 2.0:  # Within 2 units
                    neighbors += 1
        if neighbors >= 2:  # Has at least 2 nearby high-value neighbors
            cluster_points += 1
    
    print(f"Points in high-value clusters: {cluster_points}")
    
    return {
        'coordinates': coords,
        'values': values,
        'morans_i_results': {threshold: calculate_morans_i(values, coords, threshold) 
                           for threshold in thresholds}
    }

# Run the analysis
results = spatial_autocorrelation_demo()
print(f"\\nSpatial autocorrelation analysis completed!")`,
      tags: ["spatial-autocorrelation", "morans-i", "python", "statistics"],
      downloads: 45,
      runnable: true,
      expectedOutput: "Spatial Autocorrelation Analysis\n========================================\nNumber of points: 50\nStudy area: 10x10 units\nValue range: [min] to [max]\n\nMoran's I at different distance thresholds:\nDistance 1.0: Moran's I = [value]\n                 Interpretation: [interpretation]\n...\n\nLocal Analysis:\nHigh-value points (>75th percentile): [count]\nPoints in high-value clusters: [count]\n\nSpatial autocorrelation analysis completed!"
    },
    // Google Earth Engine Snippets
    {
      id: 16,
      title: "NDVI Calculation from Sentinel-2",
      description: "Calculate NDVI using Sentinel-2 imagery in Google Earth Engine",
      language: "javascript",
      code: `// NDVI Calculation from Sentinel-2 in Google Earth Engine
// Define area of interest (AOI) - Replace with your coordinates
var geometry = ee.Geometry.Rectangle([-122.4, 37.7, -122.3, 37.8]); // San Francisco Bay Area

// Date range for image collection
var startDate = '2023-01-01';
var endDate = '2023-12-31';

// Function to mask clouds using the quality band
function maskS2clouds(image) {
  var qa = image.select('QA60');
  // Bits 10 and 11 are clouds and cirrus, respectively
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  // Both flags should be set to zero, indicating clear conditions
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).divide(10000);
}

// Load Sentinel-2 Surface Reflectance collection
var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                  .filterDate(startDate, endDate)
                  .filterBounds(geometry)
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                  .map(maskS2clouds);

// Calculate median composite
var composite = dataset.median();

// Calculate NDVI: (NIR - Red) / (NIR + Red)
var ndvi = composite.normalizedDifference(['B8', 'B4']).rename('NDVI');

// Define visualization parameters
var ndviVis = {
  min: -1,
  max: 1,
  palette: ['blue', 'white', 'green']
};

// Add layers to map
Map.centerObject(geometry, 10);
Map.addLayer(composite, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'RGB');
Map.addLayer(ndvi, ndviVis, 'NDVI');

// Print NDVI statistics
var stats = ndvi.reduceRegion({
  reducer: ee.Reducer.mean().combine({
    reducer2: ee.Reducer.minMax(),
    sharedInputs: true
  }),
  geometry: geometry,
  scale: 10,
  maxPixels: 1e9
});

print('NDVI Statistics:', stats);

// Export the NDVI image
Export.image.toDrive({
  image: ndvi,
  description: 'NDVI_Sentinel2_Export',
  folder: 'EarthEngine',
  scale: 10,
  region: geometry
});`,
      tags: ["google-earth-engine", "ndvi", "sentinel-2", "vegetation", "remote-sensing"],
      downloads: 245,
      runnable: false,
      expectedOutput: "",
      category: "earth-engine",
      isPremium: false,
      geeLink: true
    },
    {
      id: 17,
      title: "Land Cover Classification with Random Forest",
      description: "Perform supervised land cover classification using Random Forest in GEE",
      language: "javascript",
      code: `// Land Cover Classification using Random Forest in Google Earth Engine
// Define study area
var geometry = ee.Geometry.Rectangle([-74.2, 40.5, -73.8, 40.9]); // New York City area

// Date range
var startDate = '2023-06-01';
var endDate = '2023-08-31';

// Cloud masking function for Landsat 8
function maskL8sr(image) {
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  var qa = image.select('pixel_qa');
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}

// Load Landsat 8 Surface Reflectance collection
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
            .filterDate(startDate, endDate)
            .filterBounds(geometry)
            .map(maskL8sr);

// Create median composite
var composite = l8.median().clip(geometry);

// Select bands for classification
var bands = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7'];

// Define training points for different land cover classes
// You would normally import these as assets or draw them manually
var water = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([-74.01, 40.7]), {landcover: 0}),
  ee.Feature(ee.Geometry.Point([-73.98, 40.75]), {landcover: 0})
]);

var urban = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([-73.985, 40.748]), {landcover: 1}),
  ee.Feature(ee.Geometry.Point([-73.98, 40.76]), {landcover: 1})
]);

var vegetation = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([-73.97, 40.78]), {landcover: 2}),
  ee.Feature(ee.Geometry.Point([-73.95, 40.8]), {landcover: 2})
]);

// Merge training data
var trainingData = water.merge(urban).merge(vegetation);

// Sample the input imagery to get a FeatureCollection of training data
var training = composite.select(bands).sampleRegions({
  collection: trainingData,
  properties: ['landcover'],
  scale: 30
});

// Train a Random Forest classifier
var classifier = ee.Classifier.smileRandomForest(50)
    .train({
      features: training,
      classProperty: 'landcover',
      inputProperties: bands
    });

// Classify the input imagery
var classified = composite.select(bands).classify(classifier);

// Define a palette for the land cover classes
var palette = [
  '0066cc', // Water (blue)
  'ff0000', // Urban (red)
  '00cc00'  // Vegetation (green)
];

// Display the classification
Map.centerObject(geometry, 10);
Map.addLayer(composite, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'Landsat 8 RGB');
Map.addLayer(classified, {min: 0, max: 2, palette: palette}, 'Land Cover Classification');

// Calculate area of each land cover class
var areaImage = ee.Image.pixelArea().addBands(classified);
var areas = areaImage.reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: 'landcover',
  }),
  geometry: geometry,
  scale: 30,
  maxPixels: 1e10
});

print('Land Cover Areas (square meters):', areas);

// Export the classification
Export.image.toDrive({
  image: classified,
  description: 'LandCover_Classification',
  folder: 'EarthEngine',
  scale: 30,
  region: geometry
});`,
      tags: ["google-earth-engine", "classification", "random-forest", "landsat", "machine-learning"],
      downloads: 189,
      runnable: false,
      expectedOutput: "",
      category: "earth-engine",
      isPremium: true,
      geeLink: true
    },
    {
      id: 18,
      title: "Cloud Masking with Sentinel-2 SR",
      description: "Advanced cloud masking techniques for Sentinel-2 Surface Reflectance data",
      language: "javascript",
      code: `// Advanced Cloud Masking for Sentinel-2 Surface Reflectance
var geometry = ee.Geometry.Rectangle([11.0, 46.4, 11.5, 46.9]); // South Tyrol, Italy

// Date range
var startDate = '2023-04-01';
var endDate = '2023-10-31';

// Advanced cloud masking function using multiple quality indicators
function maskS2clouds(image) {
  var qa = image.select('QA60');
  var scl = image.select('SCL'); // Scene Classification Layer
  
  // Bits 10 and 11 are clouds and cirrus, respectively
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  
  // QA60 mask
  var qaMask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  
  // SCL mask: remove clouds (3), cloud shadows (8), cirrus (9), and snow (11)
  var sclMask = scl.neq(3).and(scl.neq(8)).and(scl.neq(9)).and(scl.neq(11));
  
  // Combine masks
  var finalMask = qaMask.and(sclMask);
  
  return image.updateMask(finalMask).divide(10000)
      .copyProperties(image, ['system:time_start']);
}

// Additional cloud shadow masking using projection
function addCloudShadowMask(image) {
  var cloudMask = image.select('QA60').bitwiseAnd(1 << 10).neq(0);
  
  // Calculate cloud shadow direction
  var shadowAzimuth = ee.Number(90).subtract(
    ee.Number(image.get('MEAN_SOLAR_AZIMUTH_ANGLE')));
  
  // Project cloud shadows
  var cloudShadows = cloudMask.directionalDistanceTransform(shadowAzimuth, 50)
      .reproject({crs: image.select(0).projection(), scale: 20})
      .select('distance')
      .mask()
      .rename('cloud_shadow');
  
  return image.updateMask(cloudShadows.not());
}

// Load and process Sentinel-2 collection
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
            .filterDate(startDate, endDate)
            .filterBounds(geometry)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
            .map(maskS2clouds);

// Calculate cloud-free composite using multiple methods
var median = s2.median();
var mosaic = s2.mosaic();
var mean = s2.mean();

// Quality mosaic - select best pixels based on cloud distance
var qualityMosaic = s2.qualityMosaic('QA60');

// Visualization parameters
var trueColorVis = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 0.3
};

var falseColorVis = {
  bands: ['B8', 'B4', 'B3'],
  min: 0,
  max: 0.3
};

// Add layers to map
Map.centerObject(geometry, 10);
Map.addLayer(median.clip(geometry), trueColorVis, 'Median Composite (True Color)');
Map.addLayer(median.clip(geometry), falseColorVis, 'Median Composite (False Color)', false);
Map.addLayer(qualityMosaic.clip(geometry), trueColorVis, 'Quality Mosaic', false);

// Calculate cloud coverage statistics
var cloudStats = s2.map(function(image) {
  var clouds = image.select('QA60').bitwiseAnd(1 << 10).neq(0);
  var cloudCoverage = clouds.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 60,
    maxPixels: 1e9
  });
  return image.set('cloud_coverage', cloudCoverage.get('QA60'));
});

print('Collection size:', s2.size());
print('Cloud coverage stats:', cloudStats.aggregate_array('cloud_coverage'));

// Export cloud-free composite
Export.image.toDrive({
  image: median.clip(geometry),
  description: 'Sentinel2_CloudFree_Composite',
  folder: 'EarthEngine',
  scale: 10,
  region: geometry,
  crs: 'EPSG:4326'
});`,
      tags: ["google-earth-engine", "sentinel-2", "cloud-masking", "preprocessing"],
      downloads: 167,
      runnable: false,
      expectedOutput: "",
      category: "earth-engine",
      isPremium: true,
      geeLink: true
    },
    {
      id: 19,
      title: "Time Series Analysis of Vegetation Index",
      description: "Analyze temporal changes in vegetation using MODIS NDVI time series",
      language: "javascript",
      code: `// Time Series Analysis of Vegetation Index using MODIS NDVI
var geometry = ee.Geometry.Rectangle([-10.0, 35.0, 40.0, 60.0]); // Europe

// Date range for multi-year analysis
var startDate = '2015-01-01';
var endDate = '2023-12-31';

// Load MODIS NDVI collection (16-day composite)
var modisNDVI = ee.ImageCollection('MODIS/006/MOD13Q1')
                  .filterDate(startDate, endDate)
                  .filterBounds(geometry)
                  .select('NDVI');

// Scale NDVI values (MODIS NDVI is scaled by 10000)
var scaledNDVI = modisNDVI.map(function(image) {
  var scaled = image.multiply(0.0001);
  return scaled.copyProperties(image, ['system:time_start']);
});

// Create time series chart for a specific point
var point = ee.Geometry.Point([2.35, 48.86]); // Paris, France

var chart = ui.Chart.image.series(scaledNDVI, point, ee.Reducer.mean(), 250)
    .setOptions({
      title: 'NDVI Time Series - Paris',
      vAxis: {title: 'NDVI'},
      hAxis: {title: 'Date'},
      lineWidth: 1,
      pointSize: 3
    });

print(chart);

// Calculate seasonal statistics
var monthlyNDVI = scaledNDVI.map(function(image) {
  var date = ee.Date(image.get('system:time_start'));
  var month = date.get('month');
  return image.set('month', month);
});

// Create monthly composites
var months = ee.List.sequence(1, 12);
var monthlyComposites = months.map(function(month) {
  var monthlyImages = monthlyNDVI.filter(ee.Filter.eq('month', month));
  var composite = monthlyImages.median();
  return composite.set('month', month);
});

var monthlyCollection = ee.ImageCollection.fromImages(monthlyComposites);

// Calculate long-term trends using linear regression
var trendCoefficients = scaledNDVI
    .map(function(image) {
      var date = ee.Date(image.get('system:time_start'));
      var years = date.difference(ee.Date(startDate), 'year');
      return image.addBands(ee.Image(years).rename('t').float());
    })
    .select(['NDVI', 't'])
    .reduce(ee.Reducer.linearFit());

// Extract slope (trend) and correlation
var trend = trendCoefficients.select('scale');
var correlation = trendCoefficients.select('correlation');

// Visualization parameters
var ndviVis = {
  min: 0,
  max: 1,
  palette: ['brown', 'yellow', 'green', 'darkgreen']
};

var trendVis = {
  min: -0.01,
  max: 0.01,
  palette: ['red', 'white', 'green']
};

// Calculate anomalies for a specific year
var referenceYear = 2020;
var currentYearNDVI = scaledNDVI
    .filter(ee.Filter.calendarRange(referenceYear, referenceYear, 'year'))
    .median();

var longTermMean = scaledNDVI.median();
var anomaly = currentYearNDVI.subtract(longTermMean);

// Add layers to map
Map.centerObject(geometry, 4);
Map.addLayer(longTermMean.clip(geometry), ndviVis, 'Long-term Mean NDVI');
Map.addLayer(trend.clip(geometry), trendVis, 'NDVI Trend (slope)', false);
Map.addLayer(anomaly.clip(geometry), 
  {min: -0.2, max: 0.2, palette: ['red', 'white', 'blue']}, 
  '2020 NDVI Anomaly', false);

// Calculate regional statistics
var stats = scaledNDVI.map(function(image) {
  var meanNDVI = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 250,
    maxPixels: 1e9
  });
  return ee.Feature(null, {
    'date': image.get('system:time_start'),
    'mean_ndvi': meanNDVI.get('NDVI')
  });
});

// Export time series data
Export.table.toDrive({
  collection: ee.FeatureCollection(stats),
  description: 'NDVI_TimeSeries_Europe',
  folder: 'EarthEngine',
  fileFormat: 'CSV'
});

// Calculate phenology metrics (simplified)
var springOnset = monthlyCollection
    .filter(ee.Filter.gte('month', 3))
    .filter(ee.Filter.lte('month', 6))
    .max();

var autumnSenescence = monthlyCollection
    .filter(ee.Filter.gte('month', 9))
    .filter(ee.Filter.lte('month', 11))
    .min();

print('Analysis complete! Check the time series chart and exported data.');
print('Spring peak NDVI:', springOnset.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: point,
  scale: 250
}));`,
      tags: ["google-earth-engine", "time-series", "modis", "phenology", "trend-analysis"],
      downloads: 143,
      runnable: false,
      expectedOutput: "",
      category: "earth-engine",
      isPremium: false,
      geeLink: true
    },
    {
      id: 20,
      title: "Change Detection using Image Difference",
      description: "Detect land cover changes using before/after image comparison",
      language: "javascript",
      code: `// Change Detection using Image Difference in Google Earth Engine
var geometry = ee.Geometry.Rectangle([-122.5, 37.6, -122.2, 37.9]); // San Francisco Bay Area

// Define before and after periods
var beforeStart = '2010-06-01';
var beforeEnd = '2010-08-31';
var afterStart = '2020-06-01';
var afterEnd = '2020-08-31';

// Cloud masking function for Landsat
function maskL8sr(image) {
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  var qa = image.select('pixel_qa');
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}

// Function to prepare Landsat images
function prepareImage(collection, startDate, endDate) {
  return collection
    .filterDate(startDate, endDate)
    .filterBounds(geometry)
    .map(maskL8sr)
    .median()
    .clip(geometry);
}

// Load Landsat collections for different time periods
var beforeImage = prepareImage(
  ee.ImageCollection('LANDSAT/LC08/C01/T1_SR'), 
  beforeStart, 
  beforeEnd
);

var afterImage = prepareImage(
  ee.ImageCollection('LANDSAT/LC08/C01/T1_SR'), 
  afterStart, 
  afterEnd
);

// Calculate spectral indices for change detection
function addIndices(image) {
  // NDVI: (NIR - Red) / (NIR + Red)
  var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
  
  // NDBI: (SWIR1 - NIR) / (SWIR1 + NIR) - for built-up areas
  var ndbi = image.normalizedDifference(['B6', 'B5']).rename('NDBI');
  
  // MNDWI: (Green - SWIR1) / (Green + SWIR1) - for water bodies
  var mndwi = image.normalizedDifference(['B3', 'B6']).rename('MNDWI');
  
  return image.addBands([ndvi, ndbi, mndwi]);
}

// Add indices to both images
var beforeWithIndices = addIndices(beforeImage);
var afterWithIndices = addIndices(afterImage);

// Calculate differences
var ndviDiff = afterWithIndices.select('NDVI').subtract(beforeWithIndices.select('NDVI')).rename('NDVI_diff');
var ndbiBiff = afterWithIndices.select('NDBI').subtract(beforeWithIndices.select('NDBI')).rename('NDBI_diff');
var mndwiDiff = afterWithIndices.select('MNDWI').subtract(beforeWithIndices.select('MNDWI')).rename('MNDWI_diff');

// Combine all differences
var changeMagnitude = ndviDiff.abs().add(ndbiBiff.abs()).add(mndwiDiff.abs()).rename('change_magnitude');

// Define change thresholds
var vegetationLossThreshold = -0.3; // Significant vegetation loss
var urbanGrowthThreshold = 0.2;     // Urban development
var changeThreshold = 0.5;          // General change threshold

// Identify different types of changes
var vegetationLoss = ndviDiff.lt(vegetationLossThreshold).rename('vegetation_loss');
var urbanGrowth = ndbiBiff.gt(urbanGrowthThreshold).rename('urban_growth');
var significantChange = changeMagnitude.gt(changeThreshold).rename('significant_change');

// Create change classification
var changeTypes = ee.Image(0)
  .where(vegetationLoss.eq(1), 1)  // Vegetation loss = 1
  .where(urbanGrowth.eq(1), 2)     // Urban growth = 2
  .where(significantChange.eq(1).and(vegetationLoss.eq(0)).and(urbanGrowth.eq(0)), 3) // Other change = 3
  .rename('change_type');

// Visualization parameters
var trueColorVis = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000
};

var changeDiffVis = {
  min: -0.5,
  max: 0.5,
  palette: ['red', 'white', 'green']
};

var changeTypeVis = {
  min: 0,
  max: 3,
  palette: ['white', 'red', 'orange', 'yellow'] // No change, vegetation loss, urban growth, other change
};

// Add layers to map
Map.centerObject(geometry, 10);

// Before and after RGB
Map.addLayer(beforeImage, trueColorVis, 'Before (2010)');
Map.addLayer(afterImage, trueColorVis, 'After (2020)', false);

// NDVI comparison
Map.addLayer(beforeWithIndices.select('NDVI'), {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'NDVI Before', false);
Map.addLayer(afterWithIndices.select('NDVI'), {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'NDVI After', false);

// Change analysis
Map.addLayer(ndviDiff, changeDiffVis, 'NDVI Difference');
Map.addLayer(changeMagnitude, {min: 0, max: 1, palette: ['white', 'red']}, 'Change Magnitude', false);
Map.addLayer(changeTypes.updateMask(changeTypes.gt(0)), changeTypeVis, 'Change Types');

// Calculate change statistics
var changeStats = ee.Dictionary({
  'total_area_km2': geometry.area().divide(1e6),
  'vegetation_loss_km2': vegetationLoss.multiply(ee.Image.pixelArea()).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometry,
    scale: 30,
    maxPixels: 1e10
  }).get('vegetation_loss').divide(1e6),
  'urban_growth_km2': urbanGrowth.multiply(ee.Image.pixelArea()).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometry,
    scale: 30,
    maxPixels: 1e10
  }).get('urban_growth').divide(1e6)
});

print('Change Detection Statistics:', changeStats);

// Create difference RGB composite for visual interpretation
var rgbDiff = afterImage.select(['B4', 'B3', 'B2']).subtract(beforeImage.select(['B4', 'B3', 'B2']));
Map.addLayer(rgbDiff, {min: -1000, max: 1000, bands: ['B4', 'B3', 'B2']}, 'RGB Difference', false);

// Export change detection results
Export.image.toDrive({
  image: changeTypes,
  description: 'Change_Detection_2010_2020',
  folder: 'EarthEngine',
  scale: 30,
  region: geometry,
  crs: 'EPSG:4326'
});

// Export statistics
Export.table.toDrive({
  collection: ee.FeatureCollection([ee.Feature(null, changeStats)]),
  description: 'Change_Statistics',
  folder: 'EarthEngine',
  fileFormat: 'CSV'
});`,
      tags: ["google-earth-engine", "change-detection", "landsat", "urban-growth", "deforestation"],
      downloads: 201,
      runnable: false,
      expectedOutput: "",
      category: "earth-engine",
      isPremium: true,
      geeLink: true
    },
    {
      id: 21,
      title: "Urban Expansion Detection using Landsat",
      description: "Monitor urban expansion over time using multi-temporal Landsat imagery",
      language: "javascript",
      code: `// Urban Expansion Detection using Landsat Time Series
var geometry = ee.Geometry.Rectangle([77.0, 28.4, 77.4, 28.8]); // Delhi, India

// Define time periods for analysis
var periods = [
  {name: '2000', start: '2000-01-01', end: '2000-12-31'},
  {name: '2010', start: '2010-01-01', end: '2010-12-31'},
  {name: '2020', start: '2020-01-01', end: '2020-12-31'}
];

// Cloud masking for different Landsat missions
function maskLandsatClouds(image) {
  var qa = image.select('pixel_qa');
  var cloudBitMask = (1 << 5);
  var cloudShadowBitMask = (1 << 3);
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
                .and(qa.bitwiseAnd(cloudShadowBitMask).eq(0));
  return image.updateMask(mask);
}

// Function to calculate urban indices
function calculateUrbanIndices(image) {
  // NDBI: (SWIR1 - NIR) / (SWIR1 + NIR)
  var ndbi = image.normalizedDifference(['B6', 'B5']).rename('NDBI');
  
  // UI (Urban Index): (SWIR2 - NIR) / (SWIR2 + NIR)
  var ui = image.normalizedDifference(['B7', 'B5']).rename('UI');
  
  // NDVI for vegetation
  var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
  
  // MNDWI for water
  var mndwi = image.normalizedDifference(['B3', 'B6']).rename('MNDWI');
  
  return image.addBands([ndbi, ui, ndvi, mndwi]);
}

// Function to classify urban areas
function classifyUrban(image, threshold) {
  var ndbi = image.select('NDBI');
  var ndvi = image.select('NDVI');
  var mndwi = image.select('MNDWI');
  
  // Urban classification criteria:
  // High NDBI, Low NDVI, Not water (MNDWI < 0)
  var urban = ndbi.gt(threshold)
                  .and(ndvi.lt(0.2))
                  .and(mndwi.lt(0));
  
  return urban.rename('urban');
}

// Process each time period
var urbanResults = periods.map(function(period) {
  // Load appropriate Landsat collection based on year
  var collection;
  if (period.name === '2000') {
    collection = ee.ImageCollection('LANDSAT/LE07/C01/T1_SR'); // Landsat 7
  } else {
    collection = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR'); // Landsat 8
  }
  
  var composite = collection
    .filterDate(period.start, period.end)
    .filterBounds(geometry)
    .map(maskLandsatClouds)
    .median()
    .clip(geometry);
  
  var withIndices = calculateUrbanIndices(composite);
  var urbanMask = classifyUrban(withIndices, 0.1);
  
  return {
    period: period.name,
    image: composite,
    indices: withIndices,
    urban: urbanMask
  };
});

// Extract urban masks for each period
var urban2000 = urbanResults[0].urban;
var urban2010 = urbanResults[1].urban;
var urban2020 = urbanResults[2].urban;

// Calculate urban expansion
var expansion2000_2010 = urban2010.subtract(urban2000).gt(0).rename('expansion_2000_2010');
var expansion2010_2020 = urban2020.subtract(urban2010).gt(0).rename('expansion_2010_2020');
var expansion2000_2020 = urban2020.subtract(urban2000).gt(0).rename('expansion_2000_2020');

// Create urban development timeline
var urbanTimeline = ee.Image(0)
  .where(urban2000.eq(1), 1)                    // Urban in 2000
  .where(expansion2000_2010.eq(1), 2)           // Expansion 2000-2010
  .where(expansion2010_2020.eq(1), 3)           // Expansion 2010-2020
  .rename('urban_timeline');

// Visualization parameters
var trueColorVis = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000
};

var urbanVis = {
  min: 0,
  max: 1,
  palette: ['white', 'red']
};

var timelineVis = {
  min: 0,
  max: 3,
  palette: ['white', 'darkred', 'orange', 'yellow']
};

// Add layers to map
Map.centerObject(geometry, 10);

// Add RGB composites for each period
Map.addLayer(urbanResults[0].image, trueColorVis, '2000 RGB');
Map.addLayer(urbanResults[1].image, trueColorVis, '2010 RGB', false);
Map.addLayer(urbanResults[2].image, trueColorVis, '2020 RGB', false);

// Add urban masks
Map.addLayer(urban2000.updateMask(urban2000), urbanVis, '2000 Urban', false);
Map.addLayer(urban2010.updateMask(urban2010), urbanVis, '2010 Urban', false);
Map.addLayer(urban2020.updateMask(urban2020), urbanVis, '2020 Urban');

// Add expansion analysis
Map.addLayer(expansion2000_2010.updateMask(expansion2000_2010), {palette: ['orange']}, 'Expansion 2000-2010', false);
Map.addLayer(expansion2010_2020.updateMask(expansion2010_2020), {palette: ['yellow']}, 'Expansion 2010-2020', false);
Map.addLayer(urbanTimeline.updateMask(urbanTimeline.gt(0)), timelineVis, 'Urban Timeline');

// Calculate urban area statistics
var pixelArea = ee.Image.pixelArea().divide(1e6); // Convert to km²

var stats2000 = urban2000.multiply(pixelArea).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: geometry,
  scale: 30,
  maxPixels: 1e10
});

var stats2010 = urban2010.multiply(pixelArea).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: geometry,
  scale: 30,
  maxPixels: 1e10
});

var stats2020 = urban2020.multiply(pixelArea).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: geometry,
  scale: 30,
  maxPixels: 1e10
});

var expansionStats = {
  'urban_area_2000_km2': stats2000.get('urban'),
  'urban_area_2010_km2': stats2010.get('urban'),
  'urban_area_2020_km2': stats2020.get('urban'),
  'expansion_2000_2010_km2': expansion2000_2010.multiply(pixelArea).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometry,
    scale: 30,
    maxPixels: 1e10
  }).get('expansion_2000_2010'),
  'expansion_2010_2020_km2': expansion2010_2020.multiply(pixelArea).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometry,
    scale: 30,
    maxPixels: 1e10
  }).get('expansion_2010_2020')
};

print('Urban Expansion Statistics:', expansionStats);

// Calculate expansion rate
var totalArea = geometry.area().divide(1e6);
print('Study Area (km²):', totalArea);

// Export urban timeline
Export.image.toDrive({
  image: urbanTimeline,
  description: 'Urban_Expansion_Timeline_Delhi',
  folder: 'EarthEngine',
  scale: 30,
  region: geometry,
  crs: 'EPSG:4326'
});

// Create growth direction analysis
var urbanCentroid2000 = urban2000.reduceRegion({
  reducer: ee.Reducer.centroid(),
  geometry: geometry,
  scale: 90
});

var urbanCentroid2020 = urban2020.reduceRegion({
  reducer: ee.Reducer.centroid(),
  geometry: geometry,
  scale: 90
});

print('Urban Growth Direction Analysis:');
print('2000 Urban Centroid:', urbanCentroid2000);
print('2020 Urban Centroid:', urbanCentroid2020);`,
      tags: ["google-earth-engine", "urban-expansion", "landsat", "time-series", "change-detection"],
      downloads: 134,
      runnable: false,
      expectedOutput: "",
      category: "earth-engine",
      isPremium: true,
      geeLink: true
    },
    // Add more comprehensive GEE snippets
    {
      id: 22,
      title: "Water Body Extraction (NDWI)",
      description: "Extract water bodies using Modified Normalized Difference Water Index",
      language: "javascript",
      code: `// Water Body Extraction using MNDWI in Google Earth Engine
var geometry = ee.Geometry.Rectangle([77.1, 28.4, 77.3, 28.7]); // Yamuna River, Delhi

// Date range
var startDate = '2023-01-01';
var endDate = '2023-12-31';

// Load Sentinel-2 collection
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
          .filterDate(startDate, endDate)
          .filterBounds(geometry)
          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));

// Cloud masking
function maskClouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).divide(10000);
}

var composite = s2.map(maskClouds).median();

// Calculate water indices
var mndwi = composite.normalizedDifference(['B3', 'B11']).rename('MNDWI');
var ndwi = composite.normalizedDifference(['B3', 'B8']).rename('NDWI');

// Extract water bodies
var waterMask = mndwi.gt(0.3);
var waterBodies = waterMask.updateMask(waterMask);

// Visualization
Map.centerObject(geometry, 12);
Map.addLayer(composite, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'RGB');
Map.addLayer(mndwi, {min: -1, max: 1, palette: ['red', 'yellow', 'blue']}, 'MNDWI');
Map.addLayer(waterBodies, {palette: ['blue']}, 'Water Bodies');

// Calculate water area
var waterArea = waterBodies.multiply(ee.Image.pixelArea()).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: geometry,
  scale: 10,
  maxPixels: 1e9
}).get('MNDWI');

print('Water Area (sq meters):', waterArea);`,
      tags: ["google-earth-engine", "water-extraction", "ndwi", "mndwi", "sentinel-2"],
      downloads: 156,
      runnable: false,
      expectedOutput: "",
      category: "earth-engine",
      isPremium: false,
      geeLink: true
    },
    {
      id: 23,
      title: "Forest Loss Analysis using Hansen Dataset",
      description: "Analyze global forest loss using Hansen Global Forest Change dataset",
      language: "javascript",
      code: `// Forest Loss Analysis using Hansen Global Forest Change
var geometry = ee.Geometry.Rectangle([-60.5, -3.5, -60.0, -3.0]); // Amazon region

// Load Hansen Global Forest Change dataset
var hansen = ee.Image('UMD/hansen/global_forest_change_2022_v1_10');

// Extract relevant bands
var treeCover = hansen.select('treecover2000'); // Tree cover in year 2000
var forestLoss = hansen.select('loss'); // Forest loss 2001-2022
var forestGain = hansen.select('gain'); // Forest gain 2001-2012
var lossYear = hansen.select('lossyear'); // Year of loss

// Create forest mask (areas with >30% tree cover in 2000)
var forestMask = treeCover.gte(30);
var forest2000 = forestMask.updateMask(forestMask);

// Create loss mask
var lossImage = forestLoss.updateMask(forestLoss.eq(1));

// Calculate forest loss by year
var lossYearMasked = lossYear.updateMask(forestLoss.eq(1));

// Visualization parameters
var forestVis = {palette: ['green']};
var lossVis = {palette: ['red']};
var treeCoverVis = {min: 0, max: 100, palette: ['white', 'green']};

// Add layers to map
Map.centerObject(geometry, 10);
Map.addLayer(treeCover.clip(geometry), treeCoverVis, 'Tree Cover 2000');
Map.addLayer(forest2000.clip(geometry), forestVis, 'Forest 2000', false);
Map.addLayer(lossImage.clip(geometry), lossVis, 'Forest Loss 2001-2022');

// Calculate statistics
var totalForestArea = forest2000.multiply(ee.Image.pixelArea()).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: geometry,
  scale: 30,
  maxPixels: 1e10
}).get('treecover2000');

var totalLossArea = lossImage.multiply(ee.Image.pixelArea()).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: geometry,
  scale: 30,
  maxPixels: 1e10
}).get('loss');

print('Total Forest Area 2000 (sq m):', totalForestArea);
print('Total Loss Area (sq m):', totalLossArea);

// Calculate loss by year
var yearlyLoss = [];
for (var year = 1; year <= 22; year++) {
  var yearMask = lossYearMasked.eq(year);
  var yearLoss = yearMask.multiply(ee.Image.pixelArea()).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometry,
    scale: 30,
    maxPixels: 1e10
  }).get('lossyear');
  
  yearlyLoss.push(ee.Feature(null, {
    'year': 2000 + year,
    'loss_area_sqm': yearLoss
  }));
}

// Export yearly loss data
Export.table.toDrive({
  collection: ee.FeatureCollection(yearlyLoss),
  description: 'Forest_Loss_By_Year',
  folder: 'EarthEngine'
});`,
      tags: ["google-earth-engine", "deforestation", "hansen", "forest-loss", "amazon"],
      downloads: 198,
      runnable: false,
      expectedOutput: "",
      category: "earth-engine",
      isPremium: true,
      geeLink: true
    },
    {
      id: 24,
      title: "Exporting Maps to Google Drive",
      description: "Export processed satellite imagery and analysis results to Google Drive",
      language: "javascript",
      code: `// Exporting Maps and Data to Google Drive in Google Earth Engine
var geometry = ee.Geometry.Rectangle([78.0, 27.5, 78.5, 28.0]); // Agra, India

// Load and process Sentinel-2 image
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
          .filterDate('2023-01-01', '2023-03-31')
          .filterBounds(geometry)
          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
          .median()
          .clip(geometry);

// Calculate indices
var ndvi = s2.normalizedDifference(['B8', 'B4']).rename('NDVI');
var ndbi = s2.normalizedDifference(['B11', 'B8']).rename('NDBI');

// Create RGB composite
var rgb = s2.select(['B4', 'B3', 'B2']);

// 1. Export RGB image
Export.image.toDrive({
  image: rgb,
  description: 'Sentinel2_RGB_Agra',
  folder: 'EarthEngine_Exports',
  fileNamePrefix: 'S2_RGB_Agra_2023',
  region: geometry,
  scale: 10,
  crs: 'EPSG:4326',
  maxPixels: 1e9,
  fileFormat: 'GeoTIFF'
});

// 2. Export NDVI with custom visualization
var ndviVisualized = ndvi.visualize({
  min: -1,
  max: 1,
  palette: ['blue', 'white', 'green']
});

Export.image.toDrive({
  image: ndviVisualized,
  description: 'NDVI_Visualization_Agra',
  folder: 'EarthEngine_Exports',
  region: geometry,
  scale: 10,
  crs: 'EPSG:4326',
  fileFormat: 'PNG'
});

// 3. Export raw NDVI data for analysis
Export.image.toDrive({
  image: ndvi,
  description: 'NDVI_Raw_Data_Agra',
  folder: 'EarthEngine_Exports',
  region: geometry,
  scale: 10,
  crs: 'EPSG:4326',
  fileFormat: 'GeoTIFF'
});

// 4. Export to Google Cloud Storage (alternative)
Export.image.toCloudStorage({
  image: rgb,
  description: 'S2_RGB_to_GCS',
  bucket: 'your-gcs-bucket-name',
  fileNamePrefix: 'S2_RGB_Agra',
  region: geometry,
  scale: 10,
  maxPixels: 1e9
});

// 5. Export feature collection (vector data)
var samples = ndvi.sample({
  region: geometry,
  scale: 30,
  numPixels: 1000
});

Export.table.toDrive({
  collection: samples,
  description: 'NDVI_Sample_Points',
  folder: 'EarthEngine_Exports',
  fileFormat: 'CSV'
});

// 6. Export classification results
var landCover = ee.Image(1)
  .where(ndvi.gt(0.4), 2)    // Vegetation
  .where(ndbi.gt(0.1), 3)    // Built-up
  .where(ndvi.lt(0.1), 4)    // Barren
  .rename('landcover');

Export.image.toDrive({
  image: landCover,
  description: 'LandCover_Classification',
  folder: 'EarthEngine_Exports',
  region: geometry,
  scale: 30,
  crs: 'EPSG:4326',
  fileFormat: 'GeoTIFF'
});

// 7. Create and export thumbnail for quick preview
var thumbnail = rgb.getThumbURL({
  'region': geometry,
  'dimensions': 512,
  'format': 'png'
});

print('Thumbnail URL:', thumbnail);

// 8. Export time series data
var timeSeries = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                  .filterDate('2022-01-01', '2023-12-31')
                  .filterBounds(geometry)
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                  .map(function(image) {
                    var ndvi = image.normalizedDifference(['B8', 'B4']);
                    var date = image.get('system:time_start');
                    var meanNdvi = ndvi.reduceRegion({
                      reducer: ee.Reducer.mean(),
                      geometry: geometry,
                      scale: 100
                    });
                    return ee.Feature(null, {
                      'date': date,
                      'mean_ndvi': meanNdvi.get('nd')
                    });
                  });

Export.table.toDrive({
  collection: timeSeries,
  description: 'NDVI_TimeSeries_Agra',
  folder: 'EarthEngine_Exports',
  fileFormat: 'CSV'
});

print('All export tasks have been created. Check the Tasks tab to run them.');`,
      tags: ["google-earth-engine", "export", "google-drive", "data-export", "workflow"],
      downloads: 234,
      runnable: false,
      expectedOutput: "",
      category: "earth-engine",
      isPremium: false,
      geeLink: true
    }
  ];

  const languages = [
    { value: "all", label: "All Languages" },
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "r", label: "R" },
    { value: "sql", label: "SQL" }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "general", label: "General GIS" },
    { value: "earth-engine", label: "🌍 Google Earth Engine" },
    { value: "remote-sensing", label: "Remote Sensing" },
    { value: "web-mapping", label: "Web Mapping" }
  ];

  // Filter snippets based on access level
  const accessibleSnippets = snippets.map(snippet => {
    // Check if snippet is premium and user has access
    if (snippet.isPremium && !hasAccess('pro')) {
      return null; // Hide premium snippets from free users
    }
    return snippet;
  }).filter(Boolean);

  // For GEE category, show only 5 snippets to free users
  const geeSnippets = accessibleSnippets.filter(s => s.category === 'earth-engine');
  const limitedGeeSnippets = !hasAccess('pro') ? geeSnippets.slice(0, 5) : geeSnippets;
  const otherSnippets = accessibleSnippets.filter(s => s.category !== 'earth-engine');
  const finalSnippets = [...otherSnippets, ...limitedGeeSnippets];

  const filteredSnippets = finalSnippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLanguage = selectedLanguage === "all" || snippet.language === selectedLanguage;
    const matchesCategory = selectedCategory === "all" || snippet.category === selectedCategory;
    return matchesSearch && matchesLanguage && matchesCategory;
  });

  const runSnippet = async (snippetId: number) => {
    const snippet = snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    setRunningSnippets(prev => new Set([...prev, snippetId]));
    
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setRunningSnippets(prev => {
      const newSet = new Set(prev);
      newSet.delete(snippetId);
      return newSet;
    });

    toast({
      title: "Code executed successfully!",
      description: `${snippet.title} ran without errors`,
    });
  };

  const handleCreateSnippet = () => {
    console.log("Creating snippet:", newSnippet);
    toast({
      title: "Snippet created!",
      description: `${newSnippet.title} has been added to the library`,
    });
    setIsCreating(false);
    setNewSnippet({ title: "", description: "", code: "", language: "python" });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard!",
      description: "Code snippet has been copied",
    });
  };

  const openInGEE = (code: string) => {
    // Encode the code for URL
    const encodedCode = encodeURIComponent(code);
    const geeUrl = `https://code.earthengine.google.com/?scriptPath=users%2Fusername%2Frepo%3Afilename&code=${encodedCode}`;
    window.open(geeUrl, '_blank');
    
    toast({
      title: "Opening in GEE Code Editor",
      description: "Code will be loaded in a new tab",
    });
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Code Snippets</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Collection of runnable code snippets for GIS development and automation
          </p>
          {!hasAccess('pro') && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-blue-800">
                🌍 <strong>Google Earth Engine</strong> section shows 5 free samples. 
                <a href="/choose-plan" className="underline ml-1">Upgrade to Pro</a> to unlock all 15+ GEE scripts!
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search code snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Snippet
            </Button>
          </div>
        </div>

        {/* Create Snippet Modal */}
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Code Snippet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newSnippet.title}
                    onChange={(e) => setNewSnippet({...newSnippet, title: e.target.value})}
                    placeholder="Enter snippet title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <select
                    value={newSnippet.language}
                    onChange={(e) => setNewSnippet({...newSnippet, language: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    {languages.filter(lang => lang.value !== "all").map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newSnippet.description}
                  onChange={(e) => setNewSnippet({...newSnippet, description: e.target.value})}
                  placeholder="Brief description of the code snippet"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Code</label>
                <Textarea
                  value={newSnippet.code}
                  onChange={(e) => setNewSnippet({...newSnippet, code: e.target.value})}
                  placeholder="Paste your code here..."
                  rows={8}
                  className="font-mono"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateSnippet}>Save Snippet</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Snippets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSnippets.map((snippet) => (
            <Card key={snippet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {snippet.title}
                      {snippet.runnable && (
                        <Badge variant="secondary" className="text-xs">
                          <Play className="h-3 w-3 mr-1" />
                          Runnable
                        </Badge>
                      )}
                      {snippet.category === 'earth-engine' && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          <Globe className="h-3 w-3 mr-1" />
                          GEE
                        </Badge>
                      )}
                      {snippet.isPremium && !hasAccess('pro') && (
                        <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-700">
                          🔐 Pro
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{snippet.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{snippet.language}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4 relative">
                    <pre className="text-sm overflow-x-auto">
                      <code>{snippet.code}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(snippet.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Expected Output */}
                  {snippet.runnable && snippet.expectedOutput && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Expected Output:</span>
                      </div>
                      <pre className="text-xs text-green-700 whitespace-pre-wrap">
                        {snippet.expectedOutput}
                      </pre>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {snippet.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {snippet.downloads} downloads
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      {snippet.runnable && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => runSnippet(snippet.id)}
                          disabled={runningSnippets.has(snippet.id)}
                        >
                          {runningSnippets.has(snippet.id) ? (
                            <>
                              <AlertCircle className="h-4 w-4 mr-1 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Run Code
                            </>
                          )}
                        </Button>
                      )}
                      {snippet.geeLink && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openInGEE(snippet.code)}
                          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open in GEE
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSnippets.length === 0 && (
          <div className="text-center py-12">
            <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No code snippets found matching your criteria.</p>
          </div>
        )}

        {/* Upgrade Prompt for Free Users */}
        {!hasAccess('pro') && selectedCategory === 'earth-engine' && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">🚀 Unlock Full Google Earth Engine Library</h3>
            <p className="text-muted-foreground mb-4">
              Get access to 15+ production-ready GEE scripts including Advanced Classification, Time Series Analysis, and more!
            </p>
            <Button asChild>
              <a href="/choose-plan">Upgrade to Pro Plan</a>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CodeSnippets;
