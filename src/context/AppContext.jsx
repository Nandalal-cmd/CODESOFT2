/**
 * ══════════════════════════════════════════
 *  FashionWear — App Context  v2.0
 *  Real API-backed auth, orders & coupons
 * ══════════════════════════════════════════
 */
import { createContext, useContext, useState, useReducer, useCallback, useEffect } from 'react';
import { authApi, orderApi, couponApi } from '../utils/api';
import { COUPONS } from '../data/products';   // Kept as fallback if server is offline

const AppCtx = createContext(null);

// ── Cart Reducer ────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const key = `${action.item.id}-${action.sz}-${action.col}`;
      const existing = state.find(i => i.key === key);
      if (existing) return state.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { key, item: action.item, sz: action.sz, col: action.col, qty: 1 }];
    }
    case 'REMOVE':     return state.filter(i => i.key !== action.key);
    case 'UPDATE_QTY': return state.map(i => i.key === action.key ? { ...i, qty: Math.max(1, i.qty + action.delta) } : i);
    case 'CLEAR':      return [];
    case 'LOAD':       return action.cart;
    default:           return state;
  }
}

// ── Provider ────────────────────────────────────────────────
export function AppProvider({ children }) {
  // Auth
  const [user, setUser]             = useState(() => {
    try { return JSON.parse(localStorage.getItem('fashionwear_user') || 'null'); } catch { return null; }
  });
  const [authLoading, setAuthLoading] = useState(false);

  // Cart — persisted to localStorage
  const [cart, dispatchCart] = useReducer(cartReducer, [], () => {
    try { return JSON.parse(localStorage.getItem('fashionwear_cart') || '[]'); } catch { return []; }
  });

  // Wishlist — persisted to localStorage
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fashionwear_wishlist') || '[]'); } catch { return []; }
  });

  // Reviews — persisted to localStorage
  const [reviews, setReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fashionwear_reviews') || '[]'); } catch { return []; }
  });

  // UI state
  const [toast, setToast]       = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  // Coupon
  const [couponCode, setCouponCode]     = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Theme
  const [theme, setTheme] = useState(() => {
    try {
      const t = localStorage.getItem('fashionwear_theme');
      return t === 'light' || t === 'dark' ? t : 'light';
    } catch { return 'light'; }
  });

  // Orders (admin/user in-memory list - fetched on demand)
  const [orders, setOrders]       = useState([]);
  const [customers, setCustomers] = useState([]);

  // ── Persist cart & wishlist ──
  useEffect(() => {
    localStorage.setItem('fashionwear_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('fashionwear_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('fashionwear_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // ── Theme ──
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fashionwear_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(p => p === 'dark' ? 'light' : 'dark'), []);

  // ── Listen for unauthorized events (token expired) ──
  useEffect(() => {
    const handler = () => {
      setUser(null);
      showToast('Session expired. Please log in again.', 'err');
    };
    window.addEventListener('fw:unauthorized', handler);
    return () => window.removeEventListener('fw:unauthorized', handler);
  }, []);

  // ── Toast ──
  const showToast = useCallback((msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  // ── Cart ──
  const addToCart = useCallback((item, sz, col) => {
    dispatchCart({ type: 'ADD', item, sz, col });
    showToast(`${item.name} added to cart!`);
    setCartOpen(true);
  }, [showToast]);

  const removeFromCart = useCallback(key => dispatchCart({ type: 'REMOVE', key }), []);
  const updateQty      = useCallback((key, delta) => dispatchCart({ type: 'UPDATE_QTY', key, delta }), []);
  const clearCart      = useCallback(() => dispatchCart({ type: 'CLEAR' }), []);

  // ── Wishlist ──
  const toggleWishlist = useCallback(id => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  // ── Reviews ──
  const addReview = useCallback((productId, rating, text) => {
    const review = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      productId,
      rating,
      text,
      name: user?.name || 'Guest',
      date: new Date().toISOString(),
    };
    setReviews(prev => [review, ...prev]);
    showToast('Review submitted! Thank you.');
  }, [user, showToast]);

  // ── Auth — Real API ──────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    try {
      console.log('[AppContext] Login attempt for:', email);
      const res  = await authApi.login({ email, password });
      const { user: u, token } = res.data;
      console.log('[AppContext] Login response received. User:', u);
      localStorage.setItem('fashionwear_token', token);
      localStorage.setItem('fashionwear_user', JSON.stringify(u));
      setUser(u);
      console.log('[AppContext] User state updated. Role:', u.role);
      return { ok: true, user: u };
    } catch (err) {
      console.error('[AppContext] Login error:', err.response?.data?.error || err.message);
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      return { ok: false, msg };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setAuthLoading(true);
    try {
      const res  = await authApi.register({ name, email, password });
      const { user: u, token } = res.data;
      localStorage.setItem('fashionwear_token', token);
      localStorage.setItem('fashionwear_user', JSON.stringify(u));
      setUser(u);
      return { ok: true, user: u };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      return { ok: false, msg };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('fashionwear_token');
    localStorage.removeItem('fashionwear_user');
    setUser(null);
    showToast('Logged out successfully');
  }, [showToast]);

  const updateProfile = useCallback(async (data) => {
    try {
      const res = await authApi.updateProfile(data);
      const u   = res.data.user;
      localStorage.setItem('fashionwear_user', JSON.stringify(u));
      setUser(u);
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Update failed';
      return { ok: false, msg };
    }
  }, []);

  // ── Coupon — Real API with localStorage fallback ─────────
  const applyCoupon = useCallback(async (code) => {
    if (!code?.trim()) return { ok: false, msg: 'Enter a coupon code' };
    try {
      const res = await couponApi.apply(code.trim(), cartSubtotal);
      setAppliedCoupon({ code: res.data.coupon.code, ...res.data.coupon });
      return { ok: true, msg: `Coupon applied: ${res.data.coupon.label}` };
    } catch (err) {
      // Fallback to local coupon data if API is offline
      const c = COUPONS[code.toUpperCase()];
      if (c) {
        setAppliedCoupon({ code: code.toUpperCase(), ...c });
        return { ok: true, msg: `Coupon applied: ${c.label}` };
      }
      const msg = err.response?.data?.error || 'Invalid coupon code';
      return { ok: false, msg };
    }
  }, []);

  // ── Price Calculations ───────────────────────────────────
  const cartCount    = cart.reduce((a, i) => a + i.qty, 0);
  const cartSubtotal = cart.reduce((a, i) => a + i.item.price * i.qty, 0);

  const calcDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percent')  return Math.round(cartSubtotal * appliedCoupon.value);
    if (appliedCoupon.type === 'flat' && cartSubtotal >= appliedCoupon.minOrder) return appliedCoupon.value;
    if (appliedCoupon.type === 'freeship') return 0;
    if (appliedCoupon.type === 'b2g1') {
      const prices = cart.map(i => i.item.price);
      return prices.length >= 3 ? Math.min(...prices) : 0;
    }
    return 0;
  };

  const discount  = calcDiscount();
  const shipping  = (appliedCoupon?.type === 'freeship' || cartSubtotal > 999) ? 0 : 79;
  const cartTotal = cartSubtotal - discount + shipping;

  // ── Place Order — Real API ───────────────────────────────
  const placeOrder = useCallback(async (deliveryInfo, paymentMethod) => {
    const orderData = {
      customer:      user?.name || deliveryInfo.name,
      email:         user?.email || deliveryInfo.email,
      phone:         deliveryInfo.phone,
      address:       `${deliveryInfo.address}, ${deliveryInfo.city} - ${deliveryInfo.pin}`,
      items:         cart.map(i => ({
        name:     i.item.name,
        price:    i.item.price,
        imageUrl: i.item.img,
        size:     i.sz,
        color:    i.col,
        qty:      i.qty,
      })),
      subtotal:      cartSubtotal,
      discount,
      couponCode:    appliedCoupon?.code || '',
      shipping,
      total:         cartTotal,
      paymentMethod,
    };

    try {
      const res   = await orderApi.create(orderData);
      const order = res.data.order;
      // Update local orders list
      setOrders(prev => [order, ...prev]);
      return { ok: true, order };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to place order';
      return { ok: false, msg };
    }
  }, [cart, cartSubtotal, discount, shipping, cartTotal, user, appliedCoupon]);

  // ── Fetch user's order history ───────────────────────────
  const fetchMyOrders = useCallback(async () => {
    if (!user) return [];
    try {
      const res = await orderApi.myOrders();
      return res.data.orders || [];
    } catch {
      return [];
    }
  }, [user]);

  return (
    <AppCtx.Provider value={{
      // Auth
      user, authLoading,
      login, register, logout, updateProfile,

      // Cart
      cart, cartCount, cartSubtotal, discount, shipping, cartTotal, appliedCoupon,
      cartOpen, setCartOpen,
      addToCart, removeFromCart, updateQty, clearCart,

      // Wishlist
      wishlist, toggleWishlist,

      // Reviews
      reviews, addReview,

      // Coupon
      couponCode, setCouponCode, applyCoupon, setAppliedCoupon,

      // Orders
      orders, setOrders, customers, setCustomers,
      placeOrder, fetchMyOrders,

      // UI
      toast, showToast,
      theme, toggleTheme,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
