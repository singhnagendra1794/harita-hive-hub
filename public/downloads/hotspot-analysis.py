#!/usr/bin/env python3
"""
Hotspot Analysis Tool
Identify spatial clusters and hotspots using Getis-Ord Gi* statistics.

License: MIT
Author: HaritaHive Team
"""

import numpy as np
import pandas as pd
import geopandas as gpd
from scipy.spatial.distance import pdist, squareform
from scipy.stats import norm
import argparse
import matplotlib.pyplot as plt
import seaborn as sns

class HotspotAnalyzer:
    def __init__(self, data, value_column, distance_threshold=1000):
        """
        Initialize hotspot analyzer
        
        Args:
            data: GeoDataFrame with point geometries
            value_column: Column name containing values for analysis
            distance_threshold: Distance threshold for spatial neighbors (meters)
        """
        self.data = data.copy()
        self.value_column = value_column
        self.distance_threshold = distance_threshold
        self.weights_matrix = None
        self.gi_scores = None
        self.z_scores = None
        
    def create_spatial_weights(self, method='distance'):
        """Create spatial weights matrix"""
        
        # Get coordinates
        coords = np.array([[point.x, point.y] for point in self.data.geometry])
        
        if method == 'distance':
            # Distance-based weights
            distances = squareform(pdist(coords))
            weights = np.where(distances <= self.distance_threshold, 1, 0)
            np.fill_diagonal(weights, 0)  # No self-neighbors
            
        elif method == 'knn':
            # K-nearest neighbors (k=8)
            k = min(8, len(self.data) - 1)
            distances = squareform(pdist(coords))
            weights = np.zeros_like(distances)
            
            for i in range(len(distances)):
                # Get k nearest neighbors
                neighbors = np.argsort(distances[i])[1:k+1]  # Exclude self
                weights[i, neighbors] = 1
                
        # Row-standardize weights
        row_sums = weights.sum(axis=1)
        weights = np.divide(weights, row_sums[:, np.newaxis], 
                          out=np.zeros_like(weights), where=row_sums[:, np.newaxis]!=0)
        
        self.weights_matrix = weights
        return weights
        
    def calculate_getis_ord_gi(self):
        """Calculate Getis-Ord Gi* statistics"""
        
        if self.weights_matrix is None:
            self.create_spatial_weights()
            
        values = self.data[self.value_column].values
        n = len(values)
        
        # Calculate global statistics
        global_mean = np.mean(values)
        global_std = np.std(values)
        
        # Calculate Gi* for each location
        gi_scores = []
        z_scores = []
        
        for i in range(n):
            # Get neighbors (including self for Gi*)
            neighbors = np.where(self.weights_matrix[i] > 0)[0]
            neighbors = np.append(neighbors, i)  # Include self
            
            # Calculate local statistics
            local_sum = np.sum(values[neighbors])
            local_n = len(neighbors)
            
            # Expected value under null hypothesis
            expected = local_n * global_mean
            
            # Variance under null hypothesis
            s_squared = np.sum((values - global_mean) ** 2) / n
            variance = s_squared * (local_n * (n - local_n)) / (n - 1)
            
            # Gi* score
            if variance > 0:
                gi_star = (local_sum - expected) / np.sqrt(variance)
            else:
                gi_star = 0
                
            gi_scores.append(gi_star)
            
            # Convert to z-score
            z_score = gi_star
            z_scores.append(z_score)
            
        self.gi_scores = np.array(gi_scores)
        self.z_scores = np.array(z_scores)
        
        return self.gi_scores, self.z_scores
        
    def classify_hotspots(self, confidence_levels=[0.90, 0.95, 0.99]):
        """Classify hotspots based on significance levels"""
        
        if self.z_scores is None:
            self.calculate_getis_ord_gi()
            
        # Calculate critical values for different confidence levels
        critical_values = {}
        for conf in confidence_levels:
            alpha = 1 - conf
            critical_values[conf] = norm.ppf(1 - alpha/2)
            
        # Classify each point
        classifications = []
        significance_levels = []
        
        for z in self.z_scores:
            if z > critical_values[0.99]:
                classifications.append("Hot Spot - 99% Confidence")
                significance_levels.append(0.99)
            elif z > critical_values[0.95]:
                classifications.append("Hot Spot - 95% Confidence")
                significance_levels.append(0.95)
            elif z > critical_values[0.90]:
                classifications.append("Hot Spot - 90% Confidence")
                significance_levels.append(0.90)
            elif z < -critical_values[0.99]:
                classifications.append("Cold Spot - 99% Confidence")
                significance_levels.append(0.99)
            elif z < -critical_values[0.95]:
                classifications.append("Cold Spot - 95% Confidence")
                significance_levels.append(0.95)
            elif z < -critical_values[0.90]:
                classifications.append("Cold Spot - 90% Confidence")
                significance_levels.append(0.90)
            else:
                classifications.append("Not Significant")
                significance_levels.append(0.0)
                
        # Add results to data
        self.data['Gi_Score'] = self.gi_scores
        self.data['Z_Score'] = self.z_scores
        self.data['Hotspot_Type'] = classifications
        self.data['Significance'] = significance_levels
        
        return classifications, significance_levels
        
    def get_summary_statistics(self):
        """Get summary statistics of hotspot analysis"""
        
        if 'Hotspot_Type' not in self.data.columns:
            self.classify_hotspots()
            
        summary = self.data['Hotspot_Type'].value_counts()
        
        # Calculate percentages
        percentages = (summary / len(self.data) * 100).round(2)
        
        return {
            'counts': summary.to_dict(),
            'percentages': percentages.to_dict(),
            'total_points': len(self.data),
            'significant_points': len(self.data[self.data['Significance'] > 0]),
            'hot_spots': len(self.data[self.data['Z_Score'] > 1.65]),
            'cold_spots': len(self.data[self.data['Z_Score'] < -1.65])
        }
        
    def visualize_results(self, output_path=None, figsize=(12, 8)):
        """Create visualization of hotspot analysis results"""
        
        if 'Hotspot_Type' not in self.data.columns:
            self.classify_hotspots()
            
        fig, axes = plt.subplots(1, 2, figsize=figsize)
        
        # Plot 1: Spatial distribution of hotspots
        ax1 = axes[0]
        
        # Define colors for different hotspot types
        color_map = {
            'Hot Spot - 99% Confidence': '#d73027',
            'Hot Spot - 95% Confidence': '#f46d43',
            'Hot Spot - 90% Confidence': '#fdae61',
            'Not Significant': '#ffffbf',
            'Cold Spot - 90% Confidence': '#abd9e9',
            'Cold Spot - 95% Confidence': '#74add1',
            'Cold Spot - 99% Confidence': '#313695'
        }
        
        for hotspot_type, color in color_map.items():
            subset = self.data[self.data['Hotspot_Type'] == hotspot_type]
            if len(subset) > 0:
                subset.plot(ax=ax1, color=color, markersize=30, 
                          label=hotspot_type, alpha=0.7)
        
        ax1.set_title('Spatial Distribution of Hot/Cold Spots')
        ax1.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        ax1.set_xlabel('X Coordinate')
        ax1.set_ylabel('Y Coordinate')
        
        # Plot 2: Histogram of Z-scores
        ax2 = axes[1]
        ax2.hist(self.z_scores, bins=30, alpha=0.7, color='skyblue', edgecolor='black')
        ax2.axvline(x=1.65, color='red', linestyle='--', label='90% Confidence')
        ax2.axvline(x=1.96, color='orange', linestyle='--', label='95% Confidence')
        ax2.axvline(x=2.58, color='red', linestyle='-', label='99% Confidence')
        ax2.axvline(x=-1.65, color='red', linestyle='--')
        ax2.axvline(x=-1.96, color='orange', linestyle='--')
        ax2.axvline(x=-2.58, color='red', linestyle='-')
        ax2.axvline(x=0, color='black', linestyle='-', alpha=0.5)
        
        ax2.set_title('Distribution of Gi* Z-Scores')
        ax2.set_xlabel('Z-Score')
        ax2.set_ylabel('Frequency')
        ax2.legend()
        ax2.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        if output_path:
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"Visualization saved to {output_path}")
        else:
            plt.show()
            
    def save_results(self, output_path):
        """Save results to file"""
        
        if 'Hotspot_Type' not in self.data.columns:
            self.classify_hotspots()
            
        # Save to shapefile or GeoJSON based on extension
        if output_path.endswith('.shp'):
            self.data.to_file(output_path)
        elif output_path.endswith('.geojson'):
            self.data.to_file(output_path, driver='GeoJSON')
        else:
            # Save as CSV (without geometry)
            df = pd.DataFrame(self.data.drop(columns='geometry'))
            df.to_csv(output_path, index=False)
            
        print(f"Results saved to {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Perform hotspot analysis using Getis-Ord Gi*')
    parser.add_argument('input_file', help='Input vector file (shapefile, GeoJSON, etc.)')
    parser.add_argument('--value-column', required=True, help='Column containing values for analysis')
    parser.add_argument('--distance', type=float, default=1000, 
                       help='Distance threshold for neighbors (meters)')
    parser.add_argument('--method', choices=['distance', 'knn'], default='distance',
                       help='Method for defining spatial neighbors')
    parser.add_argument('--output', help='Output file for results')
    parser.add_argument('--viz-output', help='Output file for visualization')
    parser.add_argument('--confidence', nargs='+', type=float, 
                       default=[0.90, 0.95, 0.99], help='Confidence levels')
    
    args = parser.parse_args()
    
    # Load data
    try:
        data = gpd.read_file(args.input_file)
        print(f"Loaded {len(data)} features from {args.input_file}")
    except Exception as e:
        print(f"Error loading data: {e}")
        return
    
    # Check if value column exists
    if args.value_column not in data.columns:
        print(f"Error: Column '{args.value_column}' not found in data")
        print(f"Available columns: {list(data.columns)}")
        return
    
    # Ensure data has point geometry
    if not all(data.geometry.type == 'Point'):
        print("Warning: Data contains non-point geometries. Converting to centroids.")
        data['geometry'] = data.geometry.centroid
    
    # Initialize analyzer
    analyzer = HotspotAnalyzer(data, args.value_column, args.distance)
    
    # Create spatial weights
    print(f"Creating spatial weights using {args.method} method...")
    analyzer.create_spatial_weights(method=args.method)
    
    # Calculate Gi* statistics
    print("Calculating Getis-Ord Gi* statistics...")
    gi_scores, z_scores = analyzer.calculate_getis_ord_gi()
    
    # Classify hotspots
    print("Classifying hotspots...")
    classifications, significance = analyzer.classify_hotspots(args.confidence)
    
    # Print summary statistics
    summary = analyzer.get_summary_statistics()
    print("\nHotspot Analysis Results:")
    print(f"Total points analyzed: {summary['total_points']}")
    print(f"Significant points: {summary['significant_points']}")
    print(f"Hot spots (Z > 1.65): {summary['hot_spots']}")
    print(f"Cold spots (Z < -1.65): {summary['cold_spots']}")
    print("\nClassification counts:")
    for class_type, count in summary['counts'].items():
        percentage = summary['percentages'][class_type]
        print(f"  {class_type}: {count} ({percentage}%)")
    
    # Save results
    if args.output:
        analyzer.save_results(args.output)
    
    # Create visualization
    analyzer.visualize_results(args.viz_output)

if __name__ == "__main__":
    main()