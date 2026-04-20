import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar({ onSearch, searchVal, onNavigate, currentView }) {
  const { cartCount, user, logout, setCartOpen, theme, toggleTheme } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 800,
      background: 'var(--nav-bg)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--bd)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, padding: '0 5%' }}>

        {/* Logo */}
        <div onClick={() => onNavigate('home')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'var(--fd)', fontSize: 22, fontWeight: 700, letterSpacing: 3, color: 'var(--gold)', lineHeight: 1 }}>
            FÀSHION<span style={{ color: 'var(--text2)', fontWeight: 400 }}>WEAR</span>
          </span>
          <span style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 3, textTransform: 'uppercase' }}>Premium Clothing</span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: 28, flex: 1, justifyContent: 'center' }}>
          {[['home','Shop'],['men','Men'],['women','Women'],['sale','Sale 🔥']].map(([v, l]) => (
            <span key={v} onClick={() => onNavigate(v)} style={{
              fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase',
              color: currentView === v ? 'var(--gold)' : 'var(--text2)',
              cursor: 'pointer', transition: 'color .2s',
              borderBottom: currentView === v ? '1px solid var(--gold)' : '1px solid transparent',
              paddingBottom: 2,
            }}>{l}</span>
          ))}
        </div>

        {/* Search + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 11 }}
            onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
          </button>

          <div style={{ position: 'relative' }}>
            <input className="inp" value={searchVal} onChange={e => onSearch(e.target.value)}
              placeholder="Search..." style={{ width: 200, padding: '7px 12px 7px 32px', fontSize: 12 }} />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, pointerEvents: 'none', color: 'var(--text3)' }}>🔍</span>
          </div>

          {/* User menu */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <div id="user-avatar-btn" onClick={() => setShowUserMenu(v => !v)}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg,var(--gold),var(--gold2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', userSelect: 'none',
                }}>
                {(user.avatar || user.name?.[0] || '?').toUpperCase()}
              </div>

              {showUserMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowUserMenu(false)} />
                  <div style={{
                    position: 'absolute', right: 0, top: 42,
                    background: 'var(--bg2)', border: '1px solid var(--bd)',
                    minWidth: 210, zIndex: 100, borderRadius: 'var(--r)',
                    overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,.2)',
                  }}>
                    {/* User info */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--bd)' }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{user.email}</div>
                      <span style={{
                        display: 'inline-block', marginTop: 5, fontSize: 9, fontWeight: 700,
                        letterSpacing: .5, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 10,
                        background: user.role === 'admin' ? 'rgba(224,122,82,.15)' : 'rgba(201,164,85,.1)',
                        color:      user.role === 'admin' ? '#e07a52' : 'var(--gold)',
                        border:     `1px solid ${user.role === 'admin' ? 'rgba(224,122,82,.3)' : 'rgba(201,164,85,.3)'}`,
                      }}>{user.role}</span>
                    </div>

                    {/* Menu items */}
                    {[
                      ['👤 Profile',   'profile'],
                      ['📦 My Orders', 'orders'],
                      ['❤️ Wishlist',  'wishlist'],
                    ].map(([l, v]) => (
                      <div key={v} id={`nav-${v}`}
                        onClick={() => { onNavigate(v); setShowUserMenu(false); }}
                        style={{ padding: '11px 16px', fontSize: 13, cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {l}
                      </div>
                    ))}

                    {/* Admin only */}
                    {user.role === 'admin' && (
                      <div id="nav-admin"
                        onClick={() => { onNavigate('admin'); setShowUserMenu(false); }}
                        style={{ padding: '11px 16px', fontSize: 13, cursor: 'pointer', color: '#e07a52', borderTop: '1px solid var(--bd)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        🛠 Admin Dashboard
                      </div>
                    )}

                    <div id="nav-signout"
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      style={{ padding: '11px 16px', fontSize: 13, cursor: 'pointer', color: '#dc5050', borderTop: '1px solid var(--bd)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      🚪 Sign Out
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button id="nav-signin" className="btn-outline" style={{ padding: '6px 14px', fontSize: 11 }}
              onClick={() => onNavigate('auth')}>
              Sign In
            </button>
          )}

          {/* Cart */}
          <button id="nav-cart" onClick={() => setCartOpen(true)} style={{
            position: 'relative', background: 'none',
            border: '1px solid var(--bd)', padding: '7px 16px',
            cursor: 'pointer', color: 'var(--text)',
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 13, fontFamily: 'var(--fb)', borderRadius: 2, transition: 'border .2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bd)'}>
            🛒 {cartCount > 0 ? `(${cartCount})` : 'Cart'}
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -7, right: -7,
                background: 'var(--gold)', color: '#000',
                width: 17, height: 17, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800,
              }}>{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
