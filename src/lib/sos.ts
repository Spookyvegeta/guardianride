import { WorkerProfile } from './types';

export function getLocationLink(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve('https://maps.google.com');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(`https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`),
      () => resolve('https://maps.google.com'),
      { timeout: 5000, enableHighAccuracy: true }
    );
  });
}

export async function buildWhatsAppMessage(profile: WorkerProfile, type: 'panic' | 'accident', aiMessage?: string): Promise<string> {
  const contact = profile.contacts?.[0];
  if (!contact) return '';

  const time = new Date().toLocaleTimeString('en-IN');
  const locationLink = await getLocationLink();

  return aiMessage ||
    `🚨 *EMERGENCY ALERT* 🚨\n\n` +
    `*${profile.name}* needs immediate help!\n\n` +
    `⏰ Time: ${time}\n` +
    `🩸 Blood Group: ${profile.bloodGroup}\n` +
    (profile.medicalConditions ? `⚕️ Conditions: ${profile.medicalConditions}\n` : '') +
    `📍 My Location: ${locationLink}\n\n` +
    (type === 'panic'
      ? `⚠️ Panic button was manually triggered. Please call immediately.`
      : `⚠️ A potential accident/fall was detected. Please check on them immediately.`);
}

export async function triggerWhatsApp(profile: WorkerProfile, type: 'panic' | 'accident', aiMessage?: string) {
  const contact = profile.contacts?.[0];
  if (!contact) return;

  const phone = contact.phone.replace(/[\s\-\+]/g, '');
  const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;

  const message = await buildWhatsAppMessage(profile, type, aiMessage);
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${fullPhone}?text=${encoded}`, '_blank');
}

export function triggerCall(profile: WorkerProfile) {
  const contact = profile.contacts?.[0];
  if (!contact?.phone) return;
  const phone = contact.phone.replace(/[\s\-]/g, '');
  window.open(`tel:${phone}`, '_self');
}

export function triggerSOS(profile: WorkerProfile, type: 'panic' | 'accident', aiMessage?: string) {
  triggerWhatsApp(profile, type, aiMessage);
}
