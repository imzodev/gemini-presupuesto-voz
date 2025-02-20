import { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { analyzeTicket, initializeGemini } from '../utils/geminiApi';

export default function TicketUploader() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addTransaction, categories } = useBudget();

  const handleTicketUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Initialize Gemini API with your API key
      // In production, this should be stored in environment variables
      initializeGemini(import.meta.env.VITE_GEMINI_API_KEY);

      // Analyze the ticket
      const { items } = await analyzeTicket(file);

      // Find the Food category
      const foodCategory = categories.find(cat => cat.name.toLowerCase() === 'food');
      if (!foodCategory) {
        throw new Error("Food category not found");
      }

      // Add each item as a transaction
      for (const item of items) {
        await addTransaction({
          description: item.description,
          amount: item.amount,
          category: foodCategory.id,
          date: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process ticket');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor="ticket-upload"
        className={`
          inline-flex items-center px-4 py-2 rounded-md
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'}
          text-white font-medium text-sm
        `}
      >
        {isLoading ? 'Processing...' : 'Upload Ticket'}
        <input
          id="ticket-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleTicketUpload}
          disabled={isLoading}
        />
      </label>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
