"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, Zap, Phone, MessageCircle, Square, Play, RotateCcw, Wind, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, ComposedChart, CartesianGrid, YAxis, Area, Line } from 'recharts';
import { WorkerProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { triggerWhatsApp, triggerCall } from "@/lib/sos";
import { generateDynamicEmergencyMessage } from "@/ai/flows/generate-dynamic-emergency-message";
import { flashlightBurst, stopFlashlight } from "@/lib/flashlight";

// --- Sensor constants ---
const ALPHA = 0.15;
const NOISE_FLOOR_LIN = 0.15;
const NOISE_FLOOR_GYRO = 8.0;
const IMPACT_THRESHOLD_LIN = 5.8;
const IMPACT_THRESHOLD_TOTAL = 8.0;
const STILLNESS_THRESHOLD = 0.40;

// --- Adaptive countdown logic ---
// Returns countdown seconds based on impact severity + post-impact stillness
function getAdaptiveCountdown(impactForce: number, speed: number, avgStillness: number): number {
  const highImpact = impactForce > 10;
  const highSpeed = speed > 50; // km/h
  const noMovement = avgStillness < 0.1;
  if (highImpact && (highSpeed || noMovement)) return 5;  // critical — fast SOS
  if (highImpact || noMovement) return 8;                  // serious
  return 15;                                               // low-speed / some movement
}

type DetectionState = 'IDLE' | 'IMPACT_DETECTED' | 'VERIFYING' | 'TRIGGERED';

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
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
      if (!stopped) setTimeout(play, 500);
    };
    play();
    return () => { stopped = true; ctx.close(); };
  } catch { return () => {}; }
}

