import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useBudget } from '../contexts/BudgetContext';
import { getLocalStorageItem } from '../utils/localStorage';

export function SpendingByCategoryChart() {
  const { transactions, categories } = useBudget();

  const categorySpending = categories.map(category => ({
    name: category.name,
    value: transactions
      .filter(t => t.category === category.id)
      .reduce((sum, t) => sum + t.amount, 0)
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categorySpending}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categorySpending.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function BudgetRemainingChart() {
  const { transactions, categories } = useBudget();

  // Calculate total spending per category
  const categorySpending = categories.map(category => ({
    ...category,
    spent: transactions
      .filter(t => t.category === category.id)
      .reduce((sum, t) => sum + t.amount, 0)
  }));

  // Calculate remaining budget
  const chartData = categorySpending.map(category => ({
    name: category.name,
    remaining: Math.max(category.budget - category.spent, 0)
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Budget Remaining</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={chartData}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="remaining" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
