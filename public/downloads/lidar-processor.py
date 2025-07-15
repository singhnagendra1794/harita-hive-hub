#!/usr/bin/env python3
"""
LiDAR Point Cloud Processor
Process and analyze LiDAR point clouds for forestry, urban planning, and archaeology applications.

License: BSD-3
Author: HaritaHive Team
Dependencies: open3d, numpy, laspy
"""

import open3d as o3d
import numpy as np
import laspy
import argparse
from pathlib import Path

class LiDARProcessor:
    def __init__(self):
        self.point_cloud = None
        self.ground_points = None
        self.vegetation_points = None
        self.building_points = None
    
    def load_las_file(self, filepath):
        """Load LAS/LAZ file"""
        las_file = laspy.read(filepath)
        
        # Extract coordinates
        points = np.vstack((las_file.x, las_file.y, las_file.z)).transpose()
        
        # Create Open3D point cloud
        self.point_cloud = o3d.geometry.PointCloud()
        self.point_cloud.points = o3d.utility.Vector3dVector(points)
        
        # Add colors if available
        if hasattr(las_file, 'red'):
            colors = np.vstack((las_file.red, las_file.green, las_file.blue)).transpose()
            colors = colors / 65535.0  # Normalize to 0-1
            self.point_cloud.colors = o3d.utility.Vector3dVector(colors)
        
        print(f"Loaded {len(points)} points from {filepath}")
        return self.point_cloud
    
    def classify_ground(self, threshold=0.5):
        """Classify ground points using RANSAC plane fitting"""
        if self.point_cloud is None:
            raise ValueError("No point cloud loaded")
        
        # Segment ground plane
        plane_model, inliers = self.point_cloud.segment_plane(
            distance_threshold=threshold,
            ransac_n=3,
            num_iterations=1000
        )
        
        # Separate ground and non-ground points
        self.ground_points = self.point_cloud.select_by_index(inliers)
        non_ground = self.point_cloud.select_by_index(inliers, invert=True)
        
        # Color ground points brown
        self.ground_points.paint_uniform_color([0.6, 0.4, 0.2])
        
        print(f"Ground points: {len(inliers)}")
        print(f"Non-ground points: {len(non_ground.points)}")
        
        return self.ground_points, non_ground
    
    def detect_vegetation(self, height_threshold=0.5, density_threshold=0.1):
        """Detect vegetation points based on height and local density"""
        if self.ground_points is None:
            self.classify_ground()
        
        non_ground = self.point_cloud.select_by_index(
            range(len(self.point_cloud.points)), invert=False
        )
        
        # Calculate height above ground
        points = np.asarray(non_ground.points)
        ground_z = np.mean(np.asarray(self.ground_points.points)[:, 2])
        
        # Filter by height
        height_mask = (points[:, 2] - ground_z) > height_threshold
        
        if np.sum(height_mask) > 0:
            vegetation_indices = np.where(height_mask)[0]
            self.vegetation_points = non_ground.select_by_index(vegetation_indices)
            self.vegetation_points.paint_uniform_color([0.0, 0.8, 0.0])  # Green
            
            print(f"Vegetation points: {len(vegetation_indices)}")
            return self.vegetation_points
        
        return None
    
    def detect_buildings(self, min_height=3.0, max_height=50.0):
        """Detect building structures using clustering and height filtering"""
        if self.ground_points is None:
            self.classify_ground()
        
        non_ground = self.point_cloud.select_by_index(
            range(len(self.point_cloud.points)), invert=False
        )
        
        points = np.asarray(non_ground.points)
        ground_z = np.mean(np.asarray(self.ground_points.points)[:, 2])
        
        # Filter by building height range
        height_mask = ((points[:, 2] - ground_z) >= min_height) & \
                     ((points[:, 2] - ground_z) <= max_height)
        
        if np.sum(height_mask) > 0:
            building_candidates = non_ground.select_by_index(np.where(height_mask)[0])
            
            # Cluster potential building points
            labels = np.array(building_candidates.cluster_dbscan(
                eps=2.0, min_points=50, print_progress=False
            ))
            
            # Filter clusters by size and shape
            building_indices = []
            for label in np.unique(labels):
                if label == -1:  # Noise
                    continue
                
                cluster_mask = labels == label
                if np.sum(cluster_mask) > 100:  # Minimum cluster size
                    building_indices.extend(np.where(height_mask)[0][cluster_mask])
            
            if building_indices:
                self.building_points = non_ground.select_by_index(building_indices)
                self.building_points.paint_uniform_color([0.8, 0.0, 0.0])  # Red
                
                print(f"Building points: {len(building_indices)}")
                return self.building_points
        
        return None
    
    def calculate_canopy_height_model(self, resolution=1.0):
        """Calculate Canopy Height Model (CHM)"""
        if self.vegetation_points is None:
            self.detect_vegetation()
        
        if self.vegetation_points is None:
            print("No vegetation points found")
            return None
        
        # Get bounding box
        veg_points = np.asarray(self.vegetation_points.points)
        ground_points = np.asarray(self.ground_points.points)
        
        min_x, min_y = np.min(veg_points[:, :2], axis=0)
        max_x, max_y = np.max(veg_points[:, :2], axis=0)
        
        # Create grid
        x_coords = np.arange(min_x, max_x, resolution)
        y_coords = np.arange(min_y, max_y, resolution)
        
        chm = np.zeros((len(y_coords), len(x_coords)))
        
        # Calculate height for each grid cell
        for i, y in enumerate(y_coords):
            for j, x in enumerate(x_coords):
                # Find points in this grid cell
                mask = ((veg_points[:, 0] >= x) & (veg_points[:, 0] < x + resolution) &
                       (veg_points[:, 1] >= y) & (veg_points[:, 1] < y + resolution))
                
                if np.any(mask):
                    # Maximum vegetation height in cell
                    max_veg_z = np.max(veg_points[mask, 2])
                    
                    # Ground height (interpolated)
                    ground_z = np.mean(ground_points[:, 2])  # Simplified
                    
                    chm[i, j] = max_veg_z - ground_z
        
        print(f"Generated CHM with resolution {resolution}m")
        return chm, x_coords, y_coords
    
    def filter_noise(self, nb_neighbors=20, std_ratio=2.0):
        """Remove statistical outliers"""
        if self.point_cloud is None:
            raise ValueError("No point cloud loaded")
        
        cl, ind = self.point_cloud.remove_statistical_outlier(
            nb_neighbors=nb_neighbors,
            std_ratio=std_ratio
        )
        
        self.point_cloud = self.point_cloud.select_by_index(ind)
        print(f"Removed {len(self.point_cloud.points) - len(ind)} outlier points")
        
        return self.point_cloud
    
    def downsample(self, voxel_size=0.1):
        """Downsample point cloud using voxel grid"""
        if self.point_cloud is None:
            raise ValueError("No point cloud loaded")
        
        original_size = len(self.point_cloud.points)
        self.point_cloud = self.point_cloud.voxel_down_sample(voxel_size)
        
        print(f"Downsampled from {original_size} to {len(self.point_cloud.points)} points")
        return self.point_cloud
    
    def save_classified_clouds(self, output_dir):
        """Save classified point clouds"""
        output_dir = Path(output_dir)
        output_dir.mkdir(exist_ok=True)
        
        if self.ground_points:
            o3d.io.write_point_cloud(str(output_dir / "ground.ply"), self.ground_points)
        
        if self.vegetation_points:
            o3d.io.write_point_cloud(str(output_dir / "vegetation.ply"), self.vegetation_points)
        
        if self.building_points:
            o3d.io.write_point_cloud(str(output_dir / "buildings.ply"), self.building_points)
        
        print(f"Saved classified point clouds to {output_dir}")
    
    def visualize(self):
        """Visualize point cloud"""
        geometries = []
        
        if self.ground_points:
            geometries.append(self.ground_points)
        
        if self.vegetation_points:
            geometries.append(self.vegetation_points)
        
        if self.building_points:
            geometries.append(self.building_points)
        
        if not geometries:
            geometries = [self.point_cloud]
        
        o3d.visualization.draw_geometries(geometries)

