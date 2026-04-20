import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../utils/api';
import { TableRowSkeleton } from '../../components/SkeletonLoader';

export default function AdminCustomers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [updating, setUpdating] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.users({ search, page, limit: 15, role: 'customer' });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const promoteToAdmin = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Change role to ${newRole}?`)) return;
    setUpdating(id);
    try {
      await adminApi.updateUserRole(id, newRole);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 700 }}>Customers</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{total} registered users</p>
        </div>
        <input className="inp" placeholder="Search by name or email…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ width: 260, fontSize: 13 }} />
      </div>

      <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--bg2)' }}>
              {['Avatar','Name','Email','Role','Joined','Actions'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <TableRowSkeleton cols={6} rows={6} />
              : users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--bd)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold2))', display:'flex', alignItems:'center', justifyContent:'center', color:'#000', fontWeight:700, fontSize: 14 }}>
                      {(u.name?.[0] || '?').toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text2)' }}>{u.email}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase',
                      background: u.role === 'admin' ? 'rgba(224,122,82,.12)' : 'rgba(201,164,85,.08)',
                      color:      u.role === 'admin' ? '#e07a52' : 'var(--gold)',
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text2)', fontSize: 12 }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => promoteToAdmin(u._id, u.role)}
                      disabled={updating === u._id}
                      style={{ padding: '5px 12px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
                        background: u.role === 'admin' ? 'rgba(220,80,80,.08)' : 'rgba(82,136,224,.1)',
                        color:      u.role === 'admin' ? '#dc5050' : '#5288e0',
                        border:     `1px solid ${u.role === 'admin' ? 'rgba(220,80,80,.2)' : 'rgba(82,136,224,.25)'}`,
                      }}>
                      {updating === u._id ? '…' : u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && users.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text2)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
            No customers found
          </div>
        )}
      </div>

      {total > 15 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          <button className="btn-ghost" style={{ padding: '7px 16px', fontSize: 12 }}
            disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ padding: '7px 14px', fontSize: 12, color: 'var(--text2)' }}>Page {page} of {Math.ceil(total/15)}</span>
          <button className="btn-ghost" style={{ padding: '7px 16px', fontSize: 12 }}
            disabled={page >= Math.ceil(total/15)} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
