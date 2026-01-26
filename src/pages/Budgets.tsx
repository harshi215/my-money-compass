import { useState } from 'react';
import { Plus, Pencil, Trash2, Target } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBudgets, useDeleteBudget } from '@/hooks/useBudgets';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency, getCategoryLabel } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { BudgetDialog } from '@/components/budgets/BudgetDialog';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
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

type Budget = Tables<'budgets'>;

export default function BudgetsPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const { data: budgets, isLoading: budgetsLoading } = useBudgets(currentMonth, currentYear);
  const { data: expenses, isLoading: expensesLoading } = useExpenses(currentMonth, currentYear);
  const deleteBudget = useDeleteBudget();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isLoading = budgetsLoading || expensesLoading;

  // Calculate spending by category
  const spendingByCategory = expenses?.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  const totalBudget = budgets?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;
  const totalSpent = Object.values(spendingByCategory).reduce((sum, v) => sum + v, 0);

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteBudget.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingBudget(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
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
            <h1 className="text-2xl font-bold">Budgets</h1>
            <p className="text-muted-foreground">Set and track monthly spending limits</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Budget
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">{formatCurrency(totalBudget)}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`text-3xl font-bold ${totalSpent > totalBudget ? 'money-negative' : ''}`}>
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                ({totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% used)
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Budget List */}
        <Card>
          <CardHeader>
            <CardTitle>Category Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            {budgets && budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.map((budget, index) => {
                  const spent = spendingByCategory[budget.category] || 0;
                  return (
                    <div
                      key={budget.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{getCategoryLabel(budget.category)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(spent)} of {formatCurrency(Number(budget.amount))}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(budget)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(budget.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <BudgetProgress
                        category={budget.category}
                        spent={spent}
                        budget={Number(budget.amount)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No budgets set yet</p>
                <p className="text-sm">Click "Add Budget" to set spending limits</p>
              </div>
            )}
          </CardContent>
        </Card>

        <BudgetDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          budget={editingBudget}
          existingCategories={budgets?.map(b => b.category) || []}
        />

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Budget</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this budget? This action cannot be undone.
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
