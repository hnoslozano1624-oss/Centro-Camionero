import { json } from "../../../lib/auth.js";
export async function onRequestGet({ env }) {
  return json({ ok: true, fotos: !!env.FOTOS });
}
