import { WorkerProfile } from './types';

// Build a public QR data URL using the Google Charts API (no install needed)
export function buildQRUrl(profile: WorkerProfile): string {
  const data = encodeURIComponent(
    `SafeSignal Medical ID\nName: ${profile.name}\nBlood: ${profile.bloodGroup}\nConditions: ${profile.medicalConditions || 'None'}\nICE: ${profile.contacts.map(c => `${c.name} ${c.phone}`).join(', ')}`
  );
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${data}`;
}

export async function triggerHospitalSOS(profile: WorkerProfile): Promise<void> {
  // 1. Get GPS
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

  // 2. Build QR link
  const qrUrl = buildQRUrl(profile);

  // 3. Build WhatsApp message to emergency contact with QR + location
  const time = new Date().toLocaleTimeString('en-IN');
  const message =
    `🚨 *CRASH DETECTED — HOSPITAL SOS* 🚨\n\n` +
    `*${profile.name}* has been in an accident and needs immediate hospital care.\n\n` +
    `⏰ Time: ${time}\n` +
    `🩸 Blood Group: ${profile.bloodGroup}\n` +
    (profile.medicalConditions ? `⚕️ Conditions: ${profile.medicalConditions}\n` : '') +
    `📍 Location: ${locationLink}\n` +
    `🏥 Nearest Hospital: ${nearestHospitalLink}\n\n` +
    `📋 Medical QR Code (share with hospital):\n${qrUrl}\n\n` +
    `⚠️ Please contact the nearest hospital immediately and share this QR with them.`;

  const contact = profile.contacts?.[0];
  if (contact) {
    const phone = contact.phone.replace(/[\s\-\+]/g, '');
    const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  // 4. Also open nearest hospital in maps
  setTimeout(() => {
    window.open(nearestHospitalLink, '_blank');
  }, 1500);

  // 5. Call 108 (ambulance)
  setTimeout(() => {
    window.location.href = 'tel:108';
  }, 3000);
}
