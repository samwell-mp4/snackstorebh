import React from 'react';
import { DollarSign, ShoppingBag, Package, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function ResellerMetricsCards({
  salesMonth = 0,
  salesGrowthPercent = null,
  ordersTotal = 0,
  ordersInProgress = 0,
  productsSoldMonth = 0,
  estimatedMargin = 0,
  onOpenOrders = () => {}
}) {
  const formatCurrency = (val) => {
    return (parseFloat(val) || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '20px 22px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '136px',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const valueStyle = {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '10px 0 4px 0',
    lineHeight: 1.15,
    letterSpacing: '-0.5px'
  };

  const subTextStyle = {
    fontSize: '12px',
    color: '#64748B',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          width: '100%'
        }}
        className="reseller-metrics-grid"
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 640px) {
            .reseller-metrics-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 10px !important;
            }
            .reseller-metric-card {
              padding: 14px 12px !important;
              min-height: 120px !important;
            }
            .reseller-metric-value {
              font-size: 20px !important;
            }
            .reseller-metric-label {
              font-size: 11px !important;
            }
          }
        `}} />
        {/* CARD 1 — VENDAS */}
        <div style={cardStyle} className="reseller-metric-card">
          <div style={labelStyle} className="reseller-metric-label">
            <span>Vendas</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
              <DollarSign size={15} />
            </div>
          </div>
          <div>
            <div style={valueStyle} className="reseller-metric-value">{formatCurrency(salesMonth)}</div>
            <div style={subTextStyle}>
              <span>Neste mês</span>
              {salesGrowthPercent !== null && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: salesGrowthPercent >= 0 ? '#166534' : '#991B1B',
                    backgroundColor: salesGrowthPercent >= 0 ? '#DCFCE7' : '#FEE2E2',
                    padding: '2px 5px',
                    borderRadius: '999px',
                    marginLeft: '2px'
                  }}
                >
                  {salesGrowthPercent >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {salesGrowthPercent >= 0 ? `+${salesGrowthPercent}%` : `${salesGrowthPercent}%`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CARD 2 — PEDIDOS */}
        <div
          style={{ ...cardStyle, cursor: 'pointer' }}
          className="reseller-metric-card"
          onClick={onOpenOrders}
          role="button"
          tabIndex={0}
          title="Clique para ver Meus Pedidos"
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
        >
          <div style={labelStyle} className="reseller-metric-label">
            <span>Pedidos</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
              <ShoppingBag size={15} />
            </div>
          </div>
          <div>
            <div style={valueStyle} className="reseller-metric-value">{ordersTotal}</div>
            <p style={subTextStyle}>
              {ordersInProgress > 0 ? (
                <span style={{ color: '#D97706', fontWeight: '700' }}>
                  {ordersInProgress} em andamento
                </span>
              ) : (
                'Todos concluídos'
              )}
            </p>
          </div>
        </div>

        {/* CARD 3 — PRODUTOS VENDIDOS */}
        <div style={cardStyle} className="reseller-metric-card">
          <div style={labelStyle} className="reseller-metric-label">
            <span>Produtos vendidos</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
              <Package size={15} />
            </div>
          </div>
          <div>
            <div style={valueStyle} className="reseller-metric-value">{productsSoldMonth}</div>
            <p style={subTextStyle}>Este mês</p>
          </div>
        </div>

        {/* CARD 4 — MARGEM ESTIMADA */}
        <div style={cardStyle} className="reseller-metric-card">
          <div style={labelStyle} className="reseller-metric-label">
            <span>Margem estimada</span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
              <TrendingUp size={15} />
            </div>
          </div>
          <div>
            <div style={{ ...valueStyle, color: '#166534' }} className="reseller-metric-value">{formatCurrency(estimatedMargin)}</div>
            <p style={subTextStyle}>
              {estimatedMargin > 0 ? 'Lucro na revenda' : 'Acompanhe com as vendas'}
            </p>
          </div>
        </div>
      </div>
    );
  }
