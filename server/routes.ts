import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRecipeSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
