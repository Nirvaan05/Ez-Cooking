import OpenAI from "openai";
import { Recipe } from "@shared/schema";
import { searchRecipesByIngredients } from "./recipeDatabase";

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
    // If AI is disabled or unavailable, return database recipes
    const openai = getOpenAIClient();
    if (!useAI || !openai) {
      return await generateDatabaseRecipes(ingredients, dietaryPreferences, cookingTime);
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

    let promptText = `Generate 3 unique, authentic recipes using these ingredients: ${ingredients.join(", ")}
    
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
  } catch (error) {
    console.error("Error generating recipes:", error);
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