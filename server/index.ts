import express from 'express';
import cors from 'cors';
import {
  getAllTransactions,
  addTransaction,
  deleteTransaction,
  getAllCategories,
  addCategory,
  deleteCategory,
  getCategoriesWithSpent,
  executeCustomQuery
} from './db/operations';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());
app.use(express.json());

// Debug endpoint to check transactions
app.get('/api/debug/transactions', async (req, res) => {
  try {
    const transactions = await getAllTransactions();
    console.log('All transactions:', transactions);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Voice query endpoint
app.post('/api/voice-query', async (req, res) => {
  const { sql, visualization, description } = req.body;
  
  console.log('POST /api/voice-query', { sql, visualization, description });
  
  try {
    if (!sql) {
      throw new Error('SQL query is required');
    }

    const results = await executeCustomQuery(sql);
    console.log('Query results:', results);

    res.json({
      results,
      visualization,
      description
    });
  } catch (error) {
    console.error('Error executing voice query:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to execute query',
      sql, // Return the SQL that failed
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

// Transactions endpoints
app.get('/api/transactions', async (req, res) => {
  console.log('GET /api/transactions');
  try {
    const transactions = await getAllTransactions();
    console.log('Retrieved transactions:', transactions);
    res.json(transactions || []);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', async (req, res) => {
  console.log('POST /api/transactions', req.body);
  try {
    const transaction = await addTransaction(req.body);
    console.log('Added transaction:', transaction);
    res.json(transaction);
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  console.log('DELETE /api/transactions/:id', req.params.id);
  try {
    await deleteTransaction(req.params.id);
    console.log('Deleted transaction:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Categories endpoints
app.get('/api/categories', async (req, res) => {
  console.log('GET /api/categories');
  try {
    const categories = await getCategoriesWithSpent();
    console.log('Retrieved categories:', categories);
    res.json(categories || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  console.log('POST /api/categories', req.body);
  try {
    const category = await addCategory(req.body);
    console.log('Added category:', category);
    res.json(category);
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  console.log('DELETE /api/categories/:id', req.params.id);
  try {
    await deleteCategory(req.params.id);
    console.log('Deleted category:', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
