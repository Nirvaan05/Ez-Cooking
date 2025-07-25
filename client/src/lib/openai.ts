import { Recipe } from "@shared/schema";
import { searchRecipesByIngredients } from "./recipeDatabase";

export async function generateRecipes(
  ingredients: string[],
  dietaryPreferences?: string,
  cookingTime?: string,
  useAI: boolean = true
): Promise<Recipe[]> {
  try {
    if (!useAI) {
      // Use database recipes when AI is disabled
      return await generateDatabaseRecipes(ingredients, dietaryPreferences, cookingTime);
    }

    // Call backend AI endpoint
    const response = await fetch("/api/recipes/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ingredients,
        dietaryPreferences,
        cookingTime,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate AI recipes");
    }

    const recipes = await response.json();
    return recipes;
  } catch (error) {
    console.error("Error generating AI recipes:", error);
    // Fall back to database recipes if AI fails
    return await generateDatabaseRecipes(ingredients, dietaryPreferences, cookingTime);
  }
}

// Generate recipes using only the database when AI is unavailable
export async function generateDatabaseRecipes(
  ingredients: string[],
  dietaryPreferences?: string,
  cookingTime?: string
): Promise<Recipe[]> {
  try {
    const matches = await searchRecipesByIngredients(ingredients);
    
    if (matches.length === 0) {
      throw new Error("No recipes found in database matching your ingredients. Try different ingredients or enable AI generation.");
    }

    // Filter by dietary preferences if specified
    let filteredMatches = matches;
    if (dietaryPreferences && dietaryPreferences.toLowerCase() !== 'none') {
      filteredMatches = matches.filter(recipe => 
        recipe.tags.some(tag => 
          tag.toLowerCase().includes(dietaryPreferences.toLowerCase())
        )
      );
    }

    // Filter by cooking time if specified
    if (cookingTime && cookingTime !== 'any') {
      const timeLimit = cookingTime === 'quick' ? 30 : cookingTime === 'medium' ? 60 : 120;
      filteredMatches = filteredMatches.filter(recipe => {
        const cookTimeMatch = recipe.cookTime.match(/(\d+)/);
        if (cookTimeMatch) {
          const recipeTime = parseInt(cookTimeMatch[1]);
          return recipeTime <= timeLimit;
        }
        return true;
      });
    }

    // Return up to 3 recipes
    return filteredMatches.slice(0, 3);
  } catch (error) {
    console.error("Error fetching database recipes:", error);
    throw new Error("Failed to fetch recipes from database. Please try again.");
  }
}