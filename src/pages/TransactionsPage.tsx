import TransactionForm from '../components/TransactionForm';
import TransactionsTable from '../components/TransactionsTable';
import TicketUploader from '../components/TicketUploader';
import { useBudget } from '../contexts/BudgetContext';

export default function TransactionsPage() {
  const { transactions } = useBudget();
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <TransactionForm />
        <TicketUploader />
      </div>
      <TransactionsTable data={transactions} />
    </div>
  );
}
