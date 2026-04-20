import { useApp } from '../context/AppContext';

/* ── Toast ── */
export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
  );
}

/* ── Stars ── */
export function Stars({ rating }) {
  return (
    <span className="stars">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span style={{ color: 'var(--text2)', fontSize: 11, marginLeft: 4 }}>{rating}</span>
    </span>
  );
}

/* ── Loader ── */
export function Loader({ size = 20 }) {
  return <div className="loader" style={{ width: size, height: size }} />;
}

/* ── Section Header ── */
export function SectionHeader({ tag, title, sub }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 40 }}>
      {tag && <span className="tag" style={{ marginBottom: 12, display: 'inline-block' }}>{tag}</span>}
      <h2 style={{ fontFamily: 'var(--fd)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700 }}>{title}</h2>
      {sub && <p style={{ color: 'var(--text2)', fontSize: 15, marginTop: 8 }}>{sub}</p>}
    </div>
  );
}

/* ── Label ── */
export function Lbl({ text }) {
  return (
    <label style={{
      fontSize: 11, color: 'var(--text2)', letterSpacing: 1.2,
      textTransform: 'uppercase', display: 'block', marginBottom: 7, fontWeight: 500,
    }}>{text}</label>
  );
}

/* ── Divider ── */
export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
      {label && <span style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
    </div>
  );
}

/* ── Empty State ── */
export function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text2)' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--fd)', fontSize: 26, marginBottom: 8, color: 'var(--text)' }}>{title}</div>
      {sub && <div style={{ fontSize: 14, marginBottom: action ? 24 : 0 }}>{sub}</div>}
      {action}
    </div>
  );
}

/* ── Stat Card ── */
export function StatCard({ icon, label, value, sub, color = 'var(--gold)', delta }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ fontSize: 22 }}>{icon}</div>
        {delta !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
            background: delta >= 0 ? 'rgba(82,168,105,.12)' : 'rgba(224,82,82,.12)',
            color: delta >= 0 ? 'var(--green)' : 'var(--red)',
          }}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--fd)', fontSize: 28, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/* ── Pagination ── */
export function Pagination({ page, total, perPage, onChange }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
      <button className="page-btn" onClick={() => onChange(page - 1)} disabled={page === 1} style={{ opacity: page === 1 ? .4 : 1 }}>‹</button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
        <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button className="page-btn" onClick={() => onChange(page + 1)} disabled={page === pages} style={{ opacity: page === pages ? .4 : 1 }}>›</button>
    </div>
  );
}

/* ── Search Input ── */
export function SearchInput({ value, onChange, placeholder = 'Search...', style }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
      <input className="inp" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={{ paddingLeft: 36 }} />
    </div>
  );
}
