import { useState, useEffect } from "react";
import { Recipe } from "@shared/schema";
import { IngredientInput } from "@/components/ingredient-input";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeModal } from "@/components/recipe-modal";
import { DatabaseRecipes } from "@/components/database-recipes";
import { generateRecipes } from "@/lib/openai";
import { getSavedRecipes, saveRecipe, toggleRecipeFavorite } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Utensils, User, Menu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIngredients, setCurrentIngredients] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setSavedRecipes(getSavedRecipes());
  }, []);

  const handleGenerateRecipes = async (
    ingredients: string[],
    dietaryPreferences?: string,
    cookingTime?: string,
    useAI: boolean = true
  ) => {
    setIsLoading(true);
    setCurrentIngredients(ingredients);
    try {
      const recipes = await generateRecipes(ingredients, dietaryPreferences, cookingTime, useAI);
      setGeneratedRecipes(recipes);
      toast({
        title: "Recipes found!",
        description: `Found ${recipes.length} delicious ${useAI ? 'AI-generated' : 'database'} recipes for you.`,
      });
    } catch (error) {
      toast({
        title: "Error finding recipes",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    try {
      saveRecipe(recipe);
      setSavedRecipes(getSavedRecipes());
      toast({
        title: "Recipe saved!",
        description: "Recipe has been added to your collection.",
      });
    } catch (error) {
      toast({
        title: "Error saving recipe",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = (recipeId: string) => {
    try {
      toggleRecipeFavorite(recipeId);
      setSavedRecipes(getSavedRecipes());
      
      // Update generated recipes if the recipe is in that list
      setGeneratedRecipes(prev => 
        prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, isFavorite: !recipe.isFavorite }
            : recipe
        )
      );
      
      // Update selected recipe if it's the one being toggled
      if (selectedRecipe && selectedRecipe.id === recipeId) {
        setSelectedRecipe({ ...selectedRecipe, isFavorite: !selectedRecipe.isFavorite });
      }
    } catch (error) {
      toast({
        title: "Error updating favorite",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(240,9%,98%)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Utensils className="text-[hsl(16,84%,60%)] h-6 w-6" />
              <h1 className="text-xl font-bold text-[hsl(210,22%,22%)]">
                Smart Recipe Generator
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-[hsl(16,84%,60%)] transition-colors">
                My Recipes
              </a>
              <a href="#" className="text-gray-600 hover:text-[hsl(16,84%,60%)] transition-colors">
                Favorites
              </a>
              <Button className="bg-[hsl(16,84%,60%)] hover:bg-[hsl(16,84%,55%)] text-white">
                <User className="h-4 w-4 mr-2" />
                Account
              </Button>
            </nav>
            <button className="md:hidden text-gray-600">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[hsl(210,22%,22%)] mb-4">
            What's in your fridge?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Add your ingredients and discover AI-generated recipes plus authentic dishes from our database
          </p>
          
          <IngredientInput 
            onGenerateRecipes={handleGenerateRecipes}
            isLoading={isLoading}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-[hsl(16,84%,60%)] mx-auto mb-4" />
            <p className="text-lg text-gray-600">AI is cooking up amazing recipes for you...</p>
          </div>
        )}

        {/* Generated Recipes */}
        {generatedRecipes.length > 0 && !isLoading && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-[hsl(210,22%,22%)] mb-6">
              AI-Generated Recipes
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onViewRecipe={handleViewRecipe}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Database Recipe Suggestions */}
        <div className="mb-12">
          <DatabaseRecipes
            userIngredients={currentIngredients}
            onViewRecipe={handleViewRecipe}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>

        {/* Saved Recipes */}
        {savedRecipes.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[hsl(210,22%,22%)]">
                Your Saved Recipes
              </h3>
              <Button variant="ghost" className="text-[hsl(16,84%,60%)] hover:text-[hsl(16,84%,55%)]">
                View All
                <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {savedRecipes.slice(0, 4).map((recipe) => (
                <div
                  key={recipe.id}
                  className="group cursor-pointer"
                  onClick={() => handleViewRecipe(recipe)}
                >
                  <img
                    src={recipe.image || `https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80`}
                    alt={recipe.title}
                    className="w-full h-32 object-cover rounded-lg mb-2 group-hover:opacity-90 transition-opacity"
                  />
                  <h4 className="font-medium text-[hsl(210,22%,22%)] group-hover:text-[hsl(16,84%,60%)] transition-colors">
                    {recipe.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {recipe.cookTime} • {recipe.difficulty}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedRecipes.length === 0 && savedRecipes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No recipes yet
            </h3>
            <p className="text-gray-500">
              Add some ingredients above to generate your first AI-powered recipes!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[hsl(210,22%,22%)] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Utensils className="text-[hsl(16,84%,60%)] h-5 w-5" />
                <h4 className="text-lg font-semibold">Smart Recipe Generator</h4>
              </div>
              <p className="text-gray-400">
                AI-powered recipe generation for your everyday cooking needs.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Features</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[hsl(16,84%,60%)] transition-colors">
                    Recipe Generator
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[hsl(16,84%,60%)] transition-colors">
                    Ingredient Scanner
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[hsl(16,84%,60%)] transition-colors">
                    Meal Planning
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[hsl(16,84%,60%)] transition-colors">
                    Nutritional Info
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-[hsl(16,84%,60%)] transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[hsl(16,84%,60%)] transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[hsl(16,84%,60%)] transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[hsl(16,84%,60%)] transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Connect</h5>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[hsl(16,84%,60%)] transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[hsl(16,84%,60%)] transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Smart Recipe Generator. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Recipe Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveRecipe={handleSaveRecipe}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
