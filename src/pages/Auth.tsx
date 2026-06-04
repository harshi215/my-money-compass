import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Wallet, TrendingUp, PiggyBank, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { ForgotPasswordDialog } from '@/components/auth/ForgotPasswordDialog';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<{ title: string; description: string } | null>(null);
  const [signupPassword, setSignupPassword] = useState('');
  const { signIn, signUp, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to dashboard when auth session is ready
  useEffect(() => {
    if (!authLoading && session) {
      navigate('/dashboard');
    }
  }, [authLoading, session, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      const friendly = getAuthErrorMessage(error);
      setAuthError(friendly);
      toast({
        title: friendly.title,
        description: friendly.description,
        variant: 'destructive',
      });
    } else {
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      const friendly = getAuthErrorMessage(error);
      setAuthError(friendly);
      toast({
        title: friendly.title,
        description: friendly.description,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account created!',
        description: 'Please check your email to confirm your account or sign in if confirmation is disabled.',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Wallet className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">WealthWise</span>
          </div>
          
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
              Take control of your <br />
              <span className="text-accent">financial future</span>
            </h1>
            <p className="text-primary-foreground/70 text-lg max-w-md">
              Track your income, manage expenses, set budgets, and achieve your savings goals — all in one beautiful, intuitive dashboard.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-sidebar-accent/30">
            <div className="icon-badge-income">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-primary-foreground">Smart Analytics</p>
              <p className="text-sm text-primary-foreground/60">Visual insights into your spending patterns</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-sidebar-accent/30">
            <div className="icon-badge-savings">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-primary-foreground">Savings Goals</p>
              <p className="text-sm text-primary-foreground/60">Track progress towards your dreams</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">WealthWise</span>
          </div>

          {/* Persistent error alert */}
          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{authError.title}</AlertTitle>
              <AlertDescription>{authError.description}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="signin" className="w-full" onValueChange={() => setAuthError(null)}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card className="border-0 shadow-lg">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <PasswordInput
                        id="signin-password"
                        name="password"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex justify-end">
                      <ForgotPasswordDialog />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <ArrowRight className="w-4 h-4 mr-2" />
                      )}
                      Sign In
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="border-0 shadow-lg">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>
                    Start your journey to financial wellness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        name="fullName"
                        type="text"
                        placeholder="John Doe"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <PasswordInput
                        id="signup-password"
                        name="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        disabled={isLoading}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                      />
                      <PasswordStrengthIndicator password={signupPassword} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <ArrowRight className="w-4 h-4 mr-2" />
                      )}
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
