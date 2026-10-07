'use client';
import { useEffect, useRef, useState } from 'react';
import { Folder, File as FileIcon, ArrowUp, Download, Trash2, Pencil, FolderPlus, Upload, Save, X } from 'lucide-react';
import GlassButton from '@/components/ui/GlassButton';
import GlassCard from '@/components/ui/GlassCard';
import { apiFetch } from '@/lib/api';

interface FileEntry { name: string; is_file: boolean; is_editable: boolean; size: number; mimetype: string; modified_at: string }

function fmtSize(b: number) {
  if (!b) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB']; let i = 0, v = b;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${u[i]}`;
}
const TEXT_EXT = ['.txt', '.yml', '.yaml', '.json', '.properties', '.conf', '.cfg', '.ini', '.log', '.env', '.js', '.ts', '.py', '.sh', '.md'];
function isTextFile(name: string) { return TEXT_EXT.some(e => name.toLowerCase().endsWith(e)); }

export default function FileManager({ serverId }: { serverId: string }) {
  const [dir, setDir] = useState('/');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState<{ name: string; content: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load(path = dir) {
    setLoading(true); setErr('');
    const res = await apiFetch(`/servers/${serverId}/files/list?dir=${encodeURIComponent(path)}`);
    const j = await res.json();
    setLoading(false);
    if (!res.ok) { setErr(j.error); return; }
    setFiles(j.files.map((f: any) => f.attributes));
    setDir(path);
  }
  useEffect(() => { load('/'); }, [serverId]);

  function join(base: string, name: string) { return (base.endsWith('/') ? base : base + '/') + name; }
  function parentOf(path: string) { const p = path.replace(/\/$/, '').split('/'); p.pop(); return p.join('/') || '/'; }

  async function openEntry(f: FileEntry) {
    if (!f.is_file) { load(join(dir, f.name)); return; }
    if (!isTextFile(f.name)) { setErr('Tipe file ini cuma bisa di-download, gak bisa diedit langsung.'); return; }
    const res = await apiFetch(`/servers/${serverId}/files/content?file=${encodeURIComponent(join(dir, f.name))}`);
    const j = await res.json();
    if (res.ok) setEditing({ name: f.name, content: j.content });
  }

  async function saveFile() {
    if (!editing) return;
    setSaving(true);
    await apiFetch(`/servers/${serverId}/files/content`, { method: 'PUT', body: JSON.stringify({ file: join(dir, editing.name), content: editing.content }) });
    setSaving(false); setEditing(null); load();
  }

  async function downloadFile(name: string) {
    const res = await apiFetch(`/servers/${serverId}/files/download?file=${encodeURIComponent(join(dir, name))}`);
    const j = await res.json();
    if (res.ok) window.open(j.url, '_blank');
  }

  async function deleteEntry(name: string) {
    if (!confirm(`Hapus "${name}"?`)) return;
    await apiFetch(`/servers/${serverId}/files/delete`, { method: 'POST', body: JSON.stringify({ dir, files: [name] }) });
    load();
  }
  async function rename(name: string) {
    const to = prompt('Nama baru:', name);
    if (!to || to === name) return;
    await apiFetch(`/servers/${serverId}/files/rename`, { method: 'POST', body: JSON.stringify({ dir, from: name, to }) });
    load();
  }
  async function newFolder() {
    const name = prompt('Nama folder baru:');
    if (!name) return;
    await apiFetch(`/servers/${serverId}/files/folder`, { method: 'POST', body: JSON.stringify({ dir, name }) });
    load();
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await apiFetch(`/servers/${serverId}/files/upload-url?dir=${encodeURIComponent(dir)}`);
    const j = await res.json();
    if (!res.ok) { setErr(j.error); return; }
    const fd = new FormData(); fd.append('files', file);
    await fetch(j.url, { method: 'POST', body: fd }); // langsung ke Wings, bukan lewat backend kita
    if (fileInputRef.current) fileInputRef.current.value = '';
    load();
  }

  if (editing) {
    return (
      <GlassCard style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--sv-surface-border)' }}>
          <span className="sv-mono" style={{ fontSize: 13 }}>{editing.name}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <GlassButton size="sm" variant="primary" icon={<Save size={13} />} loading={saving} onClick={saveFile}>Simpan</GlassButton>
            <GlassButton size="sm" icon={<X size={13} />} onClick={() => setEditing(null)}>Tutup</GlassButton>
          </div>
        </div>
        <textarea
          value={editing.content}
          onChange={e => setEditing({ ...editing, content: e.target.value })}
          className="sv-mono"
          style={{ width: '100%', minHeight: 420, background: '#0D0D0F', color: '#D4D4D8', border: 'none', outline: 'none', padding: 16, fontSize: 13, resize: 'vertical' }}
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--sv-surface-border)', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {dir !== '/' && <GlassButton size="sm" icon={<ArrowUp size={13} />} onClick={() => load(parentOf(dir))} />}
          <span className="sv-mono" style={{ fontSize: 12.5, color: 'var(--sv-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dir}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <GlassButton size="sm" icon={<FolderPlus size={13} />} onClick={newFolder}>Folder</GlassButton>
          <GlassButton size="sm" icon={<Upload size={13} />} onClick={() => fileInputRef.current?.click()}>Upload</GlassButton>
          <input ref={fileInputRef} type="file" onChange={uploadFile} style={{ display: 'none' }} />
        </div>
      </div>
      {err && <p style={{ color: '#F87171', fontSize: 12.5, padding: '8px 16px 0' }}>{err}</p>}
      <div style={{ maxHeight: 440, overflowY: 'auto' }}>
        {loading ? <p style={{ padding: 16, color: 'var(--sv-text-1)' }}>Memuat...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {files.map(f => (
                <tr key={f.name} style={{ borderBottom: '1px solid var(--sv-surface-border)' }}>
                  <td style={{ padding: '9px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => openEntry(f)}>
                    {f.is_file ? <FileIcon size={14} color="var(--sv-text-2)" /> : <Folder size={14} color="var(--sv-grad-c)" />}
                    {f.name}
                  </td>
                  <td style={{ padding: '9px 10px', color: 'var(--sv-text-2)', fontSize: 11.5, whiteSpace: 'nowrap' }}>{f.is_file ? fmtSize(f.size) : ''}</td>
                  <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      {f.is_file && <GlassButton size="sm" icon={<Download size={12} />} onClick={() => downloadFile(f.name)} />}
                      <GlassButton size="sm" icon={<Pencil size={12} />} onClick={() => rename(f.name)} />
                      <GlassButton size="sm" variant="danger" icon={<Trash2 size={12} />} onClick={() => deleteEntry(f.name)} />
                    </div>
                  </td>
                </tr>
              ))}
              {files.length === 0 && <tr><td style={{ padding: 16, color: 'var(--sv-text-1)' }}>Folder kosong.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </GlassCard>
  );
}
