import Link from 'next/link';
import {
  Gamepad2, Layers, Terminal, HardDriveDownload, Globe, LayoutDashboard,
  CalendarCheck, CheckSquare, Dices, Users, Gift, Wallet, Server, Rocket,
} from 'lucide-react';

const FEATURES = [
  { icon: Gamepad2, title: 'Minecraft Server', text: 'Vanilla, Paper, atau Forge. Deploy otomatis lewat Pterodactyl, kontrol start, stop, dan restart dari dashboard.' },
  { icon: Layers, title: 'Node.js Hosting', text: 'Jalanin bot, API, atau web app Node.js. Port dan environment di-setup otomatis, tinggal upload project.' },
  { icon: Terminal, title: 'Python Hosting', text: 'Bot Telegram atau Discord, script otomatisasi, sampai web app Flask dan Django jalan terus 24/7.' },
  { icon: HardDriveDownload, title: 'Install Pterodactyl Otomatis', badge: 'subdomain gratis', gold: true,
    text: 'Punya VPS sendiri? Panel Pterodactyl terpasang otomatis lengkap dengan SSL dan subdomain gratis, tanpa ketik satu perintah pun.' },
  { icon: Globe, title: 'Subdomain Otomatis', badge: 'via Cloudflare',
    text: 'Pilih nama, arahkan ke IP atau domain kamu. DNS langsung aktif tanpa nunggu persetujuan admin.' },
  { icon: LayoutDashboard, title: 'Dashboard Lengkap', text: 'Pantau saldo token, kontrol server, ngobrol di chat komunitas, dan cek riwayat transaksi dalam satu tampilan.' },
];

const TOKEN_WAYS = [
  { icon: CalendarCheck, title: 'Check-in Harian', text: 'Login tiap hari, makin panjang streak makin gede bonus token-nya.' },
  { icon: CheckSquare, title: 'Quest', text: 'Selesaikan misi harian dan mingguan, dari join grup WhatsApp sampai ajak teman.' },
  { icon: Dices, title: '6 Minigame', text: 'Spin wheel, tebak angka, reaction test, kuis, kartu gosok, dan slot. Masing-masing sekali sehari.' },
  { icon: Users, title: 'Referral', text: 'Bagikan link kamu, dapat token tiap teman yang berhasil deploy server pertamanya.' },
  { icon: Gift, title: 'Giveaway', text: 'Ikut giveaway berkala buat dapetin token dan hadiah dari admin.' },
  { icon: Wallet, title: 'Riwayat Transparan', text: 'Setiap token masuk dan keluar tercatat di wallet, gak ada yang misterius.' },
];

const PREVIEW_ROWS = [
  { name: 'survival-01', type: 'minecraft', meta: '2 GB RAM', status: 'online' },
  { name: 'discord-bot', type: 'nodejs', meta: '512 MB RAM', status: 'online' },
  { name: 'auto-report', type: 'python', meta: '512 MB RAM', status: 'stopped' },
];

