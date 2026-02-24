import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  PieChart,
  RefreshCw,
  FileUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  LogOut,
} from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Income Tracking',
    description: 'Log all your income sources — salary, freelance, investments and more.',
    color: 'hsl(var(--income))',
    bg: 'hsl(var(--income-muted))',
  },
  {
    icon: TrendingDown,
    title: 'Expense Management',
    description: 'Categorize and track every expense to understand your spending.',
    color: 'hsl(var(--expense))',
    bg: 'hsl(var(--expense-muted))',
  },
  {
    icon: Target,
    title: 'Smart Budgets',
    description: 'Set monthly budgets per category and get alerts when you\'re close.',
    color: 'hsl(var(--warning))',
    bg: 'hsl(var(--warning-muted))',
  },
  {
    icon: PiggyBank,
    title: 'Savings Goals',
    description: 'Set goals, track progress, and celebrate when you hit your targets.',
    color: 'hsl(var(--savings))',
    bg: 'hsl(var(--savings-muted))',
  },
  {
    icon: PieChart,
    title: 'Visual Analytics',
    description: 'Beautiful charts and insights to visualize your financial health.',
    color: 'hsl(var(--primary))',
    bg: 'hsl(var(--accent))',
  },
  {
    icon: RefreshCw,
    title: 'Recurring Transactions',
    description: 'Automate repeating income and expenses so nothing slips through.',
    color: 'hsl(var(--secondary))',
    bg: 'hsl(var(--accent))',
  },
];

const highlights = [
  'Free & open source',
  'Beautiful dashboard',
  'AI-powered import',
  'Secure & private',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">WealthWise</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button onClick={() => navigate('/dashboard')}>
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={handleSignOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'hsl(var(--primary))' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'hsl(var(--savings))' }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-card mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Open Source & Free Forever</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-tight tracking-tight mb-6 animate-slide-up">
            Master Your
            <br />
            <span className="text-primary">Money.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up">
            Track income, manage expenses, set budgets and reach your savings goals — all in one clean, powerful dashboard built for real people.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/auth')}>
              Start for Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Highlight chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in">
            {highlights.map((h) => (
              <div key={h} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border text-sm font-medium text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {h}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to <span className="text-primary">stay on top</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Powerful features designed to make personal finance simple, visual, and actionable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border bg-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: feature.bg, color: feature.color }}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-card">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to take control?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Join WealthWise today and start building better financial habits — it's free, open source, and always will be.
          </p>
          <Button size="lg" className="text-lg px-10 py-6" onClick={() => navigate('/auth')}>
            Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">WealthWise</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/privacy')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </button>
            <span className="text-muted-foreground">·</span>
            <button onClick={() => navigate('/terms')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Open source · Made with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
