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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  favoriteRecipes: many(userFavorites),
}));

export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  recipeId: serial("recipe_id").references(() => recipes.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [userFavorites.recipeId],
    references: [recipes.id],
  }),
}));

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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const generateRecipeRequestSchema = z.object({
  ingredients: z.array(z.string()),
  dietaryPreferences: z.string().optional(),
  cookingTime: z.string().optional(),
});

// Types
export type Recipe = z.infer<typeof selectRecipeSchema>;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type GenerateRecipeRequest = z.infer<typeof generateRecipeRequestSchema>;