export function AccidentMonitor({ profile }: { profile: WorkerProfile }) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [detectionState, setDetectionState] = useState<DetectionState>('IDLE');
  const [countdown, setCountdown] = useState(15);
  const [maxCountdown, setMaxCountdown] = useState(15);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [currentSensors, setCurrentSensors] = useState({ acc: 1.0, gyro: 0.0, linear: 0.0 });
  const [lastPrediction, setLastPrediction] = useState<{ type: string } | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [sosType, setSosType] = useState<'panic' | 'accident'>('accident');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [locationUpdates, setLocationUpdates] = useState(false);

  const lastImpactTime = useRef(0);
  const stillnessBuffer = useRef<number[]>([]);
  const filteredAcc = useRef(1.0);
  const filteredLin = useRef(0.0);
  const filteredGyro = useRef(0.0);
  const lastUiUpdate = useRef(0);
  const sensorHandlerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);
  const detectionStateRef = useRef<DetectionState>('IDLE');
  const stopAlarmRef = useRef<(() => void) | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeedRef = useRef(0);
  const { toast } = useToast();

  useEffect(() => { detectionStateRef.current = detectionState; }, [detectionState]);

  // Track speed via GPS
  useEffect(() => {
    if (!isMonitoring || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => { lastSpeedRef.current = ((pos.coords.speed ?? 0) * 3.6); }, // m/s → km/h
      () => {},
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [isMonitoring]);

  useEffect(() => {
    return () => {
      if (sensorHandlerRef.current) window.removeEventListener('devicemotion', sensorHandlerRef.current);
      stopAlarmRef.current?.();
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, []);

  // Countdown tick — auto-sends SOS when countdown hits 0
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (detectionState === 'VERIFYING') {
      if (countdown > 0) {
        timer = setInterval(() => setCountdown(c => c - 1), 1000);
      } else {
        stopAlarmRef.current?.();
        setDetectionState('TRIGGERED');
        startLocationUpdates();
        // Auto-send — no button press needed
        triggerWhatsApp(profile, 'accident', aiMessage ?? undefined);
        setTimeout(() => triggerCall(profile), 1500); // slight delay so WhatsApp opens first
      }
    }
    return () => clearInterval(timer);
  }, [detectionState, countdown]);

  // Periodic location updates after SOS triggered
  const startLocationUpdates = () => {
    setLocationUpdates(true);
    locationIntervalRef.current = setInterval(async () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        const link = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
        triggerWhatsApp(profile, 'accident', `📍 Location update: ${link}`);
      });
    }, 45000); // every 45 sec
  };

  const stopLocationUpdates = () => {
    setLocationUpdates(false);
    if (locationIntervalRef.current) { clearInterval(locationIntervalRef.current); locationIntervalRef.current = null; }
  };

  const getGpsLink = (): Promise<string> => new Promise((resolve) => {
    if (!navigator.geolocation) { resolve('https://maps.google.com'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(`https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`),
      () => resolve('https://maps.google.com'),
      { timeout: 5000, enableHighAccuracy: true }
    );
  });

  const generateAIMessage = useCallback(async (type: 'panic' | 'accident') => {
    try {
      const gpsLink = await getGpsLink();
      const result = await generateDynamicEmergencyMessage({
        workerName: profile.name, bloodGroup: profile.bloodGroup,
        medicalConditions: profile.medicalConditions || 'None',
        platformsWorkingOn: profile.platforms || [],
        incidentTime: new Date().toLocaleTimeString(),
        gpsLink,
        contactLanguagePreference: profile.contacts[0]?.language || 'English',
        accidentDetails: type === 'panic'
          ? 'Manual Panic Button Triggered.'
          : `Crash detected. Impact force high. Speed at impact: ~${Math.round(lastSpeedRef.current)} km/h.`,
      });
      setAiMessage(result.emergencyMessage);
    } catch (_) {}
  }, [profile]);

  const processPotentialCrash = useCallback((impactForce: number, rotationSpeed: number) => {
    setDetectionState('IMPACT_DETECTED');

    // Phase 1: 0–2 sec — immediate alarm + flash screen + flashlight
    stopAlarmRef.current = createAlarmSound();
    flashlightBurst(8, 250);

    setTimeout(() => {
      const avgStillness = stillnessBuffer.current.reduce((a, b) => a + b, 0) / (stillnessBuffer.current.length || 1);

      if (avgStillness < STILLNESS_THRESHOLD && rotationSpeed > 180) {
        // Phase 2: adaptive countdown
        const secs = getAdaptiveCountdown(impactForce, lastSpeedRef.current, avgStillness);
        setCountdown(secs);
        setMaxCountdown(secs);
        setDetectionState('VERIFYING');
        setSosType('accident');
        setLastPrediction({ type: `Crash confirmed — SOS in ${secs}s` });
        generateAIMessage('accident');
      } else {
        stopAlarmRef.current?.();
        setDetectionState('IDLE');
        setLastPrediction({ type: avgStillness >= STILLNESS_THRESHOLD ? 'Safe — no crash' : 'Minor movement' });
      }
      stillnessBuffer.current = [];
    }, 2000);
  }, [generateAIMessage]);

  const startMonitoring = useCallback(async () => {
    setPermissionError(null);
    const startListeners = () => {
      setIsMonitoring(true);
      const handleMotion = (event: DeviceMotionEvent) => {
        const acc = event.accelerationIncludingGravity;
        const lin = event.acceleration;
        const rot = event.rotationRate;
        if (!acc || !rot) return;

        let rawAcc = Math.sqrt((acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2) / 9.81;
        let rawLin = lin ? Math.sqrt((lin.x ?? 0) ** 2 + (lin.y ?? 0) ** 2 + (lin.z ?? 0) ** 2) / 9.81 : 0;
        let rawRot = Math.sqrt((rot.alpha ?? 0) ** 2 + (rot.beta ?? 0) ** 2 + (rot.gamma ?? 0) ** 2);

        if (rawLin < NOISE_FLOOR_LIN) rawLin = 0;
        if (rawRot < NOISE_FLOOR_GYRO) rawRot = 0;

        filteredAcc.current = ALPHA * rawAcc + (1 - ALPHA) * filteredAcc.current;
        filteredLin.current = ALPHA * rawLin + (1 - ALPHA) * filteredLin.current;
        filteredGyro.current = ALPHA * rawRot + (1 - ALPHA) * filteredGyro.current;

        const now = Date.now();
        if (now - lastUiUpdate.current > 70) {
          const dLin = filteredLin.current < 0.05 ? 0 : filteredLin.current;
          const dGyro = filteredGyro.current < 2 ? 0 : filteredGyro.current;
          setCurrentSensors({ acc: filteredAcc.current, gyro: dGyro, linear: dLin });
          setSensorData(prev => [...prev.slice(-49), { t: now, acc: filteredAcc.current, gyro: dGyro / 100, lin: dLin }]);
          lastUiUpdate.current = now;
        }

        if (detectionStateRef.current === 'IDLE' &&
          (filteredLin.current > IMPACT_THRESHOLD_LIN || filteredAcc.current > IMPACT_THRESHOLD_TOTAL)) {
          if (now - lastImpactTime.current > 4000) {
            lastImpactTime.current = now;
            processPotentialCrash(filteredLin.current, filteredGyro.current);
          }
        }
        if (detectionStateRef.current === 'IMPACT_DETECTED') {
          stillnessBuffer.current.push(filteredLin.current);
          if (stillnessBuffer.current.length > 30) stillnessBuffer.current.shift();
        }
      };
      sensorHandlerRef.current = handleMotion;
      window.addEventListener('devicemotion', handleMotion);
      toast({ title: "Crash Detection Active", description: "Adaptive SOS monitoring started." });
    };

    if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const res = await (DeviceMotionEvent as any).requestPermission();
        if (res === 'granted') startListeners();
        else setPermissionError("Motion permission denied. Enable in Settings > Safari.");
      } catch { setPermissionError("Sensors unavailable on this browser."); }
    } else { startListeners(); }
  }, [processPotentialCrash, toast]);

  const stopMonitoring = useCallback(() => {
    if (sensorHandlerRef.current) { window.removeEventListener('devicemotion', sensorHandlerRef.current); sensorHandlerRef.current = null; }
    stopAlarmRef.current?.();
    stopFlashlight();
    stopLocationUpdates();
    setIsMonitoring(false); setDetectionState('IDLE');
    setCurrentSensors({ acc: 1.0, gyro: 0.0, linear: 0.0 });
    setSensorData([]); setLastPrediction(null);
    toast({ title: "Crash Detection Stopped" });
  }, [toast]);

  const handleImSafe = () => {
    stopAlarmRef.current?.();
    stopLocationUpdates();
    setDetectionState('IDLE');
    setLastPrediction({ type: 'User confirmed safe ✓' });
    stillnessBuffer.current = [];
    toast({ title: "Glad you're safe!" });
  };

  const triggerPanic = async () => {
    setSosType('panic'); setDetectionState('TRIGGERED');
    stopAlarmRef.current = createAlarmSound();
    generateAIMessage('panic');
    startLocationUpdates();
    toast({ variant: "destructive", title: "Panic SOS Active" });
  };

  const contact = profile.contacts?.[0];

  // ── PHASE 1: Immediate impact flash (0–2s) ──
  if (detectionState === 'IMPACT_DETECTED') {
    return (
      <div className="fixed inset-0 z-50 bg-yellow-500 flex flex-col items-center justify-center animate-pulse">
        <div className="text-black text-center space-y-4 p-8">
          <Zap className="h-20 w-20 mx-auto" />
          <h1 className="text-4xl font-black uppercase">Impact Detected</h1>
          <p className="text-lg font-bold opacity-70">Analyzing crash severity...</p>
        </div>
      </div>
    );
  }

  // ── PHASE 2: Adaptive countdown ──
  if (detectionState === 'VERIFYING') {
    const circumference = 2 * Math.PI * 54;
    return (
      <div className="fixed inset-0 z-50 bg-[#1a1a1a] flex flex-col text-white" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Top content */}
        <div className="flex-1 flex flex-col justify-center px-8 pt-16 space-y-10">
          <div className="space-y-2">
            <h1 className="text-[2rem] font-semibold leading-tight">Car crash detected</h1>
            <p className="text-zinc-400 text-base leading-snug">
              Calling emergency contacts and sharing location in
            </p>
          </div>

          {/* Big circle timer */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-52 h-52">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#2a2a2a" strokeWidth="5" />
                <circle cx="60" cy="60" r="54" fill="none"
                  stroke="#e05c4b" strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - countdown / maxCountdown)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl font-light tabular-nums">{countdown}</span>
              </div>
            </div>

            {/* Sound wave icon */}
            <div className="flex items-end gap-1 h-6">
              {[3,5,7,5,3].map((h, i) => (
                <div key={i} className="w-1 rounded-full bg-[#e05c4b] animate-pulse"
                  style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom buttons — pill style */}
        <div className="px-6 pb-12 space-y-3">
          <button
            onClick={handleImSafe}
            className="w-full h-16 rounded-full bg-[#2a2a2a] flex items-center gap-4 px-4 hover:bg-[#333] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#4caf50] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-white text-lg font-normal">I'm OK</span>
          </button>

          <button
            onClick={() => { stopAlarmRef.current?.(); setDetectionState('TRIGGERED'); startLocationUpdates(); triggerWhatsApp(profile, 'accident', aiMessage ?? undefined); setTimeout(() => triggerCall(profile), 1500); }}
            className="w-full h-16 rounded-full bg-[#2a2a2a] flex items-center gap-4 px-4 hover:bg-[#333] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#e05c4b] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-lg font-normal">Call emergency &amp; notify contacts</span>
          </button>
        </div>
      </div>
    );
  }

  // ── PHASE 3: SOS Triggered + location updates ──
  if (detectionState === 'TRIGGERED') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 text-white">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mx-auto shadow-2xl shadow-red-600/50">
            <Phone className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black">Emergency SOS Sent</h1>
            {contact && <p className="text-zinc-400 text-sm">Notified <span className="text-white font-semibold">{contact.name}</span> · {contact.phone}</p>}
            <p className="text-xs text-green-400">✓ Auto-sent when countdown reached zero</p>
            {locationUpdates && (
              <p className="text-xs text-green-400 flex items-center justify-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                Sending location updates every 45s
              </p>
            )}
          </div>

          {aiMessage && (
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-left max-h-40 overflow-y-auto">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Message:</p>
              <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">{aiMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button size="lg" className="h-14 rounded-2xl bg-green-600 hover:bg-green-700 font-bold gap-2"
              onClick={() => triggerWhatsApp(profile, sosType, aiMessage ?? undefined)}>
              <MessageCircle className="h-5 w-5" /> Resend WA
            </Button>
            <Button size="lg" className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold gap-2"
              onClick={() => triggerCall(profile)}>
              <Phone className="h-5 w-5" /> Call Again
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <a href="tel:108" className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-red-600/20 border border-red-500/30">
              <span className="text-lg font-black text-red-400">108</span>
              <span className="text-[9px] text-red-400/70 uppercase">Ambulance</span>
            </a>
            <a href="tel:100" className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30">
              <span className="text-lg font-black text-blue-400">100</span>
              <span className="text-[9px] text-blue-400/70 uppercase">Police</span>
            </a>
            <a href="tel:112" className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-orange-600/20 border border-orange-500/30">
              <span className="text-lg font-black text-orange-400">112</span>
              <span className="text-[9px] text-orange-400/70 uppercase">Emergency</span>
            </a>
          </div>

          <Button variant="outline" className="w-full h-12 rounded-2xl border-zinc-700 text-zinc-300 hover:bg-zinc-900"
            onClick={() => { stopLocationUpdates(); setDetectionState('IDLE'); setAiMessage(null); }}>
            I am Safe — Dismiss
          </Button>
        </div>
      </div>
    );
  }

  // ── IDLE: main card ──
  return (
    <Card className="border-border/40 bg-card/30 backdrop-blur-md">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isMonitoring ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Crash Detection</h3>
              <p className="text-sm text-muted-foreground">Adaptive SOS · Sensor fusion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isMonitoring && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse inline-block" />}
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isMonitoring ? 'text-green-500' : 'text-muted-foreground'}`}>
              {isMonitoring ? 'Active' : 'Off'}
            </span>
          </div>
        </div>

        {permissionError && <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl">{permissionError}</p>}

        {isMonitoring && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/40 rounded-2xl p-3 border border-border/10">
                <div className="flex items-center gap-2 mb-1">
                  <Wind className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Linear G</span>
                </div>
                <p className="text-2xl font-black text-primary tabular-nums">{currentSensors.linear.toFixed(2)}</p>
                <div className="w-full bg-muted h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: `${Math.min(currentSensors.linear * 15, 100)}%` }} />
                </div>
              </div>
              <div className="bg-background/40 rounded-2xl p-3 border border-border/10">
                <div className="flex items-center gap-2 mb-1">
                  <RotateCcw className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Gyro °/s</span>
                </div>
                <p className="text-2xl font-black text-accent tabular-nums">{currentSensors.gyro.toFixed(0)}</p>
                <div className="w-full bg-muted h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-accent h-full transition-all duration-300" style={{ width: `${Math.min(currentSensors.gyro / 4, 100)}%` }} />
                </div>
              </div>
            </div>
            {sensorData.length > 0 && (
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <YAxis domain={[0, 10]} hide />
                    <Area type="monotone" dataKey="acc" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.05} strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="lin" stroke="#ffffff80" strokeWidth={1.5} dot={false} strokeDasharray="4 4" isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          {!isMonitoring ? (
            <Button className="col-span-2 h-14 rounded-2xl font-bold gap-2 text-base shadow-lg shadow-primary/20" onClick={startMonitoring}>
              <Play className="h-4 w-4 fill-white" /> Start Detection
            </Button>
          ) : (
            <>
              <Button variant="outline" className="h-12 rounded-xl gap-2 text-sm border-destructive/30 text-destructive hover:bg-destructive/10" onClick={stopMonitoring}>
                <Square className="h-3.5 w-3.5 fill-destructive" /> Stop
              </Button>
              <Button variant="destructive" className="h-12 rounded-xl gap-2 text-sm font-bold shadow-lg shadow-destructive/20" onClick={triggerPanic}>
                <Zap className="h-3.5 w-3.5 fill-white" /> Panic SOS
              </Button>
            </>
          )}
        </div>

        {lastPrediction && (
          <div className="bg-background/40 border border-border/10 p-3 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-xs font-semibold">{lastPrediction.type}</p>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          Adaptive SOS · 5–15s based on impact severity · Location updates every 45s
        </p>
      </CardContent>
    </Card>
  );
}
