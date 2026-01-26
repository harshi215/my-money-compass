import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUpdateSavingsGoal } from '@/hooks/useSavingsGoals';
import { formatCurrency } from '@/lib/formatters';
import type { Tables } from '@/integrations/supabase/types';

type SavingsGoal = Tables<'savings_goals'>;

const contributionSchema = z.object({
  amount: z.string().min(1, 'Amount is required').transform((val) => parseFloat(val)),
});

type ContributionFormData = z.input<typeof contributionSchema>;

interface ContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: SavingsGoal | null;
}

export function ContributionDialog({ open, onOpenChange, goal }: ContributionDialogProps) {
  const updateGoal = useUpdateSavingsGoal();

  const form = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: '',
    },
  });

  const onSubmit = async (data: ContributionFormData) => {
    if (!goal) return;

    const newAmount = Number(goal.current_amount) + Number(data.amount);
    const isCompleted = newAmount >= Number(goal.target_amount);

    await updateGoal.mutateAsync({
      id: goal.id,
      current_amount: newAmount,
      is_completed: isCompleted,
    });

    form.reset();
    onOpenChange(false);
  };

  if (!goal) return null;

  const remaining = Number(goal.target_amount) - Number(goal.current_amount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Contribution</DialogTitle>
          <DialogDescription>
            Add money to "{goal.name}". Remaining: {formatCurrency(remaining)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contribution Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateGoal.isPending}
              >
                Add Contribution
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
