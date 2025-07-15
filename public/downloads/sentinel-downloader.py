#!/usr/bin/env python3
"""
Sentinel-2 Downloader
Automated download and preprocessing of Sentinel-2 satellite imagery.

License: Apache 2.0
Author: HaritaHive Team
"""

from sentinelsat import SentinelAPI, read_geojson, geojson_to_wkt
import argparse
import os
from datetime import datetime, timedelta
import zipfile
import rasterio
import numpy as np

class Sentinel2Downloader:
    def __init__(self, username, password):
        self.api = SentinelAPI(username, password, 'https://scihub.copernicus.eu/dhus')
    
    def search_images(self, aoi_file, start_date, end_date, cloud_cover=20):
        """Search for Sentinel-2 images"""
        
        # Read area of interest
        footprint = geojson_to_wkt(read_geojson(aoi_file))
        
        # Search for images
        products = self.api.query(
            footprint,
            date=(start_date, end_date),
            platformname='Sentinel-2',
            cloudcoverpercentage=(0, cloud_cover),
            producttype='S2MSI1C'
        )
        
        print(f"Found {len(products)} Sentinel-2 images")
        return products
    
    def download_images(self, products, download_dir):
        """Download images"""
        
        os.makedirs(download_dir, exist_ok=True)
        
        for product_id, product_info in products.items():
            print(f"Downloading {product_info['title']}")
            
            try:
                self.api.download(product_id, download_dir)
                
                # Extract zip file
                zip_path = os.path.join(download_dir, f"{product_info['title']}.zip")
                if os.path.exists(zip_path):
                    extract_dir = os.path.join(download_dir, product_info['title'])
                    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                        zip_ref.extractall(extract_dir)
                    
                    # Remove zip file to save space
                    os.remove(zip_path)
                    print(f"Extracted to {extract_dir}")
                    
            except Exception as e:
                print(f"Error downloading {product_info['title']}: {e}")
    
    def create_rgb_composite(self, safe_dir, output_path):
        """Create RGB composite from Sentinel-2 bands"""
        
        # Find band files
        img_dir = None
        for root, dirs, files in os.walk(safe_dir):
            if 'IMG_DATA' in root:
                img_dir = root
                break
        
        if not img_dir:
            print("Could not find IMG_DATA directory")
            return
        
        # Band mapping (10m resolution)
        bands = {}
        for file in os.listdir(img_dir):
            if file.endswith('.jp2'):
                if 'B02' in file:  # Blue
                    bands['blue'] = os.path.join(img_dir, file)
                elif 'B03' in file:  # Green
                    bands['green'] = os.path.join(img_dir, file)
                elif 'B04' in file:  # Red
                    bands['red'] = os.path.join(img_dir, file)
        
        if len(bands) != 3:
            print("Could not find all RGB bands")
            return
        
        # Read and stack bands
        with rasterio.open(bands['red']) as red_src:
            red = red_src.read(1).astype(np.float32)
            profile = red_src.profile
        
        with rasterio.open(bands['green']) as green_src:
            green = green_src.read(1).astype(np.float32)
        
        with rasterio.open(bands['blue']) as blue_src:
            blue = blue_src.read(1).astype(np.float32)
        
        # Normalize to 0-255
        def normalize_band(band):
            # 2-98 percentile stretch
            p2, p98 = np.percentile(band[band > 0], [2, 98])
            band_norm = np.clip((band - p2) / (p98 - p2) * 255, 0, 255)
            return band_norm.astype(np.uint8)
        
        red_norm = normalize_band(red)
        green_norm = normalize_band(green)
        blue_norm = normalize_band(blue)
        
        # Stack bands
        rgb = np.stack([red_norm, green_norm, blue_norm])
        
        # Update profile
        profile.update(
            dtype=rasterio.uint8,
            count=3,
            compress='lzw'
        )
        
        # Write RGB composite
        with rasterio.open(output_path, 'w', **profile) as dst:
            dst.write(rgb)
        
        print(f"RGB composite saved to {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Download and preprocess Sentinel-2 imagery')
    parser.add_argument('--username', required=True, help='Copernicus Open Access Hub username')
    parser.add_argument('--password', required=True, help='Copernicus Open Access Hub password')
    parser.add_argument('--aoi', required=True, help='Area of interest GeoJSON file')
    parser.add_argument('--start-date', required=True, help='Start date (YYYY-MM-DD)')
    parser.add_argument('--end-date', required=True, help='End date (YYYY-MM-DD)')
    parser.add_argument('--cloud-cover', type=int, default=20, help='Maximum cloud cover percentage')
    parser.add_argument('--download-dir', default='sentinel2_data', help='Download directory')
    parser.add_argument('--create-rgb', action='store_true', help='Create RGB composites')
    
    args = parser.parse_args()
    
    # Initialize downloader
    downloader = Sentinel2Downloader(args.username, args.password)
    
    # Search for images
    products = downloader.search_images(
        args.aoi, 
        args.start_date, 
        args.end_date, 
        args.cloud_cover
    )
    
    if not products:
        print("No images found for the specified criteria")
        return
    
    # Download images
    downloader.download_images(products, args.download_dir)
    
    # Create RGB composites if requested
    if args.create_rgb:
        for product_id, product_info in products.items():
            safe_dir = os.path.join(args.download_dir, product_info['title'])
            if os.path.exists(safe_dir):
                rgb_path = os.path.join(args.download_dir, f"{product_info['title']}_RGB.tif")
                downloader.create_rgb_composite(safe_dir, rgb_path)

if __name__ == "__main__":
    main()