import React, { useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

export default function ResellerSalesChart({ chartData = {} }) {
  const [period, setPeriod] = useState('30d'); // '7d' | '30d' | '3m' | '6m'

  const points = chartData[period] || [];
  const totalPeriodSales = points.reduce((acc, p) => acc + (parseFloat(p.value) || 0), 0);
  const totalPeriodOrders = points.reduce((acc, p) => acc + (parseInt(p.ordersCount, 10) || 0), 0);
  const ticketMedio = totalPeriodOrders > 0 ? totalPeriodSales / totalPeriodOrders : 0;

  const formatCurrency = (val) => {
    return (parseFloat(val) || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const maxValue = Math.max(...points.map(p => p.value), 100);

  const periods = [
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: '3m', label: '3 meses' },
    { key: '6m', label: '6 meses' }
  ];

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        width: '100%'
      }}
    >
      {/* Top Header with title and period filters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '800',
              color: '#0F172A',
              letterSpacing: '-0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <TrendingUp size={20} color="#166534" />
            Suas vendas
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
            Evolução real de faturamento em R$
          </p>
        </div>

        {/* Period Pills */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            padding: '3px',
            borderRadius: '10px',
            gap: '2px'
          }}
        >
          {periods.map(p => {
            const active = period === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                style={{
                  border: 'none',
                  backgroundColor: active ? '#FFFFFF' : 'transparent',
                  color: active ? '#0F172A' : '#64748B',
                  fontWeight: active ? '700' : '600',
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          backgroundColor: '#F8FAFC',
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
            Total vendido no período
          </span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
            {formatCurrency(totalPeriodSales)}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
            Quantidade de pedidos
          </span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
            {totalPeriodOrders}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
            Ticket Médio
          </span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#166534', marginTop: '2px' }}>
            {formatCurrency(ticketMedio)}
          </div>
        </div>
      </div>

      {/* Visual Chart Bars / Sparkline */}
      {points.length === 0 || totalPeriodSales === 0 ? (
        <div
          style={{
            height: '180px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94A3B8',
            fontSize: '13px',
            textAlign: 'center',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            padding: '20px'
          }}
        >
          <Calendar size={28} style={{ opacity: 0.5, marginBottom: '8px' }} />
          <span>Nenhuma venda registrada neste período.</span>
          <span style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>
            Suas novas vendas aparecerão no gráfico automaticamente.
          </span>
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto', paddingTop: '10px' }}>
          <div
            style={{
              height: '190px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: points.length > 20 ? '6px' : '14px',
              padding: '10px 4px 28px 4px',
              borderBottom: '1px solid #E2E8F0',
              position: 'relative',
              minWidth: points.length > 15 ? '560px' : '100%'
            }}
          >
            {points.map((pt, idx) => {
              const heightPercent = maxValue > 0 ? Math.max(8, (pt.value / maxValue) * 100) : 8;
              const hasSales = pt.value > 0;

              return (
                <div
                  key={`chart-bar-${idx}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    position: 'relative',
                    cursor: 'default'
                  }}
                  title={`${pt.label}: ${formatCurrency(pt.value)} (${pt.ordersCount} pedidos)`}
                >
                  {/* Tooltip on hover simulation */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPercent}%`,
                      backgroundColor: hasSales ? '#166534' : '#E2E8F0',
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.2s ease',
                      opacity: hasSales ? 0.9 : 0.4
                    }}
                    onMouseEnter={(e) => {
                      if (hasSales) e.currentTarget.style.backgroundColor = '#15803d';
                    }}
                    onMouseLeave={(e) => {
                      if (hasSales) e.currentTarget.style.backgroundColor = '#166534';
                    }}
                  />
                  {/* Date label */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-22px',
                      fontSize: '10px',
                      color: '#94A3B8',
                      whiteSpace: 'nowrap',
                      fontWeight: '500'
                    }}
                  >
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
