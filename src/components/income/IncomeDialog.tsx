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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateIncome, useUpdateIncome } from '@/hooks/useIncomes';
import { Constants } from '@/integrations/supabase/types';
import type { Tables } from '@/integrations/supabase/types';

type Income = Tables<'incomes'>;

const incomeSchema = z.object({
  amount: z.string().min(1, 'Amount is required').transform((val) => parseFloat(val)),
  source: z.enum(['salary', 'freelance', 'bonus', 'investment', 'gift', 'other'] as const),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type IncomeFormData = z.input<typeof incomeSchema>;

interface IncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income?: Income | null;
}

const sourceLabels: Record<string, string> = {
  salary: 'Salary',
  freelance: 'Freelance',
  bonus: 'Bonus',
  investment: 'Investment',
  gift: 'Gift',
  other: 'Other',
};

export function IncomeDialog({ open, onOpenChange, income }: IncomeDialogProps) {
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();
  const isEditing = !!income;

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: '',
      source: 'salary',
      date: new Date().toISOString().split('T')[0],
      description: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (income) {
      form.reset({
        amount: String(income.amount),
        source: income.source,
        date: income.date,
        description: income.description || '',
        notes: income.notes || '',
      });
    } else {
      form.reset({
        amount: '',
        source: 'salary',
        date: new Date().toISOString().split('T')[0],
        description: '',
        notes: '',
      });
    }
  }, [income, form, open]);

  const onSubmit = async (data: IncomeFormData) => {
    const payload = {
      amount: Number(data.amount),
      source: data.source as Income['source'],
      date: data.date,
      description: data.description || null,
      notes: data.notes || null,
    };

    if (isEditing && income) {
      await updateIncome.mutateAsync({ id: income.id, ...payload });
    } else {
      await createIncome.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Income' : 'Add Income'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
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

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Constants.public.Enums.income_source.map((source) => (
                        <SelectItem key={source} value={source}>
                          {sourceLabels[source] || source}
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., January salary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
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
                disabled={createIncome.isPending || updateIncome.isPending}
              >
                {isEditing ? 'Save Changes' : 'Add Income'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
