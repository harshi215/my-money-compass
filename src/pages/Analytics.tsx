import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIncomes } from '@/hooks/useIncomes';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency, getCategoryLabel } from '@/lib/formatters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#10B981',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
];

const months = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export default function AnalyticsPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState(String(currentMonth));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  const { data: incomes, isLoading: incomesLoading } = useIncomes(
    parseInt(selectedMonth),
    parseInt(selectedYear)
  );
  const { data: expenses, isLoading: expensesLoading } = useExpenses(
    parseInt(selectedMonth),
    parseInt(selectedYear)
  );

  const isLoading = incomesLoading || expensesLoading;

  // Expense by category (Pie chart)
  const expenseByCategory = useMemo(() => {
    if (!expenses) return [];
    
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: getCategoryLabel(category),
        value: amount,
        category,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Daily spending (Bar chart)
  const dailySpending = useMemo(() => {
    if (!expenses) return [];
    
    const dailyTotals = expenses.reduce((acc, expense) => {
      const day = new Date(expense.date).getDate();
      acc[day] = (acc[day] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(dailyTotals)
      .map(([day, amount]) => ({
        day: `Day ${day}`,
        amount,
      }))
      .sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]));
  }, [expenses]);

  // Income vs Expense comparison
  const incomeVsExpense = useMemo(() => {
    const totalIncome = incomes?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
    const totalExpense = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

    return [
      { name: 'Income', amount: totalIncome, fill: 'hsl(var(--income))' },
      { name: 'Expenses', amount: totalExpense, fill: 'hsl(var(--expense))' },
    ];
  }, [incomes, expenses]);

  // Weekly trends
  const weeklyTrends = useMemo(() => {
    if (!expenses && !incomes) return [];
    
    const weeks: { week: string; income: number; expense: number }[] = [
      { week: 'Week 1', income: 0, expense: 0 },
      { week: 'Week 2', income: 0, expense: 0 },
      { week: 'Week 3', income: 0, expense: 0 },
      { week: 'Week 4', income: 0, expense: 0 },
      { week: 'Week 5', income: 0, expense: 0 },
    ];

    expenses?.forEach((expense) => {
      const day = new Date(expense.date).getDate();
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 4);
      weeks[weekIndex].expense += Number(expense.amount);
    });

    incomes?.forEach((income) => {
      const day = new Date(income.date).getDate();
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 4);
      weeks[weekIndex].income += Number(income.amount);
    });

    return weeks.filter((w) => w.income > 0 || w.expense > 0);
  }, [incomes, expenses]);

  const totalIncome = incomes?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const netBalance = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const pieChartConfig = expenseByCategory.reduce((acc, item, index) => {
    acc[item.category] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Visualize your financial data</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold money-positive">{formatCurrency(totalIncome)}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold money-negative">{formatCurrency(totalExpenses)}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`text-2xl font-bold ${netBalance >= 0 ? 'money-positive' : 'money-negative'}`}>
                {formatCurrency(netBalance)}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense by Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseByCategory.length > 0 ? (
                <ChartContainer config={pieChartConfig} className="h-80">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No expense data for this period
                </div>
              )}
            </CardContent>
          </Card>

          {/* Income vs Expense Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  amount: { label: 'Amount' },
                }}
                className="h-80"
              >
                <BarChart data={incomeVsExpense}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {incomeVsExpense.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Daily Spending Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Spending</CardTitle>
            </CardHeader>
            <CardContent>
              {dailySpending.length > 0 ? (
                <ChartContainer
                  config={{
                    amount: { label: 'Amount', color: 'hsl(var(--expense))' },
                  }}
                  className="h-80"
                >
                  <BarChart data={dailySpending}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-muted-foreground" fontSize={12} />
                    <YAxis className="text-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No spending data for this period
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Trends Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyTrends.length > 0 ? (
                <ChartContainer
                  config={{
                    income: { label: 'Income', color: 'hsl(var(--income))' },
                    expense: { label: 'Expense', color: 'hsl(var(--expense))' },
                  }}
                  className="h-80"
                >
                  <LineChart data={weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="hsl(var(--income))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--income))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="hsl(var(--expense))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--expense))' }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No trend data for this period
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
