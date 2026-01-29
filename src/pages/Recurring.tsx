import { useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Calendar, Pause, Play } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RecurringDialog } from '@/components/recurring/RecurringDialog';
import {
  useRecurringTransactions,
  useDeleteRecurringTransaction,
  useProcessRecurringTransactions,
  useUpdateRecurringTransaction,
  RecurringTransaction,
} from '@/hooks/useRecurringTransactions';
import { formatCurrency, getSourceLabel, getCategoryLabel } from '@/lib/formatters';
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

export default function RecurringPage() {
  const { data: transactions, isLoading } = useRecurringTransactions();
  const deleteMutation = useDeleteRecurringTransaction();
  const processMutation = useProcessRecurringTransactions();
  const updateMutation = useUpdateRecurringTransaction();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
  };

  const handleToggleActive = (transaction: RecurringTransaction) => {
    updateMutation.mutate({
      id: transaction.id,
      is_active: !transaction.is_active,
    });
  };

  const activeTransactions = transactions?.filter(t => t.is_active) || [];
  const pausedTransactions = transactions?.filter(t => !t.is_active) || [];

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return frequency;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const renderTransactionCard = (transaction: RecurringTransaction, index: number) => (
    <div
      key={transaction.id}
      className={`flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors animate-fade-in ${
        !transaction.is_active ? 'opacity-60' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-2 ${
          transaction.type === 'income' ? 'icon-badge-income' : 'icon-badge-expense'
        }`}>
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{transaction.description}</p>
            <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} className="text-xs">
              {transaction.type === 'income' ? 'Income' : 'Expense'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getFrequencyLabel(transaction.frequency)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {transaction.type === 'income' 
              ? getSourceLabel(transaction.source || 'other')
              : getCategoryLabel(transaction.category || 'other')
            }
            {' • '}
            Next: {format(new Date(transaction.next_occurrence), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-lg font-semibold mono-number ${
          transaction.type === 'income' ? 'money-positive' : 'money-negative'
        }`}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleActive(transaction)}
            title={transaction.is_active ? 'Pause' : 'Resume'}
          >
            {transaction.is_active ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(transaction)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(transaction.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recurring Transactions</h1>
            <p className="text-muted-foreground">Automate your regular income and expenses</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => processMutation.mutate()}
              disabled={processMutation.isPending}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${processMutation.isPending ? 'animate-spin' : ''}`} />
              Process Now
            </Button>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Recurring
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">How it works</p>
                <p className="text-sm text-muted-foreground">
                  Recurring transactions are automatically created when their scheduled date arrives. 
                  Click "Process Now" to manually create any due transactions, or they will be processed automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Active Recurring
              {activeTransactions.length > 0 && (
                <Badge variant="secondary">{activeTransactions.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>These transactions will be automatically created on schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {activeTransactions.length > 0 ? (
              <div className="space-y-3">
                {activeTransactions.map((t, i) => renderTransactionCard(t, i))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active recurring transactions</p>
                <p className="text-sm">Click "Add Recurring" to create one</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paused Transactions */}
        {pausedTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Paused
                <Badge variant="outline">{pausedTransactions.length}</Badge>
              </CardTitle>
              <CardDescription>These transactions are paused and won't be processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pausedTransactions.map((t, i) => renderTransactionCard(t, i))}
              </div>
            </CardContent>
          </Card>
        )}

        <RecurringDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          transaction={editingTransaction}
        />

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this recurring transaction? This will not delete any transactions that were already created.
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
