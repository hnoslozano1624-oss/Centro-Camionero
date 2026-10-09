// Pruebas del inventario público. Ejecutar con:  node tests/inventario.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validarInventario, construirInventario, aInventarioFaw } from "../lib/inventario.js";
import { onRequest } from "../functions/inventario.json.js";
import { onRequestGet as ficha } from "../functions/usados/[slug].js";

const faw = JSON.parse(readFileSync(new URL("../faw/modelos.json", import.meta.url), "utf8")).modelos;
const VEH = [
  { id: 2, tipo: "usado", marca: "Foton", linea: "Aumark", modelo_anio: 2018, kilometraje: 115000, precio: 75000000, estado: "disponible", descripcion: "Nota <b>x</b>", ficha_tecnica: '{"motor":"Cummins","carroceria":"Estacas"}' },
  { id: 1, tipo: "usado", marca: "Karry", linea: "Yoki", modelo_anio: 2025, kilometraje: 12000, precio: 0, estado: "reservado", descripcion: null, ficha_tecnica: "{}" },
];
const fakeDb = (rows = VEH) => ({ prepare: (sql) => ({ bind() { return this; }, all: async () => ({ results: /vehiculo_fotos/.test(sql) ? [{ id: 1, vehiculo_id: 2, url: "/api/fotos/a.jpg", orden: 0 }] : rows }) }) });
const assets = { fetch: async () => new Response(JSON.stringify({ modelos: faw }), { headers: { "content-type": "application/json" } }) };
const env = (extra = {}) => ({ DB: fakeDb(), ASSETS: assets, ...extra });
const pedir = (p = "/inventario.json", m = "GET") => new Request("https://x.pages.dev" + p, { method: m });

// 1) Respuesta correcta
let r = await onRequest({ request: pedir(), env: env() });
assert.equal(r.status, 200);
assert.equal(r.headers.get("content-type"), "application/json; charset=utf-8");
assert.match(r.headers.get("cache-control"), /max-age=300/);
const lista = JSON.parse(await r.text());
assert.equal(lista.length, 2 + faw.length);
assert.deepEqual(validarInventario(lista), []);
assert.equal(lista[0].id, "CC-U-0002");
assert.equal(lista[0].url, "https://www.centrocamionero.com.co/usados/foton-aumark-2018-2");
assert.equal(lista[0].foto, "https://www.centrocamionero.com.co/api/fotos/a.jpg");
assert.equal(lista[1].precio, null); // precio 0 = "a consultar"
assert.equal(lista[1].estado, "reservado");
assert.equal(lista[1].foto, null);
const nuevos = lista.filter((x) => x.tipo === "nuevo FAW");
assert.ok(nuevos.every((x) => x.precio === null && x.anio === null && x.kilometraje === null && x.estado === "disponible"));
assert.equal(nuevos[0].id, "FAW-WHR-LION-2-6"); assert.equal(nuevos[0].modelo, "WHR Lion 2.6");
assert.equal(nuevos.find((x) => x.id === "FAW-WHR-GRAND-LION-3-2").modelo, "WHR Grand Lion 3.2");
assert.deepEqual([...new Set(nuevos.map((x) => x.categoria))].sort(), ["liviano", "mediano"]);
assert.ok(!/placa|chasis|vin|origen|permuta|descripcion/i.test(Object.keys(lista[0]).join(",")));
console.log("OK  respuesta, formato, ids, urls, FAW sin precio");

// 2) HEAD y método no permitido
r = await onRequest({ request: pedir("/inventario.json", "HEAD"), env: env() }); assert.equal(r.status, 200); assert.equal(await r.text(), "");
r = await onRequest({ request: pedir("/inventario.json", "POST"), env: env() }); assert.equal(r.status, 405);
console.log("OK  HEAD / 405");

