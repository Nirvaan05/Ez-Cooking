import { Recipe } from "@shared/schema";

// API functions for recipe database
export async function searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
  try {
    const response = await fetch('/api/recipes/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
      throw new Error('Failed to search recipes');
    }

    const recipes = await response.json();
    console.log(`Found ${recipes.length} recipes matching ingredients:`, ingredients);
    return recipes;
  } catch (error) {
    console.error('Error searching recipes:', error);
    return [];
  }
}

// Get all recipes from database
export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const response = await fetch('/api/recipes');
    
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }

    const recipes = await response.json();
    return recipes;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

// Save a recipe to database
export async function saveRecipeToDatabase(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe | null> {
  try {
    const response = await fetch('/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    });

    if (!response.ok) {
      throw new Error('Failed to save recipe');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving recipe:', error);
    return null;
  }
}

// Toggle favorite status of a recipe
export async function toggleRecipeFavorite(recipeId: number): Promise<Recipe | null> {
  try {
    const response = await fetch(`/api/recipes/${recipeId}/favorite`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      throw new Error('Failed to toggle favorite');
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return null;
  }
}