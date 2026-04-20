import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Stars } from './UI';

export function ProductCard({ product, onOpen, onViewDetails }) {
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const isWishlisted = wishlist.includes(product.id);
  const disc = product.op > product.price ? Math.round(((product.op - product.price) / product.op) * 100) : 0;

  return (
    <div className="product-card fade-up" onClick={() => onOpen(product)} style={{ animationDelay: `${product.id * 30}ms` }}>
      {product.badge && <span className={`badge badge-${product.badge}`}>{product.badge}</span>}
      <button
        onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
        style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(0,0,0,.6)', border: 'none',
          width: 34, height: 34, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 2,
          color: isWishlisted ? 'var(--red)' : 'white', fontSize: 15, transition: 'all .2s',
        }}
      >{isWishlisted ? '♥' : '♡'}</button>

      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <img
          src={product.img} alt={product.name} className="card-img" loading="lazy"
          onError={e => { e.target.src = `https://placehold.co/400x300/1a1a1a/c9a455?text=${encodeURIComponent(product.name)}`; }}
        />
        <div className="card-overlay">
          <button className="btn-gold" style={{ flex: 1, padding: '9px 12px', fontSize: 11 }}
            onClick={e => { e.stopPropagation(); addToCart(product, product.sizes[0], product.colors[0]); }}>
            + Quick Add
          </button>
          <button
            className="btn-outline"
            style={{ flex: 1, padding: '9px 12px', fontSize: 11 }}
            onClick={e => { e.stopPropagation(); onViewDetails?.(product); }}
          >
            View Details
          </button>
        </div>
      </div>

      <div style={{ padding: '13px 15px 16px' }}>
        <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>
          {product.cat} · {product.type}
        </div>
        <div style={{ fontFamily: 'var(--fd)', fontSize: 17, fontWeight: 600, marginBottom: 5, lineHeight: 1.25 }}>
          {product.name}
        </div>
        <Stars rating={product.rating} />
        <span style={{ color: 'var(--text2)', fontSize: 11, marginLeft: 5 }}>({product.rev})</span>
        <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>
            ₹{product.price.toLocaleString()}
          </span>
          {disc > 0 && (
            <>
              <span style={{ fontSize: 13, color: 'var(--text2)', textDecoration: 'line-through' }}>₹{product.op.toLocaleString()}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', background: 'rgba(224,82,82,.12)', padding: '2px 6px', borderRadius: 2 }}>
                {disc}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductModal({ product, onClose, onViewDetails }) {
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const [sz, setSz] = useState(product.sizes[0]);
  const [col, setCol] = useState(product.colors[0]);
  const disc = product.op > product.price ? Math.round(((product.op - product.price) / product.op) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 820, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Image */}
        <div style={{ position: 'relative' }}>
          {product.badge && <span className={`badge badge-${product.badge}`}>{product.badge}</span>}
          <img src={product.img} alt={product.name}
            style={{ width: '100%', height: '100%', minHeight: 400, objectFit: 'cover', display: 'block', borderRadius: 'var(--r) 0 0 var(--r)' }} />
        </div>

        {/* Details */}
        <div style={{ padding: 32 }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            background: 'var(--bg3)', border: 'none', color: 'var(--text)',
            width: 30, height: 30, cursor: 'pointer', fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2,
          }}>✕</button>

          <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
            {product.cat} / {product.type}
          </div>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{product.name}</h2>
          <Stars rating={product.rating} />
          <span style={{ color: 'var(--text2)', fontSize: 12, marginLeft: 6 }}>({product.rev} reviews)</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
            <span style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>
              ₹{product.price.toLocaleString()}
            </span>
            {disc > 0 && (
              <>
                <span style={{ fontSize: 15, color: 'var(--text2)', textDecoration: 'line-through' }}>₹{product.op.toLocaleString()}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)', background: 'rgba(224,82,82,.12)', padding: '3px 8px', borderRadius: 2 }}>{disc}% OFF</span>
              </>
            )}
          </div>

          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 20, borderTop: '1px solid var(--bd)', paddingTop: 16 }}>
            {product.desc}
          </p>

          {/* Sizes */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 9 }}>
              Size — <span style={{ color: 'var(--gold)' }}>{sz}</span>
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {product.sizes.map(s => (
                <button key={s} className={`sz-btn ${sz === s ? 'active' : ''}`} onClick={() => setSz(s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 9 }}>
              Colour — <span style={{ color: 'var(--gold)' }}>{col}</span>
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {product.colors.map(c => (
                <button key={c} onClick={() => setCol(c)} style={{
                  padding: '5px 12px', border: `1px solid ${col === c ? 'var(--gold)' : 'var(--bd)'}`,
                  background: col === c ? 'rgba(201,164,85,.1)' : 'transparent',
                  color: col === c ? 'var(--gold)' : 'var(--text2)',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'var(--fb)', transition: 'all .2s', borderRadius: 2,
                }}>{c}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-gold" style={{ flex: 1 }}
              onClick={() => { addToCart(product, sz, col); onClose(); }}>
              Add to Cart
            </button>
            <button
              className="btn-outline"
              style={{ flex: 1 }}
              onClick={() => {
                onClose();
                onViewDetails?.(product);
              }}
            >
              View Details
            </button>
            <button onClick={() => toggleWishlist(product.id)} style={{
              width: 44, height: 44, background: 'transparent',
              border: '1px solid var(--bd)', color: wishlist.includes(product.id) ? 'var(--red)' : 'var(--text2)',
              fontSize: 18, cursor: 'pointer', transition: 'all .2s', borderRadius: 2,
            }}>{wishlist.includes(product.id) ? '♥' : '♡'}</button>
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: 16, fontSize: 12, color: 'var(--text2)', flexWrap: 'wrap' }}>
            <span>🚚 Free delivery over ₹999</span>
            <span>↩️ 30-day returns</span>
            <span>✅ {product.stock} in stock</span>
          </div>
        </div>
      </div>
    </div>
  );
}
