import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client with the user's token to get their user_id
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];

    // Get all active recurring transactions for this user that are due
    const { data: recurringTransactions, error: fetchError } = await supabaseAdmin
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .lte('next_occurrence', today);

    if (fetchError) {
      console.error('Error fetching recurring transactions:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch recurring transactions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processed = 0;

    for (const rt of recurringTransactions || []) {
      try {
        // Create the actual transaction
        if (rt.type === 'income') {
          const { error: incomeError } = await supabaseAdmin
            .from('incomes')
            .insert({
              user_id: user.id,
              amount: rt.amount,
              source: rt.source || 'other',
              description: rt.description,
              date: rt.next_occurrence,
              notes: rt.notes ? `${rt.notes} (Auto-generated from recurring)` : 'Auto-generated from recurring',
            });

          if (incomeError) {
            console.error('Error creating income:', incomeError);
            continue;
          }
        } else {
          const { error: expenseError } = await supabaseAdmin
            .from('expenses')
            .insert({
              user_id: user.id,
              amount: rt.amount,
              category: rt.category || 'other',
              payment_method: rt.payment_method || 'card',
              description: rt.description,
              date: rt.next_occurrence,
              notes: rt.notes ? `${rt.notes} (Auto-generated from recurring)` : 'Auto-generated from recurring',
            });

          if (expenseError) {
            console.error('Error creating expense:', expenseError);
            continue;
          }
        }

        // Calculate next occurrence
        let nextDate = new Date(rt.next_occurrence);
        switch (rt.frequency) {
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            // Handle day_of_month preference
            if (rt.day_of_month) {
              const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
              nextDate.setDate(Math.min(rt.day_of_month, lastDayOfMonth));
            }
            break;
          case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }

        // Update the recurring transaction with new next_occurrence
        const { error: updateError } = await supabaseAdmin
          .from('recurring_transactions')
          .update({
            next_occurrence: nextDate.toISOString().split('T')[0],
            last_processed: today,
          })
          .eq('id', rt.id);

        if (updateError) {
          console.error('Error updating recurring transaction:', updateError);
          continue;
        }

        processed++;
      } catch (err) {
        console.error('Error processing recurring transaction:', err);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed,
        message: `Processed ${processed} recurring transaction(s)` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
