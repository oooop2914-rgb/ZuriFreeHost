'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api';

export default function Overview() {
  const [profile, setProfile] = useState<any>(null);
  const [servers, setServers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    if (!sessionData.session) return;
    const { data: p } = await supabaseBrowser.from('profiles').select('*').eq('id', sessionData.session.user.id).single();
    setProfile(p);
    const [sRes, aRes] = await Promise.all([apiFetch('/servers'), apiFetch('/announcements')]);
    setServers((await sRes.json()).servers || []);
    setAnnouncements((await aRes.json()).announcements || []);
  }
  useEffect(() => { load(); }, []);

  async function checkin() {
    const res = await apiFetch('/me/checkin', { method: 'POST' });
    const j = await res.json();
    setMsg(res.ok ? `+${j.reward} token! Streak hari ke-${j.streak}.` : j.error);
    load();
  }

  if (!profile) return <div className="muted">Loading...</div>;

  return (
    <>
      {announcements.map(a => (
        <div key={a.id} className="card" style={{ borderColor: 'rgba(61,232,192,.35)', background: 'rgba(61,232,192,.08)' }}>
          <b style={{ color: 'var(--accent)' }}>{a.title}</b>
          <p className="muted" style={{ fontSize: 13, margin: '6px 0 0' }}>{a.body}</p>
        </div>
      ))}
      <div className="kpis">
        <div className="kpi"><div className="lbl">Saldo token</div><div className="val" style={{ color: 'var(--accent)' }}>{profile.token_balance}</div></div>
        <div className="kpi"><div className="lbl">Server aktif</div><div className="val">{servers.filter((s: any) => s.status !== 'deleted').length}</div></div>
        <div className="kpi"><div className="lbl">Streak check-in</div><div className="val">{profile.streak_count} hari</div></div>
        <div className="kpi"><div className="lbl">Kode referral</div><div className="val" style={{ fontSize: 15 }}>{profile.referral_code}</div></div>
      </div>
      {msg && <div className="card msg">{msg}</div>}
      <div className="card">
        <h3>Check-in Harian</h3>
        <p className="sub">Makin panjang streak, makin gede reward-nya (maks 50 token/hari).</p>
        <button className="btn btn-solid" onClick={checkin}>Check-in Sekarang</button>
      </div>
    </>
  );
}
