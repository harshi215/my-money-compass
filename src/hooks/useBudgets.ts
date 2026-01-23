import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Budget = Tables<'budgets'>;
type BudgetInsert = TablesInsert<'budgets'>;
type BudgetUpdate = TablesUpdate<'budgets'>;

export function useBudgets(month?: number, year?: number) {
  const { user } = useAuth();
  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: ['budgets', user?.id, currentMonth, currentYear],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (budget: Omit<BudgetInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('budgets')
        .insert({ ...budget, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Budget created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create budget', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: BudgetUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Budget updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update budget', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Budget deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete budget', description: error.message, variant: 'destructive' });
    },
  });
}
