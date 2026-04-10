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
      <header className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top duration-500">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Shield className="text-primary h-6 w-6 relative z-10" />
            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
          </div>
          <span className="font-bold">SafeSignal</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ease-out ${step > i ? 'w-10 bg-primary shadow-lg shadow-primary/50' : 'w-8 bg-muted'}`} />
          ))}
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={e => e.key === 'Enter' && e.preventDefault()} className="flex-1 flex flex-col space-y-6">

        {/* Step 1 — Basic Info */}
        {step === 1 && (
          <Card className="bg-card/40 border-none shadow-none flex-1 flex flex-col justify-center animate-in slide-in-from-right fade-in duration-500">
            <CardHeader className="px-0">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 animate-in zoom-in duration-500 delay-100 relative">
                <User className="text-primary" />
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
              </div>
              <CardTitle className="text-3xl font-headline animate-in slide-in-from-left duration-500 delay-150">Your Info</CardTitle>
              <CardDescription className="animate-in slide-in-from-left duration-500 delay-200">Tell us a bit about yourself.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-300">
                <Label>Full Name</Label>
                <Input placeholder="E.g. Rahul Sharma" {...register('name', { required: true })} className="transition-all duration-300 focus:scale-[1.02]" />
              </div>
              <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-[350ms]">
                <Label>Phone Number</Label>
                <Input placeholder="+91 XXXXXXXXXX" {...register('phone', { required: true })} className="transition-all duration-300 focus:scale-[1.02]" />
              </div>
              <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-[400ms]">
                <Label>City / Area</Label>
                <Input placeholder="E.g. Bengaluru" {...register('homeArea', { required: true })} className="transition-all duration-300 focus:scale-[1.02]" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Medical */}
        {step === 2 && (
          <Card className="bg-card/40 border-none shadow-none flex-1 flex flex-col justify-center animate-in slide-in-from-right fade-in duration-500">
            <CardHeader className="px-0">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 animate-in zoom-in duration-500 delay-100 relative">
                <HeartPulse className="text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
              </div>
              <CardTitle className="text-3xl font-headline animate-in slide-in-from-left duration-500 delay-150">Medical Info</CardTitle>
              <CardDescription className="animate-in slide-in-from-left duration-500 delay-200">Shown to first responders in an emergency.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-300">
                <Label>Blood Group</Label>
                <Select onValueChange={v => setValue('bloodGroup', v)} defaultValue="O+">
                  <SelectTrigger className="transition-all duration-300 hover:scale-[1.02]"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-[350ms]">
                <Label>Known Conditions <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea placeholder="E.g. Diabetes, High BP" {...register('medicalConditions')} className="transition-all duration-300 focus:scale-[1.02] min-h-[100px]" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Emergency Contact */}
        {step === 3 && (
          <Card className="bg-card/40 border-none shadow-none flex-1 flex flex-col justify-center animate-in slide-in-from-right fade-in duration-500">
            <CardHeader className="px-0">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 animate-in zoom-in duration-500 delay-100 relative">
                <Users className="text-primary" />
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
              </div>
              <CardTitle className="text-3xl font-headline animate-in slide-in-from-left duration-500 delay-150">Emergency Contact</CardTitle>
              <CardDescription className="animate-in slide-in-from-left duration-500 delay-200">We notify them if a crash is detected.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-300">
                <Label>Contact Name</Label>
                <Input placeholder="Parent / Spouse name" {...register('emergencyContact1.name', { required: true })} className="transition-all duration-300 focus:scale-[1.02]" />
              </div>
              <div className="space-y-2 animate-in slide-in-from-bottom duration-500 delay-[350ms]">
                <Label>Phone Number</Label>
                <Input placeholder="10 digit number" {...register('emergencyContact1.phone', { required: true })} className="transition-all duration-300 focus:scale-[1.02]" />
              </div>
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom duration-500 delay-[400ms]">
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input placeholder="E.g. Mother" {...register('emergencyContact1.relationship', { required: true })} className="transition-all duration-300 focus:scale-[1.02]" />
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select onValueChange={v => setValue('emergencyContact1.language', v)} defaultValue="English">
                    <SelectTrigger className="transition-all duration-300 hover:scale-[1.02]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 pt-4 mt-auto animate-in slide-in-from-bottom duration-500 delay-500">
          {step > 1 && (
            <Button type="button" variant="outline" size="lg" className="w-24 rounded-2xl h-14 transition-all duration-300 hover:scale-105 active:scale-95" onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          )}
          <Button type="submit" size="lg" className="flex-1 rounded-2xl h-14 text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
            {step < TOTAL_STEPS ? (<>Continue <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" /></>) : 'Activate SafeSignal'}
          </Button>
        </div>
      </form>
    </div>
  );
}
