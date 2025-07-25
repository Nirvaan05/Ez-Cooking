#!/usr/bin/env python3
import pandas as pd
import json
import os
import psycopg2
from urllib.parse import urlparse

# Get the dataset path
dataset_path = "/home/runner/.cache/kagglehub/datasets/shuyangli94/food-com-recipes-and-user-interactions/versions/2"
recipes_file = os.path.join(dataset_path, "RAW_recipes.csv")

print("Loading Food.com recipes dataset...")
df = pd.read_csv(recipes_file)

print(f"Dataset contains {len(df)} recipes")
print(f"Columns: {list(df.columns)}")

# Sample the data to see structure
print("\nSample recipe data:")
sample = df.head(3)
for idx, row in sample.iterrows():
    print(f"\n--- Recipe {idx + 1} ---")
    print(f"Name: {row['name']}")
    print(f"Minutes: {row['minutes']}")
    print(f"Description: {row['description'][:100]}...")
    print(f"Ingredients: {row['ingredients'][:100]}...")
    print(f"Steps: {row['steps'][:100]}...")
    print(f"Tags: {row['tags'][:100]}...")

# Get database connection details from environment
database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("ERROR: DATABASE_URL environment variable not found")
    exit(1)

print(f"\nConnecting to database...")

# Parse the database URL
url = urlparse(database_url)
conn_params = {
    'host': url.hostname,
    'database': url.path[1:],  # Remove leading slash
    'user': url.username,
    'password': url.password,
    'port': url.port
}

# Connect to database
conn = psycopg2.connect(**conn_params)
cur = conn.cursor()

print("Connected to PostgreSQL database")

# First, let's look at existing tables
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
""")
tables = cur.fetchall()
print(f"Existing tables: {[t[0] for t in tables]}")

# Clear existing recipes
print("Clearing existing recipes...")
cur.execute("DELETE FROM recipes")

# Function to clean and convert data
def clean_ingredient_list(ing_str):
    """Convert ingredient string to structured format"""
    try:
        # Parse the string representation of a list
        ingredients = eval(ing_str) if isinstance(ing_str, str) else ing_str
        if isinstance(ingredients, list):
            return [{"name": ing.strip(), "amount": "As needed"} for ing in ingredients if ing.strip()]
        return []
    except:
        return []

def clean_steps_list(steps_str):
    """Convert steps string to list format"""
    try:
        steps = eval(steps_str) if isinstance(steps_str, str) else steps_str
        if isinstance(steps, list):
            return [step.strip() for step in steps if step.strip()]
        return []
    except:
        return []

def clean_tags_list(tags_str):
    """Convert tags string to list format"""
    try:
        tags = eval(tags_str) if isinstance(tags_str, str) else tags_str
        if isinstance(tags, list):
            return [tag.strip() for tag in tags if tag.strip()]
        return []
    except:
        return []

def estimate_difficulty(n_steps, minutes):
    """Estimate difficulty based on steps and time"""
    if n_steps <= 5 and minutes <= 30:
        return "Easy"
    elif n_steps <= 10 and minutes <= 60:
        return "Medium"
    else:
        return "Hard"

# Process recipes in batches
batch_size = 1000
total_inserted = 0
max_recipes = 10000  # Limit to first 10k recipes for performance

print(f"Processing up to {max_recipes} recipes...")

for batch_start in range(0, min(len(df), max_recipes), batch_size):
    batch_end = min(batch_start + batch_size, len(df), max_recipes)
    batch_df = df.iloc[batch_start:batch_end]
    
    print(f"Processing batch {batch_start//batch_size + 1}: recipes {batch_start+1} to {batch_end}")
    
    for idx, row in batch_df.iterrows():
        try:
            # Clean and prepare data
            ingredients = clean_ingredient_list(row['ingredients'])
            steps = clean_steps_list(row['steps'])
            tags = clean_tags_list(row['tags'])
            
            # Skip if no ingredients or steps
            if not ingredients or not steps:
                continue
            
            # Prepare recipe data
            title = str(row['name']).strip()[:255]  # Limit title length
            description = str(row['description']).strip() if pd.notna(row['description']) else f"A delicious {title.lower()} recipe"
            cook_time = f"{int(row['minutes'])} minutes" if pd.notna(row['minutes']) and row['minutes'] > 0 else "30 minutes"
            servings = "4 servings"  # Default servings
            difficulty = estimate_difficulty(row['n_steps'], row['minutes'])
            
            # Insert into database
            cur.execute("""
                INSERT INTO recipes (title, description, cook_time, servings, difficulty, 
                                   ingredients, instructions, tags, is_favorite, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """, (
                title,
                description,
                cook_time,
                servings,
                difficulty,
                json.dumps(ingredients),
                json.dumps(steps),
                json.dumps(tags),
                False
            ))
            
            total_inserted += 1
            
        except Exception as e:
            print(f"Error processing recipe {idx}: {e}")
            continue
    
    # Commit batch
    conn.commit()
    print(f"Inserted {total_inserted} recipes so far...")

print(f"\nMigration completed! Inserted {total_inserted} recipes from Food.com dataset")

# Verify the data
cur.execute("SELECT COUNT(*) FROM recipes")
count = cur.fetchone()[0]
print(f"Total recipes in database: {count}")

# Show a sample
cur.execute("SELECT title, cook_time, difficulty FROM recipes LIMIT 5")
samples = cur.fetchall()
print("\nSample recipes:")
for title, cook_time, difficulty in samples:
    print(f"- {title} ({cook_time}, {difficulty})")

# Close connections
cur.close()
conn.close()
print("\nDatabase migration completed successfully!")