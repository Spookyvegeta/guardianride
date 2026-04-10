import { WorkerProfile, LiveIncident, IncidentType } from './types';
import { buildQRUrl } from './hospital-sos';

export async function saveIncidentToFirestore(
  profile: WorkerProfile,
  type: IncidentType,
  locationLink: string,
  lat: number,
  lng: number
): Promise<void> {
  try {
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const { getApp } = await import('firebase/app');
    const db = getFirestore(getApp());

    const incident: Omit<LiveIncident, 'id'> = {
      userId: profile.id,
      patientName: profile.name,
      patientPhone: profile.phone,
      bloodGroup: profile.bloodGroup,
      medicalConditions: profile.medicalConditions || 'None',
      emergencyContact: {
        name: profile.contacts?.[0]?.name ?? '',
        phone: profile.contacts?.[0]?.phone ?? '',
      },
      type,
      status: 'detected',
      lat,
      lng,
      locationLink,
      qrUrl: buildQRUrl(profile),
      timestamp: new Date().toISOString(),
    };

    await addDoc(collection(db, 'incidents'), incident);
  } catch (e) {
    console.error('Failed to save incident:', e);
  }
}
