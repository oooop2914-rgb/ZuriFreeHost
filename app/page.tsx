import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="wrap" style={{ maxWidth: 640 }}>
        <div className="mono" style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 16 }}>$ uptime 99.2%</div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,46px)', lineHeight: 1.15, margin: '0 0 16px' }}>Server lo, online, tanpa keluar duit.</h1>
        <p className="muted" style={{ fontSize: 16, maxWidth: 480, marginBottom: 28 }}>
          Deploy Minecraft, Node.js, Python, sampe static site langsung dari dashboard.
          Kumpulin token lewat quest, minigame, atau referral buat claim server.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" className="btn btn-solid">Mulai Gratis</Link>
          <Link href="/dashboard" className="btn">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
