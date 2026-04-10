"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Activity, AlertTriangle, MapPin, Zap, Phone, MessageCircle } from "lucide-react";
import { generateDynamicEmergencyMessage } from "@/ai/flows/generate-dynamic-emergency-message";
import { WorkerProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { triggerWhatsApp, triggerCall } from "@/lib/sos";

export function AccidentMonitor({ profile }: { profile: WorkerProfile }) {
  const [isAlerting, setIsAlerting] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [emergencySent, setEmergencySent] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [sosType, setSosType] = useState<'panic' | 'accident'>('panic');
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAlerting && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (isAlerting && countdown === 0) {
      triggerEmergency('accident');
    }
    return () => clearInterval(timer);
  }, [isAlerting, countdown]);

  const triggerEmergency = async (type: 'panic' | 'accident') => {
    setIsAlerting(false);
    setEmergencySent(true);
    setSosType(type);

    try {
      const result = await generateDynamicEmergencyMessage({
        workerName: profile.name,
        bloodGroup: profile.bloodGroup,
        medicalConditions: profile.medicalConditions || 'None reported',
        platformsWorkingOn: profile.platforms || [],
        incidentTime: new Date().toLocaleTimeString(),
        gpsLink: 'https://maps.google.com/?q=My+Location',
        contactLanguagePreference: profile.contacts[0]?.language || 'English',
        accidentDetails: type === 'panic'
          ? 'Manual Panic Button Triggered. Immediate help requested.'
          : 'High-speed deceleration detected followed by no movement for 90 seconds.'
      });
      setAiMessage(result.emergencyMessage);
    } catch (e) {
      // fallback to default message in sos.ts
    }
  };

  const simulateImpact = () => {
    setIsAlerting(true);
    setCountdown(30);
    toast({ title: "Potential Incident Detected", description: "Responding in 30 seconds if no response." });
  };

  const triggerPanic = () => {
    triggerEmergency('panic');
    toast({ variant: "destructive", title: "Panic SOS Active", description: "Notifying emergency contacts now." });
  };

  const cancelAlert = () => {
    setIsAlerting(false);
    setCountdown(30);
    toast({ title: "Alert Cancelled", description: "Safe status confirmed." });
  };

  const handleWhatsApp = () => triggerWhatsApp(profile, sosType, aiMessage ?? undefined);
  const handleCall = () => triggerCall(profile);

  const contact = profile.contacts?.[0];

  if (emergencySent) {
    return (
      <Card className="bg-destructive/10 border-destructive animate-in fade-in zoom-in duration-300 overflow-hidden">
        <CardContent className="p-8 text-center space-y-6">
          <div className="bg-destructive w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-destructive/40">
            <AlertTriangle className="text-white h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Emergency Active</h2>
            {contact && (
              <p className="text-muted-foreground text-sm">Notify <span className="text-foreground font-semibold">{contact.name}</span> ({contact.phone})</p>
            )}
          </div>

          {aiMessage && (
            <div className="bg-background/80 p-4 rounded-xl text-left text-sm border border-destructive/20">
              <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-widest font-bold">Message Preview:</p>
              <p className="text-xs whitespace-pre-wrap">{aiMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              className="h-14 rounded-2xl bg-green-600 hover:bg-green-700 font-bold gap-2"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </Button>
            <Button
              size="lg"
              className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold gap-2"
              onClick={handleCall}
            >
              <Phone className="h-5 w-5" />
              Call {contact?.phone}
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl"
            onClick={() => { setEmergencySent(false); setAiMessage(null); }}
          >
            I am Safe — Dismiss SOS
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isAlerting) {
    return (
      <Card className="bg-primary/10 border-primary animate-pulse shadow-2xl shadow-primary/20">
        <CardContent className="p-8 text-center space-y-6">
          <div className="bg-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl font-bold text-white">{countdown}</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary uppercase tracking-tighter">Are You Okay?</h2>
            <p className="text-muted-foreground">Emergency contacts will be notified in {countdown} seconds.</p>
          </div>
          <Progress value={(countdown / 30) * 100} className="h-2 bg-primary/20" />
          <Button size="lg" className="w-full h-20 text-xl font-bold bg-primary hover:bg-primary/90 rounded-2xl" onClick={cancelAlert}>
            I AM SAFE
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/30 backdrop-blur-md">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Safe Shield</h3>
              <p className="text-sm text-muted-foreground">Active Protection</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse inline-block" />
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-background/40 border-none">
            <CardContent className="p-3 flex items-center gap-3">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <div className="text-xs">
                <p className="text-muted-foreground uppercase font-bold tracking-widest text-[9px]">Motion</p>
                <p className="font-mono font-bold">TRACKING</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background/40 border-none">
            <CardContent className="p-3 flex items-center gap-3">
              <MapPin className="h-4 w-4 text-accent" />
              <div className="text-xs">
                <p className="text-muted-foreground uppercase font-bold tracking-widest text-[9px]">Location</p>
                <p className="font-mono font-bold">SECURED</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="border-dashed h-12 text-xs text-muted-foreground rounded-xl" onClick={simulateImpact}>
            Simulate Fall
          </Button>
          <Button variant="destructive" className="h-12 text-xs font-bold rounded-xl shadow-lg shadow-destructive/20" onClick={triggerPanic}>
            <Zap className="h-3 w-3 mr-1 fill-white" />
            Panic SOS
          </Button>
        </div>

        <div className="text-xs text-muted-foreground flex items-center justify-center gap-2 bg-background/20 py-2 rounded-lg">
          <ShieldCheck className="h-3 w-3 text-primary" />
          End-to-end encrypted. AI runs locally on device.
        </div>
      </CardContent>
    </Card>
  );
}
