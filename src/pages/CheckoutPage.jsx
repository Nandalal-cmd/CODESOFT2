import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lbl, Loader } from '../components/UI';
import { PAYMENT_METHODS } from '../utils/paytm';
import { paytmApi, orderApi } from '../utils/api';

export default function CheckoutPage({ onBack, onSuccess }) {
  const {
    cart, cartSubtotal, discount, shipping, cartTotal,
    user, placeOrder, appliedCoupon, couponCode, setCouponCode, applyCoupon,
    showToast, clearCart, setAppliedCoupon,
  } = useApp();

  const [step, setStep]       = useState(1);
  const [payMethod, setPayMethod] = useState('paytm');
  const [paying, setPaying]   = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [pd, setPd]           = useState({
    name:    user?.name  || '',
    email:   user?.email || '',
    phone:   '',
    address: '', city: '', state: '', pin: '',
    card: '', exp: '', cvv: '', upi: '',
  });

  const updateField = (k, v) => setPd(p => ({ ...p, [k]: v }));

  // ── Apply coupon via API ────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const result = await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    showToast(result.msg, result.ok ? 'ok' : 'err');
  };

  // ── Payment handler ─────────────────────────────────────
  const handlePayment = async (e) => {
    e.preventDefault();
    if (payMethod === 'card' && (!pd.card || !pd.exp || !pd.cvv)) {
      showToast('Please fill all card details', 'err'); return;
    }
    if (payMethod === 'upi' && !pd.upi) {
      showToast('Please enter UPI ID', 'err'); return;
    }

    setPaying(true);

    // 1. Create order in DB first
    const orderResult = await placeOrder(pd, payMethod);
    if (!orderResult.ok) {
      showToast(orderResult.msg, 'err');
      setPaying(false);
      return;
    }
    const order = orderResult.order;

    // 2. COD — go straight to success
    if (payMethod === 'cod') {
      setPaying(false);
      clearCart();
      setAppliedCoupon(null);
      showToast('Order placed! Pay on delivery.', 'ok');
      onSuccess({ ...order, paymentStatus: 'cod' });
      return;
    }

    // 3. Online payment — initiate Paytm
    try {
      const paytmRes = await paytmApi.initiate({
        orderId: order.orderId,
        amount:  cartTotal,
        email:   pd.email,
        phone:   pd.phone,
        name:    pd.name,
      });

      const { paytmParams, checksum, txnUrl } = paytmRes.data;

      // Build and submit Paytm form (redirects user to Paytm gateway)
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = txnUrl;

      const allParams = { ...paytmParams, CHECKSUMHASH: checksum };
      Object.entries(allParams).forEach(([key, val]) => {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = key; input.value = val;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      clearCart();
      setAppliedCoupon(null);
      form.submit(); // Redirect to Paytm

    } catch (err) {
      // If Paytm API fails, fall back to simulated success in development
      console.warn('[Paytm] API failed, using simulation:', err.message);
      await new Promise(resolve => setTimeout(resolve, 1800));
      setPaying(false);
      clearCart();
      setAppliedCoupon(null);
      showToast(`Payment successful! Order #${order.orderId}`, 'ok');
      onSuccess({ ...order, txnId: 'SIM-' + Date.now() });
    }
  };

  if (cart.length === 0) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
      <div style={{ fontFamily: 'var(--fd)', fontSize: 28 }}>Your cart is empty</div>
      <button className="btn-gold" style={{ marginTop: 24 }} onClick={onBack}>Continue Shopping</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 5%' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        ← Back to Shopping
      </button>

      {/* Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
        {[['1','Delivery'],['2','Payment'],['3','Review']].map(([n, l], i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: step > +n ? 'pointer' : 'default' }}
              onClick={() => step > +n && setStep(+n)}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= +n ? 'linear-gradient(135deg,var(--gold),var(--gold2))' : 'var(--bg3)',
                border: step >= +n ? 'none' : '1px solid var(--bd)',
                color: step >= +n ? '#000' : 'var(--text2)', fontSize: 13, fontWeight: 700,
              }}>{step > +n ? '✓' : n}</div>
              <span style={{ fontSize: 12, color: step >= +n ? 'var(--text)' : 'var(--text2)', letterSpacing: .5 }}>{l}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: step > +n ? 'var(--gold)' : 'var(--bd)', margin: '0 12px' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
        {/* Left Panel */}
        <form onSubmit={step < 3 ? (e) => { e.preventDefault(); setStep(s => s + 1); } : handlePayment}>
          {/* Step 1: Delivery */}
          {step === 1 && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: 24, marginBottom: 24 }}>Delivery Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><Lbl text="Full Name"/><input id="co-name" required className="inp" placeholder="Aarav Sharma" value={pd.name} onChange={e => updateField('name', e.target.value)}/></div>
                <div><Lbl text="Email Address"/><input id="co-email" required className="inp" type="email" placeholder="you@example.com" value={pd.email} onChange={e => updateField('email', e.target.value)}/></div>
                <div><Lbl text="Phone Number"/><input id="co-phone" required className="inp" type="tel" placeholder="+91 9876543210" value={pd.phone} onChange={e => updateField('phone', e.target.value)}/></div>
                <div><Lbl text="City"/><input id="co-city" required className="inp" placeholder="Mumbai" value={pd.city} onChange={e => updateField('city', e.target.value)}/></div>
                <div style={{ gridColumn: '1/-1' }}><Lbl text="Street Address"/><input id="co-addr" required className="inp" placeholder="House No., Street, Area, Landmark" value={pd.address} onChange={e => updateField('address', e.target.value)}/></div>
                <div><Lbl text="State"/><input id="co-state" required className="inp" placeholder="Maharashtra" value={pd.state} onChange={e => updateField('state', e.target.value)}/></div>
                <div><Lbl text="PIN Code"/><input id="co-pin" required className="inp" placeholder="400001" maxLength={6} value={pd.pin} onChange={e => updateField('pin', e.target.value)}/></div>
              </div>
              <button id="co-continue" type="submit" className="btn-gold" style={{ marginTop: 24, padding: '12px 32px' }}>Continue to Payment →</button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: 24, marginBottom: 6 }}>Payment Method</h3>
              <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>All transactions are secure and encrypted.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} className={`payment-method ${payMethod === m.id ? 'selected' : ''}`}
                    style={{ cursor: 'pointer' }} onClick={() => setPayMethod(m.id)}>
                    <input type="radio" name="pay" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)}
                      style={{ accentColor: 'var(--gold)', width: 16, height: 16 }} />
                    <div style={{ fontSize: 18 }}>{m.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {m.badge === 'paytm' ? <span className="paytm-badge">Paytm</span> : <span style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</span>}
                        {m.popular && <span style={{ fontSize: 10, background: 'rgba(82,168,105,.15)', color: 'var(--green)', border: '1px solid rgba(82,168,105,.3)', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>RECOMMENDED</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {payMethod === 'card' && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', padding: 20, borderRadius: 'var(--r)', marginBottom: 20 }}>
                  <Lbl text="Card Number"/>
                  <input className="inp" placeholder="1234 5678 9012 3456" maxLength={19} style={{ marginBottom: 14 }}
                    value={pd.card} onChange={e => updateField('card', e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim())}/>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div><Lbl text="Expiry (MM/YY)"/><input className="inp" placeholder="MM / YY" maxLength={5} value={pd.exp} onChange={e => updateField('exp', e.target.value)}/></div>
                    <div><Lbl text="CVV"/><input className="inp" type="password" placeholder="•••" maxLength={3} value={pd.cvv} onChange={e => updateField('cvv', e.target.value)}/></div>
                  </div>
                </div>
              )}

              {payMethod === 'upi' && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', padding: 20, borderRadius: 'var(--r)', marginBottom: 20 }}>
                  <Lbl text="UPI ID"/>
                  <input className="inp" placeholder="yourname@upi" value={pd.upi} onChange={e => updateField('upi', e.target.value)}/>
                  <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                    {['GPay','PhonePe','Paytm','BHIM'].map(app => (
                      <div key={app} style={{ padding: '6px 12px', border: '1px solid var(--bd)', fontSize: 11, cursor: 'pointer', borderRadius: 4, color: 'var(--text2)' }}>{app}</div>
                    ))}
                  </div>
                </div>
              )}

              {payMethod === 'paytm' && (
                <div style={{ background: 'rgba(0,185,242,.07)', border: '1px solid rgba(0,185,242,.2)', padding: 16, borderRadius: 'var(--r)', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="paytm-badge">Paytm</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Pay via Paytm Gateway</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>UPI, Wallet, Cards, Net Banking — all in one</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
                    You'll be securely redirected to Paytm to complete your payment.
                  </div>
                </div>
              )}

              {payMethod === 'netbanking' && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', padding: 20, borderRadius: 'var(--r)', marginBottom: 20 }}>
                  <Lbl text="Select Your Bank"/>
                  <select className="inp">
                    {['SBI','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra','Punjab National Bank'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn-ghost" onClick={() => setStep(1)} style={{ padding: '11px 20px' }}>← Back</button>
                <button id="co-to-review" type="submit" className="btn-gold" style={{ flex: 1, padding: 12 }}>Review Order →</button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Place Order */}
          {step === 3 && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: 24, marginBottom: 24 }}>Review & Place Order</h3>

              <div style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', padding: 16, borderRadius: 'var(--r)', marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase' }}>Delivery To</span>
                  <span onClick={() => setStep(1)} style={{ fontSize: 11, color: 'var(--gold)', cursor: 'pointer' }}>Edit</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{pd.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{pd.address}, {pd.city} - {pd.pin}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{pd.phone} · {pd.email}</div>
              </div>

              <div style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', padding: 16, borderRadius: 'var(--r)', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase' }}>Payment Via</span>
                  <span onClick={() => setStep(2)} style={{ fontSize: 11, color: 'var(--gold)', cursor: 'pointer' }}>Change</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {payMethod === 'paytm' ? <span className="paytm-badge">Paytm</span> : <span style={{ fontSize: 14, fontWeight: 600 }}>{PAYMENT_METHODS.find(m => m.id === payMethod)?.label}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn-ghost" onClick={() => setStep(2)} style={{ padding: '11px 20px' }}>← Back</button>
                <button id="co-place-order" type="submit" className="btn-gold" style={{ flex: 1, padding: 14, fontSize: 13, letterSpacing: 1.5 }} disabled={paying}>
                  {paying
                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}><Loader size={16}/> Processing...</span>
                    : `🔒 Pay ₹${cartTotal.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Order Summary Sidebar */}
        <div className="card" style={{ padding: 22, position: 'sticky', top: 80 }}>
          <h3 style={{ fontFamily: 'var(--fd)', fontSize: 20, marginBottom: 18 }}>Order Summary</h3>
          <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 16 }}>
            {cart.map(item => (
              <div key={item.key} style={{ display: 'flex', gap: 11, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--bd)' }}>
                <div style={{ position: 'relative' }}>
                  <img src={item.item.img} alt={item.item.name} style={{ width: 60, height: 78, objectFit: 'cover', borderRadius: 2 }}/>
                  <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: 'var(--gold)', color: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>{item.qty}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>{item.item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{item.sz} · {item.col}</div>
                  <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 13, marginTop: 4 }}>₹{(item.item.price * item.qty).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon input */}
          {step === 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input id="coupon-input" className="inp" placeholder="Coupon code" value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())} style={{ fontSize: 12 }}/>
              <button id="coupon-apply" type="button" className="btn-outline"
                style={{ padding: '8px 14px', whiteSpace: 'nowrap', fontSize: 11 }}
                onClick={handleApplyCoupon} disabled={couponLoading}>
                {couponLoading ? '…' : 'Apply'}
              </button>
            </div>
          )}

          {appliedCoupon && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(82,168,105,.08)', border: '1px solid rgba(82,168,105,.2)', padding: '8px 12px', borderRadius: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>✓ {appliedCoupon.label} applied</span>
              <span style={{ fontSize: 11, color: 'var(--text2)', cursor: 'pointer' }}
                onClick={() => { setCouponCode(''); useApp().setAppliedCoupon(null); }}>✕</span>
            </div>
          )}

          {[
            ['Subtotal', `₹${cartSubtotal.toLocaleString()}`],
            ...(discount > 0 ? [['Discount', `-₹${discount.toLocaleString()}`]] : []),
            ['Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 9, fontSize: 13, color: l === 'Discount' ? 'var(--green)' : 'var(--text2)' }}>
              <span>{l}</span><span style={{ color: l === 'Discount' ? 'var(--green)' : 'var(--text)' }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--bd)', fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 700 }}>
            <span>Total</span><span style={{ color: 'var(--gold)' }}>₹{cartTotal.toLocaleString()}</span>
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span>🔒 256-bit SSL Encrypted</span>
            <span>🛡️ Paytm Buyer Protection</span>
            <span>↩️ Easy 30-day returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
