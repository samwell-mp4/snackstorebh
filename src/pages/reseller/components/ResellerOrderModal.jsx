import React, { useState } from 'react';
import { X, Package, Calendar, User, MapPin, CheckCircle, Clock, Truck, Copy, QrCode, CheckCheck, Split } from 'lucide-react';

export default function ResellerOrderModal({ order, onClose }) {
  if (!order) return null;

  const [copiedPix, setCopiedPix] = useState(false);

  const formatCurrency = (val) => {
    return (parseFloat(val) || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    let bg = '#F1F5F9', color = '#475569', label = status;

    if (s === 'entregue') {
      bg = '#DCFCE7'; color = '#166534'; label = 'Entregue';
    } else if (s === 'pago') {
      bg = '#DCFCE7'; color = '#166534'; label = 'Pago';
    } else if (s === 'enviado') {
      bg = '#E0F2FE'; color = '#0369A1'; label = 'Enviado';
    } else if (s === 'transito' || s === 'saiu para entrega') {
      bg = '#F3E8FF'; color = '#6B21A8'; label = 'Saiu para entrega';
    } else if (s === 'separacao' || s === 'embalagem') {
      bg = '#FEF3C7'; color = '#92400E'; label = 'Em separação';
    } else if (s === 'cancelado') {
      bg = '#FEE2E2'; color = '#991B1B'; label = 'Cancelado';
    } else {
      bg = '#FEF3C7'; color = '#92400E'; label = 'Pendente';
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
  const shipments = Array.isArray(order.shipments) ? order.shipments : [];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(5px)',
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
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
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

        {/* Mercado Pago Pix Section if available */}
        {order.pix_code && (
          <div style={{ marginTop: '16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={18} style={{ color: '#166534' }} />
                <strong style={{ fontSize: '13px', color: '#166534' }}>
                  Pagamento Pix (Mercado Pago)
                </strong>
              </div>
              <span style={{
                fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '99px',
                backgroundColor: order.status === 'pago' ? '#DCFCE7' : '#FEF3C7',
                color: order.status === 'pago' ? '#166534' : '#92400E'
              }}>
                {order.status === 'pago' ? 'PAGO' : 'AGUARDANDO PAGAMENTO'}
              </span>
            </div>

            {order.status !== 'pago' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {order.pix_qr_code_base64 && (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={`data:image/png;base64,${order.pix_qr_code_base64}`}
                      alt="QR Code Pix"
                      style={{ width: '150px', height: '150px', margin: '0 auto', display: 'block', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    />
                    <span style={{ fontSize: '11px', color: '#166534', marginTop: '4px', display: 'block' }}>
                      Abra o app do seu banco e aponte a câmera para o QR Code
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    readOnly
                    value={order.pix_code}
                    style={{
                      flex: 1, fontSize: '11px', fontFamily: 'monospace', padding: '8px 10px',
                      borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF'
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(order.pix_code)}
                    style={{
                      backgroundColor: '#166534', color: '#FFFFFF', border: 'none', padding: '8px 12px',
                      borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    {copiedPix ? <CheckCheck size={14} /> : <Copy size={14} />}
                    {copiedPix ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: '700' }}>
                ✅ Este pedido já teve o pagamento aprovado via Pix!
              </div>
            )}
          </div>
        )}

        {/* Recipient / Client info */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
            Destinatário / Envio
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

        {/* Multi-Shipments if present */}
        {shipments.length > 1 && (
          <div style={{ padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B21A8', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Split size={14} /> Entregas Múltiplas ({shipments.length} Endereços)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {shipments.map((shp, idx) => (
                <div key={idx} style={{ backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <strong style={{ fontSize: '12px', color: '#5B21B6' }}>
                      {shp.recipient_name || `Destinatário #${idx + 1}`}
                    </strong>
                    <span style={{ fontSize: '10px', backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                      {shp.logistics_mode === 'programado_7' ? '7 dias' : shp.logistics_mode === 'economico_15' ? '15 dias' : 'Expresso BH'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>
                    📍 {shp.recipient_address}
                  </div>
                  {Array.isArray(shp.items) && (
                    <div style={{ fontSize: '11px', color: '#374151', marginTop: '4px' }}>
                      Itens: {shp.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
                  {formatCurrency((parseFloat(item.price) || 0) * (item.quantity || 1))}
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
