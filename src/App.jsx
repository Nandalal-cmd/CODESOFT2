import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import { Toast } from './components/UI';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import {
  OrderSuccessPage,
  AuthPage,
  WishlistPage,
  OrderHistoryPage,
  ProfilePage,
} from './pages/ExtraPages';
import ProductDescriptionPage from './pages/ProductDescriptionPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import './styles/globals.css';

function AppShell() {
  const { user } = useApp();
  const [view, setView]               = useState('home');
  const [search, setSearch]           = useState('');
  const [lastOrder, setLastOrder]     = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Handle Paytm callback redirect (URL params set by server)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payStatus = params.get('payStatus') || params.get('status');
    const orderId   = params.get('order');

    if (payStatus === 'success' && orderId) {
      setLastOrder({ orderId, txnId: params.get('txn'), paymentStatus: 'paid', email: user?.email || '' });
      setView('success');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payStatus === 'failed') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const navigate = (v) => {
    if (v === 'checkout' && !user) { setView('auth'); return; }
    if (v === 'orders'   && !user) { setView('auth'); return; }
    if (v === 'profile'  && !user) { setView('auth'); return; }
    if (v === 'admin') {
      window.open('/admin', '_blank', 'noopener,noreferrer');
      return;
    }
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar onSearch={setSearch} searchVal={search} onNavigate={navigate} currentView={view} onViewDetails={openProductDetails} />

      {/* Store views */}
      {view === 'home'    && <HomePage searchQuery={search} onViewDetails={openProductDetails} />}
      {view === 'men'     && <HomePage searchQuery={search} defaultCat="Men"    onViewDetails={openProductDetails} />}
      {view === 'women'   && <HomePage searchQuery={search} defaultCat="Women"  onViewDetails={openProductDetails} />}
      {view === 'sale'    && <HomePage searchQuery={search} defaultBadge="SALE" onViewDetails={openProductDetails} />}

      {view === 'product' && (
        <ProductDescriptionPage
          product={selectedProduct}
          onBack={() => setView('home')}
          onViewDetails={openProductDetails}
        />
      )}

      {view === 'checkout' && (
        <CheckoutPage
          onBack={() => setView('home')}
          onSuccess={(order) => { setLastOrder(order); setView('success'); }}
        />
      )}

      {view === 'success' && (
        <OrderSuccessPage
          order={lastOrder}
          onContinue={() => setView('home')}
          onViewOrders={() => setView('orders')}
        />
      )}

      {view === 'auth' && (
        <AuthPage
          onSuccess={() => setView('checkout')}
          onBack={() => setView('home')}
        />
      )}

      {view === 'wishlist' && (
        <WishlistPage onBack={() => setView('home')} onViewDetails={openProductDetails} />
      )}

      {view === 'orders' && (
        <OrderHistoryPage
          onBack={() => setView('auth')}
          onContinueShopping={() => setView('home')}
        />
      )}

      {view === 'profile' && (
        <ProfilePage onBack={() => setView('home')} />
      )}

      <CartSidebar onCheckout={() => navigate('checkout')} />
      <Toast />
    </div>
  );
}

export default function App() {
  return <AppShell />;
}

export function AdminPage() {
  const routerNavigate = useNavigate();
  return <AdminDashboard onExit={() => routerNavigate('/')} />;
}
