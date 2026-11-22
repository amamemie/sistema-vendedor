#!/usr/bin/env node
/**
 * Genera src/demo/snapshot.json para la demo estática (GitHub Pages).
 *
 * Pide al backend PHP local las respuestas que usa la app con los datos de demostración
 * y las guarda en un JSON. En la demo, src/demo/mockBackend.js responde con esos datos.
 *
 * Requisitos: backend corriendo en http://localhost/sistema-vendedor/backend
 *             con backend/seed/datos_demo.sql importado.
 * Uso:        node scripts/demo-snapshot.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const API = process.env.DEMO_API || 'http://localhost/sistema-vendedor/backend';
const OUT = new URL('../src/demo/snapshot.json', import.meta.url);

// Cuentas de demostración (las mismas del README). La demo guarda solo el SHA-256 de cada contraseña.
const CUENTAS = [
  ['admin@sistema.com', 'hash_admin_123'],
  ['vendedor1@gmail.com', 'hash_vend_1'],
  ['vendedor2@gmail.com', 'hash_vend_2'],
  ['coster@gmail.com', '123456'],
  ['gabriela.rojas@ejemplo.com', '123456'],
  ['diego.mamani@ejemplo.com', '123456'],
  ['comprador1@hotmail.com', 'hash_comp_1'],
  ['comprador2@gmail.com', 'hash_comp_2'],
  ['bien@gmail.com', '123456'],
  ['valeria.gutierrez@ejemplo.com', '123456'],
  ['jorge.condori@ejemplo.com', '123456'],
];

const sha = (s) => createHash('sha256').update(s).digest('hex');

async function get(path) {
  const r = await fetch(`${API}/${path}`);
  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${path} no devolvió JSON: ${text.slice(0, 120)}`);
  }
}
async function post(path, body) {
  const r = await fetch(`${API}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return r.json();
}

const responses = {};
const save = async (key, fn) => {
  responses[key] = await fn();
  process.stdout.write('.');
};

// Rutas sin parámetros
for (const p of ['categorias.php', 'usuarios.php', 'vendedores.php', 'admin_stats.php', 'reporte_ventas.php',
  'reporte_comisiones.php', 'solicitudes_vendedores.php', 'productos_pendientes.php', 'solicitudes_devolucion.php']) {
  await save(p, () => get(p));
}
await save('productos.php?publico=true', () => get('productos.php?publico=true'));

// Reportes del admin (POST, sin fechas: todo el historial)
for (const tipo of ['ganancias', 'vendedores', 'compradores', 'productos']) {
  await save(`admin_reporte_${tipo}.php`, () => post(`admin_reporte_${tipo}.php`, {}));
}

// Inicios de sesión
const logins = {};
const vendedores = new Set();
const usuariosComprador = new Set();
for (const [email, pass] of CUENTAS) {
  const res = await post('login.php', { email, password: pass });
  if (!res.success) throw new Error(`No se pudo iniciar sesión con ${email}: ${res.message}`);
  logins[email.toLowerCase()] = { sha256: sha(pass), response: res };
  if (res.id_vendedor) vendedores.add(res.id_vendedor);
  if (res.rol === 'Comprador') usuariosComprador.add(res.id);
}

// Datos por vendedor
for (const id of vendedores) {
  await save(`productos.php?id_vendedor=${id}`, () => get(`productos.php?id_vendedor=${id}`));
  await save(`pedidos_vendedor.php?id_vendedor=${id}`, () => get(`pedidos_vendedor.php?id_vendedor=${id}`));
  await save(`analisis_ventas_vendedor.php?id_vendedor=${id}`, () => get(`analisis_ventas_vendedor.php?id_vendedor=${id}`));
  await save(`reporte_ventas_vendedor.php?id_vendedor=${id}`,
    () => get(`reporte_ventas_vendedor.php?id_vendedor=${id}&fecha_inicio=2000-01-01&fecha_fin=2100-12-31`));
}

// Datos por comprador
for (const id of usuariosComprador) {
  for (const p of ['mis_pedidos.php', 'mis_resenas.php', 'mis_descuentos.php']) {
    await save(`${p}?id_usuario=${id}`, () => get(`${p}?id_usuario=${id}`));
  }
}

// Chats por producto
const productos = responses['productos.php?publico=true'];
for (const p of Array.isArray(productos) ? productos : []) {
  const res = await get(`chat.php?id_producto=${p.id_producto}`);
  if (res?.mensajes?.length) responses[`chat.php?id_producto=${p.id_producto}`] = res;
}

mkdirSync(new URL('../src/demo/', import.meta.url), { recursive: true });
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), logins, responses }));
console.log(`\n${Object.keys(responses).length} respuestas y ${Object.keys(logins).length} cuentas → src/demo/snapshot.json`);
