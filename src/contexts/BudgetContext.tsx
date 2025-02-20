import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/localStorage';

type Transaction = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
};

type Category = {
  id: string;
  name: string;
  budget: number;
};

type CategoryWithSpent = Category & { spent: number };

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
  const [transactions, setTransactions] = useState<Transaction[]>(
    getLocalStorageItem('transactions') || []
  );
  const [categories, setCategories] = useState<Category[]>(
    getLocalStorageItem('categories') || []
  );
  const [budgets, setBudgets] = useState<any[]>([]);

  // Persist state changes
  useEffect(() => {
    setLocalStorageItem('transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    setLocalStorageItem('categories', categories);
  }, [categories]);

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
    return categories.map(category => ({
      ...category,
      spent: calculateSpent(category.id)
    }));
  }, [categories, calculateSpent]);

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    console.log('Adding transaction:', transactionData);
    
    // Validate category
    if (!transactionData.category || !categories.find(c => c.id === transactionData.category)) {
      console.error('Invalid or missing category ID:', transactionData.category);
      return;
    }

    const transaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      // Ensure amount is a number
      amount: parseFloat(String(transactionData.amount)),
      // Keep the category ID as is - it's already validated
      category: transactionData.category
    };
    
    console.log('Saving transaction:', transaction);
    setTransactions(prev => [
      ...prev,
      transaction
    ]);
  };
  
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    console.log('Adding category:', categoryData);
    
    const category: Category = {
      ...categoryData,
      id: crypto.randomUUID()
    };
    
    console.log('Created category with ID:', category);
    setCategories(prev => [...prev, category]);
  };

  const addBudget = (budget: any) => {
    setBudgets(prev => [...prev, budget]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const deleteTransaction = (id: string) => {
    console.log('Deleting transaction:', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
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
