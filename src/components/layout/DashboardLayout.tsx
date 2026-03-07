import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 p-4 lg:p-6 overflow-auto custom-scrollbar">
            {children}
          </main>
        </SidebarInset>

        {/* Floating AI Assistant Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => navigate('/assistant')}
              className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-lg animate-bounce-slow animate-glow-pulse border-2 border-savings/30 p-0"
              style={{
                background: 'linear-gradient(135deg, hsl(217 91% 60%), hsl(260 80% 60%))',
              }}
            >
              <Bot className="w-7 h-7 text-white" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="font-semibold">
            <p>✨ AI Assistant</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </SidebarProvider>
  );
}
