import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ImportUpload } from '@/components/import/ImportUpload';
import { ImportInsights } from '@/components/import/ImportInsights';
import { AnalysisResult } from '@/types/import';

export default function Import() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Import Data</h1>
          <p className="text-muted-foreground">
            Upload an Excel or CSV file to analyze your financial data
          </p>
        </div>

        <ImportUpload 
          onAnalysisComplete={setAnalysisResult}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
        />

        {analysisResult && (
          <ImportInsights result={analysisResult} />
        )}
      </div>
    </DashboardLayout>
  );
}
