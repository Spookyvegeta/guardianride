import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phone, name, bloodGroup, medicalConditions, locationLink, type } = await req.json();

    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

    // Clean to 10-digit Indian number
    const cleanPhone = phone.replace(/[\s\-\+]/g, '').replace(/^91/, '').slice(-10);

    const message =
      `EMERGENCY: ${name} needs help! ` +
      `Blood: ${bloodGroup}. ` +
      (medicalConditions && medicalConditions !== 'None' ? `Conditions: ${medicalConditions}. ` : '') +
      `Location: ${locationLink} ` +
      (type === 'panic' ? `Panic triggered.` : `Crash detected.`) +
      ` Call immediately. -SafeSignal`;

    // Use GET request with query params — Fast2SMS Quick route
    const params = new URLSearchParams({
      authorization: process.env.FAST2SMS_API_KEY!,
      route: 'q',
      message,
      language: 'english',
      flash: '0',
      numbers: cleanPhone,
    });

    const res = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`, {
      method: 'GET',
      headers: { 'cache-control': 'no-cache' },
    });

    const data = await res.json();
    console.log('Fast2SMS response:', JSON.stringify(data));

    if (!data.return) {
      return NextResponse.json({ error: data.message ?? 'SMS failed', raw: data }, { status: 500 });
    }

    return NextResponse.json({ success: true, requestId: data.request_id });
  } catch (e: any) {
    console.error('SOS API error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
