const API_URL = 'http://localhost:3000/api';

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
};

export type Category = {
  id: string;
  name: string;
  budget: number;
};

export type CategoryWithSpent = Category & { spent: number };

// Transactions
export const getAllTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(`${API_URL}/transactions`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error('Failed to add transaction');
  return response.json();
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete transaction');
};

// Categories
export const getAllCategories = async (): Promise<CategoryWithSpent[]> => {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  });
  if (!response.ok) throw new Error('Failed to add category');
  return response.json();
};

export const deleteCategory = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete category');
};
