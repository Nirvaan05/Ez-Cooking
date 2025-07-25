import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRecipeSchema } from "@shared/schema";
import { generateAIRecipes } from "./openai";
import { recognizeIngredients } from "./vision";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get all recipes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getRecipes();
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  // Save a recipe
  app.post("/api/recipes", async (req, res) => {
    try {
      const validatedData = insertRecipeSchema.parse(req.body);
      const savedRecipe = await storage.saveRecipe(validatedData);
      res.status(201).json(savedRecipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid recipe data", details: error.errors });
      }
      console.error("Error saving recipe:", error);
      res.status(500).json({ error: "Failed to save recipe" });
    }
  });

  // Delete a recipe
  app.delete("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid recipe ID" });
      }
      
      await storage.deleteRecipe(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ error: "Failed to delete recipe" });
    }
  });

  // Toggle favorite status
  app.patch("/api/recipes/:id/favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid recipe ID" });
      }
      
      const updatedRecipe = await storage.toggleFavorite(id);
      res.json(updatedRecipe);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ error: "Failed to toggle favorite" });
    }
  });

  // Search recipes by ingredients
  app.post("/api/recipes/search", async (req, res) => {
    try {
      const { ingredients } = req.body;
      
      if (!Array.isArray(ingredients)) {
        return res.status(400).json({ error: "Ingredients must be an array" });
      }
      
      const recipes = await storage.searchRecipesByIngredients(ingredients);
      res.json(recipes);
    } catch (error) {
      console.error("Error searching recipes:", error);
      res.status(500).json({ error: "Failed to search recipes" });
    }
  });

  // Get recipes by tags
  app.post("/api/recipes/by-tags", async (req, res) => {
    try {
      const { tags } = req.body;
      
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: "Tags must be an array" });
      }
      
      const recipes = await storage.getRecipesByTags(tags);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes by tags:", error);
      res.status(500).json({ error: "Failed to fetch recipes by tags" });
    }
  });

  // Generate AI recipes
  app.post("/api/recipes/generate", async (req, res) => {
    try {
      const { ingredients, dietaryPreferences, cookingTime } = req.body;
      if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ error: "Ingredients array is required" });
      }
      
      const recipes = await generateAIRecipes(ingredients, dietaryPreferences, cookingTime);
      res.json(recipes);
    } catch (error) {
      console.error("Error generating AI recipes:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate AI recipes" });
    }
  });

  // Recognize ingredients from image
  app.post("/api/ingredients/recognize", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: "Base64 image data is required" });
      }
      
      // Remove data URL prefix if present
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const ingredients = await recognizeIngredients(base64Data);
      res.json({ ingredients });
    } catch (error) {
      console.error("Error recognizing ingredients:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to recognize ingredients" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
