/**
 * ══════════════════════════════════════════
 *  FashionWear — Skeleton Loader Components
 * ══════════════════════════════════════════
 */

/** Single shimmer block */
function Shimmer({ w = '100%', h = 20, radius = 4, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, var(--bg3) 25%, var(--bg2) 50%, var(--bg3) 75%)',
      backgroundSize: '400% 100%',
      animation: 'shimmer 1.4s ease infinite',
      ...style,
    }} />
  );
}

/** Product card skeleton */
export function ProductCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--bd)',
      borderRadius: 'var(--r)', overflow: 'hidden',
    }}>
      <Shimmer h={300} radius={0} />
      <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Shimmer h={14} w="60%" />
        <Shimmer h={18} w="85%" />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Shimmer h={22} w="30%" />
          <Shimmer h={14} w="20%" />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {[1,2,3].map(i => <Shimmer key={i} h={28} w={40} radius={20} />)}
        </div>
        <Shimmer h={38} radius={4} style={{ marginTop: 4 }} />
      </div>
    </div>
  );
}

/** Product grid skeleton */
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 22 }}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Table row skeleton */
export function TableRowSkeleton({ cols = 5, rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri}>
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} style={{ padding: '14px 16px' }}>
              <Shimmer h={14} w={ci === 0 ? '80%' : ci === cols - 1 ? '50%' : '70%'} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Stat card skeleton */
export function StatCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--bd)',
      borderRadius: 'var(--r)', padding: 24,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Shimmer h={32} w={32} radius="50%" />
        <Shimmer h={20} w="40%" />
      </div>
      <Shimmer h={36} w="60%" />
      <Shimmer h={14} w="50%" />
    </div>
  );
}

/** Order card skeleton */
export function OrderCardSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--bg2)', border: '1px solid var(--bd)',
          borderRadius: 'var(--r)', padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Shimmer h={18} w="25%" />
            <Shimmer h={22} w="15%" radius={10} />
          </div>
          <Shimmer h={14} w="40%" />
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2].map(j => <Shimmer key={j} h={52} w={52} radius={4} />)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Shimmer h={14} w="30%" />
            <Shimmer h={14} w="20%" />
          </div>
        </div>
      ))}
    </div>
  );
}
