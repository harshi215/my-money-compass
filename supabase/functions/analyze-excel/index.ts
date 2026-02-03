import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple CSV parser for text-based data
function parseCSV(text: string): string[][] {
  const lines = text.trim().split('\n');
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let jsonData: string[][] = [];
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      // Parse CSV
      const text = await file.text();
      jsonData = parseCSV(text);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // For Excel files, we'll use xlsx library via esm.sh
      const XLSX = await import("https://esm.sh/xlsx@0.18.5");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
    } else {
      return new Response(JSON.stringify({ error: "Unsupported file format. Please upload CSV or Excel file." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (jsonData.length === 0) {
      return new Response(JSON.stringify({ error: "Empty spreadsheet" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare data summary for AI analysis
    const headers = jsonData[0] as string[];
    const rows = jsonData.slice(1, 101); // Limit to first 100 rows for analysis
    
    const dataSample = JSON.stringify({
      headers,
      sampleRows: rows.slice(0, 20),
      totalRows: jsonData.length - 1,
    });

    // Analyze with AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a financial data analyst. Analyze spreadsheet data and extract financial insights.
            
Your task is to:
1. Identify which columns represent dates, amounts, descriptions, and categories
2. Categorize each transaction as either income or expense based on context (positive/negative amounts, keywords like salary, payment, purchase, etc.)
3. Assign categories: For expenses use (food, travel, rent, shopping, bills, entertainment, health, education, other). For income use (salary, freelance, bonus, investment, gift, other)
4. Calculate summary statistics
5. Provide 3-5 actionable financial insights

Return a JSON object with this exact structure:
{
  "summary": {
    "totalIncome": number,
    "totalExpenses": number,
    "netBalance": number,
    "transactionCount": number,
    "dateRange": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" }
  },
  "categoryBreakdown": {
    "income": { "salary": 0, "freelance": 0, "bonus": 0, "investment": 0, "gift": 0, "other": 0 },
    "expenses": { "food": 0, "travel": 0, "rent": 0, "shopping": 0, "bills": 0, "entertainment": 0, "health": 0, "education": 0, "other": 0 }
  },
  "transactions": [
    { "date": "YYYY-MM-DD", "type": "income" or "expense", "amount": number, "category": "string", "description": "string" }
  ],
  "insights": [
    "insight 1",
    "insight 2",
    "insight 3"
  ],
  "topExpenseCategories": [
    { "category": "string", "amount": number, "percentage": number }
  ],
  "monthlyTrend": [
    { "month": "YYYY-MM", "income": number, "expenses": number }
  ]
}

Only return valid JSON, no markdown or explanations. Make reasonable assumptions if data is ambiguous.`
          },
          {
            role: "user",
            content: `Analyze this financial spreadsheet data and extract insights:\n\n${dataSample}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No analysis returned from AI");
    }

    // Parse AI response
    let analysis;
    try {
      // Clean up potential markdown formatting
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedContent);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ 
        error: "Failed to parse analysis results",
        rawContent: content 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
