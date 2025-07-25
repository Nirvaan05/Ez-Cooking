import OpenAI from "openai";
import { Recipe } from "@shared/schema";
import { findRecipesByIngredients, loadRecipeDatabase, convertToRecipeFormat, getAvailableCuisines } from "./recipeDatabase";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") {
    return null;
  }
  return new OpenAI({ 
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

export async function generateRecipes(
  ingredients: string[],
  dietaryPreferences?: string,
  cookingTime?: string,
  useAI: boolean = true
): Promise<Recipe[]> {
  try {
    // Ensure database is loaded
    await loadRecipeDatabase();
    
    // Find similar recipes from database for inspiration
    const databaseMatches = findRecipesByIngredients(ingredients, 5);
    const availableCuisines = getAvailableCuisines();
    
    // If AI is disabled or unavailable, return enhanced database recipes
    const openai = getOpenAIClient();
    if (!useAI || !openai) {
      return generateDatabaseRecipes(ingredients, dietaryPreferences, cookingTime, databaseMatches);
    }
    
    // Build enhanced prompt with database context
    let prompt = `Generate 3 unique, authentic recipes using these ingredients: ${ingredients.join(", ")}
    
    ${dietaryPreferences ? `Dietary preferences: ${dietaryPreferences}` : ""}
    ${cookingTime ? `Preferred cooking time: ${cookingTime}` : ""}`;

    // Add database context for better authenticity
    if (databaseMatches.length > 0) {
      prompt += `\n\nFor inspiration, here are some authentic recipes that use similar ingredients:`;
      databaseMatches.forEach((match, index) => {
        prompt += `\n${index + 1}. ${match.cuisine} cuisine with ingredients: ${match.ingredients.slice(0, 8).join(", ")}`;
      });
      prompt += `\n\nUse these as inspiration for authentic flavor combinations and cooking techniques.`;
    }

    if (availableCuisines.length > 0) {
      const popularCuisines = availableCuisines.slice(0, 10);
      prompt += `\n\nAvailable authentic cuisines include: ${popularCuisines.join(", ")}. Consider these styles for authentic recipes.`;
    }

    prompt += `
    
    For each recipe, provide:
    - A creative and appealing title that reflects authentic cuisine
    - A brief description (2-3 sentences) highlighting the dish's origin or style
    - Cook time in format like "25 min" or "1 hour 30 min"
    - Number of servings like "4 servings"
    - Difficulty level: "Easy", "Medium", or "Hard"
    - Complete ingredient list with realistic amounts
    - Step-by-step instructions with proper cooking techniques
    - 2-3 relevant tags (cuisine type, cooking method, etc.)
    
    Return the response as a JSON object with this exact structure:
    {
      "recipes": [
        {
          "title": "Recipe Name",
          "description": "Brief description",
          "cookTime": "25 min",
          "servings": "4 servings", 
          "difficulty": "Easy",
          "ingredients": [
            {"name": "ingredient name", "amount": "1 cup"}
          ],
          "instructions": ["Step 1", "Step 2"],
          "tags": ["tag1", "tag2"]
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional chef and recipe developer. Create detailed, practical recipes that are delicious and easy to follow."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return result.recipes.map((recipe: any, index: number) => ({
      id: `ai-recipe-${Date.now()}-${index}`,
      title: recipe.title,
      description: recipe.description,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tags: recipe.tags || [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error generating recipes:", error);
    // Fall back to database recipes if AI fails
    return generateDatabaseRecipes(ingredients, dietaryPreferences, cookingTime);
  }
}

// Generate recipes using only the database when AI is unavailable
export function generateDatabaseRecipes(
  ingredients: string[],
  dietaryPreferences?: string,
  cookingTime?: string,
  databaseMatches?: any[]
): Recipe[] {
  const matches = databaseMatches || findRecipesByIngredients(ingredients, 3);
  
  if (matches.length === 0) {
    throw new Error("No recipes found in database matching your ingredients. Try different ingredients or enable AI generation.");
  }

  return matches.map((dbRecipe, index) => {
    const enhancedRecipe: Recipe = {
      id: `db-recipe-${dbRecipe.id}-${Date.now()}`,
      title: generateRecipeTitle(dbRecipe.ingredients, dbRecipe.cuisine),
      description: generateRecipeDescription(dbRecipe.cuisine, dbRecipe.ingredients),
      cookTime: generateCookTime(dbRecipe.ingredients.length),
      servings: "4 servings",
      difficulty: generateDifficulty(dbRecipe.ingredients.length),
      ingredients: dbRecipe.ingredients.map((ing: string) => ({
        name: ing,
        amount: "As needed"
      })),
      instructions: generateInstructions(dbRecipe.ingredients, dbRecipe.cuisine),
      tags: [dbRecipe.cuisine.replace(/_/g, "-"), "database", "authentic"],
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    // Apply dietary preferences filter
    if (dietaryPreferences && dietaryPreferences !== "none") {
      if (!matchesDietaryPreferences(enhancedRecipe, dietaryPreferences)) {
        return null;
      }
    }

    return enhancedRecipe;
  }).filter(Boolean) as Recipe[];
}

// Helper functions (moved from database-recipes component)
function generateRecipeTitle(ingredients: string[], cuisine: string): string {
  const mainIngredients = ingredients.slice(0, 3);
  const cuisineFormatted = cuisine.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  
  if (mainIngredients.some(ing => ing.includes("chicken"))) {
    return `${cuisineFormatted} Chicken Delight`;
  } else if (mainIngredients.some(ing => ing.includes("beef"))) {
    return `${cuisineFormatted} Beef Specialty`;
  } else if (mainIngredients.some(ing => ing.includes("fish"))) {
    return `${cuisineFormatted} Fish Dish`;
  } else if (mainIngredients.some(ing => ing.includes("pasta") || ing.includes("noodle"))) {
    return `${cuisineFormatted} Pasta Creation`;
  } else {
    return `${cuisineFormatted} ${mainIngredients[0]?.replace(/\b\w/g, l => l.toUpperCase())} Special`;
  }
}

function generateRecipeDescription(cuisine: string, ingredients: string[]): string {
  const cuisineFormatted = cuisine.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const mainIngredients = ingredients.slice(0, 3).join(", ");
  
  return `An authentic ${cuisineFormatted} recipe featuring ${mainIngredients}. This traditional dish brings together classic flavors and cooking techniques for a delicious meal.`;
}

function generateCookTime(ingredientCount: number): string {
  if (ingredientCount <= 5) return "20 min";
  if (ingredientCount <= 8) return "35 min";
  if (ingredientCount <= 12) return "50 min";
  return "1 hour 15 min";
}

function generateDifficulty(ingredientCount: number): "Easy" | "Medium" | "Hard" {
  if (ingredientCount <= 6) return "Easy";
  if (ingredientCount <= 10) return "Medium";
  return "Hard";
}

function generateInstructions(ingredients: string[], cuisine: string): string[] {
  const instructions = [
    "Prepare all ingredients by washing and chopping as needed.",
    "Heat oil in a large pan over medium heat.",
  ];

  if (ingredients.some(ing => ing.includes("onion") || ing.includes("garlic"))) {
    instructions.push("Sauté onions and garlic until fragrant and translucent.");
  }

  if (ingredients.some(ing => ing.includes("chicken") || ing.includes("beef") || ing.includes("meat"))) {
    instructions.push("Add protein and cook until browned on all sides.");
  }

  instructions.push("Add remaining ingredients and seasonings according to taste.");
  
  if (cuisine.includes("asian") || cuisine.includes("chinese") || cuisine.includes("thai")) {
    instructions.push("Stir-fry everything together until well combined and heated through.");
  } else {
    instructions.push("Simmer gently until all flavors are well combined.");
  }

  instructions.push("Adjust seasoning if needed and serve hot.");

  return instructions;
}

function matchesDietaryPreferences(recipe: Recipe, preferences: string): boolean {
  const ingredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
  
  switch (preferences.toLowerCase()) {
    case "vegetarian":
      return !ingredients.some(ing => 
        ing.includes("meat") || ing.includes("chicken") || ing.includes("beef") || 
        ing.includes("pork") || ing.includes("fish") || ing.includes("seafood")
      );
    case "vegan":
      return !ingredients.some(ing => 
        ing.includes("meat") || ing.includes("chicken") || ing.includes("beef") || 
        ing.includes("pork") || ing.includes("fish") || ing.includes("seafood") ||
        ing.includes("cheese") || ing.includes("milk") || ing.includes("egg") ||
        ing.includes("butter") || ing.includes("cream")
      );
    case "gluten-free":
      return !ingredients.some(ing => 
        ing.includes("flour") || ing.includes("wheat") || ing.includes("bread") ||
        ing.includes("pasta") || ing.includes("noodle")
      );
    default:
      return true;
  }
}
