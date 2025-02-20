import { dbAll, dbRun } from './database';
import { v4 as uuidv4 } from 'uuid';

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

// Category Operations
export const getAllCategories = async (): Promise<Category[]> => {
  return dbAll<Category>('SELECT * FROM categories');
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const id = uuidv4();
  await dbRun(
    'INSERT INTO categories (id, name, budget) VALUES (?, ?, ?)',
    [id, category.name, category.budget]
  );
  return { id, ...category };
};

export const deleteCategory = async (id: string): Promise<void> => {
  await dbRun('DELETE FROM categories WHERE id = ?', [id]);
};

// Transaction Operations
export const getAllTransactions = async (): Promise<Transaction[]> => {
  return dbAll<Transaction>('SELECT * FROM transactions');
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const id = uuidv4();
  await dbRun(
    'INSERT INTO transactions (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)',
    [id, transaction.description, transaction.amount, transaction.category, transaction.date]
  );
  return { id, ...transaction };
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await dbRun('DELETE FROM transactions WHERE id = ?', [id]);
};

// Get categories with spent amount
export const getCategoriesWithSpent = async (): Promise<(Category & { spent: number })[]> => {
  return dbAll(`
    SELECT 
      c.*,
      COALESCE(SUM(t.amount), 0) as spent
    FROM categories c
    LEFT JOIN transactions t ON c.id = t.category
    GROUP BY c.id
  `);
};

export const executeCustomQuery = async <T>(sql: string): Promise<T[]> => {
  // Validate that the SQL is a SELECT statement to prevent data modification
  const normalizedSql = sql.trim().toLowerCase();
  if (!normalizedSql.startsWith('select')) {
    throw new Error('Only SELECT queries are allowed');
  }

  return dbAll<T>(sql);
};
