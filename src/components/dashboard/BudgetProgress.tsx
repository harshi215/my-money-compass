import { cn } from '@/lib/utils';
import { formatCurrency, getCategoryLabel, formatPercentage } from '@/lib/formatters';
import { Progress } from '@/components/ui/progress';

interface BudgetProgressProps {
  category: string;
  spent: number;
  budget: number;
  className?: string;
}

export function BudgetProgress({ category, spent, budget, className }: BudgetProgressProps) {
  const percentage = Math.min((spent / budget) * 100, 100);
  const remaining = budget - spent;
  const isOverBudget = spent > budget;
  const isWarning = percentage >= 80 && percentage < 100;

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-expense';
    if (isWarning) return 'bg-warning';
    return 'bg-income';
  };

  return (
    <div className={cn('space-y-3 p-4 rounded-lg bg-muted/50', className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{getCategoryLabel(category)}</span>
        <span className={cn(
          'text-xs font-medium px-2 py-1 rounded-full',
          isOverBudget ? 'bg-expense-muted text-expense' : 
          isWarning ? 'bg-warning-muted text-warning' : 
          'bg-income-muted text-income'
        )}>
          {formatPercentage(percentage)}
        </span>
      </div>
      
      <div className="relative">
        <Progress value={percentage} className="h-2 bg-muted" />
        <div 
          className={cn('absolute inset-0 h-2 rounded-full transition-all', getProgressColor())}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(spent)} spent</span>
        <span className={cn(isOverBudget ? 'text-expense font-medium' : '')}>
          {isOverBudget ? `${formatCurrency(Math.abs(remaining))} over` : `${formatCurrency(remaining)} left`}
        </span>
      </div>
    </div>
  );
}
