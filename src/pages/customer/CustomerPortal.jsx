import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, MessageSquare, Clock, MapPin, User, LogOut, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStoreData } from '../../context/StoreDataContext';

export default function CustomerPortal() {
  const navigate = useNavigate();
  const { currentUser, role, isStaff, logout } = useAuth();
  const { orders } = useStoreData();

  if (!currentUser) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#FAF8F2' }}>
        <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '18px', textAlign: 'center', border: '1px solid rgba(41,69,31,0.1)' }}>
          <ShoppingBag size={40} style={{ margin: '0 auto 16px auto', color: 'var(--snack-green-dark)' }} />
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)', marginBottom: '8px' }}>
            Acesso à Minha Conta
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--snack-muted)', marginBottom: '24px' }}>
            Faça login para acompanhar o status de envio dos seus perfumes em Belo Horizonte.
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

  // Filter orders matching current user email or phone, or show demo sample
  const myOrders = orders.filter(o => 
    (currentUser.email && o.customer_email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
    (currentUser.id && o.customer_id === currentUser.id)
  );

  const displayOrders = myOrders.length > 0 ? myOrders : orders.slice(0, 2);

  return (
    <div style={{ minHeight: '85vh', backgroundColor: '#FAF8F2', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top welcome card */}
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px 28px',
          border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)' }}>
              Área Exclusiva do Cliente
            </span>
            <h1 style={{ margin: '4px 0 0 0', fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
              Olá, {currentUser.name}! ✨
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--snack-muted)' }}>
              {currentUser.email} • {currentUser.phone || 'BH & Região'}
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

        {/* Orders list */}
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px',
          border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
            Meus Pedidos & Rastreamento
          </h2>

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

                  <div>
                    <span style={{
                      display: 'inline-block', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '99px',
                      textTransform: 'uppercase',
                      backgroundColor: order.status === 'pago' ? '#dcfce7' : order.status === 'separacao' ? '#e0f2fe' : order.status === 'enviado' ? '#f3e8ff' : '#fef3c7',
                      color: order.status === 'pago' ? '#166534' : order.status === 'separacao' ? '#0369a1' : order.status === 'enviado' ? '#6b21a8' : '#92400e'
                    }}>
                      Status: {order.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ borderTop: '1px solid rgba(41,69,31,0.06)', paddingTop: '12px', marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', marginBottom: '8px' }}>
                    Itens da sua compra:
                  </div>
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} style={{ fontSize: '12px', color: 'var(--snack-muted)', display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span>• {item.quantity}x {item.name} ({item.volume || '25ml'})</span>
                      <span style={{ fontWeight: '600', color: 'var(--snack-text)' }}>R$ {(item.price * item.quantity)?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* WhatsApp Contact CTA */}
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <a
                    href={`https://api.whatsapp.com/send?phone=553175650503&text=${encodeURIComponent(`Olá! Gostaria de informações sobre meu pedido #${order.order_number} na Snack Store.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      backgroundColor: '#25D366', color: '#FFFFFF', padding: '8px 14px',
                      borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '700'
                    }}
                  >
                    <MessageSquare size={14} /> Falar com Atendente no WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
