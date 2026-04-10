"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useWorkerProfile } from '@/lib/store';
import { Shield, ArrowRight, User, HeartPulse, Users, Loader2 } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

const LANGUAGES = ["English", "Hindi", "Marathi", "Bengali", "Tamil", "Telugu", "Kannada"];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

type FormData = {
  name: string;
  phone: string;
  homeArea: string;
  bloodGroup: string;
  medicalConditions: string;
  emergencyContact1: {
    name: string;
    phone: string;
    relationship: string;
    language: string;
  };
};

const TOTAL_STEPS = 3;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { saveProfile } = useWorkerProfile();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user && auth) initiateAnonymousSignIn(auth);
  }, [user, isUserLoading, auth]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: { bloodGroup: 'O+', emergencyContact1: { language: 'English' } }
  });

  const onSubmit = async (data: FormData) => {
    if (step < TOTAL_STEPS) { setStep(s => s + 1); return; }
    setIsSubmitting(true);
    try {
      await saveProfile({
        id: user?.uid || Math.random().toString(36).substring(2, 9),
        name: data.name,
        phone: data.phone,
        homeArea: data.homeArea,
        bloodGroup: data.bloodGroup as any,
        medicalConditions: data.medicalConditions || '',
        allergies: '',
        medications: '',
        persona: 'solo_traveler',
        platforms: [],
        contacts: [{
          id: '1',
          name: data.emergencyContact1.name,
          phone: data.emergencyContact1.phone,
          relationship: data.emergencyContact1.relationship,
          language: data.emergencyContact1.language,
        }],
      });
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step > i ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={e => e.key === 'Enter' && e.preventDefault()} className="flex-1 flex flex-col space-y-6">

        {/* Step 1 — Basic Info */}
        {step === 1 && (
          <Card className="bg-card/40 border-none shadow-none flex-1 flex flex-col justify-center animate-in slide-in-from-right duration-300">
            <CardHeader className="px-0">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <User className="text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline">Your Info</CardTitle>
              <CardDescription>Tell us a bit about yourself.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="E.g. Rahul Sharma" {...register('name', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="+91 XXXXXXXXXX" {...register('phone', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>City / Area</Label>
                <Input placeholder="E.g. Bengaluru" {...register('homeArea', { required: true })} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Medical */}
        {step === 2 && (
          <Card className="bg-card/40 border-none shadow-none flex-1 flex flex-col justify-center animate-in slide-in-from-right duration-300">
            <CardHeader className="px-0">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <HeartPulse className="text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline">Medical Info</CardTitle>
              <CardDescription>Shown to first responders in an emergency.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select onValueChange={v => setValue('bloodGroup', v)} defaultValue="O+">
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Known Conditions <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea placeholder="E.g. Diabetes, High BP" {...register('medicalConditions')} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Emergency Contact */}
        {step === 3 && (
          <Card className="bg-card/40 border-none shadow-none flex-1 flex flex-col justify-center animate-in slide-in-from-right duration-300">
            <CardHeader className="px-0">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <Users className="text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline">Emergency Contact</CardTitle>
              <CardDescription>We notify them if a crash is detected.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input placeholder="Parent / Spouse name" {...register('emergencyContact1.name', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="10 digit number" {...register('emergencyContact1.phone', { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input placeholder="E.g. Mother" {...register('emergencyContact1.relationship', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select onValueChange={v => setValue('emergencyContact1.language', v)} defaultValue="English">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 pt-4 mt-auto">
          {step > 1 && (
            <Button type="button" variant="outline" size="lg" className="w-24 rounded-2xl h-14" onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          )}
          <Button type="submit" size="lg" className="flex-1 rounded-2xl h-14 text-lg font-bold" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
            {step < TOTAL_STEPS ? (<>Continue <ArrowRight className="ml-2 h-5 w-5" /></>) : 'Activate SafeSignal'}
          </Button>
        </div>
      </form>
    </div>
  );
}
