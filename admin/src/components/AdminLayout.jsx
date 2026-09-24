import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Tag, 
  TicketPercent, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const AdminLayout = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Orders', path: '/orders', icon: ShoppingBag },
    { label: 'Categories', path: '/categories', icon: Tag },
    { label: 'Coupons', path: '/coupons', icon: TicketPercent },
    { label: 'Customers', path: '/customers', icon: Users },
  ];

  const userInitials = (user?.name || 'Admin')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="admin-layout-wrapper" style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Mobile Top Header */}
      <div className="admin-mobile-header" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.5rem', color: '#468165', margin: 0, fontWeight: 700 }}>The Plain Store</h2>
          <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <NotificationBell />
          <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155' }}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)', zIndex: 999 }}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} 
        style={{ 
          width: '260px',
          backgroundColor: '#ffffff', 
          borderRight: '1px solid #e2e8f0', 
          display: 'flex', 
          flexDirection: 'column',
          zIndex: 1000,
          flexShrink: 0
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '22px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.75rem', color: '#468165', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>The Plain Store</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, letterSpacing: '0.3px', textTransform: 'uppercase' }}>Admin Console</span>
            </div>
          </div>
          {isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 12px 8px' }}>
            Store Management
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '10px 14px', 
                      color: isActive ? '#0f172a' : '#64748b', 
                      backgroundColor: isActive ? '#f1f5f9' : 'transparent',
                      textDecoration: 'none', 
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.88rem',
                      borderRadius: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                      <Icon size={18} color={isActive ? '#468165' : '#94a3b8'} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#468165' }} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer User Info */}
        <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.78rem'
            }}>
              {userInitials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'admin@theplainstore.com'}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px', 
              width: '100%', 
              padding: '8px', 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              color: '#dc2626', 
              fontWeight: 600,
              fontSize: '0.8rem',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        <header
          style={{
            padding: '14px 32px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
          className="desktop-header"
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{title}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <NotificationBell />
          </div>
        </header>

        <div className="admin-main-content" style={{ padding: '24px 32px', flex: 1, overflowY: 'auto' }}>
          <h1 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }} className="mobile-only-title">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

