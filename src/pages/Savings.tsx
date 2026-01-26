import { useState } from 'react';
import { Plus, Pencil, Trash2, PiggyBank, DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSavingsGoals, useDeleteSavingsGoal, useUpdateSavingsGoal } from '@/hooks/useSavingsGoals';
import { formatCurrency, formatDateShort } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { SavingsDialog } from '@/components/savings/SavingsDialog';
import { ContributionDialog } from '@/components/savings/ContributionDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Tables } from '@/integrations/supabase/types';

type SavingsGoal = Tables<'savings_goals'>;

export default function SavingsPage() {
  const { data: goals, isLoading } = useSavingsGoals();
  const deleteGoal = useDeleteSavingsGoal();
  const updateGoal = useUpdateSavingsGoal();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalSaved = goals?.reduce((sum, g) => sum + Number(g.current_amount), 0) || 0;
  const totalTarget = goals?.reduce((sum, g) => sum + Number(g.target_amount), 0) || 0;
  const activeGoals = goals?.filter(g => !g.is_completed) || [];
  const completedGoals = goals?.filter(g => g.is_completed) || [];

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setDialogOpen(true);
  };

  const handleContribute = (goal: SavingsGoal) => {
    setContributingGoal(goal);
    setContributionDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteGoal.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingGoal(null);
  };

  const handleContributionClose = () => {
    setContributionDialogOpen(false);
    setContributingGoal(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Savings Goals</h1>
            <p className="text-muted-foreground">Track your progress towards financial goals</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Goal
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stat-card-savings">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Saved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold money-neutral">{formatCurrency(totalSaved)}</span>
                <div className="icon-badge-savings rounded-xl p-3">
                  <PiggyBank className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Target Total</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">{formatCurrency(totalTarget)}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">
                {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Active Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Active Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGoals.map((goal, index) => {
                  const progress = Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100);
                  return (
                    <div
                      key={goal.id}
                      className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow animate-fade-in"
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        borderLeftWidth: '4px',
                        borderLeftColor: goal.color || '#3B82F6'
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{goal.name}</h4>
                          {goal.deadline && (
                            <p className="text-sm text-muted-foreground">
                              Due: {formatDateShort(goal.deadline)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleContribute(goal)}
                            title="Add contribution"
                          >
                            <DollarSign className="w-4 h-4 text-income" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(goal.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="money-neutral font-medium">
                            {formatCurrency(Number(goal.current_amount))}
                          </span>
                          <span className="text-muted-foreground">
                            {formatCurrency(Number(goal.target_amount))}
                          </span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-2"
                          style={{ 
                            ['--progress-background' as string]: goal.color || '#3B82F6' 
                          }}
                        />
                        <p className="text-right text-sm font-medium" style={{ color: goal.color || '#3B82F6' }}>
                          {Math.round(progress)}% complete
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <PiggyBank className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active savings goals</p>
                <p className="text-sm">Click "New Goal" to start saving</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Goals 🎉</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-xl border bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{goal.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Saved {formatCurrency(Number(goal.target_amount))}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(goal.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <SavingsDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          goal={editingGoal}
        />

        <ContributionDialog
          open={contributionDialogOpen}
          onOpenChange={handleContributionClose}
          goal={contributingGoal}
        />

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Savings Goal</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this savings goal? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
