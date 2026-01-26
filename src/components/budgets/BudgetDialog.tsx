import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateBudget, useUpdateBudget } from '@/hooks/useBudgets';
import { Constants } from '@/integrations/supabase/types';
import type { Tables } from '@/integrations/supabase/types';

type Budget = Tables<'budgets'>;

const budgetSchema = z.object({
  amount: z.string().min(1, 'Amount is required').transform((val) => parseFloat(val)),
  category: z.enum(['food', 'travel', 'rent', 'shopping', 'bills', 'entertainment', 'health', 'education', 'other'] as const),
});

type BudgetFormData = z.input<typeof budgetSchema>;

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget | null;
  existingCategories: string[];
}

const categoryLabels: Record<string, string> = {
  food: 'Food & Dining',
  travel: 'Travel',
  rent: 'Rent & Housing',
  shopping: 'Shopping',
  bills: 'Bills & Utilities',
  entertainment: 'Entertainment',
  health: 'Health & Medical',
  education: 'Education',
  other: 'Other',
};

export function BudgetDialog({ open, onOpenChange, budget, existingCategories }: BudgetDialogProps) {
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const isEditing = !!budget;

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      amount: '',
      category: 'other',
    },
  });

  useEffect(() => {
    if (budget) {
      form.reset({
        amount: String(budget.amount),
        category: budget.category,
      });
    } else {
      form.reset({
        amount: '',
        category: 'other',
      });
    }
  }, [budget, form, open]);

  // Filter out categories that already have budgets (except current one being edited)
  const availableCategories = Constants.public.Enums.expense_category.filter(
    (cat) => !existingCategories.includes(cat) || budget?.category === cat
  );

  const onSubmit = async (data: BudgetFormData) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const payload = {
      amount: Number(data.amount),
      category: data.category as Budget['category'],
      month: currentMonth,
      year: currentYear,
    };

    if (isEditing && budget) {
      await updateBudget.mutateAsync({ id: budget.id, ...payload });
    } else {
      await createBudget.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {categoryLabels[category] || category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
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
                disabled={createBudget.isPending || updateBudget.isPending}
              >
                {isEditing ? 'Save Changes' : 'Add Budget'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
