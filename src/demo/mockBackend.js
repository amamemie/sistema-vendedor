/**
 * Backend simulado para la demo estática (GitHub Pages).
 *
 * Intercepta fetch() hacia /backend/*.php y responde con src/demo/snapshot.json
 * (generado con `node scripts/demo-snapshot.mjs` desde el backend real).
 * - Las fechas se desplazan para que la última venta quede en "hoy".
 * - Las acciones que modifican datos responden con éxito, pero no se guardan.
 */
import snapshot from './snapshot.json';

const DAY = 86400000;
const generatedAt = new Date(snapshot.generatedAt);
const offsetDays = Math.max(0, Math.round((Date.now() - generatedAt.getTime()) / DAY));

const pad = (n) => String(n).padStart(2, '0');
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})((?:[ T])(\d{2}):(\d{2})(?::(\d{2}))?)?/;

function shiftDate(str) {
  const m = DATE_RE.exec(str);
  if (!m) return str;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[5] || 0), +(m[6] || 0), +(m[7] || 0)) + offsetDays * DAY);
  const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  return m[4] ? `${date}${m[4][0]}${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}${str.slice(m[0].length)}` : `${date}${str.slice(m[0].length)}`;
}

function shiftDeep(value) {
  if (!offsetDays) return value;
  if (typeof value === 'string') return DATE_RE.test(value) ? shiftDate(value) : value;
  if (Array.isArray(value)) return value.map(shiftDeep);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shiftDeep(v)]));
  return value;
}

const DATE_FIELDS = ['fecha_compra', 'fecha_pago', 'fecha', 'fecha_dispersion'];
function filterByDates(data, desde, hasta) {
  if (!desde || !hasta) return data;
  const from = new Date(`${desde}T00:00:00`);
  const to = new Date(`${hasta}T23:59:59`);
  const inRange = (row) => {
    const f = DATE_FIELDS.find((k) => row && row[k]);
    if (!f) return true;
    const d = new Date(String(row[f]).replace(' ', 'T'));
    return d >= from && d <= to;
  };
  if (Array.isArray(data)) return data.filter(inRange);
  if (data && Array.isArray(data.detalles)) {
    const detalles = data.detalles.filter(inRange);
    const out = { ...data, detalles };
    if ('total' in data) out.total = detalles.reduce((s, r) => s + Number(r.comision_monto || 0), 0);
    return out;
  }
  return data;
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const DEMO_OK = { success: true, message: 'Modo demo: la acción funciona, pero los cambios no se guardan.', id_producto: 9999, id: 9999 };

async function handle(url, init = {}) {
  const endpoint = decodeURIComponent(url.pathname.split('/backend/')[1] || '');
  const method = (init.method || 'GET').toUpperCase();
  const params = Object.fromEntries(url.searchParams);
  let body;
  try {
    body = init.body && typeof init.body === 'string' ? JSON.parse(init.body) : {};
  } catch {
    body = {};
  }

  if (endpoint === 'login.php') {
    const cuenta = snapshot.logins[String(body.email || '').trim().toLowerCase()];
    if (!cuenta) return json({ success: false, message: 'Usuario no encontrado' });
    if ((await sha256(String(body.password || ''))) !== cuenta.sha256) return json({ success: false, message: 'Contraseña incorrecta' });
    return json(cuenta.response);
  }

  // Reportes del admin (POST con fechas opcionales)
  if (endpoint.startsWith('admin_reporte_')) {
    const data = snapshot.responses[endpoint];
    return json(filterByDates(shiftDeep(data), body.fecha_inicio, body.fecha_fin));
  }

  if (method !== 'GET' || endpoint === 'validar_descuento.php') {
    if (endpoint === 'validar_descuento.php') return json({ success: false, message: 'En la demo los códigos de descuento no se validan.' });
    if (endpoint === 'chat.php') return json({ success: true, message: 'Mensaje enviado (demo)' });
    return json(DEMO_OK);
  }

  // GET: busca la respuesta exacta y, si no, una versión sin fechas / sin parámetros
  const { fecha_inicio, fecha_fin, ...rest } = params;
  const qs = new URLSearchParams(rest).toString();
  const keys = [qs ? `${endpoint}?${qs}` : endpoint];
  if (rest.id_vendedor) keys.push(`${endpoint}?id_vendedor=${rest.id_vendedor}`);
  if (rest.publico !== undefined) keys.push(`${endpoint}?publico=true`);
  keys.push(endpoint);
  const key = keys.find((k) => k in snapshot.responses);
  if (!key) {
    if (endpoint === 'chat.php') return json({ success: true, mensajes: [] });
    return json([]);
  }
  return json(filterByDates(shiftDeep(snapshot.responses[key]), fecha_inicio, fecha_fin));
}

export function installMockBackend() {
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const raw = typeof input === 'string' ? input : input?.url || String(input);
    const url = new URL(raw, window.location.href);
    if (url.pathname.includes('/backend/') && url.pathname.endsWith('.php')) {
      await new Promise((r) => setTimeout(r, 120 + Math.random() * 180)); // latencia realista
      return handle(url, init || {});
    }
    return realFetch(input, init);
  };
}
