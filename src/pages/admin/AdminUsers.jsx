import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, UserCheck, Users, Plus, Shield, Check, Lock, Unlock,
  ShoppingBag, MessageSquare, Key, Trash2, Copy, Search, FileText,
  Send, Eye, X, Award, Sparkles, Filter, ExternalLink, RefreshCw,
  Phone, Mail, ArrowRight, Package, DollarSign
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useStoreData } from '../../context/StoreDataContext';

const PIX_KEY = '553175650503'; // Chave Pix da Loja BH
const STORE_WHATSAPP = '553175650503';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { currentUser, switchRole, impersonateUser } = useAuth();
  const { products = [], orders = [], createOrder } = useStoreData();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addError, setAddError] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'revendedor',
    status: 'ativo',
    openComandaImmediately: false
  });

  // Password Reset Modal State
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');

  // Orders History Drawer
  const [ordersDrawerUser, setOrdersDrawerUser] = useState(null);

  // WhatsApp Quick Send Modal
  const [whatsAppModalUser, setWhatsAppModalUser] = useState(null);

  // Comanda / Order Creation Modal State
  const [isComandaOpen, setIsComandaOpen] = useState(false);
  const [comandaUser, setComandaUser] = useState(null);
  const [comandaSearchProduct, setComandaSearchProduct] = useState('');
  const [comandaItems, setComandaItems] = useState([]);
  const [comandaForm, setComandaForm] = useState({
    payment_method: 'Pix',
    status: 'pago',
    logistics_mode: 'EXPRESSO',
    shipping_address: '',
    neutral_packing: false,
    notes: 'Pedido gerado diretamente no balcão / painel administrativo'
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 4000);
  };

  // Role Configurations
  const roleColors = {
    admin: {
      bg: '#dbeafe',
      text: '#1e40af',
      border: '#bfdbfe',
      label: 'Administrador',
      icon: ShieldCheck,
      desc: 'Acesso total: financeiro, produtos, estoque, configurações e usuários.'
    },
    gerente: {
      bg: '#fef3c7',
      text: '#92400e',
      border: '#fde68a',
      label: 'Gerente Operações',
      icon: UserCheck,
      desc: 'Gestão diária: catálogo, atualização de estoque, separação e pedidos.'
    },
    revendedor: {
      bg: '#f3e8ff',
      text: '#6b21a8',
      border: '#e9d5ff',
      label: 'Revendedor Atacado / VIP',
      icon: Award,
      desc: 'Parceiro de revenda: compras em atacado, comanda rápida e white-label.'
    },
    comprador: {
      bg: '#dcfce7',
      text: '#166534',
      border: '#bbf7d0',
      label: 'Cliente Varejo',
      icon: Users,
      desc: 'Cliente final: navega na loja, compra avulsa e rastreia seus pedidos.'
    }
  };

  // Role Change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiService.updateUserRole(userId, newRole);
      await loadUsers();
      showToast(`Nível de acesso alterado para "${roleColors[newRole]?.label || newRole}".`);
    } catch (e) {
      alert('Erro ao atualizar papel: ' + e.message);
    }
  };

  // Status Toggle
  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ativo' ? 'bloqueado' : 'ativo';
    try {
      await apiService.updateUserStatus(userId, nextStatus);
      await loadUsers();
      showToast(`Status do usuário alterado para "${nextStatus.toUpperCase()}".`);
    } catch (e) {
      alert('Erro ao alterar status: ' + e.message);
    }
  };

  // Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setAddError('Por favor preencha nome, e-mail e senha.');
      return;
    }

    try {
      const res = await apiService.createUser({
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password.trim(),
        phone: newUser.phone.trim(),
        role: newUser.role,
        status: newUser.status || 'ativo'
      });

      if (res && res.success) {
        await loadUsers();
        setIsAddModalOpen(false);
        showToast(`Usuário "${newUser.name}" cadastrado com sucesso como ${roleColors[newUser.role]?.label}!`);

        if (newUser.openComandaImmediately) {
          openComandaModal(res.user || newUser);
        }

        setNewUser({
          name: '',
          email: '',
          password: '',
          phone: '',
          role: 'revendedor',
          status: 'ativo',
          openComandaImmediately: false
        });
      } else {
        setAddError(res?.message || 'Erro ao criar usuário.');
      }
    } catch (err) {
      setAddError(err.message || 'Erro de comunicação ao criar usuário.');
    }
  };

  // Delete User
  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id || user.email === currentUser?.email) {
      alert('Você não pode excluir sua própria conta conectada.');
      return;
    }
    if (!window.confirm(`Tem certeza que deseja remover o usuário "${user.name}" (${user.email})?`)) {
      return;
    }
    try {
      await apiService.deleteUser(user.id);
      await loadUsers();
      showToast(`Usuário "${user.name}" removido com sucesso.`);
    } catch (e) {
      alert('Erro ao remover usuário: ' + e.message);
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordModalUser || !newPasswordVal.trim()) return;
    try {
      await apiService.resetUserPassword(passwordModalUser.id, newPasswordVal.trim());
      await loadUsers();
      showToast(`Senha de "${passwordModalUser.name}" atualizada com sucesso!`);
      setPasswordModalUser(null);
      setNewPasswordVal('');
    } catch (e) {
      alert('Erro ao redefinir senha: ' + e.message);
    }
  };

  // Impersonate / Access As
  const handleImpersonate = (user) => {
    impersonateUser(user);
    showToast(`Conectado agora como "${user.name}" (${user.role}).`);
    if (user.role === 'admin' || user.role === 'gerente') {
      // Stay on admin
    } else {
      navigate('/minha-conta');
    }
  };

  // Copy User Access
  const handleCopyCredentials = (user) => {
    const text = `*Snack Store BH - Dados de Acesso*\nNome: ${user.name}\nE-mail: ${user.email}\nNível: ${roleColors[user.role]?.label || user.role}\nTelefone: ${user.phone || 'Não informado'}\nPainel: https://snackstorebh.com.br/login`;
    navigator.clipboard.writeText(text);
    showToast('Dados de acesso copiados para a área de transferência!');
  };

  // WhatsApp helper
  const openWhatsApp = (phone, text) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const num = cleanPhone.length >= 10 ? (cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone) : STORE_WHATSAPP;
    const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Open Comanda Modal
  const openComandaModal = (user) => {
    setComandaUser(user);
    setComandaItems([]);
    setComandaForm({
      payment_method: 'Pix',
      status: 'pago',
      logistics_mode: 'EXPRESSO',
      shipping_address: user.phone ? `Entrega / WhatsApp: ${user.phone}` : 'Balcão Snack Store BH',
      neutral_packing: user.role === 'revendedor',
      notes: user.role === 'revendedor' ? 'Comanda Faturada Atacado / Revenda' : 'Venda balcão / WhatsApp'
    });
    setIsComandaOpen(true);
  };

  // Comanda Item helpers
  const handleAddProductToComanda = (prod) => {
    const isReseller = comandaUser?.role === 'revendedor';
    // If reseller, standard wholesale discount (approx 25-30% or custom cost)
    const suggestedPrice = isReseller ? Math.round(prod.price * 0.72) : prod.price;

    setComandaItems(prev => {
      const existing = prev.find(item => item.code === prod.code);
      if (existing) {
        return prev.map(item => item.code === prod.code ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [
        ...prev,
        {
          code: prod.code,
          name: prod.name,
          brand: prod.brand,
          price: suggestedPrice,
          original_price: prod.price,
          cost_price: prod.cost_price || (prod.price * 0.42),
          quantity: 1,
          volume: prod.volume || '25ml'
        }
      ];
    });
  };

  const handleUpdateComandaItemQty = (code, delta) => {
    setComandaItems(prev => {
      return prev.map(item => {
        if (item.code === code) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handleUpdateComandaItemPrice = (code, price) => {
    const val = parseFloat(price) || 0;
    setComandaItems(prev => prev.map(item => item.code === code ? { ...item, price: val } : item));
  };

  // Calculate Comanda totals
  const comandaTotal = comandaItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const comandaTotalCost = comandaItems.reduce((acc, it) => acc + ((it.cost_price || 0) * it.quantity), 0);
  const comandaProfit = comandaTotal - comandaTotalCost;
  const comandaUnitsCount = comandaItems.reduce((acc, it) => acc + it.quantity, 0);

  // Submit Comanda
  const handleSaveComanda = async (shouldSendWhatsApp = false) => {
    if (comandaItems.length === 0) {
      alert('Adicione pelo menos um perfume na comanda.');
      return;
    }

    try {
      const orderData = {
        customer_id: comandaUser?.id || null,
        customer_name: comandaUser?.name || 'Cliente Balcão',
        customer_email: comandaUser?.email || '',
        customer_phone: comandaUser?.phone || '',
        customer_address: comandaForm.shipping_address || 'Belo Horizonte - MG',
        items: comandaItems.map(it => ({
          code: it.code,
          name: it.name,
          price: it.price,
          cost_price: it.cost_price,
          quantity: it.quantity,
          volume: it.volume
        })),
        total_amount: comandaTotal,
        cost_amount: comandaTotalCost,
        status: comandaForm.status,
        payment_method: comandaForm.payment_method,
        fulfillment_mode: 'single',
        neutral_packing: comandaForm.neutral_packing,
        notes: `[Comanda Manual para ${comandaUser?.name} (${roleColors[comandaUser?.role]?.label})] ${comandaForm.notes}`
      };

      const created = await createOrder(orderData);
      const orderNumber = created?.order_number || ('SNK-' + Math.floor(1000 + Math.random() * 9000));

      showToast(`Comanda #${orderNumber} gerada com sucesso para ${comandaUser?.name}! Total: R$ ${comandaTotal.toFixed(2)}`);
      setIsComandaOpen(false);

      if (shouldSendWhatsApp && comandaUser?.phone) {
        let text = `🛍️ *COMANDA DE PEDIDO - SNACK STORE BH*\n`;
        text += `----------------------------------------\n`;
        text += `👤 *Cliente:* ${comandaUser.name}\n`;
        text += `📄 *Pedido:* #${orderNumber}\n`;
        text += `📦 *Itens (${comandaUnitsCount} un):*\n`;
        comandaItems.forEach(it => {
          text += `• ${it.quantity}x ${it.name} (${it.volume}) - R$ ${(it.price * it.quantity).toFixed(2)}\n`;
        });
        text += `----------------------------------------\n`;
        text += `💰 *Total:* R$ ${comandaTotal.toFixed(2)}\n`;
        text += `💳 *Pagamento:* ${comandaForm.payment_method}\n`;
        if (comandaForm.payment_method === 'Pix') {
          text += `🔑 *Chave Pix:* ${PIX_KEY} (Snack Store)\n`;
        }
        text += `🚚 *Despacho:* ${comandaForm.shipping_address}\n`;
        if (comandaForm.neutral_packing) {
          text += `✨ *Embalagem Neutra:* Sim (White-label para Revenda)\n`;
        }
        text += `\nQualquer dúvida, estamos à disposição no balcão!`;

        openWhatsApp(comandaUser.phone, text);
      }
    } catch (err) {
      alert('Erro ao salvar comanda: ' + err.message);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm));
    return matchesRole && matchesSearch;
  });

  // Role Counts
  const countAll = users.length;
  const countRevendedor = users.filter(u => u.role === 'revendedor').length;
  const countComprador = users.filter(u => u.role === 'comprador').length;
  const countGerente = users.filter(u => u.role === 'gerente').length;
  const countAdmin = users.filter(u => u.role === 'admin').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* HEADER BAR */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '22px 28px',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--snack-gold)' }}>
              Gestão de Acessos & Clientes
            </span>
            <span style={{ fontSize: '10px', backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '99px', fontWeight: '700' }}>
              Multi-Papéis Ativos
            </span>
          </div>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
            Usuários, Níveis & Integração com Clientes
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--snack-muted)' }}>
            Crie revendedores, administradores, emita comandas rápidas, envie mensagens pelo WhatsApp e gerencie pedidos em 1 clique.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={loadUsers}
            title="Atualizar lista"
            style={{
              backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.15)',
              padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--snack-text)'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>

          <button
            onClick={() => {
              setAddError('');
              setIsAddModalOpen(true);
            }}
            style={{
              backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', border: 'none',
              padding: '11px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 15px rgba(23,43,20,0.2)'
            }}
          >
            <Plus size={16} /> Novo Usuário / Revendedor
          </button>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {feedback && (
        <div style={{
          backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46',
          padding: '12px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: '600',
          display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(16,185,129,0.1)'
        }}>
          <Check size={18} color="#059669" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ROLE EXPLANATIONS & STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {Object.entries(roleColors).map(([roleKey, cfg]) => {
          const Icon = cfg.icon;
          const count = users.filter(u => u.role === roleKey).length;
          const isSelected = filterRole === roleKey;

          return (
            <div
              key={roleKey}
              onClick={() => setFilterRole(filterRole === roleKey ? 'all' : roleKey)}
              style={{
                backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px',
                border: isSelected ? `2px solid ${cfg.text}` : '1px solid rgba(41,69,31,0.08)',
                boxShadow: isSelected ? '0 6px 20px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ padding: '7px', borderRadius: '8px', backgroundColor: cfg.bg, color: cfg.text }}>
                    <Icon size={16} />
                  </div>
                  <strong style={{ fontSize: '14px', color: 'var(--snack-green-dark)' }}>{cfg.label}</strong>
                </div>
                <span style={{
                  fontSize: '13px', fontWeight: '800', backgroundColor: cfg.bg, color: cfg.text,
                  padding: '2px 8px', borderRadius: '999px'
                }}>
                  {count}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--snack-muted)', margin: 0, lineHeight: '1.5' }}>
                {cfg.desc}
              </p>
              {isSelected && (
                <span style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: cfg.text }}>
                  Filtro Ativo ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px 20px',
        border: '1px solid rgba(41,69,31,0.08)', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '14px'
      }}>
        {/* Role Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `Todos (${countAll})` },
            { id: 'revendedor', label: `Revendedores (${countRevendedor})` },
            { id: 'comprador', label: `Clientes (${countComprador})` },
            { id: 'gerente', label: `Gerentes (${countGerente})` },
            { id: 'admin', label: `Admins (${countAdmin})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              style={{
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                backgroundColor: filterRole === tab.id ? 'var(--snack-green-dark)' : '#FAF8F2',
                color: filterRole === tab.id ? '#FFFFFF' : 'var(--snack-text)',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px',
              border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-muted)', fontSize: '11px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* USERS TABLE */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(41,69,31,0.08)', backgroundColor: '#FAF8F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
            Contas Cadastradas ({filteredUsers.length} de {users.length})
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--snack-muted)' }}>
            Dica: Use <strong>Criar Comanda</strong> para gerar pedidos manuais de atacado ou balcão
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(41,69,31,0.08)', color: 'var(--snack-muted)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', backgroundColor: '#FFFFFF' }}>
                <th style={{ padding: '14px 20px' }}>Usuário / E-mail</th>
                <th style={{ padding: '14px 14px' }}>WhatsApp / Contato</th>
                <th style={{ padding: '14px 14px' }}>Nível de Acesso (Role)</th>
                <th style={{ padding: '14px 14px' }}>Status</th>
                <th style={{ padding: '14px 14px' }}>Pedidos</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Ações Rápidas & Integração</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--snack-muted)' }}>
                    Nenhum usuário encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const isCurrent = currentUser?.email?.toLowerCase() === u.email?.toLowerCase();
                  const roleCfg = roleColors[u.role] || roleColors.comprador;
                  const isBlocked = u.status === 'bloqueado';
                  const userOrders = orders.filter(o => o.customer_id === u.id || (o.customer_email && o.customer_email.toLowerCase() === u.email?.toLowerCase()));

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(41,69,31,0.04)', transition: 'background 0.15s' }}>
                      
                      {/* Name & Email */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: roleCfg.bg, color: roleCfg.text,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '800', fontSize: '13px'
                          }}>
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--snack-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span style={{ fontSize: '9px', backgroundColor: 'var(--snack-green-dark)', color: '#fff', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Você</span>
                              )}
                              {u.role === 'revendedor' && (
                                <span style={{ fontSize: '9px', backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>REVENDEDOR</span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--snack-muted)' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone / WhatsApp */}
                      <td style={{ padding: '14px 14px', fontSize: '12px' }}>
                        {u.phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--snack-text)', fontWeight: '600' }}>{u.phone}</span>
                            <button
                              onClick={() => setWhatsAppModalUser(u)}
                              title="Conversar no WhatsApp"
                              style={{
                                background: '#dcfce7', border: 'none', color: '#166534',
                                padding: '4px 6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                              }}
                            >
                              <MessageSquare size={13} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--snack-muted)' }}>Sem telefone</span>
                        )}
                      </td>

                      {/* Role Selector */}
                      <td style={{ padding: '14px 14px' }}>
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          style={{
                            padding: '6px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '800',
                            border: `1px solid ${roleCfg.border}`, backgroundColor: roleCfg.bg,
                            color: roleCfg.text, cursor: 'pointer', outline: 'none'
                          }}
                        >
                          <option value="admin">Administrador Geral</option>
                          <option value="gerente">Gerente de Operações</option>
                          <option value="revendedor">Revendedor Atacado / VIP</option>
                          <option value="comprador">Cliente Varejo</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 14px' }}>
                        <span style={{
                          display: 'inline-block', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '99px',
                          backgroundColor: isBlocked ? '#fee2e2' : '#dcfce7',
                          color: isBlocked ? '#991b1b' : '#166534', textTransform: 'uppercase', letterSpacing: '0.5px'
                        }}>
                          {u.status || 'ativo'}
                        </span>
                      </td>

                      {/* Orders Count */}
                      <td style={{ padding: '14px 14px' }}>
                        <button
                          onClick={() => setOrdersDrawerUser(u)}
                          style={{
                            background: 'none', border: '1px solid rgba(41,69,31,0.15)',
                            padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                            cursor: 'pointer', color: 'var(--snack-green-dark)', display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          <ShoppingBag size={12} />
                          <span>{userOrders.length} pedido(s)</span>
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          
                          {/* Botão 1: Criar Comanda */}
                          <button
                            onClick={() => openComandaModal(u)}
                            title="Criar comanda / pedido direto para este usuário"
                            style={{
                              backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', border: 'none',
                              padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px'
                            }}
                          >
                            <FileText size={13} color="var(--snack-gold)" />
                            <span>Comanda</span>
                          </button>

                          {/* Botão 2: WhatsApp */}
                          <button
                            onClick={() => setWhatsAppModalUser(u)}
                            title="Integração WhatsApp com mensagens prontas"
                            style={{
                              backgroundColor: '#25D366', color: '#FFFFFF', border: 'none',
                              padding: '6px 9px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <MessageSquare size={13} />
                          </button>

                          {/* Botão 3: Acessar Como (Impersonar) */}
                          <button
                            onClick={() => handleImpersonate(u)}
                            title="Acessar sistema como este usuário (testar portal)"
                            style={{
                              backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.18)',
                              padding: '6px 9px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                              color: 'var(--snack-green-dark)'
                            }}
                          >
                            <Eye size={13} />
                          </button>

                          {/* Botão 4: Copiar Dados */}
                          <button
                            onClick={() => handleCopyCredentials(u)}
                            title="Copiar dados de acesso do usuário"
                            style={{
                              backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.18)',
                              padding: '6px 9px', borderRadius: '8px', fontSize: '11px',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'var(--snack-muted)'
                            }}
                          >
                            <Copy size={13} />
                          </button>

                          {/* Botão 5: Redefinir Senha */}
                          <button
                            onClick={() => {
                              setPasswordModalUser(u);
                              setNewPasswordVal('');
                            }}
                            title="Alterar / Redefinir senha"
                            style={{
                              backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.18)',
                              padding: '6px 9px', borderRadius: '8px', fontSize: '11px',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'var(--snack-muted)'
                            }}
                          >
                            <Key size={13} />
                          </button>

                          {/* Botão 6: Bloquear / Desbloquear */}
                          <button
                            onClick={() => handleToggleStatus(u.id, u.status || 'ativo')}
                            disabled={isCurrent}
                            title={isBlocked ? 'Desbloquear conta' : 'Bloquear conta'}
                            style={{
                              backgroundColor: isBlocked ? '#fee2e2' : '#FAF8F2',
                              border: '1px solid rgba(41,69,31,0.18)', padding: '6px 9px',
                              borderRadius: '8px', fontSize: '11px', cursor: isCurrent ? 'not-allowed' : 'pointer',
                              opacity: isCurrent ? 0.3 : 1, display: 'inline-flex', alignItems: 'center',
                              color: isBlocked ? '#991b1b' : 'var(--snack-muted)'
                            }}
                          >
                            {isBlocked ? <Unlock size={13} /> : <Lock size={13} />}
                          </button>

                          {/* Botão 7: Excluir */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isCurrent}
                            title="Excluir usuário"
                            style={{
                              backgroundColor: '#fff', border: '1px solid #fecaca',
                              padding: '6px 9px', borderRadius: '8px', fontSize: '11px',
                              cursor: isCurrent ? 'not-allowed' : 'pointer', opacity: isCurrent ? 0.3 : 1,
                              display: 'inline-flex', alignItems: 'center', color: '#dc2626'
                            }}
                          >
                            <Trash2 size={13} />
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

      {/* ========================================================= */}
      {/* MODAL: CRIAR COMANDA / NOVO PEDIDO DO USUÁRIO             */}
      {/* ========================================================= */}
      {isComandaOpen && comandaUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1300,
          backgroundColor: 'rgba(23, 43, 20, 0.55)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '800px',
            maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            border: '1px solid rgba(41,69,31,0.12)', display: 'flex', flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(41,69,31,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF8F2'
            }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--snack-gold)' }}>
                  Comanda de Balcão & Faturamento
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
                  Nova Comanda para {comandaUser.name}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--snack-muted)', marginTop: '2px' }}>
                  {comandaUser.email} • {comandaUser.phone || 'Sem telefone'} • Perfil: <strong>{roleColors[comandaUser.role]?.label || comandaUser.role}</strong>
                </div>
              </div>
              <button onClick={() => setIsComandaOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--snack-muted)' }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Product Selector */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                    🔍 Adicionar Fragrâncias à Comanda:
                  </label>
                  {comandaUser.role === 'revendedor' && (
                    <span style={{ fontSize: '11px', backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                      Preço de atacado com desconto aplicado automaticamente!
                    </span>
                  )}
                </div>

                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
                  <input
                    type="text"
                    placeholder="Digite o nome, código ou marca do perfume (ex: Asad, Yara, 001, Lattafa)..."
                    value={comandaSearchProduct}
                    onChange={e => setComandaSearchProduct(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>

                {/* Quick Products Chips */}
                <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px', backgroundColor: '#FAF8F2', borderRadius: '10px', border: '1px solid rgba(41,69,31,0.06)' }}>
                  {products
                    .filter(p => !comandaSearchProduct || p.name.toLowerCase().includes(comandaSearchProduct.toLowerCase()) || p.code.toLowerCase().includes(comandaSearchProduct.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(comandaSearchProduct.toLowerCase())))
                    .slice(0, 15)
                    .map(prod => (
                      <button
                        key={prod.code}
                        type="button"
                        onClick={() => handleAddProductToComanda(prod)}
                        style={{
                          backgroundColor: '#FFFFFF', border: '1px solid rgba(41,69,31,0.15)',
                          borderRadius: '6px', padding: '6px 10px', fontSize: '11px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'left'
                        }}
                      >
                        <Plus size={12} color="var(--snack-green-dark)" />
                        <span><strong>{prod.code}</strong> - {prod.name} (R$ {prod.price.toFixed(2)})</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Items List in Comanda */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: 'var(--snack-green-dark)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Itens da Comanda ({comandaItems.length})</span>
                  <span style={{ color: 'var(--snack-muted)', fontWeight: 'normal', fontSize: '12px' }}>Total de frascos: {comandaUnitsCount} un</span>
                </h4>

                {comandaItems.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FAF8F2', borderRadius: '10px', color: 'var(--snack-muted)', fontSize: '13px' }}>
                    Nenhum item adicionado ainda. Clique nos perfumes acima para adicionar.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {comandaItems.map(item => (
                      <div
                        key={item.code}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: '8px',
                          border: '1px solid rgba(41,69,31,0.1)', flexWrap: 'wrap', gap: '10px'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--snack-text)' }}>{item.name}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>
                            Cód: {item.code} • {item.volume} • Preço original: R$ {item.original_price?.toFixed(2)}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {/* Price input */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>R$</span>
                            <input
                              type="number"
                              step="0.5"
                              value={item.price}
                              onChange={e => handleUpdateComandaItemPrice(item.code, e.target.value)}
                              title="Preço Unitário"
                              style={{ width: '70px', padding: '4px 6px', borderRadius: '4px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '12px', fontWeight: '700' }}
                            />
                          </div>

                          {/* Qty controls */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateComandaItemQty(item.code, -1)}
                              style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(41,69,31,0.2)', background: '#FAF8F2', cursor: 'pointer', fontWeight: '700' }}
                            >
                              -
                            </button>
                            <span style={{ fontSize: '13px', fontWeight: '800', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateComandaItemQty(item.code, 1)}
                              style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(41,69,31,0.2)', background: '#FAF8F2', cursor: 'pointer', fontWeight: '700' }}
                            >
                              +
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleUpdateComandaItemQty(item.code, -9999)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comanda Settings (Payment, Shipping, Notes) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', padding: '16px', backgroundColor: '#FAF8F2', borderRadius: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Forma de Pagamento
                  </label>
                  <select
                    value={comandaForm.payment_method}
                    onChange={e => setComandaForm({ ...comandaForm, payment_method: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '12px', backgroundColor: '#fff' }}
                  >
                    <option value="Pix">Pix (Chave BH)</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Faturado / A Prazo">Faturado / A Prazo (Revendedor)</option>
                    <option value="Dinheiro / Balcão">Dinheiro / Balcão</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Status do Pedido
                  </label>
                  <select
                    value={comandaForm.status}
                    onChange={e => setComandaForm({ ...comandaForm, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '12px', backgroundColor: '#fff' }}
                  >
                    <option value="pago">Pago (Aprovado)</option>
                    <option value="separacao">Em Separação</option>
                    <option value="pendente">Pendente de Pagamento</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Endereço de Entrega / Despacho
                  </label>
                  <input
                    type="text"
                    value={comandaForm.shipping_address}
                    onChange={e => setComandaForm({ ...comandaForm, shipping_address: e.target.value })}
                    placeholder="Ex: Retirada no Balcão BH ou Endereço"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '12px', backgroundColor: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                  <input
                    type="checkbox"
                    id="neutral_packing_check"
                    checked={comandaForm.neutral_packing}
                    onChange={e => setComandaForm({ ...comandaForm, neutral_packing: e.target.checked })}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="neutral_packing_check" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-green-dark)', cursor: 'pointer' }}>
                    Embalagem Neutra (White-label p/ Revenda)
                  </label>
                </div>
              </div>

              {/* Totals & Financial Box */}
              <div style={{
                backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.1)',
                borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: '14px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>Custo Estimado dos Frascos</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>
                    R$ {comandaTotalCost.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>Lucro Bruto da Operação</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#166534' }}>
                    + R$ {comandaProfit.toFixed(2)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-muted)', textTransform: 'uppercase' }}>Valor Total da Comanda</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--snack-green-dark)' }}>
                    R$ {comandaTotal.toFixed(2)}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid rgba(41,69,31,0.08)',
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', backgroundColor: '#FFFFFF'
            }}>
              <button
                type="button"
                onClick={() => setIsComandaOpen(false)}
                style={{ padding: '11px 18px', borderRadius: '10px', border: '1px solid rgba(41,69,31,0.2)', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => handleSaveComanda(false)}
                style={{
                  padding: '11px 20px', borderRadius: '10px', border: 'none',
                  backgroundColor: '#FAF8F2', color: 'var(--snack-green-dark)', fontWeight: '700',
                  fontSize: '13px', cursor: 'pointer', border: '1px solid rgba(41,69,31,0.2)'
                }}
              >
                Salvar Comanda
              </button>

              <button
                type="button"
                onClick={() => handleSaveComanda(true)}
                style={{
                  padding: '11px 22px', borderRadius: '10px', border: 'none',
                  backgroundColor: '#25D366', color: '#FFFFFF', fontWeight: '800',
                  fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 15px rgba(37,211,102,0.3)'
                }}
              >
                <Send size={15} />
                <span>Salvar & Enviar no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CRIAR NOVO USUÁRIO                                 */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          backgroundColor: 'rgba(23, 43, 20, 0.55)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '520px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)', border: '1px solid rgba(41,69,31,0.12)'
          }}>
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid rgba(41,69,31,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF8F2'
            }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--snack-gold)' }}>
                  Cadastro do Sistema
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '17px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                  Criar Novo Usuário ou Revendedor
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <form onSubmit={handleCreateUser} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {addError && (
                <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                  {addError}
                </div>
              )}

              {/* Nível de Permissão Selector Cards */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '8px' }}>
                  Tipo de Conta / Nível de Acesso *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'revendedor', label: 'Revendedor VIP', badge: 'Atacado / White-label', bg: '#f3e8ff', color: '#6b21a8' },
                    { id: 'comprador', label: 'Cliente Varejo', badge: 'Consumidor Comum', bg: '#dcfce7', color: '#166534' },
                    { id: 'gerente', label: 'Gerente Operações', badge: 'Estoque & Separação', bg: '#fef3c7', color: '#92400e' },
                    { id: 'admin', label: 'Administrador', badge: 'Acesso Irrestrito', bg: '#dbeafe', color: '#1e40af' }
                  ].map(r => (
                    <div
                      key={r.id}
                      onClick={() => setNewUser({ ...newUser, role: r.id })}
                      style={{
                        padding: '10px 12px', borderRadius: '10px',
                        border: newUser.role === r.id ? `2px solid ${r.color}` : '1px solid rgba(41,69,31,0.12)',
                        backgroundColor: newUser.role === r.id ? r.bg : '#FAF8F2',
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '800', color: r.color }}>{r.label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--snack-muted)' }}>{r.badge}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo ou Amanda Revendedora"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>E-mail de Login *</label>
                <input
                  type="email"
                  required
                  placeholder="carlos@exemplo.com.br"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)' }}>Senha Provisória *</label>
                    <button
                      type="button"
                      onClick={() => setNewUser({ ...newUser, password: 'Snack' + Math.floor(1000 + Math.random() * 9000) + '!' })}
                      style={{ background: 'none', border: 'none', color: 'var(--snack-gold)', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}
                    >
                      Gerar Senha
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ex: revenda123"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>Telefone WhatsApp</label>
                  <input
                    type="text"
                    placeholder="31988887777"
                    value={newUser.phone}
                    onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Checkbox: Abrir comanda imediatamente */}
              <div style={{ backgroundColor: '#FAF8F2', padding: '12px', borderRadius: '10px', border: '1px solid rgba(41,69,31,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="openComandaImmediate"
                  checked={newUser.openComandaImmediately}
                  onChange={e => setNewUser({ ...newUser, openComandaImmediately: e.target.checked })}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="openComandaImmediate" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-green-dark)', cursor: 'pointer' }}>
                  🧾 Abrir comanda / pedido para este usuário imediatamente após criar
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', background: 'transparent', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px', borderRadius: '8px', border: 'none',
                    backgroundColor: 'var(--snack-green-dark)', color: '#fff', fontWeight: '800',
                    fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(23,43,20,0.2)'
                  }}
                >
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REDEFINIR SENHA                                    */}
      {/* ========================================================= */}
      {passwordModalUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          backgroundColor: 'rgba(23, 43, 20, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '420px',
            padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
              Redefinir Senha
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--snack-muted)' }}>
              Defina a nova senha de acesso para <strong>{passwordModalUser.name}</strong> ({passwordModalUser.email}).
            </p>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>Nova Senha</label>
                <input
                  type="text"
                  required
                  placeholder="Mínimo 4 caracteres..."
                  value={newPasswordVal}
                  onChange={e => setNewPasswordVal(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', background: 'none', cursor: 'pointer', fontSize: '12px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--snack-green-dark)', color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Salvar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INTEGRAÇÃO WHATSAPP COM TEMPLATES                  */}
      {/* ========================================================= */}
      {whatsAppModalUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          backgroundColor: 'rgba(23, 43, 20, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '480px',
            padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#16a34a' }}>
                  Integração WhatsApp
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                  Mensagens Rápidas para {whatsAppModalUser.name}
                </h3>
              </div>
              <button onClick={() => setWhatsAppModalUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--snack-muted)', marginBottom: '16px' }}>
              Envie mensagens automáticas formatadas diretamente para o número <strong>{whatsAppModalUser.phone || 'da loja'}</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Template 1: Boas-vindas */}
              <button
                type="button"
                onClick={() => {
                  const text = `Olá ${whatsAppModalUser.name}! Tudo bem? Seja muito bem-vindo(a) à Snack Store BH. Seu cadastro como ${roleColors[whatsAppModalUser.role]?.label} foi ativado! Você pode acessar seu portal exclusivo em https://snackstorebh.com.br/login com o e-mail: ${whatsAppModalUser.email}. Ficamos à disposição!`;
                  openWhatsApp(whatsAppModalUser.phone, text);
                  setWhatsAppModalUser(null);
                }}
                style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(41,69,31,0.12)', backgroundColor: '#FAF8F2', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>👋 Boas-vindas e Acesso ao Portal</div>
                  <div style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>Confirmação de cadastro com link do portal e e-mail</div>
                </div>
                <ArrowRight size={14} color="var(--snack-green-dark)" />
              </button>

              {/* Template 2: Catálogo de Revenda */}
              <button
                type="button"
                onClick={() => {
                  const text = `Olá ${whatsAppModalUser.name}! Aqui é da equipe Snack Store BH. Segue o link com nosso catálogo completo de perfumes Brand Collection e árabes com condições exclusivas de revenda e atacado: https://snackstorebh.com.br/atacado-revenda-perfumes/. Pedido mínimo a partir de apenas 10 unidades com até 120% de margem!`;
                  openWhatsApp(whatsAppModalUser.phone, text);
                  setWhatsAppModalUser(null);
                }}
                style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(41,69,31,0.12)', backgroundColor: '#FAF8F2', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>📦 Catálogo & Tabela de Atacado</div>
                  <div style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>Link de catálogo de 25ml, pedido mínimo e margens</div>
                </div>
                <ArrowRight size={14} color="var(--snack-green-dark)" />
              </button>

              {/* Template 3: Chave Pix */}
              <button
                type="button"
                onClick={() => {
                  const text = `Olá ${whatsAppModalUser.name}! Seguem nossos dados para pagamento via Pix:\n\n🔑 *Chave Pix (Telefone):* ${PIX_KEY}\n*Favorecido:* Snack Store BH\n\nPor gentileza, envie o comprovante por aqui assim que efetuar a transferência para liberarmos seu pedido imediatamente! ✨`;
                  openWhatsApp(whatsAppModalUser.phone, text);
                  setWhatsAppModalUser(null);
                }}
                style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(41,69,31,0.12)', backgroundColor: '#FAF8F2', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>💳 Enviar Chave Pix para Pagamento</div>
                  <div style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>Chave Pix oficial da loja BH com solicitação de comprovante</div>
                </div>
                <ArrowRight size={14} color="var(--snack-green-dark)" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER / MODAL: HISTÓRICO DE PEDIDOS DO USUÁRIO           */}
      {/* ========================================================= */}
      {ordersDrawerUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          backgroundColor: 'rgba(23, 43, 20, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '640px',
            maxHeight: '85vh', overflowY: 'auto', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(41,69,31,0.08)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--snack-gold)' }}>Histórico de Compras</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '17px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                  Pedidos de {ordersDrawerUser.name}
                </h3>
              </div>
              <button onClick={() => setOrdersDrawerUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>

            {(() => {
              const uOrders = orders.filter(o => o.customer_id === ordersDrawerUser.id || (o.customer_email && o.customer_email.toLowerCase() === ordersDrawerUser.email?.toLowerCase()));

              if (uOrders.length === 0) {
                return (
                  <div style={{ padding: '36px', textAlign: 'center', color: 'var(--snack-muted)', backgroundColor: '#FAF8F2', borderRadius: '12px' }}>
                    <p style={{ margin: '0 0 14px 0', fontSize: '13px' }}>Nenhum pedido registrado para este usuário ainda.</p>
                    <button
                      onClick={() => {
                        const target = ordersDrawerUser;
                        setOrdersDrawerUser(null);
                        openComandaModal(target);
                      }}
                      style={{ backgroundColor: 'var(--snack-green-dark)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Criar Primeira Comanda Agora
                    </button>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {uOrders.map(order => (
                    <div key={order.id} style={{ border: '1px solid rgba(41,69,31,0.1)', borderRadius: '12px', padding: '16px', backgroundColor: '#FAF8F2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '14px', color: 'var(--snack-green-dark)' }}>{order.order_number}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--snack-muted)', marginLeft: '8px' }}>
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                          R$ {order.total_amount?.toFixed(2)}
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--snack-text)', marginBottom: '8px' }}>
                        {order.items?.map((it, idx) => (
                          <div key={idx} style={{ color: 'var(--snack-muted)' }}>
                            • {it.quantity}x {it.name} ({it.volume || '25ml'})
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderTop: '1px solid rgba(41,69,31,0.06)', paddingTop: '8px' }}>
                        <span style={{ backgroundColor: order.status === 'pago' ? '#dcfce7' : '#fef3c7', color: order.status === 'pago' ? '#166534' : '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
                          {order.status}
                        </span>
                        <span style={{ color: 'var(--snack-muted)' }}>Pagamento: {order.payment_method || 'Pix'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
}
