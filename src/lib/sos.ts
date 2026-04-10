import { WorkerProfile } from './types';

export function getLocationLink(): string {
  if (typeof window === 'undefined') return 'https://maps.google.com';
  // Try to get real location, fallback to generic maps link
  return `https://www.google.com/maps?q=My+Location`;
}

export function buildWhatsAppMessage(profile: WorkerProfile, type: 'panic' | 'accident', aiMessage?: string): string {
  const contact = profile.contacts?.[0];
  if (!contact) return '';

  const time = new Date().toLocaleTimeString('en-IN');
  const locationLink = getLocationLink();

  const base = aiMessage ||
    `🚨 *EMERGENCY ALERT* 🚨\n\n` +
    `*${profile.name}* needs immediate help!\n\n` +
    `⏰ Time: ${time}\n` +
    `🩸 Blood Group: ${profile.bloodGroup}\n` +
    (profile.medicalConditions ? `⚕️ Conditions: ${profile.medicalConditions}\n` : '') +
    `📍 Location: ${locationLink}\n\n` +
    (type === 'panic'
      ? `⚠️ Panic button was manually triggered. Please call immediately.`
      : `⚠️ A potential accident/fall was detected. Please check on them immediately.`);

  return base;
}

export function triggerWhatsApp(profile: WorkerProfile, type: 'panic' | 'accident', aiMessage?: string) {
  const contact = profile.contacts?.[0];
  if (!contact) return;

  // Clean phone number - remove spaces, dashes, +
  const phone = contact.phone.replace(/[\s\-\+]/g, '');
  // Add country code if not present (assume India +91)
  const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;

  const message = buildWhatsAppMessage(profile, type, aiMessage);
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
