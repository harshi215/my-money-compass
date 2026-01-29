import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type RecurringTransactionRow = Database['public']['Tables']['recurring_transactions']['Row'];
type RecurringTransactionInsertDb = Database['public']['Tables']['recurring_transactions']['Insert'];
type RecurringTransactionUpdateDb = Database['public']['Tables']['recurring_transactions']['Update'];

export type RecurringTransaction = RecurringTransactionRow;
export type RecurringTransactionInsert = Omit<RecurringTransactionInsertDb, 'user_id'>;
export type RecurringTransactionUpdate = RecurringTransactionUpdateDb & { id: string };

export function useRecurringTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recurring_transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_occurrence', { ascending: true });

      if (error) throw error;
      return data as RecurringTransaction[];
    },
    enabled: !!user,
  });
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (transaction: RecurringTransactionInsert) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      toast({ title: 'Recurring transaction created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create recurring transaction', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: RecurringTransactionUpdate) => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      toast({ title: 'Recurring transaction updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update recurring transaction', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      toast({ title: 'Recurring transaction deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete recurring transaction', description: error.message, variant: 'destructive' });
    },
  });
}

export function useProcessRecurringTransactions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-recurring`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process recurring transactions');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ 
        title: 'Recurring transactions processed', 
        description: `Created ${data.processed || 0} transaction(s)` 
      });
    },
    onError: (error) => {
      toast({ title: 'Failed to process recurring transactions', description: error.message, variant: 'destructive' });
    },
  });
}