// 3) Falla la fuente -> 503 (nunca un arreglo vacío)
r = await onRequest({ request: pedir(), env: { DB: fakeDb(), ASSETS: { fetch: async () => new Response("x", { status: 500 }) } } }); assert.equal(r.status, 503);
r = await onRequest({ request: pedir(), env: { ASSETS: assets } }); assert.equal(r.status, 503);
console.log("OK  fuente caída -> 503");

// 4) Validación: cada regla debe fallar
const ok = () => JSON.parse(JSON.stringify(lista));
const falla = (mut, texto) => { const l = ok(); mut(l); const e = validarInventario(l); assert.ok(e.some((x) => x.includes(texto)), `esperaba "${texto}" en ${JSON.stringify(e)}`); };
falla((l) => { l[1].id = l[0].id; }, "id repetido");
falla((l) => { l[0].placa = "ABC123"; }, "prohibido");
falla((l) => { l[0].Chasis = "x"; }, "prohibido");
falla((l) => { l[0].costo_compra = 1; }, "prohibido");
falla((l) => { l[0].estado = "vendido"; }, "estado inválido");
falla((l) => { l[0].precio = 1.5; }, "precio");
falla((l) => { l[0].precio = "85000000"; }, "precio");
falla((l) => { l[3].precio = 100; }, "no puede traer precio");
falla((l) => { delete l[0].marca; }, "falta marca");
falla((l) => { l[0].url = ""; }, "falta url");
falla((l) => { l[0].url = "http://x.com/a"; }, "https");
falla((l) => { l[0].tipo = "nuevo"; }, "tipo inválido");
falla((l) => { l[0].motor = "N/A"; }, "motor");
falla((l) => { l[2].categoria = "pesado"; }, "categoria");
assert.ok(validarInventario([]).length && validarInventario("x").length);
console.log("OK  14 reglas de validación");

// 5) Ficha individual
let f = await ficha({ params: { slug: "foton-aumark-2018-2" }, env: env(), request: pedir("/usados/foton-aumark-2018-2") });
let html = await f.text();
assert.equal(f.status, 200);
assert.match(html, /<title>Foton Aumark 2018 usado, 115\.000 km/);
assert.match(html, /data-dylia="Hola, me interesa el camión usado Foton Aumark 2018 \(115\.000 km\) publicado en la página web\."/);
assert.match(html, /\$ 75\.000\.000/); assert.match(html, /og:image" content="https:\/\/www\.centrocamionero\.com\.co\/api\/fotos\/a\.jpg"/);
assert.ok(!html.includes("<b>x</b>") && html.includes("&lt;b&gt;x&lt;/b&gt;")); // descripción escapada
f = await ficha({ params: { slug: "2" }, env: env(), request: pedir("/usados/2") }); assert.equal(f.status, 301); assert.match(f.headers.get("location"), /\/usados\/foton-aumark-2018-2$/);
f = await ficha({ params: { slug: "karry-yoki-2025-1" }, env: env(), request: pedir("/usados/karry-yoki-2025-1") }); html = await f.text();
assert.match(html, /Reservado/); assert.match(html, /Precio a consultar/);
f = await ficha({ params: { slug: "zzz-99" }, env: env(), request: pedir("/usados/zzz-99") }); assert.equal(f.status, 404); assert.match(await f.text(), /noindex/);
f = await ficha({ params: { slug: "abc" }, env: env(), request: pedir("/usados/abc") }); assert.equal(f.status, 404);
// 0 km: sin la palabra "usado" en el mensaje
f = await ficha({ params: { slug: "hino-500-2024-7" }, env: { DB: fakeDb([{ id: 7, tipo: "usado", marca: "Hino", linea: "500", modelo_anio: 2024, kilometraje: 0, precio: 1, estado: "disponible", descripcion: null, ficha_tecnica: "{}" }]), ASSETS: assets }, request: pedir("/usados/hino-500-2024-7") }); html = await f.text();
assert.match(html, /data-dylia="Hola, me interesa el camión Hino 500 2024 publicado en la página web\."/);
console.log("OK  ficha: contenido, redirección, 404, escape, regla 0 km");
console.log("\nTodas las pruebas pasaron.");
