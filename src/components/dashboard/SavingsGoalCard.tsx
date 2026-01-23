import { Target, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/formatters';
import { Progress } from '@/components/ui/progress';

interface SavingsGoalCardProps {
  name: string;
  currentAmount: number;
  targetAmount: number;
  deadline?: string | null;
  color?: string;
  className?: string;
}

export function SavingsGoalCard({
  name,
  currentAmount,
  targetAmount,
  deadline,
  color = '#3B82F6',
  className,
}: SavingsGoalCardProps) {
  const percentage = Math.min((currentAmount / targetAmount) * 100, 100);
  const isCompleted = currentAmount >= targetAmount;

  return (
    <div className={cn(
      'bg-card rounded-xl border p-5 space-y-4 transition-all hover:shadow-md',
      isCompleted && 'border-income/30 bg-income-muted/30',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold">{name}</h4>
            {deadline && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(deadline)}</span>
              </div>
            )}
          </div>
        </div>
        <span className={cn(
          'text-xs font-medium px-2 py-1 rounded-full',
          isCompleted ? 'bg-income-muted text-income' : 'bg-muted text-muted-foreground'
        )}>
          {isCompleted ? 'Completed!' : formatPercentage(percentage)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Progress value={percentage} className="h-2.5 bg-muted" />
          <div 
            className="absolute inset-0 h-2.5 rounded-full transition-all"
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: color 
            }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium mono-number" style={{ color }}>
            {formatCurrency(currentAmount)}
          </span>
          <span className="text-muted-foreground mono-number">
            {formatCurrency(targetAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
