"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { generateSafetyReportInsights, GenerateSafetyReportInsightsOutput } from "@/ai/flows/generate-safety-report-insights";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shield, ChevronLeft, TrendingUp, Map as MapIcon, Calendar, Info } from "lucide-react";
import Link from 'next/link';

const DUMMY_HEATMAP_DATA = [
  { name: 'Koramangala', incidents: 42, color: 'hsl(var(--primary))' },
  { name: 'Indiranagar', incidents: 38, color: 'hsl(var(--accent))' },
  { name: 'Whitefield', incidents: 31, color: 'hsl(var(--primary))' },
  { name: 'HSR Layout', incidents: 25, color: 'hsl(var(--accent))' },
  { name: 'Majestic', incidents: 18, color: 'hsl(var(--primary))' },
];

export default function SafetyReports() {
  const [insights, setInsights] = useState<GenerateSafetyReportInsightsOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const res = await generateSafetyReportInsights({
          quarter: "Q1 2024",
          totalIncidents: 154,
          platformsWithHighestIncidents: ["Zomato", "Swiggy"],
          topIncidentLocations: [
            { locationName: "Koramangala 80ft Road", incidentCount: 12 },
            { locationName: "Sony World Signal", incidentCount: 9 },
            { locationName: "Marathahalli Bridge", incidentCount: 8 }
          ],
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
    loadInsights();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="p-6 border-b border-border/20 flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1 rounded-md">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold font-headline">Public Safety Index</h1>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto space-y-8">
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Calendar className="h-3 w-3" />
            Quarterly Data Report: Q1 2024
          </div>
          <h2 className="text-3xl font-extrabold tracking-tighter font-headline">City Accident Heatmap</h2>
          <p className="text-muted-foreground">Aggregated data from 15,000 active Guardians in Bengaluru.</p>
        </section>

        <Card className="bg-card/40 border-none">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapIcon className="h-5 w-5 text-accent" />
              Incidents by Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DUMMY_HEATMAP_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={100} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: 'none' }} 
                />
                <Bar dataKey="incidents" radius={[0, 10, 10, 0]}>
                  {DUMMY_HEATMAP_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-background border-border/40">
            <CardContent className="pt-6">
              <div className="text-4xl font-extrabold text-primary">154</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Incidents</div>
            </CardContent>
          </Card>
          <Card className="bg-background border-border/40">
            <CardContent className="pt-6">
              <div className="text-4xl font-extrabold text-accent">8.4m</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Confirmed Saves</div>
            </CardContent>
          </Card>
          <Card className="bg-background border-border/40">
            <CardContent className="pt-6">
              <div className="text-4xl font-extrabold text-primary">12%</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Response Redux</div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-headline flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              AI Safety Analysis
            </h3>
            <div className="bg-accent/10 text-accent px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Live Insights
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ) : insights ? (
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary text-sm uppercase tracking-widest font-bold">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed text-foreground/90 font-medium italic">
                    "{insights.summary}"
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card/20 border-border/20">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-widest font-bold text-accent">Key Observations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {insights.insights.map((insight, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                          <div className="bg-accent/20 h-5 w-5 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <Info className="h-3 w-3 text-accent" />
                          </div>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-card/20 border-border/20">
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-widest font-bold text-primary">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {insights.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                          <div className="bg-primary/20 h-5 w-5 rounded flex items-center justify-center shrink-0 mt-0.5">
                            <Shield className="h-3 w-3 text-primary" />
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
            <p className="text-center py-12 text-muted-foreground italic">Unable to load safety analysis at this time.</p>
          )}
        </section>

        <footer className="pt-12 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground">
            This data is anonymized to protect individual worker privacy while providing actionable intelligence for municipal safety.
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <span className="text-[10px] font-bold text-muted-foreground uppercase hover:text-primary transition-colors cursor-pointer">Transparency Report</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase hover:text-primary transition-colors cursor-pointer">Data Privacy Policy</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase hover:text-primary transition-colors cursor-pointer">Municipal API</span>
          </div>
        </footer>
      </main>
    </div>
  );
}