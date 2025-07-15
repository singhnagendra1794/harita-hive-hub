/**
 * Mapbox GL Clustering Plugin
 * Advanced point clustering with custom styling for Mapbox GL JS
 * 
 * License: MIT
 * Author: HaritaHive Team
 */

class MapboxClustering {
    constructor(map, options = {}) {
        this.map = map;
        this.options = {
            clusterRadius: 50,
            clusterMaxZoom: 14,
            clusterMinPoints: 2,
            sourceId: 'clustering-source',
            layerId: 'clusters',
            clusterLayerId: 'cluster-count',
            unclusteredLayerId: 'unclustered-point',
            ...options
        };
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize clustering with data
     * @param {Object} geojsonData - GeoJSON FeatureCollection
     */
    init(geojsonData) {
        if (!geojsonData || !geojsonData.features) {
            throw new Error('Invalid GeoJSON data provided');
        }
        
        // Add source
        this.map.addSource(this.options.sourceId, {
            type: 'geojson',
            data: geojsonData,
            cluster: true,
            clusterMaxZoom: this.options.clusterMaxZoom,
            clusterRadius: this.options.clusterRadius,
            clusterMinPoints: this.options.clusterMinPoints,
            clusterProperties: {
                // Calculate sum of a numeric property
                'sum': ['+', ['get', 'value']],
                // Calculate max of a numeric property
                'max': ['max', ['get', 'value']],
                // Count points in cluster
                'count': ['+', 1]
            }
        });
        
        // Add cluster circles layer
        this.map.addLayer({
            id: this.options.layerId,
            type: 'circle',
            source: this.options.sourceId,
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#51bbd6',  // Color for clusters with < 100 points
                    100,
                    '#f1f075',  // Color for clusters with 100-750 points
                    750,
                    '#f28cb1'   // Color for clusters with > 750 points
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20,  // Radius for clusters with < 100 points
                    100,
                    30,  // Radius for clusters with 100-750 points
                    750,
                    40   // Radius for clusters with > 750 points
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
                'circle-opacity': 0.8
            }
        });
        
        // Add cluster count labels
        this.map.addLayer({
            id: this.options.clusterLayerId,
            type: 'symbol',
            source: this.options.sourceId,
            filter: ['has', 'point_count'],
            layout: {
                'text-field': [
                    'case',
                    ['>', ['get', 'point_count'], 999],
                    [
                        'concat',
                        ['round', ['/', ['get', 'point_count'], 1000]],
                        'k'
                    ],
                    ['to-string', ['get', 'point_count']]
                ],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12,
                'text-allow-overlap': true
            },
            paint: {
                'text-color': '#ffffff'
            }
        });
        
        // Add unclustered points layer
        this.map.addLayer({
            id: this.options.unclusteredLayerId,
            type: 'circle',
            source: this.options.sourceId,
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#11b4da',
                'circle-radius': 8,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff',
                'circle-opacity': 0.8
            }
        });
        
