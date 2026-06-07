// Simple in-memory session store using a module-level Map
// Works within a single Lambda warm invocation — good enough for short classroom sessions
const sessions = new Map();

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url = new URL(request.url);
  const pin = url.searchParams.get('pin');
  const h = { ...CORS, 'Content-Type': 'application/json' };

  if (!pin) {
    return new Response(JSON.stringify({ error: 'Missing pin' }), { status: 400, headers: h });
  }

  if (request.method === 'GET') {
    const data = sessions.get(pin) ?? null;
    return new Response(JSON.stringify(data), { headers: h });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    sessions.set(pin, body);
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  if (request.method === 'PATCH') {
    const body = await request.json();
    const current = sessions.get(pin) ?? {};
    sessions.set(pin, deepMerge(current, body));
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  if (request.method === 'DELETE') {
    sessions.delete(pin);
    return new Response(JSON.stringify({ ok: true }), { headers: h });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: h });
}
