// Serverless auth gate — password never reaches the client.
// Set ADMIN_PASSWORD in Netlify environment variables (Site settings → Environment variables).
// Returns a signed session token valid for the current day (UTC); client stores in sessionStorage only.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const h = { ...CORS, 'Content-Type': 'application/json' };

async function hmac(secret, data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: h });

  const adminPassword = process.env.ADMIN_PASSWORD;
  const tokenSecret = process.env.TOKEN_SECRET || process.env.ADMIN_PASSWORD || 'fallback-secret-change-me';

  if (!adminPassword) {
    return new Response(JSON.stringify({ error: 'Server misconfigured — ADMIN_PASSWORD env var not set' }), { status: 500, headers: h });
  }

  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: h }); }

  const { password } = body;
  if (password !== adminPassword) {
    // Constant-time comparison is not needed here since we're already on the server side,
    // but we add a tiny delay to slow brute-force
    await new Promise(r => setTimeout(r, 300));
    return new Response(JSON.stringify({ error: 'Incorrect password' }), { status: 401, headers: h });
  }

  // Issue a daily token: HMAC(tokenSecret, "teacher:" + YYYY-MM-DD)
  const day = todayUtc();
  const token = await hmac(tokenSecret, `teacher:${day}`);
  return new Response(JSON.stringify({ token, day }), { headers: h });
}
