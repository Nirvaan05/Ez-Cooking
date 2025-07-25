import OpenAI from "openai";
import { Recipe } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function generateAIRecipes(
  ingredients: string[],
  dietaryPreferences?: string,
  cookingTime?: string
): Promise<Recipe[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  // Build AI prompt with specific time constraints
  let timeConstraint = "";
  if (cookingTime) {
    if (cookingTime.includes("15")) {
      timeConstraint = "Each recipe must be completed in 15 minutes or less. Focus on quick cooking methods, minimal prep, and simple techniques.";
    } else if (cookingTime.includes("30")) {
      timeConstraint = "Each recipe should take no more than 30 minutes total cooking time.";
    } else if (cookingTime.includes("60")) {
      timeConstraint = "Each recipe should take no more than 60 minutes total cooking time.";
    } else if (cookingTime.toLowerCase().includes("quick")) {
      timeConstraint = "Focus on quick recipes that can be made in 15-20 minutes.";
    }
  }

  const promptText = `Generate 3 unique, authentic recipes using these ingredients: ${ingredients.join(", ")}
  
  ${dietaryPreferences ? `Dietary preferences: ${dietaryPreferences}` : ""}
  ${timeConstraint ? `TIME CONSTRAINT: ${timeConstraint}` : ""}

  Please respond with exactly this JSON format:
  {
    "recipes": [
      {
        "title": "Recipe Name",
        "description": "Brief description",
        "cookTime": "30 minutes",
        "servings": "4 servings", 
        "difficulty": "Easy",
        "ingredients": [
          {"name": "ingredient name", "amount": "1 cup"},
          {"name": "ingredient name", "amount": "2 tbsp"}
        ],
        "instructions": [
          "Step 1 instruction",
          "Step 2 instruction"
        ],
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
        content: promptText
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
}