def main():
    parser = argparse.ArgumentParser(description='Process LiDAR point clouds')
    parser.add_argument('input', help='Input LAS/LAZ file')
    parser.add_argument('--output-dir', default='output', help='Output directory')
    parser.add_argument('--ground-threshold', type=float, default=0.5, 
                       help='Ground plane threshold')
    parser.add_argument('--veg-height', type=float, default=0.5,
                       help='Minimum vegetation height')
    parser.add_argument('--building-min-height', type=float, default=3.0,
                       help='Minimum building height')
    parser.add_argument('--downsample', type=float, default=0.1,
                       help='Voxel size for downsampling')
    parser.add_argument('--visualize', action='store_true',
                       help='Show 3D visualization')
    
    args = parser.parse_args()
    
    # Initialize processor
    processor = LiDARProcessor()
    
    # Load point cloud
    processor.load_las_file(args.input)
    
    # Preprocess
    processor.filter_noise()
    processor.downsample(args.downsample)
    
    # Classify
    processor.classify_ground(args.ground_threshold)
    processor.detect_vegetation(args.veg_height)
    processor.detect_buildings(args.building_min_height)
    
    # Calculate CHM
    chm, x_coords, y_coords = processor.calculate_canopy_height_model()
    
    # Save results
    processor.save_classified_clouds(args.output_dir)
    
    # Visualize if requested
    if args.visualize:
        processor.visualize()
    
    print("Processing complete!")

if __name__ == "__main__":
    main()