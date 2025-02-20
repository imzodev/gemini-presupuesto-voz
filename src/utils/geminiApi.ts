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

export interface QueryResponse {
  sql: string;
  visualization: 'graph' | 'text';
  graphType?: 'bar' | 'line' | 'pie';
  description: string;
}

export const generateSqlFromText = async (text: string): Promise<QueryResponse> => {
  if (!genAI) {
    throw new Error("Gemini API not initialized. Please call initializeGemini first.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a SQL query generator for a budget tracking app. The app has two tables:

transactions:
- id (string)
- description (string, contains the item or service purchased)
- amount (number, positive values represent expenses)
- category (string, foreign key to categories.id)
- date (string in YYYY-MM-DD format)

categories:
- id (string)
- name (string)
- budget (number)

IMPORTANT RULES:
1. Expenses are stored as positive numbers, not negative numbers
2. By default, search in transaction descriptions (transactions.description) using LIKE with wildcards
3. Only join with categories table when the word "CATEGORIA" or "CATEGORÍA" is explicitly mentioned in the command
4. When searching descriptions, use case-insensitive search with wildcards (e.g., LOWER(description) LIKE LOWER('%agua%'))

Based on this Spanish voice command: "${text}", generate a SQL query to get the requested information.

Return ONLY a JSON object with the following structure:
{
  "sql": "the SQL query",
  "visualization": "graph" or "text" (if the data should be shown in a graph or just text),
  "graphType": "bar", "line", or "pie" (only if visualization is "graph"),
  "description": "A brief description in Spanish of what the query will show"
}

Examples:

1. If command is "Cuanto he gastado en agua":
{
  "sql": "SELECT SUM(amount) as total FROM transactions WHERE LOWER(description) LIKE LOWER('%agua%')",
  "visualization": "text",
  "description": "Total gastado en compras relacionadas con agua"
}

2. If command is "Cuanto he gastado en la CATEGORIA comida":
{
  "sql": "SELECT SUM(t.amount) as total FROM transactions t INNER JOIN categories c ON t.category = c.id WHERE LOWER(c.name) = LOWER('comida')",
  "visualization": "text",
  "description": "Total gastado en la categoría comida"
}

3. If command is "Dime cuanto gaste el mes de febrero":
{
  "sql": "SELECT SUM(amount) as total FROM transactions WHERE strftime('%m', date) = '02'",
  "visualization": "text",
  "description": "Total de gastos en el mes de febrero"
}`;

    const result = await model.generateContent([prompt]);
    const response = result.response.text();
    
    try {
      // Remove any markdown code block markers
      const cleanJson = response.replace(/```json\s*|```\s*$/g, '').trim();
      const parsedResponse = JSON.parse(cleanJson);
      
      // Validate the response structure
      if (!parsedResponse.sql || !parsedResponse.visualization || !parsedResponse.description) {
        throw new Error('Invalid response structure');
      }
      
      return parsedResponse as QueryResponse;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      throw new Error('Failed to generate SQL query');
    }
  } catch (error) {
    console.error('Error generating SQL:', error);
    throw error;
  }
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  if (!genAI) {
    throw new Error("Gemini API not initialized. Please call initializeGemini first.");
  }

  try {
    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob);

    // Generate transcription
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      'Please transcribe this audio file accurately.',
      {
        inlineData: {
          mimeType: 'audio/wav',
          data: base64Audio.split(',')[1]
        }
      },
    ]);

    return result.response.text();
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
