import React from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ProductsPage from './pages/ProductsPage'
import DashboardPage from './pages/DashboardPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import SupportTicketsPage from './pages/SupportTicketsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminReturnsPage from './pages/AdminReturnsPage'
import AdminPromotionsPage from './pages/AdminPromotionsPage'
import AdminProfilePage from './pages/AdminProfilePage'
import AgentOrdersPage from './pages/AgentOrdersPage'
import Layout from './components/Layout'

function AdminRoute({ children }: { children: React.ReactElement }) {
  const stored = localStorage.getItem('auth')

  if (!stored) {
    return <Navigate to="/intranet/login" replace />
  }

  let role: string | undefined
  try {
    const parsed = JSON.parse(stored)
    role = parsed?.user?.rol
  } catch {
    return <Navigate to="/intranet/login" replace />
  }

  if (role !== 'Admin' && role !== 'Agente') {
    return <Navigate to="/intranet/login" replace />
  }

  return children
}

function AgentRoute({ children }: { children: React.ReactElement }) {
  const stored = localStorage.getItem('auth')

  if (!stored) {
    return <Navigate to="/intranet/login" replace />
  }

  let role: string | undefined
  try {
    const parsed = JSON.parse(stored)
    role = parsed?.user?.rol
  } catch {
    return <Navigate to="/intranet/login" replace />
  }

  if (role !== 'Agente') {
    return <Navigate to="/intranet/login" replace />
  }

  return children
}

function App() {
  return (
    <CartProvider>
    <Routes>
      <Route path="/intranet/login" element={<AdminLoginPage />} />
      <Route
        path="/agent"
        element={(
          <AgentRoute>
            <AgentOrdersPage />
          </AgentRoute>
        )}
      />
      <Route
        path="/admin"
        element={(
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/orders"
        element={(
          <AdminRoute>
            <AdminOrdersPage />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/returns"
        element={(
          <AdminRoute>
            <AdminReturnsPage />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/promotions"
        element={(
          <AdminRoute>
            <AdminPromotionsPage />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/profile"
        element={(
          <AdminRoute>
            <AdminProfilePage />
          </AdminRoute>
        )}
      />
      <Route
        path="/"
        element={(
          <Layout>
            <HomePage />
          </Layout>
        )}
      />
      <Route
        path="/auth"
        element={(
          <Layout>
            <AuthPage />
          </Layout>
        )}
      />
      <Route
        path="/products"
        element={(
          <Layout>
            <ProductsPage />
          </Layout>
        )}
      />
      <Route
        path="/about"
        element={(
          <Layout>
            <AboutPage />
          </Layout>
        )}
      />
      <Route
        path="/contact"
        element={(
          <Layout>
            <ContactPage />
          </Layout>
        )}
      />
      <Route
        path="/dashboard"
        element={(
          <Layout>
            <DashboardPage />
          </Layout>
        )}
      />
      <Route
        path="/orders"
        element={(
          <Layout>
            <OrdersPage />
          </Layout>
        )}
      />
      <Route
        path="/cart"
        element={(
          <Layout>
            <CartPage />
          </Layout>
        )}
      />
      <Route
        path="/checkout"
        element={(
          <Layout>
            <CheckoutPage />
          </Layout>
        )}
      />
      <Route
        path="/support"
        element={(
          <Layout>
            <SupportTicketsPage />
          </Layout>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </CartProvider>
  );
}

export default App;
