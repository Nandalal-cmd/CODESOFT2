import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import App, { AdminPage } from './App.jsx'
import { AppProvider, useApp } from './context/AppContext.jsx'
import { AdminLoginPage } from './pages/ExtraPages.jsx'

function AdminRoute() {
  const { user } = useApp();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return <AdminLoginPage onSuccess={() => navigate('/admin', { replace: true })} onBack={() => navigate('/')} />;
  }

  return <AdminPage />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
)
