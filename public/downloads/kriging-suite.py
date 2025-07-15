#!/usr/bin/env python3
"""
Kriging Interpolation Suite
Advanced geostatistical interpolation using ordinary, universal, and indicator kriging methods.

License: MIT
Author: HaritaHive Team
Dependencies: pykrige, numpy, matplotlib, scikit-learn
"""

import numpy as np
import matplotlib.pyplot as plt
from pykrige.ok import OrdinaryKriging
from pykrige.uk import UniversalKriging
from pykrige.ik import IndicatorKriging
from sklearn.metrics import mean_squared_error, r2_score
import argparse
import pandas as pd

class KrigingInterpolator:
    def __init__(self, x, y, z, variogram_model='spherical'):
        """
        Initialize kriging interpolator
        
        Args:
            x, y, z: Arrays of coordinates and values
            variogram_model: Variogram model ('linear', 'power', 'gaussian', 'spherical', 'exponential')
        """
        self.x = np.array(x)
        self.y = np.array(y)
        self.z = np.array(z)
        self.variogram_model = variogram_model
        self.ok_model = None
        self.uk_model = None
        self.ik_model = None
        
    def ordinary_kriging(self, grid_x, grid_y, enable_plotting=False):
        """Perform ordinary kriging interpolation"""
        
        print(f"Performing ordinary kriging with {self.variogram_model} variogram...")
        
        # Create kriging model
        self.ok_model = OrdinaryKriging(
            self.x, self.y, self.z,
            variogram_model=self.variogram_model,
            verbose=False,
            enable_plotting=enable_plotting
        )
        
        # Perform interpolation
        z_pred, ss_pred = self.ok_model.execute('grid', grid_x, grid_y)
        
        return z_pred, ss_pred
    
    def universal_kriging(self, grid_x, grid_y, drift_terms=['regional_linear']):
        """Perform universal kriging with trend"""
        
        print(f"Performing universal kriging with {drift_terms} drift...")
        
        # Create kriging model
        self.uk_model = UniversalKriging(
            self.x, self.y, self.z,
            variogram_model=self.variogram_model,
            drift_terms=drift_terms,
            verbose=False
        )
        
        # Perform interpolation
        z_pred, ss_pred = self.uk_model.execute('grid', grid_x, grid_y)
        
        return z_pred, ss_pred
    
    def indicator_kriging(self, grid_x, grid_y, thresholds=None):
        """Perform indicator kriging for categorical data"""
        
        if thresholds is None:
            # Auto-generate thresholds based on quantiles
            thresholds = [
                np.percentile(self.z, 25),
                np.percentile(self.z, 50),
                np.percentile(self.z, 75)
            ]
        
        print(f"Performing indicator kriging with thresholds: {thresholds}")
        
        # Create indicator variables
        indicator_data = []
        for threshold in thresholds:
            indicators = (self.z <= threshold).astype(int)
            indicator_data.append(indicators)
        
        # Perform kriging for each indicator
        indicator_predictions = []
        indicator_variances = []
        
        for i, indicators in enumerate(indicator_data):
            print(f"Processing indicator {i+1}/{len(indicator_data)}")
            
            ik_model = IndicatorKriging(
                self.x, self.y, indicators,
                variogram_model=self.variogram_model,
                verbose=False
            )
            
            z_pred, ss_pred = ik_model.execute('grid', grid_x, grid_y)
            indicator_predictions.append(z_pred)
            indicator_variances.append(ss_pred)
        
        return indicator_predictions, indicator_variances, thresholds
    
    def cross_validate(self, method='ordinary', n_folds=5):
        """Perform cross-validation"""
        
        from sklearn.model_selection import KFold
        
        kf = KFold(n_splits=n_folds, shuffle=True, random_state=42)
        
        predictions = []
        observations = []
        
        for train_idx, test_idx in kf.split(self.x):
            # Split data
            x_train, x_test = self.x[train_idx], self.x[test_idx]
            y_train, y_test = self.y[train_idx], self.y[test_idx]
            z_train, z_test = self.z[train_idx], self.z[test_idx]
            
            # Fit model
            if method == 'ordinary':
                model = OrdinaryKriging(
                    x_train, y_train, z_train,
                    variogram_model=self.variogram_model,
                    verbose=False
                )
            elif method == 'universal':
                model = UniversalKriging(
                    x_train, y_train, z_train,
                    variogram_model=self.variogram_model,
                    drift_terms=['regional_linear'],
                    verbose=False
                )
            else:
                raise ValueError("Method must be 'ordinary' or 'universal'")
            
            # Predict test points
            z_pred, _ = model.execute('points', x_test, y_test)
            
            predictions.extend(z_pred)
            observations.extend(z_test)
        
        predictions = np.array(predictions)
        observations = np.array(observations)
        
        # Calculate metrics
        rmse = np.sqrt(mean_squared_error(observations, predictions))
        r2 = r2_score(observations, predictions)
        mae = np.mean(np.abs(observations - predictions))
        
        print(f"Cross-validation results ({method} kriging):")
        print(f"  RMSE: {rmse:.4f}")
        print(f"  R²: {r2:.4f}")
        print(f"  MAE: {mae:.4f}")
        
        return {
            'rmse': rmse,
            'r2': r2,
            'mae': mae,
            'predictions': predictions,
            'observations': observations
        }
    
    def plot_variogram(self, model_type='ordinary'):
        """Plot experimental and model variograms"""
        
        if model_type == 'ordinary' and self.ok_model:
            model = self.ok_model
        elif model_type == 'universal' and self.uk_model:
            model = self.uk_model
        else:
            # Create temporary model for plotting
            model = OrdinaryKriging(
                self.x, self.y, self.z,
                variogram_model=self.variogram_model,
                verbose=False,
                enable_plotting=True
            )
        
        # Plot variogram
        plt.figure(figsize=(8, 6))
        
        # Get variogram parameters
        lags = model.lags
        semivariance = model.semivariance
        
        # Plot experimental variogram
        plt.scatter(lags, semivariance, c='blue', label='Experimental', alpha=0.7)
        
        # Plot model variogram
        lag_range = np.linspace(0, np.max(lags), 100)
        if hasattr(model, 'variogram_function'):
            model_variance = [
                model.variogram_function([0, 0], [lag, 0]) 
                for lag in lag_range
            ]
            plt.plot(lag_range, model_variance, 'r-', 
                    label=f'{self.variogram_model.title()} Model')
        
        plt.xlabel('Lag Distance')
        plt.ylabel('Semivariance')
        plt.title(f'{model_type.title()} Kriging Variogram')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.show()
    
    def compare_methods(self, grid_x, grid_y):
        """Compare different kriging methods"""
        
        print("Comparing kriging methods...")
        
        # Ordinary kriging
        z_ok, ss_ok = self.ordinary_kriging(grid_x, grid_y)
        
        # Universal kriging
        z_uk, ss_uk = self.universal_kriging(grid_x, grid_y)
        
        # Cross-validation comparison
        cv_ok = self.cross_validate('ordinary')
        cv_uk = self.cross_validate('universal')
        
        # Plot comparison
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        
        # Original data
        axes[0, 0].scatter(self.x, self.y, c=self.z, cmap='viridis', s=50)
        axes[0, 0].set_title('Original Data')
        axes[0, 0].set_xlabel('X')
        axes[0, 0].set_ylabel('Y')
        
        # Ordinary kriging
        im1 = axes[0, 1].imshow(z_ok, extent=[grid_x.min(), grid_x.max(), 
                                             grid_y.min(), grid_y.max()], 
                               cmap='viridis', origin='lower')
        axes[0, 1].scatter(self.x, self.y, c='white', s=20, edgecolors='black')
        axes[0, 1].set_title(f'Ordinary Kriging (R² = {cv_ok["r2"]:.3f})')
        axes[0, 1].set_xlabel('X')
        axes[0, 1].set_ylabel('Y')
        plt.colorbar(im1, ax=axes[0, 1])
        
        # Universal kriging
        im2 = axes[0, 2].imshow(z_uk, extent=[grid_x.min(), grid_x.max(), 
                                             grid_y.min(), grid_y.max()], 
                               cmap='viridis', origin='lower')
        axes[0, 2].scatter(self.x, self.y, c='white', s=20, edgecolors='black')
        axes[0, 2].set_title(f'Universal Kriging (R² = {cv_uk["r2"]:.3f})')
        axes[0, 2].set_xlabel('X')
        axes[0, 2].set_ylabel('Y')
        plt.colorbar(im2, ax=axes[0, 2])
        
        # Uncertainty maps
        im3 = axes[1, 0].imshow(ss_ok, extent=[grid_x.min(), grid_x.max(), 
                                              grid_y.min(), grid_y.max()], 
                               cmap='Reds', origin='lower')
        axes[1, 0].set_title('OK Uncertainty')
        axes[1, 0].set_xlabel('X')
        axes[1, 0].set_ylabel('Y')
        plt.colorbar(im3, ax=axes[1, 0])
        
        im4 = axes[1, 1].imshow(ss_uk, extent=[grid_x.min(), grid_x.max(), 
                                              grid_y.min(), grid_y.max()], 
                               cmap='Reds', origin='lower')
        axes[1, 1].set_title('UK Uncertainty')
        axes[1, 1].set_xlabel('X')
        axes[1, 1].set_ylabel('Y')
        plt.colorbar(im4, ax=axes[1, 1])
        
        # Cross-validation scatter plot
        axes[1, 2].scatter(cv_ok['observations'], cv_ok['predictions'], 
                          alpha=0.6, label=f'OK (R² = {cv_ok["r2"]:.3f})')
        axes[1, 2].scatter(cv_uk['observations'], cv_uk['predictions'], 
                          alpha=0.6, label=f'UK (R² = {cv_uk["r2"]:.3f})')
        
        min_val = min(np.min(cv_ok['observations']), np.min(cv_uk['observations']))
        max_val = max(np.max(cv_ok['observations']), np.max(cv_uk['observations']))
        axes[1, 2].plot([min_val, max_val], [min_val, max_val], 'k--', alpha=0.5)
        
        axes[1, 2].set_xlabel('Observed')
        axes[1, 2].set_ylabel('Predicted')
        axes[1, 2].set_title('Cross-Validation')
        axes[1, 2].legend()
        
        plt.tight_layout()
        plt.show()
        
        return {
            'ordinary_kriging': {'prediction': z_ok, 'variance': ss_ok, 'cv': cv_ok},
            'universal_kriging': {'prediction': z_uk, 'variance': ss_uk, 'cv': cv_uk}
        }

