#!/usr/bin/env python3
"""
Raster Mosaic Creator
Seamlessly mosaic multiple raster files with color matching and edge blending.

License: MIT
Author: HaritaHive Team
"""

import gdal
import numpy as np
import cv2
import argparse
import os

def create_mosaic(input_files, output_file, blend_method='feather'):
    """Create seamless mosaic from multiple raster files"""
    
    # Read all input files
    datasets = []
    for file in input_files:
        ds = gdal.Open(file)
        if ds is None:
            print(f"Error: Could not open {file}")
            continue
        datasets.append(ds)
    
    if not datasets:
        print("Error: No valid input files found")
        return
    
    # Get extent and resolution from first dataset
    first_ds = datasets[0]
    geotransform = first_ds.GetGeoTransform()
    projection = first_ds.GetProjection()
    
    # Calculate output extent
    min_x = min_y = float('inf')
    max_x = max_y = float('-inf')
    
    for ds in datasets:
        gt = ds.GetGeoTransform()
        cols, rows = ds.RasterXSize, ds.RasterYSize
        
        x_coords = [gt[0], gt[0] + cols * gt[1]]
        y_coords = [gt[3], gt[3] + rows * gt[5]]
        
        min_x = min(min_x, min(x_coords))
        max_x = max(max_x, max(x_coords))
        min_y = min(min_y, min(y_coords))
        max_y = max(max_y, max(y_coords))
    
    # Calculate output dimensions
    pixel_width = geotransform[1]
    pixel_height = abs(geotransform[5])
    
    output_cols = int((max_x - min_x) / pixel_width)
    output_rows = int((max_y - min_y) / pixel_height)
    
    # Create output dataset
    driver = gdal.GetDriverByName('GTiff')
    output_ds = driver.Create(output_file, output_cols, output_rows, 
                             first_ds.RasterCount, first_ds.GetRasterBand(1).DataType)
    
    # Set geotransform and projection
    output_gt = (min_x, pixel_width, 0, max_y, 0, -pixel_height)
    output_ds.SetGeoTransform(output_gt)
    output_ds.SetProjection(projection)
    
    # Create mosaic array
    mosaic_array = np.zeros((output_rows, output_cols, first_ds.RasterCount), 
                           dtype=np.uint8)
    weight_array = np.zeros((output_rows, output_cols))
    
    for ds in datasets:
        # Read data
        data = ds.ReadAsArray()
        if data.ndim == 2:
            data = data[np.newaxis, ...]
        
        # Calculate offset in output array
        ds_gt = ds.GetGeoTransform()
        x_offset = int((ds_gt[0] - min_x) / pixel_width)
        y_offset = int((max_y - ds_gt[3]) / pixel_height)
        
        rows, cols = data.shape[1], data.shape[2]
        
        # Apply feather blending
        if blend_method == 'feather':
            # Create distance transform for blending
            mask = np.ones((rows, cols), dtype=np.uint8)
            mask[data[0] == 0] = 0
            
            dist_transform = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
            weights = np.minimum(dist_transform / 50.0, 1.0)  # Feather 50 pixels
            
            # Apply weights to data
            for band in range(data.shape[0]):
                end_y = min(y_offset + rows, output_rows)
                end_x = min(x_offset + cols, output_cols)
                
                data_slice = data[band, :end_y-y_offset, :end_x-x_offset]
                weight_slice = weights[:end_y-y_offset, :end_x-x_offset]
                
                # Weighted average
                current_weights = weight_array[y_offset:end_y, x_offset:end_x]
                total_weights = current_weights + weight_slice
                
                valid_mask = total_weights > 0
                mosaic_array[y_offset:end_y, x_offset:end_x, band][valid_mask] = (
                    (mosaic_array[y_offset:end_y, x_offset:end_x, band][valid_mask] * current_weights[valid_mask] +
                     data_slice[valid_mask] * weight_slice[valid_mask]) / total_weights[valid_mask]
                ).astype(np.uint8)
                
                weight_array[y_offset:end_y, x_offset:end_x] = total_weights
        else:
            # Simple overlay
            for band in range(data.shape[0]):
                end_y = min(y_offset + rows, output_rows)
                end_x = min(x_offset + cols, output_cols)
                
                mosaic_array[y_offset:end_y, x_offset:end_x, band] = data[band, :end_y-y_offset, :end_x-x_offset]
    
    # Write output
    for band in range(mosaic_array.shape[2]):
        output_ds.GetRasterBand(band + 1).WriteArray(mosaic_array[:, :, band])
    
    # Clean up
    output_ds = None
    for ds in datasets:
        ds = None
    
    print(f"Mosaic created: {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Create raster mosaic with seamless blending')
    parser.add_argument('inputs', nargs='+', help='Input raster files')
    parser.add_argument('--output', '-o', required=True, help='Output mosaic file')
    parser.add_argument('--blend', choices=['feather', 'overlay'], default='feather',
                       help='Blending method')
    
    args = parser.parse_args()
    create_mosaic(args.inputs, args.output, args.blend)