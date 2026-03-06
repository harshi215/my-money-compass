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
import { lovable } from '@/integrations/lovable/index';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [authError, setAuthError] = useState<{ title: string; description: string } | null>(null);
  const [signupPassword, setSignupPassword] = useState('');
  const { signIn, signUp, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setAuthError(null);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      const friendly = getAuthErrorMessage(error);
      setAuthError(friendly);
      toast({ title: friendly.title, description: friendly.description, variant: 'destructive' });
    }
    setGoogleLoading(false);
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    setAuthError(null);
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      const friendly = getAuthErrorMessage(error);
      setAuthError(friendly);
      toast({ title: friendly.title, description: friendly.description, variant: 'destructive' });
    }
    setAppleLoading(false);
  };

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
        description: 'You can now sign in to your account.',
      });
      navigate('/dashboard');
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
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
                    </div>
                    <Button type="button" variant="outline" className="w-full" disabled={googleLoading} onClick={handleGoogleSignIn}>
                      {googleLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      )}
                      Google
                    </Button>
                    <Button type="button" variant="outline" className="w-full" disabled={appleLoading} onClick={handleAppleSignIn}>
                      {appleLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                      )}
                      Apple
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
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
                    </div>
                    <Button type="button" variant="outline" className="w-full" disabled={googleLoading} onClick={handleGoogleSignIn}>
                      {googleLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      )}
                      Google
                    </Button>
                    <Button type="button" variant="outline" className="w-full" disabled={appleLoading} onClick={handleAppleSignIn}>
                      {appleLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                      )}
                      Apple
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
