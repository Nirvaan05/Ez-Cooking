import openai
import os
import base64
import logging
from config import Config

logger = logging.getLogger(__name__)

# Initialize OpenAI client only if API key is available
client = None
if Config.OPENAI_API_KEY:
    try:
        client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
    except Exception as e:
        logger.warning(f"Failed to initialize OpenAI client: {e}")
        client = None

def encode_image_to_base64(image_path):
    """Encode image to base64 for OpenAI API"""
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        logger.error(f"Error encoding image: {str(e)}")
        raise

def analyze_recipe_image(image_path):
    """Analyze a recipe image using OpenAI Vision API"""
    try:
        if not client:
            raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.")
        
        # Encode image
        base64_image = encode_image_to_base64(image_path)
        
        # Create prompt for recipe analysis
        prompt = """
        Analyze this food/recipe image and extract the following information in JSON format:
        {
            "title": "Recipe title",
            "description": "Brief description of the dish",
            "ingredients": ["ingredient 1", "ingredient 2", ...],
            "instructions": "Step-by-step cooking instructions",
            "cooking_time": 30,
            "servings": 4,
            "difficulty": "Easy/Medium/Hard",
            "cuisine": "Type of cuisine"
        }
        
        Be as detailed and accurate as possible. If you can't identify certain ingredients or details, make reasonable estimates based on what you can see.
        """
        
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000,
        )
        
        # Parse the response
        content = response.choices[0].message.content
        
        # Try to extract JSON from the response
        import json
        import re
        
        # Look for JSON in the response
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            recipe_data = json.loads(json_match.group())
        else:
            # If no JSON found, create a basic structure
            recipe_data = {
                "title": "Recipe from Image",
                "description": content,
                "ingredients": [],
                "instructions": "Please review and edit the recipe details.",
                "cooking_time": 30,
                "servings": 4,
                "difficulty": "Medium",
                "cuisine": "General"
            }
        
        return recipe_data
    
    except Exception as e:
        logger.error(f"Error analyzing recipe image: {str(e)}")
        raise

def generate_recipe_from_ingredients(ingredients):
    """Generate a recipe from a list of ingredients using OpenAI"""
    try:
        if not client:
            raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.")
        
        # Create prompt for recipe generation
        ingredients_text = ", ".join(ingredients)
        prompt = f"""
        Create a recipe using these ingredients: {ingredients_text}
        
        Return the recipe in this JSON format:
        {{
            "title": "Recipe title",
            "description": "Brief description of the dish",
            "ingredients": ["ingredient 1", "ingredient 2", ...],
            "instructions": "Step-by-step cooking instructions",
            "cooking_time": 30,
            "servings": 4,
            "difficulty": "Easy/Medium/Hard",
            "cuisine": "Type of cuisine"
        }}
        
        Make sure the recipe is practical and delicious. Include any additional ingredients that would complement the provided ingredients.
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
        )
        
        content = response.choices[0].message.content
        
        # Parse the response
        import json
        import re
        
        # Look for JSON in the response
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            recipe_data = json.loads(json_match.group())
        else:
            # If no JSON found, create a basic structure
            recipe_data = {
                "title": f"Recipe with {ingredients[0]}",
                "description": content,
                "ingredients": ingredients,
                "instructions": "Please review and edit the recipe details.",
                "cooking_time": 30,
                "servings": 4,
                "difficulty": "Medium",
                "cuisine": "General"
            }
        
        return recipe_data
    
    except Exception as e:
        logger.error(f"Error generating recipe from ingredients: {str(e)}")
        raise

def improve_recipe(recipe_text):
    """Improve an existing recipe using OpenAI"""
    try:
        if not client:
            raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.")
        
        prompt = f"""
        Improve this recipe to make it more delicious and detailed:
        
        {recipe_text}
        
        Return the improved recipe in the same format, with better instructions, tips, and suggestions.
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        logger.error(f"Error improving recipe: {str(e)}")
        raise 