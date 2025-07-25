import { type Recipe, type InsertRecipe, recipes } from "@shared/schema";
import { db } from "./db";
import { eq, like, or, ilike, sql } from "drizzle-orm";

// Storage interface for recipes
export interface IStorage {
  getRecipes(): Promise<Recipe[]>;
  saveRecipe(recipe: InsertRecipe): Promise<Recipe>;
  deleteRecipe(id: number): Promise<void>;
  searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]>;
  getRecipesByTags(tags: string[]): Promise<Recipe[]>;
  toggleFavorite(id: number): Promise<Recipe>;
}

export class DatabaseStorage implements IStorage {
  async getRecipes(): Promise<Recipe[]> {
    try {
      const result = await db.select().from(recipes).orderBy(sql`${recipes.createdAt} DESC`);
      return result.map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients as Recipe['ingredients'],
        instructions: recipe.instructions as Recipe['instructions'],
        tags: recipe.tags as Recipe['tags'],
      }));
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return [];
    }
  }

  async saveRecipe(recipe: InsertRecipe): Promise<Recipe> {
    try {
      const [savedRecipe] = await db
        .insert(recipes)
        .values({
          ...recipe,
          id: undefined, // Let the database generate the ID
        })
        .returning();
      return {
        ...savedRecipe,
        ingredients: savedRecipe.ingredients as Recipe['ingredients'],
        instructions: savedRecipe.instructions as Recipe['instructions'],
        tags: savedRecipe.tags as Recipe['tags'],
      };
    } catch (error) {
      console.error("Error saving recipe:", error);
      throw new Error("Failed to save recipe");
    }
  }

  async deleteRecipe(id: number): Promise<void> {
    try {
      await db.delete(recipes).where(eq(recipes.id, id));
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw new Error("Failed to delete recipe");
    }
  }

  async searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    try {
      if (ingredients.length === 0) return [];
      
      // Search for recipes that contain any of the specified ingredients
      const searchConditions = ingredients.map(ingredient => 
        ilike(sql`${recipes.ingredients}::text`, `%${ingredient.toLowerCase()}%`)
      );
      
      const result = await db
        .select()
        .from(recipes)
        .where(or(...searchConditions))
        .orderBy(sql`${recipes.createdAt} DESC`)
        .limit(20);
      
      return result.map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients as Recipe['ingredients'],
        instructions: recipe.instructions as Recipe['instructions'],
        tags: recipe.tags as Recipe['tags'],
      }));
    } catch (error) {
      console.error("Error searching recipes by ingredients:", error);
      return [];
    }
  }

  async getRecipesByTags(tags: string[]): Promise<Recipe[]> {
    try {
      if (tags.length === 0) return [];
      
      const tagConditions = tags.map(tag => 
        ilike(sql`${recipes.tags}::text`, `%${tag.toLowerCase()}%`)
      );
      
      const result = await db
        .select()
        .from(recipes)
        .where(or(...tagConditions))
        .orderBy(sql`${recipes.createdAt} DESC`)
        .limit(20);
      
      return result.map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients as Recipe['ingredients'],
        instructions: recipe.instructions as Recipe['instructions'],
        tags: recipe.tags as Recipe['tags'],
      }));
    } catch (error) {
      console.error("Error fetching recipes by tags:", error);
      return [];
    }
  }

  async toggleFavorite(id: number): Promise<Recipe> {
    try {
      const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
      if (!recipe) {
        throw new Error("Recipe not found");
      }
      
      const [updatedRecipe] = await db
        .update(recipes)
        .set({ isFavorite: !recipe.isFavorite })
        .where(eq(recipes.id, id))
        .returning();
      
      return {
        ...updatedRecipe,
        ingredients: updatedRecipe.ingredients as Recipe['ingredients'],
        instructions: updatedRecipe.instructions as Recipe['instructions'],
        tags: updatedRecipe.tags as Recipe['tags'],
      };
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw new Error("Failed to toggle favorite");
    }
  }
}

// Keep the in-memory storage as a fallback
export class MemStorage implements IStorage {
  private recipes: Map<number, Recipe>;
  private nextId: number = 1;

  constructor() {
    this.recipes = new Map();
  }

  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async saveRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const savedRecipe: Recipe = {
      ...recipe,
      id: this.nextId++,
      image: recipe.image || null,
      isFavorite: recipe.isFavorite || false,
      createdAt: new Date(),
    };
    this.recipes.set(savedRecipe.id, savedRecipe);
    return savedRecipe;
  }

  async deleteRecipe(id: number): Promise<void> {
    this.recipes.delete(id);
  }

  async searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    const allRecipes = Array.from(this.recipes.values());
    return allRecipes.filter(recipe => 
      ingredients.some(ingredient => 
        JSON.stringify(recipe.ingredients).toLowerCase().includes(ingredient.toLowerCase())
      )
    );
  }

  async getRecipesByTags(tags: string[]): Promise<Recipe[]> {
    const allRecipes = Array.from(this.recipes.values());
    return allRecipes.filter(recipe => 
      tags.some(tag => 
        recipe.tags.some(recipeTag => 
          recipeTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }

  async toggleFavorite(id: number): Promise<Recipe> {
    const recipe = this.recipes.get(id);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    
    const updatedRecipe = { ...recipe, isFavorite: !recipe.isFavorite };
    this.recipes.set(id, updatedRecipe);
    return updatedRecipe;
  }
}

export const storage = new DatabaseStorage();
