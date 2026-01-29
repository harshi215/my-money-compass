-- Create recurring transactions table
CREATE TABLE public.recurring_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC NOT NULL,
    description TEXT,
    -- Income fields
    source public.income_source,
    -- Expense fields
    category public.expense_category,
    payment_method public.payment_method,
    -- Scheduling
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
    day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
    next_occurrence DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    -- Tracking
    last_processed DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own recurring transactions"
ON public.recurring_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring transactions"
ON public.recurring_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions"
ON public.recurring_transactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring transactions"
ON public.recurring_transactions
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_recurring_transactions_updated_at
BEFORE UPDATE ON public.recurring_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();