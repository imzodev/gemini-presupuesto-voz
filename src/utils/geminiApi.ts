import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
};

export const analyzeTicket = async (imageFile: File): Promise<{ items: Array<{ description: string; amount: number }> }> => {
  if (!genAI) {
    throw new Error("Gemini API not initialized. Please call initializeGemini first.");
  }

  try {
    // Convert the image file to base64
    const base64Image = await fileToBase64(imageFile);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Analyze this receipt image and extract a list of items with their prices.
    Return ONLY a JSON array where each item has 'description' and 'amount' fields.
    Example format: [{"description":"Coffee","amount":3.99},{"description":"Sandwich","amount":8.50}]
    Only include items that have clear prices. The amount should be a number, not a string.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image.split(",")[1]
        }
      }
    ]);

    const response = await result.response;
    let text = response.text();
    
    console.log('Gemini API raw response:', text);
    
    try {
      // Remove markdown code block if present
      text = text.replace(/```json\s*|```\s*$/g, '').trim();
      
      // The API should return a JSON string that we can parse
      const items = JSON.parse(text);
      if (!Array.isArray(items)) {
        throw new Error('Response is not an array');
      }
      
      // Validate the structure of each item
      const validItems = items.every(item => 
        typeof item === 'object' && 
        item !== null &&
        typeof item.description === 'string' &&
        typeof item.amount === 'number'
      );
      
      if (!validItems) {
        throw new Error('Invalid item structure in response');
      }
      
      return { items };
    } catch (parseError) {
      console.error("Failed to parse Gemini API response:", parseError);
      console.error("Raw response text:", text);
      throw new Error(`Failed to parse receipt data: ${parseError.message}`);
    }
  } catch (error) {
    console.error("Error in analyzeTicket:", error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
