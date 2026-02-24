import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet } from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">WealthWise</span>
          </div>
          <Button variant="ghost" onClick={() => navigate(-1 as any)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: February 24, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you create an account, we collect your email address and any profile information you choose to provide. We also collect financial data you voluntarily enter, including income, expenses, budgets, and savings goals. This data is stored securely and is only accessible to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is used solely to provide you with the WealthWise service — displaying dashboards, generating analytics, and powering the AI assistant. We do not sell, rent, or share your personal or financial data with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">3. Data Storage & Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              All data is encrypted in transit and at rest. We use industry-standard security measures including row-level security policies to ensure your data is only accessible by you. Your financial information is never exposed to other users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">4. AI Assistant</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you use the AI Assistant, your prompts are sent to our AI provider to generate responses. We do not store conversation history beyond your active session unless explicitly enabled. The AI does not have access to your personal financial data unless you include it in your messages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">5. Cookies & Analytics</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to maintain your authentication session. We may use anonymized analytics to improve the service. We do not use third-party tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can access, update, or delete your data at any time through the Settings page. If you wish to delete your account entirely, please contact us and we will remove all associated data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">7. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy from time to time. We will notify you of significant changes via email or an in-app notification.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
