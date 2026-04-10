
"use client"

import { WorkerProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin, HeartPulse, Shield, LogOut, ChevronRight, Bell, Lock } from "lucide-react";
import { useWorkerProfile } from "@/lib/store";
import { useRouter } from "next/navigation";

export function ProfileView({ profile }: { profile: WorkerProfile }) {
  const { clearProfile } = useWorkerProfile();
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <Card className="bg-card/30 border-border/20 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-accent/20" />
        <CardContent className="pt-0 relative -mt-10 px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-6">
            <div className="h-20 w-20 rounded-2xl bg-background border-4 border-card flex items-center justify-center shadow-xl">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center sm:text-left pb-1">
              <h3 className="text-2xl font-bold">{profile.name}</h3>
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">{profile.persona.replace('_', ' ')}</p>
            </div>
            <Button variant="outline" size="sm" className="sm:ml-auto rounded-xl">Edit Profile</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone} />
            <InfoItem icon={<MapPin className="h-4 w-4" />} label="Base" value={profile.homeArea} />
            <InfoItem icon={<HeartPulse className="h-4 w-4" />} label="Blood Group" value={profile.bloodGroup} highlight />
            <InfoItem icon={<Shield className="h-4 w-4" />} label="Safety OS" value="v2.4.0 Stable" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Settings & Security</h4>
        <MenuButton icon={<Bell className="h-5 w-5 text-accent" />} label="Notification Preferences" />
        <MenuButton icon={<Lock className="h-5 w-5 text-primary" />} label="Privacy & Data Encryption" />
        <MenuButton icon={<Shield className="h-5 w-5 text-green-500" />} label="Emergency Protocol Calibration" />
      </div>

      <div className="pt-6">
        <Button 
          variant="ghost" 
          className="w-full text-destructive hover:bg-destructive/10 rounded-2xl h-14 font-bold"
          onClick={async () => {
            if (confirm("Are you sure you want to sign out?")) {
              await clearProfile();
              router.replace('/login');
            }
          }}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, highlight }: { icon: React.ReactNode, label: string, value: string, highlight?: boolean }) {
  return (
    <div className="p-4 bg-background/40 rounded-2xl border border-border/10 flex items-center gap-4">
      <div className="p-2 rounded-xl bg-muted text-muted-foreground">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className={`font-bold ${highlight ? 'text-primary' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

function MenuButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="w-full p-4 bg-card/20 hover:bg-card/40 border border-border/10 rounded-2xl flex items-center justify-between transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-background/50">{icon}</div>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
    </button>
  );
}
