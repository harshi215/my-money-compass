import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDateShort, getCategoryLabel } from '@/lib/formatters';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  className?: string;
}

export function RecentTransactions({ transactions, className }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className={cn('bg-card rounded-xl border p-6', className)}>
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>No transactions yet</p>
          <p className="text-sm">Start adding income or expenses</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-card rounded-xl border p-6', className)}>
      <h3 className="font-semibold mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <div 
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                transaction.type === 'income' 
                  ? 'bg-income-muted text-income'
                  : 'bg-expense-muted text-expense'
              )}>
                {transaction.type === 'income' ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {transaction.description || getCategoryLabel(transaction.category)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getCategoryLabel(transaction.category)} • {formatDateShort(transaction.date)}
                </p>
              </div>
            </div>
            <span className={cn(
              'font-semibold mono-number',
              transaction.type === 'income' ? 'money-positive' : 'money-negative'
            )}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
