'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type GameStatus = { playedToday: boolean; reward?: number; detail?: any };
type Status = Record<string, GameStatus>;

export default function Minigame() {
  const [status, setStatus] = useState<Status>({});
  const [active, setActive] = useState<string | null>(null);

  async function loadStatus() {
    const r = await apiFetch('/minigame/status');
    const j = await r.json();
    setStatus(j.status || {});
  }
  useEffect(() => { loadStatus(); }, []);

  const GAMES = [
    { code: 'spin', title: 'Spin Wheel', desc: 'Putar roda, hadiah 5-30 token', emoji: '🎰' },
    { code: 'guess', title: 'Tebak Angka', desc: 'Tebak 1-6, bener = 60 token', emoji: '🔢' },
    { code: 'reaction', title: 'Reaction Test', desc: 'Klik secepat mungkin, maks 35 token', emoji: '⚡' },
    { code: 'quiz', title: 'Kuis Cepat', desc: 'Jawab bener = 30 token', emoji: '🧠' },
    { code: 'scratch', title: 'Kartu Gosok', desc: 'Gosok, ada jackpot 100 token', emoji: '🎫' },
    { code: 'slot', title: 'Slot Machine', desc: '3 simbol sama = jackpot 150', emoji: '🎲' },
  ];

  if (active) {
    const game = GAMES.find(g => g.code === active)!;
    return <GamePlay game={game} status={status[active]} onDone={() => { loadStatus(); }} onBack={() => setActive(null)} />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
      {GAMES.map(g => {
        const s = status[g.code];
        return (
          <div key={g.code} className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActive(g.code)}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{g.emoji}</div>
            <h3>{g.title}</h3>
            <p className="sub">{g.desc}</p>
            {s?.playedToday
              ? <span className="pill on"><span className="dt" />Udah main (+{s.reward})</span>
              : <span className="pill warn"><span className="dt" />Belum main hari ini</span>}
          </div>
        );
      })}
    </div>
  );
}

// ================= Game player =================
function GamePlay({ game, status, onDone, onBack }: { game: any; status?: GameStatus; onDone: () => void; onBack: () => void }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 36, maxWidth: 460, margin: '0 auto' }}>
      <button className="btn btn-sm" style={{ marginBottom: 16 }} onClick={onBack}>← Kembali</button>
      <div style={{ fontSize: 46, marginBottom: 6 }}>{game.emoji}</div>
      <h3 style={{ fontSize: 19 }}>{game.title}</h3>
      <p className="sub">{game.desc}</p>

      {status?.playedToday ? (
        <p className="msg" style={{ color: 'var(--accent)' }}>Kamu udah main hari ini, dapet +{status.reward} token. Balik lagi besok!</p>
      ) : (
        <>
          {game.code === 'spin' && <SpinGame onDone={onDone} />}
          {game.code === 'guess' && <GuessGame onDone={onDone} />}
          {game.code === 'reaction' && <ReactionGame onDone={onDone} />}
          {game.code === 'quiz' && <QuizGame onDone={onDone} />}
          {game.code === 'scratch' && <ScratchGame onDone={onDone} />}
          {game.code === 'slot' && <SlotGame onDone={onDone} />}
        </>
      )}
    </div>
  );
}

function ResultMsg({ msg }: { msg: string }) {
  return <p className="msg" style={{ marginTop: 14 }}>{msg}</p>;
}

function SpinGame({ onDone }: { onDone: () => void }) {
  const [spinning, setSpinning] = useState(false);
  const [msg, setMsg] = useState('');
  async function play() {
    setSpinning(true);
    const res = await apiFetch('/minigame/play', { method: 'POST', body: JSON.stringify({ game: 'spin' }) });
    const j = await res.json();
    setTimeout(() => { setSpinning(false); setMsg(res.ok ? `Selamat! +${j.reward} token 🎉` : j.error); onDone(); }, 900);
  }
  return (
    <>
      <div style={{ width: 140, height: 140, margin: '20px auto', borderRadius: '50%', background: 'conic-gradient(from 0deg,#3DE8C0,#5B8CFF,#FFC069,#3DE8C0)', transition: 'transform 1s cubic-bezier(.2,.8,.2,1)', transform: spinning ? 'rotate(1080deg)' : 'rotate(0)' }} />
      <button className="btn btn-solid" disabled={spinning} onClick={play}>{spinning ? 'Muter...' : 'Putar'}</button>
      {msg && <ResultMsg msg={msg} />}
    </>
  );
}

