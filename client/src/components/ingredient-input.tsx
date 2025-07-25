import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Sparkles } from "lucide-react";

interface IngredientInputProps {
  onGenerateRecipes: (ingredients: string[], dietaryPreferences?: string, cookingTime?: string) => void;
  isLoading: boolean;
}

export function IngredientInput({ onGenerateRecipes, isLoading }: IngredientInputProps) {
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<string>("none");
  const [cookingTime, setCookingTime] = useState<string>("any");

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleSubmit = () => {
    if (ingredients.length > 0) {
      onGenerateRecipes(
        ingredients, 
        dietaryPreferences && dietaryPreferences !== "none" ? dietaryPreferences : undefined, 
        cookingTime && cookingTime !== "any" ? cookingTime : undefined
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
        <Sparkles className="h-5 w-5 mr-3" />
        {isLoading ? "Generating Recipes..." : "Generate Recipes with AI"}
      </Button>
    </div>
  );
}
