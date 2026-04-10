
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WorkerProfile } from "@/lib/types";
import { Shield } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

export function QRCard({ profile }: { profile: WorkerProfile }) {
  // Construct a compact medical data string for the QR code
  // This allows first responders to see vital info even without an app/internet
  const medicalData = {
    name: profile.name,
    blood: profile.bloodGroup,
    cond: profile.medicalConditions || "None",
    contacts: profile.contacts.map(c => `${c.name}: ${c.phone}`).join(', ')
  };

  const qrValue = `SafeSignal Medical ID:
Name: ${medicalData.name}
Blood: ${medicalData.blood}
Conditions: ${medicalData.cond}
ICE: ${medicalData.contacts}`;

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader className="bg-primary/10 pb-4 text-center">
        <div className="mx-auto bg-primary w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-primary/20">
          <Shield className="text-white h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-headline">Medical Emergency Card</CardTitle>
        <CardDescription className="text-primary font-bold uppercase tracking-widest text-[10px]">GuardNet Security Protocol</CardDescription>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center gap-6">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-white p-5 rounded-xl shadow-inner border-4 border-white">
            <QRCodeSVG 
              value={qrValue} 
              size={200}
              level="H" // High error correction for scanned-from-helmet scenarios
              includeMargin={false}
              imageSettings={{
                src: "https://picsum.photos/seed/safe/100/100",
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
        </div>
        
        <div className="w-full space-y-3 text-sm">
          <div className="flex justify-between border-b border-border/50 pb-1">
            <span className="text-muted-foreground font-medium">Full Name</span>
            <span className="font-bold">{profile.name}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-1">
            <span className="text-muted-foreground font-medium">Blood Group</span>
            <span className="font-black text-primary text-base">{profile.bloodGroup}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-1">
            <span className="text-muted-foreground font-medium">ICE Contacts</span>
            <span className="font-bold">{profile.contacts.length} Active</span>
          </div>
        </div>
        
        <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 w-full text-center">
          <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
            "Stick this QR on your helmet or phone back. First responders can scan this to view your critical medical data instantly, even offline."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
