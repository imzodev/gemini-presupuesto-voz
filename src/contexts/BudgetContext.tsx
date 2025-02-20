import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { 
  Transaction, 
  Category,
  CategoryWithSpent,
  getAllTransactions,
  getAllCategories,
  addTransaction as apiAddTransaction,
  addCategory as apiAddCategory,
  deleteTransaction as apiDeleteTransaction,
  deleteCategory as apiDeleteCategory,
} from '../api/budgetApi';

// CategoryWithSpent is already imported from budgetApi

type BudgetContextType = {
  transactions: Transaction[];
  categories: CategoryWithSpent[];
  budgets: any[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  addBudget: (budget: any) => void;
  deleteCategory: (id: string) => void;
  deleteTransaction: (id: string) => void;
};

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);

  // Load initial data
  useEffect(() => {
    console.log('BudgetProvider mounted');
    const loadData = async () => {
      console.log('Loading initial data...');
      try {
        console.log('Fetching transactions and categories...');
        const [transactions, categories] = await Promise.all([
          getAllTransactions(),
          getAllCategories()
        ]);
        console.log('Received transactions:', transactions);
        console.log('Received categories:', categories);

        // Ensure we have arrays
        const safeTransactions = Array.isArray(transactions) ? transactions : [];
        const safeCategories = Array.isArray(categories) ? categories : [];

        console.log('Setting transactions:', safeTransactions);
        console.log('Setting categories:', safeCategories);

        setTransactions(safeTransactions);
        setCategories(safeCategories);
      } catch (error) {
        console.error('Error loading data:', error);
        // Initialize with empty arrays on error
        setTransactions([]);
        setCategories([]);
      }
    };
    loadData();
  }, []);

  // Memoize the calculate spent function
  const calculateSpent = useMemo(() => {
    return (categoryId: string): number => {
      if (!categoryId) {
        console.warn('Received undefined categoryId in calculateSpent');
        return 0;
      }

      console.log('Calculating spent for category ID:', categoryId);
      console.log('All transactions:', transactions);
      
      // Find transactions for this category
      const categoryTransactions = transactions.filter(transaction => {
        const isMatch = transaction.category === categoryId;
        console.log(
          'Checking transaction:',
          'category:', transaction.category,
          'against:', categoryId,
          'matches:', isMatch
        );
        return isMatch;
      });
      
      console.log('Found transactions for category:', categoryTransactions);
      
      // Sum up the amounts
      const total = categoryTransactions.reduce((sum, transaction) => {
        const amount = parseFloat(String(transaction.amount));
        console.log('Adding transaction amount:', amount, 'to total:', sum);
        return sum + amount;
      }, 0);
      
      console.log('Final total for category', categoryId, ':', total);
      return total;
    };
  }, [transactions]);

  // Memoize categories with spent amounts
  const categoriesWithSpent = useMemo(() => {
    console.log('Calculating categoriesWithSpent, categories:', categories);
    if (!Array.isArray(categories)) {
      console.error('categories is not an array:', categories);
      return [];
    }
    return categories.map(category => {
      if (!category || !category.id) {
        console.error('Invalid category:', category);
        return { ...category, spent: 0 };
      }
      return {
        ...category,
        spent: calculateSpent(category.id)
      };
    });
  }, [categories, calculateSpent]);

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    console.log('Adding transaction:', transactionData);
    
    // Validate category
    if (!transactionData.category || !categories.find(c => c.id === transactionData.category)) {
      console.error('Invalid or missing category ID:', transactionData.category);
      return;
    }

    try {
      // Add to database through API
      const newTransaction = await apiAddTransaction({
        ...transactionData,
        amount: parseFloat(String(transactionData.amount)),
      });
      
      console.log('Saved transaction:', newTransaction);
      
      // Update state
      setTransactions(prev => [...prev, newTransaction]);
      const updatedCategories = await getAllCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };
  
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    console.log('Adding category:', categoryData);
    
    try {
      // Add to database through API
      const newCategory = await apiAddCategory(categoryData);
      console.log('Created category:', newCategory);
      
      // Update state
      const updatedCategories = await getAllCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const addBudget = (budget: any) => {
    setBudgets(prev => [...prev, budget]);
  };

  const deleteCategory = async (id: string) => {
    try {
      // Delete from database through API
      await apiDeleteCategory(id);
      
      // Update state
      const updatedCategories = await getAllCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    console.log('Deleting transaction:', id);
    
    try {
      // Delete from database through API
      await apiDeleteTransaction(id);
      
      // Update state
      setTransactions(prev => prev.filter(t => t.id !== id));
      const updatedCategories = await getAllCategories();
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <BudgetContext.Provider 
      value={{ 
        transactions, 
        categories: categoriesWithSpent,
        budgets, 
        addTransaction, 
        addCategory, 
        addBudget, 
        deleteCategory,
        deleteTransaction
      }}>
      {children}
    </BudgetContext.Provider>
  );
}

export const useBudget = () => useContext(BudgetContext)!;
