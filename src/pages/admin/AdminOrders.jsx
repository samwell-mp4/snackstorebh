import React, { useState } from 'react';
import { ShoppingBag, MessageSquare, Check, Clock, Truck, CheckCircle2, XCircle, Search, Eye, Printer, Phone } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStoreData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter(order => {
    const matchSearch = (order.order_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                        (order.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                        (order.customer_phone || '').includes(searchTerm);
    const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleOpenWhatsApp = (order) => {
    const phone = (order.customer_phone || '').replace(/\D/g, '');
    if (!phone) {
      alert('Telefone do cliente não informado.');
      return;
    }
    const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;
    
    let statusText = 'está confirmado';
    if (order.status === 'pago') statusText = 'está confirmado e com pagamento aprovado';
    if (order.status === 'separacao') statusText = 'já está em separação com muito cuidado';
    if (order.status === 'enviado') statusText = 'acaba de sair para entrega expressa em BH';
    if (order.status === 'entregue') statusText = 'foi entregue';

    const msg = `Olá, *${order.customer_name}*! Tudo bem? Aqui é da equipe da *Snack Store BH* 🌟\n\nPassando para avisar que seu pedido *#${order.order_number}* ${statusText}!\n\n*Total:* R$ ${order.total_amount?.toFixed(2)}\n*Itens:*\n` +
      (order.items || []).map(i => `• ${i.quantity}x ${i.name}`).join('\n') +
      `\n\nQualquer dúvida, estamos 100% à disposição por aqui! Muito obrigado pela preferência! ✨`;

    const url = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const statusColors = {
    pendente: { bg: '#fef3c7', text: '#92400e', label: 'Pendente' },
    pago: { bg: '#dcfce7', text: '#166534', label: 'Pago' },
    separacao: { bg: '#e0f2fe', text: '#0369a1', label: 'Em Separação' },
    enviado: { bg: '#f3e8ff', text: '#6b21a8', label: 'Enviado' },
    entregue: { bg: '#d1fae5', text: '#065f46', label: 'Entregue' },
    cancelado: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelado' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Bar */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px 24px',
        border: '1px solid rgba(41,69,31,0.08)', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
            Gestão de Pedidos & Expedição
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--snack-muted)' }}>
            Controle de fluxo de vendas, separação física em estoque e atendimento direto via WhatsApp
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '16px 20px',
        border: '1px solid rgba(41,69,31,0.08)', display: 'flex', flexWrap: 'wrap', gap: '12px',
        alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por número do pedido, cliente ou telefone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px',
              border: '1px solid rgba(41,69,31,0.15)', fontSize: '13px', backgroundColor: '#FAF8F2',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#FAF8F2', padding: '3px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.1)', overflowX: 'auto' }}>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'pendente', label: 'Pendentes' },
            { id: 'pago', label: 'Pagos' },
            { id: 'separacao', label: 'Separação' },
            { id: 'enviado', label: 'Enviados' },
            { id: 'entregue', label: 'Entregues' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              style={{
                border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: statusFilter === f.id ? '700' : '500',
                cursor: 'pointer', backgroundColor: statusFilter === f.id ? '#FFFFFF' : 'transparent',
                color: statusFilter === f.id ? 'var(--snack-green-dark)' : 'var(--snack-muted)',
                boxShadow: statusFilter === f.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(41,69,31,0.08)', color: 'var(--snack-muted)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px' }}>
                <th style={{ padding: '14px 18px' }}>Pedido</th>
                <th style={{ padding: '14px 14px' }}>Cliente</th>
                <th style={{ padding: '14px 14px' }}>Itens Comprados</th>
                <th style={{ padding: '14px 14px' }}>Total</th>
                <th style={{ padding: '14px 14px' }}>Pagamento</th>
                <th style={{ padding: '14px 14px' }}>Status Atual</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Ações Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--snack-muted)' }}>
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const s = statusColors[order.status] || statusColors.pendente;
                  const itemsCount = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);

                  return (
                    <tr
                      key={order.id}
                      style={{ borderBottom: '1px solid rgba(41,69,31,0.04)', transition: 'background-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF8F2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Order Number & Date */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--snack-green-dark)', fontFamily: 'var(--font-sans)' }}>
                          {order.order_number}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>
                          {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--snack-text)' }}>
                          {order.customer_name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={11} /> {order.customer_phone || 'Não informado'}
                        </div>
                      </td>

                      {/* Items */}
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--snack-text)' }}>
                          {itemsCount} {itemsCount === 1 ? 'frasco' : 'frascos'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {(order.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                      </td>

                      {/* Total */}
                      <td style={{ padding: '14px 14px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                        R$ {order.total_amount?.toFixed(2)}
                      </td>

                      {/* Payment */}
                      <td style={{ padding: '14px 14px', fontSize: '12px', color: 'var(--snack-text)' }}>
                        {order.payment_method || 'Pix'}
                      </td>

                      {/* Status Selector */}
                      <td style={{ padding: '14px 14px' }}>
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          style={{
                            padding: '6px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '700',
                            border: 'none', backgroundColor: s.bg, color: s.text, cursor: 'pointer', outline: 'none'
                          }}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="pago">Pago</option>
                          <option value="separacao">Em Separação</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregue">Entregue</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {/* WhatsApp Direct button */}
                          <button
                            onClick={() => handleOpenWhatsApp(order)}
                            title="Notificar cliente no WhatsApp"
                            style={{
                              backgroundColor: '#25D366', color: '#FFFFFF', border: 'none',
                              padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp</span>
                          </button>

                          {/* View details */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            title="Ver detalhes do pedido"
                            style={{
                              backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.15)',
                              padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: 'var(--snack-green-dark)'
                            }}
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          backgroundColor: 'rgba(23, 43, 20, 0.45)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            border: '1px solid rgba(41,69,31,0.12)'
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(41,69,31,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF8F2'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)' }}>
                  Comanda de Expedição
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
                  Pedido {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-muted)', padding: '6px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Customer summary */}
              <div style={{ backgroundColor: '#FAF8F2', padding: '14px', borderRadius: '10px', border: '1px solid rgba(41,69,31,0.06)' }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--snack-green-dark)' }}>{selectedOrder.customer_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--snack-muted)', marginTop: '4px' }}>
                  📱 WhatsApp: {selectedOrder.customer_phone || 'Não informado'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--snack-muted)', marginTop: '2px' }}>
                  📍 Endereço de Entrega: {selectedOrder.customer_address || 'Retirada ou balcão'}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-green-dark)', marginBottom: '8px' }}>
                  Fragrâncias do Pedido:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#FAF8F2', borderRadius: '6px', fontSize: '12px' }}>
                      <span style={{ fontWeight: '600' }}>{item.quantity}x {item.name} ({item.volume || '25ml'})</span>
                      <span style={{ fontWeight: '700', color: 'var(--snack-green-dark)' }}>R$ {(item.price * item.quantity)?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Profit breakdown */}
              <div style={{ borderTop: '1px solid rgba(41,69,31,0.1)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--snack-muted)' }}>Forma de Pagamento: <strong>{selectedOrder.payment_method}</strong></span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                    Total: R$ {selectedOrder.total_amount?.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => handleOpenWhatsApp(selectedOrder)}
                  style={{
                    flex: 1, backgroundColor: '#25D366', color: '#FFFFFF', padding: '12px',
                    borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <MessageSquare size={16} /> Notificar no WhatsApp
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    backgroundColor: '#FAF8F2', color: 'var(--snack-text)', padding: '12px 18px',
                    borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Printer size={16} /> Imprimir Comanda
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
