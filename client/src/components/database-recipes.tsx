import { useState, useEffect } from "react";
import { Recipe } from "@shared/schema";
import { RecipeCard } from "./recipe-card";
import { searchRecipesByIngredients, getAllRecipes } from "@/lib/recipeDatabase";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";

interface DatabaseRecipesProps {
  userIngredients?: string[];
  onViewRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string | number) => void;
}

export function DatabaseRecipes({ userIngredients = [], onViewRecipe, onToggleFavorite }: DatabaseRecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      let fetchedRecipes: Recipe[];
      
      if (userIngredients.length > 0) {
        // Show recipes that match user ingredients
        fetchedRecipes = await searchRecipesByIngredients(userIngredients);
      } else {
        // Show all available recipes (limited by backend)
        fetchedRecipes = await getAllRecipes();
      }

      // Limit to 6 recipes for display
      setRecipes(fetchedRecipes.slice(0, 6));
      
    } catch (error) {
      console.error('Error loading database recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [userIngredients.join(",")]);

  const handleRefresh = () => {
    loadRecipes();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[hsl(210,22%,22%)] flex items-center gap-2">
            <Database className="h-5 w-5" />
            Food.com Recipe Database
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[hsl(210,22%,22%)] flex items-center gap-2">
          <Database className="h-5 w-5" />
          Food.com Recipe Database
          {userIngredients.length > 0 && (
            <span className="text-sm text-gray-600 font-normal">
              (Matching: {userIngredients.join(", ")})
            </span>
          )}
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-8">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {userIngredients.length > 0 
              ? "No recipes found matching your ingredients. Try different ingredients."
              : "No recipes available in the database."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={() => onViewRecipe(recipe)}
              onToggleFavorite={() => onToggleFavorite(recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}