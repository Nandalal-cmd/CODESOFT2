import { useState } from 'react';
import AdminOverview  from './AdminOverview';
import AdminProducts  from './AdminProducts';
import AdminOrders    from './AdminOrders';
import AdminCustomers from './AdminCustomers';
import AdminCoupons   from './AdminCoupons';
import AdminSettings  from './AdminSettings';

const NAV = [
  { id: 'overview',  icon: '📊', label: 'Dashboard' },
  { id: 'orders',    icon: '📦', label: 'Orders' },
  { id: 'products',  icon: '👗', label: 'Products' },
  { id: 'customers', icon: '👥', label: 'Customers' },
  { id: 'coupons',   icon: '🎟️', label: 'Coupons' },
  { id: 'analytics', icon: '📈', label: 'Analytics' },
  { id: 'settings',  icon: '⚙️', label: 'Settings' },
];

export default function AdminDashboard({ onExit }) {
  const [active, setActive] = useState('overview');

  const pages = {
    overview:  <AdminOverview onNavigate={setActive} />,
    orders:    <AdminOrders />,
    products:  <AdminProducts />,
    customers: <AdminCustomers />,
    coupons:   <AdminCoupons />,
    analytics: <AdminAnalytics />,
    settings:  <AdminSettings onExit={onExit} />,
  };

  return (
    <div className="admin-layout" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid var(--bd)' }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 700, color: 'var(--gold)', letterSpacing: 2 }}>FÀSHIONWEAR</div>
          <div style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>Admin Panel</div>
        </div>

        <nav style={{ padding: '10px 0', flex: 1 }}>
          {NAV.map(n => (
            <div key={n.id} className={`admin-nav-item ${active === n.id ? 'active' : ''}`}
              onClick={() => setActive(n.id)}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--bd)' }}>
          <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }} onClick={onExit}>
            ← Back to Store
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="admin-main">
        {pages[active] || pages.overview}
      </div>
    </div>
  );
}

/* ── Analytics Page (static chart stays as-is) ── */
function AdminAnalytics() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const revenue = [42000,58000,51000,67000,73000,89000,95000,82000,110000,128000,98000,142000];
  const maxRev = Math.max(...revenue);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Analytics</h2>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 32 }}>Revenue and performance metrics</p>

      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--fd)', fontSize: 20, marginBottom: 24 }}>Monthly Revenue</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200, paddingBottom: 32, position: 'relative' }}>
          {[0,25,50,75,100].map(p => (
            <div key={p} style={{ position: 'absolute', left: 0, bottom: `${p * 1.6}px`, right: 0, borderBottom: '1px solid var(--bd)', opacity: .4 }}>
              <span style={{ fontSize: 10, color: 'var(--text2)', position: 'absolute', left: 0, transform: 'translateY(-50%)' }}>₹{Math.round(maxRev * p / 100 / 1000)}k</span>
            </div>
          ))}
          {revenue.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 700, opacity: 0, transition: 'opacity .2s' }} className="bar-label">₹{Math.round(v/1000)}k</div>
              <div style={{
                width: '100%', background: 'linear-gradient(to top,var(--gold),var(--gold2))',
                height: `${(v / maxRev) * 160}px`, borderRadius: '2px 2px 0 0',
                transition: 'height .5s', cursor: 'pointer', opacity: .85,
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.previousElementSibling.style.opacity = '1'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '.85'; e.currentTarget.previousElementSibling.style.opacity = '0'; }}
              />
              <span style={{ position: 'absolute', bottom: -22, fontSize: 10, color: 'var(--text2)' }}>{months[i]}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginTop: 24 }}>
          {[
            ['Total Revenue','₹10.35L','▲ 23%','var(--gold)'],
            ['Avg Order Value','₹2,340','▲ 8%','var(--green)'],
            ['Conversion Rate','3.8%','▲ 1.2%','#5288e0'],
            ['Return Rate','4.2%','▼ 0.8%','var(--green)'],
          ].map(([l,v,d,c]) => (
            <div key={l} style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', padding: '14px 16px', borderRadius: 'var(--r)' }}>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 700, color: c, marginBottom: 2 }}>{v}</div>
              <div style={{ fontSize: 11, color: d.includes('▲') ? 'var(--green)' : '#dc5050' }}>{d} this month</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
