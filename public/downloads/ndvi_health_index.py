#!/usr/bin/env python3
"""
NDVI Health Index Calculator
HaritaHive GeoProcessing Lab

This script calculates NDVI from satellite imagery and generates
a comprehensive vegetation health report with visualizations.

Author: HaritaHive Team
Version: 1.0
License: MIT
"""

import rasterio
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from rasterio.plot import show
from rasterio.mask import mask
import geopandas as gpd
from pathlib import Path
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class NDVIHealthCalculator:
    """
    Calculate and analyze NDVI for vegetation health assessment
    """
    
    def __init__(self, red_band_path, nir_band_path, output_dir="outputs"):
        """
        Initialize the NDVI calculator
        
        Args:
            red_band_path (str): Path to red band raster
            nir_band_path (str): Path to NIR band raster
            output_dir (str): Directory for output files
        """
        self.red_band_path = red_band_path
        self.nir_band_path = nir_band_path
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Initialize data containers
        self.red_data = None
        self.nir_data = None
        self.ndvi = None
        self.metadata = {}
        
    def load_bands(self):
        """Load red and NIR bands from raster files"""
        try:
            with rasterio.open(self.red_band_path) as src:
                self.red_data = src.read(1).astype(float)
                self.metadata['crs'] = src.crs
                self.metadata['transform'] = src.transform
                self.metadata['bounds'] = src.bounds
                
            with rasterio.open(self.nir_band_path) as src:
                self.nir_data = src.read(1).astype(float)
                
            print(f"✅ Bands loaded successfully")
            print(f"   Red band shape: {self.red_data.shape}")
            print(f"   NIR band shape: {self.nir_data.shape}")
            
        except Exception as e:
            print(f"❌ Error loading bands: {str(e)}")
            raise
            
    def calculate_ndvi(self):
        """Calculate NDVI from red and NIR bands"""
        if self.red_data is None or self.nir_data is None:
            raise ValueError("Bands not loaded. Call load_bands() first.")
            
        # Calculate NDVI with division by zero protection
        denominator = self.nir_data + self.red_data
        self.ndvi = np.where(
            denominator == 0,
            0,
            (self.nir_data - self.red_data) / denominator
        )
        
        # Calculate statistics
        valid_pixels = self.ndvi[~np.isnan(self.ndvi)]
        self.stats = {
            'min': float(np.min(valid_pixels)),
            'max': float(np.max(valid_pixels)),
            'mean': float(np.mean(valid_pixels)),
            'std': float(np.std(valid_pixels)),
            'median': float(np.median(valid_pixels)),
            'total_pixels': len(valid_pixels)
        }
        
        print(f"✅ NDVI calculated successfully")
        print(f"   Range: {self.stats['min']:.3f} to {self.stats['max']:.3f}")
        print(f"   Mean: {self.stats['mean']:.3f} ± {self.stats['std']:.3f}")
        
    def classify_vegetation(self):
        """
        Classify vegetation health based on NDVI values
        
        Classification:
        0: No vegetation (NDVI < 0)
        1: Sparse vegetation (0 <= NDVI < 0.2)
        2: Moderate vegetation (0.2 <= NDVI < 0.5)
        3: Dense vegetation (NDVI >= 0.5)
        """
        if self.ndvi is None:
            raise ValueError("NDVI not calculated. Call calculate_ndvi() first.")
            
        self.vegetation_class = np.zeros_like(self.ndvi, dtype=int)
        
        # Apply classification thresholds
        self.vegetation_class[self.ndvi < 0] = 0
        self.vegetation_class[(self.ndvi >= 0) & (self.ndvi < 0.2)] = 1
        self.vegetation_class[(self.ndvi >= 0.2) & (self.ndvi < 0.5)] = 2
        self.vegetation_class[self.ndvi >= 0.5] = 3
        
        # Calculate class statistics
        unique, counts = np.unique(self.vegetation_class, return_counts=True)
        total_pixels = np.sum(counts)
        
        self.class_stats = {}
        class_names = ['No Vegetation', 'Sparse', 'Moderate', 'Dense']
        
        for i, (class_id, count) in enumerate(zip(unique, counts)):
            if class_id < len(class_names):
                self.class_stats[class_names[class_id]] = {
                    'count': int(count),
                    'percentage': float(count / total_pixels * 100)
                }
        
        print("✅ Vegetation classification completed")
        for class_name, stats in self.class_stats.items():
            print(f"   {class_name}: {stats['percentage']:.1f}% ({stats['count']} pixels)")
            
    def create_visualizations(self):
        """Create comprehensive visualizations"""
        # Set up the plotting style
        plt.style.use('seaborn-v0_8')
        fig = plt.figure(figsize=(20, 12))
        
        # 1. NDVI map
        ax1 = plt.subplot(2, 3, 1)
        im1 = ax1.imshow(self.ndvi, cmap='RdYlGn', vmin=-1, vmax=1)
        ax1.set_title('NDVI Distribution', fontsize=14, fontweight='bold')
        ax1.axis('off')
        plt.colorbar(im1, ax=ax1, fraction=0.046, pad=0.04, label='NDVI')
        
        # 2. Vegetation classification
        ax2 = plt.subplot(2, 3, 2)
        colors = ['#8B4513', '#FFD700', '#90EE90', '#006400']  # Brown, Gold, LightGreen, DarkGreen
        cmap = plt.matplotlib.colors.ListedColormap(colors)
        im2 = ax2.imshow(self.vegetation_class, cmap=cmap, vmin=0, vmax=3)
        ax2.set_title('Vegetation Classification', fontsize=14, fontweight='bold')
        ax2.axis('off')
        cbar2 = plt.colorbar(im2, ax=ax2, fraction=0.046, pad=0.04, ticks=[0, 1, 2, 3])
        cbar2.set_ticklabels(['None', 'Sparse', 'Moderate', 'Dense'])
        
        # 3. NDVI histogram
        ax3 = plt.subplot(2, 3, 3)
        valid_ndvi = self.ndvi[~np.isnan(self.ndvi)]
        ax3.hist(valid_ndvi, bins=50, alpha=0.7, color='green', edgecolor='black')
        ax3.axvline(self.stats['mean'], color='red', linestyle='--', linewidth=2, label=f"Mean: {self.stats['mean']:.3f}")
        ax3.axvline(self.stats['median'], color='blue', linestyle='--', linewidth=2, label=f"Median: {self.stats['median']:.3f}")
        ax3.set_xlabel('NDVI Value')
        ax3.set_ylabel('Frequency')
        ax3.set_title('NDVI Distribution Histogram', fontsize=14, fontweight='bold')
        ax3.legend()
        ax3.grid(True, alpha=0.3)
        
        # 4. Vegetation class pie chart
        ax4 = plt.subplot(2, 3, 4)
        if self.class_stats:
            labels = list(self.class_stats.keys())
            sizes = [stats['percentage'] for stats in self.class_stats.values()]
            colors_pie = ['#8B4513', '#FFD700', '#90EE90', '#006400'][:len(labels)]
            
            wedges, texts, autotexts = ax4.pie(sizes, labels=labels, colors=colors_pie, 
                                              autopct='%1.1f%%', startangle=90)
            ax4.set_title('Vegetation Coverage Distribution', fontsize=14, fontweight='bold')
        
        # 5. Health index summary
        ax5 = plt.subplot(2, 3, 5)
        ax5.axis('off')
        
        # Calculate health index (0-100 scale)
        health_index = ((self.stats['mean'] + 1) / 2) * 100  # Convert from [-1,1] to [0,100]
        
        # Determine health status
        if health_index >= 70:
            health_status = "Excellent"
            status_color = "green"
        elif health_index >= 50:
            health_status = "Good"
            status_color = "lightgreen"
        elif health_index >= 30:
            health_status = "Fair"
            status_color = "orange"
        else:
            health_status = "Poor"
            status_color = "red"
        
        # Create summary text
        summary_text = f"""
        VEGETATION HEALTH REPORT
        
        Overall Health Index: {health_index:.1f}/100
        Status: {health_status}
        
        STATISTICS:
        Mean NDVI: {self.stats['mean']:.3f}
        Std Deviation: {self.stats['std']:.3f}
        Range: {self.stats['min']:.3f} to {self.stats['max']:.3f}
        
        COVERAGE:
        """
        
        for class_name, stats in self.class_stats.items():
            summary_text += f"{class_name}: {stats['percentage']:.1f}%\n        "
            
        ax5.text(0.1, 0.9, summary_text, transform=ax5.transAxes, fontsize=12,
                verticalalignment='top', bbox=dict(boxstyle="round,pad=0.3", 
                facecolor=status_color, alpha=0.3))
        
        # 6. NDVI boxplot
        ax6 = plt.subplot(2, 3, 6)
        bp = ax6.boxplot(valid_ndvi, patch_artist=True, labels=['NDVI'])
        bp['boxes'][0].set_facecolor('lightgreen')
        ax6.set_ylabel('NDVI Value')
        ax6.set_title('NDVI Statistical Summary', fontsize=14, fontweight='bold')
        ax6.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        # Save the figure
        output_path = self.output_dir / 'ndvi_analysis_report.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"✅ Visualization saved: {output_path}")
        
        return fig
        
    def save_results(self):
        """Save NDVI and classification results as GeoTIFF files"""
        if self.ndvi is None:
            raise ValueError("NDVI not calculated. Call calculate_ndvi() first.")
            
        # Save NDVI
        ndvi_path = self.output_dir / 'ndvi_result.tif'
        with rasterio.open(
            ndvi_path,
            'w',
            driver='GTiff',
            height=self.ndvi.shape[0],
            width=self.ndvi.shape[1],
            count=1,
            dtype=self.ndvi.dtype,
            crs=self.metadata['crs'],
            transform=self.metadata['transform']
        ) as dst:
            dst.write(self.ndvi, 1)
            
        # Save vegetation classification
        class_path = self.output_dir / 'vegetation_classification.tif'
        with rasterio.open(
            class_path,
            'w',
            driver='GTiff',
            height=self.vegetation_class.shape[0],
            width=self.vegetation_class.shape[1],
            count=1,
            dtype=self.vegetation_class.dtype,
            crs=self.metadata['crs'],
            transform=self.metadata['transform']
        ) as dst:
            dst.write(self.vegetation_class, 1)
            
        print(f"✅ Results saved:")
        print(f"   NDVI: {ndvi_path}")
        print(f"   Classification: {class_path}")
        
    def generate_report(self):
        """Generate a comprehensive JSON report"""
        report = {
            'analysis_date': datetime.now().isoformat(),
            'input_files': {
                'red_band': str(self.red_band_path),
                'nir_band': str(self.nir_band_path)
            },
            'ndvi_statistics': self.stats,
            'vegetation_classification': self.class_stats,
            'metadata': {
                'crs': str(self.metadata['crs']),
                'bounds': list(self.metadata['bounds'])
            }
        }
        
        report_path = self.output_dir / 'ndvi_health_report.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
            
        print(f"✅ Report saved: {report_path}")
        return report

def main():
    """
    Main function to run NDVI analysis
    Replace with your actual file paths
    """
    
    # Example usage
    print("🌱 NDVI Health Index Calculator")
    print("   HaritaHive GeoProcessing Lab")
    print("="*50)
    
    # Initialize calculator (replace with your file paths)
    red_band = "path/to/your/red_band.tif"
    nir_band = "path/to/your/nir_band.tif"
    
    try:
        calculator = NDVIHealthCalculator(red_band, nir_band)
        
        # Run analysis pipeline
        calculator.load_bands()
        calculator.calculate_ndvi()
        calculator.classify_vegetation()
        calculator.create_visualizations()
        calculator.save_results()
        calculator.generate_report()
        
        print("\n🎉 Analysis completed successfully!")
        print(f"   Check the 'outputs' folder for results")
        
    except FileNotFoundError:
        print("❌ Input files not found. Please update file paths in the script.")
        print("   This is a demo script - replace with your actual data paths.")
    except Exception as e:
        print(f"❌ Error during analysis: {str(e)}")

if __name__ == "__main__":
    main()