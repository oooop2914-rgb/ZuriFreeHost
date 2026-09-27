// Helper buat manggil backend Express (bukan Next.js API routes lagi)
import { supabaseBrowser } from './supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const { data } = await supabaseBrowser.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res;
}
