import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, addMonths, addYears } from 'date-fns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCreateRecurringTransaction, useUpdateRecurringTransaction, RecurringTransaction } from '@/hooks/useRecurringTransactions';
import { Constants } from '@/integrations/supabase/types';
import type { Database } from '@/integrations/supabase/types';

type IncomeSource = Database['public']['Enums']['income_source'];
type ExpenseCategory = Database['public']['Enums']['expense_category'];
type PaymentMethod = Database['public']['Enums']['payment_method'];

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(100, 'Description too long'),
  source: z.enum(Constants.public.Enums.income_source as unknown as readonly [string, ...string[]]).optional(),
  category: z.enum(Constants.public.Enums.expense_category as unknown as readonly [string, ...string[]]).optional(),
  payment_method: z.enum(Constants.public.Enums.payment_method as unknown as readonly [string, ...string[]]).optional(),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  day_of_month: z.coerce.number().min(1).max(31).optional(),
  next_occurrence: z.string(),
  is_active: z.boolean(),
  notes: z.string().max(500, 'Notes too long').optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RecurringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: RecurringTransaction | null;
}

export function RecurringDialog({ open, onOpenChange, transaction }: RecurringDialogProps) {
  const createMutation = useCreateRecurringTransaction();
  const updateMutation = useUpdateRecurringTransaction();
  const isEditing = !!transaction;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      description: '',
      source: 'salary',
      category: 'other',
      payment_method: 'card',
      frequency: 'monthly',
      day_of_month: new Date().getDate(),
      next_occurrence: format(new Date(), 'yyyy-MM-dd'),
      is_active: true,
      notes: '',
    },
  });

  const transactionType = form.watch('type');
  const frequency = form.watch('frequency');

  useEffect(() => {
    if (transaction) {
      form.reset({
        type: transaction.type as 'income' | 'expense',
        amount: Number(transaction.amount),
        description: transaction.description || '',
        source: transaction.source || 'salary',
        category: transaction.category || 'other',
        payment_method: transaction.payment_method || 'card',
        frequency: transaction.frequency as 'weekly' | 'monthly' | 'yearly',
        day_of_month: transaction.day_of_month || new Date().getDate(),
        next_occurrence: transaction.next_occurrence,
        is_active: transaction.is_active,
        notes: transaction.notes || '',
      });
    } else {
      form.reset({
        type: 'expense',
        amount: 0,
        description: '',
        source: 'salary',
        category: 'other',
        payment_method: 'card',
        frequency: 'monthly',
        day_of_month: new Date().getDate(),
        next_occurrence: format(new Date(), 'yyyy-MM-dd'),
        is_active: true,
        notes: '',
      });
    }
  }, [transaction, form, open]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      type: values.type,
      amount: values.amount,
      description: values.description,
      source: values.type === 'income' ? (values.source as IncomeSource) : null,
      category: values.type === 'expense' ? (values.category as ExpenseCategory) : null,
      payment_method: values.type === 'expense' ? (values.payment_method as PaymentMethod) : null,
      frequency: values.frequency,
      day_of_month: values.frequency === 'monthly' ? values.day_of_month : null,
      next_occurrence: values.next_occurrence,
      is_active: values.is_active,
      notes: values.notes || null,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ id: transaction.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const getNextOccurrencePreview = () => {
    const nextDate = new Date(form.watch('next_occurrence'));
    const freq = form.watch('frequency');
    
    let followingDate: Date;
    switch (freq) {
      case 'weekly':
        followingDate = addDays(nextDate, 7);
        break;
      case 'monthly':
        followingDate = addMonths(nextDate, 1);
        break;
      case 'yearly':
        followingDate = addYears(nextDate, 1);
        break;
      default:
        followingDate = nextDate;
    }
    
    return `Next: ${format(nextDate, 'MMM d, yyyy')} → Then: ${format(followingDate, 'MMM d, yyyy')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Add'} Recurring Transaction</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Monthly Salary, Netflix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {transactionType === 'income' && (
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
                            {source.charAt(0).toUpperCase() + source.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {transactionType === 'expense' && (
              <>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Constants.public.Enums.expense_category.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Constants.public.Enums.payment_method.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {frequency === 'monthly' && (
              <FormField
                control={form.control}
                name="day_of_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Month</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="31" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="next_occurrence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Occurrence</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">{getNextOccurrencePreview()}</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <p className="text-xs text-muted-foreground">Enable automatic processing</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
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
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
