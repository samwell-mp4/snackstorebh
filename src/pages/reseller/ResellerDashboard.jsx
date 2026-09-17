import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  ShoppingBag, 
  Package, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Zap, 
  TrendingUp, 
  Truck, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw,
  Search,
  ExternalLink,
  Phone,
  Calendar,
  LogOut,
  SlidersHorizontal,
  Box,
  Menu,
  X,
  Store,
  BarChart3,
  Crown,
  Wallet,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  Filter,
  Check,
  Tag,
  QrCode,
  MapPin,
  MessageSquare,
  DollarSign,
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStoreData } from '../../context/StoreDataContext';
import { apiService } from '../../services/api';
import ResellerMetricsCards from './components/ResellerMetricsCards';
import ResellerSalesChart from './components/ResellerSalesChart';
import ResellerOrderModal from './components/ResellerOrderModal';
import ResellerNewOrderModal from './components/ResellerNewOrderModal';
import ResellerWelcomeTourModal from './components/ResellerWelcomeTourModal';

export default function ResellerDashboard({ addToCart }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, isReseller } = useAuth();
  const { products: storeProducts, createOrder, recipients, saveRecipient } = useStoreData();

  // Handle URL query parameters (e.g. ?tab=catalogo&tour=true)
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialTour = queryParams.get('tour') === 'true' || Boolean(location.state?.showTour);
  const initialTab = queryParams.get('tab') || location.state?.tab;

  // Primary states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Navigation / View state - defaults to 'catalogo' if requested or if coming from registration
  const [activeTab, setActiveTab] = useState(initialTab === 'catalogo' || initialTour ? 'catalogo' : 'dashboard');
  const [showWelcomeTour, setShowWelcomeTour] = useState(Boolean(initialTour));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterModality, setFilterModality] = useState('ALL'); // 'ALL' | 'expresso' | 'programado_7' | 'economico_15'
  const [addedItemCode, setAddedItemCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Meus Pedidos specific filters
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderDateFilter, setOrderDateFilter] = useState('ALL'); // 'ALL' | 'today' | '7d' | 'month'
  const [orderModalityFilter, setOrderModalityFilter] = useState('ALL');

  // Meus Clientes specific filters & selected client modal
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientSortBy, setClientSortBy] = useState('spent'); // 'spent' | 'orders' | 'recent' | 'name'
  const [selectedClientDetails, setSelectedClientDetails] = useState(null);

  // Cancel order handler for reseller
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.')) return;
    try {
      await apiService.updateOrderStatus(orderId, 'cancelado');
      await fetchDashboard();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: 'cancelado' }));
      }
    } catch (err) {
      alert('Erro ao cancelar pedido: ' + (err.message || 'Erro desconhecido'));
    }
  };

  // New order modal & bulk selection
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [newOrderInitialItems, setNewOrderInitialItems] = useState([]);
  const [selectedProductCodes, setSelectedProductCodes] = useState(new Set());
  
  // Catalog view mode & extra filters
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [stockOnlyFilter, setStockOnlyFilter] = useState(false);

  // Portal internal cart
  const [portalCart, setPortalCart] = useState([]);

  // Fetch dashboard aggregated data strictly for current reseller
  const fetchDashboard = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getResellerDashboard(currentUser.id, currentUser.email);
      if (res) {
        setData(res);
      } else {
        setError('Não foi possível carregar as informações do seu painel.');
      }
    } catch (err) {
      console.warn('Erro ao buscar dados do revendedor:', err);
      setError('Não foi possível carregar as informações do seu painel.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (val) => {
    return (parseFloat(val) || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    let bg = '#F1F5F9', color = '#475569', label = status;

    if (s === 'entregue' || s === 'pago') {
      bg = '#DCFCE7'; color = '#166534'; label = 'Entregue';
    } else if (s === 'enviado') {
      bg = '#E0F2FE'; color = '#0369A1'; label = 'Enviado';
    } else if (s === 'transito' || s === 'saiu para entrega') {
      bg = '#F3E8FF'; color = '#6B21A8'; label = 'Saiu para entrega';
    } else if (s === 'separacao' || s === 'embalagem') {
      bg = '#FEF3C7'; color = '#92400E'; label = 'Em separação';
    } else if (s === 'cancelado') {
      bg = '#FEE2E2'; color = '#991B1B'; label = 'Cancelado';
    } else {
      bg = '#F1F5F9'; color = '#475569'; label = 'Aguardando';
    }

    return (
      <span
        style={{
          backgroundColor: bg,
          color: color,
          fontSize: '11px',
          fontWeight: '700',
          padding: '3px 8px',
          borderRadius: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }} />
        {label}
      </span>
    );
  };

  const getModalityBadge = (mode) => {
    const m = (mode || '').toLowerCase();
    if (m.includes('econ')) {
      return (
        <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          💰 15 dias
        </span>
      );
    }
    if (m.includes('prog')) {
      return (
        <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          📦 7 dias
        </span>
      );
    }
    return (
      <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        ⚡ Expresso
      </span>
    );
  };

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();

    // Adiciona ao carrinho interno da área do revendedor
    setPortalCart(prev => {
      const idx = prev.findIndex(item => item.product.code === product.code);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      const initialMod = product.has_expresso ? 'expresso' : (product.has_prog7 ? 'programado_7' : 'economico_15');
      const unitPrice = initialMod === 'programado_7' && product.wholesale_prog7 
        ? product.wholesale_prog7 
        : (initialMod === 'economico_15' && product.wholesale_econ15 ? product.wholesale_econ15 : (product.wholesale_price || Math.round((parseFloat(product.price || 79.9) * 0.72) * 10) / 10));

      return [...prev, {
        product,
        quantity: 1,
        modality: initialMod,
        price: unitPrice
      }];
    });

    if (addToCart) {
      addToCart({
        ...product,
        price: product.wholesale_price || product.price
      });
    }
    setAddedItemCode(product.code);
    setTimeout(() => setAddedItemCode(null), 2000);
  };

  // If user not authenticated
  if (!currentUser) {
    return (
      <div style={{ minHeight: '75vh', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '36px 24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F8FAFC', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
            <ShoppingBag size={24} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
            Painel do Revendedor
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>
            Faça login com sua conta de revendedor para acessar seu dashboard exclusivo.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{ width: '100%', backgroundColor: '#166534', color: '#FFFFFF', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // SKELETON LOADING
  if (loading) {
    return (
      <div style={{ minHeight: '85vh', backgroundColor: '#FAFAFA', padding: '32px 16px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Header skeleton */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <div style={{ width: '220px', height: '28px', backgroundColor: '#E2E8F0', borderRadius: '8px', marginBottom: '8px' }} />
              <div style={{ width: '320px', height: '16px', backgroundColor: '#F1F5F9', borderRadius: '6px' }} />
            </div>
            <div style={{ width: '140px', height: '44px', backgroundColor: '#E2E8F0', borderRadius: '12px' }} />
          </div>

          {/* Cards skeleton grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: '136px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
                <div style={{ width: '80px', height: '14px', backgroundColor: '#F1F5F9', borderRadius: '4px', marginBottom: '16px' }} />
                <div style={{ width: '140px', height: '28px', backgroundColor: '#E2E8F0', borderRadius: '6px' }} />
              </div>
            ))}
          </div>

          {/* Body skeleton */}
          <div style={{ height: '260px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }} />
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error || !data) {
    return (
      <div style={{ minHeight: '75vh', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '36px 24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
          <AlertCircle size={40} color="#D97706" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
            Não foi possível carregar essas informações.
          </h3>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>
            Tivemos uma pequena instabilidade ao carregar seus dados. Clique abaixo para tentar novamente.
          </p>
          <button
            onClick={fetchDashboard}
            style={{
              backgroundColor: '#166534',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={16} /> Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const navTabs = [
    { id: 'dashboard', label: 'Visão Geral', icon: BarChart3, badge: null },
    { id: 'catalogo', label: 'Catálogo & Pedidos', icon: ShoppingBag, badge: 'Atacado' },
    { id: 'pedidos', label: 'Meus Pedidos', icon: Package, badge: data?.orders_total ? String(data.orders_total) : null },
    { id: 'clientes', label: 'Meus Clientes', icon: Users, badge: data?.clients_count ? String(data.clients_count) : null },
    { id: 'financeiro', label: 'Financeiro & Lucro', icon: TrendingUp, badge: null },
    { id: 'conta', label: 'Minha Conta', icon: SlidersHorizontal, badge: null }
  ];

  const userInitials = (currentUser?.name || 'Revendedor')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'RV';

  const renderSidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand & Badge */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            backgroundColor: 'rgba(245,158,11,0.15)', border: '1.5px solid #F59E0B',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Crown size={20} color="#F59E0B" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '1px', color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>
              SNACK STORE
            </div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#F59E0B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Portal do Revendedor
            </div>
          </div>
        </div>

        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10B981', fontWeight: '600' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
          <span>Conta Ativa • 10+ un Atacado</span>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#64748B', padding: '6px 12px 4px', letterSpacing: '1px' }}>
          Menu Principal
        </div>
        {navTabs.map(tab => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileSidebarOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: active ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: active ? '#F59E0B' : '#94A3B8',
                fontWeight: active ? '800' : '600',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={active ? '#F59E0B' : '#94A3B8'} />
                <span>{tab.label}</span>
              </div>
              {tab.badge && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  backgroundColor: active ? '#F59E0B' : 'rgba(255,255,255,0.1)',
                  color: active ? '#0F172A' : '#E2E8F0'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Card & Logout */}
      <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: '#166534', color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '800', flexShrink: 0
          }}>
            {userInitials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.name || 'Revendedor'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.email || ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              width: '100%',
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#FCA5A5',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={13} /> Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: 'var(--font-sans)' }}>
      
      {/* 1. SIDEBAR DESKTOP FIXA */}
      <aside style={{
        width: '260px',
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'none',
        flexShrink: 0
      }} className="reseller-desktop-sidebar">
        {renderSidebarContent()}
      </aside>

      {/* 1.1 SIDEBAR MOBILE DRAWER */}
      {isMobileSidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />
          <div style={{ position: 'relative', width: '280px', maxWidth: '85%', height: '100%', backgroundColor: '#0F172A', zIndex: 10 }}>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* 2. ÁREA PRINCIPAL DA DASHBOARD (DIREITA) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* TOPBAR EXCLUSIVA */}
        <header style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 80,
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#0F172A',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="reseller-mobile-toggle"
              aria-label="Abrir Menu Lateral"
            >
              <Menu size={24} />
            </button>

            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Snack Store BH • Painel do Revendedor
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                {navTabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              backgroundColor: '#DCFCE7',
              color: '#166534',
              padding: '4px 10px',
              borderRadius: '6px'
            }}>
              ⚡ Pronta Entrega BH (1 a 6h)
            </span>

            {/* Botão de Sacola do Portal se houver itens */}
            {portalCart.length > 0 && (
              <button
                onClick={() => {
                  setNewOrderInitialItems(portalCart.map(c => ({ ...c.product, initialQuantity: c.quantity })));
                  setIsNewOrderModalOpen(true);
                }}
                style={{
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #D8B4FE',
                  color: '#6B21A8',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShoppingBag size={15} />
                <span>Sacola ({portalCart.reduce((acc, it) => acc + it.quantity, 0)} un) • {formatCurrency(portalCart.reduce((acc, it) => acc + (it.price * it.quantity), 0))}</span>
              </button>
            )}

            <button
              onClick={() => {
                setNewOrderInitialItems([]);
                setIsNewOrderModalOpen(true);
              }}
              style={{
                backgroundColor: '#166534',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(22,101,52,0.2)'
              }}
            >
              <Plus size={16} /> Novo Pedido
            </button>
          </div>
        </header>

        {/* Style helper for desktop sidebar vs mobile toggle */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media (min-width: 900px) {
            .reseller-desktop-sidebar { display: block !important; }
            .reseller-mobile-toggle { display: none !important; }
          }
          @media (max-width: 899px) {
            .reseller-desktop-sidebar { display: none !important; }
            .reseller-mobile-toggle { display: flex !important; }
          }
        `}} />

        {/* CONTEÚDO PRINCIPAL (Main) */}
        <main style={{ flex: 1, padding: '24px 28px', maxWidth: '1200px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {/* =========================================================================
              VIEW 1: DASHBOARD PRINCIPAL
             ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* 1. CABEÇALHO DO DASHBOARD */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
                  Olá, {currentUser.name || 'Revendedor'} 👋
                </h1>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#64748B' }}>
                  Acompanhe suas vendas, pedidos e oportunidades.
                </p>
              </div>

              {/* Botão Principal CTA */}
              <button
                onClick={() => {
                  setNewOrderInitialItems([]);
                  setIsNewOrderModalOpen(true);
                }}
                style={{
                  backgroundColor: '#166534',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(22, 101, 52, 0.25)',
                  transition: 'background-color 0.15s ease, transform 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#15803d'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#166534'; }}
              >
                <Plus size={18} /> Novo pedido
              </button>
            </div>

            {/* 2. CARDS PRINCIPAIS */}
            <ResellerMetricsCards
              salesMonth={data.sales_month}
              salesGrowthPercent={data.sales_growth_percent}
              ordersTotal={data.orders_total}
              ordersInProgress={data.orders_in_progress}
              productsSoldMonth={data.products_sold_month}
              estimatedMargin={data.estimated_margin}
              onOpenOrders={() => setActiveTab('pedidos')}
            />

            {/* 3. AÇÕES RÁPIDAS (Grid 2x2 no mobile) */}
            <div>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                Ações rápidas
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px'
                }}
              >
                {[
                  {
                    id: 'novo',
                    title: '🛍 Novo pedido',
                    desc: 'Monte seu pedido no atacado',
                    action: () => {
                      setNewOrderInitialItems([]);
                      setIsNewOrderModalOpen(true);
                    }
                  },
                  {
                    id: 'pedidos',
                    title: '📦 Meus pedidos',
                    desc: 'Acompanhe status e entregas',
                    action: () => setActiveTab('pedidos')
                  },
                  {
                    id: 'clientes',
                    title: '👥 Meus clientes',
                    desc: 'Histórico e endereços salvos',
                    action: () => setActiveTab('clientes')
                  },
                  {
                    id: 'catalogo',
                    title: '🧴 Ver catálogo',
                    desc: 'Preços e fotos das miniaturas',
                    action: () => setActiveTab('catalogo')
                  }
                ].map(action => (
                  <div
                    key={action.id}
                    onClick={action.action}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '84px',
                      transition: 'border-color 0.15s ease, transform 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94A3B8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      {action.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. DISPONIBILIDADE DE PRODUTOS */}
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                  Disponível para vender agora
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Estoque local e prazos de atendimento em tempo real
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '14px'
                }}
              >
                {/* EXPRESSO */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ⚡ Expresso
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Pronta Entrega BH</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#166534', fontWeight: '700', margin: '0 0 12px 0' }}>
                      Entrega expressa em 1 a 6 horas em BH
                    </p>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
                      {data.availability?.expresso > 0 ? (
                        `${data.availability.expresso} produtos disponíveis`
                      ) : (
                        <span style={{ fontSize: '14px', color: '#D97706' }}>Indisponível no momento</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFilterModality('expresso');
                      setActiveTab('catalogo');
                    }}
                    style={{
                      marginTop: '16px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E2E8F0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                  >
                    Ver produtos <ChevronRight size={14} />
                  </button>
                </div>

                {/* 7 DIAS */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📦 Até 7 dias úteis
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Programado</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 12px 0' }}>
                      Mais opções e melhor preço
                    </p>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
                      {data.availability?.programado_7 > 0 ? (
                        `${data.availability.programado_7} produtos disponíveis`
                      ) : (
                        <span style={{ fontSize: '14px', color: '#D97706' }}>Indisponível no momento</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFilterModality('programado_7');
                      setActiveTab('catalogo');
                    }}
                    style={{
                      marginTop: '16px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E2E8F0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                  >
                    Ver produtos <ChevronRight size={14} />
                  </button>
                </div>

                {/* 15 DIAS */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#92400E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        💰 Até 15 dias úteis
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Econômico</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 12px 0' }}>
                      Nosso menor preço
                    </p>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
                      {data.availability?.economico_15 > 0 ? (
                        `${data.availability.economico_15} produtos disponíveis`
                      ) : (
                        <span style={{ fontSize: '14px', color: '#D97706' }}>Indisponível no momento</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFilterModality('economico_15');
                      setActiveTab('catalogo');
                    }}
                    style={{
                      marginTop: '16px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E2E8F0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                  >
                    Ver produtos <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* 5. PRODUTOS EM DESTAQUE ("Produtos para vender hoje") */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                    Produtos para vender hoje
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    Fragrâncias de alto giro com maior margem na sua revenda
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('catalogo')}
                  style={{ background: 'none', border: 'none', color: '#166534', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Ver todos <ArrowRight size={14} />
                </button>
              </div>

              {/* Horizontal scrollable track */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  overflowX: 'auto',
                  paddingBottom: '12px',
                  scrollSnapType: 'x mandatory'
                }}
              >
                {data.featured_products?.map(prod => (
                  <div
                    key={prod.code}
                    style={{
                      minWidth: '220px',
                      maxWidth: '220px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      scrollSnapAlign: 'start',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ position: 'relative', height: '150px', backgroundColor: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'contain' }}
                      />
                      <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                        {prod.has_expresso ? (
                          <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>⚡ Expresso</span>
                        ) : (
                          <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>📦 7 dias</span>
                        )}
                      </div>
                    </div>

                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                      {prod.brand}
                    </span>
                    <h4 style={{ margin: '3px 0 8px 0', fontSize: '13px', fontWeight: '700', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {prod.name}
                    </h4>

                    {/* Preço revendedor, sugerido e margem */}
                    <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '10px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>
                        <span>Seu preço:</span>
                        <strong style={{ color: '#0F172A', fontSize: '13px' }}>{formatCurrency(prod.wholesale_price)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>
                        <span>Venda sugerida:</span>
                        <span>{formatCurrency(prod.suggested_retail)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#166534', borderTop: '1px dashed #CBD5E1', paddingTop: '4px', marginTop: '4px' }}>
                        <span>Margem:</span>
                        <span>+{formatCurrency(prod.estimated_margin)}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(prod, e)}
                      style={{
                        width: '100%',
                        backgroundColor: addedItemCode === prod.code ? '#15803d' : '#0F172A',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '9px 12px',
                        borderRadius: '999px',
                        fontWeight: '700',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        marginTop: 'auto',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {addedItemCode === prod.code ? (
                        <>
                          <CheckCircle2 size={13} /> Adicionado!
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={13} /> Adicionar ao pedido
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. PEDIDOS EM ANDAMENTO */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                    Pedidos em andamento
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    Acompanhe a separação e entrega dos seus pedidos mais recentes
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('pedidos')}
                  style={{ background: 'none', border: 'none', color: '#166534', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Ver todos os pedidos <ArrowRight size={14} />
                </button>
              </div>

              {data.recent_orders?.length === 0 ? (
                /* Friendly empty state */
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '36px 20px',
                    textAlign: 'center'
                  }}
                >
                  <Package size={36} color="#94A3B8" style={{ margin: '0 auto 10px auto', opacity: 0.7 }} />
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                    Você ainda não possui pedidos em andamento.
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
                    Quando você fizer um novo pedido, ele aparecerá aqui com o status de separação e envio.
                  </p>
                  <button
                    onClick={() => setActiveTab('catalogo')}
                    style={{
                      backgroundColor: '#166534',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Criar primeiro pedido
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.recent_orders?.map(order => (
                    <div
                      key={order.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '14px',
                        border: '1px solid #E2E8F0',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                          <Package size={20} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                              Pedido #{order.order_number || order.id}
                            </span>
                            {getModalityBadge(order.logistics_mode)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            Cliente: <strong>{order.customer_name || 'Cliente Direto'}</strong> • {order.items_count} {order.items_count === 1 ? 'produto' : 'produtos'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                            {formatCurrency(order.total_amount)}
                          </div>
                          <div style={{ marginTop: '2px' }}>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: '#0F172A',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Ver pedido
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. RESUMO FINANCEIRO & GRÁFICO */}
            <ResellerSalesChart chartData={data.chart_data} />

            {/* Grid 2 colunas: SEUS MAIS VENDIDOS & MEUS CLIENTES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* 8. SEUS MAIS VENDIDOS */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '22px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <TrendingUp size={18} color="#166534" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                    Seus mais vendidos
                  </h3>
                </div>

                {data.top_products?.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                    <p style={{ margin: 0 }}>Você ainda não realizou sua primeira venda.</p>
                    <button
                      onClick={() => setActiveTab('catalogo')}
                      style={{ marginTop: '12px', backgroundColor: 'transparent', border: '1px solid #CBD5E1', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', color: '#0F172A' }}
                    >
                      Explorar catálogo
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data.top_products?.map((prod, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: idx === 0 ? '#FEF3C7' : '#E2E8F0',
                              color: idx === 0 ? '#92400E' : '#475569',
                              fontSize: '12px',
                              fontWeight: '800',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                            {prod.name}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#166534' }}>
                          {prod.salesCount} {prod.salesCount === 1 ? 'venda' : 'vendas'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 9. MEUS CLIENTES */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '22px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={18} color="#0F172A" />
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                        Seus clientes
                      </h3>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
                      {data.clients_count || 0} {data.clients_count === 1 ? 'cliente' : 'clientes'}
                    </span>
                  </div>

                  {data.recent_clients?.length === 0 ? (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                      <p style={{ margin: 0 }}>Nenhum cliente cadastrado ainda.</p>
                      <span style={{ fontSize: '11px', opacity: 0.8 }}>Eles serão registrados conforme você enviar pedidos diretos.</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {data.recent_clients?.map((cli, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '10px'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                              {cli.name}
                            </div>
                            {cli.phone && (
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                {cli.phone}
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {cli.lastOrderDate ? `Último pedido: ${new Date(cli.lastOrderDate).toLocaleDateString('pt-BR')}` : 'Recente'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('clientes')}
                  style={{
                    marginTop: '16px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                    padding: '10px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  Ver clientes <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* 10. ENTREGA DIRETA PARA CLIENTE (Card de Destaque) */}
            <div
              style={{
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '18px',
                padding: '24px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ maxWidth: '640px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.1)', color: '#A7F3D0', padding: '3px 10px', borderRadius: '999px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Truck size={13} /> Dropshipping / Embalagem Neutra
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>
                  Venda sem precisar guardar estoque
                </h3>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#CBD5E1', lineHeight: 1.4 }}>
                  Faça seu pedido e nós podemos enviar diretamente para o seu cliente com remetente neutro, sem nota com preço de atacado e com total discrição.
                </p>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Disponível conforme as regras mínimas do pedido ({data.direct_delivery_min_units || 5}+ unidades no pedido).
                </div>
              </div>

              <button
                onClick={() => setActiveTab('catalogo')}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  border: 'none',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Fazer pedido com entrega direta
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 2: CATÁLOGO DE ATACADO DO REVENDEDOR (100% DOS PRODUTOS & SINCRONIZADO)
           ========================================================================= */}
        {activeTab === 'catalogo' && (() => {
          // Obtém a lista completa de produtos (da loja/admin sincronizada ou do dashboard)
          const rawProducts = (storeProducts && storeProducts.length > 0) ? storeProducts : (data?.featured_products || []);
          
          const allCatalogProducts = rawProducts
            .filter(p => p.is_active !== false)
            .map(p => {
              const retailPrice = parseFloat(p.price) || 79.90;
              const rawWholesale = parseFloat(p.wholesale_price);
              const wholesalePrice = (!isNaN(rawWholesale) && rawWholesale > 0)
                ? rawWholesale
                : Math.max(10, Math.round(retailPrice * 0.72 * 10) / 10);
              
              const logConfig = p.logistics_config || {};
              const rawP7Retail = logConfig.programado_7?.price ? parseFloat(logConfig.programado_7.price) : (retailPrice * 0.88);
              const wholesaleProg7 = Math.round(rawP7Retail * 0.72 * 10) / 10;

              const rawE15Retail = logConfig.economico_15?.price ? parseFloat(logConfig.economico_15.price) : (retailPrice * 0.78);
              const wholesaleEcon15 = Math.round(rawE15Retail * 0.72 * 10) / 10;

              const margin = Math.round((retailPrice - wholesalePrice) * 100) / 100;
              const hasExp = Boolean(p.stock && p.stock > 0 && logConfig.expresso?.active !== false);
              const hasP7 = logConfig.programado_7?.active !== false;
              const hasE15 = logConfig.economico_15?.active !== false;

              return {
                ...p,
                wholesale_price: wholesalePrice,
                wholesale_prog7: wholesaleProg7,
                wholesale_econ15: wholesaleEcon15,
                suggested_retail: retailPrice,
                estimated_margin: margin,
                has_expresso: hasExp,
                has_prog7: hasP7,
                has_econ15: hasE15,
                stock: typeof p.stock === 'number' ? p.stock : 0
              };
            });

          // Marcas únicas para filtro
          const uniqueBrands = Array.from(new Set(allCatalogProducts.map(p => p.brand).filter(Boolean))).sort();

          // Filtragem completa
          const filtered = allCatalogProducts.filter(p => {
            // Modalidade
            if (filterModality === 'expresso' && !p.has_expresso) return false;
            if (filterModality === 'programado_7' && !p.has_prog7) return false;
            if (filterModality === 'economico_15' && !p.has_econ15) return false;

            // Marca
            if (brandFilter !== 'ALL' && p.brand?.toLowerCase() !== brandFilter.toLowerCase()) return false;

            // Gênero
            if (genderFilter !== 'ALL' && p.gender?.toLowerCase() !== genderFilter.toLowerCase()) return false;

            // Apenas em estoque
            if (stockOnlyFilter && p.stock <= 0) return false;

            // Busca por texto
            if (searchTerm.trim()) {
              const q = searchTerm.toLowerCase();
              const mName = p.name && p.name.toLowerCase().includes(q);
              const mCode = p.code && p.code.toLowerCase().includes(q);
              const mBrand = p.brand && p.brand.toLowerCase().includes(q);
              if (!mName && !mCode && !mBrand) return false;
            }

            return true;
          });

          const isAllSelected = filtered.length > 0 && filtered.every(p => selectedProductCodes.has(p.code));

          const toggleSelectProduct = (code) => {
            setSelectedProductCodes(prev => {
              const next = new Set(prev);
              if (next.has(code)) next.delete(code);
              else next.add(code);
              return next;
            });
          };

          const toggleSelectAll = () => {
            if (isAllSelected) {
              setSelectedProductCodes(new Set());
            } else {
              setSelectedProductCodes(new Set(filtered.map(p => p.code)));
            }
          };

          const handleBulkCreateOrder = () => {
            const selectedItems = allCatalogProducts.filter(p => selectedProductCodes.has(p.code));
            if (selectedItems.length === 0) return;
            setNewOrderInitialItems(selectedItems);
            setIsNewOrderModalOpen(true);
          };

          const handleBulkAddToCart = () => {
            const selectedItems = allCatalogProducts.filter(p => selectedProductCodes.has(p.code));
            selectedItems.forEach(it => {
              handleAddToCart(it);
            });
            setSelectedProductCodes(new Set());
          };

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* CABEÇALHO DO CATÁLOGO COM CONTADORES */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>
                    Catálogo & Pedidos ({allCatalogProducts.length} fragrâncias)
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    Tabela de atacado VIP com fretes sincronizados: Expresso BH (1 a 6h), 7 dias e 15 dias
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Alternador de Visualização: Grade vs Lista */}
                  <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: '10px', padding: '3px' }}>
                    <button
                      onClick={() => setViewMode('grid')}
                      title="Visualização em Grade"
                      style={{
                        backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                        color: viewMode === 'grid' ? '#0F172A' : '#64748B',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      <LayoutGrid size={15} /> Grade
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      title="Visualização em Lista"
                      style={{
                        backgroundColor: viewMode === 'list' ? '#FFFFFF' : 'transparent',
                        color: viewMode === 'list' ? '#0F172A' : '#64748B',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      <List size={15} /> Lista
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setNewOrderInitialItems([]);
                      setIsNewOrderModalOpen(true);
                    }}
                    style={{
                      backgroundColor: '#166534',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '9px 18px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(22,101,52,0.25)'
                    }}
                  >
                    <Plus size={16} /> Novo Pedido
                  </button>
                </div>
              </div>

              {/* BARRA DE FILTROS & BUSCA COMPLETA */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                {/* Linha 1: Input de Busca + Filtro de Modalidade */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="text"
                      placeholder="Pesquisar por perfume, código SKU ou marca..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Modality pills */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { id: 'ALL', label: 'Todos os Fretes' },
                      { id: 'expresso', label: '⚡ Expresso BH (1 a 6h)' },
                      { id: 'programado_7', label: '📦 7 dias úteis' },
                      { id: 'economico_15', label: '💰 15 dias úteis' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFilterModality(f.id)}
                        style={{
                          border: 'none',
                          backgroundColor: filterModality === f.id ? '#0F172A' : '#F1F5F9',
                          color: filterModality === f.id ? '#FFFFFF' : '#475569',
                          fontWeight: '700',
                          fontSize: '11px',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Linha 2: Dropdowns de Marca, Gênero, Estoque e Ações de Seleção */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    
                    {/* Filtro Marca */}
                    <select
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#334155',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <option value="ALL">Todas as Marcas ({uniqueBrands.length})</option>
                      {uniqueBrands.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>

                    {/* Filtro Gênero */}
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#334155',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <option value="ALL">Todos os Gêneros</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Unissex">Unissex</option>
                    </select>

                    {/* Checkbox Apenas em Estoque */}
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={stockOnlyFilter}
                        onChange={(e) => setStockOnlyFilter(e.target.checked)}
                      />
                      <span>Apenas com estoque em BH</span>
                    </label>

                    {(searchTerm || brandFilter !== 'ALL' || genderFilter !== 'ALL' || stockOnlyFilter || filterModality !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setBrandFilter('ALL');
                          setGenderFilter('ALL');
                          setStockOnlyFilter(false);
                          setFilterModality('ALL');
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#EF4444',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Limpar Filtros
                      </button>
                    )}
                  </div>

                  {/* Contador de Itens Encontrados */}
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                    Exibindo <strong>{filtered.length}</strong> de {allCatalogProducts.length} itens
                  </div>
                </div>
              </div>

              {/* BARRA FLUTUANTE DE AÇÕES EM MASSA (SE HOUVER ITENS SELECIONADOS) */}
              <div style={{
                backgroundColor: selectedProductCodes.size > 0 ? '#1E293B' : '#FFFFFF',
                color: selectedProductCodes.size > 0 ? '#FFFFFF' : '#475569',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: selectedProductCodes.size > 0 ? '0 4px 14px rgba(15,23,42,0.2)' : 'none',
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={toggleSelectAll}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      color: selectedProductCodes.size > 0 ? '#FFFFFF' : '#0F172A',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                  >
                    {isAllSelected ? <CheckSquare size={16} color="#34D399" /> : <Square size={16} />}
                    <span>{isAllSelected ? 'Desmarcar Todos' : 'Selecionar Todos da Lista'}</span>
                  </button>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    • {selectedProductCodes.size} selecionado(s)
                  </span>
                </div>

                {selectedProductCodes.size > 0 && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={handleBulkAddToCart}
                      style={{
                        backgroundColor: '#334155',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ShoppingBag size={14} /> + Adicionar à Sacola
                    </button>

                    <button
                      onClick={handleBulkCreateOrder}
                      style={{
                        backgroundColor: '#166534',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(22,101,52,0.3)'
                      }}
                    >
                      <Zap size={14} /> Criar Pedido com Selecionados
                    </button>

                    <button
                      onClick={() => setSelectedProductCodes(new Set())}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textDecoration: 'underline'
                      }}
                    >
                      Limpar
                    </button>
                  </div>
                )}
              </div>

              {/* LISTAGEM DE PRODUTOS (GRADE OU LISTA) */}
              {filtered.length === 0 ? (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '60px 24px', textAlign: 'center' }}>
                  <Package size={44} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Nenhuma fragrância encontrada com os filtros atuais.
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                    Tente buscar por outro termo ou desmarcar os filtros aplicados.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setBrandFilter('ALL');
                      setGenderFilter('ALL');
                      setStockOnlyFilter(false);
                      setFilterModality('ALL');
                    }}
                    style={{
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Restaurar Catálogo Completo
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                /* ================= VISUALIZAÇÃO EM GRADE ================= */
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                    gap: '16px'
                  }}
                >
                  {filtered.map(prod => {
                    const isSelected = selectedProductCodes.has(prod.code);
                    return (
                      <div
                        key={prod.code}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #166534' : '1px solid #E2E8F0',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          position: 'relative'
                        }}
                      >
                        {/* Checkbox de Seleção em Massa */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectProduct(prod.code);
                          }}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            zIndex: 10,
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#166534' : '#FFFFFF',
                            borderRadius: '6px',
                            border: isSelected ? '1px solid #166534' : '1px solid #CBD5E1',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                          title="Selecionar para pedido em massa"
                        >
                          {isSelected ? <Check size={14} color="#FFFFFF" /> : null}
                        </div>

                        {/* Imagem & Badges de Frete */}
                        <div style={{ position: 'relative', height: '160px', backgroundColor: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                          <img
                            src={prod.image || '/perfumes/200.webp'}
                            alt={prod.name}
                            style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain' }}
                          />
                          <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {prod.has_expresso ? (
                              <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                                ⚡ Expresso 1-6h
                              </span>
                            ) : null}
                            {prod.has_prog7 && (
                              <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                                📦 7 dias
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Marca e Nome */}
                        <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                          {prod.brand} • {prod.gender || '25ml'}
                        </span>
                        <h4 style={{ margin: '3px 0 6px 0', fontSize: '13px', fontWeight: '700', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={prod.name}>
                          {prod.name}
                        </h4>

                        {/* Estoque Indicador */}
                        <div style={{ fontSize: '11px', color: prod.stock > 0 ? '#166534' : '#64748B', fontWeight: '700', marginBottom: '8px' }}>
                          {prod.stock > 0 ? `✓ ${prod.stock} un. em BH pronta entrega` : '✓ Envio programado sob demanda'}
                        </div>

                        {/* Caixa de Preços Atacado VIP */}
                        <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '10px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '2px' }}>
                            <span>Atacado VIP:</span>
                            <strong style={{ color: '#166534', fontSize: '14px' }}>{formatCurrency(prod.wholesale_price)}</strong>
                          </div>

                          {/* Preços por modalidade */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '4px', marginTop: '4px' }}>
                            <span>7d: <strong>{formatCurrency(prod.wholesale_prog7)}</strong></span>
                            <span>15d: <strong>{formatCurrency(prod.wholesale_econ15)}</strong></span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                            <span>Venda sugerida:</span>
                            <span>{formatCurrency(prod.suggested_retail)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#166534', borderTop: '1px dashed #CBD5E1', paddingTop: '4px', marginTop: '4px' }}>
                            <span>Lucro estimado:</span>
                            <span>+{formatCurrency(prod.estimated_margin)}</span>
                          </div>
                        </div>

                        {/* Botões de Ação Rápida */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                          <button
                            onClick={(e) => handleAddToCart(prod, e)}
                            style={{
                              flex: 1,
                              backgroundColor: addedItemCode === prod.code ? '#15803d' : '#166534',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '9px 12px',
                              borderRadius: '8px',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'background-color 0.15s'
                            }}
                          >
                            {addedItemCode === prod.code ? (
                              <>
                                <CheckCircle2 size={14} /> Adicionado!
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={14} /> + Adicionar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ================= VISUALIZAÇÃO EM LISTA ================= */
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '12px 14px', width: '36px' }}>
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={toggleSelectAll}
                            style={{ cursor: 'pointer' }}
                          />
                        </th>
                        <th style={{ padding: '12px 14px' }}>Produto</th>
                        <th style={{ padding: '12px 14px' }}>Modalidades / Prazos</th>
                        <th style={{ padding: '12px 14px' }}>Atacado VIP</th>
                        <th style={{ padding: '12px 14px' }}>Venda Sugerida</th>
                        <th style={{ padding: '12px 14px' }}>Lucro Estimado</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(prod => {
                        const isSelected = selectedProductCodes.has(prod.code);
                        return (
                          <tr
                            key={prod.code}
                            style={{
                              borderBottom: '1px solid #F1F5F9',
                              backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
                              transition: 'background-color 0.15s'
                            }}
                          >
                            <td style={{ padding: '12px 14px' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectProduct(prod.code)}
                                style={{ cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                  src={prod.image || '/perfumes/200.webp'}
                                  alt={prod.name}
                                  style={{ width: '40px', height: '40px', objectFit: 'contain', backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '2px' }}
                                />
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                                    {prod.name}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                                    {prod.brand} • SKU: {prod.code} • {prod.stock > 0 ? <span style={{ color: '#166534', fontWeight: '700' }}>{prod.stock} em BH</span> : 'Sob demanda'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {prod.has_expresso && (
                                  <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                                    ⚡ 1-6h
                                  </span>
                                )}
                                {prod.has_prog7 && (
                                  <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                                    📦 7d: {formatCurrency(prod.wholesale_prog7)}
                                  </span>
                                )}
                                {prod.has_econ15 && (
                                  <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                                    💰 15d: {formatCurrency(prod.wholesale_econ15)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <strong style={{ fontSize: '14px', color: '#166534' }}>
                                {formatCurrency(prod.wholesale_price)}
                              </strong>
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: '13px', color: '#475569' }}>
                              {formatCurrency(prod.suggested_retail)}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '700', color: '#166534' }}>
                                +{formatCurrency(prod.estimated_margin)}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                              <button
                                onClick={(e) => handleAddToCart(prod, e)}
                                style={{
                                  backgroundColor: addedItemCode === prod.code ? '#15803d' : '#166534',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  padding: '7px 12px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {addedItemCode === prod.code ? <CheckCircle2 size={13} /> : <Plus size={13} />}
                                {addedItemCode === prod.code ? 'Adicionado' : 'Adicionar'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          );
        })()}

        {/* =========================================================================
            VIEW 3: MEUS PEDIDOS DO REVENDEDOR
           ========================================================================= */}
        {activeTab === 'pedidos' && (() => {
          const allOrders = data.recent_orders || [];
          
          const filteredOrders = allOrders.filter(order => {
            // Search
            if (orderSearchTerm.trim()) {
              const q = orderSearchTerm.toLowerCase();
              const mNum = (order.order_number?.toLowerCase() || '').includes(q);
              const mId = String(order.id).includes(q);
              const mCust = (order.customer_name?.toLowerCase() || '').includes(q);
              const mItem = (order.items || []).some(it => (it.name?.toLowerCase() || '').includes(q));
              if (!mNum && !mId && !mCust && !mItem) return false;
            }

            // Status
            if (orderStatusFilter !== 'ALL') {
              if (order.status !== orderStatusFilter) return false;
            }

            // Modality
            if (orderModalityFilter !== 'ALL') {
              const m = (order.logistics_mode || '').toLowerCase();
              if (orderModalityFilter === 'expresso' && !m.includes('expresso')) return false;
              if (orderModalityFilter === 'programado_7' && !m.includes('7') && !m.includes('prog')) return false;
              if (orderModalityFilter === 'economico_15' && !m.includes('15') && !m.includes('econ')) return false;
            }

            // Date
            if (orderDateFilter !== 'ALL') {
              const orderDate = new Date(order.created_at || Date.now());
              const now = new Date();
              if (orderDateFilter === 'today') {
                if (orderDate.toDateString() !== now.toDateString()) return false;
              } else if (orderDateFilter === '7d') {
                const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
                if (diffDays > 7) return false;
              } else if (orderDateFilter === 'month') {
                if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) return false;
              }
            }

            return true;
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>
                    Meus Pedidos ({filteredOrders.length} encontrados)
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    Histórico completo, chave Pix e acompanhamento de entrega dos seus pedidos
                  </p>
                </div>

                <button
                  onClick={() => {
                    setNewOrderInitialItems([]);
                    setIsNewOrderModalOpen(true);
                  }}
                  style={{
                    backgroundColor: '#166534',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(22,101,52,0.25)'
                  }}
                >
                  <Plus size={16} /> Novo pedido
                </button>
              </div>

              {/* BARRA DE FILTROS DOS PEDIDOS */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '14px 16px',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Buscar por nº pedido, cliente ou fragrância..."
                    value={orderSearchTerm}
                    onChange={e => setOrderSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Status selector */}
                <select
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="pendente">Pendente / Aguardando</option>
                  <option value="pago">Pago</option>
                  <option value="separacao">Em Separação</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelado">Cancelado</option>
                </select>

                {/* Date selector */}
                <select
                  value={orderDateFilter}
                  onChange={e => setOrderDateFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">Todas as Datas</option>
                  <option value="today">Hoje</option>
                  <option value="7d">Últimos 7 dias</option>
                  <option value="month">Este Mês</option>
                </select>

                {/* Modality selector */}
                <select
                  value={orderModalityFilter}
                  onChange={e => setOrderModalityFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">Todas Modalidades</option>
                  <option value="expresso">⚡ Expresso BH (1-6h)</option>
                  <option value="programado_7">📦 Programado (7d)</option>
                  <option value="economico_15">💰 Econômico (15d)</option>
                </select>
              </div>

              {filteredOrders.length === 0 ? (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '48px 24px', textAlign: 'center' }}>
                  <Package size={40} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Nenhum pedido encontrado com os filtros selecionados.
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                    Tente ajustar o termo de busca ou filtros de status e data.
                  </p>
                  <button
                    onClick={() => {
                      setOrderSearchTerm('');
                      setOrderStatusFilter('ALL');
                      setOrderDateFilter('ALL');
                      setOrderModalityFilter('ALL');
                    }}
                    style={{ backgroundColor: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', padding: '8px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredOrders.map(order => {
                    const isMulti = order.fulfillment_mode === 'multiple' || (Array.isArray(order.shipments) && order.shipments.length > 1);

                    return (
                      <div
                        key={order.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '16px',
                          border: '1px solid #E2E8F0',
                          padding: '18px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '14px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                              Pedido #{order.order_number || order.id}
                            </span>
                            {getStatusBadge(order.status)}
                            {getModalityBadge(order.logistics_mode)}
                            {isMulti && (
                              <span style={{ fontSize: '10px', backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                Multi-Destino ({order.shipments?.length || 2}x)
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '13px', color: '#64748B' }}>
                            Destinatário: <strong>{order.customer_name || 'Cliente Direto'}</strong> • {order.items_count || order.items?.length || 1} un • Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                              {formatCurrency(order.total_amount)}
                            </div>
                          </div>

                          {/* Pix CTA Button if pending */}
                          {order.pix_code && order.status !== 'pago' && (
                            <button
                              onClick={() => setSelectedOrder(order)}
                              style={{
                                backgroundColor: '#166534',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '9px 14px',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 6px rgba(22,101,52,0.2)'
                              }}
                            >
                              <QrCode size={14} /> Pagar com Pix
                            </button>
                          )}

                          {(order.status === 'pendente' || order.status === 'aguardando_pix') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelOrder(order.id);
                              }}
                              style={{
                                backgroundColor: '#FEE2E2',
                                color: '#991B1B',
                                border: '1px solid #FCA5A5',
                                padding: '9px 12px',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                              title="Cancelar este pedido"
                            >
                              Cancelar
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrder(order)}
                            style={{
                              backgroundColor: '#0F172A',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '9px 16px',
                              borderRadius: '8px',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Ver detalhes
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* =========================================================================
            VIEW 4: MEUS CLIENTES (FICHA INDIVIDUAL, HISTÓRICO & FILTROS)
           ========================================================================= */}
        {activeTab === 'clientes' && (() => {
          // Aggregate clients from saved recipients + all orders/shipments
          const map = new Map();

          (recipients || []).forEach(r => {
            const key = (r.name || '').trim().toLowerCase();
            if (key) {
              map.set(key, {
                id: r.id,
                name: r.name,
                phone: r.phone || '',
                email: r.email || '',
                address: r.address || '',
                number: r.number || '',
                complement: r.complement || '',
                neighborhood: r.neighborhood || '',
                city: r.city || 'Belo Horizonte',
                state: r.state || 'MG',
                cep: r.cep || '',
                created_at: r.created_at || null
              });
            }
          });

          (data?.recent_orders || []).forEach(o => {
            if (o.customer_name && o.customer_name !== 'Revendedor VIP' && o.customer_name !== currentUser?.name && !o.customer_name.startsWith('Multi-Clientes')) {
              const key = o.customer_name.trim().toLowerCase();
              if (!map.has(key)) {
                map.set(key, {
                  id: `ord_${o.id}`,
                  name: o.customer_name,
                  phone: o.customer_phone || '',
                  email: o.customer_email || '',
                  address: o.customer_address || '',
                  number: '',
                  complement: '',
                  neighborhood: '',
                  city: 'Belo Horizonte',
                  state: 'MG',
                  cep: '',
                  created_at: o.created_at
                });
              }
            }

            if (Array.isArray(o.shipments)) {
              o.shipments.forEach(s => {
                if (s.recipient_name && !s.recipient_name.startsWith('Destinatário #')) {
                  const key = s.recipient_name.trim().toLowerCase();
                  if (!map.has(key)) {
                    map.set(key, {
                      id: s.recipient_id || `shp_${s.id || Math.random()}`,
                      name: s.recipient_name,
                      phone: s.recipient_phone || '',
                      email: '',
                      address: s.recipient_address || '',
                      number: '',
                      complement: '',
                      neighborhood: '',
                      city: 'Belo Horizonte',
                      state: 'MG',
                      cep: '',
                      created_at: o.created_at
                    });
                  }
                }
              });
            }
          });

          // Aggregate statistics for each client
          const allOrders = data?.recent_orders || [];
          const allClients = Array.from(map.values()).map(cli => {
            const cliKey = cli.name.trim().toLowerCase();
            const cleanPhone = (cli.phone || '').replace(/\D/g, '');

            const clientOrders = allOrders.filter(o => {
              const directMatch = (o.customer_name || '').trim().toLowerCase() === cliKey;
              const phoneMatch = cleanPhone && o.customer_phone && o.customer_phone.replace(/\D/g, '') === cleanPhone;
              const shipMatch = Array.isArray(o.shipments) && o.shipments.some(s => (s.recipient_name || '').trim().toLowerCase() === cliKey);
              return directMatch || phoneMatch || shipMatch;
            });

            const totalSpent = clientOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
            const totalUnits = clientOrders.reduce((sum, o) => sum + ((o.items || []).reduce((isum, it) => isum + (parseInt(it.quantity, 10) || 1), 0)), 0);
            const lastOrder = clientOrders[0];

            return {
              ...cli,
              orders: clientOrders,
              orders_count: clientOrders.length,
              total_spent: totalSpent,
              total_units: totalUnits,
              last_order_date: lastOrder?.created_at || cli.created_at,
              avg_ticket: clientOrders.length > 0 ? (totalSpent / clientOrders.length) : 0
            };
          });

          // Filter by search
          let filtered = allClients.filter(cli => {
            if (!clientSearchTerm.trim()) return true;
            const q = clientSearchTerm.toLowerCase();
            const mName = (cli.name || '').toLowerCase().includes(q);
            const mPhone = (cli.phone || '').includes(q);
            const mCity = (cli.city || '').toLowerCase().includes(q);
            const mAddr = (cli.address || '').toLowerCase().includes(q);
            return mName || mPhone || mCity || mAddr;
          });

          // Sort
          filtered.sort((a, b) => {
            if (clientSortBy === 'spent') return b.total_spent - a.total_spent;
            if (clientSortBy === 'orders') return b.orders_count - a.orders_count;
            if (clientSortBy === 'recent') {
              const da = a.last_order_date ? new Date(a.last_order_date).getTime() : 0;
              const db = b.last_order_date ? new Date(b.last_order_date).getTime() : 0;
              return db - da;
            }
            return (a.name || '').localeCompare(b.name || '');
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>
                    Meus Clientes ({filtered.length} cadastrados)
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                    Gestão completa da sua carteira, histórico individual de compras e envios diretos
                  </p>
                </div>

                <button
                  onClick={() => {
                    setNewOrderInitialItems([]);
                    setIsNewOrderModalOpen(true);
                  }}
                  style={{
                    backgroundColor: '#166534',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(22,101,52,0.25)'
                  }}
                >
                  <Plus size={16} /> Novo Pedido p/ Cliente
                </button>
              </div>

              {/* FILTROS & ORDENAÇÃO DE CLIENTES */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '14px 16px',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Buscar cliente por nome, telefone, cidade ou rua..."
                    value={clientSearchTerm}
                    onChange={e => setClientSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowUpDown size={14} color="#64748B" />
                  <select
                    value={clientSortBy}
                    onChange={e => setClientSortBy(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="spent">Ordenar: Maior Valor Comprado (R$)</option>
                    <option value="orders">Ordenar: Mais Pedidos</option>
                    <option value="recent">Ordenar: Pedido Mais Recente</option>
                    <option value="name">Ordenar: Nome (A-Z)</option>
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '48px 24px', textAlign: 'center' }}>
                  <Users size={40} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Nenhum cliente encontrado.
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                    Cadastre clientes em "Novo Pedido" ou ajuste sua busca acima.
                  </p>
                  <button
                    onClick={() => setClientSearchTerm('')}
                    style={{ backgroundColor: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', padding: '8px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Limpar Busca
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {filtered.map((cli, idx) => (
                    <div
                      key={cli.id || idx}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        border: '1px solid #E2E8F0',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        transition: 'transform 0.15s, box-shadow 0.15s'
                      }}
                    >
                      <div>
                        {/* Header do Card */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '40px', height: '40px', borderRadius: '50%',
                              backgroundColor: '#F0FDF4', color: '#166534',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: '800', fontSize: '15px', border: '1px solid #BBF7D0'
                            }}>
                              {(cli.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                                {cli.name}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                {cli.city}/{cli.state}
                              </div>
                            </div>
                          </div>

                          {cli.phone && (
                            <a
                              href={`https://wa.me/55${cli.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Conversar no WhatsApp"
                              style={{
                                backgroundColor: '#25D366', color: '#FFFFFF', padding: '6px 10px',
                                borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'
                              }}
                            >
                              <Phone size={12} /> WhatsApp
                            </a>
                          )}
                        </div>

                        {/* Endereço */}
                        {cli.address && (
                          <div style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '10px', backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '8px' }}>
                            <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#64748B' }} />
                            <span>
                              {cli.address}{cli.number ? `, ${cli.number}` : ''}{cli.complement ? ` (${cli.complement})` : ''} - {cli.neighborhood || ''}, {cli.city}/{cli.state} {cli.cep ? `(CEP: ${cli.cep})` : ''}
                            </span>
                          </div>
                        )}

                        {/* Badges de Métricas do Cliente */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600' }}>Total Comprado</span>
                            <strong style={{ fontSize: '14px', color: '#166534' }}>{formatCurrency(cli.total_spent)}</strong>
                          </div>
                          <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '600' }}>Histórico</span>
                            <strong style={{ fontSize: '14px', color: '#0F172A' }}>{cli.orders_count} pedidos ({cli.total_units} un)</strong>
                          </div>
                        </div>

                        {cli.last_order_date && (
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                            Última compra: {new Date(cli.last_order_date).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>

                      {/* Botões de Ação */}
                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                        <button
                          onClick={() => setSelectedClientDetails(cli)}
                          style={{
                            flex: 1, backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none',
                            padding: '9px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer'
                          }}
                        >
                          Ver Ficha Completa
                        </button>
                        <button
                          onClick={() => {
                            setNewOrderInitialItems([]);
                            setIsNewOrderModalOpen(true);
                          }}
                          style={{
                            backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0',
                            padding: '9px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer'
                          }}
                        >
                          + Pedido
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MODAL: FICHA COMPLETA DO CLIENTE */}
              {selectedClientDetails && (
                <div style={{
                  position: 'fixed', inset: 0, zIndex: 10000,
                  backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(5px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
                }}>
                  <div style={{
                    backgroundColor: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '640px',
                    maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
                    border: '1px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '50%',
                          backgroundColor: '#166534', color: '#FFFFFF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '900', fontSize: '18px'
                        }}>
                          {(selectedClientDetails.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                            {selectedClientDetails.name}
                          </h3>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            Cliente cadastrado na Snack Store BH
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedClientDetails(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px' }}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Métricas do Cliente */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Total Comprado</span>
                        <strong style={{ fontSize: '15px', color: '#166534' }}>{formatCurrency(selectedClientDetails.total_spent)}</strong>
                      </div>
                      <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Pedidos</span>
                        <strong style={{ fontSize: '15px', color: '#0F172A' }}>{selectedClientDetails.orders_count}</strong>
                      </div>
                      <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Frascos</span>
                        <strong style={{ fontSize: '15px', color: '#0284C7' }}>{selectedClientDetails.total_units} un</strong>
                      </div>
                      <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Ticket Médio</span>
                        <strong style={{ fontSize: '15px', color: '#B45309' }}>{formatCurrency(selectedClientDetails.avg_ticket)}</strong>
                      </div>
                    </div>

                    {/* Dados de Contato e Endereço */}
                    <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Dados Cadastrais & Entrega:
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ fontSize: '13px', color: '#334155' }}>
                          📱 <strong>WhatsApp:</strong> {selectedClientDetails.phone || 'Não informado'}
                        </div>
                        {selectedClientDetails.phone && (
                          <a
                            href={`https://wa.me/55${selectedClientDetails.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              backgroundColor: '#25D366', color: '#FFFFFF', padding: '6px 12px',
                              borderRadius: '6px', fontSize: '12px', fontWeight: '700', textDecoration: 'none',
                              display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <Phone size={13} /> Abrir no WhatsApp
                          </a>
                        )}
                      </div>

                      <div style={{ fontSize: '13px', color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                        📍 <strong>Endereço Completo:</strong> {selectedClientDetails.address ? `${selectedClientDetails.address}, ${selectedClientDetails.number || 'S/N'}${selectedClientDetails.complement ? ` (${selectedClientDetails.complement})` : ''} - ${selectedClientDetails.neighborhood || ''}, ${selectedClientDetails.city}/${selectedClientDetails.state} - CEP: ${selectedClientDetails.cep}` : 'Endereço não cadastrado.'}
                      </div>
                    </div>

                    {/* Histórico Completo de Compras deste Cliente */}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                        Histórico de Compras & Envios ({selectedClientDetails.orders.length} pedidos):
                      </div>

                      {selectedClientDetails.orders.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '10px' }}>
                          Nenhum pedido registrado ainda para este cliente.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                          {selectedClientDetails.orders.map(ord => (
                            <div key={ord.id} style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '10px 14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>#{ord.order_number || ord.id}</strong>
                                  {getStatusBadge(ord.status)}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                  {new Date(ord.created_at).toLocaleDateString('pt-BR')} • {(ord.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                </div>
                              </div>
                              <strong style={{ fontSize: '14px', color: '#166534' }}>
                                {formatCurrency(ord.total_amount)}
                              </strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                      <button
                        onClick={() => setSelectedClientDetails(null)}
                        style={{
                          backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1',
                          padding: '10px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                        }}
                      >
                        Fechar
                      </button>

                      <button
                        onClick={() => {
                          setSelectedClientDetails(null);
                          setNewOrderInitialItems([]);
                          setIsNewOrderModalOpen(true);
                        }}
                        style={{
                          backgroundColor: '#166534', color: '#FFFFFF', border: 'none',
                          padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                        }}
                      >
                        + Novo Pedido para {selectedClientDetails.name}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })()}

        {/* =========================================================================
            VIEW: FINANCEIRO E LUCRO DO REVENDEDOR
           ========================================================================= */}
        {activeTab === 'financeiro' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>
                Financeiro & Lucratividade
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                Acompanhe o faturamento, margens estimadas e evolução das suas vendas
              </p>
            </div>

            {/* Cards Financeiros */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600', marginBottom: '8px' }}>
                  Total Vendido no Mês
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A' }}>
                  {formatCurrency(data.sales_month)}
                </div>
                {data.sales_growth_percent !== null && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: data.sales_growth_percent >= 0 ? '#166534' : '#DC2626', fontWeight: '700' }}>
                    {data.sales_growth_percent >= 0 ? `+${data.sales_growth_percent}%` : `${data.sales_growth_percent}%`} em relação ao mês anterior
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #10B981', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#166534', fontWeight: '700', marginBottom: '8px' }}>
                  Lucro Estimado no Mês
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#166534' }}>
                  {formatCurrency(data.estimated_margin)}
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748B' }}>
                  Baseado na margem média de revenda (80% a 120%)
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600', marginBottom: '8px' }}>
                  Produtos Comercializados
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A' }}>
                  {data.products_sold_month} un.
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748B' }}>
                  Total acumulado de frascos no mês
                </div>
              </div>
            </div>

            {/* Gráfico de Vendas */}
            <ResellerSalesChart chartData={data.chart_data} />

            {/* Dicas de Alta Lucratividade */}
            <div style={{ backgroundColor: '#172B14', color: '#FFFFFF', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', fontWeight: '800', fontSize: '14px' }}>
                <Sparkles size={18} /> COMO MAXIMIZAR SUAS VENDAS E GANHOS
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#E2E8F0', lineHeight: 1.6 }}>
                • Aproveite os pedidos de 10+ unidades para ter o menor preço de custo de atacado.<br />
                • Utilize a <strong>Entrega Expressa em 1 a 6 horas para BH e Região</strong> para encantar seus clientes com agilidade imediata.<br />
                • Use a modalidade de envio direto (dropshipping) com remetente neutro para vender sem gastar tempo com entregas.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 5: MINHA CONTA DO REVENDEDOR
           ========================================================================= */}
        {activeTab === 'conta' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F3E8FF', color: '#6B21A8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800' }}>
                  {currentUser.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                    {currentUser.name}
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B21A8', textTransform: 'uppercase' }}>
                    👑 Revendedor Oficial VIP
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                <div>
                  <strong>E-mail:</strong> {currentUser.email}
                </div>
                <div>
                  <strong>Telefone / WhatsApp:</strong> {currentUser.phone || 'Não informado'}
                </div>
                <div>
                  <strong>Cidade:</strong> Belo Horizonte e Região Metropolitana
                </div>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid #F1F5F9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  style={{
                    backgroundColor: '#FEE2E2',
                    color: '#991B1B',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={15} /> Sair da conta
                </button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* Modal de Detalhes do Pedido */}
      <ResellerOrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onCancelOrder={handleCancelOrder}
      />

      {/* Modal de Novo Pedido de Revenda (Multi-itens, Dropshipping Neutro e Fretes Sincronizados) */}
      <ResellerNewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => {
          setIsNewOrderModalOpen(false);
          setNewOrderInitialItems([]);
        }}
        products={storeProducts && storeProducts.length > 0 ? storeProducts : (data?.featured_products || [])}
        recipients={recipients || []}
        saveRecipient={saveRecipient}
        createOrder={createOrder}
        currentUser={currentUser}
        minDirectDeliveryUnits={data?.direct_delivery_min_units || 5}
        initialSelectedItems={newOrderInitialItems.length > 0 ? newOrderInitialItems : portalCart.map(c => ({ ...c.product, initialQuantity: c.quantity }))}
        onOrderSuccess={() => {
          setPortalCart([]);
          fetchDashboard();
        }}
      />

      {/* Modal de Tour / Apresentação de Boas-Vindas do Revendedor VIP */}
      <ResellerWelcomeTourModal
        isOpen={showWelcomeTour}
        userName={currentUser?.name}
        onClose={() => setShowWelcomeTour(false)}
        onGoToCatalog={() => {
          setActiveTab('catalogo');
          setShowWelcomeTour(false);
        }}
      />
    </div>
  );
}
