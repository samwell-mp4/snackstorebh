import React from 'react';
import { TrendingUp, ShoppingBag, Package, AlertTriangle, DollarSign, ArrowUpRight, Clock, CheckCircle2, User } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminOverview({ onNavigateTab, onOpenQuickActions }) {
  const { products, orders, financeSummary, lowStockCount } = useStoreData();
  const { isAdmin } = useAuth();

  const recentOrders = orders.slice(0, 5);

  const lowStockProducts = products
    .filter(p => (p.stock || 0) <= (p.min_stock || 5))
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Welcome Banner */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px 28px',
        border: '1px solid rgba(41,69,31,0.1)', boxShadow: '0 4px 20px rgba(23,43,20,0.03)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--snack-gold)' }}>
            Painel de Controle Oficial
          </span>
          <h1 style={{ margin: '4px 0', fontSize: '24px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
            Visão Geral & Performance
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--snack-muted)' }}>
            Acompanhe em tempo real o fluxo de vendas, estoque e operação da Snack Store.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onOpenQuickActions}
            style={{
              backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', border: 'none',
              padding: '10px 20px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '0.8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            ⚡ Ações Rápidas
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        
        {/* Faturamento (Admin only or blurred for manager) */}
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px',
          border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Faturamento
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(196,161,90,0.15)', color: 'var(--snack-gold)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--snack-green-dark)', fontFamily: 'var(--font-sans)' }}>
            {isAdmin ? `R$ ${financeSummary.receitaBruta?.toFixed(2)}` : 'R$ ••••••'}
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '600' }}>
            <TrendingUp size={13} />
            <span>{orders.length} pedidos contabilizados</span>
          </div>
        </div>

        {/* Lucro Líquido */}
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px',
          border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Lucro Estimado
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(41,69,31,0.1)', color: 'var(--snack-green-dark)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
            {isAdmin ? `R$ ${financeSummary.lucroLiquido?.toFixed(2)}` : 'R$ ••••••'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '6px' }}>
            Margem líquida média: <strong style={{ color: 'var(--snack-green-dark)' }}>{financeSummary.margem}%</strong>
          </div>
        </div>

        {/* Pedidos Ativos */}
        <div 
          onClick={() => onNavigateTab('pedidos')}
          style={{
            backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px',
            border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Pedidos na Loja
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
            {orders.length}
          </div>
          <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '6px', fontWeight: '600' }}>
            Gerenciar expedição e WhatsApp →
          </div>
        </div>

        {/* Alerta de Estoque Crítico */}
        <div 
          onClick={() => onNavigateTab('produtos')}
          style={{
            backgroundColor: lowStockCount > 0 ? '#fffbeb' : '#FFFFFF', borderRadius: '14px', padding: '20px',
            border: lowStockCount > 0 ? '1px solid #fef3c7' : '1px solid rgba(41,69,31,0.08)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)', cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: lowStockCount > 0 ? '#b45309' : 'var(--snack-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Estoque Crítico
            </span>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: lowStockCount > 0 ? '#fde68a' : 'rgba(0,0,0,0.04)', color: lowStockCount > 0 ? '#b45309' : 'var(--snack-muted)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: lowStockCount > 0 ? '#b45309' : 'var(--snack-green-dark)' }}>
            {lowStockCount} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--snack-muted)' }}>produtos</span>
          </div>
          <div style={{ fontSize: '11px', color: lowStockCount > 0 ? '#b45309' : 'var(--snack-muted)', marginTop: '6px', fontWeight: '600' }}>
            {lowStockCount > 0 ? 'Repor frascos imediatamente →' : 'Todos os produtos abastecidos'}
          </div>
        </div>

      </div>

      {/* Two Column Layout: Pedidos Recentes & Produtos em Alerta */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Últimos Pedidos */}
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px',
          border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
              Últimos Pedidos
            </h3>
            <button
              onClick={() => onNavigateTab('pedidos')}
              style={{ background: 'none', border: 'none', color: 'var(--snack-gold)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Ver todos <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentOrders.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--snack-muted)', textAlign: 'center', padding: '20px 0' }}>Nenhum pedido registrado ainda.</p>
            ) : (
              recentOrders.map(order => (
                <div
                  key={order.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '10px', backgroundColor: '#FAF8F2',
                    border: '1px solid rgba(41,69,31,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(41,69,31,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--snack-green-dark)'
                    }}>
                      <ShoppingBag size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-text)' }}>
                        {order.order_number} • {order.customer_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>
                        {order.items?.length || 1} {order.items?.length === 1 ? 'item' : 'itens'} • {order.payment_method}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                      R$ {parseFloat(order.total_amount || 0).toFixed(2)}
                    </div>
                    <span style={{
                      display: 'inline-block', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px',
                      textTransform: 'uppercase',
                      backgroundColor: order.status === 'pago' ? '#dcfce7' : order.status === 'separacao' ? '#fef3c7' : '#f3f4f6',
                      color: order.status === 'pago' ? '#166534' : order.status === 'separacao' ? '#92400e' : '#4b5563'
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Perfumes com Estoque Baixo ou Destaques */}
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px',
          border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
              Atenção de Estoque & Reposição
            </h3>
            <button
              onClick={() => onNavigateTab('produtos')}
              style={{ background: 'none', border: 'none', color: 'var(--snack-gold)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Catálogo completo <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lowStockProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#166534' }}>
                <CheckCircle2 size={28} style={{ margin: '0 auto 8px auto' }} />
                <p style={{ fontSize: '13px', fontWeight: '600' }}>Estoque em níveis saudáveis!</p>
              </div>
            ) : (
              lowStockProducts.map(p => (
                <div
                  key={p.code}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: '10px', backgroundColor: '#FAF8F2',
                    border: '1px solid rgba(41,69,31,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={p.image || '/perfumes/200.webp'}
                      alt={p.name}
                      style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.04)' }}
                    />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>
                        {p.brand} • {p.volume}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px',
                      backgroundColor: (p.stock || 0) === 0 ? '#fee2e2' : '#fef3c7',
                      color: (p.stock || 0) === 0 ? '#991b1b' : '#92400e'
                    }}>
                      {(p.stock || 0) === 0 ? 'Esgotado (0)' : `Restam ${p.stock} un.`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
