import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { SavingsGoalCard } from '@/components/dashboard/SavingsGoalCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useDashboardData } from '@/hooks/useDashboardData';
import { formatMonth } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {data ? formatMonth(data.month, data.year) : 'Financial overview'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Income"
            value={data?.totalIncome || 0}
            icon={<TrendingUp className="w-6 h-6" />}
            variant="income"
            trend={data?.incomeTrend ? { value: Math.abs(data.incomeTrend), isPositive: data.incomeTrend >= 0 } : undefined}
          />
          <StatCard
            title="Total Expenses"
            value={data?.totalExpenses || 0}
            icon={<TrendingDown className="w-6 h-6" />}
            variant="expense"
            trend={data?.expenseTrend ? { value: Math.abs(data.expenseTrend), isPositive: data.expenseTrend <= 0 } : undefined}
          />
          <StatCard
            title="Balance"
            value={data?.balance || 0}
            icon={<Wallet className="w-6 h-6" />}
            variant="balance"
          />
          <StatCard
            title="Savings Progress"
            value={data?.totalSavingsCurrent || 0}
            icon={<PiggyBank className="w-6 h-6" />}
            variant="savings"
            subtitle={`of ${data?.totalSavingsTarget || 0} target`}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Transactions & Budgets */}
          <div className="lg:col-span-2 space-y-6">
            <RecentTransactions transactions={data?.recentTransactions || []} />
            
            {/* Budget Overview */}
            {data?.budgetUsage && data.budgetUsage.length > 0 && (
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold mb-4">Budget Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.budgetUsage.map((budget) => (
                    <BudgetProgress
                      key={budget.category}
                      category={budget.category}
                      spent={budget.spent}
                      budget={budget.budget}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Savings Goals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Savings Goals</h3>
            </div>
            {data?.savingsGoals && data.savingsGoals.length > 0 ? (
              data.savingsGoals.map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  name={goal.name}
                  currentAmount={Number(goal.current_amount)}
                  targetAmount={Number(goal.target_amount)}
                  deadline={goal.deadline}
                  color={goal.color || '#3B82F6'}
                />
              ))
            ) : (
              <div className="bg-card rounded-xl border p-6 text-center text-muted-foreground">
                <PiggyBank className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No savings goals yet</p>
                <p className="text-sm">Create your first goal to start saving</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
