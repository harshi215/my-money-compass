import { useState } from 'react';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIncomes, useDeleteIncome } from '@/hooks/useIncomes';
import { formatCurrency, formatDateShort, getSourceLabel } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { IncomeDialog } from '@/components/income/IncomeDialog';
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

type Income = Tables<'incomes'>;

export default function IncomePage() {
  const { data: incomes, isLoading } = useIncomes();
  const deleteIncome = useDeleteIncome();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalIncome = incomes?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteIncome.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingIncome(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
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
            <h1 className="text-2xl font-bold">Income</h1>
            <p className="text-muted-foreground">Manage your income sources</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Income
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="stat-card-income">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold money-positive">{formatCurrency(totalIncome)}</span>
              <div className="icon-badge-income rounded-xl p-3">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income List */}
        <Card>
          <CardHeader>
            <CardTitle>All Income</CardTitle>
          </CardHeader>
          <CardContent>
            {incomes && incomes.length > 0 ? (
              <div className="space-y-3">
                {incomes.map((income, index) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="icon-badge-income rounded-lg p-2">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{income.description || getSourceLabel(income.source)}</p>
                        <p className="text-sm text-muted-foreground">
                          {getSourceLabel(income.source)} • {formatDateShort(income.date)}
                        </p>
                        {income.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{income.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold money-positive mono-number">
                        +{formatCurrency(Number(income.amount))}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(income)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(income.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No income entries yet</p>
                <p className="text-sm">Click "Add Income" to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        <IncomeDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          income={editingIncome}
        />

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Income</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this income entry? This action cannot be undone.
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
