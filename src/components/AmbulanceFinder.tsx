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
    <Card className="border-border/40 bg-card/30 backdrop-blur-md transition-all duration-500 hover:shadow-lg hover:shadow-red-500/5 animate-in fade-in slide-in-from-bottom duration-500">
      <CardContent className="p-4 md:p-6 space-y-4 md:space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-500 transition-all duration-300 hover:scale-110">
            <Ambulance className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg">Emergency Assistance</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Find nearby help using your location</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <Button
            className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-red-600 hover:bg-red-700 font-bold gap-2 text-xs md:text-sm w-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30"
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
            className="h-12 md:h-14 rounded-xl md:rounded-2xl font-bold gap-2 text-xs md:text-sm border-red-500/30 text-red-400 hover:bg-red-500/10 w-full transition-all duration-300 hover:scale-105 active:scale-95"
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
          <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 md:mb-3">Quick Dial</p>
          <div className="grid grid-cols-4 gap-2">
            {EMERGENCY_NUMBERS.map(({ label, number, color }) => (
              <a
                key={number}
                href={`tel:${number}`}
                className="flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 rounded-xl md:rounded-2xl bg-background/40 border border-border/10 hover:bg-background/60 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className={`${color} w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-lg`}>
                  <Phone className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
                </div>
                <span className="text-xs md:text-sm font-bold">{number}</span>
                <span className="text-[8px] md:text-[9px] text-muted-foreground uppercase tracking-widest text-center leading-tight">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
