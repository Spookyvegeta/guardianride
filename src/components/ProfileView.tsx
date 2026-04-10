"use client"

import { useState } from "react";
import { WorkerProfile, BloodGroup } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, MapPin, HeartPulse, LogOut, Pencil, Check, X, AlertTriangle, Users } from "lucide-react";
import { useWorkerProfile } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const LANGUAGES = ["English", "Hindi", "Marathi", "Bengali", "Tamil", "Telugu", "Kannada"];

export function ProfileView({ profile }: { profile: WorkerProfile }) {
  const { saveProfile, clearProfile } = useWorkerProfile();
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...profile, contacts: [...(profile.contacts ?? [])] });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await saveProfile(form);
      toast({ title: "Profile updated" });
      setEditing(null);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setForm({ ...profile, contacts: [...(profile.contacts ?? [])] });
    setEditing(null);
  };

  const contact = form.contacts?.[0];

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-16 px-1">

      {/* Profile header */}
      <Card className="bg-card/30 border-border/20 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/20 to-accent/20" />
        <CardContent className="pt-0 relative -mt-10 px-5 pb-5">
          <div className="flex items-end gap-4 mb-5">
            <div className="h-20 w-20 rounded-2xl bg-background border-4 border-card flex items-center justify-center shadow-xl shrink-0">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="pb-1 min-w-0">
              <h3 className="text-xl font-bold truncate">{form.name}</h3>
              <p className="text-xs text-muted-foreground">{form.homeArea}</p>
            </div>
          </div>

          {/* Basic info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EditableField
              label="Full Name" value={form.name} icon={<User className="h-4 w-4" />}
              isEditing={editing === 'name'}
              onEdit={() => setEditing('name')}
              onCancel={cancel} onSave={save} saving={saving}
            >
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </EditableField>

            <EditableField
              label="Phone" value={form.phone} icon={<Phone className="h-4 w-4" />}
              isEditing={editing === 'phone'}
              onEdit={() => setEditing('phone')}
              onCancel={cancel} onSave={save} saving={saving}
            >
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </EditableField>

            <EditableField
              label="City / Area" value={form.homeArea} icon={<MapPin className="h-4 w-4" />}
              isEditing={editing === 'homeArea'}
              onEdit={() => setEditing('homeArea')}
              onCancel={cancel} onSave={save} saving={saving}
            >
              <Input value={form.homeArea} onChange={e => setForm(f => ({ ...f, homeArea: e.target.value }))} />
            </EditableField>

            <EditableField
              label="Blood Group" value={form.bloodGroup} icon={<HeartPulse className="h-4 w-4" />}
              isEditing={editing === 'bloodGroup'} highlight
              onEdit={() => setEditing('bloodGroup')}
              onCancel={cancel} onSave={save} saving={saving}
            >
              <Select value={form.bloodGroup} onValueChange={v => setForm(f => ({ ...f, bloodGroup: v as BloodGroup }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BLOOD_GROUPS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </EditableField>
          </div>
        </CardContent>
      </Card>

      {/* Medical info */}
      <Card className="bg-card/30 border-border/20">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <HeartPulse className="h-4 w-4 text-primary" />
            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Medical Info</h4>
          </div>
          <EditableField
            label="Known Conditions" value={form.medicalConditions || 'None'} icon={null}
            isEditing={editing === 'medicalConditions'}
            onEdit={() => setEditing('medicalConditions')}
            onCancel={cancel} onSave={save} saving={saving}
          >
            <Textarea value={form.medicalConditions} onChange={e => setForm(f => ({ ...f, medicalConditions: e.target.value }))} rows={2} />
          </EditableField>
          <EditableField
            label="Allergies" value={form.allergies || 'None'} icon={null}
            isEditing={editing === 'allergies'}
            onEdit={() => setEditing('allergies')}
            onCancel={cancel} onSave={save} saving={saving}
          >
            <Input value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} />
          </EditableField>
        </CardContent>
      </Card>

      {/* SOS Emergency Contact */}
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">SOS Emergency Contact</h4>
          </div>

          {contact ? (
            <div className="space-y-3">
              <EditableField
                label="Contact Name" value={contact.name} icon={<Users className="h-4 w-4" />}
                isEditing={editing === 'contact_name'}
                onEdit={() => setEditing('contact_name')}
                onCancel={cancel} onSave={save} saving={saving}
              >
                <Input value={contact.name}
                  onChange={e => setForm(f => ({ ...f, contacts: [{ ...f.contacts[0], name: e.target.value }] }))} />
              </EditableField>

              <EditableField
                label="Phone Number" value={contact.phone} icon={<Phone className="h-4 w-4" />}
                isEditing={editing === 'contact_phone'}
                onEdit={() => setEditing('contact_phone')}
                onCancel={cancel} onSave={save} saving={saving}
              >
                <Input value={contact.phone}
                  onChange={e => setForm(f => ({ ...f, contacts: [{ ...f.contacts[0], phone: e.target.value }] }))} />
              </EditableField>

              <EditableField
                label="Relationship" value={contact.relationship} icon={null}
                isEditing={editing === 'contact_rel'}
                onEdit={() => setEditing('contact_rel')}
                onCancel={cancel} onSave={save} saving={saving}
              >
                <Input value={contact.relationship}
                  onChange={e => setForm(f => ({ ...f, contacts: [{ ...f.contacts[0], relationship: e.target.value }] }))} />
              </EditableField>

              <EditableField
                label="Alert Language" value={contact.language} icon={null}
                isEditing={editing === 'contact_lang'}
                onEdit={() => setEditing('contact_lang')}
                onCancel={cancel} onSave={save} saving={saving}
              >
                <Select value={contact.language}
                  onValueChange={v => setForm(f => ({ ...f, contacts: [{ ...f.contacts[0], language: v }] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </EditableField>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a href={`tel:${contact.phone}`}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-blue-600/20 border border-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-600/30 transition-colors">
                  <Phone className="h-4 w-4" /> Call Now
                </a>
                <a href={`https://wa.me/91${contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-green-600/20 border border-green-500/20 text-green-400 text-sm font-bold hover:bg-green-600/30 transition-colors">
                  <Phone className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No emergency contact set.</p>
          )}
        </CardContent>
      </Card>

      {/* Sign out */}
      <Button
        variant="ghost"
        className="w-full text-destructive hover:bg-destructive/10 rounded-2xl h-14 font-bold"
        onClick={async () => {
          if (confirm("Sign out?")) { await clearProfile(); router.replace('/login'); }
        }}
      >
        <LogOut className="h-5 w-5 mr-2" /> Sign Out
      </Button>
    </div>
  );
}

function EditableField({
  label, value, icon, isEditing, onEdit, onCancel, onSave, saving, highlight, children
}: {
  label: string; value: string; icon: React.ReactNode; isEditing: boolean;
  onEdit: () => void; onCancel: () => void; onSave: () => void;
  saving?: boolean; highlight?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="p-3 bg-background/40 rounded-2xl border border-border/10">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        </div>
        {!isEditing ? (
          <button onClick={onEdit} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        ) : (
          <div className="flex gap-1">
            <button onClick={onSave} disabled={saving} className="p-1 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors">
              <Check className="h-3.5 w-3.5 text-primary" />
            </button>
            <button onClick={onCancel} className="p-1 rounded-lg hover:bg-muted transition-colors">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="mt-2">{children}</div>
      ) : (
        <p className={`font-semibold text-sm truncate ${highlight ? 'text-primary' : ''}`}>{value}</p>
      )}
    </div>
  );
}
