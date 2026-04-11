"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Shield, MapPin, QrCode, HeartPulse, ChevronRight, Activity, AlertCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      <header className="p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <Shield className="text-white h-4 w-4 md:h-5 md:w-5" />
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight font-headline">SafeSignal</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/onboarding">
            <Button variant="ghost" className="text-primary font-bold text-sm md:text-base">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" className="rounded-xl text-xs md:text-sm">Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 md:px-6 lg:px-8 pb-12 gap-8 md:gap-12 max-w-7xl mx-auto w-full">
        <section className="space-y-4 md:space-y-6 pt-4 md:pt-8 text-center lg:text-left">
          <div className="inline-block bg-primary/10 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-4">
            India's Universal Safety OS
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tighter font-headline">
            The safety net for <span className="text-primary underline decoration-primary/30">every</span> citizen.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
            From solo commuters and seniors to field agents and gig partners. SafeSignal monitors, protects, and alerts when you can't.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4 max-w-2xl mx-auto lg:mx-0">
            <Link href="/onboarding" className="flex-1">
              <Button size="lg" className="w-full h-12 md:h-14 text-base md:text-lg font-bold rounded-2xl group shadow-xl shadow-primary/20">
                Setup Your Safety Profile
                <ChevronRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button size="lg" variant="outline" className="w-full h-12 md:h-14 text-base md:text-lg font-bold rounded-2xl bg-card/30 backdrop-blur-sm">
                Safety Dashboard
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4 max-w-5xl mx-auto w-full">
          <Link href="/dashboard">
            <FeatureCard 
              icon={<Activity className="text-primary h-5 w-5 md:h-6 md:w-6" />}
              title="Accident Engine"
              description="Auto-detects crashes and falls using high-frequency on-device motion sensors."
              clickable
            />
          </Link>
          <Link href="/dashboard">
            <FeatureCard 
              icon={<AlertCircle className="text-accent h-5 w-5 md:h-6 md:w-6" />}
              title="Panic Mode"
              description="Instantly notify family and emergency services with a single silent trigger."
              clickable
            />
          </Link>
          <Link href="/dashboard">
            <FeatureCard 
              icon={<QrCode className="text-primary h-5 w-5 md:h-6 md:w-6" />}
              title="Offline Medical ID"
              description="Helmet-scan QR code provides your vital medical data to first responders instantly."
              clickable
            />
          </Link>
          <Link href="/reports">
            <FeatureCard 
              icon={<MapPin className="text-accent h-5 w-5 md:h-6 md:w-6" />}
              title="Safety Heatmap"
              description="View regional accident data and high-risk zones to plan safer routes."
              clickable
            />
          </Link>
        </section>

        <footer className="text-center space-y-4 pt-8 max-w-4xl mx-auto w-full">
          <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
            {['Workers', 'Students', 'Seniors', 'Travelers'].map(tag => (
              <span key={tag} className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase border border-border/40 px-2 md:px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto px-4">
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

function FeatureCard({ icon, title, description, clickable }: { icon: React.ReactNode, title: string, description: string, clickable?: boolean }) {
  return (
    <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl bg-card/40 border border-border/40 backdrop-blur-sm space-y-2 md:space-y-3 transition-all duration-300 group ${clickable ? 'hover:bg-card/60 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 active:scale-95 cursor-pointer' : 'hover:bg-card/60'}`}>
      <div className="bg-background/60 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-bold font-headline">{title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{description}</p>
      {clickable && (
        <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest pt-1 md:pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Explore <ChevronRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}
