import { SpendingByCategoryChart, BudgetRemainingChart } from '../components/DashboardCharts';

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Budget Overview</h1>
      <SpendingByCategoryChart />
      <BudgetRemainingChart />
    </div>
  );
}
