import { Recipe } from "@shared/schema";

// Recipe database interface for managing the dataset
export interface RecipeDataEntry {
  id: number;
  cuisine: string;
  ingredients: string[];
}

let recipeDatabase: RecipeDataEntry[] = [];
let isLoaded = false;

// Load the recipe database from our dataset
export async function loadRecipeDatabase(): Promise<void> {
  if (isLoaded) return;
  
  try {
    // Load the training dataset
    const response = await fetch('/assets/train.json');
    if (!response.ok) {
      throw new Error('Failed to load recipe database');
    }
    
    const data: RecipeDataEntry[] = await response.json();
    recipeDatabase = data;
    isLoaded = true;
    console.log(`Loaded ${recipeDatabase.length} recipes from database`);
  } catch (error) {
    console.error('Error loading recipe database:', error);
    // Fallback to empty database if loading fails
    recipeDatabase = [];
    isLoaded = true;
  }
}

// Find recipes by ingredients (ingredients matching)
export function findRecipesByIngredients(userIngredients: string[], maxResults: number = 10): RecipeDataEntry[] {
  if (!isLoaded) {
    console.warn('Recipe database not loaded yet');
    return [];
  }

  const userIngredientsLower = userIngredients.map(ing => ing.toLowerCase().trim());
  
  // Score recipes based on ingredient matches
  const scoredRecipes = recipeDatabase.map(recipe => {
    const recipeIngredientsLower = recipe.ingredients.map(ing => ing.toLowerCase().trim());
    
    // Count how many user ingredients are in this recipe
    const matchCount = userIngredientsLower.filter(userIng =>
      recipeIngredientsLower.some(recipeIng =>
        recipeIng.includes(userIng) || userIng.includes(recipeIng)
      )
    ).length;
    
    // Calculate match percentage
    const matchPercentage = matchCount / userIngredientsLower.length;
    
    return {
      recipe,
      matchCount,
      matchPercentage,
      totalIngredients: recipe.ingredients.length
    };
  })
  .filter(item => item.matchCount > 0) // Only recipes with at least one match
  .sort((a, b) => {
    // Sort by match percentage first, then by match count
    if (a.matchPercentage !== b.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return b.matchCount - a.matchCount;
  });

  return scoredRecipes.slice(0, maxResults).map(item => item.recipe);
}

// Get recipes by cuisine type
export function findRecipesByCuisine(cuisine: string, maxResults: number = 10): RecipeDataEntry[] {
  if (!isLoaded) {
    console.warn('Recipe database not loaded yet');
    return [];
  }

  return recipeDatabase
    .filter(recipe => recipe.cuisine.toLowerCase() === cuisine.toLowerCase())
    .slice(0, maxResults);
}

// Get all available cuisines
export function getAvailableCuisines(): string[] {
  if (!isLoaded) {
    console.warn('Recipe database not loaded yet');
    return [];
  }

  const cuisines = Array.from(new Set(recipeDatabase.map(recipe => recipe.cuisine)));
  return cuisines.sort();
}

// Get random recipes
export function getRandomRecipes(count: number = 5): RecipeDataEntry[] {
  if (!isLoaded) {
    console.warn('Recipe database not loaded yet');
    return [];
  }

  const shuffled = [...recipeDatabase].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Convert database entry to our Recipe format for AI enhancement
export function convertToRecipeFormat(entry: RecipeDataEntry): Partial<Recipe> {
  return {
    id: `db-${entry.id}`,
    ingredients: entry.ingredients.map(ing => ({
      name: ing,
      amount: "As needed" // Database doesn't have amounts
    })),
    tags: [entry.cuisine, "database"],
    // Other fields will be filled by AI generation
  };
}

// Initialize database on module load
loadRecipeDatabase();