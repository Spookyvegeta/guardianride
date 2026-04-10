"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation, Copy, Share2, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Location {
  lat: number;
  lng: number;
  accuracy: number;
  address?: string;
}

export function LocationTracker() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Auto-fetch on mount
    fetchLocation();
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS not supported", variant: "destructive" });
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        };
        setLocation(loc);
        setLoading(false);
        // Reverse geocode using nominatim (free, no API key)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`
          );
          const data = await res.json();
          setLocation(l => l ? { ...l, address: data.display_name } : l);
        } catch (_) {}
      },
      () => {
        setLoading(false);
        toast({ title: "Location access denied", description: "Please allow location in browser settings.", variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const toggleWatch = () => {
    if (watching) {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setWatching(false);
      toast({ title: "Live tracking stopped" });
    } else {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation(l => ({
            ...( l ?? {}),
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          }));
        },
        () => {},
        { enableHighAccuracy: true }
      );
      setWatchId(id);
      setWatching(true);
      toast({ title: "Live tracking active", description: "Location updates in real-time." });
    }
  };

  const getMapsLink = () =>
    location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : '';

  const copyLocation = () => {
    if (!location) return;
    navigator.clipboard.writeText(getMapsLink());
    toast({ title: "Location copied", description: "Google Maps link copied to clipboard." });
  };

  const shareLocation = async () => {
    if (!location) return;
    const link = getMapsLink();
    if (navigator.share) {
      await navigator.share({ title: 'My Location', text: '📍 My current location', url: link });
    } else {
      navigator.clipboard.writeText(link);
      toast({ title: "Link copied", description: "Share this link with your contacts." });
    }
  };

  const openInMaps = () => {
    if (location) window.open(getMapsLink(), '_blank');
  };

  return (
    <Card className="border-border/40 bg-card/30 backdrop-blur-md">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/20 text-accent">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">GPS Location</h3>
              <p className="text-sm text-muted-foreground">Real-time positioning</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {watching && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse inline-block" />}
            <span className={`text-[10px] font-bold uppercase tracking-widest ${watching ? 'text-green-500' : 'text-muted-foreground'}`}>
              {watching ? 'Live' : 'Static'}
            </span>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-6 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Acquiring GPS signal...</span>
          </div>
        )}

        {location && !loading && (
          <div className="space-y-3">
            <div className="bg-background/50 rounded-2xl p-4 border border-border/10 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Latitude</span>
                <span className="font-mono font-bold">{location.lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Longitude</span>
                <span className="font-mono font-bold">{location.lng.toFixed(6)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-mono font-bold">±{location.accuracy}m</span>
              </div>
            </div>

            {location.address && (
              <div className="bg-background/50 rounded-2xl p-4 border border-border/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Address</p>
                <p className="text-xs leading-relaxed">{location.address}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl gap-2 text-sm"
            onClick={fetchLocation}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            className={`h-12 rounded-xl gap-2 text-sm font-bold ${watching ? 'bg-green-600 hover:bg-green-700' : ''}`}
            onClick={toggleWatch}
          >
            <Navigation className="h-4 w-4" />
            {watching ? 'Stop Live' : 'Live Track'}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="h-11 rounded-xl gap-1 text-xs" onClick={openInMaps} disabled={!location}>
            <MapPin className="h-3.5 w-3.5" />
            Maps
          </Button>
          <Button variant="outline" className="h-11 rounded-xl gap-1 text-xs" onClick={copyLocation} disabled={!location}>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
          <Button variant="outline" className="h-11 rounded-xl gap-1 text-xs" onClick={shareLocation} disabled={!location}>
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
