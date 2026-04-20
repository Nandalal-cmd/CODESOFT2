import { useApp } from '../context/AppContext';

export default function CartSidebar({ onCheckout }) {
  const { cart, cartOpen, setCartOpen, cartSubtotal, cartTotal, discount, shipping, removeFromCart, updateQty, appliedCoupon, couponCode, setCouponCode, applyCoupon, showToast } = useApp();

  const handleCoupon = () => {
    const result = applyCoupon(couponCode);
    showToast(result.msg, result.ok ? 'ok' : 'err');
  };

  return (
    <>
      {cartOpen && <div onClick={() => setCartOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 850 }} />}
      <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--bd)' }}>
          <span style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 700 }}>
            Shopping Bag ({cart.reduce((a, i) => a + i.qty, 0)})
          </span>
          <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text2)' }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🛒</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 22, marginBottom: 8, color: 'var(--text)' }}>Your bag is empty</div>
              <div style={{ fontSize: 13, marginBottom: 24 }}>Discover styles you'll love</div>
              <button className="btn-gold" onClick={() => setCartOpen(false)}>Browse Products</button>
            </div>
          ) : (
            cart.map(item => (
              <CartItem key={item.key} item={item} onRemove={removeFromCart} onUpdateQty={updateQty} />
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '16px 22px', borderTop: '1px solid var(--bd)' }}>
            {/* Shipping progress */}
            {cartSubtotal < 999 && (
              <div style={{ marginBottom: 14, background: 'rgba(201,164,85,.07)', border: '1px solid rgba(201,164,85,.2)', padding: '8px 12px', borderRadius: 2 }}>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>
                  Add <strong style={{ color: 'var(--gold)' }}>₹{(999 - cartSubtotal).toLocaleString()}</strong> more for FREE shipping!
                </div>
                <div style={{ height: 3, background: 'var(--bd)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${(cartSubtotal / 999) * 100}%`, background: 'var(--gold)', borderRadius: 2, transition: 'width .3s' }} />
                </div>
              </div>
            )}

            {/* Coupon */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input className="inp" placeholder="Enter coupon code" value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                style={{ fontSize: 12 }} onKeyDown={e => e.key === 'Enter' && handleCoupon()} />
              <button className="btn-outline" style={{ padding: '8px 14px', whiteSpace: 'nowrap', fontSize: 11 }} onClick={handleCoupon}>Apply</button>
            </div>
            {appliedCoupon && (
              <div style={{ fontSize: 12, color: 'var(--green)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                ✅ <strong>{appliedCoupon.code}</strong> — {appliedCoupon.label}
              </div>
            )}

            {/* Totals */}
            <div style={{ marginBottom: 14 }}>
              {[
                ['Subtotal', `₹${cartSubtotal.toLocaleString()}`],
                ...(discount > 0 ? [['Discount', `-₹${discount.toLocaleString()}`]] : []),
                ['Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 13, color: l === 'Discount' ? 'var(--green)' : 'var(--text2)' }}>
                  <span>{l}</span>
                  <span style={{ color: l === 'Discount' ? 'var(--green)' : 'var(--text)' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 11, borderTop: '1px solid var(--bd)', fontFamily: 'var(--fd)', fontSize: 20, fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: 'var(--gold)' }}>₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <button className="btn-gold" style={{ width: '100%', padding: 13, fontSize: 12, letterSpacing: 1.5, marginBottom: 8 }}
              onClick={() => { setCartOpen(false); onCheckout(); }}>
              Proceed to Checkout →
            </button>
            <button className="btn-ghost" style={{ width: '100%', padding: 9 }} onClick={() => setCartOpen(false)}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CartItem({ item, onRemove, onUpdateQty }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--bd)' }}>
      <img src={item.item.img} alt={item.item.name}
        style={{ width: 68, height: 88, objectFit: 'cover', flexShrink: 0, borderRadius: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, lineHeight: 1.3 }}>{item.item.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>{item.sz} · {item.col}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={() => onUpdateQty(item.key, -1)} style={{ width: 26, height: 26, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--text)', cursor: 'pointer', fontSize: 14, borderRadius: 2 }}>−</button>
            <span style={{ width: 30, textAlign: 'center', fontSize: 13 }}>{item.qty}</span>
            <button onClick={() => onUpdateQty(item.key, 1)} style={{ width: 26, height: 26, background: 'var(--bg3)', border: '1px solid var(--bd)', color: 'var(--text)', cursor: 'pointer', fontSize: 14, borderRadius: 2 }}>+</button>
          </div>
          <span style={{ color: 'var(--gold)', fontFamily: 'var(--fd)', fontSize: 17, fontWeight: 700 }}>
            ₹{(item.item.price * item.qty).toLocaleString()}
          </span>
        </div>
      </div>
      <button onClick={() => onRemove(item.key)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 15, alignSelf: 'flex-start', paddingTop: 2 }}>✕</button>
    </div>
  );
}