def load_data_from_csv(filepath, x_col='x', y_col='y', z_col='z'):
    """Load spatial data from CSV file"""
    df = pd.read_csv(filepath)
    return df[x_col].values, df[y_col].values, df[z_col].values

def main():
    parser = argparse.ArgumentParser(description='Perform kriging interpolation')
    parser.add_argument('--data', required=True, help='CSV file with x,y,z columns')
    parser.add_argument('--x-col', default='x', help='X coordinate column name')
    parser.add_argument('--y-col', default='y', help='Y coordinate column name')
    parser.add_argument('--z-col', default='z', help='Value column name')
    parser.add_argument('--method', choices=['ordinary', 'universal', 'indicator', 'compare'], 
                       default='ordinary', help='Kriging method')
    parser.add_argument('--variogram', default='spherical', 
                       choices=['linear', 'power', 'gaussian', 'spherical', 'exponential'],
                       help='Variogram model')
    parser.add_argument('--grid-size', type=int, default=100, help='Grid size for interpolation')
    parser.add_argument('--output', help='Output file for interpolated grid')
    parser.add_argument('--cross-validate', action='store_true', help='Perform cross-validation')
    parser.add_argument('--plot-variogram', action='store_true', help='Plot variogram')
    
    args = parser.parse_args()
    
    # Load data
    print(f"Loading data from {args.data}...")
    x, y, z = load_data_from_csv(args.data, args.x_col, args.y_col, args.z_col)
    
    print(f"Loaded {len(x)} data points")
    print(f"X range: {np.min(x):.2f} to {np.max(x):.2f}")
    print(f"Y range: {np.min(y):.2f} to {np.max(y):.2f}")
    print(f"Z range: {np.min(z):.2f} to {np.max(z):.2f}")
    
    # Create interpolator
    interpolator = KrigingInterpolator(x, y, z, args.variogram)
    
    # Create interpolation grid
    grid_x = np.linspace(np.min(x), np.max(x), args.grid_size)
    grid_y = np.linspace(np.min(y), np.max(y), args.grid_size)
    
    # Perform interpolation based on method
    if args.method == 'ordinary':
        z_pred, ss_pred = interpolator.ordinary_kriging(grid_x, grid_y)
        
        if args.cross_validate:
            interpolator.cross_validate('ordinary')
            
    elif args.method == 'universal':
        z_pred, ss_pred = interpolator.universal_kriging(grid_x, grid_y)
        
        if args.cross_validate:
            interpolator.cross_validate('universal')
            
    elif args.method == 'indicator':
        predictions, variances, thresholds = interpolator.indicator_kriging(grid_x, grid_y)
        print(f"Generated {len(predictions)} indicator maps")
        
    elif args.method == 'compare':
        results = interpolator.compare_methods(grid_x, grid_y)
        
    # Plot variogram if requested
    if args.plot_variogram and args.method in ['ordinary', 'universal']:
        interpolator.plot_variogram(args.method)
    
    # Save output if specified
    if args.output and args.method in ['ordinary', 'universal']:
        np.savetxt(args.output, z_pred, delimiter=',')
        print(f"Saved interpolated grid to {args.output}")
    
    print("Kriging interpolation completed!")

if __name__ == "__main__":
    main()