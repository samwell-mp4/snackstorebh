import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, DollarSign, Users, Settings, Zap, ArrowLeft, LogOut, ShieldCheck, Database, Menu, X, User, Sliders, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStoreData } from '../../context/StoreDataContext';
import AdminOverview from './AdminOverview';
import AdminLogistics from './AdminLogistics';
import AdminShipments from './AdminShipments';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminFinance from './AdminFinance';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';
import QuickActionsModal from './QuickActionsModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, role, isAdmin, isStaff, logout, switchRole } = useAuth();
  const { dbStatus, lowStockCount, orders, shipments } = useStoreData();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'logistica' | 'remessas' | 'produtos' | 'pedidos' | 'financeiro' | 'usuarios' | 'configuracoes'
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If visitor or only customer, prompt or redirect
  if (!isStaff && role !== 'admin' && role !== 'gerente') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#FAF8F2' }}>
        <div style={{ maxWidth: '400px', width: '100%', backgroundColor: '#FFFFFF', padding: '36px', borderRadius: '18px', textAlign: 'center', border: '1px solid rgba(41,69,31,0.12)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)', marginBottom: '8px' }}>
            Acesso Restrito
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--snack-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
            Esta área é restrita a administradores e equipe autorizada da Snack Store.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{ width: '100%', backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, badge: null, staffAllowed: true },
    { id: 'logistica', label: 'Central Logística', icon: Sliders, badge: null, staffAllowed: true },
    { id: 'remessas', label: 'Remessas & Picking', icon: Truck, badge: shipments ? (shipments.filter(s => s.status === 'separacao').length || null) : null, staffAllowed: true },
    { id: 'produtos', label: 'Produtos & Catálogo', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount}` : null, staffAllowed: true },
    { id: 'pedidos', label: 'Pedidos & Vendas', icon: ShoppingBag, badge: orders.filter(o => o.status === 'pendente' || o.status === 'separacao').length || null, staffAllowed: true },
    { id: 'financeiro', label: 'Financeiro & Lucro', icon: DollarSign, badge: null, staffAllowed: isAdmin },
    { id: 'usuarios', label: 'Usuários & Níveis', icon: Users, badge: null, staffAllowed: isAdmin },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, badge: null, staffAllowed: isAdmin }
  ];

  const renderSidebarContent = (isDrawer = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', overflowY: 'auto' }}>
      <div>
        {/* Brand Header */}
        <div style={{ padding: '20px 20px 16px 20px', borderBottom: '1px solid rgba(41,69,31,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '3px', color: 'var(--snack-green-dark)', fontFamily: 'var(--font-display)' }}>
                SNACK STORE
              </span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span style={{
                fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase',
                backgroundColor: isAdmin ? 'rgba(41,69,31,0.1)' : '#fef3c7',
                color: isAdmin ? 'var(--snack-green-dark)' : '#92400e',
                padding: '3px 8px', borderRadius: '4px'
              }}>
                {isAdmin ? 'ADMINISTRADOR' : 'GERÊNCIA'}
              </span>
            </div>
          </div>
          {isDrawer && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--snack-muted)', cursor: 'pointer', padding: '4px' }}
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Quick Action Button */}
        <div style={{ padding: '16px 20px 8px 20px' }}>
          <button
            onClick={() => { setIsQuickActionsOpen(true); if (isDrawer) setIsMobileMenuOpen(false); }}
            style={{
              width: '100%', backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', border: 'none',
              padding: '11px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 15px rgba(23,43,20,0.15)'
            }}
          >
            <Zap size={15} color="var(--snack-gold)" />
            <span>Ações Rápidas</span>
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map(item => {
            if (!item.staffAllowed) return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); if (isDrawer) setIsMobileMenuOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px', borderRadius: '10px', border: 'none',
                  backgroundColor: isActive ? '#FAF8F2' : 'transparent',
                  color: isActive ? 'var(--snack-green-dark)' : 'var(--snack-muted)',
                  fontWeight: isActive ? '700' : '500', fontSize: '13px',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} color={isActive ? 'var(--snack-green-dark)' : 'var(--snack-muted)'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '10px', fontWeight: '800', backgroundColor: item.id === 'produtos' ? '#fee2e2' : '#e0f2fe',
                    color: item.id === 'produtos' ? '#991b1b' : '#0369a1', padding: '2px 7px', borderRadius: '99px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Info */}
      <div style={{ padding: '16px 16px 20px 16px', borderTop: '1px solid rgba(41,69,31,0.06)' }}>
        {/* DB Indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
          borderRadius: '8px', backgroundColor: '#FAF8F2', fontSize: '11px', color: 'var(--snack-muted)',
          marginBottom: '10px'
        }}>
          <Database size={13} color={dbStatus?.connected ? '#16a34a' : '#f59e0b'} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            storegress: {dbStatus?.connected ? 'Online' : 'Híbrido'}
          </span>
        </div>

        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
            borderRadius: '8px', color: 'var(--snack-text)', textDecoration: 'none', fontSize: '12px', fontWeight: '600'
          }}
        >
          <ArrowLeft size={15} />
          <span>Voltar à Loja</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F2', color: 'var(--snack-text)', display: 'flex', fontFamily: 'var(--font-sans)' }}>
      
      {/* SIDEBAR NAVIGATION (DESKTOP) */}
      <aside
        className="admin-desktop-sidebar"
        style={{
          width: '260px', backgroundColor: '#FFFFFF', borderRight: '1px solid rgba(41,69,31,0.08)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'sticky', top: 0, height: '100vh', zIndex: 90, flexShrink: 0
        }}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* SIDEBAR NAVIGATION (MOBILE DRAWER) */}
      {isMobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
          />
          <div style={{
            position: 'relative', width: '280px', maxWidth: '85%', height: '100%',
            backgroundColor: '#FFFFFF', zIndex: 10, display: 'flex', flexDirection: 'column',
            boxShadow: '10px 0 30px rgba(0,0,0,0.15)'
          }}>
            {renderSidebarContent(true)}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* TOPBAR */}
        <header
          className="admin-topbar"
          style={{
            height: '64px', backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(41,69,31,0.08)',
            padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 80
          }}
        >
          {/* Left Title / Breadcrumb + Mobile Toggle Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                background: 'none', border: 'none', color: 'var(--snack-green-dark)',
                cursor: 'pointer', padding: '6px', alignItems: 'center', justifyContent: 'center'
              }}
              aria-label="Abrir menu de navegação"
            >
              <Menu size={22} />
            </button>

            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
              Painel Admin
            </span>
            <span style={{ color: 'var(--snack-muted)', fontSize: '12px' }}>/</span>
            <span style={{ fontSize: '13px', color: 'var(--snack-muted)', textTransform: 'capitalize' }}>
              {menuItems.find(m => m.id === activeTab)?.label || activeTab}
            </span>
          </div>

          {/* Right Role Switcher & User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Current User Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--snack-green-dark)',
                color: 'var(--snack-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '13px'
              }}>
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="hide-on-mobile" style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', lineHeight: '1.2' }}>
                  {currentUser?.name || 'Administrador'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--snack-muted)' }}>
                  {currentUser?.email || 'admin@snackstorebh.com.br'}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Sair da conta"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-muted)',
                padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center'
              }}
            >
              <LogOut size={16} />
            </button>

          </div>
        </header>

        {/* VIEW CONTAINER */}
        <main className="admin-main-container" style={{ padding: '28px', flex: 1, minWidth: 0, boxSizing: 'border-box' }}>
          {activeTab === 'overview' && (
            <AdminOverview
              onNavigateTab={tab => setActiveTab(tab)}
              onOpenQuickActions={() => setIsQuickActionsOpen(true)}
            />
          )}

          {activeTab === 'logistica' && <AdminLogistics />}

          {activeTab === 'remessas' && <AdminShipments />}

          {activeTab === 'produtos' && <AdminProducts />}

          {activeTab === 'pedidos' && <AdminOrders />}

          {activeTab === 'financeiro' && <AdminFinance />}

          {activeTab === 'usuarios' && <AdminUsers />}

          {activeTab === 'configuracoes' && <AdminSettings />}
        </main>

      </div>

      {/* QUICK ACTIONS MODAL */}
      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
      />

    </div>
  );
}
