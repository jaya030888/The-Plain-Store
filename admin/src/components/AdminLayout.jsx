import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, LogOut, ShoppingBag, FolderTree, Tag, Users, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

const AdminLayout = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout-wrapper" style={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      {/* Mobile Top Header */}
      <div className="admin-mobile-header">
        <h2 style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.5rem', color: '#468165', margin: 0, letterSpacing: '-0.03em', wordSpacing: '-0.22em' }}>The Plain Store</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <NotificationBell />
          <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ backgroundColor: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Dancing Script, cursive', fontSize: '2rem', color: '#468165', margin: 0, letterSpacing: '-0.03em', wordSpacing: '-0.22em' }}>The Plain Store</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#666' }}>Admin Portal</p>
          </div>
          {isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'block' }}>
              <X size={24} />
            </button>
          )}
        </div>
        
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 20px', color: '#333', textDecoration: 'none', fontWeight: '500' }}>
                <LayoutDashboard size={20} /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 20px', color: '#333', textDecoration: 'none', fontWeight: '500' }}>
                <Package size={20} /> Products
              </Link>
            </li>
            <li>
              <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 20px', color: '#333', textDecoration: 'none', fontWeight: '500' }}>
                <ShoppingBag size={20} /> Orders
              </Link>
            </li>
            <li>
              <Link to="/customers" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 20px', color: '#333', textDecoration: 'none', fontWeight: '500' }}>
                <Users size={20} /> Customers
              </Link>
            </li>
          </ul>
        </nav>
        
        <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
          <div style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>Logged in as: <strong>{user?.name}</strong></div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px', backgroundColor: 'transparent', border: '1px solid #eee', borderRadius: '6px', cursor: 'pointer', color: '#e03a3a', fontWeight: '600' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          style={{
            padding: '16px 40px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          className="desktop-header"
        >
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>{title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <NotificationBell />
          </div>
        </header>
        <div className="admin-main-content" style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
          <h1 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: '#333' }} className="mobile-only-title">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
