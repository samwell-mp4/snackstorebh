import React, { useState } from 'react';
import { ShoppingBag, MessageSquare, Check, Clock, Truck, CheckCircle2, XCircle, Search, Eye, Printer, Phone, QrCode, Copy, CheckCheck, Loader2 } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminOrders() {
  const { orders, updateOrderStatus, generateOrderPix } = useStoreData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [generatingPixId, setGeneratingPixId] = useState(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchSearch = (order.order_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                        (order.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                        (order.customer_phone || '').includes(searchTerm);
    const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleGeneratePix = async (order) => {
    if (!order) return;
    setGeneratingPixId(order.id);
    try {
      const res = await generateOrderPix(order.id);
      if (res && res.order) {
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder(res.order);
        }
      }
    } catch (err) {
      alert('Erro ao gerar Pix: ' + (err.message || 'Verifique as credenciais do Mercado Pago'));
    } finally {
      setGeneratingPixId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
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

    let pixNotice = '';
    if (order.pix_code && order.status !== 'pago') {
      pixNotice = `\n\n*Chave Pix Copia e Cola:* \n\`${order.pix_code}\`\n\nAssim que efetuar o pagamento, seu pedido entra automaticamente em separação! 🚀`;
    }

    const msg = `Olá, *${order.customer_name}*! Tudo bem? Aqui é da equipe da *Snack Store BH* 🌟\n\nPassando para avisar que seu pedido *#${order.order_number}* ${statusText}!\n\n*Total:* R$ ${parseFloat(order.total_amount || 0).toFixed(2)}\n*Itens:*\n` +
      (order.items || []).map(i => `• ${i.quantity}x ${i.name}`).join('\n') +
      pixNotice +
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
            Central de Pedidos & Expedição
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--snack-muted)' }}>
            Acompanhe pedidos da loja, vendas no balcão e encomendas de revendedores.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por nº, cliente ou fone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px 9px 36px', borderRadius: '10px',
                border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', outline: 'none'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 14px', borderRadius: '10px',
              border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', outline: 'none',
              backgroundColor: '#FFFFFF', fontWeight: '600'
            }}
          >
            <option value="ALL">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="separacao">Em Separação</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(41,69,31,0.08)',
        overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(41,69,31,0.08)', color: 'var(--snack-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={{ padding: '14px 18px' }}>Pedido</th>
                <th style={{ padding: '14px 14px' }}>Data / Hora</th>
                <th style={{ padding: '14px 14px' }}>Cliente / Destino</th>
                <th style={{ padding: '14px 14px' }}>Itens</th>
                <th style={{ padding: '14px 14px' }}>Total</th>
                <th style={{ padding: '14px 14px' }}>Pagamento / Pix</th>
                <th style={{ padding: '14px 14px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--snack-muted)' }}>
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const s = statusColors[order.status] || statusColors.pendente;
                  const dateFormatted = order.created_at
                    ? new Date(order.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : '-';
                  const itemsCount = (order.items || []).reduce((acc, i) => acc + (parseInt(i.quantity, 10) || 1), 0);
                  const isMulti = order.fulfillment_mode === 'multiple' || (Array.isArray(order.shipments) && order.shipments.length > 1);

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(41,69,31,0.05)', transition: 'background 0.15s' }}>
                      
                      {/* Order number */}
                      <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>#{order.order_number}</span>
                          {isMulti && (
                            <span style={{ fontSize: '10px', backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                              Multi ({order.shipments?.length || order.recipient_count || 2}x)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 14px', color: 'var(--snack-muted)', fontSize: '12px' }}>
                        {dateFormatted}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--snack-text)' }}>
                          {order.customer_name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={11} /> {order.customer_phone || 'Não informado'}
                        </div>
                      </td>

                      {/* Items */}
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--snack-text)' }}>
                          {itemsCount} {itemsCount === 1 ? 'unidade' : 'unidades'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {(order.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                      </td>

                      {/* Total */}
                      <td style={{ padding: '14px 14px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                        R$ {parseFloat(order.total_amount || 0).toFixed(2)}
                      </td>

                      {/* Payment */}
                      <td style={{ padding: '14px 14px', fontSize: '12px', color: 'var(--snack-text)' }}>
                        <div>{order.payment_method || 'Pix'}</div>
                        {order.pix_code ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginTop: '3px',
                            backgroundColor: order.status === 'pago' ? '#dcfce7' : '#fef3c7',
                            color: order.status === 'pago' ? '#166534' : '#92400e', fontWeight: '700'
                          }}>
                            <QrCode size={11} /> {order.status === 'pago' ? 'Pix Confirmado' : 'Pix Gerado'}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleGeneratePix(order)}
                            disabled={generatingPixId === order.id}
                            style={{
                              marginTop: '3px', fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                              backgroundColor: '#E0F2FE', color: '#0369A1', border: 'none',
                              cursor: 'pointer', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px'
                            }}
                          >
                            {generatingPixId === order.id ? <Loader2 size={10} className="animate-spin" /> : <QrCode size={10} />}
                            Gerar Pix MP
                          </button>
                        )}
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
            backgroundColor: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '640px',
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
                  Pedido #{selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-muted)', padding: '6px', fontSize: '18px' }}
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
                {selectedOrder.notes && (
                  <div style={{ fontSize: '12px', color: 'var(--snack-text)', marginTop: '6px', fontStyle: 'italic', backgroundColor: '#FFFFFF', padding: '6px 10px', borderRadius: '6px' }}>
                    Obs: {selectedOrder.notes}
                  </div>
                )}
              </div>

              {/* Mercado Pago Pix Section */}
              <div style={{
                backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QrCode size={18} style={{ color: '#166534' }} />
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#166534' }}>
                      Cobrança Mercado Pago (Pix)
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '99px',
                    backgroundColor: selectedOrder.status === 'pago' ? '#DCFCE7' : '#FEF3C7',
                    color: selectedOrder.status === 'pago' ? '#166534' : '#92400E'
                  }}>
                    {selectedOrder.status === 'pago' ? 'PAGO' : 'AGUARDANDO PAGAMENTO'}
                  </span>
                </div>

                {selectedOrder.pix_code ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedOrder.pix_qr_code_base64 && (
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <img
                          src={`data:image/png;base64,${selectedOrder.pix_qr_code_base64}`}
                          alt="Pix QR Code"
                          style={{ width: '160px', height: '160px', margin: '0 auto', display: 'block', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                        />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        readOnly
                        value={selectedOrder.pix_code}
                        style={{
                          flex: 1, fontSize: '11px', fontFamily: 'monospace', padding: '8px 10px',
                          borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF'
                        }}
                      />
                      <button
                        onClick={() => copyToClipboard(selectedOrder.pix_code)}
                        style={{
                          backgroundColor: '#166534', color: '#FFFFFF', border: 'none', padding: '8px 14px',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#166534' }}>
                      Gere a chave Pix oficial do Mercado Pago para este pedido:
                    </span>
                    <button
                      onClick={() => handleGeneratePix(selectedOrder)}
                      disabled={generatingPixId === selectedOrder.id}
                      style={{
                        backgroundColor: '#166534', color: '#FFFFFF', border: 'none', padding: '8px 14px',
                        borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      {generatingPixId === selectedOrder.id ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
                      {generatingPixId === selectedOrder.id ? 'Gerando Pix...' : 'Gerar Pix Mercado Pago'}
                    </button>
                  </div>
                )}
              </div>

              {/* Multi-recipient shipments if present */}
              {Array.isArray(selectedOrder.shipments) && selectedOrder.shipments.length > 0 && (
                <div style={{ backgroundColor: '#EDE9FE', border: '1px solid #DDD6FE', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700', color: '#5B21B6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={16} /> Entregas Múltiplas ({selectedOrder.shipments.length} Destinatários):
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedOrder.shipments.map((shp, idx) => (
                      <div key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '10px 14px', border: '1px solid #C4B5FD' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', fontSize: '13px', color: '#4C1D95' }}>
                            {shp.recipient_name || `Destinatário #${idx + 1}`}
                          </span>
                          <span style={{ fontSize: '10px', backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                            {shp.logistics_mode === 'programado_7' ? '7 Dias' : shp.logistics_mode === 'economico_15' ? '15 Dias' : 'Expresso BH'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>
                          📍 {shp.recipient_address || 'Endereço não informado'} • 📱 {shp.recipient_phone || 'Sem fone'}
                        </div>
                        {Array.isArray(shp.items) && (
                          <div style={{ marginTop: '6px', fontSize: '11px', color: '#374151', borderTop: '1px dashed #E5E7EB', paddingTop: '4px' }}>
                            <strong>Itens deste envio: </strong>
                            {shp.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-green-dark)', marginBottom: '8px' }}>
                  Fragrâncias do Pedido:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#FAF8F2', borderRadius: '6px', fontSize: '12px' }}>
                      <span style={{ fontWeight: '600' }}>{item.quantity}x {item.name} ({item.volume || '25ml'})</span>
                      <span style={{ fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                        R$ {(parseFloat(item.price || 0) * (parseInt(item.quantity, 10) || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Status */}
              <div style={{ borderTop: '1px solid rgba(41,69,31,0.1)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--snack-muted)' }}>
                  Forma de Pagamento: <strong>{selectedOrder.payment_method || 'Pix'}</strong>
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                    Total: R$ {parseFloat(selectedOrder.total_amount || 0).toFixed(2)}
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
