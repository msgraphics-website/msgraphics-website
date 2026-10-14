// Creates staff logins and resets their passwords. Only an active admin can call it.
// Needs two environment variables in Netlify (Site configuration → Environment variables):
//   SUPABASE_URL                 e.g. https://abcd1234.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    Supabase → Project Settings → API → service_role (keep secret)
import { createClient } from '@supabase/supabase-js';
import config from '../../src/config/site.config.js';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const cleanId = (s) => String(s || '').trim().toLowerCase();

export default async (req) => {
  try {
    return await handle(req);
  } catch (e) {
    console.error(e);
    return json(500, { error: 'Server error: ' + (e?.message || String(e)) });
  }
};

async function handle(req) {
  if (req.method !== 'POST') return json(405, { error: 'Use POST' });
  const url = (process.env.SUPABASE_URL || config.supabaseUrl || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) return json(500, { error: 'The server is missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. See SETUP-ADMIN-AND-ORDERS.md.' });
  // Realtime is never used here; the stand-in transport keeps older Node versions (no built-in WebSocket) working.
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { transport: globalThis.WebSocket || class NoWebSocket {} } });

  // Who is calling?
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: who, error: whoErr } = await sb.auth.getUser(token);
  if (!who?.user) return json(401, { error: /api key/i.test(whoErr?.message || '') ? 'The Supabase secret key in Netlify is not valid. Copy it again from Supabase → Project Settings → API Keys.' : 'Please log in again.' });
  const { data: me } = await sb.from('profiles').select('role, active').eq('id', who.user.id).maybeSingle();
  if (!me || !me.active || me.role !== 'admin') return json(403, { error: 'Only an admin can manage staff.' });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'Bad request' }); }
  const password = String(body.password || '');

  if (body.action === 'create') {
    const staffId = cleanId(body.staffId);
    if (!/^[a-z0-9][a-z0-9._-]{2,30}$/.test(staffId)) return json(400, { error: 'Staff ID: 3–31 letters or numbers (dots, dashes and underscores allowed), no spaces.' });
    if (password.length < 8) return json(400, { error: 'Password must be at least 8 characters.' });
    const role = body.role === 'admin' ? 'admin' : 'staff';
    const email = `${staffId}@${config.staffEmailDomain}`;
    const { data: made, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { staff_id: staffId } });
    if (error) return json(400, { error: /already/i.test(error.message) ? 'That Staff ID is already taken.' : error.message });
    const { error: pErr } = await sb.from('profiles').insert({ id: made.user.id, staff_id: staffId, full_name: String(body.fullName || '').trim() || staffId, role });
    if (pErr) { await sb.auth.admin.deleteUser(made.user.id); return json(400, { error: pErr.message }); }
    return json(200, { ok: true, staffId });
  }

  if (body.action === 'password') {
    if (password.length < 8) return json(400, { error: 'Password must be at least 8 characters.' });
    const userId = String(body.userId || '');
    if (!/^[0-9a-f-]{36}$/i.test(userId)) return json(400, { error: 'Unknown staff member.' });
    const { data: target } = await sb.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (!target) return json(404, { error: 'Unknown staff member.' });
    const { error } = await sb.auth.admin.updateUserById(userId, { password });
    if (error) return json(400, { error: error.message });
    return json(200, { ok: true });
  }

  return json(400, { error: 'Unknown action' });
}
