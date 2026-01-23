import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useDashboardData() {
  const { user } = useAuth();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return useQuery({
    queryKey: ['dashboard', user?.id, currentMonth, currentYear],
    queryFn: async () => {
      if (!user) return null;

      // Get date range for current month
      const startDate = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

      // Get previous month for comparison
      const prevMonthStart = new Date(currentYear, currentMonth - 2, 1).toISOString().split('T')[0];
      const prevMonthEnd = new Date(currentYear, currentMonth - 1, 0).toISOString().split('T')[0];

      // Fetch current month incomes
      const { data: incomes } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      // Fetch current month expenses
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      // Fetch previous month incomes for trend
      const { data: prevIncomes } = await supabase
        .from('incomes')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', prevMonthStart)
        .lte('date', prevMonthEnd);

      // Fetch previous month expenses for trend
      const { data: prevExpenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', prevMonthStart)
        .lte('date', prevMonthEnd);

      // Fetch budgets
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      // Fetch savings goals
      const { data: savingsGoals } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .limit(4);

      // Calculate totals
      const totalIncome = (incomes || []).reduce((sum, i) => sum + Number(i.amount), 0);
      const totalExpenses = (expenses || []).reduce((sum, e) => sum + Number(e.amount), 0);
      const balance = totalIncome - totalExpenses;

      const prevTotalIncome = (prevIncomes || []).reduce((sum, i) => sum + Number(i.amount), 0);
      const prevTotalExpenses = (prevExpenses || []).reduce((sum, e) => sum + Number(e.amount), 0);

      // Calculate trends
      const incomeTrend = prevTotalIncome > 0 
        ? ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100 
        : 0;
      const expenseTrend = prevTotalExpenses > 0 
        ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100 
        : 0;

      // Calculate expense by category
      const expensesByCategory = (expenses || []).reduce((acc, expense) => {
        const category = expense.category as string;
        acc[category] = (acc[category] || 0) + Number(expense.amount);
        return acc;
      }, {} as Record<string, number>);

      // Calculate total savings progress
      const totalSavingsTarget = (savingsGoals || []).reduce((sum, g) => sum + Number(g.target_amount), 0);
      const totalSavingsCurrent = (savingsGoals || []).reduce((sum, g) => sum + Number(g.current_amount), 0);

      // Get recent transactions (last 5)
      const recentTransactions = [
        ...(incomes || []).map(i => ({
          id: i.id,
          type: 'income' as const,
          amount: Number(i.amount),
          category: i.source as string,
          description: i.description || undefined,
          date: i.date,
        })),
        ...(expenses || []).map(e => ({
          id: e.id,
          type: 'expense' as const,
          amount: Number(e.amount),
          category: e.category as string,
          description: e.description || undefined,
          date: e.date,
        })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      // Budget usage with spending
      const budgetUsage = (budgets || []).map(budget => {
        const spent = expensesByCategory[budget.category as string] || 0;
        return {
          category: budget.category as string,
          budget: Number(budget.amount),
          spent,
        };
      });

      return {
        totalIncome,
        totalExpenses,
        balance,
        incomeTrend,
        expenseTrend,
        expensesByCategory,
        savingsGoals: savingsGoals || [],
        totalSavingsTarget,
        totalSavingsCurrent,
        recentTransactions,
        budgetUsage,
        month: currentMonth,
        year: currentYear,
      };
    },
    enabled: !!user,
  });
}
