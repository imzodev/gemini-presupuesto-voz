import { SpendingByCategoryChart, BudgetRemainingChart } from '../components/DashboardCharts';
import { VoiceReportButton } from '../components/VoiceReportButton';

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Budget Overview</h1>
      <div className="col-span-2 flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <VoiceReportButton />
      </div>
      <SpendingByCategoryChart />
      <BudgetRemainingChart />
    </div>
  );
}
