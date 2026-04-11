"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Loader2, Mail, Lock } from "lucide-react";
import { useUser, useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = async (data: FormData) => {
    if (!auth) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        await import('firebase/auth').then(({ createUserWithEmailAndPassword }) =>
          createUserWithEmailAndPassword(auth, data.email, data.password)
        );
        toast({ title: "Account created", description: "Welcome to SafeSignal." });
        router.replace('/onboarding');
      } else {
        await import('firebase/auth').then(({ signInWithEmailAndPassword }) =>
          signInWithEmailAndPassword(auth, data.email, data.password)
        );
        toast({ title: "Signed in", description: "Welcome back." });
        router.replace('/dashboard');
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message ?? "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-4 md:p-6">
      <div className="flex items-center gap-2 mb-6 md:mb-8 animate-in fade-in slide-in-from-top duration-500">
        <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20 relative">
          <Shield className="text-white h-4 w-4 md:h-5 md:w-5 relative z-10" />
          <div className="absolute inset-0 bg-primary/30 rounded-lg blur-md animate-pulse" />
        </div>
        <span className="text-lg md:text-xl font-bold tracking-tight font-headline">SafeSignal</span>
      </div>

      <Card className="w-full max-w-sm bg-card/40 border-border/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom duration-500 delay-200">
        <CardHeader className="text-center space-y-2 px-4 md:px-6">
          <CardTitle className="text-xl md:text-2xl font-bold">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {mode === 'signin' ? 'Sign in to your SafeSignal account' : 'Set up your safety profile'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9 h-11 md:h-12 transition-all duration-300 focus:scale-[1.02]"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive animate-in fade-in duration-200">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-11 md:h-12 transition-all duration-300 focus:scale-[1.02]"
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive animate-in fade-in duration-200">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full h-11 md:h-12 font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs md:text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-primary font-bold hover:underline transition-colors">
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => setMode('signin')} className="text-primary font-bold hover:underline transition-colors">
                  Sign in
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
