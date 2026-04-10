import { WorkerProfile } from './types';

export async function sendSOSSms(
  profile: WorkerProfile,
  type: 'panic' | 'accident',
  locationLink: string
): Promise<{ success: boolean; error?: string }> {
  const contact = profile.contacts?.[0];
  if (!contact?.phone) return { success: false, error: 'No contact phone' };
  const res = await fetch('/api/sos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: contact.phone,
      name: profile.name,
      bloodGroup: profile.bloodGroup,
      medicalConditions: profile.medicalConditions || 'None',
      locationLink,
      type,
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error ?? 'SMS failed');
  return { success: true };
}

export function buildQRUrl(profile: WorkerProfile): string {
  const data = encodeURIComponent(
    `SafeSignal Medical ID\nName: ${profile.name}\nBlood: ${profile.bloodGroup}\nConditions: ${profile.medicalConditions || 'None'}\nICE: ${profile.contacts.map(c => `${c.name} ${c.phone}`).join(', ')}`
  );
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${data}`;
}

export async function triggerHospitalSOS(profile: WorkerProfile): Promise<void> {
  const coords = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: 6000, enableHighAccuracy: true }
    );
  });

  const locationLink = coords
    ? `https://maps.google.com/?q=${coords.lat},${coords.lng}`
    : 'https://maps.google.com';

  const nearestHospitalLink = coords
    ? `https://www.google.com/maps/search/hospital+emergency/@${coords.lat},${coords.lng},14z`
    : 'https://www.google.com/maps/search/hospital+emergency+near+me';

  const qrUrl = buildQRUrl(profile);
  const time = new Date().toLocaleTimeString('en-IN');

  // Message for personal SOS contact
  const sosMessage =
    `🚨 *EMERGENCY ALERT* 🚨\n\n` +
    `*${profile.name}* has been in a crash!\n\n` +
    `⏰ Time: ${time}\n` +
    `🩸 Blood Group: ${profile.bloodGroup}\n` +
    (profile.medicalConditions ? `⚕️ Conditions: ${profile.medicalConditions}\n` : '') +
    `📍 Location: ${locationLink}\n` +
    `🏥 Nearest Hospital: ${nearestHospitalLink}\n\n` +
    `📋 Medical QR (share with doctors): ${qrUrl}\n\n` +
    `⚠️ Please reach immediately or call 108.`;

  // Message for hospital (generic — user will select hospital from Maps)
  const hospitalMessage =
    `🚨 *INCOMING EMERGENCY PATIENT* 🚨\n\n` +
    `Patient: *${profile.name}*\n` +
    `🩸 Blood Group: ${profile.bloodGroup}\n` +
    (profile.medicalConditions ? `⚕️ Conditions: ${profile.medicalConditions}\n` : '') +
    `📍 Crash Location: ${locationLink}\n\n` +
    `📋 Medical QR Code: ${qrUrl}\n\n` +
    `Please prepare emergency care. Patient is en route.`;

  const contact = profile.contacts?.[0];

  // 1. WhatsApp to personal SOS contact
  if (contact) {
    const phone = contact.phone.replace(/[\s\-\+]/g, '');
    const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(sosMessage)}`, '_blank');
  }

  // 2. After 2s — open nearest hospital in Maps (user can call from there)
  setTimeout(() => window.open(nearestHospitalLink, '_blank'), 2000);

  // 3. After 4s — WhatsApp to hospital (108 WhatsApp Business)
  setTimeout(() => {
    // 108 has WhatsApp in some states; fallback opens WA with hospital message pre-filled
    // User selects the hospital contact from their recent Maps result
    window.open(`https://wa.me/?text=${encodeURIComponent(hospitalMessage)}`, '_blank');
  }, 4000);

  // 4. After 6s — Call 108 directly
  setTimeout(() => {
    window.location.href = 'tel:108';
  }, 6000);
}
