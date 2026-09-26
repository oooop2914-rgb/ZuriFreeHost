'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

type Profile = { id: string; username: string; token_balance: number; referral_code: string };
type Server = { id: string; name: string; type: string; status: string };

const COSTS: Record<string, number> = { minecraft: 80, nodejs: 40, python: 40 };

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    if (!sessionData.session) { router.push('/login'); return; }

    const { data: p } = await supabaseBrowser.from('profiles').select('*').eq('id', sessionData.session.user.id).single();
    setProfile(p as Profile);

    const res = await apiFetch('/servers'); // ⇒ backend Express, bukan Next.js API route
    const j = await res.json();
    setServers(j.servers || []);
  }

  useEffect(() => { loadAll(); }, []);

  async function claim(type: string) {
    setBusy(true); setMsg('');
    const name = `${type}-${Math.random().toString(36).slice(2, 7)}`;
    const res = await apiFetch('/servers', { method: 'POST', body: JSON.stringify({ type, name }) });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(j.error);
    setMsg(`Server "${name}" lagi di-deploy.`);
    loadAll();
  }

  async function doQuest(code: string) {
    const res = await apiFetch('/quests/complete', { method: 'POST', body: JSON.stringify({ code }) });
    const j = await res.json();
    setMsg(res.ok ? `+${j.reward} token dari quest!` : j.error);
    loadAll();
  }

  if (!profile) return <div className="wrap">Loading...</div>;

  return (
    <div className="wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Halo, {profile.username}</h2>
        <div className="token">{profile.token_balance} token</div>
      </div>

      {msg && <p className="card" style={{ fontSize: 13 }}>{msg}</p>}

      <div className="card">
        <h3>Kode Referral Kamu</h3>
        <p className="muted" style={{ fontSize: 13 }}>
          {typeof window !== 'undefined' ? window.location.origin : ''}/login?ref={profile.referral_code}
        </p>
      </div>

      <div className="card">
        <h3>Quest Harian</h3>
        <button className="btn" style={{ marginRight: 8 }} onClick={() => doQuest('join_discord')}>Join Discord (+10)</button>
        <button className="btn" onClick={() => doQuest('invite_friend')}>Klaim invite (+50)</button>
      </div>

      <div className="card">
        <h3>Claim Server Baru</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(COSTS).map(([type, cost]) => (
            <button key={type} disabled={busy} className="btn btn-solid" onClick={() => claim(type)}>{type} — {cost} token</button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Server Kamu</h3>
        <table>
          <thead><tr><th>Nama</th><th>Tipe</th><th>Status</th></tr></thead>
          <tbody>
            {servers.map(s => (<tr key={s.id}><td>{s.name}</td><td>{s.type}</td><td>{s.status}</td></tr>))}
            {servers.length === 0 && <tr><td colSpan={3} className="muted">Belum ada server.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
