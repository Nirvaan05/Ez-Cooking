import { Recipe } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Clock, Users, BarChart3, Heart, ArrowRight } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  onViewRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
}

export function RecipeCard({ recipe, onViewRecipe, onToggleFavorite }: RecipeCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-[hsl(16,84%,60%)] transition-all duration-300 hover:shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-[hsl(210,22%,22%)] line-clamp-2 flex-1 mr-2">
            {recipe.title}
          </h3>
          <button
            onClick={() => onToggleFavorite(recipe.id)}
            className={`transition-colors shrink-0 ${
              recipe.isFavorite 
                ? "text-red-500" 
                : "text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart className={`h-5 w-5 ${recipe.isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-[hsl(16,84%,60%)]" />
            {recipe.cookTime}
          </span>
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-[hsl(16,84%,60%)]" />
            {recipe.servings}
          </span>
          <span className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-1 text-[hsl(16,84%,60%)]" />
            {recipe.difficulty}
          </span>
        </div>
        
        {/* Quick ingredients preview */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">MAIN INGREDIENTS</p>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 4).map((ingredient, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
              >
                {ingredient.name}
              </span>
            ))}
            {recipe.ingredients.length > 4 && (
              <span className="text-xs text-gray-500">+{recipe.ingredients.length - 4} more</span>
            )}
          </div>
        </div>

        {/* Steps preview */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">QUICK STEPS</p>
          <div className="space-y-1">
            {recipe.instructions.slice(0, 2).map((step, index) => (
              <div key={index} className="flex gap-2 text-sm">
                <span className="text-[hsl(16,84%,60%)] font-medium shrink-0">{index + 1}.</span>
                <span className="text-gray-600 line-clamp-1">{step}</span>
              </div>
            ))}
            {recipe.instructions.length > 2 && (
              <p className="text-xs text-gray-500 pl-4">+{recipe.instructions.length - 2} more steps</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {recipe.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="bg-[hsl(16,84%,60%)]/10 text-[hsl(16,84%,60%)] px-2 py-1 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          <Button
            onClick={() => onViewRecipe(recipe)}
            className="bg-[hsl(16,84%,60%)] hover:bg-[hsl(16,84%,55%)] text-white text-sm h-8"
          >
            View Full Recipe
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
