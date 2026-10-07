'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  RotateCw, Hash, Zap, Brain, Ticket, Dices, Gift, Star, Gem, Cherry, Citrus,
  Trophy, ArrowLeft, CircleHelp, type LucideIcon,
} from 'lucide-react';

type GameStatus = { playedToday: boolean; reward?: number; detail?: any };
type Status = Record<string, GameStatus>;

const GAMES: { code: string; title: string; desc: string; icon: LucideIcon }[] = [
  { code: 'spin', title: 'Spin Wheel', desc: 'Putar roda, hadiah 5-30 token', icon: RotateCw },
  { code: 'guess', title: 'Tebak Angka', desc: 'Tebak 1-6, bener = 60 token', icon: Hash },
  { code: 'reaction', title: 'Reaction Test', desc: 'Klik secepat mungkin, maks 35 token', icon: Zap },
  { code: 'quiz', title: 'Kuis Cepat', desc: 'Jawab bener = 30 token', icon: Brain },
  { code: 'scratch', title: 'Kartu Gosok', desc: 'Gosok, ada jackpot 100 token', icon: Ticket },
  { code: 'slot', title: 'Slot Machine', desc: '3 simbol sama = jackpot 150', icon: Dices },
];

export default function Minigame() {
  const [status, setStatus] = useState<Status>({});
  const [active, setActive] = useState<string | null>(null);

  async function loadStatus() {
    const r = await apiFetch('/minigame/status');
    const j = await r.json();
    setStatus(j.status || {});
  }
  useEffect(() => { loadStatus(); }, []);

  if (active) {
    const game = GAMES.find(g => g.code === active)!;
    return <GamePlay game={game} status={status[active]} onDone={loadStatus} onBack={() => setActive(null)} />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
      {GAMES.map(g => {
        const s = status[g.code];
        const Icon = g.icon;
        return (
          <div key={g.code} className="card" style={{ textAlign: 'center', cursor: 'pointer', marginBottom: 0 }} onClick={() => setActive(g.code)}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div className="icon-tile"><Icon size={26} /></div>
            </div>
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
function GamePlay({ game, status, onDone, onBack }: { game: (typeof GAMES)[number]; status?: GameStatus; onDone: () => void; onBack: () => void }) {
  const Icon = game.icon;
  return (
    <div className="card" style={{ textAlign: 'center', padding: 36, maxWidth: 460, margin: '0 auto' }}>
      <button className="btn btn-sm" style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={onBack}>
        <ArrowLeft size={14} /> Kembali
      </button>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><div className="icon-tile"><Icon size={28} /></div></div>
      <h3 style={{ fontSize: 19 }}>{game.title}</h3>
      <p className="sub">{game.desc}</p>

      {status?.playedToday ? (
        <p className="msg" style={{ color: 'var(--accent)' }}>Kamu udah main hari ini, dapet +{status.reward} token. Balik lagi besok.</p>
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

function ResultMsg({ msg, good }: { msg: string; good?: boolean }) {
  return (
    <p className="msg" style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: good ? 'var(--accent)' : 'var(--text)' }}>
      {good && <Trophy size={16} />} {msg}
    </p>
  );
}

function SpinGame({ onDone }: { onDone: () => void }) {
  const [spinning, setSpinning] = useState(false);
  const [msg, setMsg] = useState('');
  const [good, setGood] = useState(false);
  async function play() {
    setSpinning(true);
    const res = await apiFetch('/minigame/play', { method: 'POST', body: JSON.stringify({ game: 'spin' }) });
    const j = await res.json();
    setTimeout(() => { setSpinning(false); setGood(res.ok); setMsg(res.ok ? `Kamu dapat +${j.reward} token` : j.error); onDone(); }, 900);
  }
  return (
    <>
      <div style={{
        width: 140, height: 140, margin: '20px auto', borderRadius: '50%',
        background: 'conic-gradient(from 0deg,#06B6D4,#6366F1,#FFC069,#06B6D4)',
        transition: 'transform 1s cubic-bezier(.2,.8,.2,1)', transform: spinning ? 'rotate(1080deg)' : 'rotate(0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 36px rgba(6,182,212,.3)',
      }}>
        <div className="glass" style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RotateCw size={22} /></div>
      </div>
      <button className="btn btn-solid" disabled={spinning} onClick={play}>{spinning ? 'Muter...' : 'Putar'}</button>
      {msg && <ResultMsg msg={msg} good={good} />}
    </>
  );
}

function GuessGame({ onDone }: { onDone: () => void }) {
  const [msg, setMsg] = useState('');
  const [good, setGood] = useState(false);
  const [busy, setBusy] = useState(false);
  async function guess(n: number) {
    setBusy(true);
    const res = await apiFetch('/minigame/play', { method: 'POST', body: JSON.stringify({ game: 'guess', payload: { guess: n } }) });
    const j = await res.json();
    setBusy(false);
    setGood(!!j.win);
    setMsg(res.ok ? (j.win ? `Tepat, angkanya ${j.secret}. +${j.reward} token` : `Meleset, angkanya ${j.secret}. Tetap dapat +${j.reward} token`) : j.error);
    onDone();
  }
  return (
    <>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '16px 0' }}>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <button key={n} disabled={busy} className="btn" style={{ width: 46, height: 46, fontSize: 16 }} onClick={() => guess(n)}>{n}</button>
        ))}
      </div>
      {msg && <ResultMsg msg={msg} good={good} />}
    </>
  );
}

function ReactionGame({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'wait' | 'go'>('idle');
  const [msg, setMsg] = useState('');
  const [good, setGood] = useState(false);
  const [startTime, setStartTime] = useState(0);

  function start() {
    setPhase('wait'); setMsg('');
    const delay = 1200 + Math.random() * 2000;
    setTimeout(() => { setStartTime(Date.now()); setPhase('go'); }, delay);
  }
  async function click() {
    if (phase !== 'go') { setMsg('Kecepetan, tunggu sampai hijau.'); setGood(false); setPhase('idle'); return; }
    const ms = Date.now() - startTime;
    const res = await apiFetch('/minigame/play', { method: 'POST', body: JSON.stringify({ game: 'reaction', payload: { ms } }) });
    const j = await res.json();
    setPhase('idle');
    setGood(res.ok);
    setMsg(res.ok ? `Reaksi ${ms} ms, +${j.reward} token` : j.error);
    onDone();
  }
  return (
    <>
      {phase === 'idle' && <button className="btn btn-solid" onClick={start}>Mulai</button>}
      {phase === 'wait' && <div className="card" style={{ background: 'rgba(255,107,107,.12)', padding: 30, cursor: 'pointer', marginBottom: 0 }} onClick={click}>Tunggu warna hijau...</div>}
      {phase === 'go' && <div className="card" style={{ background: 'rgba(6,182,212,.22)', padding: 30, cursor: 'pointer', marginBottom: 0 }} onClick={click}>KLIK SEKARANG</div>}
      {msg && <ResultMsg msg={msg} good={good} />}
    </>
  );
}

function QuizGame({ onDone }: { onDone: () => void }) {
  const [q, setQ] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [good, setGood] = useState(false);
  useEffect(() => { apiFetch('/minigame/quiz').then(r => r.json()).then(setQ); }, []);
  async function answer(idx: number) {
    const res = await apiFetch('/minigame/play', { method: 'POST', body: JSON.stringify({ game: 'quiz', payload: { questionId: q.questionId, answerIndex: idx } }) });
    const j = await res.json();
    setGood(!!j.correct);
    setMsg(res.ok ? (j.correct ? `Bener. +${j.reward} token` : `Salah, jawaban benar: ${q.options[j.correctIndex]}. +${j.reward} token`) : j.error);
    onDone();
  }
  if (!q) return <p className="muted">Loading soal...</p>;
  return (
    <>
      <p style={{ margin: '16px 0', fontWeight: 600 }}>{q.question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {q.options.map((opt: string, i: number) => (
          <button key={i} className="btn" disabled={!!msg} onClick={() => answer(i)}>{opt}</button>
        ))}
      </div>
      {msg && <ResultMsg msg={msg} good={good} />}
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
    setMsg(res.ok ? `Kamu dapat +${j.reward} token` : j.error);
    onDone();
  }
  return (
    <>
      <div className="card" style={{
        padding: 30, margin: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        background: revealed ? 'rgba(6,182,212,.15)' : 'rgba(255,255,255,.05)', cursor: revealed ? 'default' : 'pointer',
      }} onClick={!revealed ? scratch : undefined}>
        {revealed ? <Gift size={34} color="var(--accent)" /> : <CircleHelp size={34} />}
        <span className="muted" style={{ fontSize: 13 }}>{revealed ? 'Terbuka' : 'Klik buat gosok kartu'}</span>
      </div>
      {msg && <ResultMsg msg={msg} good />}
    </>
  );
}

const SLOT_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  cherry: { icon: Cherry, color: '#FF6B6B' },
  lemon: { icon: Citrus, color: '#FFC069' },
  star: { icon: Star, color: '#FFC069' },
  diamond: { icon: Gem, color: '#06B6D4' },
};

function SlotGame({ onDone }: { onDone: () => void }) {
  const [reels, setReels] = useState<string[]>(['?', '?', '?']);
  const [spinning, setSpinning] = useState(false);
  const [msg, setMsg] = useState('');
  const [good, setGood] = useState(false);
  async function play() {
    setSpinning(true);
    const res = await apiFetch('/minigame/play', { method: 'POST', body: JSON.stringify({ game: 'slot' }) });
    const j = await res.json();
    setTimeout(() => {
      setSpinning(false);
      if (res.ok) { setReels(j.roll); setGood(j.reward >= 20); setMsg(`Kamu dapat +${j.reward} token`); } else setMsg(j.error);
      onDone();
    }, 700);
  }
  return (
    <>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '20px 0' }}>
        {reels.map((r, i) => {
          const s = SLOT_ICONS[r];
          const Icon = spinning ? Dices : s ? s.icon : CircleHelp;
          return (
            <div key={i} className="glass" style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={30} color={s && !spinning ? s.color : 'var(--muted)'} />
            </div>
          );
        })}
      </div>
      <button className="btn btn-solid" disabled={spinning} onClick={play}>{spinning ? 'Muter...' : 'Tarik Tuas'}</button>
      {msg && <ResultMsg msg={msg} good={good} />}
    </>
  );
}
