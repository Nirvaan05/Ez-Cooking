import { Recipe } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Clock, Users, BarChart3, Heart, ArrowRight } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  onViewRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
}

export function RecipeCard({ recipe, onViewRecipe, onToggleFavorite }: RecipeCardProps) {
  const getRecipeImage = (title: string) => {
    // Generate a consistent image URL based on recipe title
    const imageKeywords = title.toLowerCase().includes('chicken') ? 'chicken' :
                         title.toLowerCase().includes('beef') ? 'beef' :
                         title.toLowerCase().includes('fish') ? 'fish' :
                         title.toLowerCase().includes('pasta') ? 'pasta' :
                         title.toLowerCase().includes('salad') ? 'salad' :
                         title.toLowerCase().includes('soup') ? 'soup' :
                         'food';
    
    return `https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img
        src={recipe.image || getRecipeImage(recipe.title)}
        alt={recipe.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-[hsl(210,22%,22%)] line-clamp-2">
            {recipe.title}
          </h3>
          <button
            onClick={() => onToggleFavorite(recipe.id)}
            className={`transition-colors ${
              recipe.isFavorite 
                ? "text-red-500" 
                : "text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart className={`h-5 w-5 ${recipe.isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {recipe.cookTime}
          </span>
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {recipe.servings}
          </span>
          <span className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-1" />
            {recipe.difficulty}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {recipe.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
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
            variant="ghost"
            className="text-[hsl(16,84%,60%)] hover:text-[hsl(16,84%,55%)] font-medium p-0 h-auto"
          >
            View Recipe
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
