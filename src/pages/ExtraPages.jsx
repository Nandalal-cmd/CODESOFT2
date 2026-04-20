import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard, ProductModal } from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import { Lbl } from '../components/UI';

/* ════════════════════════════════════════
   Order Success Page
════════════════════════════════════════ */
export function OrderSuccessPage({ order, onContinue, onViewOrders }) {
  if (!order) return null;
  return (
    <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 5%' }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(82,168,105,.12)', border: '2px solid var(--green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 24px', animation: 'fadeUp .5s',
        }}>✓</div>
        <h1 style={{ fontFamily: 'var(--fd)', fontSize: 46, fontWeight: 700, marginBottom: 10 }}>Order Placed!</h1>
        <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 8 }}>Thank you for shopping with FashionWear 🎉</p>
        <div className="tag" style={{ margin: '0 auto 16px', display: 'inline-block', fontSize: 13 }}>
          Order #{order.orderId || order.id}
        </div>
        {order.txnId && (
          <div className="tag" style={{ margin: '0 auto 24px', display: 'inline-block', fontSize: 12, borderColor: 'rgba(82,168,105,.4)', color: 'var(--green)', background: 'rgba(82,168,105,.08)' }}>
            TXN ID: {order.txnId}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 380, margin: '0 auto 28px', background: 'var(--bg2)', border: '1px solid var(--bd)', padding: 20, borderRadius: 'var(--r)' }}>
          {[
            ['Total Paid',  `₹${(order.total || 0).toLocaleString()}`],
            ['Payment',     order.paymentStatus === 'cod' ? 'Cash on Delivery' : (order.paymentMethod || 'Paytm')],
            ['Delivery',    '3–7 Business Days'],
            ['Items',       order.items?.length || '—'],
          ].map(([l, v]) => (
            <div key={l} style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>{v}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 32, lineHeight: 1.7 }}>
          A confirmation email has been sent to <strong style={{ color: 'var(--text)' }}>{order.email}</strong>.<br/>
          Estimated delivery: <strong style={{ color: 'var(--gold)' }}>3–7 business days</strong>.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-gold" style={{ padding: '12px 32px' }} onClick={onContinue}>Continue Shopping</button>
          {onViewOrders && (
            <button className="btn-outline" style={{ padding: '12px 20px' }} onClick={onViewOrders}>My Orders →</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Auth Page — Real API login/register
════════════════════════════════════════ */
export function AuthPage({ onSuccess, onBack }) {
  const { login, register, showToast, authLoading } = useApp();
  const [mode, setMode] = useState('login');
  const [f, setF]       = useState({ name: '', email: '', pass: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (mode === 'signup' && f.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))  e.email = 'Enter a valid email address';
    if (f.pass.length < 6)                              e.pass = 'Password must be at least 6 characters';
    if (mode === 'signup' && f.pass !== f.confirm)      e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    let result;
    if (mode === 'login') {
      result = await login(f.email, f.pass);
      if (result.ok) {
        showToast('Welcome back!');
        onSuccess();
      } else {
        showToast(result.msg, 'err');
      }
    } else {
      result = await register(f.name.trim(), f.email, f.pass);
      if (result.ok) {
        showToast(`Welcome, ${f.name.trim()}! Account created 🎉`);
        onSuccess();
      } else {
        showToast(result.msg, 'err');
      }
    }
  };

  const InputErr = ({ field }) => errors[field]
    ? <div style={{ fontSize: 11, color: 'var(--red, #e05252)', marginTop: 4 }}>{errors[field]}</div>
    : null;

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 5%' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>FÀSHIONWEAR</div>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 600, marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            {mode === 'login' ? 'Sign in to continue shopping' : 'Join for exclusive offers & early access'}
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <div style={{ marginBottom: 14 }}>
                <Lbl text="Full Name"/>
                <input id="auth-name" required className={`inp${errors.name ? ' inp-error' : ''}`}
                  placeholder="Aarav Sharma" value={f.name}
                  onChange={e => { setF(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}/>
                <InputErr field="name"/>
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <Lbl text="Email Address"/>
              <input id="auth-email" required className={`inp${errors.email ? ' inp-error' : ''}`}
                type="email" placeholder="you@example.com" value={f.email}
                onChange={e => { setF(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}/>
              <InputErr field="email"/>
            </div>
            <div style={{ marginBottom: mode === 'signup' ? 14 : 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <Lbl text="Password"/>
                {mode === 'login' && <span style={{ fontSize: 11, color: 'var(--gold)', cursor: 'pointer' }}>Forgot?</span>}
              </div>
              <input id="auth-pass" required className={`inp${errors.pass ? ' inp-error' : ''}`}
                type="password" placeholder="••••••••" value={f.pass}
                onChange={e => { setF(p => ({ ...p, pass: e.target.value })); setErrors(p => ({ ...p, pass: '' })); }}/>
              <InputErr field="pass"/>
            </div>
            {mode === 'signup' && (
              <div style={{ marginBottom: 22 }}>
                <Lbl text="Confirm Password"/>
                <input id="auth-confirm" required className={`inp${errors.confirm ? ' inp-error' : ''}`}
                  type="password" placeholder="••••••••" value={f.confirm}
                  onChange={e => { setF(p => ({ ...p, confirm: e.target.value })); setErrors(p => ({ ...p, confirm: '' })); }}/>
                <InputErr field="confirm"/>
              </div>
            )}
            <button id="auth-submit" type="submit" className="btn-gold"
              style={{ width: '100%', padding: 13, fontSize: 12, letterSpacing: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              disabled={authLoading}>
              {authLoading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }}/> Loading...</>
                : (mode === 'login' ? 'Sign In' : 'Create Account')
              }
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text2)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setErrors({}); }}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>← Back to Shopping</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Admin Login Page
════════════════════════════════════════ */
export function AdminLoginPage({ onSuccess, onBack }) {
  const { login, showToast, authLoading } = useApp();
  const [form, setForm] = useState({ email: '', pass: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Admin login attempt:', form.email);
    const result = await login(form.email, form.pass);
    console.log('📦 Login result:', result);
    if (!result.ok) {
      console.log('❌ Login failed:', result.msg);
      showToast(result.msg, 'err');
      return;
    }
    console.log('✅ Login succeeded. User:', result.user);
    if (result.user?.role !== 'admin') {
      console.log('❌ User role is not admin:', result.user?.role);
      showToast('Only admin accounts can access the dashboard', 'err');
      return;
    }
    console.log('✅ Admin role confirmed. Navigating to dashboard...');
    showToast('Admin login successful');
    onSuccess();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 5%', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>FASHIONWEAR</div>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Admin Login</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Sign in with your admin account.</p>
        </div>
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <Lbl text="Admin Email"/>
              <input className="inp" required type="email" placeholder="admin@fashionwear.in"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <Lbl text="Password"/>
              <input className="inp" required type="password" placeholder="••••••••"
                value={form.pass} onChange={e => setForm(p => ({ ...p, pass: e.target.value }))} />
            </div>
            <button type="submit" className="btn-gold"
              style={{ width: '100%', padding: 13, fontSize: 12, letterSpacing: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              disabled={authLoading}>
              {authLoading ? 'Signing in…' : 'Sign In to Admin'}
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>← Back to Shopping</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Wishlist Page
════════════════════════════════════════ */
export function WishlistPage({ onBack, onViewDetails }) {
  const { wishlist, toggleWishlist } = useApp();
  const [selProd, setSelProd] = useState(null);
  const wishProds = PRODUCTS.filter(p => wishlist.includes(p.id));

  return (
    <div style={{ padding: '40px 5%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 38, fontWeight: 700 }}>Wishlist</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>{wishProds.length} items saved</p>
        </div>
        <button onClick={onBack} className="btn-ghost">← Continue Shopping</button>
      </div>
      {wishProds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text2)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>♡</div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, marginBottom: 8, color: 'var(--text)' }}>Your wishlist is empty</div>
          <div style={{ fontSize: 14, marginBottom: 24 }}>Save items you love by clicking the heart icon</div>
          <button className="btn-gold" onClick={onBack}>Discover Products</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 22 }}>
          {wishProds.map(p => <ProductCard key={p.id} product={p} onOpen={setSelProd} onViewDetails={onViewDetails} />)}
        </div>
      )}
      {selProd && <ProductModal product={selProd} onClose={() => setSelProd(null)} onViewDetails={onViewDetails} />}
    </div>
  );
}

/* ════════════════════════════════════════
   Order History Page
════════════════════════════════════════ */
const STATUS_COLORS = {
  pending:       { bg: 'rgba(201,164,85,.12)',  color: '#c9a455' },
  processing:    { bg: 'rgba(82,136,224,.12)',  color: '#5288e0' },
  shipped:       { bg: 'rgba(157,100,220,.12)', color: '#9d64dc' },
  delivered:     { bg: 'rgba(82,168,105,.12)',  color: '#52a869' },
  cancelled:     { bg: 'rgba(220,80,80,.12)',   color: '#dc5050' },
  payment_failed:{ bg: 'rgba(220,80,80,.12)',   color: '#dc5050' },
};

export function OrderHistoryPage({ onBack, onContinueShopping }) {
  const { fetchMyOrders, user } = useApp();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchMyOrders().then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, [user, fetchMyOrders]);

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <div style={{ fontFamily: 'var(--fd)', fontSize: 24, marginBottom: 16 }}>Sign in to view your orders</div>
      <button className="btn-gold" onClick={onBack}>Sign In</button>
    </div>
  );

  return (
    <div style={{ padding: '40px 5%', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 38, fontWeight: 700 }}>My Orders</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>{orders.length} orders placed</p>
        </div>
        <button onClick={onContinueShopping} className="btn-ghost">← Continue Shopping</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text2)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--bd)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          Loading orders…
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text2)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 28, marginBottom: 8, color: 'var(--text)' }}>No orders yet</div>
          <div style={{ fontSize: 14, marginBottom: 24 }}>Your order history will appear here</div>
          <button className="btn-gold" onClick={onContinueShopping}>Start Shopping</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            const isOpen = expanded === (order.orderId || order._id);
            return (
              <div key={order.orderId || order._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{
                  padding: '18px 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', borderBottom: isOpen ? '1px solid var(--bd)' : 'none',
                }} onClick={() => setExpanded(isOpen ? null : (order.orderId || order._id))}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>#{order.orderId || order._id?.slice(-8)}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', background: sc.bg, color: sc.color }}>
                      {order.status?.replace('_',' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>₹{order.total?.toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</div>
                    </div>
                    <span style={{ color: 'var(--text2)', fontSize: 18, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>⌄</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isOpen && (
                  <div style={{ padding: '20px 24px' }}>
                    {/* Items */}
                    <div style={{ marginBottom: 16 }}>
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--bd)' }}>
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name}
                              style={{ width: 58, height: 72, objectFit: 'cover', borderRadius: 4 }}/>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>
                              {item.size && `Size: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Color: ${item.color}`}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--gold)', marginTop: 4 }}>₹{item.price?.toLocaleString()} × {item.qty}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery & Price */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Delivery To</div>
                        <div style={{ fontWeight: 600 }}>{order.customer}</div>
                        <div style={{ color: 'var(--text2)', lineHeight: 1.6, marginTop: 2 }}>{order.address}</div>
                        <div style={{ color: 'var(--text2)', marginTop: 2 }}>{order.phone}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Price Breakdown</div>
                        {[
                          ['Subtotal',  `₹${order.subtotal?.toLocaleString()}`],
                          ...(order.discount > 0 ? [['Discount', `-₹${order.discount?.toLocaleString()}`]] : []),
                          ['Shipping',  order.shipping === 0 ? 'FREE' : `₹${order.shipping}`],
                        ].map(([l, v]) => (
                          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ color: 'var(--text2)' }}>{l}</span>
                            <span style={{ color: l === 'Discount' ? 'var(--green)' : 'var(--text)' }}>{v}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--bd)', fontWeight: 700 }}>
                          <span>Total</span>
                          <span style={{ color: 'var(--gold)' }}>₹{order.total?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    {order.timeline?.length > 0 && (
                      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--bd)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Order Timeline</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {[...order.timeline].reverse().map((t, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', marginTop: 5, flexShrink: 0 }} />
                              <div>
                                <span style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>{t.status?.replace('_',' ')}</span>
                                {t.note && <span style={{ color: 'var(--text2)', fontSize: 12, marginLeft: 8 }}>— {t.note}</span>}
                                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>
                                  {t.time ? new Date(t.time).toLocaleString('en-IN') : ''}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Profile Page
════════════════════════════════════════ */
export function ProfilePage({ onBack }) {
  const { user, updateProfile, showToast, logout } = useApp();
  const [form, setForm]   = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab]     = useState('profile');

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontFamily: 'var(--fd)', fontSize: 24, marginBottom: 16 }}>Please sign in to view your profile</div>
      <button className="btn-gold" onClick={onBack}>Sign In</button>
    </div>
  );

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile({ name: form.name.trim(), phone: form.phone });
    setSaving(false);
    if (result.ok) showToast('Profile updated successfully!');
    else showToast(result.msg, 'err');
  };

  return (
    <div style={{ padding: '40px 5%', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 13 }}>← Back</button>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#000' }}>
          {user.avatar || user.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 700, marginBottom: 2 }}>{user.name}</h1>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{user.email}</div>
          <span style={{ fontSize: 10, background: user.role === 'admin' ? 'rgba(224,122,82,.15)' : 'rgba(201,164,85,.1)', color: user.role === 'admin' ? '#e07a52' : 'var(--gold)', border: `1px solid ${user.role === 'admin' ? 'rgba(224,122,82,.3)' : 'rgba(201,164,85,.3)'}`, padding: '2px 8px', borderRadius: 10, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase' }}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid var(--bd)' }}>
        {[['profile', 'Profile'], ['addresses', 'Addresses'], ['security', 'Security']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer',
            color: tab === key ? 'var(--gold)' : 'var(--text2)',
            borderBottom: tab === key ? '2px solid var(--gold)' : '2px solid transparent',
            fontSize: 14, fontWeight: tab === key ? 600 : 400,
            marginBottom: -1, transition: 'all .2s',
          }}>{label}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontFamily: 'var(--fd)', fontSize: 20, marginBottom: 24 }}>Personal Information</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div><Lbl text="Full Name"/>
                <input className="inp" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" required/></div>
              <div><Lbl text="Phone Number"/>
                <input className="inp" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210"/></div>
              <div><Lbl text="Email Address"/>
                <input className="inp" value={user.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}/></div>
              <div><Lbl text="Account Type"/>
                <input className="inp" value={user.role === 'admin' ? 'Administrator' : 'Customer'} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}/></div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-gold" style={{ padding: '11px 28px' }} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" className="btn-ghost" style={{ padding: '11px 20px' }}
                onClick={() => { logout(); onBack(); }}>
                Sign Out
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses Tab */}
      {tab === 'addresses' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontFamily: 'var(--fd)', fontSize: 20, marginBottom: 16 }}>Saved Addresses</h3>
          {(user.addresses || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text2)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📍</div>
              <div style={{ marginBottom: 8 }}>No saved addresses yet</div>
              <div style={{ fontSize: 13 }}>Addresses you use during checkout will appear here</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {user.addresses.map((addr, i) => (
                <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', padding: '16px 20px', borderRadius: 'var(--r)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{addr.label} — {addr.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{addr.line1}, {addr.city}, {addr.state} — {addr.pin}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{addr.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontFamily: 'var(--fd)', fontSize: 20, marginBottom: 16 }}>Security</h3>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', padding: '20px', borderRadius: 'var(--r)', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Password</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>••••••••••••</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>Password change functionality coming soon.</div>
          <button className="btn-ghost" style={{ padding: '11px 20px', color: 'var(--red, #e05252)', borderColor: 'var(--red, #e05252)' }}
            onClick={() => { logout(); onBack(); }}>
            Sign Out of All Devices
          </button>
        </div>
      )}
    </div>
  );
}
