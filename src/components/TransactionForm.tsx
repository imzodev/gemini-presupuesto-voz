import { useForm } from 'react-hook-form';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { useBudget } from '../contexts/BudgetContext';

export default function TransactionForm() {
  const { register, handleSubmit, reset } = useForm();
  const { addTransaction, categories } = useBudget();

  const onSubmit = (data: any) => {
    console.log('Form data received:', data);
    console.log('Selected category ID:', data.category);
    console.log('Available categories:', categories);
    
    // Find the selected category by ID
    const selectedCategory = categories.find(c => c.id === data.category);
    console.log('Found category object:', selectedCategory);
    
    if (!selectedCategory) {
      console.error('Invalid category selected');
      return;
    }
    
    const transaction = {
      description: data.description,
      amount: parseFloat(data.amount),
      category: selectedCategory.id, // Use the category ID
      date: new Date().toISOString()
    };
    
    console.log('Created transaction:', transaction);
    addTransaction(transaction);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-8 p-4 bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            {...register('description', { required: true })}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            {...register('amount', { required: true })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            {...register('category', { required: true })}
            className="w-full p-2 border rounded"
            defaultValue=""
          >
            <option value="" disabled>Select a category</option>
            {categories.map(category => (
              <option 
                key={category.id} 
                value={category.id} // Ensure we're using the ID as the value
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Transaction
        </button>
      </div>
    </form>
  );
}
