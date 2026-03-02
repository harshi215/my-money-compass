import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string; hints: string[] } {
  if (!password) return { score: 0, label: '', hints: [] };

  let score = 0;
  const hints: string[] = [];

  if (password.length >= 6) score++;
  else hints.push('At least 6 characters');

  if (password.length >= 10) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else hints.push('Mix upper & lowercase');

  if (/\d/.test(password)) score++;
  else hints.push('Add a number');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else hints.push('Add a special character');

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  return { score, label: labels[score] || 'Very strong', hints: hints.slice(0, 2) };
}

const colors: Record<number, string> = {
  1: 'bg-destructive',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-emerald-500',
  5: 'bg-emerald-600',
};

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { score, label, hints } = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i <= score ? colors[score] : 'bg-muted'
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        {hints.length > 0 && (
          <span className="text-muted-foreground">{hints.join(' · ')}</span>
        )}
      </div>
    </div>
  );
}
