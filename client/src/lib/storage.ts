import { Recipe } from "@shared/schema";

const SAVED_RECIPES_KEY = "smart-recipe-generator-saved-recipes";

export function getSavedRecipes(): Recipe[] {
  try {
    const saved = localStorage.getItem(SAVED_RECIPES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading saved recipes:", error);
    return [];
  }
}

export function saveRecipe(recipe: Recipe): void {
  try {
    const savedRecipes = getSavedRecipes();
    const existingIndex = savedRecipes.findIndex(r => r.id === recipe.id);
    
    if (existingIndex >= 0) {
      savedRecipes[existingIndex] = recipe;
    } else {
      savedRecipes.push(recipe);
    }
    
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
  } catch (error) {
    console.error("Error saving recipe:", error);
    throw new Error("Failed to save recipe");
  }
}

export function removeRecipe(recipeId: string): void {
  try {
    const savedRecipes = getSavedRecipes();
    const filtered = savedRecipes.filter(r => r.id !== recipeId);
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing recipe:", error);
    throw new Error("Failed to remove recipe");
  }
}

export function toggleRecipeFavorite(recipeId: string): void {
  try {
    const savedRecipes = getSavedRecipes();
    const recipe = savedRecipes.find(r => r.id === recipeId);
    
    if (recipe) {
      recipe.isFavorite = !recipe.isFavorite;
      localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw new Error("Failed to toggle favorite");
  }
}
