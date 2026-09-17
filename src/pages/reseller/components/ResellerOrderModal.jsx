import React from 'react';
import { X, Package, Calendar, User, MapPin, CheckCircle, Clock, Truck, Copy } from 'lucide-react';

export default function ResellerOrderModal({ order, onClose }) {
  if (!order) return null;

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
          padding: '4px 10px',
          borderRadius: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.4px'
        }}
      >
        {label}
      </span>
    );
  };

  const getModalityBadge = (mode) => {
    const m = (mode || '').toLowerCase();
    if (m.includes('econ')) {
      return <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>💰 15 DIAS</span>;
    }
    if (m.includes('prog')) {
      return <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>📦 7 DIAS</span>;
    }
    return <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>⚡ EXPRESSO</span>;
  };

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E2E8F0',
          padding: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                Pedido #{order.order_number || order.id}
              </h3>
              {getStatusBadge(order.status)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#64748B' }}>
              <span>
                {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Data recente'}
              </span>
              <span>•</span>
              {getModalityBadge(order.logistics_mode)}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#F8FAFC',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Recipient / Client info */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
            Destinatário / Cliente
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
            <User size={16} color="#64748B" />
            <span>{order.customer_name || 'Cliente Direto'}</span>
          </div>
          {order.customer_phone && (
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginLeft: '24px' }}>
              WhatsApp: {order.customer_phone}
            </div>
          )}
          {order.customer_address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
              <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{order.customer_address}</span>
            </div>
          )}
        </div>

        {/* Order Items list */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '12px' }}>
            Produtos do Pedido ({items.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#F8FAFC',
                  padding: '10px 12px',
                  borderRadius: '10px'
                }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '40px', height: '40px', objectFit: 'contain', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                  />
                ) : (
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#E2E8F0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={18} color="#64748B" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Qtd: {item.quantity || 1} un • {formatCurrency(item.price)} cada
                  </div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                  {formatCurrency((item.price || 0) * (item.quantity || 1))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Action */}
        <div style={{ paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Total do Pedido</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
              {formatCurrency(order.total_amount)}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
