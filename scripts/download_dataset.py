#!/usr/bin/env python3
import kagglehub
import pandas as pd
import json
import os

# Download latest version
print("Downloading Food.com dataset from Kaggle...")
path = kagglehub.dataset_download("shuyangli94/food-com-recipes-and-user-interactions")

print("Path to dataset files:", path)

# List all files in the dataset
for root, dirs, files in os.walk(path):
    for file in files:
        file_path = os.path.join(root, file)
        print(f"Found file: {file_path}")
        
        # Show file size
        size = os.path.getsize(file_path)
        print(f"  Size: {size:,} bytes")
        
        # If it's a CSV file, show first few rows
        if file.endswith('.csv'):
            try:
                df = pd.read_csv(file_path, nrows=5)
                print(f"  Columns: {list(df.columns)}")
                print(f"  Sample data:")
                print(df.head())
                print()
            except Exception as e:
                print(f"  Error reading CSV: {e}")