
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWorkerProfile } from '@/lib/store';
import { Shield, ArrowRight, User, HeartPulse, Users, Briefcase, GraduationCap, Accessibility, Loader2 } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

const formSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  phone: z.string().min(10, "Invalid phone number"),
  persona: z.string(),
  bloodGroup: z.string(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  emergencyContact1: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    relationship: z.string(),
    language: z.string()
  }),
  homeArea: z.string().min(2)
});

const PERSONAS = [
  { id: 'gig_worker', label: 'Gig Worker', icon: <Briefcase className="h-5 w-5" />, desc: 'Delivery, drivers, etc.' },
  { id: 'student', label: 'Student', icon: <GraduationCap className="h-5 w-5" />, desc: 'Solo commuters' },
  { id: 'senior', label: 'Senior', icon: <Accessibility className="h-5 w-5" />, desc: 'Fall detection' },
  { id: 'solo_traveler', label: 'Traveler', icon: <User className="h-5 w-5" />, desc: 'Women safety' },
];

const PLATFORMS = ["Swiggy", "Zomato", "Uber", "Ola", "Porter", "Dunzo", "Shadowfax"];
const LANGUAGES = ["English", "Hindi", "Marathi", "Bengali", "Tamil", "Telugu", "Kannada"];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { saveProfile } = useWorkerProfile();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      platforms: [] as string[],
      bloodGroup: 'O+',
      persona: 'gig_worker',
      emergencyContact1: { language: 'English' }
    }
  });

  const selectedPlatforms = watch('platforms') || [];
  const selectedPersona = watch('persona');

  const totalSteps = selectedPersona === 'gig_worker' ? 5 : 4;
  const isLastStep = step === totalSteps;

  const onSubmit = async (data: any) => {
    if (!isLastStep) {
      nextStep();
      return;
    }

    setIsSubmitting(true);
    try {
      await saveProfile({
        id: user?.uid || Math.random().toString(36).substr(2, 9),
        ...data,
        contacts: [data.emergencyContact1],
        medications: ''
      });
      router.push('/dashboard');
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh p-6 flex flex-col max-w-lg mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Shield className="text-primary h-6 w-6" />
          <span className="font-bold">SafeSignal</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      </header>

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        onKeyDown={handleKeyDown}
        className="space-y-6 flex-1 flex flex-col"
      >
        {step === 1 && (
          <Card className="bg-card/40 border-none shadow-none flex-1 flex flex-col justify-center animate-in slide-in-from-right duration-300">
            <CardHeader className="px-0">
              <CardTitle className="text-3xl font-headline">Who are you?</CardTitle>
              <CardDescription>Select your primary use case for SafeSignal.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid grid-cols-1 gap-3">
                {PERSONAS.map(p => (
                  <div 
                    key={p.id} 
                    onClick={(e) => { e.preventDefault(); setValue('persona', p.id); }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedPersona === p.id ? 'border-primary bg-primary/10' : 'border-border bg-background/50 text-muted-foreground'}`}
                  >
                    <div className={`p-3 rounded-xl ${selectedPersona === p.id ? 'bg-primary text-white' : 'bg-muted'}`}>
                      {p.icon}
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${selectedPersona === p.id ? 'text-primary' : 'text-foreground'}`}>{p.label}</p>
                      <p className="text-xs opacity-70">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-card/40 border-none shadow-none flex-1 flex flex-col justify-center animate-in slide-in-from-right duration-300">
            <CardHeader className="px-0">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <User className="text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline">Basic Info</CardTitle>
              <CardDescription>How should we identify you?</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="E.g. Rajesh Kumar" {...register('name')} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="+91 XXXXXXXXXX" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label>Base Location</Label>
                <Input placeholder="E.g. HSR Layout, Bengaluru" {...register('homeArea')} />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="bg-card/40 border-none shadow-none flex-1 flex flex-col justify-center animate-in slide-in-from-right duration-300">
            <CardHeader className="px-0">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <HeartPulse className="text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline">Medical Record</CardTitle>
              <CardDescription>Critical data for first responders.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select onValueChange={(v) => setValue('bloodGroup', v)} defaultValue="O+">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Known Conditions</Label>
                <Textarea placeholder="E.g. Diabetes, High BP" {...register('medicalConditions')} />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="bg-card/40 border-none shadow-none flex-1 flex flex-col justify-center animate-in slide-in-from-right duration-300">
            <CardHeader className="px-0">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <Users className="text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline">Safety Contacts</CardTitle>
              <CardDescription>We notify them during emergency triggers.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input placeholder="Spouse/Parent Name" {...register('emergencyContact1.name')} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="Their 10 digit number" {...register('emergencyContact1.phone')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input placeholder="E.g. Mother" {...register('emergencyContact1.relationship')} />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <Select onValueChange={(v) => setValue('emergencyContact1.language', v)} defaultValue="English">
                    <SelectTrigger>
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 5 && selectedPersona === 'gig_worker' && (
          <Card className="bg-card/40 border-none shadow-none flex-1 flex flex-col justify-center animate-in slide-in-from-right duration-300">
            <CardHeader className="px-0">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <Briefcase className="text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline">Work Details</CardTitle>
              <CardDescription>Select the platforms you work for.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map(p => (
                  <div 
                    key={p} 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const current = selectedPlatforms;
                      if (current.includes(p)) {
                        setValue('platforms', current.filter(x => x !== p));
                      } else {
                        setValue('platforms', [...current, p]);
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-2 ${selectedPlatforms.includes(p) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background/50 text-muted-foreground'}`}
                  >
                    <Checkbox checked={selectedPlatforms.includes(p)} onCheckedChange={() => {}} className="pointer-events-none" />
                    <span className="font-bold">{p}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 pt-6 mt-auto">
          {step > 1 && (
            <Button type="button" variant="outline" size="lg" className="w-24 rounded-2xl h-14" onClick={prevStep}>
              Back
            </Button>
          )}
          {!isLastStep ? (
            <Button type="button" size="lg" className="flex-1 rounded-2xl h-14 text-lg font-bold" onClick={nextStep}>
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button type="submit" size="lg" className="flex-1 rounded-2xl h-14 text-lg font-bold bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Activate OS
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
