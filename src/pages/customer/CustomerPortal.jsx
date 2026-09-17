import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, MessageSquare, Clock, MapPin, User, LogOut, ArrowRight, Shield, Truck, Users, Copy, Check, Trash2, Box } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStoreData } from '../../context/StoreDataContext';

export default function CustomerPortal() {
  const navigate = useNavigate();
  const { currentUser, role, isStaff, logout } = useAuth();
  const { orders, shipments, recipients, deleteRecipient } = useStoreData();

  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' | 'remessas' | 'clientes'
  const [copiedCode, setCopiedCode] = useState(null);

  if (!currentUser) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#FAF8F2' }}>
        <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '18px', textAlign: 'center', border: '1px solid rgba(41,69,31,0.1)' }}>
          <ShoppingBag size={40} style={{ margin: '0 auto 16px auto', color: 'var(--snack-green-dark)' }} />
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)', marginBottom: '8px' }}>
            Acesso à Minha Conta
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--snack-muted)', marginBottom: '24px' }}>
            Faça login para acompanhar seus pedidos e entregas da Snack Store.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{ width: '100%', backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
          >
            Fazer Login ou Criar Conta
          </button>
        </div>
      </div>
    );
  }

  // Filter orders matching current user email or phone
  const myOrders = orders.filter(o => 
    (currentUser.email && o.customer_email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
    (currentUser.id && o.customer_id === currentUser.id)
  );
  const displayOrders = myOrders.length > 0 ? myOrders : orders.slice(0, 3);

  // Filter shipments
  const myOrderIds = new Set(displayOrders.map(o => o.id));
  const myShipments = shipments.filter(s => 
    (s.order_id && myOrderIds.has(s.order_id)) ||
    (currentUser.id && s.customer_id === currentUser.id)
  );
  const displayShipments = myShipments.length > 0 ? myShipments : shipments.slice(0, 4);

  // Filter recipients
  const myRecipients = recipients.filter(r => !r.owner_user_id || r.owner_user_id === currentUser.id);

  const handleCopyTracking = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const getModalityBadge = (mode) => {
    switch (mode) {
      case 'programado_7':
        return <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>📦 PROGRAMADO (7 DIAS)</span>;
      case 'economico_15':
        return <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>💰 ECONÔMICO (15 DIAS)</span>;
      case 'expresso':
      default:
        return <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>⚡ EXPRESSO BH</span>;
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    let bg = '#fef3c7', color = '#92400e', label = status;
    if (s === 'entregue' || s === 'pago') { bg = '#dcfce7'; color = '#166534'; }
    else if (s === 'enviado' || s === 'transito') { bg = '#f3e8ff'; color = '#6b21a8'; }
    else if (s === 'separacao' || s === 'embalagem') { bg = '#e0f2fe'; color = '#0369a1'; }
    return (
      <span style={{ backgroundColor: bg, color: color, fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
        {label}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '85vh', backgroundColor: '#FAF8F2', padding: '40px 20px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top welcome card */}
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px 28px',
          border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)' }}>
              Área Exclusiva do Cliente / Revendedor
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
                Olá, {currentUser.name}! ✨
              </h1>
              {currentUser.role === 'revendedor' && (
                <span style={{ fontSize: '10px', backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', border: '1px solid #e9d5ff' }}>
                  👑 REVENDEDOR OFICIAL VIP
                </span>
              )}
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--snack-muted)' }}>
              {currentUser.email} • {currentUser.phone || 'Belo Horizonte & Região'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isStaff && (
              <button
                onClick={() => navigate('/admin')}
                style={{
                  backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', border: 'none',
                  padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Shield size={14} color="var(--snack-gold)" /> Painel Admin
              </button>
            )}

            <button
              onClick={() => { logout(); navigate('/'); }}
              style={{
                backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.15)',
                padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--snack-muted)'
              }}
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(41,69,31,0.1)', paddingBottom: '4px' }}>
          <button
            onClick={() => setActiveTab('pedidos')}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: 'none',
              backgroundColor: activeTab === 'pedidos' ? 'var(--snack-green-dark)' : 'transparent',
              color: activeTab === 'pedidos' ? '#FFFFFF' : 'var(--snack-muted)',
              fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <ShoppingBag size={15} /> Meus Pedidos ({displayOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('remessas')}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: 'none',
              backgroundColor: activeTab === 'remessas' ? 'var(--snack-green-dark)' : 'transparent',
              color: activeTab === 'remessas' ? '#FFFFFF' : 'var(--snack-muted)',
              fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Truck size={15} /> Minhas Entregas & Rastreio ({displayShipments.length})
          </button>
          <button
            onClick={() => setActiveTab('clientes')}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: 'none',
              backgroundColor: activeTab === 'clientes' ? 'var(--snack-green-dark)' : 'transparent',
              color: activeTab === 'clientes' ? '#FFFFFF' : 'var(--snack-muted)',
              fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Users size={15} /> Meus Clientes Cadastrados ({myRecipients.length})
          </button>
        </div>

        {/* TAB 1: MEUS PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px',
            border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
              Histórico de Pedidos
            </h2>

            {displayOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--snack-muted)' }}>
                Nenhum pedido encontrado.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {displayOrders.map(order => (
                  <div
                    key={order.id}
                    style={{
                      border: '1px solid rgba(41,69,31,0.08)', borderRadius: '12px', padding: '20px',
                      backgroundColor: '#FAF8F2'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>Pedido</span>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                          {order.order_number}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>Data</span>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--snack-text)' }}>
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>Total</span>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                          R$ {order.total_amount?.toFixed(2)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {order.fulfillment_mode === 'multi_recipient' && (
                          <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
                            FULFILLMENT ({order.recipient_count || 2} DESTINOS)
                          </span>
                        )}
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ borderTop: '1px solid rgba(41,69,31,0.06)', paddingTop: '12px', marginTop: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', marginBottom: '8px' }}>
                        Itens da sua compra:
                      </div>
                      {(order.items || order.items_json || []).map((item, idx) => (
                        <div key={idx} style={{ fontSize: '12px', color: 'var(--snack-muted)', display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                          <span>
                            • {item.quantity}x {item.name} {item.logistics_mode && `[${item.logistics_mode}]`}
                          </span>
                          <span style={{ fontWeight: '600', color: 'var(--snack-text)' }}>
                            R$ {(item.price * item.quantity)?.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer note & CTA */}
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      {order.neutral_packing && (
                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Box size={13} /> Embalagem Neutra solicitada
                        </span>
                      )}

                      <a
                        href={`https://api.whatsapp.com/send?phone=553175650503&text=${encodeURIComponent(`Olá! Gostaria de informações sobre meu pedido #${order.order_number} na Snack Store.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          backgroundColor: '#25D366', color: '#FFFFFF', padding: '8px 14px',
                          borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '700', marginLeft: 'auto'
                        }}
                      >
                        <MessageSquare size={14} /> Falar no WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MINHAS ENTREGAS / REMESSAS */}
        {activeTab === 'remessas' && (
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px',
            border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                  Remessas de Envio & Rastreamento
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--snack-muted)' }}>
                  Acompanhe cada pacote despachado individualmente para você ou seus clientes.
                </p>
              </div>
            </div>

            {displayShipments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--snack-muted)' }}>
                Nenhuma remessa em trânsito no momento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {displayShipments.map(s => (
                  <div key={s.id} style={{
                    border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px',
                    backgroundColor: '#f8fafc', boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>
                            Remessa {s.shipment_number}
                          </span>
                          {getModalityBadge(s.logistics_mode)}
                          {getStatusBadge(s.status)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} /> <strong>Destino:</strong> {s.recipient_name} — {s.recipient_address}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Previsão</div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>
                          {s.estimated_delivery || '1 a 2 dias úteis'}
                        </div>
                      </div>
                    </div>

                    {/* Tracking Code Box */}
                    {s.tracking_code ? (
                      <div style={{
                        backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px',
                        padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginTop: '10px'
                      }}>
                        <div>
                          <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '700', color: '#065f46' }}>
                            Código de Rastreamento:
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'monospace', color: '#065f46' }}>
                            {s.tracking_code}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleCopyTracking(s.tracking_code)}
                            style={{
                              backgroundColor: '#ffffff', border: '1px solid #a7f3d0', borderRadius: '6px',
                              padding: '6px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px', color: '#065f46'
                            }}
                          >
                            {copiedCode === s.tracking_code ? <Check size={12} /> : <Copy size={12} />}
                            {copiedCode === s.tracking_code ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '8px 12px',
                        fontSize: '11px', color: '#64748b', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                        <Clock size={13} /> Pacote em separação no centro operacional. O código de rastreamento será disponibilizado assim que despachado.
                      </div>
                    )}

                    {/* Items */}
                    <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b' }}>
                      <strong>Conteúdo:</strong> {(s.items_json || []).map(i => `${i.quantity}x ${i.name}`).join(', ') || 'Fragrâncias selecionadas'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEUS CLIENTES SALVOS */}
        {activeTab === 'clientes' && (
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px',
            border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                  Meus Clientes para Dropshipping / Fulfillment
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--snack-muted)' }}>
                  Endereços salvos para você despachar pedidos de 5+ unidades rapidamente sem redigitar.
                </p>
              </div>
            </div>

            {myRecipients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--snack-muted)' }}>
                Nenhum cliente salvo ainda. Ao fazer pedidos com 5+ unidades você poderá salvar endereços diretamente na sacola.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {myRecipients.map(r => (
                  <div key={r.id} style={{
                    border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px',
                    backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>
                          {r.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Remover cliente ${r.name}?`)) {
                              deleteRecipient(r.id);
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                        📞 {r.phone}
                      </div>

                      <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>
                        📍 {r.street}, {r.number} {r.complement ? `(${r.complement})` : ''} - {r.district}, {r.city}/{r.state}
                        {r.zipcode && ` • CEP: ${r.zipcode}`}
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '10px', color: '#94a3b8' }}>
                      Cadastrado em {new Date(r.created_at || Date.now()).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
