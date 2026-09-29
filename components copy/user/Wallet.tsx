'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api';

export default function Wallet() {
  const [profile, setProfile] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);

  async function load() {
    const { data: sessionData } = await supabaseBrowser.auth.getSession();
    if (!sessionData.session) return;
    const { data: p } = await supabaseBrowser.from('profiles').select('*').eq('id', sessionData.session.user.id).single();
    setProfile(p);
    const r = await apiFetch('/me/ledger');
    setLedger((await r.json()).ledger || []);
  }
  useEffect(() => { load(); }, []);

  if (!profile) return <div className="muted">Loading...</div>;

  return (
    <>
      <div className="kpis" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="kpi"><div className="lbl">Saldo token</div><div className="val" style={{ color: 'var(--accent)' }}>{profile.token_balance}</div></div>
        <div className="kpi"><div className="lbl">Kode referral</div><div className="val" style={{ fontSize: 15 }}>{profile.referral_code}</div></div>
      </div>
      <div className="card">
        <h3>Link Referral Kamu</h3>
        <p className="sub" style={{ marginBottom: 4 }}>Bagikan ke teman — kamu dapat +50 token pas mereka deploy server pertama.</p>
        <div className="token" style={{ fontSize: 13, wordBreak: 'break-all' }}>
          {typeof window !== 'undefined' ? window.location.origin : ''}/login?ref={profile.referral_code}
        </div>
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
    </>
  );
}
