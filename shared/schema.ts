import { z } from "zod";

export const recipeIngredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
});

export const recipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  cookTime: z.string(),
  servings: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  ingredients: z.array(recipeIngredientSchema),
  instructions: z.array(z.string()),
  tags: z.array(z.string()),
  image: z.string().optional(),
  isFavorite: z.boolean().default(false),
  createdAt: z.string(),
});

export const generateRecipeRequestSchema = z.object({
  ingredients: z.array(z.string()),
  dietaryPreferences: z.string().optional(),
  cookingTime: z.string().optional(),
});

export type Recipe = z.infer<typeof recipeSchema>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type GenerateRecipeRequest = z.infer<typeof generateRecipeRequestSchema>;
