import './App.css'
import { BudgetProvider } from './contexts/BudgetContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';

function App() {
  console.log('App component rendering');
  return (
    <Router>
      <BudgetProvider>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <main className="md:pl-64 min-h-screen pb-16 md:pb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </BudgetProvider>
    </Router>
  );
}

export default App
