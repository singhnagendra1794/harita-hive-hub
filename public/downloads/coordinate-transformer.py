#!/usr/bin/env python3
"""
Coordinate Transformer
Batch transform coordinates between different coordinate reference systems.

Author: HaritaHive Team
Version: 2.0.0
Dependencies: pyproj, pandas, numpy

Usage:
    python coordinate-transformer.py --input coordinates.csv --from EPSG:4326 --to EPSG:3857 --output transformed.csv

Features:
- Batch coordinate transformation
- Support for multiple coordinate reference systems
- CSV input/output format
- Error handling and validation
"""

import pandas as pd
import pyproj
import argparse
import sys
from pathlib import Path

def transform_coordinates(input_file, source_crs, target_crs, output_file):
    """
    Transform coordinates from one CRS to another.
    
    Args:
        input_file (str): Path to input CSV file with coordinates
        source_crs (str): Source coordinate reference system (e.g., 'EPSG:4326')
        target_crs (str): Target coordinate reference system (e.g., 'EPSG:3857')
        output_file (str): Path to output CSV file
    """
    
    print(f"Loading coordinates from: {input_file}")
    
    try:
        # Load coordinate data
        df = pd.read_csv(input_file)
        
        # Validate required columns
        required_cols = ['x', 'y']  # or 'longitude', 'latitude'
        if not all(col in df.columns for col in required_cols):
            if 'longitude' in df.columns and 'latitude' in df.columns:
                df = df.rename(columns={'longitude': 'x', 'latitude': 'y'})
            else:
                raise ValueError("Input file must contain 'x', 'y' or 'longitude', 'latitude' columns")
        
        # Set up coordinate transformation
        transformer = pyproj.Transformer.from_crs(source_crs, target_crs, always_xy=True)
        
        # Transform coordinates
        print(f"Transforming {len(df)} coordinates from {source_crs} to {target_crs}")
        
        transformed_x, transformed_y = transformer.transform(df['x'].values, df['y'].values)
        
        # Create output dataframe
        result_df = df.copy()
        result_df['transformed_x'] = transformed_x
        result_df['transformed_y'] = transformed_y
        result_df['source_crs'] = source_crs
        result_df['target_crs'] = target_crs
        
        # Save results
        result_df.to_csv(output_file, index=False)
        print(f"Transformed coordinates saved to: {output_file}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Transform coordinates between CRS')
    parser.add_argument('--input', required=True, help='Input CSV file with coordinates')
    parser.add_argument('--from', dest='source_crs', required=True, help='Source CRS (e.g., EPSG:4326)')
    parser.add_argument('--to', dest='target_crs', required=True, help='Target CRS (e.g., EPSG:3857)')
    parser.add_argument('--output', required=True, help='Output CSV file')
    
    args = parser.parse_args()
    
    # Validate input file exists
    if not Path(args.input).exists():
        print(f"Error: Input file '{args.input}' does not exist")
        sys.exit(1)
    
    transform_coordinates(args.input, args.source_crs, args.target_crs, args.output)

if __name__ == "__main__":
    main()