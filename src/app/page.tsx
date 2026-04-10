"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Shield, MapPin, QrCode, HeartPulse, ChevronRight, Activity, Eye, AlertCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <Shield className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight font-headline">SafeSignal</span>
        </div>
        <Link href="/onboarding">
          <Button variant="ghost" className="text-primary font-bold">Get Started</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="sm" className="rounded-xl">Sign In</Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col px-6 pb-12 gap-12 max-w-2xl mx-auto w-full">
        <section className="space-y-6 pt-8 text-center sm:text-left">
          <div className="inline-block bg-primary/10 px-4 py-1.5 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-4">
            India's Universal Safety OS
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tighter font-headline">
            The safety net for <span className="text-primary underline decoration-primary/30">every</span> citizen.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
            From solo commuters and seniors to field agents and gig partners. SafeSignal monitors, protects, and alerts when you can't.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/onboarding" className="flex-1">
              <Button size="lg" className="w-full h-14 text-lg font-bold rounded-2xl group shadow-xl shadow-primary/20">
                Setup Your Safety Profile
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button size="lg" variant="outline" className="w-full h-14 text-lg font-bold rounded-2xl bg-card/30 backdrop-blur-sm">
                Safety Dashboard
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard 
            icon={<Eye className="text-primary h-6 w-6" />}
            title="Drowsiness Guard"
            description="AI vision detects micro-sleep and fatigue in drivers, triggering loud proactive alerts."
          />
          <FeatureCard 
            icon={<AlertCircle className="text-accent h-6 w-6" />}
            title="Panic Mode"
            description="Instantly notify family and emergency services with a single silent trigger."
          />
          <FeatureCard 
            icon={<Activity className="text-primary h-6 w-6" />}
            title="Accident Engine"
            description="Auto-detects crashes and falls using high-frequency on-device motion sensors."
          />
          <FeatureCard 
            icon={<QrCode className="text-accent h-6 w-6" />}
            title="Offline Medical ID"
            description="Helmet-scan QR code provides your vital medical data to first responders instantly."
          />
        </section>

        <footer className="text-center space-y-4 pt-8">
          <div className="flex justify-center gap-4 flex-wrap">
            {['Workers', 'Students', 'Seniors', 'Travelers'].map(tag => (
              <span key={tag} className="text-[10px] font-bold text-muted-foreground uppercase border border-border/40 px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Proactive safety infrastructure built for the diversity of India's mobility.
          </p>
          <Link href="/reports" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline block">
            View Regional Safety Heatmaps
          </Link>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-3xl bg-card/40 border border-border/40 backdrop-blur-sm space-y-3 hover:bg-card/60 transition-colors group">
      <div className="bg-background/60 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-headline">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
