import { useState, useEffect } from "react";
import { Recipe } from "@shared/schema";
import { RecipeCard } from "./recipe-card";
import { 
  findRecipesByIngredients, 
  getRandomRecipes, 
  getAvailableCuisines,
  findRecipesByCuisine,
  convertToRecipeFormat,
  loadRecipeDatabase 
} from "@/lib/recipeDatabase";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Database } from "lucide-react";

interface DatabaseRecipesProps {
  userIngredients?: string[];
  onViewRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
}

export function DatabaseRecipes({ userIngredients = [], onViewRecipe, onToggleFavorite }: DatabaseRecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState<string>("all");
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      await loadRecipeDatabase();
      
      let databaseRecipes;
      
      if (userIngredients.length > 0) {
        // Show recipes that match user ingredients
        databaseRecipes = findRecipesByIngredients(userIngredients, 6);
      } else if (selectedCuisine && selectedCuisine !== "all") {
        // Show recipes from selected cuisine
        databaseRecipes = findRecipesByCuisine(selectedCuisine, 6);
      } else {
        // Show random recipes
        databaseRecipes = getRandomRecipes(6);
      }

      // Convert database entries to Recipe format and enhance with AI-style data
      const enhancedRecipes = databaseRecipes.map((dbRecipe, index) => {
        const partial = convertToRecipeFormat(dbRecipe);
        
        // Generate a realistic recipe from database entry
        const fullRecipe: Recipe = {
          id: partial.id!,
          title: generateRecipeTitle(dbRecipe.ingredients, dbRecipe.cuisine),
          description: generateRecipeDescription(dbRecipe.cuisine, dbRecipe.ingredients),
          cookTime: generateCookTime(dbRecipe.ingredients.length),
          servings: "4 servings",
          difficulty: generateDifficulty(dbRecipe.ingredients.length),
          ingredients: partial.ingredients!,
          instructions: generateInstructions(dbRecipe.ingredients, dbRecipe.cuisine),
          tags: [...partial.tags!, generateAdditionalTags(dbRecipe.ingredients)],
          isFavorite: false,
          createdAt: new Date().toISOString(),
        };
        
        return fullRecipe;
      });

      setRecipes(enhancedRecipes);
      
      // Load available cuisines
      const cuisines = getAvailableCuisines();
      setAvailableCuisines(cuisines);
      
    } catch (error) {
      console.error('Error loading database recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [userIngredients.join(","), selectedCuisine]);

  const handleRefresh = () => {
    loadRecipes();
  };

  const handleCuisineChange = (cuisine: string) => {
    setSelectedCuisine(cuisine);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Database className="h-12 w-12 animate-pulse text-[hsl(16,84%,60%)] mx-auto mb-4" />
        <p className="text-gray-600">Loading recipe database...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-[hsl(210,22%,22%)] mb-2">
            {userIngredients.length > 0 ? "Recipes from Database" : "Recipe Inspiration"}
          </h3>
          <p className="text-gray-600">
            {userIngredients.length > 0 
              ? `Authentic recipes using your ingredients` 
              : "Discover authentic recipes from around the world"
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {userIngredients.length === 0 && (
            <Select value={selectedCuisine} onValueChange={handleCuisineChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All cuisines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cuisines</SelectItem>
                {availableCuisines.slice(0, 15).map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button 
            onClick={handleRefresh}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {recipes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onViewRecipe={onViewRecipe}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No recipes found matching your criteria.</p>
          <Button onClick={handleRefresh} className="mt-4">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper functions to generate realistic recipe data from database entries

function generateRecipeTitle(ingredients: string[], cuisine: string): string {
  const mainIngredients = ingredients.slice(0, 3);
  const cuisineFormatted = cuisine.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  
  if (mainIngredients.some(ing => ing.includes("chicken"))) {
    return `${cuisineFormatted} Chicken Delight`;
  } else if (mainIngredients.some(ing => ing.includes("beef"))) {
    return `${cuisineFormatted} Beef Specialty`;
  } else if (mainIngredients.some(ing => ing.includes("fish"))) {
    return `${cuisineFormatted} Fish Dish`;
  } else if (mainIngredients.some(ing => ing.includes("pasta") || ing.includes("noodle"))) {
    return `${cuisineFormatted} Pasta Creation`;
  } else {
    return `${cuisineFormatted} ${mainIngredients[0]?.replace(/\b\w/g, l => l.toUpperCase())} Special`;
  }
}

function generateRecipeDescription(cuisine: string, ingredients: string[]): string {
  const cuisineFormatted = cuisine.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const mainIngredients = ingredients.slice(0, 3).join(", ");
  
  return `An authentic ${cuisineFormatted} recipe featuring ${mainIngredients}. This traditional dish brings together classic flavors and cooking techniques for a delicious meal.`;
}

function generateCookTime(ingredientCount: number): string {
  if (ingredientCount <= 5) return "20 min";
  if (ingredientCount <= 8) return "35 min";
  if (ingredientCount <= 12) return "50 min";
  return "1 hour 15 min";
}

function generateDifficulty(ingredientCount: number): "Easy" | "Medium" | "Hard" {
  if (ingredientCount <= 6) return "Easy";
  if (ingredientCount <= 10) return "Medium";
  return "Hard";
}

function generateInstructions(ingredients: string[], cuisine: string): string[] {
  const instructions = [
    "Prepare all ingredients by washing and chopping as needed.",
    "Heat oil in a large pan over medium heat.",
  ];

  if (ingredients.some(ing => ing.includes("onion") || ing.includes("garlic"))) {
    instructions.push("Sauté onions and garlic until fragrant and translucent.");
  }

  if (ingredients.some(ing => ing.includes("chicken") || ing.includes("beef") || ing.includes("meat"))) {
    instructions.push("Add protein and cook until browned on all sides.");
  }

  instructions.push("Add remaining ingredients and seasonings according to taste.");
  
  if (cuisine.includes("asian") || cuisine.includes("chinese") || cuisine.includes("thai")) {
    instructions.push("Stir-fry everything together until well combined and heated through.");
  } else {
    instructions.push("Simmer gently until all flavors are well combined.");
  }

  instructions.push("Adjust seasoning if needed and serve hot.");

  return instructions;
}

function generateAdditionalTags(ingredients: string[]): string {
  if (ingredients.some(ing => ing.includes("chicken") || ing.includes("beef"))) {
    return "protein-rich";
  } else if (ingredients.some(ing => ing.includes("vegetable") || ing.includes("spinach"))) {
    return "vegetarian";
  } else if (ingredients.some(ing => ing.includes("spice") || ing.includes("pepper"))) {
    return "spicy";
  }
  return "comfort-food";
}