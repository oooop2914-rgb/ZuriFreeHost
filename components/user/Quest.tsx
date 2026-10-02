'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function Quest() {
  const [msg, setMsg] = useState('');

  async function doQuest(code: string, link?: string) {
    if (link) window.open(link, '_blank');
    const res = await apiFetch('/quests/complete', { method: 'POST', body: JSON.stringify({ code }) });
    const j = await res.json();
    setMsg(res.ok ? `+${j.reward} token dari quest!` : j.error);
  }

  return (
    <div className="card">
      <h3>Quest Harian</h3>
      <p className="sub">Selesaikan buat dapetin token gratis, reset tiap hari/minggu.</p>
      {msg && <p className="msg">{msg}</p>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => doQuest('join_wa_group', 'https://kua.lat/lAaGk')}>Join Grup WhatsApp <span className="token">+10</span></button>
        <button className="btn" onClick={() => doQuest('invite_friend')}>Klaim invite <span className="token">+50</span></button>
      </div>
    </div>
  );
}
