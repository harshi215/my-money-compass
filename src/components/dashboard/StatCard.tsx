import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  variant: 'income' | 'expense' | 'savings' | 'balance';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  variant, 
  subtitle,
  trend,
  className 
}: StatCardProps) {
  const variantStyles = {
    income: 'stat-card-income',
    expense: 'stat-card-expense',
    savings: 'stat-card-savings',
    balance: 'stat-card-balance',
  };

  const iconStyles = {
    income: 'icon-badge-income',
    expense: 'icon-badge-expense',
    savings: 'icon-badge-savings',
    balance: 'bg-accent/10 text-accent',
  };

  const valueStyles = {
    income: 'money-positive',
    expense: 'money-negative',
    savings: 'money-neutral',
    balance: 'text-foreground',
  };

  return (
    <div className={cn('bg-card rounded-xl border shadow-sm p-6 animate-fade-in', variantStyles[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn('text-2xl lg:text-3xl font-bold mono-number', valueStyles[variant])}>
            {formatCurrency(value)}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend.isPositive ? 'bg-income-muted text-income' : 'bg-expense-muted text-expense'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from last month</span>
            </div>
          )}
        </div>
        <div className={cn('rounded-xl p-3', iconStyles[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
