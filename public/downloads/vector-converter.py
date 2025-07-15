#!/usr/bin/env python3
"""
Vector Format Converter
High-performance batch conversion between vector formats with attribute preservation.

License: MIT
Author: HaritaHive Team
"""

import fiona
import argparse
import os
from pathlib import Path

def convert_vector_file(input_file, output_file, target_driver=None):
    """Convert vector file to target format"""
    
    # Auto-detect target driver from file extension
    if not target_driver:
        ext = Path(output_file).suffix.lower()
        driver_map = {
            '.shp': 'ESRI Shapefile',
            '.geojson': 'GeoJSON',
            '.gpkg': 'GPKG',
            '.kml': 'KML',
            '.gml': 'GML'
        }
        target_driver = driver_map.get(ext, 'GeoJSON')
    
    print(f"Converting {input_file} to {output_file}")
    print(f"Target driver: {target_driver}")
    
    with fiona.open(input_file, 'r') as source:
        # Get source metadata
        schema = source.schema.copy()
        crs = source.crs
        
        print(f"Source CRS: {crs}")
        print(f"Features: {len(source)}")
        
        # Create output file
        with fiona.open(output_file, 'w', 
                       driver=target_driver, 
                       crs=crs, 
                       schema=schema) as sink:
            
            for feature in source:
                sink.write(feature)
    
    print(f"Conversion completed: {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Convert vector data formats')
    parser.add_argument('input', help='Input vector file')
    parser.add_argument('output', help='Output vector file')
    parser.add_argument('--driver', help='Target driver (auto-detected if not specified)')
    
    args = parser.parse_args()
    convert_vector_file(args.input, args.output, args.driver)