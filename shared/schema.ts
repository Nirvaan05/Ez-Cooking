import { z } from "zod";
import { pgTable, text, varchar, jsonb, boolean, timestamp, serial, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Recipe ingredient schema
export const recipeIngredientSchema = z.object({
  name: z.string(),
  amount: z.string(),
});

// Database tables
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  cookTime: varchar("cook_time", { length: 50 }).notNull(),
  servings: varchar("servings", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  ingredients: jsonb("ingredients").notNull(),
  instructions: jsonb("instructions").notNull(),
  tags: jsonb("tags").notNull(),
  image: text("image"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    titleIdx: index("title_idx").on(table.title),
    tagsIdx: index("tags_idx").on(table.tags),
  }
});

// User-related tables removed per user request - focusing only on recipes

// Zod schemas
export const insertRecipeSchema = createInsertSchema(recipes, {
  ingredients: z.array(recipeIngredientSchema),
  instructions: z.array(z.string()),
  tags: z.array(z.string()),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
}).omit({
  id: true,
  createdAt: true,
});

export const selectRecipeSchema = createSelectSchema(recipes, {
  ingredients: z.array(recipeIngredientSchema),
  instructions: z.array(z.string()),
  tags: z.array(z.string()),
});

// User schemas removed per user request

export const generateRecipeRequestSchema = z.object({
  ingredients: z.array(z.string()),
  dietaryPreferences: z.string().optional(),
  cookingTime: z.string().optional(),
});

// Types
export type Recipe = z.infer<typeof selectRecipeSchema> & {
  id: number | string; // Allow both for compatibility
};
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
// User types removed per user request
export type GenerateRecipeRequest = z.infer<typeof generateRecipeRequestSchema>;
