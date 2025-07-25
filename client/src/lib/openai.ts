import OpenAI from "openai";
import { Recipe } from "@shared/schema";

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
    const prompt = `Generate 3 unique recipes using these ingredients: ${ingredients.join(", ")}
    
    ${dietaryPreferences ? `Dietary preferences: ${dietaryPreferences}` : ""}
    ${cookingTime ? `Preferred cooking time: ${cookingTime}` : ""}
    
    For each recipe, provide:
    - A creative and appealing title
    - A brief description (2-3 sentences)
    - Cook time in format like "25 min" or "1 hour 30 min"
    - Number of servings like "4 servings"
    - Difficulty level: "Easy", "Medium", or "Hard"
    - Complete ingredient list with amounts
    - Step-by-step instructions
    - 2-3 relevant tags describing the recipe
    
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
