import Link from 'next/link';
export default function Home() {
  return (
    <div className="wrap" style={{ paddingTop: 80 }}>
      <h1 style={{ fontSize: 40, marginBottom: 12 }}>ZuriHost</h1>
      <p className="muted" style={{ maxWidth: 480, marginBottom: 28 }}>
        Hosting gratis Minecraft, Node.js, Python & static site. Kumpulin token
        lewat quest, minigame, atau referral buat claim server.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/login" className="btn btn-solid">Login / Daftar</Link>
        <Link href="/dashboard" className="btn">Dashboard</Link>
      </div>
    </div>
  );
}
