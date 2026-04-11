"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { generateSafetyReportInsights, GenerateSafetyReportInsightsOutput } from "@/ai/flows/generate-safety-report-insights";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shield, ChevronLeft, TrendingUp, Map as MapIcon, Calendar, Info, MapPin, Loader2 } from "lucide-react";
import Link from 'next/link';

// City-specific heatmap data
const CITY_HEATMAPS: Record<string, { name: string; incidents: number; color: string }[]> = {
  'Bengaluru': [
    { name: 'Koramangala', incidents: 42, color: 'hsl(var(--primary))' },
    { name: 'Indiranagar', incidents: 38, color: 'hsl(var(--accent))' },
    { name: 'Whitefield', incidents: 31, color: 'hsl(var(--primary))' },
    { name: 'HSR Layout', incidents: 25, color: 'hsl(var(--accent))' },
    { name: 'Majestic', incidents: 18, color: 'hsl(var(--primary))' },
  ],
  'Mumbai': [
    { name: 'Andheri', incidents: 45, color: 'hsl(var(--primary))' },
    { name: 'Bandra', incidents: 39, color: 'hsl(var(--accent))' },
    { name: 'Powai', incidents: 33, color: 'hsl(var(--primary))' },
    { name: 'Dadar', incidents: 28, color: 'hsl(var(--accent))' },
    { name: 'Colaba', incidents: 22, color: 'hsl(var(--primary))' },
  ],
  'Delhi': [
    { name: 'Connaught Place', incidents: 48, color: 'hsl(var(--primary))' },
    { name: 'Dwarka', incidents: 41, color: 'hsl(var(--accent))' },
    { name: 'Rohini', incidents: 35, color: 'hsl(var(--primary))' },
    { name: 'Saket', incidents: 29, color: 'hsl(var(--accent))' },
    { name: 'Karol Bagh', incidents: 24, color: 'hsl(var(--primary))' },
  ],
  'Hyderabad': [
    { name: 'Hitech City', incidents: 40, color: 'hsl(var(--primary))' },
    { name: 'Gachibowli', incidents: 36, color: 'hsl(var(--accent))' },
    { name: 'Madhapur', incidents: 30, color: 'hsl(var(--primary))' },
    { name: 'Banjara Hills', incidents: 26, color: 'hsl(var(--accent))' },
    { name: 'Secunderabad', incidents: 20, color: 'hsl(var(--primary))' },
  ],
  'Default': [
    { name: 'Zone A', incidents: 35, color: 'hsl(var(--primary))' },
    { name: 'Zone B', incidents: 30, color: 'hsl(var(--accent))' },
    { name: 'Zone C', incidents: 25, color: 'hsl(var(--primary))' },
    { name: 'Zone D', incidents: 20, color: 'hsl(var(--accent))' },
    { name: 'Zone E', incidents: 15, color: 'hsl(var(--primary))' },
  ],
};

