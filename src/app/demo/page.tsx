"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Shield, Zap, AlertTriangle, Phone, MessageCircle, Play, RotateCcw, ChevronRight } from "lucide-react";
import Link from 'next/link';
import { flashlightBurst, stopFlashlight } from '@/lib/flashlight';

type DemoState = 'idle' | 'impact' | 'verifying' | 'triggered';

function createAlarmSound(): () => void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    let stopped = false;
    const play = () => {
      if (stopped) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
      if (!stopped) setTimeout(play, 500);
    };
    play();
    return () => { stopped = true; ctx.close(); };
  } catch { return () => {}; }
}

const SCENARIOS = [
  { id: 'high', label: 'High-Speed Crash', desc: 'Impact >10G at 80km/h', countdown: 5, color: 'bg-red-600', urgency: 'CRITICAL' },
  { id: 'mid', label: 'Moderate Crash', desc: 'Impact ~7G at 40km/h', countdown: 8, color: 'bg-orange-500', urgency: 'SEVERE' },
  { id: 'low', label: 'Low-Speed Impact', desc: 'Impact ~5G at 20km/h', countdown: 15, color: 'bg-yellow-500', urgency: 'DETECTED' },
];

export default function DemoPage() {
  const [state, setState] = useState<DemoState>('idle');
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [countdown, setCountdown] = useState(5);
  const [flash, setFlash] = useState(false);
  const stopAlarmRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state === 'verifying' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (state === 'verifying' && countdown === 0) {
      stopAlarmRef.current?.();
      setState('triggered');
      // Demo: show auto-sent indicator (real app sends WhatsApp + call here)
    }
    return () => clearInterval(timer);
  }, [state, countdown]);

  useEffect(() => {
    return () => stopAlarmRef.current?.();
  }, []);

  const runDemo = (s: typeof SCENARIOS[0]) => {
    setScenario(s);
    setState('impact');
    setFlash(true);
    stopAlarmRef.current = createAlarmSound();

    // Flash screen + flashlight simultaneously
    flashlightBurst(8, 250);

    setTimeout(() => setFlash(false), 300);
    setTimeout(() => setFlash(true), 600);
    setTimeout(() => setFlash(false), 900);

    setTimeout(() => {
      setCountdown(s.countdown);
      setState('verifying');
    }, 2000);
  };

  const reset = () => {
    stopAlarmRef.current?.();
    stopFlashlight();
    setState('idle');
    setFlash(false);
  };

  // ── PHASE 1: Impact flash ──
  if (state === 'impact') {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-100 ${flash ? 'bg-yellow-400' : 'bg-yellow-500'}`}>
        <div className="text-black text-center space-y-6 p-8 animate-in zoom-in duration-200">
          <Zap className="h-24 w-24 mx-auto animate-bounce" />
          <h1 className="text-5xl font-black uppercase tracking-tight">IMPACT!</h1>
          <p className="text-xl font-bold opacity-70">Analyzing crash severity...</p>
          <div className="flex gap-2 justify-center">
            {[0,1,2].map(i => (
              <div key={i} className="h-2 w-2 rounded-full bg-black animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE 2: Countdown ──
  if (state === 'verifying') {
    const circumference = 2 * Math.PI * 54;
    return (
      <div className="fixed inset-0 z-50 bg-[#1a1a1a] flex flex-col text-white" style={{ fontFamily: 'system-ui, sans-serif' }}>
        <div className="flex-1 flex flex-col justify-center px-8 pt-16 space-y-10">
          <div className="space-y-2">
            <h1 className="text-[2rem] font-semibold leading-tight">Car crash detected</h1>
            <p className="text-zinc-400 text-base leading-snug">
              Calling emergency contacts and sharing location in
            </p>
            <p className="text-xs text-zinc-500">{scenario.desc}</p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="relative w-52 h-52">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#2a2a2a" strokeWidth="5" />
                <circle cx="60" cy="60" r="54" fill="none"
                  stroke="#e05c4b" strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - countdown / scenario.countdown)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl font-light tabular-nums">{countdown}</span>
              </div>
            </div>
            <div className="flex items-end gap-1 h-6">
              {[3,5,7,5,3].map((h, i) => (
                <div key={i} className="w-1 rounded-full bg-[#e05c4b] animate-pulse"
                  style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-12 space-y-3">
          <button onClick={reset}
            className="w-full h-16 rounded-full bg-[#2a2a2a] flex items-center gap-4 px-4 hover:bg-[#333] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#4caf50] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-white text-lg font-normal">I'm OK</span>
          </button>
          <button onClick={() => { stopAlarmRef.current?.(); setState('triggered'); }}
            className="w-full h-16 rounded-full bg-[#2a2a2a] flex items-center gap-4 px-4 hover:bg-[#333] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#e05c4b] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-lg font-normal">Call emergency &amp; notify contacts</span>
          </button>
        </div>
      </div>
    );
  }

  // ── PHASE 3: SOS Triggered ──
  if (state === 'triggered') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 text-white">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mx-auto shadow-2xl shadow-red-600/50 animate-pulse">
            <Phone className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black">Emergency SOS Sent</h1>
            <p className="text-zinc-400 text-sm">Notifying emergency contact · Sending location</p>
            <p className="text-xs text-green-400 flex items-center justify-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Location updates every 45s
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-left space-y-2">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Demo Message Sent:</p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              🚨 <span className="font-bold text-white">EMERGENCY ALERT</span>{'\n\n'}
              Demo User needs immediate help!{'\n'}
              ⏰ {new Date().toLocaleTimeString()}{'\n'}
              🩸 Blood Group: O+{'\n'}
              📍 Location: [GPS coordinates]{'\n\n'}
              ⚠️ {scenario.desc}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="h-14 rounded-2xl bg-green-600/20 border border-green-500/30 flex items-center justify-center gap-2 text-green-400 font-bold text-sm">
              <MessageCircle className="h-5 w-5" /> WhatsApp ✓
            </div>
            <div className="h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center gap-2 text-blue-400 font-bold text-sm">
              <Phone className="h-5 w-5" /> Calling ✓
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[['108','Ambulance','red'],['100','Police','blue'],['112','Emergency','orange']].map(([num, label, color]) => (
              <div key={num} className={`flex flex-col items-center gap-1 p-3 rounded-2xl bg-${color}-600/20 border border-${color}-500/30`}>
                <span className={`text-lg font-black text-${color}-400`}>{num}</span>
                <span className={`text-[9px] text-${color}-400/70 uppercase tracking-widest`}>{label}</span>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full h-12 rounded-2xl border-zinc-700 text-zinc-300" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" /> Run Demo Again
          </Button>
        </div>
      </div>
    );
  }

  // ── IDLE: scenario picker ──
  return (
    <div className="min-h-screen bg-mesh flex flex-col p-6 max-w-lg mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Shield className="text-primary h-6 w-6" />
          <span className="font-bold">SafeSignal</span>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-muted-foreground">Dashboard</Button>
        </Link>
      </header>

      <div className="flex-1 space-y-8">
        <div className="space-y-2">
          <div className="inline-block bg-primary/10 px-3 py-1 rounded-full text-primary text-xs font-bold uppercase tracking-widest">
            Prototype Demo
          </div>
          <h1 className="text-4xl font-black font-headline leading-tight">SOS System<br />Demo</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Simulate a crash detection event to see the full adaptive SOS response system in action.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Choose a scenario</p>
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => runDemo(s)}
              className="w-full p-5 rounded-2xl bg-card/40 border border-border/30 hover:border-primary/40 hover:bg-card/60 transition-all text-left group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`${s.color} w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                  <p className="text-xs text-primary font-bold mt-0.5">SOS in {s.countdown}s</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>
          ))}
        </div>

        <div className="bg-card/20 border border-border/20 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">What you'll see</p>
          {[
            ['⚡', 'Phase 1 (0–2s)', 'Yellow flash screen + alarm sound'],
            ['⏱️', 'Phase 2 (adaptive)', 'Countdown based on crash severity'],
            ['🚨', 'Phase 3 (SOS)', 'WhatsApp + Call + emergency numbers'],
            ['📍', 'Phase 4 (ongoing)', 'Location updates every 45 seconds'],
          ].map(([icon, phase, desc]) => (
            <div key={phase} className="flex items-start gap-3">
              <span className="text-lg">{icon}</span>
              <div>
                <p className="text-sm font-bold">{phase}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Link href="/dashboard" className="block">
          <Button variant="outline" className="w-full h-12 rounded-2xl gap-2">
            Back to Dashboard <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
