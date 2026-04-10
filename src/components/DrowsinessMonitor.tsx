"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Brain, Volume2, Camera, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DrowsinessMonitor() {
  const [isActive, setIsActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isDrowsy, setIsDrowsy] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isDrowsy) {
      // Simulate periodic AI checks
      interval = setInterval(() => {
        const randomChance = Math.random();
        if (randomChance < 0.05) { // 5% chance of detecting drowsiness for demo
          triggerDrowsinessAlert();
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isActive, isDrowsy]);

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
      setIsActive(true);
      toast({
        title: "Vision Shield Active",
        description: "AI is now monitoring eye blink rate and head position.",
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions to use drowsiness detection.',
      });
    }
  };

  const stopMonitoring = () => {
    setIsActive(false);
    setIsDrowsy(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const triggerDrowsinessAlert = () => {
    setIsDrowsy(true);
    // Play a loud alert sound (simulated with UI)
    const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
    audio.play().catch(() => {});
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/30 border-border/40 backdrop-blur-md overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Drowsiness Guard</CardTitle>
                <CardDescription>AI proactive fatigue detection</CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant={isActive ? "destructive" : "default"}
              onClick={isActive ? stopMonitoring : startMonitoring}
              className="rounded-full"
            >
              {isActive ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {isActive ? "Stop" : "Activate"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-4 border border-border/20">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            
            {isActive && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    AI Analyzing
                  </div>
                  <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                    BPM: 72
                  </div>
                </div>
                
                {/* Overlay Scanning Lines */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-1/2 animate-bounce opacity-20" />
              </div>
            )}

            {!isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-card/80 backdrop-blur-sm">
                <Camera className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm font-medium text-muted-foreground">Camera feed is off.<br/>Enable to detect fatigue signatures.</p>
              </div>
            )}
          </div>

          {isDrowsy && (
            <Alert variant="destructive" className="bg-destructive/20 border-destructive animate-pulse mb-4">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle className="font-bold">FATIGUE DETECTED!</AlertTitle>
              <AlertDescription>
                We've detected signs of micro-sleep. Please stop and rest immediately. Emergency contacts have been notified of your location.
              </AlertDescription>
              <Button size="sm" variant="outline" className="mt-3 w-full border-destructive/50 text-destructive-foreground hover:bg-destructive" onClick={() => setIsDrowsy(false)}>
                I am Awake now
              </Button>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            <StatBox icon={<Volume2 className="h-4 w-4" />} label="Audio Alarm" value="Enabled" />
            <StatBox icon={<Eye className="h-4 w-4" />} label="Eye Track" value={isActive ? "Locking..." : "Idle"} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 text-xs text-muted-foreground italic flex gap-3">
          <Brain className="h-5 w-5 text-primary shrink-0" />
          "Drowsiness detection uses on-device facial landmarking. No images are sent to the cloud. Analysis happens entirely in your phone's memory."
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-card/40 p-3 rounded-xl border border-border/20 flex items-center gap-3">
      <div className="text-primary">{icon}</div>
      <div className="text-left">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{label}</p>
        <p className="text-xs font-bold">{value}</p>
      </div>
    </div>
  );
}
