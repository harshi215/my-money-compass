import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type SavingsGoal = Tables<'savings_goals'>;
type SavingsGoalInsert = TablesInsert<'savings_goals'>;
type SavingsGoalUpdate = TablesUpdate<'savings_goals'>;

export function useSavingsGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['savings_goals', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavingsGoal[];
    },
    enabled: !!user,
  });
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (goal: Omit<SavingsGoalInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({ ...goal, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Savings goal created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create savings goal', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: SavingsGoalUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Savings goal updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update savings goal', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSavingsGoal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Savings goal deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete savings goal', description: error.message, variant: 'destructive' });
    },
  });
}
