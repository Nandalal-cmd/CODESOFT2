import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../../utils/api';
import { TableRowSkeleton } from '../../components/SkeletonLoader';

const STATUSES = ['all','pending','processing','shipped','delivered','cancelled','payment_failed'];
const STATUS_COLORS = {
  pending:'#c9a455', processing:'#5288e0', shipped:'#9d64dc',
  delivered:'#52a869', cancelled:'#dc5050', payment_failed:'#dc5050',
};

export default function AdminOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderApi.list({ status: filter, search, page, limit: 15 });
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, [filter, search, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await orderApi.updateStatus(orderId, { status });
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
    } catch (e) { alert(e.response?.data?.error || 'Failed to update status'); }
    finally { setUpdating(null); }
  };

  const NEXT_STATUS = {
    pending: 'processing', processing: 'shipped',
    shipped: 'delivered', delivered: null,
    cancelled: null, payment_failed: null,
  };

  return (
    <div>
      {/* Header & filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 700 }}>Orders</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{total} total orders</p>
        </div>
        <input className="inp" placeholder="Search orders, customers…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ width: 240, fontSize: 13 }} />
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto', paddingBottom: 4 }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              textTransform: 'capitalize', whiteSpace: 'nowrap', cursor: 'pointer', letterSpacing: .5,
              background: filter === s ? (STATUS_COLORS[s] || 'var(--gold)') + '22' : 'var(--bg2)',
              color:      filter === s ? (STATUS_COLORS[s] || 'var(--gold)') : 'var(--text2)',
              border:     `1px solid ${filter === s ? (STATUS_COLORS[s] || 'var(--gold)') + '55' : 'var(--bd)'}`,
            }}>
            {s.replace('_',' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--bg2)' }}>
              {['Order ID','Customer','Items','Total','Payment','Status','Actions'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <TableRowSkeleton cols={7} rows={8} />
              : orders.map(o => {
                const sc = STATUS_COLORS[o.status] || '#888';
                const next = NEXT_STATUS[o.status];
                const isExpanded = expanded === o.orderId;
                return [
                  <tr key={o.orderId} style={{ borderBottom: '1px solid var(--bd)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setExpanded(isExpanded ? null : o.orderId)}>

                    <td style={{ padding: '13px 14px', fontWeight: 700 }}>#{o.orderId}</td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ fontWeight: 600 }}>{o.customer}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>{o.email}</div>
                    </td>
                    <td style={{ padding: '13px 14px', color: 'var(--text2)' }}>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                    <td style={{ padding: '13px 14px', color: 'var(--gold)', fontWeight: 700, fontFamily: 'var(--fd)' }}>₹{o.total?.toLocaleString()}</td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                        background: o.paymentStatus === 'paid' ? 'rgba(82,168,105,.12)' : o.paymentStatus === 'cod' ? 'rgba(82,136,224,.1)' : 'rgba(201,164,85,.1)',
                        color:      o.paymentStatus === 'paid' ? '#52a869' : o.paymentStatus === 'cod' ? '#5288e0' : '#c9a455',
                      }}>{o.paymentStatus || 'pending'}</span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', background: sc + '20', color: sc }}>
                        {o.status?.replace('_',' ')}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px' }} onClick={e => e.stopPropagation()}>
                      {next && (
                        <button onClick={() => updateStatus(o.orderId, next)}
                          disabled={updating === o.orderId}
                          style={{ padding: '5px 12px', fontSize: 11, background: 'rgba(201,164,85,.1)', color: 'var(--gold)', border: '1px solid rgba(201,164,85,.3)', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                          {updating === o.orderId ? '…' : `→ ${next.replace('_',' ')}`}
                        </button>
                      )}
                      {!next && <span style={{ fontSize: 11, color: 'var(--text2)' }}>—</span>}
                    </td>
                  </tr>,

                  /* Expanded row */
                  isExpanded && (
                    <tr key={o.orderId + '-exp'}>
                      <td colSpan={7} style={{ background: 'var(--bg2)', padding: '16px 20px', borderBottom: '1px solid var(--bd)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, fontSize: 13 }}>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Delivery</div>
                            <div style={{ fontWeight: 600 }}>{o.customer}</div>
                            <div style={{ color: 'var(--text2)', lineHeight: 1.6, marginTop: 3 }}>{o.address}</div>
                            <div style={{ color: 'var(--text2)' }}>{o.phone}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Items</div>
                            {(o.items || []).slice(0,3).map((it,i) => (
                              <div key={i} style={{ marginBottom: 6 }}>
                                <span style={{ fontWeight: 600 }}>{it.name}</span>
                                <span style={{ color: 'var(--text2)', marginLeft: 8 }}>×{it.qty} — ₹{(it.price * it.qty).toLocaleString()}</span>
                              </div>
                            ))}
                            {o.items?.length > 3 && <div style={{ color: 'var(--text2)', fontSize: 11 }}>+{o.items.length - 3} more</div>}
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Timeline</div>
                            {(o.timeline || []).slice(-3).reverse().map((t, i) => (
                              <div key={i} style={{ marginBottom: 6, display: 'flex', gap: 8 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', marginTop: 5, flexShrink: 0 }} />
                                <div>
                                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{t.status?.replace('_',' ')}</span>
                                  {t.note && <span style={{ color: 'var(--text2)', fontSize: 11, marginLeft: 6 }}>— {t.note}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Status override select */}
                        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--text2)' }}>Override status:</span>
                          <select className="inp" style={{ width: 180, padding: '6px 10px', fontSize: 12 }}
                            value={o.status}
                            onChange={e => updateStatus(o.orderId, e.target.value)}>
                            {['pending','processing','shipped','delivered','cancelled','payment_failed'].map(s => (
                              <option key={s} value={s}>{s.replace('_',' ')}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ),
                ];
              })}
          </tbody>
        </table>

        {!loading && orders.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text2)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
            No orders found
          </div>
        )}
      </div>

      {/* Pagination */}
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
