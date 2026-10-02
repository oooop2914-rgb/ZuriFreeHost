'use client';
import { useEffect, useState } from 'react';
import { Sparkles, BadgeCheck, X } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { apiFetch } from '@/lib/api';
import { creatorSchema, verifiedSchema } from '@/lib/validation/roleApplication';

type RoleReq = 'creator' | 'verified';
interface App { id: string; role_requested: RoleReq; status: 'pending' | 'approved' | 'rejected'; rejection_reason?: string; created_at: string }

const EMPTY = { social_name: '', social_link: '', followers: '', reason: '', whatsapp: '', agreed_to_promote: false };

export default function Upgrade() {
  const [apps, setApps] = useState<App[]>([]);
  const [modal, setModal] = useState<RoleReq | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() { const r = await apiFetch('/role-applications/mine'); setApps((await r.json()).applications || []); }
  useEffect(() => { load(); }, []);

  function openModal(role: RoleReq) { setForm(EMPTY); setErrors({}); setMsg(''); setModal(role); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const schema = modal === 'creator' ? creatorSchema : verifiedSchema;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach(i => { fieldErrors[String(i.path[0])] = i.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({}); setBusy(true);
    const res = await apiFetch('/role-applications', { method: 'POST', body: JSON.stringify({ role_requested: modal, ...parsed.data }) });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) { setMsg(j.error); return; }
    setModal(null);
    load();
  }

  const pendingFor = (role: RoleReq) => apps.find(a => a.role_requested === role && a.status === 'pending');
  const latestFor = (role: RoleReq) => apps.find(a => a.role_requested === role);

  return (
    <>
      <h2 className="mono" style={{ fontSize: 22, marginBottom: 6 }}>Jadi Bagian dari ZuriHost</h2>
      <p className="muted" style={{ marginBottom: 24 }}>Ajukan diri buat dapetin role spesial dengan effect unik di profil & chat.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        {(['creator', 'verified'] as RoleReq[]).map(role => {
          const Icon = role === 'creator' ? Sparkles : BadgeCheck;
          const color = role === 'creator' ? '#A855F7' : '#3B82F6';
          const latest = latestFor(role);
          const pending = pendingFor(role);
          return (
            <GlassCard key={role} style={{ padding: 24 }}>
              <div className="icon-tile" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)`, borderColor: `color-mix(in srgb, ${color} 35%, transparent)` }}>
                <Icon size={22} />
              </div>
              <h3 style={{ margin: '14px 0 6px' }}>{role === 'creator' ? 'Content Creator' : 'Verified'}</h3>
              <p className="sub" style={{ marginBottom: 16 }}>
                {role === 'creator' ? 'Buat kreator konten aktif minimal 1000 followers.' : 'Buat user aktif yang dikenal komunitas.'}
              </p>
              {latest && (
                <div style={{ marginBottom: 14 }}>
                  <span className={`pill ${latest.status === 'approved' ? 'on' : latest.status === 'rejected' ? 'off' : 'warn'}`}>
                    <span className="dt" />
                    {latest.status === 'pending' ? 'Menunggu review' : latest.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                  </span>
                  {latest.status === 'rejected' && latest.rejection_reason && (
                    <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Alasan: {latest.rejection_reason}</p>
                  )}
                </div>
              )}
              <GlassButton variant="primary" size="sm" disabled={!!pending} onClick={() => openModal(role)}>
                {pending ? 'Lagi diproses' : 'Apply Sekarang'}
              </GlassButton>
            </GlassCard>
          );
        })}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', padding: 16 }}>
          <GlassCard hover={false} style={{ padding: 28, maxWidth: 440, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0 }}>Apply {modal === 'creator' ? 'Content Creator' : 'Verified'}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--sv-text-1, var(--muted))', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            {msg && <p className="err">{msg}</p>}
            <form onSubmit={submit}>
              <div className="field">
                <label>Nama sosial media</label>
                <input value={form.social_name} onChange={e => setForm({ ...form, social_name: e.target.value })} placeholder="cth. @username" />
                {errors.social_name && <span className="err" style={{ margin: 0 }}>{errors.social_name}</span>}
              </div>
              <div className="field">
                <label>Link sosial media</label>
                <input value={form.social_link} onChange={e => setForm({ ...form, social_link: e.target.value })} placeholder="https://..." />
                {errors.social_link && <span className="err" style={{ margin: 0 }}>{errors.social_link}</span>}
              </div>
              {modal === 'creator' && (
                <div className="field">
                  <label>Jumlah followers</label>
                  <input type="number" value={form.followers} onChange={e => setForm({ ...form, followers: e.target.value })} placeholder="1000" />
                  {errors.followers && <span className="err" style={{ margin: 0 }}>{errors.followers}</span>}
                </div>
              )}
              <div className="field">
                <label>Alasan mau jadi {modal === 'creator' ? 'Content Creator' : 'Verified'}</label>
                <textarea rows={4} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
                {errors.reason && <span className="err" style={{ margin: 0 }}>{errors.reason}</span>}
              </div>
              <div className="field">
                <label>Nomor WhatsApp</label>
                <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="08123456789" />
                {errors.whatsapp && <span className="err" style={{ margin: 0 }}>{errors.whatsapp}</span>}
              </div>
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, color: 'var(--muted)', margin: '14px 0' }}>
                <input type="checkbox" checked={form.agreed_to_promote} onChange={e => setForm({ ...form, agreed_to_promote: e.target.checked })} style={{ marginTop: 2 }} />
                Siap membantu promosi web free hosting ZuriHost
              </label>
              {errors.agreed_to_promote && <span className="err" style={{ display: 'block', marginBottom: 10 }}>{errors.agreed_to_promote}</span>}
              <GlassButton variant="primary" type="submit" loading={busy} style={{ width: '100%' }}>Kirim Pengajuan</GlassButton>
            </form>
          </GlassCard>
        </div>
      )}
    </>
  );
}
