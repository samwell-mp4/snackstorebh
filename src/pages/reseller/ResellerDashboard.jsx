import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Box
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import ResellerMetricsCards from './components/ResellerMetricsCards';
import ResellerSalesChart from './components/ResellerSalesChart';
import ResellerOrderModal from './components/ResellerOrderModal';

export default function ResellerDashboard({ addToCart }) {
  const navigate = useNavigate();
  const { currentUser, logout, isReseller } = useAuth();

  // Primary states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Navigation / View state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'catalogo' | 'pedidos' | 'clientes' | 'conta'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterModality, setFilterModality] = useState('ALL'); // 'ALL' | 'expresso' | 'programado_7' | 'economico_15'
  const [addedItemCode, setAddedItemCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div style={{ minHeight: '90vh', backgroundColor: '#FFFFFF', color: '#0F172A', paddingBottom: '60px' }}>
      {/* Reseller Navigation Bar */}
      <div style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', position: 'sticky', top: 0, zIndex: 90 }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#F3E8FF', color: '#6B21A8', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              👑 Revendedor VIP
            </span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
              Snack Store BH
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'catalogo', label: 'Catálogo' },
              { id: 'pedidos', label: 'Meus pedidos' },
              { id: 'clientes', label: 'Meus clientes' },
              { id: 'conta', label: 'Minha conta' }
            ].map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    border: 'none',
                    backgroundColor: active ? '#F1F5F9' : 'transparent',
                    color: active ? '#0F172A' : '#64748B',
                    fontWeight: active ? '700' : '500',
                    fontSize: '13px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px 20px' }}>
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
                onClick={() => setActiveTab('catalogo')}
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
                    action: () => setActiveTab('catalogo')
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
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 12px 0' }}>
                      Entrega rápida
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
            VIEW 2: CATÁLOGO DE ATACADO DO REVENDEDOR
           ========================================================================= */}
        {activeTab === 'catalogo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>
                  Catálogo para Revenda
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Preços exclusivos de atacado para montar seu pedido
                </p>
              </div>

              {/* Modality filter pill */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: 'Todos' },
                  { id: 'expresso', label: '⚡ Expresso' },
                  { id: 'programado_7', label: '📦 7 dias' },
                  { id: 'economico_15', label: '💰 15 dias' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterModality(f.id)}
                    style={{
                      border: 'none',
                      backgroundColor: filterModality === f.id ? '#0F172A' : '#F1F5F9',
                      color: filterModality === f.id ? '#FFFFFF' : '#64748B',
                      fontWeight: '700',
                      fontSize: '12px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '16px'
              }}
            >
              {data.featured_products
                ?.filter(p => {
                  if (filterModality === 'expresso') return p.has_expresso;
                  if (filterModality === 'programado_7') return p.has_prog7;
                  if (filterModality === 'economico_15') return p.has_econ15;
                  return true;
                })
                .map(prod => (
                  <div
                    key={prod.code}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ position: 'relative', height: '160px', backgroundColor: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain' }}
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
                    <h4 style={{ margin: '3px 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {prod.name}
                    </h4>

                    <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '10px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B', marginBottom: '2px' }}>
                        <span>Atacado VIP:</span>
                        <strong style={{ color: '#0F172A', fontSize: '14px' }}>{formatCurrency(prod.wholesale_price)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>
                        <span>Venda sugerida:</span>
                        <span>{formatCurrency(prod.suggested_retail)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#166534', borderTop: '1px dashed #CBD5E1', paddingTop: '4px', marginTop: '4px' }}>
                        <span>Lucro estimado:</span>
                        <span>+{formatCurrency(prod.estimated_margin)}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(prod, e)}
                      style={{
                        width: '100%',
                        backgroundColor: addedItemCode === prod.code ? '#15803d' : '#166534',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px 14px',
                        borderRadius: '999px',
                        fontWeight: '700',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        marginTop: 'auto'
                      }}
                    >
                      {addedItemCode === prod.code ? (
                        <>
                          <CheckCircle2 size={14} /> Adicionado!
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} /> Adicionar ao pedido
                        </>
                      )}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 3: MEUS PEDIDOS DO REVENDEDOR
           ========================================================================= */}
        {activeTab === 'pedidos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>
                  Meus Pedidos
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  Histórico completo dos seus pedidos de atacado
                </p>
              </div>

              <button
                onClick={() => setActiveTab('catalogo')}
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
                  gap: '6px'
                }}
              >
                <Plus size={16} /> Novo pedido
              </button>
            </div>

            {data.recent_orders?.length === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '48px 24px', textAlign: 'center' }}>
                <Package size={40} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Você ainda não possui pedidos.
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
                  Faça seu primeiro pedido no atacado e comece a faturar com as miniaturas importadas.
                </p>
                <button
                  onClick={() => setActiveTab('catalogo')}
                  style={{ backgroundColor: '#166534', color: '#FFFFFF', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Criar primeiro pedido
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.recent_orders?.map(order => (
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                          Pedido #{order.order_number || order.id}
                        </span>
                        {getStatusBadge(order.status)}
                        {getModalityBadge(order.logistics_mode)}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>
                        Destinatário: <strong>{order.customer_name || 'Cliente Direto'}</strong> • {order.items_count} un • Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                          {formatCurrency(order.total_amount)}
                        </div>
                      </div>

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
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 4: MEUS CLIENTES (ISOLADO)
           ========================================================================= */}
        {activeTab === 'clientes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>
                Meus Clientes
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                Clientes que já receberam entregas diretas ou pedidos da sua revenda
              </p>
            </div>

            {data.recent_clients?.length === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '48px 24px', textAlign: 'center' }}>
                <Users size={40} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Sua carteira de clientes ainda está vazia.
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
                  Ao realizar pedidos com entrega direta para clientes, eles serão salvos aqui automaticamente.
                </p>
                <button
                  onClick={() => setActiveTab('catalogo')}
                  style={{ backgroundColor: '#166534', color: '#FFFFFF', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Fazer primeiro pedido
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {data.recent_clients?.map((cli, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#0F172A' }}>
                          {cli.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                            {cli.name}
                          </div>
                          {cli.phone && (
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {cli.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                        {cli.lastOrderDate ? `Último pedido: ${new Date(cli.lastOrderDate).toLocaleDateString('pt-BR')}` : 'Sem data recente'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    navigate('/');
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

      {/* Modal de Detalhes do Pedido */}
      <ResellerOrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
