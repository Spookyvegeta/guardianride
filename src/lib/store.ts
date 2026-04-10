
"use client"

import { useState, useEffect, useMemo } from 'react';
import { WorkerProfile } from './types';
import { useFirestore, useUser, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export function useWorkerProfile() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const auth = useAuth();
  
  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'profile', 'main');
  }, [firestore, user]);

  const { data: profile, isLoading: isDocLoading } = useDoc<WorkerProfile>(profileRef);

  const saveProfile = async (newProfile: WorkerProfile) => {
    if (!firestore || !user) return;
    const ref = doc(firestore, 'users', user.uid, 'profile', 'main');
    await setDoc(ref, {
      ...newProfile,
      id: user.uid,
      registeredAt: new Date().toISOString(),
    }, { merge: true });
  };

  const clearProfile = async () => {
    if (auth) await signOut(auth);
  };

  return { 
    profile, 
    saveProfile, 
    clearProfile,
    loading: isAuthLoading || isDocLoading 
  };
}
