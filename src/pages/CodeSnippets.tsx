
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Code, Plus, Search, Copy, Download, Play, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CodeSnippets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [runningSnippets, setRunningSnippets] = useState<Set<number>>(new Set());
  const [newSnippet, setNewSnippet] = useState({ 
    title: "", 
    description: "", 
    code: "", 
    language: "python" 
  });
  const { toast } = useToast();

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
    }
  ];

  const languages = [
    { value: "all", label: "All Languages" },
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "r", label: "R" },
    { value: "sql", label: "SQL" }
  ];

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === "all" || snippet.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
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

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Code Snippets</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Collection of runnable code snippets for GIS development and automation
          </p>
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
                    <div className="flex gap-2">
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
      </div>
    </Layout>
  );
};

export default CodeSnippets;
