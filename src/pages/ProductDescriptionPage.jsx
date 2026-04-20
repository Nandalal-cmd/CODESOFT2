import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Stars } from '../components/UI';
import { PRODUCTS } from '../data/products';

export default function ProductDescriptionPage({ product, onBack, onViewDetails }) {
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const [size, setSize] = useState(product?.sizes?.[0]);
  const [color, setColor] = useState(product?.colors?.[0]);
  const isWishlisted = wishlist.includes(product?.id);

  const discountPercent = useMemo(() => {
    if (!product || product.op <= product.price) return 0;
    return Math.round(((product.op - product.price) / product.op) * 100);
  }, [product]);

  const recommendedProducts = useMemo(() => {
    return PRODUCTS
      .filter(p => p.id !== product.id)
      .sort((a, b) => {
        const aScore = (a.cat === product.cat ? 3 : 0) + (a.type === product.type ? 2 : 0) + (a.rating / 5);
        const bScore = (b.cat === product.cat ? 3 : 0) + (b.type === product.type ? 2 : 0) + (b.rating / 5);
        return bScore - aScore;
      })
      .slice(0, 4);
  }, [product]);

  if (!product) return null;

  return (
    <div style={{ padding: '34px 5%' }}>
      <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 20 }}>
        ← Back to products
      </button>

      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 460px) 1fr', gap: 30, padding: 24 }}>
        <div>
          {product.badge && <span className={`badge badge-${product.badge}`} style={{ position: 'relative', top: 0, left: 0 }}>{product.badge}</span>}
          <img
            src={product.img}
            alt={product.name}
            style={{ width: '100%', borderRadius: 'var(--r)', border: '1px solid var(--bd)', marginTop: 12 }}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1.2, textTransform: 'uppercase' }}>
            {product.cat} / {product.type}
          </div>
          <h1 style={{ fontSize: 38, margin: '8px 0 8px' }}>{product.name}</h1>
          <div style={{ marginBottom: 14 }}>
            <Stars rating={product.rating} />
            <span style={{ color: 'var(--text2)', fontSize: 12, marginLeft: 6 }}>({product.rev} reviews)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--fd)', fontSize: 32, color: 'var(--gold)', fontWeight: 700 }}>
              ₹{product.price.toLocaleString()}
            </span>
            {discountPercent > 0 && (
              <>
                <span style={{ textDecoration: 'line-through', color: 'var(--text2)' }}>₹{product.op.toLocaleString()}</span>
                <span className="tag" style={{ color: 'var(--red)', borderColor: 'rgba(224,82,82,.35)', background: 'rgba(224,82,82,.1)' }}>
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <p style={{ color: 'var(--text2)', lineHeight: 1.9, marginBottom: 20 }}>
            {product.desc}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>Category</div>
              <div style={{ marginTop: 4, fontWeight: 600 }}>{product.cat}</div>
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>Availability</div>
              <div style={{ marginTop: 4, fontWeight: 600 }}>{product.stock} in stock</div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
              Select Size
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.sizes.map(s => (
                <button key={s} className={`sz-btn ${size === s ? 'active' : ''}`} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
              Select Color
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    padding: '6px 12px',
                    border: `1px solid ${color === c ? 'var(--gold)' : 'var(--bd)'}`,
                    background: color === c ? 'rgba(201,164,85,.08)' : 'transparent',
                    color: color === c ? 'var(--gold)' : 'var(--text2)',
                    cursor: 'pointer',
                    borderRadius: 2,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-gold" onClick={() => addToCart(product, size, color)}>
              Add to Cart
            </button>
            <button className="btn-outline" onClick={() => toggleWishlist(product.id)}>
              {isWishlisted ? '♥ Wishlisted' : '♡ Add Wishlist'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 32 }}>Recommended Products</h2>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>Based on category and style</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {recommendedProducts.map(item => {
            const itemDiscount = item.op > item.price ? Math.round(((item.op - item.price) / item.op) * 100) : 0;
            return (
              <div
                key={item.id}
                className="card"
                style={{ overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => onViewDetails?.(item)}
              >
                <img src={item.img} alt={item.name} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase' }}>
                    {item.cat} · {item.type}
                  </div>
                  <div style={{ fontFamily: 'var(--fd)', fontSize: 20, margin: '5px 0 6px', lineHeight: 1.2 }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--fd)', fontSize: 24, color: 'var(--gold)', fontWeight: 700 }}>
                        ₹{item.price.toLocaleString()}
                      </span>
                      {itemDiscount > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--red)' }}>{itemDiscount}% OFF</span>
                      )}
                    </div>
                    <button
                      className="btn-gold"
                      style={{ padding: '8px 10px', fontSize: 10 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item, item.sizes[0], item.colors[0]);
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
