import { useState, useMemo, useEffect } from 'react';
import { PRODUCTS, OFFERS, CATEGORIES, TYPES } from '../data/products';
import { ProductCard, ProductModal } from '../components/ProductCard';

export default function HomePage({ searchQuery, onViewDetails }) {
  const [selProd, setSelProd] = useState(null);
  const [filt, setFilt] = useState({ cat: 'All', type: 'All', maxP: 9999, sort: 'popular' });
  const [offerIdx, setOfferIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setOfferIdx(i => (i + 1) % OFFERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    let p = PRODUCTS.filter(p => {
      if (filt.cat !== 'All' && p.cat !== filt.cat) return false;
      if (filt.type !== 'All' && p.type !== filt.type) return false;
      if (p.price > filt.maxP) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
    if (filt.sort === 'low') p = [...p].sort((a,b) => a.price - b.price);
    if (filt.sort === 'high') p = [...p].sort((a,b) => b.price - a.price);
    if (filt.sort === 'rating') p = [...p].sort((a,b) => b.rating - a.rating);
    if (filt.sort === 'popular') p = [...p].sort((a,b) => b.rev - a.rev);
    return p;
  }, [filt, searchQuery]);

  const off = OFFERS[offerIdx];

  return (
    <div>
      {/* ── Offer Ticker ── */}
      <div style={{
        background: 'linear-gradient(90deg,#0d0800,#1a1000,#0d0800)',
        borderBottom: '1px solid rgba(201,164,85,.2)', padding: '10px 5%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--fd)', fontSize: 19, fontWeight: 700, color: off.col, letterSpacing: 2 }}>{off.title}</span>
          <span style={{ color: 'var(--text2)' }}>—</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{off.sub}</span>
          <span style={{ color: 'var(--text2)', fontSize: 13 }}>{off.desc}</span>
          <span className="tag" style={{ borderColor: off.col + '55', color: off.col, background: off.col + '15' }}>Code: {off.code}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 6 }}>
          {OFFERS.map((_, i) => (
            <span key={i} onClick={() => setOfferIdx(i)} style={{
              width: i === offerIdx ? 16 : 5, height: 3,
              background: i === offerIdx ? off.col : 'var(--bd)',
              borderRadius: 2, transition: 'width .35s', cursor: 'pointer',
            }} />
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{
        position: 'relative', minHeight: 480,
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg,#0d0d0d 0%,#1a0e00 50%,#0d0d0d 100%)',
        overflow: 'hidden', padding: '60px 5%',
      }}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', backgroundImage: "url(https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&fit=crop)", backgroundSize: 'cover', backgroundPosition: 'center', opacity: .22 }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '65%', background: 'linear-gradient(to right,#0d0d0d 20%,transparent)' }} />
        <div style={{ position: 'relative', maxWidth: 560 }}>
          <span className="tag" style={{ marginBottom: 18, display: 'inline-block' }}>New Season · 2025 Collection</span>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(44px,6vw,80px)', fontWeight: 700, lineHeight: 1.0, marginBottom: 18 }}>
            Wear Your<br /><span style={{ color: 'var(--gold)' }}>Story</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.8, marginBottom: 32, maxWidth: 420 }}>
            Curated fashion for the modern wardrobe — from everyday essentials to statement pieces that define who you are.
          </p>
          <div style={{ display: 'flex', gap: 14 }}>
            <button className="btn-gold" onClick={() => document.getElementById('prodGrid')?.scrollIntoView({ behavior: 'smooth' })}>
              Shop Now →
            </button>
            <button className="btn-outline" onClick={() => setFilt(f => ({ ...f, cat: 'All', sort: 'rating' }))}>
              Top Rated
            </button>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 42 }}>
            {[['22+','Products'],['50%','Max Discount'],['30-day','Free Returns'],['₹999+','Free Ship']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>{v}</div>
                <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Offer Cards ── */}
      <div style={{ padding: '32px 5%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 14 }}>
        {OFFERS.map((o, i) => (
          <div key={i} style={{
            background: 'var(--bg2)', border: `1px solid ${o.col}33`,
            padding: '18px 20px', cursor: 'pointer', transition: 'border .2s', borderRadius: 'var(--r)',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = o.col}
            onMouseLeave={e => e.currentTarget.style.borderColor = o.col + '33'}
            onClick={() => { /* apply coupon */ }}
          >
            <div style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 700, color: o.col, marginBottom: 4 }}>{o.title}</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{o.sub}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>{o.desc}</div>
            <span className="tag" style={{ borderColor: o.col + '55', color: o.col, background: o.col + '15', fontSize: 10 }}>CODE: {o.code}</span>
          </div>
        ))}
      </div>

      {/* ── Category Pills ── */}
      <div style={{ padding: '0 5%', marginBottom: 4 }}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {[
            { label: '👗 All', cat: 'All' },
            { label: '👔 Men', cat: 'Men' },
            { label: '👠 Women', cat: 'Women' },
            { label: '🧢 Unisex', cat: 'Unisex' },
          ].map(({ label, cat }) => (
            <button key={cat} onClick={() => setFilt(f => ({ ...f, cat }))}
              style={{
                padding: '10px 20px', border: `1px solid ${filt.cat === cat ? 'var(--gold)' : 'var(--bd)'}`,
                background: filt.cat === cat ? 'rgba(201,164,85,.1)' : 'var(--bg2)',
                color: filt.cat === cat ? 'var(--gold)' : 'var(--text2)',
                cursor: 'pointer', fontSize: 13, borderRadius: 40,
                fontFamily: 'var(--fb)', transition: 'all .2s', whiteSpace: 'nowrap',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div id="prodGrid" style={{ borderTop: '1px solid var(--bd)', borderBottom: '1px solid var(--bd)', padding: '14px 5%' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, flexWrap: 'wrap' }}>
          {TYPES.slice(1).map(t => (
            <button key={t} className={`filter-btn ${filt.type === t ? 'active' : ''}`}
              onClick={() => setFilt(f => ({ ...f, type: f.type === t ? 'All' : t }))}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Max Price</span>
          <input type="range" min={499} max={9999} step={100} value={filt.maxP}
            onChange={e => setFilt(f => ({ ...f, maxP: +e.target.value }))} style={{ flex: 1, maxWidth: 200 }} />
          <span style={{ color: 'var(--gold)', fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 700, minWidth: 64 }}>₹{filt.maxP.toLocaleString()}</span>

          <select className="inp" value={filt.sort} onChange={e => setFilt(f => ({ ...f, sort: e.target.value }))}
            style={{ width: 160, padding: '7px 12px', fontSize: 12 }}>
            <option value="popular">Most Popular</option>
            <option value="rating">Top Rated</option>
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
          </select>

          {(filt.cat !== 'All' || filt.type !== 'All' || filt.maxP !== 9999) && (
            <button onClick={() => setFilt({ cat: 'All', type: 'All', maxP: 9999, sort: 'popular' })}
              style={{ fontSize: 11, color: 'var(--text2)', background: 'none', border: '1px solid var(--bd)', padding: '5px 12px', cursor: 'pointer', borderRadius: 2 }}>
              ✕ Clear Filters
            </button>
          )}
          <span style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>{filtered.length} items</span>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div style={{ padding: '40px 5%' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text2)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 28 }}>No products found</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your filters</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 22 }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} onOpen={setSelProd} onViewDetails={onViewDetails} />)}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--bd)', background: 'var(--bg2)', padding: '40px 5% 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 700, color: 'var(--gold)', marginBottom: 12 }}>FÀSHIONWEAR</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, maxWidth: 240 }}>Your destination for premium fashion. Curated collections, quality fabrics, timeless style for every wardrobe.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {['Instagram','Pinterest','Twitter','YouTube'].map(s => (
                <div key={s} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: 'var(--text2)', transition: 'border .2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bd)'}>
                  {s[0]}
                </div>
              ))}
            </div>
          </div>
          {[
            { title: 'Shop', links: ['New Arrivals','Men\'s Collection','Women\'s Collection','Accessories','Sale'] },
            { title: 'Help', links: ['Size Guide','Free Returns','Track Order','Contact Us','FAQ'] },
            { title: 'Company', links: ['About Us','Careers','Press','Sustainability','Stores'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 14 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l} style={{ fontSize: 14, color: 'var(--text)', marginBottom: 9, cursor: 'pointer', opacity: .7, transition: 'opacity .15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '.7'}>{l}</div>
              ))}
            </div>
          ))}
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 14 }}>Newsletter</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>Get exclusive offers, style tips and early access to new arrivals.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="inp" placeholder="your@email.com" style={{ fontSize: 12 }} />
              <button className="btn-gold" style={{ padding: '10px 14px', whiteSpace: 'nowrap', fontSize: 11 }}>Join</button>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, fontSize: 12, color: 'var(--text2)' }}>
          <span>© 2025 FashionWear. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 18 }}>
            {['Privacy Policy','Terms of Service','Cookie Policy'].map(l => (
              <span key={l} style={{ cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
          <span>🔒 Secure Checkout &nbsp;&nbsp; ♻️ Sustainable Fashion</span>
        </div>
      </footer>

      {/* Product Modal */}
      {selProd && <ProductModal product={selProd} onClose={() => setSelProd(null)} onViewDetails={onViewDetails} />}
    </div>
  );
}
