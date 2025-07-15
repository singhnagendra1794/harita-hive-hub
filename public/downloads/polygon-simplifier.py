#!/usr/bin/env python3
"""
Polygon Simplifier Tool
Reduce polygon complexity while preserving geometric integrity using Douglas-Peucker algorithm.

License: MIT
Author: HaritaHive Team
"""

import argparse
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import simplify
import fiona
import json

def simplify_polygon(polygon, tolerance=0.01):
    """Simplify a polygon using Douglas-Peucker algorithm"""
    return simplify(polygon, tolerance, preserve_topology=True)

def process_shapefile(input_file, output_file, tolerance=0.01):
    """Process shapefile and simplify all polygons"""
    with fiona.open(input_file, 'r') as source:
        schema = source.schema.copy()
        
        with fiona.open(output_file, 'w', **source.meta) as sink:
            for feature in source:
                geom = feature['geometry']
                
                if geom['type'] == 'Polygon':
                    simplified = simplify_polygon(Polygon(geom['coordinates'][0]), tolerance)
                    feature['geometry'] = simplified.__geo_interface__
                elif geom['type'] == 'MultiPolygon':
                    polygons = [Polygon(coords[0]) for coords in geom['coordinates']]
                    simplified_polygons = [simplify_polygon(p, tolerance) for p in polygons]
                    multi_poly = MultiPolygon(simplified_polygons)
                    feature['geometry'] = multi_poly.__geo_interface__
                
                sink.write(feature)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Simplify polygons in vector data')
    parser.add_argument('input', help='Input shapefile path')
    parser.add_argument('output', help='Output shapefile path')
    parser.add_argument('--tolerance', type=float, default=0.01, help='Simplification tolerance')
    
    args = parser.parse_args()
    process_shapefile(args.input, args.output, args.tolerance)
    print(f"Simplified polygons saved to {args.output}")