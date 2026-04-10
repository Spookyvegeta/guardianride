"use client"

import { useWorkerProfile } from '@/lib/store';
import { AccidentMonitor } from '@/components/AccidentMonitor';
import { QRCard } from '@/components/QRCard';
import { ProfileView } from '@/components/ProfileView';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, User, LayoutDashboard, QrCode as QrIcon, AlertTriangle, Activity, Zap } from "lucide-react";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useAuth } from '@/firebase';
import { triggerWhatsApp } from '@/lib/sos';

export default function Dashboard() {
  const { profile, loading } = useWorkerProfile();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState('monitor');

  useEffect(() => {
    if (!isUserLoading && !user && auth) initiateAnonymousSignIn(auth);
  }, [user, isUserLoading, auth]);

  if (loading || isUserLoading) {
    return (
      <div className="min-h-screen bg-mesh p-6 space-y-6 max-w-lg mx-auto">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6 text-center gap-6">
        <div className="bg-primary/10 p-6 rounded-full">
          <Shield className="h-16 w-16 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-headline">SafeSignal OS Inactive</h1>
          <p className="text-muted-foreground">Please complete your safety profile to enable protection.</p>
        </div>
        <Link href="/onboarding">
          <Button size="lg" className="rounded-2xl h-14 px-10 text-lg font-bold">Start Onboarding</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh pb-24 md:pb-6">
      <header className="p-4 md:p-6 sticky top-0 bg-background/50 backdrop-blur-md z-30 border-b border-border/20">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
              <Shield className="text-white h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold tracking-tight">SafeSignal</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">System Status: Active</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" size="icon"
              className="rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
              onClick={() => profile && triggerWhatsApp(profile, 'panic')}
              title="SOS"
            >
              <AlertTriangle className="h-5 w-5" />
            </Button>
            <div
              onClick={() => setActiveTab('profile')}
              className={`h-10 w-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-primary border-primary' : 'bg-accent/20 border-accent/30'}`}
            >
              <User className={`h-5 w-5 ${activeTab === 'profile' ? 'text-white' : 'text-accent'}`} />
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-3xl mx-auto w-full space-y-8">
        <section className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold font-headline">Welcome, {profile.name.split(' ')[0]}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Status: <span className="text-green-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Protected
            </span>
          </p>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/40 h-12 p-1 rounded-2xl mb-6">
            <TabsTrigger value="monitor" className="rounded-xl data-[state=active]:bg-background text-xs md:text-sm">
              <Activity className="h-4 w-4 mr-1 hidden sm:inline" /> Safety
            </TabsTrigger>
            <TabsTrigger value="id" className="rounded-xl data-[state=active]:bg-background text-xs md:text-sm">
              <QrIcon className="h-4 w-4 mr-1 hidden sm:inline" /> Med-ID
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-background text-xs md:text-sm">
              <User className="h-4 w-4 mr-1 hidden sm:inline" /> Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="space-y-6 animate-in fade-in duration-300 outline-none">
            <AccidentMonitor profile={profile} />
            <Link href="/demo">
              <Card className="bg-primary/10 border-primary/30 p-5 hover:bg-primary/20 transition-colors cursor-pointer">
                <h3 className="font-bold flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> SOS Demo Mode</h3>
                <p className="text-sm text-muted-foreground mt-1">Simulate crash detection and see the full emergency response.</p>
              </Card>
            </Link>
          </TabsContent>

          <TabsContent value="id" className="animate-in fade-in duration-300 outline-none">
            <div className="max-w-md mx-auto space-y-4">
              <QRCard profile={profile} />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="animate-in fade-in duration-300 outline-none">
            <ProfileView profile={profile} />
          </TabsContent>
        </Tabs>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/20 z-40 md:hidden">
        <div className="max-w-md mx-auto flex justify-around">
          {[
            { tab: 'monitor', icon: <LayoutDashboard className="h-6 w-6" />, label: 'Safety' },
            { tab: 'id', icon: <QrIcon className="h-6 w-6" />, label: 'Med-ID' },
            { tab: 'profile', icon: <User className="h-6 w-6" />, label: 'Profile' },
          ].map(({ tab, icon, label }) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab ? 'text-primary' : 'text-muted-foreground'}`}>
              {icon}
              <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