        this._setupEventHandlers();
        this.isInitialized = true;
    }
    
    /**
     * Set up event handlers for cluster interaction
     */
    _setupEventHandlers() {
        // Click on cluster to zoom in
        this.map.on('click', this.options.layerId, (e) => {
            const features = this.map.queryRenderedFeatures(e.point, {
                layers: [this.options.layerId]
            });
            
            const clusterId = features[0].properties.cluster_id;
            
            this.map.getSource(this.options.sourceId).getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;
                    
                    this.map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });
        
        // Click on unclustered point
        this.map.on('click', this.options.unclusteredLayerId, (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const properties = e.features[0].properties;
            
            // Create popup content
            let popupContent = '<div class="cluster-popup">';
            for (const [key, value] of Object.entries(properties)) {
                if (key !== 'cluster' && key !== 'cluster_id') {
                    popupContent += `<p><strong>${key}:</strong> ${value}</p>`;
                }
            }
            popupContent += '</div>';
            
            // Ensure popup appears over the point
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            
            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(popupContent)
                .addTo(this.map);
        });
        
        // Change cursor on hover
        this.map.on('mouseenter', this.options.layerId, () => {
            this.map.getCanvas().style.cursor = 'pointer';
        });
        
        this.map.on('mouseleave', this.options.layerId, () => {
            this.map.getCanvas().style.cursor = '';
        });
        
        this.map.on('mouseenter', this.options.unclusteredLayerId, () => {
            this.map.getCanvas().style.cursor = 'pointer';
        });
        
        this.map.on('mouseleave', this.options.unclusteredLayerId, () => {
            this.map.getCanvas().style.cursor = '';
        });
    }
    
    /**
     * Update clustering data
     * @param {Object} geojsonData - New GeoJSON data
     */
    updateData(geojsonData) {
        if (!this.isInitialized) {
            throw new Error('Clustering not initialized. Call init() first.');
        }
        
        const source = this.map.getSource(this.options.sourceId);
        if (source) {
            source.setData(geojsonData);
        }
    }
    
    /**
     * Update cluster styling
     * @param {Object} style - Style configuration
     */
    updateStyle(style) {
        if (!this.isInitialized) return;
        
        if (style.clusterColors) {
            this.map.setPaintProperty(this.options.layerId, 'circle-color', [
                'step',
                ['get', 'point_count'],
                style.clusterColors[0] || '#51bbd6',
                100,
                style.clusterColors[1] || '#f1f075',
                750,
                style.clusterColors[2] || '#f28cb1'
            ]);
        }
        
        if (style.clusterRadii) {
            this.map.setPaintProperty(this.options.layerId, 'circle-radius', [
                'step',
                ['get', 'point_count'],
                style.clusterRadii[0] || 20,
                100,
                style.clusterRadii[1] || 30,
                750,
                style.clusterRadii[2] || 40
            ]);
        }
        
        if (style.unclusteredColor) {
            this.map.setPaintProperty(this.options.unclusteredLayerId, 'circle-color', style.unclusteredColor);
        }
        
        if (style.unclusteredRadius) {
            this.map.setPaintProperty(this.options.unclusteredLayerId, 'circle-radius', style.unclusteredRadius);
        }
    }
    
    /**
     * Set cluster visibility
     * @param {boolean} visible - Whether clusters should be visible
     */
    setVisibility(visible) {
        if (!this.isInitialized) return;
        
        const visibility = visible ? 'visible' : 'none';
        
        this.map.setLayoutProperty(this.options.layerId, 'visibility', visibility);
        this.map.setLayoutProperty(this.options.clusterLayerId, 'visibility', visibility);
        this.map.setLayoutProperty(this.options.unclusteredLayerId, 'visibility', visibility);
    }
    
    /**
     * Get cluster statistics
     * @returns {Object} Statistics about the clusters
     */
    getClusterStats() {
        if (!this.isInitialized) return null;
        
        const features = this.map.querySourceFeatures(this.options.sourceId);
        const clusters = features.filter(f => f.properties.cluster);
        const unclustered = features.filter(f => !f.properties.cluster);
        
        const clusterSizes = clusters.map(c => c.properties.point_count);
        
        return {
            totalFeatures: features.length,
            clusterCount: clusters.length,
            unclusteredCount: unclustered.length,
            avgClusterSize: clusterSizes.length > 0 ? 
                clusterSizes.reduce((a, b) => a + b, 0) / clusterSizes.length : 0,
            maxClusterSize: clusterSizes.length > 0 ? Math.max(...clusterSizes) : 0,
            minClusterSize: clusterSizes.length > 0 ? Math.min(...clusterSizes) : 0
        };
    }
    
    /**
     * Get clusters at current zoom level
     * @returns {Array} Array of cluster features
     */
    getClusters() {
        if (!this.isInitialized) return [];
        
        return this.map.querySourceFeatures(this.options.sourceId, {
            filter: ['has', 'point_count']
        });
    }
    
    /**
     * Get unclustered points at current zoom level
     * @returns {Array} Array of point features
     */
    getUnclusteredPoints() {
        if (!this.isInitialized) return [];
        
        return this.map.querySourceFeatures(this.options.sourceId, {
            filter: ['!', ['has', 'point_count']]
        });
    }
    
    /**
     * Get leaves (individual points) for a cluster
     * @param {number} clusterId - The cluster ID
     * @param {number} limit - Maximum number of leaves to return
     * @param {number} offset - Offset for pagination
     * @returns {Promise} Promise that resolves to an array of features
     */
    getClusterLeaves(clusterId, limit = 10, offset = 0) {
        return new Promise((resolve, reject) => {
            this.map.getSource(this.options.sourceId).getClusterLeaves(
                clusterId,
                limit,
                offset,
                (err, features) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(features);
                    }
                }
            );
        });
    }
    
    /**
     * Remove clustering from map
     */
    destroy() {
        if (!this.isInitialized) return;
        
        // Remove layers
        if (this.map.getLayer(this.options.layerId)) {
            this.map.removeLayer(this.options.layerId);
        }
        if (this.map.getLayer(this.options.clusterLayerId)) {
            this.map.removeLayer(this.options.clusterLayerId);
        }
        if (this.map.getLayer(this.options.unclusteredLayerId)) {
            this.map.removeLayer(this.options.unclusteredLayerId);
        }
        
        // Remove source
        if (this.map.getSource(this.options.sourceId)) {
            this.map.removeSource(this.options.sourceId);
        }
        
        this.isInitialized = false;
    }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapboxClustering;
}

// Add CSS for popup styling
const clusteringCSS = `
.cluster-popup {
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    line-height: 1.4;
    max-width: 200px;
}

.cluster-popup p {
    margin: 5px 0;
    word-wrap: break-word;
}

.cluster-popup strong {
    color: #333;
}
`;

// Inject CSS if in browser environment
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = clusteringCSS;
    document.head.appendChild(style);
}

// Usage example:
/*
// Initialize map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-74.5, 40],
    zoom: 9
});

// Create clustering instance
const clustering = new MapboxClustering(map, {
    clusterRadius: 50,
    clusterMaxZoom: 14
});

// Load and add data
fetch('data.geojson')
    .then(response => response.json())
    .then(data => {
        clustering.init(data);
    });

// Update styling
clustering.updateStyle({
    clusterColors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    clusterRadii: [15, 25, 35],
    unclusteredColor: '#96CEB4'
});

// Get statistics
console.log(clustering.getClusterStats());
*/