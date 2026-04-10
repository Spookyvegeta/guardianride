"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Ambulance, MapPin, Phone, Loader2, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EMERGENCY_NUMBERS = [
  { label: 'Ambulance', number: '108', color: 'bg-red-500' },
  { label: 'Police', number: '100', color: 'bg-blue-500' },
  { label: 'Fire', number: '101', color: 'bg-orange-500' },
  { label: 'Disaster', number: '112', color: 'bg-purple-500' },
];

export function AmbulanceFinder() {
  const [loading, setLoading] = useState<'ambulance' | 'hospital' | null>(null);
  const { toast } = useToast();

  const findNearby = (type: 'ambulance' | 'hospital') => {
    setLoading(type);

    if (!navigator.geolocation) {
      // fallback without coords
      const query = type === 'ambulance' ? 'ambulance+service+near+me' : 'hospital+emergency+near+me';
      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
      setLoading(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Use Google Maps search with user's exact coordinates as the map center
        const query = type === 'ambulance'
          ? 'ambulance+service'
          : 'hospital+emergency';
        window.open(
          `https://www.google.com/maps/search/${query}/@${latitude},${longitude},15z`,
          '_blank'
        );
        setLoading(null);
      },
      (err) => {
        setLoading(null);
        toast({
          title: "Location access denied",
          description: "Please allow location access and try again.",
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Card className="border-border/40 bg-card/30 backdrop-blur-md">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-500">
            <Ambulance className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Emergency Assistance</h3>
            <p className="text-sm text-muted-foreground">Find nearby help using your location</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            className="h-14 rounded-2xl bg-red-600 hover:bg-red-700 font-bold gap-2 text-xs w-full"
            onClick={() => findNearby('ambulance')}
            disabled={loading !== null}
          >
            {loading === 'ambulance'
              ? <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              : <Navigation className="h-4 w-4 shrink-0" />}
            <span className="truncate">Nearest Ambulance</span>
          </Button>
          <Button
            variant="outline"
            className="h-14 rounded-2xl font-bold gap-2 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 w-full"
            onClick={() => findNearby('hospital')}
            disabled={loading !== null}
          >
            {loading === 'hospital'
              ? <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              : <MapPin className="h-4 w-4 shrink-0" />}
            <span className="truncate">Nearest Hospital</span>
          </Button>
        </div>

        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Quick Dial</p>
          <div className="grid grid-cols-4 gap-2">
            {EMERGENCY_NUMBERS.map(({ label, number, color }) => (
              <a
                key={number}
                href={`tel:${number}`}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-background/40 border border-border/10 hover:bg-background/60 transition-colors"
              >
                <div className={`${color} w-8 h-8 rounded-full flex items-center justify-center`}>
                  <Phone className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-bold">{number}</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
