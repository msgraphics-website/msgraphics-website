// Browser-side Supabase client for /track/ and /staff/. Returns null until
// supabaseUrl and supabaseAnonKey are filled in src/config/site.config.js.
import { createClient } from '@supabase/supabase-js';
import config from '../config/site.config.js';

export const supa = config.supabaseUrl && config.supabaseAnonKey
  ? createClient(config.supabaseUrl, config.supabaseAnonKey, { auth: { persistSession: true, storageKey: 'msg-staff' } })
  : null;

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmtDate = (d, time = false) => d ? new Date(d).toLocaleString('en-IN', time ? { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' } : { day: 'numeric', month: 'short', year: 'numeric' }) : '';
