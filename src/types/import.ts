export interface AnalysisResult {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    transactionCount: number;
    dateRange: {
      from: string;
      to: string;
    };
  };
  categoryBreakdown: {
    income: Record<string, number>;
    expenses: Record<string, number>;
  };
  transactions: Array<{
    date: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
  }>;
  insights: string[];
  topExpenseCategories?: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend?: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}
