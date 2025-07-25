import { Recipe } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Users, BarChart3, Share, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
}

export function RecipeModal({ 
  recipe, 
  isOpen, 
  onClose, 
  onSaveRecipe, 
  onToggleFavorite 
}: RecipeModalProps) {
  const { toast } = useToast();

  if (!recipe) return null;

  const handleSaveRecipe = () => {
    onSaveRecipe(recipe);
    toast({
      title: "Recipe saved!",
      description: "Recipe has been saved to your collection.",
    });
  };

  const handleShareRecipe = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Recipe link copied to clipboard.",
      });
    }
  };

  const getRecipeImage = (title: string) => {
    return `https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(210,22%,22%)]">
            {recipe.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img
              src={recipe.image || getRecipeImage(recipe.title)}
              alt={recipe.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
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
            <p className="text-gray-600 mb-6">{recipe.description}</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-[hsl(210,22%,22%)] mb-4">
              Ingredients
            </h4>
            <ul className="space-y-2 mb-6">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-4 h-4 bg-[hsl(145,63%,42%)] rounded-full mr-3 flex-shrink-0"></span>
                  <span>
                    <span className="font-medium">{ingredient.amount}</span> {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
            
            <h4 className="text-lg font-semibold text-[hsl(210,22%,22%)] mb-4">
              Instructions
            </h4>
            <ol className="space-y-3">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="flex">
                  <span className="bg-[hsl(16,84%,60%)] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        
        <div className="border-t pt-6 mt-6 flex justify-between items-center">
          <div className="flex space-x-2">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="bg-[hsl(16,84%,60%)]/10 text-[hsl(16,84%,60%)] px-3 py-1 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleShareRecipe}
              variant="outline"
              className="px-4 py-2"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={() => onToggleFavorite(recipe.id)}
              variant="outline"
              className={`px-4 py-2 ${
                recipe.isFavorite 
                  ? "text-red-500 border-red-500 hover:bg-red-50" 
                  : ""
              }`}
            >
              <Heart className={`h-4 w-4 mr-2 ${recipe.isFavorite ? "fill-current" : ""}`} />
              {recipe.isFavorite ? "Favorited" : "Favorite"}
            </Button>
            <Button
              onClick={handleSaveRecipe}
              className="bg-[hsl(16,84%,60%)] hover:bg-[hsl(16,84%,55%)] text-white px-4 py-2"
            >
              <Heart className="h-4 w-4 mr-2" />
              Save Recipe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
