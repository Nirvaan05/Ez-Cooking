from flask import Blueprint, request, jsonify, current_app
from database import get_db_session, Recipe, User
from openai_client import analyze_recipe_image, generate_recipe_from_ingredients
import json
import os
from werkzeug.utils import secure_filename
from datetime import datetime
import logging

api_bp = Blueprint('api', __name__)
logger = logging.getLogger(__name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@api_bp.route('/recipes', methods=['GET'])
def get_recipes():
    """Get all recipes"""
    try:
        db = get_db_session()
        recipes = db.query(Recipe).filter(Recipe.is_public == True).all()
        
        recipe_list = []
        for recipe in recipes:
            recipe_data = {
                'id': recipe.id,
                'title': recipe.title,
                'description': recipe.description,
                'ingredients': json.loads(recipe.ingredients) if recipe.ingredients else [],
                'instructions': recipe.instructions,
                'cooking_time': recipe.cooking_time,
                'servings': recipe.servings,
                'difficulty': recipe.difficulty,
                'cuisine': recipe.cuisine,
                'image_url': recipe.image_url,
                'created_at': recipe.created_at.isoformat() if recipe.created_at else None,
                'updated_at': recipe.updated_at.isoformat() if recipe.updated_at else None
            }
            recipe_list.append(recipe_data)
        
        return jsonify({'recipes': recipe_list})
    
    except Exception as e:
        logger.error(f"Error getting recipes: {str(e)}")
        return jsonify({'error': 'Failed to get recipes'}), 500
    finally:
        db.close()

@api_bp.route('/recipes', methods=['POST'])
def create_recipe():
    """Create a new recipe"""
    try:
        data = request.get_json()
        
        if not data or not data.get('title') or not data.get('ingredients') or not data.get('instructions'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        db = get_db_session()
        
        new_recipe = Recipe(
            title=data['title'],
            description=data.get('description', ''),
            ingredients=json.dumps(data['ingredients']),
            instructions=data['instructions'],
            cooking_time=data.get('cooking_time'),
            servings=data.get('servings'),
            difficulty=data.get('difficulty'),
            cuisine=data.get('cuisine'),
            image_url=data.get('image_url'),
            is_public=data.get('is_public', True)
        )
        
        db.add(new_recipe)
        db.commit()
        db.refresh(new_recipe)
        
        return jsonify({
            'message': 'Recipe created successfully',
            'recipe_id': new_recipe.id
        }), 201
    
    except Exception as e:
        logger.error(f"Error creating recipe: {str(e)}")
        return jsonify({'error': 'Failed to create recipe'}), 500
    finally:
        db.close()

@api_bp.route('/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    """Get a specific recipe"""
    try:
        db = get_db_session()
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        recipe_data = {
            'id': recipe.id,
            'title': recipe.title,
            'description': recipe.description,
            'ingredients': json.loads(recipe.ingredients) if recipe.ingredients else [],
            'instructions': recipe.instructions,
            'cooking_time': recipe.cooking_time,
            'servings': recipe.servings,
            'difficulty': recipe.difficulty,
            'cuisine': recipe.cuisine,
            'image_url': recipe.image_url,
            'created_at': recipe.created_at.isoformat() if recipe.created_at else None,
            'updated_at': recipe.updated_at.isoformat() if recipe.updated_at else None
        }
        
        return jsonify(recipe_data)
    
    except Exception as e:
        logger.error(f"Error getting recipe {recipe_id}: {str(e)}")
        return jsonify({'error': 'Failed to get recipe'}), 500
    finally:
        db.close()

@api_bp.route('/recipes/<int:recipe_id>', methods=['PUT'])
def update_recipe(recipe_id):
    """Update a recipe"""
    try:
        data = request.get_json()
        db = get_db_session()
        
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        # Update fields
        if 'title' in data:
            recipe.title = data['title']
        if 'description' in data:
            recipe.description = data['description']
        if 'ingredients' in data:
            recipe.ingredients = json.dumps(data['ingredients'])
        if 'instructions' in data:
            recipe.instructions = data['instructions']
        if 'cooking_time' in data:
            recipe.cooking_time = data['cooking_time']
        if 'servings' in data:
            recipe.servings = data['servings']
        if 'difficulty' in data:
            recipe.difficulty = data['difficulty']
        if 'cuisine' in data:
            recipe.cuisine = data['cuisine']
        if 'image_url' in data:
            recipe.image_url = data['image_url']
        
        recipe.updated_at = datetime.utcnow()
        db.commit()
        
        return jsonify({'message': 'Recipe updated successfully'})
    
    except Exception as e:
        logger.error(f"Error updating recipe {recipe_id}: {str(e)}")
        return jsonify({'error': 'Failed to update recipe'}), 500
    finally:
        db.close()

@api_bp.route('/recipes/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    """Delete a recipe"""
    try:
        db = get_db_session()
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        db.delete(recipe)
        db.commit()
        
        return jsonify({'message': 'Recipe deleted successfully'})
    
    except Exception as e:
        logger.error(f"Error deleting recipe {recipe_id}: {str(e)}")
        return jsonify({'error': 'Failed to delete recipe'}), 500
    finally:
        db.close()

@api_bp.route('/upload-image', methods=['POST'])
def upload_image():
    """Upload and analyze recipe image"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            
            # Create uploads directory if it doesn't exist
            upload_folder = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            
            # Save file
            filepath = os.path.join(upload_folder, filename)
            file.save(filepath)
            
            # Analyze image with OpenAI
            try:
                recipe_data = analyze_recipe_image(filepath)
                return jsonify({
                    'message': 'Image analyzed successfully',
                    'recipe_data': recipe_data,
                    'image_url': f'/uploads/{filename}'
                })
            except Exception as e:
                logger.error(f"Error analyzing image: {str(e)}")
                return jsonify({'error': 'Failed to analyze image'}), 500
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        return jsonify({'error': 'Failed to upload image'}), 500

@api_bp.route('/generate-recipe', methods=['POST'])
def generate_recipe():
    """Generate recipe from ingredients"""
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', [])
        
        if not ingredients:
            return jsonify({'error': 'No ingredients provided'}), 400
        
        # Generate recipe using OpenAI
        try:
            recipe_data = generate_recipe_from_ingredients(ingredients)
            return jsonify({
                'message': 'Recipe generated successfully',
                'recipe_data': recipe_data
            })
        except Exception as e:
            logger.error(f"Error generating recipe: {str(e)}")
            return jsonify({'error': 'Failed to generate recipe'}), 500
    
    except Exception as e:
        logger.error(f"Error in generate recipe endpoint: {str(e)}")
        return jsonify({'error': 'Failed to process request'}), 500

@api_bp.route('/ai-chef', methods=['POST'])
def ai_chef():
    """AI Chef free-form recipe assistant endpoint"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '').strip()
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        # Use OpenAI to generate a markdown response
        from openai_client import client
        if not client:
            return jsonify({'error': 'AI Chef is not available. Please set your OpenAI API key.'}), 500
        system_message = (
            "You are ChefGenius, a passionate and knowledgeable culinary expert with expertise in global cuisine! "
            "Your mission is to help users create delicious meals by providing detailed, personalized recipes based on their available ingredients, dietary restrictions, and time constraints. "
            "Combine deep culinary knowledge with nutritional wisdom to suggest recipes that are both practical and enjoyable. "
            "Present your answers in clear markdown formatting, with structured lists, numbered steps, emoji for dietary tags, and extra tips as described in the instructions."
        )
        user_message = prompt
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            max_tokens=1200,
        )
        markdown = response.choices[0].message.content
        return jsonify({'markdown': markdown})
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': f'AI Chef error: {str(e)}'}), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()}) 