export default function SafetyReports() {
  const [insights, setInsights] = useState<GenerateSafetyReportInsightsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [userCity, setUserCity] = useState<string>('');
  const [heatmapData, setHeatmapData] = useState(CITY_HEATMAPS['Default']);

  useEffect(() => {
    // Get user's location and determine city
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Reverse geocode to get city name
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            
            // Extract city from address
            const city = data.address?.city || data.address?.town || data.address?.state_district || 'Unknown';
            setUserCity(city);
            
            // Set heatmap data based on city
            const cityKey = Object.keys(CITY_HEATMAPS).find(key => 
              city.toLowerCase().includes(key.toLowerCase())
            );
            setHeatmapData(CITY_HEATMAPS[cityKey || 'Default']);
          } catch (error) {
            console.error('Error getting city:', error);
            setUserCity('Your Area');
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error('Location error:', error);
          setUserCity('Your Area');
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserCity('Your Area');
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadInsights() {
      try {
        const totalIncidents = heatmapData.reduce((sum, item) => sum + item.incidents, 0);
        const topLocations = heatmapData.slice(0, 3).map(item => ({
          locationName: item.name,
          incidentCount: item.incidents
        }));

        const res = await generateSafetyReportInsights({
          quarter: "Q1 2024",
          totalIncidents,
          platformsWithHighestIncidents: ["Zomato", "Swiggy"],
          topIncidentLocations: topLocations,
          peakIncidentTimes: ["19:00 - 23:00"],
          commonWeatherConditions: ["Light Rain", "Foggy"],
          commonRoadTypes: ["Arterial Road", "Highway Overpass"]
        });
        setInsights(res);
      } catch (e) {
        console.error("Failed to load insights", e);
      } finally {
        setLoading(false);
      }
    }
    if (!locationLoading) {
      loadInsights();
    }
  }, [locationLoading, heatmapData]);

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="p-4 md:p-6 border-b border-border/20 flex items-center gap-3 md:gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-10 md:w-10">
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1 rounded-md">
            <Shield className="h-3 w-3 md:h-4 md:w-4 text-white" />
          </div>
          <h1 className="text-base md:text-xl font-bold font-headline">Public Safety Index</h1>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs uppercase tracking-widest">
            <Calendar className="h-3 w-3" />
            Quarterly Data Report: Q1 2024
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter font-headline">City Accident Heatmap</h2>
            {locationLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
          {locationLoading ? (
            <Skeleton className="h-5 w-64" />
          ) : (
            <p className="text-sm md:text-base text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              Showing data for <span className="font-bold text-foreground">{userCity}</span>
            </p>
          )}
        </section>

        {locationLoading ? (
          <Card className="bg-card/40 border-none">
            <CardContent className="h-64 md:h-80 w-full pt-4 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Getting your location...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/40 border-none animate-in fade-in slide-in-from-bottom duration-500">
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <MapIcon className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                Incidents by Zone - {userCity}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 md:h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmapData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#888" fontSize={11} width={80} className="md:text-xs" />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: 'none', fontSize: '12px' }} 
                  />
                  <Bar dataKey="incidents" radius={[0, 10, 10, 0]}>
                    {heatmapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <Card className="bg-background border-border/40">
            <CardContent className="pt-4 md:pt-6">
              <div className="text-3xl md:text-4xl font-extrabold text-primary">
                {locationLoading ? <Skeleton className="h-10 w-20" /> : heatmapData.reduce((sum, item) => sum + item.incidents, 0)}
              </div>
              <div className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Incidents</div>
            </CardContent>
          </Card>
          <Card className="bg-background border-border/40">
            <CardContent className="pt-4 md:pt-6">
              <div className="text-3xl md:text-4xl font-extrabold text-accent">8.4m</div>
              <div className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Confirmed Saves</div>
            </CardContent>
          </Card>
          <Card className="bg-background border-border/40">
            <CardContent className="pt-4 md:pt-6">
              <div className="text-3xl md:text-4xl font-extrabold text-primary">12%</div>
              <div className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Response Redux</div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="text-lg md:text-xl font-bold font-headline flex items-center gap-2">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              AI Safety Analysis
            </h3>
            <div className="bg-accent/10 text-accent px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
              Live Insights
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ) : insights ? (
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary text-xs md:text-sm uppercase tracking-widest font-bold">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base md:text-lg leading-relaxed text-foreground/90 font-medium italic">
                    "{insights.summary}"
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-card/20 border-border/20">
                  <CardHeader>
                    <CardTitle className="text-xs md:text-sm uppercase tracking-widest font-bold text-accent">Key Observations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 md:space-y-4">
                      {insights.insights.map((insight, i) => (
                        <li key={i} className="flex gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                          <div className="bg-accent/20 h-4 w-4 md:h-5 md:w-5 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <Info className="h-2.5 w-2.5 md:h-3 md:w-3 text-accent" />
                          </div>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-card/20 border-border/20">
                  <CardHeader>
                    <CardTitle className="text-xs md:text-sm uppercase tracking-widest font-bold text-primary">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 md:space-y-4">
                      {insights.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                          <div className="bg-primary/20 h-4 w-4 md:h-5 md:w-5 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <Shield className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary" />
                          </div>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <p className="text-center py-12 text-sm text-muted-foreground italic">Unable to load safety analysis at this time.</p>
          )}
        </section>

        <footer className="pt-8 md:pt-12 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground px-4">
            This data is anonymized to protect individual worker privacy while providing actionable intelligence for municipal safety.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mt-4 md:mt-6">
            <span className="text-[10px] font-bold text-muted-foreground uppercase hover:text-primary transition-colors cursor-pointer">Transparency Report</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase hover:text-primary transition-colors cursor-pointer">Data Privacy Policy</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase hover:text-primary transition-colors cursor-pointer">Municipal API</span>
          </div>
        </footer>
      </main>
    </div>
  );
}