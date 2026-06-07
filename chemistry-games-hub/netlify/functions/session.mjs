import { getStore } from '@netlify/blobs';

function deepMerge(target, source) {
  if (typeof source !== 'object' || source === null) return source;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === 'object' && source[key] !== null &&
      typeof target[key] === 'object' && target[key] !== null
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url = new URL(request.url);
  const pin = url.searchParams.get('pin');
  if (!pin) {
    return new Response(JSON.stringify({ error: 'Missing pin' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  const store = getStore('chem-sessions');
  const h = { ...CORS, 'Content-Type': 'application/json' };

  if (request.method === 'GET') {
    const data = await store.get(pin, { type: 'json' }).catch(() => null);
    return new Response(JSON.stringify(data ?? null), { headers: h });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    await store.setJSON(pin, body);
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  if (request.method === 'PATCH') {
    const body = await request.json();
    const current = await store.get(pin, { type: 'json' }).catch(() => null) ?? {};
    await store.setJSON(pin, deepMerge(current, body));
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  if (request.method === 'DELETE') {
    await store.delete(pin).catch(() => {});
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: h });
}
