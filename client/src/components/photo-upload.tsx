import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X, Loader2, Sparkles } from "lucide-react";

interface PhotoUploadProps {
  onIngredientsRecognized: (ingredients: string[]) => void;
}

export function PhotoUpload({ onIngredientsRecognized }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const recognizeIngredients = async () => {
    if (!previewImage) return;

    setIsUploading(true);
    try {
      const response = await fetch("/api/ingredients/recognize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: previewImage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to recognize ingredients");
      }

      const data = await response.json();
      const ingredients = data.ingredients || [];

      if (ingredients.length === 0) {
        toast({
          title: "No ingredients found",
          description: "Could not identify any ingredients in the image. Try a clearer photo.",
          variant: "destructive",
        });
        return;
      }

      onIngredientsRecognized(ingredients);
      setPreviewImage(null);
      toast({
        title: "Ingredients recognized!",
        description: `Found ${ingredients.length} ingredients: ${ingredients.slice(0, 3).join(", ")}${ingredients.length > 3 ? "..." : ""}`,
      });
    } catch (error) {
      console.error("Error recognizing ingredients:", error);
      toast({
        title: "Recognition failed",
        description: error instanceof Error ? error.message : "Failed to recognize ingredients from image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {!previewImage ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[hsl(16,84%,60%)] transition-colors">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Camera className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload ingredient photo
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Take a photo or upload an image of your ingredients and we'll identify them automatically
              </p>
              <Button
                onClick={triggerFileInput}
                className="bg-[hsl(16,84%,60%)] hover:bg-[hsl(16,84%,55%)] text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <img
              src={previewImage}
              alt="Ingredient preview"
              className="w-full h-48 object-cover"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={recognizeIngredients}
              disabled={isUploading}
              className="flex-1 bg-gradient-to-r from-[hsl(16,84%,60%)] to-[hsl(33,87%,54%)] text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isUploading ? "Recognizing..." : "Recognize Ingredients"}
            </Button>
            
            <Button
              onClick={triggerFileInput}
              variant="outline"
              className="px-4"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}