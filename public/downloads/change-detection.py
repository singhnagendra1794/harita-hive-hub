#!/usr/bin/env python3
"""
Change Detection Tool
Detect land cover changes between multi-temporal satellite images.

License: MIT
Author: HaritaHive Team
"""

import cv2
import numpy as np
import rasterio
from rasterio.windows import Window
from skimage import filters, morphology, measure
import argparse
import matplotlib.pyplot as plt

class ChangeDetector:
    def __init__(self, image1_path, image2_path):
        self.image1_path = image1_path
        self.image2_path = image2_path
        
    def load_images(self):
        """Load and preprocess images"""
        
        with rasterio.open(self.image1_path) as src1:
            self.image1 = src1.read()
            self.profile = src1.profile
            self.transform = src1.transform
            
        with rasterio.open(self.image2_path) as src2:
            self.image2 = src2.read()
            
        # Ensure images have same dimensions
        if self.image1.shape != self.image2.shape:
            raise ValueError("Images must have the same dimensions")
            
        print(f"Loaded images: {self.image1.shape}")
        
    def preprocess_images(self):
        """Preprocess images for change detection"""
        
        # Convert to float and normalize
        self.image1 = self.image1.astype(np.float32) / 255.0
        self.image2 = self.image2.astype(np.float32) / 255.0
        
        # Apply Gaussian filtering to reduce noise
        for i in range(self.image1.shape[0]):
            self.image1[i] = filters.gaussian(self.image1[i], sigma=1.0)
            self.image2[i] = filters.gaussian(self.image2[i], sigma=1.0)
            
    def calculate_ndvi(self, image):
        """Calculate NDVI from multi-spectral image"""
        
        if image.shape[0] < 4:
            print("Warning: Image has less than 4 bands, using simple difference")
            return np.mean(image, axis=0)
            
        # Assuming bands are in order: Blue, Green, Red, NIR
        red = image[2]
        nir = image[3]
        
        # Calculate NDVI
        ndvi = (nir - red) / (nir + red + 1e-8)
        return ndvi
        
    def detect_changes_spectral(self, threshold=0.1):
        """Detect changes using spectral difference"""
        
        # Calculate spectral difference
        diff = np.abs(self.image2 - self.image1)
        
        # Calculate magnitude of change
        change_magnitude = np.sqrt(np.sum(diff**2, axis=0))
        
        # Apply threshold
        change_mask = change_magnitude > threshold
        
        return change_mask, change_magnitude
        
    def detect_changes_ndvi(self, threshold=0.2):
        """Detect changes using NDVI difference"""
        
        ndvi1 = self.calculate_ndvi(self.image1)
        ndvi2 = self.calculate_ndvi(self.image2)
        
        # Calculate NDVI difference
        ndvi_diff = ndvi2 - ndvi1
        
        # Classify changes
        vegetation_loss = ndvi_diff < -threshold  # Negative change
        vegetation_gain = ndvi_diff > threshold   # Positive change
        no_change = np.abs(ndvi_diff) <= threshold
        
        return {
            'vegetation_loss': vegetation_loss,
            'vegetation_gain': vegetation_gain,
            'no_change': no_change,
            'ndvi_diff': ndvi_diff
        }
        
    def detect_changes_pca(self, threshold=0.1):
        """Detect changes using PCA transformation"""
        
        # Reshape images for PCA
        h, w = self.image1.shape[1], self.image1.shape[2]
        bands = self.image1.shape[0]
        
        # Stack images
        stacked = np.concatenate([
            self.image1.reshape(bands, -1),
            self.image2.reshape(bands, -1)
        ], axis=1)
        
        # Compute PCA
        mean = np.mean(stacked, axis=1, keepdims=True)
        centered = stacked - mean
        
        cov_matrix = np.cov(centered)
        eigenvals, eigenvecs = np.linalg.eigh(cov_matrix)
        
        # Sort by eigenvalues (descending)
        idx = np.argsort(eigenvals)[::-1]
        eigenvecs = eigenvecs[:, idx]
        
        # Transform images
        img1_flat = self.image1.reshape(bands, -1) - mean
        img2_flat = self.image2.reshape(bands, -1) - mean
        
        pca1 = eigenvecs.T @ img1_flat
        pca2 = eigenvecs.T @ img2_flat
        
        # Calculate change vector
        change_vector = pca2 - pca1
        change_magnitude = np.sqrt(np.sum(change_vector**2, axis=0))
        
        # Reshape back
        change_magnitude = change_magnitude.reshape(h, w)
        
        # Apply threshold
        change_mask = change_magnitude > threshold
        
        return change_mask, change_magnitude
        
    def post_process_changes(self, change_mask, min_area=100):
        """Post-process change detection results"""
        
        # Remove small objects
        change_mask_clean = morphology.remove_small_objects(
            change_mask, min_size=min_area
        )
        
        # Fill small holes
        change_mask_clean = morphology.remove_small_holes(
            change_mask_clean, area_threshold=min_area//2
        )
        
        # Label connected components
        labeled = measure.label(change_mask_clean)
        
        return change_mask_clean, labeled
        
    def save_results(self, change_mask, output_path):
        """Save change detection results"""
        
        # Update profile for output
        profile = self.profile.copy()
        profile.update(
            dtype=rasterio.uint8,
            count=1,
            compress='lzw'
        )
        
        # Convert to uint8
        change_uint8 = (change_mask * 255).astype(np.uint8)
        
        with rasterio.open(output_path, 'w', **profile) as dst:
            dst.write(change_uint8, 1)
            
        print(f"Change detection results saved to {output_path}")
        
    def visualize_results(self, change_mask, change_magnitude, output_path=None):
        """Visualize change detection results"""
        
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        
        # Original images (first 3 bands as RGB)
        if self.image1.shape[0] >= 3:
            rgb1 = np.transpose(self.image1[:3], (1, 2, 0))
            rgb2 = np.transpose(self.image2[:3], (1, 2, 0))
            
            axes[0, 0].imshow(rgb1)
            axes[0, 0].set_title('Image 1 (RGB)')
            axes[0, 0].axis('off')
            
            axes[0, 1].imshow(rgb2)
            axes[0, 1].set_title('Image 2 (RGB)')
            axes[0, 1].axis('off')
        
        # Change magnitude
        im1 = axes[1, 0].imshow(change_magnitude, cmap='hot')
        axes[1, 0].set_title('Change Magnitude')
        axes[1, 0].axis('off')
        plt.colorbar(im1, ax=axes[1, 0])
        
        # Change mask
        axes[1, 1].imshow(change_mask, cmap='Reds')
        axes[1, 1].set_title('Change Mask')
        axes[1, 1].axis('off')
        
        plt.tight_layout()
        
        if output_path:
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            print(f"Visualization saved to {output_path}")
        else:
            plt.show()

