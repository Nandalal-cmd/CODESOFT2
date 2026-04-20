import { useState } from 'react';
import { Lbl } from '../../components/UI';
import { useApp } from '../../context/AppContext';

export default function AdminSettings({ onExit }) {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    storeName: 'FashionWear',
    storeEmail: 'admin@fashionwear.in',
    storePhone: '+91 98765 43210',
    storeAddress: 'Mumbai, Maharashtra, India',
    currency: 'INR',
    taxRate: '18',
    freeShipThreshold: '999',
    shippingFee: '79',
    paytmMid: 'YOUR_PAYTM_MID',
    paytmKey: '••••••••••••••••',
    paytmEnv: 'test',
    emailNotify: true,
    smsNotify: false,
    lowStockAlert: '15',
    maintenanceMode: false,
  });

  const update = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  const TABS = [
    { id: 'general', label: '🏪 General' },
    { id: 'shipping', label: '🚚 Shipping' },
    { id: 'payment', label: '💳 Payment' },
    { id: 'notifications', label: '🔔 Notifications' },
    { id: 'security', label: '🔒 Security' },
  ];

  const save = () => showToast('Settings saved successfully!');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Settings</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Configure your store preferences</p>
        </div>
        <button className="btn-gold" onClick={save}>Save Changes</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Tab Nav */}
        <div className="card" style={{ padding: '8px 0', height: 'fit-content' }}>
          {TABS.map(t => (
            <div key={t.id}
              className={`admin-nav-item ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
              style={{ fontSize: 13 }}>
              {t.label}
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card" style={{ padding: 28 }}>

          {activeTab === 'general' && (
            <div>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: 22, marginBottom: 22 }}>Store Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><Lbl text="Store Name"/><input className="inp" value={settings.storeName} onChange={e => update('storeName', e.target.value)}/></div>
                <div><Lbl text="Store Email"/><input className="inp" type="email" value={settings.storeEmail} onChange={e => update('storeEmail', e.target.value)}/></div>
                <div><Lbl text="Phone Number"/><input className="inp" value={settings.storePhone} onChange={e => update('storePhone', e.target.value)}/></div>
                <div>
                  <Lbl text="Currency"/>
                  <select className="inp" value={settings.currency} onChange={e => update('currency', e.target.value)}>
                    <option value="INR">INR — Indian Rupee (₹)</option>
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}><Lbl text="Store Address"/><input className="inp" value={settings.storeAddress} onChange={e => update('storeAddress', e.target.value)}/></div>
                <div><Lbl text="GST / Tax Rate (%)"/><input className="inp" type="number" value={settings.taxRate} onChange={e => update('taxRate', e.target.value)}/></div>
                <div>
                  <Lbl text="Maintenance Mode"/>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <div onClick={() => update('maintenanceMode', !settings.maintenanceMode)} style={{
                      width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background .2s',
                      background: settings.maintenanceMode ? 'var(--red)' : 'var(--bd)', position: 'relative',
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 3, transition: 'left .2s',
                        left: settings.maintenanceMode ? 23 : 3,
                      }} />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>{settings.maintenanceMode ? 'Store is offline' : 'Store is live'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: 22, marginBottom: 22 }}>Shipping Configuration</h3>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Lbl text="Free Shipping Threshold (₹)"/>
                    <input className="inp" type="number" value={settings.freeShipThreshold} onChange={e => update('freeShipThreshold', e.target.value)}/>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 5 }}>Orders above this amount get free shipping</div>
                  </div>
                  <div>
                    <Lbl text="Standard Shipping Fee (₹)"/>
                    <input className="inp" type="number" value={settings.shippingFee} onChange={e => update('shippingFee', e.target.value)}/>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 20 }}>
                  <h4 style={{ fontFamily: 'var(--fd)', fontSize: 18, marginBottom: 14 }}>Delivery Partners</h4>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {[
                      { name: 'Delhivery', status: 'Connected', eta: '2-4 days' },
                      { name: 'Blue Dart', status: 'Connected', eta: '1-2 days' },
                      { name: 'DTDC', status: 'Disconnected', eta: '3-5 days' },
                      { name: 'Ekart', status: 'Connected', eta: '2-5 days' },
                    ].map(p => (
                      <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)', padding: '12px 16px', borderRadius: 4, border: '1px solid var(--bd)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text2)' }}>ETA: {p.eta}</div>
                        </div>
                        <span className={`status status-${p.status === 'Connected' ? 'active' : 'inactive'}`}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: 22, marginBottom: 6 }}>Payment Gateway</h3>
              <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>Configure your Paytm merchant credentials for live payments.</p>

              {/* Paytm Config */}
              <div style={{ background: 'rgba(0,185,242,.06)', border: '1px solid rgba(0,185,242,.2)', padding: 20, borderRadius: 'var(--r)', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <span className="paytm-badge" style={{ fontSize: 18 }}>Paytm</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Paytm Payment Gateway</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>Accepts UPI, Wallet, Cards & Net Banking</div>
                  </div>
                  <span className="status status-active" style={{ marginLeft: 'auto' }}>Active</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><Lbl text="Merchant ID (MID)"/><input className="inp" value={settings.paytmMid} onChange={e => update('paytmMid', e.target.value)} placeholder="YOUR_PAYTM_MID"/></div>
                  <div><Lbl text="Merchant Key (Secret)"/><input className="inp" type="password" value={settings.paytmKey} onChange={e => update('paytmKey', e.target.value)}/></div>
                  <div>
                    <Lbl text="Environment"/>
                    <select className="inp" value={settings.paytmEnv} onChange={e => update('paytmEnv', e.target.value)}>
                      <option value="test">Staging / Test</option>
                      <option value="prod">Production (Live)</option>
                    </select>
                  </div>
                  <div>
                    <Lbl text="Website Name"/>
                    <input className="inp" value={settings.paytmEnv === 'test' ? 'WEBSTAGING' : 'DEFAULT'} disabled/>
                  </div>
                </div>
                <div style={{ marginTop: 14, padding: 12, background: 'rgba(0,0,0,.3)', borderRadius: 4, fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
                  💡 <strong style={{ color: 'var(--text)' }}>Setup Guide:</strong> Register at <span style={{ color: 'var(--gold)' }}>business.paytm.com</span> → Developer → API Keys to get your MID and Merchant Key. Use WEBSTAGING for testing and DEFAULT for production. Enable the backend server (<code style={{ color: 'var(--gold)' }}>server/paytm.js</code>) to handle checksum generation.
                </div>
              </div>

              {/* Other Methods */}
              <h4 style={{ fontFamily: 'var(--fd)', fontSize: 18, marginBottom: 14 }}>Other Payment Methods</h4>
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  { name: 'Razorpay', icon: '💳', status: false },
                  { name: 'Stripe', icon: '⚡', status: false },
                  { name: 'Cash on Delivery', icon: '💵', status: true },
                  { name: 'Bank Transfer', icon: '🏦', status: false },
                ].map(m => (
                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg3)', padding: '12px 16px', borderRadius: 4, border: '1px solid var(--bd)' }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <span style={{ flex: 1, fontWeight: 600 }}>{m.name}</span>
                    <div onClick={() => {}} style={{
                      width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                      background: m.status ? 'var(--green)' : 'var(--bd)', position: 'relative', transition: 'background .2s',
                    }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: m.status ? 23 : 3, transition: 'left .2s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: 22, marginBottom: 22 }}>Notification Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'emailNotify', label: 'Email Notifications', desc: 'Send order updates via email to customers' },
                  { key: 'smsNotify', label: 'SMS Notifications', desc: 'Send SMS alerts for shipping & delivery' },
                ].map(({ key, label, desc }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg3)', padding: '16px 20px', borderRadius: 4, border: '1px solid var(--bd)' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{desc}</div>
                    </div>
                    <div onClick={() => update(key, !settings[key])} style={{
                      width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background .2s',
                      background: settings[key] ? 'var(--green)' : 'var(--bd)', position: 'relative',
                    }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'left .2s', left: settings[key] ? 23 : 3 }} />
                    </div>
                  </div>
                ))}
                <div>
                  <Lbl text="Low Stock Alert Threshold"/>
                  <input className="inp" type="number" value={settings.lowStockAlert} onChange={e => update('lowStockAlert', e.target.value)} style={{ maxWidth: 200 }}/>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 5 }}>Alert when stock falls below this quantity</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 style={{ fontFamily: 'var(--fd)', fontSize: 22, marginBottom: 22 }}>Security</h3>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div><Lbl text="Admin Email"/><input className="inp" type="email" defaultValue="admin@fashionwear.in"/></div>
                  <div><Lbl text="Current Password"/><input className="inp" type="password" placeholder="••••••••"/></div>
                  <div><Lbl text="New Password"/><input className="inp" type="password" placeholder="Min 8 characters"/></div>
                  <div><Lbl text="Confirm New Password"/><input className="inp" type="password" placeholder="Repeat new password"/></div>
                </div>
                <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 20 }}>
                  <h4 style={{ fontFamily: 'var(--fd)', fontSize: 18, marginBottom: 14 }}>Active Sessions</h4>
                  {[
                    { device: 'Chrome · Windows 11', loc: 'Mumbai, IN', time: 'Current session', active: true },
                    { device: 'Safari · iPhone 15', loc: 'Mumbai, IN', time: '2 hours ago', active: false },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 4, marginBottom: 10, border: '1px solid var(--bd)' }}>
                      <span style={{ fontSize: 20 }}>{i === 0 ? '🖥️' : '📱'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.device}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.loc} · {s.time}</div>
                      </div>
                      {s.active ? (
                        <span className="status status-active">Active</span>
                      ) : (
                        <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 11 }}>Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
                <button className="btn-gold" style={{ maxWidth: 200 }} onClick={() => showToast('Password updated!')}>Update Password</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--bd)', display: 'flex', gap: 12 }}>
            <button className="btn-gold" onClick={save}>Save Changes</button>
            <button className="btn-ghost" onClick={() => showToast('Changes discarded')}>Discard</button>
          </div>
        </div>
      </div>
    </div>
  );
}
