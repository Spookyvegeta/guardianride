"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { useFirestore, useAuth } from '@/firebase';
import { LiveIncident, IncidentStatus } from '@/lib/types';
import { Shield, LogOut, Phone, MapPin, Clock, CheckCircle, AlertTriangle, Loader2, RefreshCw, User, HeartPulse, QrCode, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS: Record<IncidentStatus, string> = {
  detected: 'bg-red-500/20 text-red-400 border-red-500/30',
  responding: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  false_alarm: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

const STATUS_LABELS: Record<IncidentStatus, string> = {
  detected: '🔴 Detected',
  responding: '🟡 Responding',
  resolved: '🟢 Resolved',
  false_alarm: '⚪ False Alarm',
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function IncidentCard({ incident, onUpdate }: { incident: LiveIncident; onUpdate: (id: string, status: IncidentStatus, note?: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(incident.responderNote ?? '');
  const isNew = incident.status === 'detected';

  return (
    <Card className={`border transition-all duration-300 ${isNew ? 'border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/10' : 'border-border/20 bg-card/30'}`}>
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isNew ? 'bg-red-500 animate-pulse' : 'bg-muted'}`}>
              <AlertTriangle className={`h-5 w-5 ${isNew ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base truncate">{incident.patientName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {timeAgo(incident.timestamp)}
                <span className="opacity-30 mx-1">·</span>
                {incident.type === 'panic' ? '🆘 Panic' : '💥 Crash'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-bold px-2 py-1 rounded-full border ${STATUS_COLORS[incident.status]}`}>
              {STATUS_LABELS[incident.status]}
            </span>
            <button onClick={() => setExpanded(e => !e)} className="p-1 rounded-lg hover:bg-muted transition-colors">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-2 gap-2">
          <a href={`tel:${incident.patientPhone}`}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-background/40 border border-border/10 hover:bg-blue-500/10 hover:border-blue-500/20 transition-colors">
            <Phone className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-xs font-semibold truncate">{incident.patientPhone}</span>
          </a>
          <a href={incident.locationLink} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 p-2.5 rounded-xl bg-background/40 border border-border/10 hover:bg-primary/10 hover:border-primary/20 transition-colors">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs font-semibold">View Location</span>
          </a>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="space-y-3 pt-1 border-t border-border/10">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-background/40 rounded-xl border border-border/10">
                <p className="text-muted-foreground uppercase tracking-widest text-[9px] font-bold mb-1">Blood Group</p>
                <p className="font-black text-primary text-lg">{incident.bloodGroup}</p>
              </div>
              <div className="p-3 bg-background/40 rounded-xl border border-border/10">
                <p className="text-muted-foreground uppercase tracking-widest text-[9px] font-bold mb-1">Conditions</p>
                <p className="font-semibold">{incident.medicalConditions || 'None'}</p>
              </div>
            </div>

            <div className="p-3 bg-background/40 rounded-xl border border-border/10">
              <p className="text-muted-foreground uppercase tracking-widest text-[9px] font-bold mb-1">Emergency Contact</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{incident.emergencyContact.name}</p>
                <a href={`tel:${incident.emergencyContact.phone}`}
                  className="flex items-center gap-1 text-xs text-blue-400 font-bold hover:underline">
                  <Phone className="h-3 w-3" /> {incident.emergencyContact.phone}
                </a>
              </div>
            </div>

            <a href={incident.qrUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-background/40 rounded-xl border border-border/10 hover:bg-primary/10 transition-colors">
              <QrCode className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold">View Medical QR</p>
                <p className="text-[10px] text-muted-foreground">Share with treating doctor</p>
              </div>
            </a>

            <div className="space-y-2">
              <Input
                placeholder="Add responder note (optional)..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="text-sm h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {incident.status !== 'responding' && incident.status !== 'resolved' && (
                <Button size="sm" className="h-9 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-xs font-bold"
                  onClick={() => onUpdate(incident.id, 'responding', note)}>
                  Accept & Respond
                </Button>
              )}
              {incident.status !== 'resolved' && (
                <Button size="sm" className="h-9 rounded-xl bg-green-600 hover:bg-green-700 text-xs font-bold"
                  onClick={() => onUpdate(incident.id, 'resolved', note)}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark Resolved
                </Button>
              )}
              {incident.status !== 'false_alarm' && incident.status !== 'resolved' && (
                <Button size="sm" variant="outline" className="h-9 rounded-xl text-xs"
                  onClick={() => onUpdate(incident.id, 'false_alarm', note)}>
                  False Alarm
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResponderDashboard() {
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [incidents, setIncidents] = useState<LiveIncident[]>([]);
  const [filter, setFilter] = useState<IncidentStatus | 'all'>('all');
  const [incidentsLoading, setIncidentsLoading] = useState(false);

  const firestore = useFirestore();
  const auth = useAuth();

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthed(!!user);
      setAuthLoading(false);
    });
    return () => unsub();
  }, [auth]);

  // Live incidents subscription
  useEffect(() => {
    if (!authed || !firestore) return;
    setIncidentsLoading(true);
    const q = query(collection(firestore, 'incidents'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as LiveIncident));
      setIncidents(data);
      setIncidentsLoading(false);
    }, () => setIncidentsLoading(false));
    return () => unsub();
  }, [authed, firestore]);

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setLoginError(e.message ?? 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleUpdate = async (id: string, status: IncidentStatus, note?: string) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'incidents', id), {
      status,
      responderNote: note ?? '',
      ...(status === 'resolved' ? { resolvedAt: new Date().toISOString() } : {}),
    });
  };

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.status === filter);
  const counts = {
    all: incidents.length,
    detected: incidents.filter(i => i.status === 'detected').length,
    responding: incidents.filter(i => i.status === 'responding').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    false_alarm: incidents.filter(i => i.status === 'false_alarm').length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Login screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-red-600 p-1.5 rounded-lg">
            <Shield className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold">SafeSignal Responder</span>
        </div>
        <Card className="w-full max-w-sm bg-card/40 border-border/20">
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-1 mb-2">
              <h2 className="text-xl font-bold">Responder Login</h2>
              <p className="text-sm text-muted-foreground">Hospital / Emergency staff only</p>
            </div>
            <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            {loginError && <p className="text-xs text-destructive">{loginError}</p>}
            <Button className="w-full h-12 font-bold rounded-xl" onClick={handleLogin} disabled={loginLoading}>
              {loginLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Sign In
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Use your SafeSignal responder account credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/20 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-1.5 rounded-lg">
              <Shield className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm">Responder Dashboard</h1>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                Live · {counts.detected} active
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"
            onClick={() => signOut(auth)}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {([['all', 'All', 'text-foreground'], ['detected', 'Active', 'text-red-400'], ['responding', 'Responding', 'text-yellow-400'], ['resolved', 'Resolved', 'text-green-400']] as const).map(([key, label, color]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`p-3 rounded-2xl border text-center transition-all ${filter === key ? 'bg-card border-primary/40' : 'bg-card/20 border-border/10 hover:bg-card/40'}`}>
              <p className={`text-xl font-black ${color}`}>{counts[key]}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">{label}</p>
            </button>
          ))}
        </div>

        {/* Incidents */}
        {incidentsLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading incidents...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto opacity-50" />
            <p className="text-muted-foreground font-medium">No incidents</p>
            <p className="text-xs text-muted-foreground">New SOS alerts will appear here in real-time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(incident => (
              <IncidentCard key={incident.id} incident={incident} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
