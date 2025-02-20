import { useForm } from 'react-hook-form';
import { PlusCircle } from 'lucide-react';
import { useBudget } from '../contexts/BudgetContext';

export default function CategoryForm() {
  const { register, handleSubmit, reset } = useForm();
  const { addCategory } = useBudget();

  const onSubmit = (data: any) => {
    // Create category without spent (it's calculated from transactions)
    addCategory({
      name: data.name,
      budget: parseFloat(data.budget)
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-8 p-4 bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Category Name</label>
          <input
            {...register('name', { required: true })}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Monthly Budget</label>
          <input
            type="number"
            step="0.01"
            {...register('budget', { required: true })}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white p-2 rounded hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Category
        </button>
      </div>
    </form>
  );
}
