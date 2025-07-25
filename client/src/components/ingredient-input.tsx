import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PhotoUpload } from "./photo-upload";
import { X, Plus, Sparkles, Database, Brain } from "lucide-react";

interface IngredientInputProps {
  onGenerateRecipes: (ingredients: string[], dietaryPreferences?: string, cookingTime?: string, useAI?: boolean) => void;
  isLoading: boolean;
}

export function IngredientInput({ onGenerateRecipes, isLoading }: IngredientInputProps) {
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<string>("none");
  const [cookingTime, setCookingTime] = useState<string>("any");
  const [useAI, setUseAI] = useState<boolean>(true);

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const addIngredientsFromPhoto = (recognizedIngredients: string[]) => {
    const newIngredients = recognizedIngredients.filter(
      ingredient => !ingredients.includes(ingredient.trim())
    );
    setIngredients([...ingredients, ...newIngredients]);
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleSubmit = () => {
    if (ingredients.length > 0) {
      onGenerateRecipes(
        ingredients, 
        dietaryPreferences && dietaryPreferences !== "none" ? dietaryPreferences : undefined, 
        cookingTime && cookingTime !== "any" ? cookingTime : undefined,
        useAI
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addIngredient();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        {/* Photo Upload Section */}
        <div className="mb-6">
          <PhotoUpload onIngredientsRecognized={addIngredientsFromPhoto} />
        </div>

        {/* Manual Input Section */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Or add ingredients manually</h4>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Type an ingredient..."
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 text-base"
              />
            </div>
            <Button
              onClick={addIngredient}
              disabled={!currentIngredient.trim()}
              className="bg-[hsl(16,84%,60%)] hover:bg-[hsl(16,84%,55%)] text-white h-12 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
        
        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {ingredients.map((ingredient) => (
              <span
                key={ingredient}
                className="bg-[hsl(145,63%,42%)]/10 text-[hsl(145,63%,42%)] px-3 py-1 rounded-full text-sm font-medium flex items-center"
              >
                {ingredient}
                <button
                  onClick={() => removeIngredient(ingredient)}
                  className="ml-2 text-[hsl(145,63%,42%)] hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        
        <div className="border-t pt-4">
          {/* AI Toggle */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {useAI ? (
                <Brain className="h-5 w-5 text-[hsl(16,84%,60%)]" />
              ) : (
                <Database className="h-5 w-5 text-[hsl(145,63%,42%)]" />
              )}
              <div>
                <label className="font-medium text-gray-900">
                  {useAI ? "AI Generation" : "Database Search"}
                </label>
                <p className="text-sm text-gray-600">
                  {useAI 
                    ? "Use AI to create new recipes with your ingredients" 
                    : "Find authentic recipes from our database"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Database</span>
              <Switch 
                checked={useAI} 
                onCheckedChange={setUseAI}
                className="data-[state=checked]:bg-[hsl(16,84%,60%)]"
              />
              <span className="text-sm text-gray-600">AI</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Preferences
              </label>
              <Select value={dietaryPreferences} onValueChange={setDietaryPreferences}>
                <SelectTrigger>
                  <SelectValue placeholder="No restrictions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No restrictions</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="gluten-free">Gluten-free</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="low-carb">Low-carb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cooking Time
              </label>
              <Select value={cookingTime} onValueChange={setCookingTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any time</SelectItem>
                  <SelectItem value="15 minutes">15 minutes</SelectItem>
                  <SelectItem value="30 minutes">30 minutes</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="2+ hours">2+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      <Button
        onClick={handleSubmit}
        disabled={ingredients.length === 0 || isLoading}
        className="bg-gradient-to-r from-[hsl(16,84%,60%)] to-[hsl(33,87%,54%)] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 h-auto"
      >
        {useAI ? (
          <Brain className="h-5 w-5 mr-3" />
        ) : (
          <Database className="h-5 w-5 mr-3" />
        )}
        {isLoading 
          ? "Finding Recipes..." 
          : useAI 
            ? "Generate Recipes with AI" 
            : "Find Database Recipes"
        }
      </Button>
    </div>
  );
}
