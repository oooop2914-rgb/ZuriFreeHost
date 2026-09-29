'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function Overview() {
  const [stats, setStats] = useState<{ users: number; servers: number } | null>(null);
  const [econ, setEcon] = useState<{ minted: number; spent: number; net: number } | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([apiFetch('/admin/users'), apiFetch('/admin/servers'), apiFetch('/admin/token-economy'), apiFetch('/admin/nodes')])
      .then(async ([u, s, e, n]) => {
        const uj = await u.json(); const sj = await s.json(); const ej = await e.json(); const nj = await n.json();
        setStats({ users: (uj.users || []).length, servers: (sj.servers || []).length });
        setEcon(ej);
        setNodes(nj.nodes || []);
      });
  }, []);

  if (!stats || !econ) return <div className="muted">Loading...</div>;

  return (
    <>
      <div className="kpis">
        <div className="kpi"><div className="lbl">Total user</div><div className="val">{stats.users}</div></div>
        <div className="kpi"><div className="lbl">Total server</div><div className="val">{stats.servers}</div></div>
        <div className="kpi"><div className="lbl">Token minted</div><div className="val" style={{ color: 'var(--accent)' }}>{econ.minted}</div></div>
        <div className="kpi"><div className="lbl">Token spent</div><div className="val" style={{ color: 'var(--gold)' }}>{econ.spent}</div></div>
      </div>
      <div className="card">
        <h3>Status Node Pterodactyl</h3>
        <p className="sub">Real-time dari Application API.</p>
        <div className="scrollx"><table>
          <thead><tr><th>Node</th><th>Lokasi</th><th>Memory</th><th>Disk</th></tr></thead>
          <tbody>
            {nodes.map((n: any) => (
              <tr key={n.attributes.id}>
                <td>{n.attributes.name}</td>
                <td className="muted">{n.attributes.location_id}</td>
                <td>{n.attributes.allocated_resources?.memory || 0} / {n.attributes.memory} MB</td>
                <td>{n.attributes.allocated_resources?.disk || 0} / {n.attributes.disk} MB</td>
              </tr>
            ))}
            {nodes.length === 0 && <tr><td colSpan={4} className="muted">Gak ada data node / API belum konek.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
