'use client';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [myId, setMyId] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const r = await apiFetch('/chat/messages');
    const j = await r.json();
    setMessages(j.messages || []);
  }

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => setMyId(data.session?.user.id || ''));
    load();
    // polling tiap 4 detik — bukan websocket, cocok buat di belakang NAT/tunnel
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await apiFetch('/chat/messages', { method: 'POST', body: JSON.stringify({ message: text }) });
    if (res.ok) { setText(''); load(); }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
      <h3>Chat Publik</h3>
      <p className="sub">Update tiap 4 detik — semua user bisa lihat.</p>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0' }}>
        {messages.map(m => {
          const mine = m.user_id === myId;
          return (
            <div key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
              <div className="muted" style={{ fontSize: 11, marginBottom: 3, textAlign: mine ? 'right' : 'left' }}>{m.profiles?.username}</div>
              <div style={{
                padding: '9px 13px', borderRadius: 14,
                background: mine ? 'linear-gradient(135deg,var(--accent),var(--accent-2))' : 'rgba(255,255,255,.06)',
                color: mine ? '#032019' : 'var(--text)', fontSize: 13.5,
                border: mine ? 'none' : '1px solid var(--border)',
              }}>{m.message}</div>
            </div>
          );
        })}
        {messages.length === 0 && <p className="muted">Belum ada pesan. Mulai obrolan!</p>}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Tulis pesan..." maxLength={500}
          style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', borderRadius: 999, padding: '10px 16px', color: 'var(--text)' }} />
        <button className="btn btn-solid" type="submit">Kirim</button>
      </form>
    </div>
  );
}
