import OpenAI from "openai";
import { Recipe } from "@shared/schema";
import { findRecipesByIngredients, loadRecipeDatabase, convertToRecipeFormat, getAvailableCuisines } from "./recipeDatabase";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "your-api-key-here",
  dangerouslyAllowBrowser: true
});

export async function generateRecipes(
  ingredients: string[],
  dietaryPreferences?: string,
  cookingTime?: string
): Promise<Recipe[]> {
  try {
    // Ensure database is loaded
    await loadRecipeDatabase();
    
    // Find similar recipes from database for inspiration
    const databaseMatches = findRecipesByIngredients(ingredients, 5);
    const availableCuisines = getAvailableCuisines();
    
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
      id: `recipe-${Date.now()}-${index}`,
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
    throw new Error("Failed to generate recipes. Please check your OpenAI API key and try again.");
  }
}
