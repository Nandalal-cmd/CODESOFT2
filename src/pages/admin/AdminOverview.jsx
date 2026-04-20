import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { StatCardSkeleton } from '../../components/SkeletonLoader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  pending: '#c9a455', processing: '#5288e0', shipped: '#9d64dc',
  delivered: '#52a869', cancelled: '#dc5050', payment_failed: '#dc5050',
};

export default function AdminOverview({ token }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats()
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const topProducts  = data?.topProducts  || [];
  const statusBreakdown = data?.statusBreakdown || {};

  const statCards = [
    { icon: '💰', label: 'Total Revenue',   value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,  sub: `₹${(stats.monthRevenue || 0).toLocaleString()} this month`, color: '#c9a455' },
    { icon: '📦', label: 'Total Orders',     value: stats.totalOrders || 0,  sub: `${stats.monthOrders || 0} this month`,  color: '#5288e0' },
    { icon: '👥', label: 'Customers',        value: stats.totalUsers  || 0,  sub: `${stats.newUsers || 0} new this month`, color: '#52a869' },
    { icon: '🛍️', label: 'Active Products',  value: stats.totalProducts || 0, sub: 'Listed in catalog', color: '#9d64dc' },
  ];

  // Build chart data from status breakdown
  const chartData = Object.entries(statusBreakdown).map(([k, v]) => ({
    name: k.replace('_',' '), orders: v, fill: STATUS_COLORS[k] || '#888',
  }));

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 18, marginBottom: 32 }}>
        {loading
          ? [1,2,3,4].map(i => <StatCardSkeleton key={i} />)
          : statCards.map(s => (
            <div key={s.label} style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{ fontSize: 26 }}>{s.icon}</span>
                <span style={{ fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</span>
              </div>
              <div style={{ fontFamily: 'var(--fd)', fontSize: 32, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.sub}</div>
            </div>
          ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Recent Orders */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--bd)' }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 17, fontWeight: 600 }}>Recent Orders</div>
          </div>
          {loading ? (
            <div style={{ padding: 20 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--bd)' }}>
                  <div style={{width:'100%',height:14,background:'var(--bg3)',borderRadius:4}} />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>No orders yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bd)' }}>
                  {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => {
                  const sc = STATUS_COLORS[o.status] || '#888';
                  return (
                    <tr key={o._id} style={{ borderBottom: '1px solid var(--bd)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{o.orderId}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>{o.customer}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--gold)', fontWeight: 600 }}>₹{o.total?.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', background: sc + '22', color: sc }}>
                          {o.status?.replace('_',' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text2)', fontSize: 12 }}>
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Order Status Breakdown */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '18px 22px' }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Order Status</div>
            {chartData.length === 0 ? (
              <div style={{ color: 'var(--text2)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No data yet</div>
            ) : chartData.map(d => (
              <div key={d.name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ textTransform: 'capitalize', color: 'var(--text2)' }}>{d.name}</span>
                  <span style={{ fontWeight: 600, color: d.fill }}>{d.orders}</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3 }}>
                  <div style={{ height: '100%', background: d.fill, borderRadius: 3, width: `${Math.min(100,(d.orders / Math.max(...chartData.map(x=>x.orders),1))*100)}%`, transition: 'width .5s' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Top Products */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--r)', padding: '18px 22px' }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Top Products</div>
            {topProducts.length === 0 ? (
              <div style={{ color: 'var(--text2)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No sales data yet</div>
            ) : topProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: i < topProducts.length - 1 ? '1px solid var(--bd)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p._id}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{p.sold} sold</div>
                </div>
                <div style={{ fontFamily: 'var(--fd)', fontSize: 15, color: 'var(--gold)', fontWeight: 700 }}>₹{p.revenue?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
