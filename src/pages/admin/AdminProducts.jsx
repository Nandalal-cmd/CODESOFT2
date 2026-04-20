import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../../utils/api';
import { TableRowSkeleton } from '../../components/SkeletonLoader';
import { PRODUCTS } from '../../data/products'; // local fallback

const EMPTY_FORM = {
  name:'', price:'', originalPrice:'', category:'Men', type:'T-Shirts',
  sizes:[], colors:[], imageUrl:'', badge:'', stock:'', description:'',
};
const CATEGORIES = ['Men','Women','Unisex'];
const TYPES = ['T-Shirts','Shirts','Pants','Jeans','Jackets','Hoodies','Dresses','Tops','Skirts','Sweaters'];
const BADGES = ['','SALE','HOT','NEW'];
const ALL_SIZES  = ['XS','S','M','L','XL','XXL','28','30','32','34','36','24','26'];
const ALL_COLORS = ['White','Black','Navy','Grey','Red','Khaki','Olive','Dark Blue','Light Blue','Camel','Ivory','Blush'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');
  const [seeding, setSeeding]   = useState(false);
  const [usingLocal, setUsingLocal] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.list({ search, limit: 100 });
      setProducts(res.data.products || []);
      setUsingLocal(false);
    } catch {
      // Fallback to local static data if backend unreachable
      setProducts(PRODUCTS.map(p => ({
        _id: String(p.id), name: p.name, price: p.price, originalPrice: p.op,
        category: p.cat, type: p.type, badge: p.badge, stock: p.stock,
        imageUrl: p.img, sizes: p.sizes, colors: p.colors, description: p.desc,
      })));
      setUsingLocal(true);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await productApi.seed();
      fetchProducts();
    } catch (e) { alert(e.response?.data?.error || 'Seed failed'); }
    finally { setSeeding(false); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit   = (p) => {
    setForm({
      name: p.name, price: String(p.price), originalPrice: String(p.originalPrice || ''),
      category: p.category || p.cat, type: p.type, badge: p.badge || '',
      stock: String(p.stock || ''), imageUrl: p.imageUrl || p.img || '',
      description: p.description || p.desc || '',
      sizes:  Array.isArray(p.sizes)  ? p.sizes  : [],
      colors: Array.isArray(p.colors) ? p.colors : [],
    });
    setEditId(p._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productApi.delete(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (e) { alert(e.response?.data?.error || 'Delete failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { alert('Name and price are required'); return; }
    setSaving(true);
    const payload = {
      ...form,
      price:         Number(form.price),
      originalPrice: Number(form.originalPrice) || Number(form.price),
      stock:         Number(form.stock) || 0,
    };
    try {
      if (editId) {
        const res = await productApi.update(editId, payload);
        setProducts(prev => prev.map(p => p._id === editId ? res.data.product : p));
      } else {
        const res = await productApi.create(payload);
        setProducts(prev => [res.data.product, ...prev]);
      }
      setShowForm(false);
    } catch (e) { alert(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const toggleArr = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: 24, fontWeight: 700 }}>Products</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{filtered.length} products {usingLocal && <span style={{ color: '#c9a455', fontSize: 11 }}>(local data — backend offline)</span>}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input className="inp" placeholder="Search products…" value={search}
            onChange={e => setSearch(e.target.value)} style={{ width: 200, fontSize: 13 }} />
          {!usingLocal && (
            <button onClick={handleSeed} disabled={seeding} className="btn-ghost" style={{ padding: '9px 16px', fontSize: 12 }}>
              {seeding ? '⏳ Seeding…' : '🌱 Seed Data'}
            </button>
          )}
          <button onClick={openCreate} className="btn-gold" style={{ padding: '9px 18px', fontSize: 12 }}>
            + Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--bg2)' }}>
              {['Image','Name','Category','Price','Stock','Badge','Actions'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <TableRowSkeleton cols={7} rows={6} />
              : filtered.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--bd)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 14px' }}>
                    <img src={p.imageUrl || p.img} alt={p.name} style={{ width: 44, height: 56, objectFit: 'cover', borderRadius: 3 }} />
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 600, maxWidth: 200, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{p.type}</div>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{p.category || p.cat}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--gold)' }}>₹{p.price?.toLocaleString()}</div>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <div style={{ fontSize: 11, color: 'var(--text2)', textDecoration: 'line-through' }}>₹{p.originalPrice?.toLocaleString()}</div>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ color: (p.stock || 0) < 10 ? '#dc5050' : 'var(--text)', fontWeight: (p.stock || 0) < 10 ? 700 : 400 }}>
                      {p.stock ?? '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {p.badge && (
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, letterSpacing: .5,
                        background: p.badge === 'SALE' ? 'rgba(201,164,85,.15)' : p.badge === 'HOT' ? 'rgba(220,80,80,.12)' : 'rgba(82,136,224,.12)',
                        color:      p.badge === 'SALE' ? '#c9a455' : p.badge === 'HOT' ? '#dc5050' : '#5288e0',
                      }}>{p.badge}</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={{ padding: '5px 12px', fontSize: 11, background: 'rgba(82,136,224,.1)', color: '#5288e0', border: '1px solid rgba(82,136,224,.25)', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                      {!usingLocal && (
                        <button onClick={() => handleDelete(p._id)} style={{ padding: '5px 12px', fontSize: 11, background: 'rgba(220,80,80,.08)', color: '#dc5050', border: '1px solid rgba(220,80,80,.2)', borderRadius: 4, cursor: 'pointer' }}>Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text2)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🛍️</div>
            No products found. Click "Seed Data" to populate from the catalog.
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: 22 }}>{editId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text2)' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', display:'block', marginBottom: 5 }}>Product Name *</label>
                  <input required className="inp" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Premium Oxford Shirt" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', display:'block', marginBottom: 5 }}>Price (₹) *</label>
                  <input required type="number" className="inp" value={form.price} onChange={e => setForm(p=>({...p,price:e.target.value}))} placeholder="1299" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', display:'block', marginBottom: 5 }}>Original Price (₹)</label>
                  <input type="number" className="inp" value={form.originalPrice} onChange={e => setForm(p=>({...p,originalPrice:e.target.value}))} placeholder="1899" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', display:'block', marginBottom: 5 }}>Category</label>
                  <select className="inp" value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', display:'block', marginBottom: 5 }}>Type</label>
                  <select className="inp" value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', display:'block', marginBottom: 5 }}>Badge</label>
                  <select className="inp" value={form.badge} onChange={e => setForm(p=>({...p,badge:e.target.value}))}>
                    {BADGES.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', display:'block', marginBottom: 5 }}>Stock</label>
                  <input type="number" className="inp" value={form.stock} onChange={e => setForm(p=>({...p,stock:e.target.value}))} placeholder="50" />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', display:'block', marginBottom: 5 }}>Image URL</label>
                  <input className="inp" value={form.imageUrl} onChange={e => setForm(p=>({...p,imageUrl:e.target.value}))} placeholder="https://images.unsplash.com/..." />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', display:'block', marginBottom: 5 }}>Description</label>
                  <textarea className="inp" rows={3} value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} style={{ resize: 'vertical' }} />
                </div>
              </div>

              {/* Sizes */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', display:'block', marginBottom: 7 }}>Sizes</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ALL_SIZES.map(s => (
                    <button type="button" key={s} onClick={() => setForm(p=>({...p, sizes: toggleArr(p.sizes, s)}))}
                      style={{ padding: '5px 12px', fontSize: 12, borderRadius: 4, cursor: 'pointer',
                        background: form.sizes.includes(s) ? 'rgba(201,164,85,.15)' : 'var(--bg2)',
                        color:      form.sizes.includes(s) ? 'var(--gold)' : 'var(--text2)',
                        border:     `1px solid ${form.sizes.includes(s) ? 'rgba(201,164,85,.5)' : 'var(--bd)'}`,
                      }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', display:'block', marginBottom: 7 }}>Colors</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ALL_COLORS.map(c => (
                    <button type="button" key={c} onClick={() => setForm(p=>({...p, colors: toggleArr(p.colors, c)}))}
                      style={{ padding: '5px 12px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
                        background: form.colors.includes(c) ? 'rgba(201,164,85,.15)' : 'var(--bg2)',
                        color:      form.colors.includes(c) ? 'var(--gold)' : 'var(--text2)',
                        border:     `1px solid ${form.colors.includes(c) ? 'rgba(201,164,85,.5)' : 'var(--bd)'}`,
                      }}>{c}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn-gold" style={{ flex: 1, padding: 13 }} disabled={saving}>
                  {saving ? 'Saving…' : (editId ? 'Update Product' : 'Create Product')}
                </button>
                <button type="button" className="btn-ghost" style={{ padding: '13px 20px' }} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
