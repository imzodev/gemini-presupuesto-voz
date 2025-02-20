import CategoryForm from '../components/CategoryForm';
import CategoriesTable from '../components/CategoriesTable';
import { useBudget } from '../contexts/BudgetContext';

export default function CategoriesPage() {
  const { categories } = useBudget();
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">Budget Categories</h1>
      <CategoryForm />
      <CategoriesTable data={categories} />
    </div>
  );
}
