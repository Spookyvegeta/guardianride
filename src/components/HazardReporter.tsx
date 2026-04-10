"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, AlertTriangle, Lightbulb, Construction, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HAZARD_TYPES = [
  { id: 'pothole', label: 'Pothole', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'lighting', label: 'Dark Spot', icon: <Lightbulb className="h-4 w-4" /> },
  { id: 'construction', label: 'Work Zone', icon: <Construction className="h-4 w-4" /> },
];

export function HazardReporter() {
  const [isReporting, setIsReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const { toast } = useToast();

  const handleReport = (type: string) => {
    setReported(true);
    toast({
      title: "Hazard Logged",
      description: `Your report for a ${type} has been added to the regional safety map.`,
    });
    setTimeout(() => {
      setReported(false);
      setIsReporting(false);
    }, 2000);
  };

  return (
    <Card className="bg-accent/5 border-accent/20">
      {!isReporting ? (
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-2 rounded-xl text-accent">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Community Shield</p>
              <p className="text-xs text-muted-foreground">Report local road hazards</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="rounded-full border-accent/40 text-accent" onClick={() => setIsReporting(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Report
          </Button>
        </CardContent>
      ) : (
        <CardContent className="p-4 space-y-4 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold">What's the hazard?</p>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsReporting(false)}>×</Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {HAZARD_TYPES.map(type => (
              <Button
                key={type.id}
                variant="outline"
                className={`flex-col h-auto py-3 gap-2 rounded-xl border-accent/20 hover:bg-accent/10 ${reported ? 'opacity-50' : ''}`}
                disabled={reported}
                onClick={() => handleReport(type.label)}
              >
                {reported ? <Check className="h-4 w-4 text-green-500" /> : type.icon}
                <span className="text-[10px] font-bold uppercase">{type.label}</span>
              </Button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center italic">
            Reports are verified by AI & crowd consensus.
          </p>
        </CardContent>
      )}
    </Card>
  );
}