export default function Home() {
  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-nav-in">
          <div className="lp-brand"><span className="dot" />ZuriHost</div>
          <nav className="lp-links">
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#token">Token</a>
          </nav>
          <div className="lp-cta">
            <Link href="/login" className="btn btn-sm">Login</Link>
            <Link href="/login" className="btn btn-sm btn-solid">Mulai Gratis</Link>
          </div>
        </div>
      </header>

      <section className="lp-section lp-hero">
        <div className="lp-kicker">hosting gratis, bayar pakai token</div>
        <h1 className="mono">Server lo, online, tanpa keluar duit.</h1>
        <p className="lp-sub">
          Deploy Minecraft, Node.js, dan Python langsung dari dashboard. Kumpulin token lewat quest dan minigame,
          lalu tuker jadi server, subdomain, atau install panel Pterodactyl otomatis.
        </p>
        <div className="lp-actions">
          <Link href="/login" className="btn btn-solid btn-icon"><Rocket size={16} /> Deploy server pertama</Link>
          <a href="#panel" className="btn">Lihat dashboard</a>
        </div>
        <div className="lp-stats">
          <div className="lp-stat"><b>0</b><span>biaya buat mulai</span></div>
          <div className="lp-stat"><b>6</b><span>minigame token harian</span></div>
          <div className="lp-stat"><b>Auto</b><span>deploy, subdomain, install</span></div>
        </div>

        <div className="glass lp-console">
          <div className="lp-console-bar"><span /><span /><span /></div>
          <div className="lp-console-body">
            <div>&gt; claim server --type minecraft --version paper-1.21</div>
            <div>&gt; allocating RAM, disk, port...</div>
            <div className="ok">&gt; server &quot;survival-01&quot; is online</div>
            <div>&gt; subdomain survival.zurihost.my.id aktif</div>
          </div>
        </div>
      </section>

      <section id="fitur" className="lp-section">
        <div className="lp-eyebrow">apa yang bisa lo jalanin</div>
        <h2 className="lp-h2 mono">Satu panel, semua jenis project.</h2>
        <p className="lp-lead">Berbasis Pterodactyl. Kelola server, subdomain, dan token dari satu tempat.</p>
        <div className="lp-grid">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="glass lp-card">
                {f.badge && <span className={`lp-badge ${f.gold ? '' : 'accent'}`}>{f.badge}</span>}
                <div className={`icon-tile ${f.gold ? 'gold' : ''}`}><Icon size={24} /></div>
                <h3 className="mono">{f.title}</h3>
                <p>{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="cara-kerja" className="lp-section">
        <div className="lp-eyebrow">alur singkat</div>
        <h2 className="lp-h2 mono">Dari daftar sampai online.</h2>
        <p className="lp-lead">Tiga langkah, tanpa kartu kredit.</p>
        <div className="lp-steps">
          <div className="glass lp-step"><div className="num">01</div><h3 className="mono">Daftar akun</h3><p>Buat akun gratis, verifikasi email lewat kode OTP 6 digit. Gak sampai satu menit.</p></div>
          <div className="glass lp-step"><div className="num">02</div><h3 className="mono">Kumpulin token</h3><p>Check-in harian, quest, minigame, dan referral. Semuanya gratis dan tercatat di wallet.</p></div>
          <div className="glass lp-step"><div className="num">03</div><h3 className="mono">Claim dan kelola</h3><p>Tuker token jadi server, subdomain, atau install Pterodactyl. Pantau dari dashboard.</p></div>
        </div>
      </section>

      <section id="token" className="lp-section">
        <div className="lp-eyebrow">ekonomi token</div>
        <h2 className="lp-h2 mono">Cara dapetin token.</h2>
        <p className="lp-lead">Gak ada paywall. Makin aktif, makin banyak yang bisa lo claim.</p>
        <div className="lp-grid">
          {TOKEN_WAYS.map(t => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="glass lp-card">
                <div className="icon-tile"><Icon size={24} /></div>
                <h3 className="mono">{t.title}</h3>
                <p>{t.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="panel" className="lp-section">
        <div className="lp-eyebrow">preview dashboard</div>
        <h2 className="lp-h2 mono">Kontrol penuh, tanpa command line.</h2>
        <p className="lp-lead">Gambaran tampilan dashboard setelah server lo online.</p>
        <div className="glass lp-panel">
          <div className="lp-panel-tabs">
            {['Overview', 'Quest', 'Minigame', 'Claim', 'Server Saya'].map((t, i) => (
              <div key={t} className={`lp-panel-tab ${i === 4 ? 'active' : ''}`}>{t}</div>
            ))}
          </div>
          {PREVIEW_ROWS.map(r => (
            <div key={r.name} className="lp-row">
              <div className="name"><Server size={16} color="var(--muted)" />{r.name} <span className="muted" style={{ fontSize: 12 }}>({r.type})</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span className="meta">{r.meta}</span>
                <span className={`pill ${r.status === 'online' ? 'on' : 'off'}`}><span className="dt" />{r.status}</span>
              </div>
            </div>
          ))}
          <div className="lp-row">
            <div className="name"><Globe size={16} color="var(--muted)" />toko.zurihost.my.id <span className="muted" style={{ fontSize: 12 }}>(A)</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="meta">203.0.113.10</span>
              <span className="pill on"><span className="dt" />aktif</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-in">
          <div className="lp-brand"><span className="dot" />ZuriHost</div>
          <p className="muted" style={{ fontSize: 13, margin: 0, maxWidth: 420 }}>
            Hosting gratis buat belajar dan eksperimen, bukan pengganti server production yang serius.
          </p>
          <Link href="/login" className="btn btn-sm">Masuk ke dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
