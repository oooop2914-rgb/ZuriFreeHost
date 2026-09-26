'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';

type Profile = { id: string; username: string; token_balance: number; referral_code: string; role: string; streak_count: number };
type Server = { id: string; name: string; type: string; status: string };
type ServerType = { code: string; label: string; cost: number };
type LedgerRow = { id: string; amount: number; reason: string; created_at: string };
type Announcement = { id: string; title: string; body: string };

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [types, setTypes] = useState<ServerType[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  async function loadAll() {
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    if (!sessionData.session) { router.push('/login'); return; }

    const { data: p } = await supabaseBrowser.from('profiles').select('*').eq('id', sessionData.session.user.id).single();
    setProfile(p as Profile);
    setNewUsername((p as Profile)?.username || '');

    const [res, tRes, lRes, aRes] = await Promise.all([
      apiFetch('/servers'), apiFetch('/server-types'), apiFetch('/me/ledger'), apiFetch('/announcements'),
    ]);
    setServers((await res.json()).servers || []);
    setTypes((await tRes.json()).types || []);
    setLedger((await lRes.json()).ledger || []);
    setAnnouncements((await aRes.json()).announcements || []);
  }

  useEffect(() => { loadAll(); }, []);

  async function claim(type: string) {
    setBusy(true); setMsg('');
    const name = `${type}-${Math.random().toString(36).slice(2, 7)}`;
    const res = await apiFetch('/servers', { method: 'POST', body: JSON.stringify({ type, name }) });
    const j = await res.json();
    setBusy(false);
    setMsg(res.ok ? `Server "${name}" lagi di-deploy.` : j.error);
    loadAll();
  }

  async function doQuest(code: string) {
    const res = await apiFetch('/quests/complete', { method: 'POST', body: JSON.stringify({ code }) });
    const j = await res.json();
    setMsg(res.ok ? `+${j.reward} token dari quest!` : j.error);
    loadAll();
  }

  async function checkin() {
    const res = await apiFetch('/me/checkin', { method: 'POST' });
    const j = await res.json();
    setMsg(res.ok ? `+${j.reward} token! Streak hari ke-${j.streak}.` : j.error);
    loadAll();
  }

  async function saveUsername(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch('/me', { method: 'PATCH', body: JSON.stringify({ username: newUsername }) });
    const j = await res.json();
    setMsg(res.ok ? 'Username diupdate.' : j.error);
    if (res.ok) loadAll();
  }

  async function resetPassword() {
    if (!profile) return;
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    const email = sessionData.session?.user.email;
    if (!email) return;
    await supabaseBrowser.auth.resetPasswordForEmail(email);
    setMsg('Link reset password dikirim ke email kamu.');
  }

  async function power(id: string, signal: string) {
    setMsg('');
    const res = await apiFetch(`/servers/${id}/power`, { method: 'POST', body: JSON.stringify({ signal }) });
    const j = await res.json();
    setMsg(res.ok ? `Sinyal "${signal}" dikirim.` : j.error);
  }

  async function rename(id: string) {
    const name = prompt('Nama baru:');
    if (!name) return;
    await apiFetch(`/servers/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
    loadAll();
  }

  if (!profile) return <div className="wrap">Loading...</div>;

  return (
    <AppShell title="Dashboard" isAdmin={profile.role === 'admin'}>
      {announcements.map(a => (
        <div key={a.id} className="card" style={{ borderColor: 'var(--accent)', background: '#0F2B24' }}>
          <b style={{ color: 'var(--accent)' }}>{a.title}</b>
          <p className="muted" style={{ fontSize: 13, margin: '6px 0 0' }}>{a.body}</p>
        </div>
      ))}

      <div className="kpis">
        <div className="kpi"><div className="lbl">Saldo token</div><div className="val" style={{ color: 'var(--accent)' }}>{profile.token_balance}</div></div>
        <div className="kpi"><div className="lbl">Server aktif</div><div className="val">{servers.filter(s => s.status !== 'deleted').length}</div></div>
        <div className="kpi"><div className="lbl">Streak check-in</div><div className="val">{profile.streak_count} hari</div></div>
        <div className="kpi"><div className="lbl">Kode referral</div><div className="val" style={{ fontSize: 15 }}>{profile.referral_code}</div></div>
      </div>

      {msg && <div className="card msg">{msg}</div>}

      <div className="card">
        <h3>Check-in Harian</h3>
        <p className="sub">Makin panjang streak, makin gede reward-nya (maks 50 token/hari).</p>
        <button className="btn btn-solid" onClick={checkin}>Check-in Sekarang</button>
      </div>

      <div className="card">
        <h3>Link Referral Kamu</h3>
        <p className="sub" style={{ marginBottom: 4 }}>Bagikan ke teman — kamu dapat +50 token pas mereka deploy server pertama.</p>
        <div className="token" style={{ fontSize: 13, wordBreak: 'break-all' }}>
          {typeof window !== 'undefined' ? window.location.origin : ''}/login?ref={profile.referral_code}
        </div>
      </div>

      <div className="card">
        <h3>Quest Harian</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => doQuest('join_discord')}>Join Discord <span className="token">+10</span></button>
          <button className="btn" onClick={() => doQuest('invite_friend')}>Klaim invite <span className="token">+50</span></button>
        </div>
      </div>

      <div className="card">
        <h3>Claim Server Baru</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t.code} disabled={busy} className="btn btn-solid" onClick={() => claim(t.code)}>{t.label} — {t.cost} token</button>
          ))}
          {types.length === 0 && <p className="muted">Belum ada tipe server tersedia.</p>}
        </div>
      </div>

      <div className="card">
        <h3>Server Kamu</h3>
        <div className="scrollx">
          <table>
            <thead><tr><th>Nama</th><th>Tipe</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {servers.map(s => (
                <tr key={s.id}>
                  <td className="token">{s.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{s.type}</td>
                  <td><span className={`pill ${s.status === 'online' ? 'on' : s.status === 'installing' ? 'warn' : 'off'}`}><span className="dt" />{s.status}</span></td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" onClick={() => power(s.id, 'start')}>Start</button>
                    <button className="btn btn-sm" onClick={() => power(s.id, 'restart')}>Restart</button>
                    <button className="btn btn-sm" onClick={() => power(s.id, 'stop')}>Stop</button>
                    <button className="btn btn-sm" onClick={() => rename(s.id)}>Rename</button>
                  </td>
                </tr>
              ))}
              {servers.length === 0 && <tr><td colSpan={4} className="muted">Belum ada server.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Pengaturan Akun</h3>
        <form onSubmit={saveUsername} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={newUsername} onChange={e => setNewUsername(e.target.value)} style={{ flex: 1, background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 6, padding: '9px 11px', color: 'var(--text)' }} />
          <button className="btn" type="submit">Simpan Username</button>
        </form>
        <button className="btn" onClick={resetPassword}>Kirim Link Reset Password</button>
      </div>

      <div className="card">
        <h3>Riwayat Token</h3>
        <div className="scrollx">
          <table>
            <thead><tr><th>Waktu</th><th>Alasan</th><th>Jumlah</th></tr></thead>
            <tbody>
              {ledger.map(l => (
                <tr key={l.id}>
                  <td className="muted" style={{ fontSize: 12 }}>{new Date(l.created_at).toLocaleString('id-ID')}</td>
                  <td className="token">{l.reason}</td>
                  <td style={{ color: l.amount > 0 ? 'var(--accent)' : 'var(--red)' }}>{l.amount > 0 ? '+' : ''}{l.amount}</td>
                </tr>
              ))}
              {ledger.length === 0 && <tr><td colSpan={3} className="muted">Belum ada transaksi.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
