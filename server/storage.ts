import { type Recipe } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for recipes - frontend handles most logic
export interface IStorage {
  getRecipes(): Promise<Recipe[]>;
  saveRecipe(recipe: Recipe): Promise<Recipe>;
  deleteRecipe(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private recipes: Map<string, Recipe>;

  constructor() {
    this.recipes = new Map();
  }

  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async saveRecipe(recipe: Recipe): Promise<Recipe> {
    this.recipes.set(recipe.id, recipe);
    return recipe;
  }

  async deleteRecipe(id: string): Promise<void> {
    this.recipes.delete(id);
  }
}

export const storage = new MemStorage();
