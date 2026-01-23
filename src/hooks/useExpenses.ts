import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Expense = Tables<'expenses'>;
type ExpenseInsert = TablesInsert<'expenses'>;
type ExpenseUpdate = TablesUpdate<'expenses'>;

export function useExpenses(month?: number, year?: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['expenses', user?.id, month, year],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (month && year) {
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (expense: Omit<ExpenseInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('expenses')
        .insert({ ...expense, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Expense added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to add expense', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ExpenseUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Expense updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update expense', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Expense deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete expense', description: error.message, variant: 'destructive' });
    },
  });
}
