import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function recognizeIngredients(base64Image: string): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert food ingredient recognition system. Analyze images and identify all visible food ingredients with high accuracy. Return only ingredient names that can be used for cooking, excluding non-food items."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please identify all the food ingredients visible in this image. Return the results as a JSON array of ingredient names. Focus only on ingredients that can be used for cooking. Be specific but concise with ingredient names. For example: ['chicken breast', 'red onion', 'garlic', 'tomatoes', 'basil leaves']. If no food ingredients are visible, return an empty array."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.ingredients || [];
  } catch (error) {
    console.error("Error recognizing ingredients:", error);
    throw new Error("Failed to recognize ingredients from image");
  }
}