function GuessGame({ onDone }: { onDone: () => void }) {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  async function guess(n: number) {
    setBusy(true);
    const res = await apiFetch('/minigame/play', { method: 'POST', body: JSON.stringify({ game: 'guess', payload: { guess: n } }) });
    const j = await res.json();
    setBusy(false);
    setMsg(res.ok ? (j.win ? `Tepat! Angkanya ${j.secret}. +${j.reward} token 🎉` : `Meleset, angkanya ${j.secret}. Tetep dapet +${j.reward} token.`) : j.error);
    onDone();
  }
  return (
    <>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '16px 0' }}>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <button key={n} disabled={busy} className="btn" style={{ width: 44, height: 44, fontSize: 16 }} onClick={() => guess(n)}>{n}</button>
        ))}
      </div>
      {msg && <ResultMsg msg={msg} />}
    </>
  );
}

function ReactionGame({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'wait' | 'go'>('idle');
  const [msg, setMsg] = useState('');
  const [startTime, setStartTime] = useState(0);

  function start() {
    setPhase('wait'); setMsg('');
    const delay = 1200 + Math.random() * 2000;
    setTimeout(() => { setStartTime(Date.now()); setPhase('go'); }, delay);
  }
  async function click() {
    if (phase !== 'go') { setMsg('Kecepetan! Tunggu sampe ijo.'); setPhase('idle'); return; }
    const ms = Date.now() - startTime;
    const res = await apiFetch('/minigame/play', { method: 'POST', body: JSON.stringify({ game: 'reaction', payload: { ms } }) });
    const j = await res.json();
    setPhase('idle');
    setMsg(res.ok ? `Reaksi ${ms}ms — +${j.reward} token!` : j.error);
    onDone();
  }
  return (
    <>
      {phase === 'idle' && <button className="btn btn-solid" onClick={start}>Mulai</button>}
      {phase === 'wait' && <div className="card" style={{ background: 'rgba(255,107,107,.12)', padding: 30, cursor: 'not-allowed' }}>Tunggu warna ijo...</div>}
      {phase === 'go' && <div className="card" style={{ background: 'rgba(61,232,192,.2)', padding: 30, cursor: 'pointer' }} onClick={click}>KLIK SEKARANG!</div>}
      {msg && <ResultMsg msg={msg} />}
    </>
  );
}

function QuizGame({ onDone }: { onDone: () => void }) {
  const [q, setQ] = useState<any>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { apiFetch('/minigame/quiz').then(r => r.json()).then(setQ); }, []);
  async function answer(idx: number) {
    const res = await apiFetch('/minigame/play', { method: 'POST', body: JSON.stringify({ game: 'quiz', payload: { questionId: q.questionId, answerIndex: idx } }) });
    const j = await res.json();
    setMsg(res.ok ? (j.correct ? `Bener! +${j.reward} token 🎉` : `Salah, jawaban benar: ${q.options[j.correctIndex]}. +${j.reward} token.`) : j.error);
    onDone();
  }
  if (!q) return <p className="muted">Loading soal...</p>;
  return (
    <>
      <p style={{ margin: '16px 0', fontWeight: 600 }}>{q.question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {q.options.map((opt: string, i: number) => (
          <button key={i} className="btn" onClick={() => answer(i)}>{opt}</button>
        ))}
      </div>
      {msg && <ResultMsg msg={msg} />}
    </>
  );
}

function ScratchGame({ onDone }: { onDone: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [msg, setMsg] = useState('');
  async function scratch() {
    setRevealed(true);
    const res = await apiFetch('/minigame/play', { method: 'POST', body: JSON.stringify({ game: 'scratch' }) });
    const j = await res.json();
    setMsg(res.ok ? `Kamu dapat +${j.reward} token!` : j.error);
    onDone();
  }
  return (
    <>
      <div className="card" style={{ padding: 30, margin: '16px 0', background: revealed ? 'rgba(61,232,192,.15)' : 'rgba(255,255,255,.05)', cursor: revealed ? 'default' : 'pointer', fontSize: 24 }} onClick={!revealed ? scratch : undefined}>
        {revealed ? '🎁' : '❓ Klik buat gosok'}
      </div>
      {msg && <ResultMsg msg={msg} />}
    </>
  );
}

function SlotGame({ onDone }: { onDone: () => void }) {
  const [reels, setReels] = useState(['❔', '❔', '❔']);
  const [spinning, setSpinning] = useState(false);
  const [msg, setMsg] = useState('');
  async function play() {
    setSpinning(true);
    const res = await apiFetch('/minigame/play', { method: 'POST', body: JSON.stringify({ game: 'slot' }) });
    const j = await res.json();
    setTimeout(() => {
      setSpinning(false);
      if (res.ok) { setReels(j.roll); setMsg(`+${j.reward} token!`); } else setMsg(j.error);
      onDone();
    }, 700);
  }
  return (
    <>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', fontSize: 40, margin: '20px 0' }}>
        {reels.map((r, i) => <div key={i} className="glass" style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{spinning ? '🎰' : r}</div>)}
      </div>
      <button className="btn btn-solid" disabled={spinning} onClick={play}>{spinning ? 'Muter...' : 'Tarik Tuas'}</button>
      {msg && <ResultMsg msg={msg} />}
    </>
  );
}
