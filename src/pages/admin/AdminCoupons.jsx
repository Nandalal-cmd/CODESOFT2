import { useState, useEffect, useCallback } from 'react';
import { couponApi } from '../../utils/api';

const EMPTY = { code:'', type:'percent', value:'', label:'', minOrder:'0', maxUses:'0', isActive: true };
const TYPES = ['percent','flat','freeship','b2g1'];

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await couponApi.list();
      setCoupons(res.data.coupons || []);
    } catch { setCoupons([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit   = (c) => {
    setForm({ code: c.code, type: c.type, value: String(c.value), label: c.label, minOrder: String(c.minOrder), maxUses: String(c.maxUses), isActive: c.isActive });
    setEditId(c._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try { await couponApi.delete(id); setCoupons(prev => prev.filter(c => c._id !== id)); }
    catch (e) { alert(e.response?.data?.error || 'Delete failed'); }
  };

  const handleToggle = async (c) => {
    try {
      const res = await couponApi.update(c._id, { isActive: !c.isActive });
      setCoupons(prev => prev.map(x => x._id === c._id ? res.data.coupon : x));
    } catch (e) { alert(e.response?.data?.error || 'Update failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.label) { alert('Code and label are required'); return; }
    setSaving(true);
    const payload = { ...form, value: Number(form.value), minOrder: Number(form.minOrder), maxUses: Number(form.maxUses) };
    try {
      if (editId) {
        const res = await couponApi.update(editId, payload);
        setCoupons(prev => prev.map(c => c._id === editId ? res.data.coupon : c));
      } else {
        const res = await couponApi.create(payload);
        setCoupons(prev => [res.data.coupon, ...prev]);
      }
      setShowForm(false);
    } catch (e) { alert(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const typeHelp = { percent:'e.g. 0.50 = 50% off', flat:'e.g. 300 = ₹300 off', freeship:'value not used', b2g1:'value not used' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 700 }}>Coupons</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{coupons.length} coupon codes</p>
        </div>
        <button onClick={openCreate} className="btn-gold" style={{ padding: '9px 18px', fontSize: 12 }}>+ New Coupon</button>
      </div>

      <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--bg2)' }}>
              {['Code','Type','Value','Label','Min Order','Uses','Status','Actions'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign:'left', fontSize:10, color:'var(--text2)', letterSpacing:1, textTransform:'uppercase', fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>Loading…</td></tr>
              : coupons.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--bd)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:13, color:'var(--gold)', background:'rgba(201,164,85,.08)', padding:'3px 8px', borderRadius:4 }}>{c.code}</span>
                  </td>
                  <td style={{ padding:'12px 14px', color:'var(--text2)', textTransform:'capitalize' }}>{c.type}</td>
                  <td style={{ padding:'12px 14px' }}>
                    {c.type === 'percent'  && `${Math.round(c.value * 100)}%`}
                    {c.type === 'flat'     && `₹${c.value}`}
                    {(c.type === 'freeship' || c.type === 'b2g1') && '—'}
                  </td>
                  <td style={{ padding:'12px 14px', fontWeight:600 }}>{c.label}</td>
                  <td style={{ padding:'12px 14px', color:'var(--text2)' }}>{c.minOrder > 0 ? `₹${c.minOrder}` : 'None'}</td>
                  <td style={{ padding:'12px 14px', color:'var(--text2)' }}>{c.usedCount}{c.maxUses > 0 ? `/${c.maxUses}` : ''}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <button onClick={() => handleToggle(c)} style={{
                      padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, cursor:'pointer',
                      background: c.isActive ? 'rgba(82,168,105,.12)' : 'rgba(220,80,80,.1)',
                      color:      c.isActive ? '#52a869' : '#dc5050',
                      border:     `1px solid ${c.isActive ? 'rgba(82,168,105,.3)' : 'rgba(220,80,80,.2)'}`,
                    }}>{c.isActive ? 'Active' : 'Inactive'}</button>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => openEdit(c)} style={{ padding:'5px 12px', fontSize:11, background:'rgba(82,136,224,.1)', color:'#5288e0', border:'1px solid rgba(82,136,224,.25)', borderRadius:4, cursor:'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(c._id)} style={{ padding:'5px 12px', fontSize:11, background:'rgba(220,80,80,.08)', color:'#dc5050', border:'1px solid rgba(220,80,80,.2)', borderRadius:4, cursor:'pointer' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && coupons.length === 0 && (
          <div style={{ padding:'60px 0', textAlign:'center', color:'var(--text2)' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🎟️</div>No coupons yet
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'var(--bg)', border:'1px solid var(--bd)', borderRadius:'var(--r)', width:'100%', maxWidth:480, padding:32 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:22 }}>
              <h3 style={{ fontFamily:'var(--fd)', fontSize:20 }}>{editId ? 'Edit Coupon' : 'New Coupon'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text2)' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={{ fontSize:11, color:'var(--text2)', letterSpacing:1, display:'block', marginBottom:5, textTransform:'uppercase' }}>Code *</label>
                  <input required className="inp" value={form.code} onChange={e => setForm(p=>({...p,code:e.target.value.toUpperCase()}))} placeholder="SUMMER50" disabled={!!editId} style={{ opacity: editId ? .6 : 1 }} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'var(--text2)', letterSpacing:1, display:'block', marginBottom:5, textTransform:'uppercase' }}>Type</label>
                  <select className="inp" value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, color:'var(--text2)', letterSpacing:1, display:'block', marginBottom:5, textTransform:'uppercase' }}>Value <span style={{ fontSize:10 }}>({typeHelp[form.type]})</span></label>
                  <input type="number" step="0.01" className="inp" value={form.value} onChange={e => setForm(p=>({...p,value:e.target.value}))} placeholder="0.50" />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'var(--text2)', letterSpacing:1, display:'block', marginBottom:5, textTransform:'uppercase' }}>Min Order (₹)</label>
                  <input type="number" className="inp" value={form.minOrder} onChange={e => setForm(p=>({...p,minOrder:e.target.value}))} placeholder="0" />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ fontSize:11, color:'var(--text2)', letterSpacing:1, display:'block', marginBottom:5, textTransform:'uppercase' }}>Label *</label>
                  <input required className="inp" value={form.label} onChange={e => setForm(p=>({...p,label:e.target.value}))} placeholder="50% OFF" />
                </div>
                <div>
                  <label style={{ fontSize:11, color:'var(--text2)', letterSpacing:1, display:'block', marginBottom:5, textTransform:'uppercase' }}>Max Uses (0=unlimited)</label>
                  <input type="number" className="inp" value={form.maxUses} onChange={e => setForm(p=>({...p,maxUses:e.target.value}))} placeholder="0" />
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:20 }}>
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p=>({...p,isActive:e.target.checked}))} style={{ accentColor:'var(--gold)', width:16, height:16 }} />
                  <label htmlFor="isActive" style={{ fontSize:14, cursor:'pointer' }}>Active</label>
                </div>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:22 }}>
                <button type="submit" className="btn-gold" style={{ flex:1, padding:12 }} disabled={saving}>
                  {saving ? 'Saving…' : (editId ? 'Update' : 'Create Coupon')}
                </button>
                <button type="button" className="btn-ghost" style={{ padding:'12px 18px' }} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
