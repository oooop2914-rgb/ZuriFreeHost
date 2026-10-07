// Helper fetch ke backend Express.
// Auth sekarang lewat cookie httpOnly (credentials:'include'),
// BUKAN header Authorization lagi -- frontend gak pernah pegang token.
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch(path: string, opts: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...opts,
    credentials: 'include',
    headers: { ...(opts.headers || {}), 'Content-Type': 'application/json' },
  });
}

/** Dipanggil sekali abis Supabase Auth berhasil login/signup/verifyOtp. */
export async function establishSession(accessToken: string) {
  const res = await fetch(`${API_URL}/auth/session`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken }),
  });
  return res.ok;
}

export async function clearSession() {
  await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
}
