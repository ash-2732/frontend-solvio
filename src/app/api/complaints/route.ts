import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function GET() {
  if (!API_BASE) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_API_BASE_URL not set' }, { status: 500 });
  }
  try {
    const res = await fetch(`${API_BASE}/complaints`, { headers: { accept: 'application/json' } });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      const err = contentType.includes('application/json') ? await res.json() : await res.text();
      return NextResponse.json({ error: 'Upstream error', details: err }, { status: res.status });
    }
    const data = contentType.includes('application/json') ? await res.json() : await res.text();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: 'Proxy error', details: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!API_BASE) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_API_BASE_URL not set' }, { status: 500 });
  }
  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      const err = contentType.includes('application/json') ? await res.json() : await res.text();
      return NextResponse.json({ error: 'Upstream error', details: err }, { status: res.status });
    }
    const data = contentType.includes('application/json') ? await res.json() : await res.text();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: 'Proxy error', details: String(e?.message ?? e) }, { status: 500 });
  }
}