def main():
    parser = argparse.ArgumentParser(description='Detect changes between two satellite images')
    parser.add_argument('image1', help='Path to first image')
    parser.add_argument('image2', help='Path to second image')
    parser.add_argument('--method', choices=['spectral', 'ndvi', 'pca'], 
                       default='spectral', help='Change detection method')
    parser.add_argument('--threshold', type=float, default=0.1, 
                       help='Change detection threshold')
    parser.add_argument('--output', help='Output change mask path')
    parser.add_argument('--viz-output', help='Output visualization path')
    parser.add_argument('--min-area', type=int, default=100, 
                       help='Minimum area for change objects')
    
    args = parser.parse_args()
    
    # Initialize change detector
    detector = ChangeDetector(args.image1, args.image2)
    
    # Load and preprocess images
    detector.load_images()
    detector.preprocess_images()
    
    # Detect changes
    if args.method == 'spectral':
        change_mask, change_magnitude = detector.detect_changes_spectral(args.threshold)
    elif args.method == 'ndvi':
        results = detector.detect_changes_ndvi(args.threshold)
        change_mask = results['vegetation_loss'] | results['vegetation_gain']
        change_magnitude = np.abs(results['ndvi_diff'])
    elif args.method == 'pca':
        change_mask, change_magnitude = detector.detect_changes_pca(args.threshold)
    
    # Post-process results
    change_mask, labeled = detector.post_process_changes(change_mask, args.min_area)
    
    # Calculate statistics
    total_pixels = change_mask.size
    changed_pixels = np.sum(change_mask)
    change_percentage = (changed_pixels / total_pixels) * 100
    
    print(f"Change Detection Results:")
    print(f"  Method: {args.method}")
    print(f"  Threshold: {args.threshold}")
    print(f"  Changed pixels: {changed_pixels:,}")
    print(f"  Total pixels: {total_pixels:,}")
    print(f"  Change percentage: {change_percentage:.2f}%")
    print(f"  Number of change objects: {np.max(labeled)}")
    
    # Save results
    if args.output:
        detector.save_results(change_mask, args.output)
    
    # Create visualization
    detector.visualize_results(change_mask, change_magnitude, args.viz_output)

if __name__ == "__main__":
    main()