import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Income = Tables<'incomes'>;
type IncomeInsert = TablesInsert<'incomes'>;
type IncomeUpdate = TablesUpdate<'incomes'>;

export function useIncomes(month?: number, year?: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['incomes', user?.id, month, year],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('incomes')
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
      return data as Income[];
    },
    enabled: !!user,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (income: Omit<IncomeInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('incomes')
        .insert({ ...income, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Income added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to add income', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: IncomeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('incomes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Income updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update income', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Income deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete income', description: error.message, variant: 'destructive' });
    },
  });
}
