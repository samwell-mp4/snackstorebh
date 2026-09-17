import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, MessageSquare, Check, Clock, Truck, CheckCircle2, 
  XCircle, Search, Eye, Printer, Phone, QrCode, Copy, CheckCheck, 
  Loader2, Edit3, Trash2, Plus, Minus, DollarSign, Tag, Save, X, 
  ArrowUpDown, Filter, AlertTriangle, ShieldCheck, MapPin, User, 
  ChevronDown, RefreshCw, Layers, Calendar, ArrowRight
} from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminOrders() {
  const { 
    orders, 
    products,
    updateOrder,
    deleteOrder,
    updateOrderStatus, 
    generateOrderPix 
  } = useStoreData();

  // Primary filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL'); // 'ALL' | 'revendedor' | 'varejo'
  const [modalityFilter, setModalityFilter] = useState('ALL'); // 'ALL' | 'expresso' | 'programado_7' | 'economico_15'
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'today' | '7d' | 'month'

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null); // For Comanda view/print
  const [editingOrder, setEditingOrder] = useState(null); // For full edit mode
  const [generatingPixId, setGeneratingPixId] = useState(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  // Helper for toast feedback
  const showFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(''), 3500);
  };

  // Status mapping
  const statusColors = {
    pendente: { bg: '#fef3c7', text: '#92400e', label: 'Pendente' },
    aguardando_pix: { bg: '#fef3c7', text: '#92400e', label: 'Aguardando Pix' },
    pago: { bg: '#dcfce7', text: '#166534', label: 'Pago' },
    revisao: { bg: '#ffedd5', text: '#c2410c', label: 'Em Revisão' },
    separacao: { bg: '#e0f2fe', text: '#0369a1', label: 'Em Separação' },
    enviado: { bg: '#f3e8ff', text: '#6b21a8', label: 'Enviado' },
    entregue: { bg: '#d1fae5', text: '#065f46', label: 'Entregue' },
    cancelado: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelado' }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const term = searchTerm.toLowerCase();
      const numMatch = (order.order_number?.toLowerCase() || '').includes(term);
      const nameMatch = (order.customer_name?.toLowerCase() || '').includes(term);
      const phoneMatch = (order.customer_phone || '').includes(term);
      const emailMatch = (order.customer_email?.toLowerCase() || '').includes(term);
      const addressMatch = (order.customer_address?.toLowerCase() || '').includes(term);
      const itemsMatch = (order.items || []).some(i => (i.name?.toLowerCase() || '').includes(term));

      const matchSearch = numMatch || nameMatch || phoneMatch || emailMatch || addressMatch || itemsMatch;
      const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;

      // Channel filter
      let matchChannel = true;
      const isResellerOrder = order.customer_name?.toLowerCase().includes('revendedor') || 
                              order.notes?.toLowerCase().includes('revend') ||
                              order.fulfillment_mode === 'multiple' ||
                              (Array.isArray(order.shipments) && order.shipments.length > 1);
      if (channelFilter === 'revendedor') matchChannel = isResellerOrder;
      if (channelFilter === 'varejo') matchChannel = !isResellerOrder;

      // Modality filter
      let matchModality = true;
      if (modalityFilter !== 'ALL') {
        const orderMod = (order.logistics_mode || '').toLowerCase();
        const hasItemMod = (order.items || []).some(i => (i.logistics_mode || i.logisticsMode || '').toLowerCase().includes(modalityFilter));
        const hasShipMod = (order.shipments || []).some(s => (s.logistics_mode || '').toLowerCase().includes(modalityFilter));
        matchModality = orderMod.includes(modalityFilter) || hasItemMod || hasShipMod;
      }

      // Date filter
      let matchDate = true;
      if (dateFilter !== 'ALL' && order.created_at) {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        if (dateFilter === 'today') {
          matchDate = orderDate.toDateString() === now.toDateString();
        } else if (dateFilter === '7d') {
          const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
          matchDate = diffDays <= 7;
        } else if (dateFilter === 'month') {
          matchDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        }
      }

      return matchSearch && matchStatus && matchChannel && matchModality && matchDate;
    });
  }, [orders, searchTerm, statusFilter, channelFilter, modalityFilter, dateFilter]);

  // Overall metrics calculation
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let pendingCount = 0;
    let inProgressCount = 0;

    orders.forEach(o => {
      const amt = parseFloat(o.total_amount || 0);
      if (o.status !== 'cancelado') {
        totalRevenue += amt;
      }
      if (o.status === 'pendente' || o.status === 'aguardando_pix') {
        pendingCount++;
      }
      if (o.status === 'separacao' || o.status === 'enviado') {
        inProgressCount++;
      }
    });

    return {
      totalOrders: orders.length,
      totalRevenue,
      pendingCount,
      inProgressCount
    };
  }, [orders]);

  // Quick status update
  const handleStatusChange = async (orderId, newStatus, orderNumber = null) => {
    try {
      const targetId = orderId || orderNumber;
      await updateOrderStatus(targetId, { status: newStatus, order_number: orderNumber });
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.order_number === orderNumber)) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      showFeedback(`Pedido atualizado para status "${statusColors[newStatus]?.label || newStatus}"!`);
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  // Pix generation
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
      showFeedback('Chave Pix oficial gerada com sucesso!');
    } catch (err) {
      alert('Erro ao gerar Pix: ' + (err.message || 'Verifique as credenciais do Mercado Pago'));
    } finally {
      setGeneratingPixId(null);
    }
  };

  // Copy Pix
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  // Delete Order
  const handleDeleteOrder = async (order) => {
    if (!window.confirm(`Tem certeza que deseja EXCLUIR permanentemente o pedido #${order.order_number}? Esta ação removerá também as remessas e transações associadas.`)) {
      return;
    }
    try {
      await deleteOrder(order.id);
      if (selectedOrder && selectedOrder.id === order.id) setSelectedOrder(null);
      if (editingOrder && editingOrder.id === order.id) setEditingOrder(null);
      showFeedback(`Pedido #${order.order_number} excluído com sucesso!`);
    } catch (err) {
      alert('Erro ao excluir pedido: ' + err.message);
    }
  };

  // Open WhatsApp notification
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
    if (order.status === 'entregue') statusText = 'foi entregue com sucesso';

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

  // Prepare full order edit modal
  const handleStartEdit = (order) => {
    const itemsCopy = (order.items || []).map(it => ({
      code: it.code || it.id || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      name: it.name || 'Produto',
      volume: it.volume || '25ml',
      quantity: parseInt(it.quantity, 10) || 1,
      price: parseFloat(it.price || 0),
      cost_price: parseFloat(it.cost_price || (it.price ? it.price * 0.45 : 20.0))
    }));

    setEditingOrder({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name || '',
      customer_phone: order.customer_phone || '',
      customer_email: order.customer_email || '',
      customer_address: order.customer_address || '',
      status: order.status || 'pendente',
      payment_method: order.payment_method || 'Pix',
      notes: order.notes || '',
      shipping_amount: parseFloat(order.shipping_amount || 0),
      discount_amount: parseFloat(order.discount_amount || 0),
      items: itemsCopy,
      selectedProductToAdd: ''
    });
  };

  // Add product to editing order
  const handleAddItemToEditingOrder = (productCode) => {
    if (!productCode) return;
    const prod = products.find(p => p.code === productCode);
    if (!prod) return;

    setEditingOrder(prev => {
      const existingIdx = prev.items.findIndex(i => i.code === prod.code);
      if (existingIdx !== -1) {
        const updated = [...prev.items];
        updated[existingIdx].quantity += 1;
        return { ...prev, items: updated, selectedProductToAdd: '' };
      }
      const newItem = {
        code: prod.code,
        name: prod.name,
        volume: prod.volume || '25ml',
        quantity: 1,
        price: parseFloat(prod.price || 0),
        cost_price: parseFloat(prod.cost_price || (prod.price * 0.45) || 20.0)
      };
      return { ...prev, items: [...prev.items, newItem], selectedProductToAdd: '' };
    });
  };

  // Save full order edit
  const handleSaveOrderEdit = async () => {
    if (!editingOrder) return;
    if (!editingOrder.customer_name.trim()) {
      alert('Nome do cliente é obrigatório.');
      return;
    }
    if (editingOrder.items.length === 0) {
      alert('O pedido deve conter pelo menos 1 item.');
      return;
    }

    const subtotalProducts = editingOrder.items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const totalCost = editingOrder.items.reduce((acc, it) => acc + (it.cost_price * it.quantity), 0);
    const shipping = parseFloat(editingOrder.shipping_amount || 0);
    const discount = parseFloat(editingOrder.discount_amount || 0);
    const calculatedTotal = Math.max(0, subtotalProducts + shipping - discount);

    const payload = {
      order_number: editingOrder.order_number,
      customer_name: editingOrder.customer_name,
      customer_phone: editingOrder.customer_phone,
      customer_email: editingOrder.customer_email,
      customer_address: editingOrder.customer_address,
      status: editingOrder.status,
      payment_method: editingOrder.payment_method,
      notes: editingOrder.notes,
      items: editingOrder.items,
      shipping_amount: shipping,
      discount_amount: discount,
      total_amount: Math.round(calculatedTotal * 100) / 100,
      cost_amount: Math.round(totalCost * 100) / 100
    };

    try {
      const targetId = editingOrder.id || editingOrder.order_number;
      const updated = await updateOrder(targetId, payload);
      showFeedback(`Pedido #${editingOrder.order_number} atualizado com sucesso!`);
      if (selectedOrder && (selectedOrder.id === editingOrder.id || selectedOrder.order_number === editingOrder.order_number)) {
        setSelectedOrder(prev => ({ ...prev, ...payload, ...(updated || {}) }));
      }
      setEditingOrder(null);
    } catch (err) {
      alert('Erro ao salvar alterações do pedido: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Top Banner & Title */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px 26px',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)' }}>
            Painel Operacional do Administrador
          </span>
          <h2 style={{ margin: '3px 0 0 0', fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
            Central de Pedidos & Vendas
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--snack-muted)' }}>
            Gerenciamento completo de comandas, vendas de balcão, pedidos online e encomendas com dropshipping neutro
          </p>
        </div>
      </div>

      {actionFeedback && (
        <div style={{
          backgroundColor: '#dcfce7', color: '#166534', padding: '12px 18px',
          borderRadius: '10px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <CheckCircle2 size={18} /> {actionFeedback}
        </div>
      )}

      {/* KPI Cards Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.08)' }}>
          <span style={{ fontSize: '11px', color: 'var(--snack-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Total de Pedidos</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--snack-green-dark)', marginTop: '4px' }}>
            {metrics.totalOrders}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.08)' }}>
          <span style={{ fontSize: '11px', color: 'var(--snack-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Faturamento Bruto</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#166534', marginTop: '4px' }}>
            R$ {metrics.totalRevenue.toFixed(2)}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.08)' }}>
          <span style={{ fontSize: '11px', color: 'var(--snack-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Aguardando Pagamento</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#92400e', marginTop: '4px' }}>
            {metrics.pendingCount}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.08)' }}>
          <span style={{ fontSize: '11px', color: 'var(--snack-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Em Expedição / Trânsito</span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0369a1', marginTop: '4px' }}>
            {metrics.inProgressCount}
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '16px 20px',
        border: '1px solid rgba(41,69,31,0.08)', display: 'flex', flexWrap: 'wrap', gap: '12px',
        alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por nº, cliente, fone, endereço ou fragrância..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px',
              border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', outline: 'none',
              backgroundColor: '#FAF8F2'
            }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2', fontWeight: '600' }}
        >
          <option value="ALL">Todos os Status</option>
          <option value="pendente">Pendente / Aguardando</option>
          <option value="pago">Pago</option>
          <option value="revisao">Em Revisão</option>
          <option value="separacao">Em Separação</option>
          <option value="enviado">Enviado</option>
          <option value="entregue">Entregue</option>
          <option value="cancelado">Cancelado</option>
        </select>

        {/* Channel Filter */}
        <select
          value={channelFilter}
          onChange={e => setChannelFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2', fontWeight: '600' }}
        >
          <option value="ALL">Todos os Canais</option>
          <option value="revendedor">Revendedor VIP</option>
          <option value="varejo">Varejo / Loja</option>
        </select>

        {/* Modality Filter */}
        <select
          value={modalityFilter}
          onChange={e => setModalityFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2', fontWeight: '600' }}
        >
          <option value="ALL">Todas as Modalidades</option>
          <option value="expresso">⚡ Expresso BH (1-6h)</option>
          <option value="programado_7">📦 Programado (7d)</option>
          <option value="economico_15">💰 Econômico (15d)</option>
        </select>

        {/* Date Filter */}
        <select
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2', fontWeight: '600' }}
        >
          <option value="ALL">Todas as Datas</option>
          <option value="today">Hoje</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="month">Este Mês</option>
        </select>
      </div>

      {/* ORDERS TABLE */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(41,69,31,0.08)',
        overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div className="responsive-table-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(41,69,31,0.08)', color: 'var(--snack-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 18px' }}>Pedido / Tipo</th>
                <th style={{ padding: '14px 12px' }}>Data</th>
                <th style={{ padding: '14px 12px' }}>Cliente / Destino</th>
                <th style={{ padding: '14px 12px' }}>Fragrâncias</th>
                <th style={{ padding: '14px 12px' }}>Total</th>
                <th style={{ padding: '14px 12px' }}>Pagamento / Pix</th>
                <th style={{ padding: '14px 12px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 18px', textAlign: 'center', color: 'var(--snack-muted)' }}>
                    Nenhum pedido encontrado com os filtros selecionados.
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
                    <tr 
                      key={order.id} 
                      style={{ borderBottom: '1px solid rgba(41,69,31,0.05)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF8F2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      
                      {/* Order number */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--snack-green-dark)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>#{order.order_number}</span>
                          {isMulti && (
                            <span style={{ fontSize: '9px', backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '2px 5px', borderRadius: '4px', fontWeight: '700' }}>
                              Multi ({order.shipments?.length || order.recipient_count || 2}x)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '2px' }}>
                          {order.payment_method || 'Pix'}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 12px', color: 'var(--snack-muted)', fontSize: '11px' }}>
                        {dateFormatted}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--snack-text)', fontSize: '13px' }}>
                          {order.customer_name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Phone size={11} /> {order.customer_phone || 'Não informado'}
                        </div>
                      </td>

                      {/* Items */}
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                          {itemsCount} frasco(s)
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                          {(order.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                      </td>

                      {/* Total */}
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--snack-green-dark)', fontSize: '14px' }}>
                          R$ {parseFloat(order.total_amount || 0).toFixed(2)}
                        </div>
                        {order.cost_amount > 0 && (
                          <div style={{ fontSize: '10px', color: 'var(--snack-muted)' }}>
                            Custo: R$ {parseFloat(order.cost_amount).toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Payment / Pix */}
                      <td style={{ padding: '14px 12px' }}>
                        {order.pix_code ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '10px', padding: '3px 7px', borderRadius: '4px',
                            backgroundColor: order.status === 'pago' ? '#DCFCE7' : '#FEF3C7',
                            color: order.status === 'pago' ? '#166534' : '#92400E', fontWeight: '700'
                          }}>
                            <QrCode size={11} /> {order.status === 'pago' ? 'Pix Aprovado' : 'Pix Gerado'}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleGeneratePix(order)}
                            disabled={generatingPixId === order.id}
                            style={{
                              fontSize: '10px', padding: '3px 8px', borderRadius: '5px',
                              backgroundColor: '#E0F2FE', color: '#0369A1', border: 'none',
                              cursor: 'pointer', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            {generatingPixId === order.id ? <Loader2 size={10} className="animate-spin" /> : <QrCode size={10} />}
                            Gerar Pix MP
                          </button>
                        )}
                      </td>

                      {/* Status select */}
                      <td style={{ padding: '14px 12px' }}>
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id || order.order_number, e.target.value, order.order_number)}
                          style={{
                            padding: '5px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '700',
                            border: 'none', backgroundColor: s.bg, color: s.text, cursor: 'pointer', outline: 'none'
                          }}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="aguardando_pix">Aguardando Pix</option>
                          <option value="pago">Pago</option>
                          <option value="revisao">Em Revisão</option>
                          <option value="separacao">Em Separação</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregue">Entregue</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            title="Ver Comanda Completa de Expedição"
                            style={{
                              backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', border: 'none',
                              padding: '7px 11px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontSize: '11px', fontWeight: '700'
                            }}
                          >
                            <Eye size={13} />
                            <span>Comanda</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(order)}
                            title="Editar Pedido Integralmente (Itens, Preço Venda, Custo, Desconto)"
                            style={{
                              backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.2)',
                              padding: '7px 9px', borderRadius: '6px', cursor: 'pointer', color: 'var(--snack-green-dark)'
                            }}
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenWhatsApp(order)}
                            title="Notificar no WhatsApp"
                            style={{
                              backgroundColor: '#25D366', color: '#FFFFFF', border: 'none',
                              padding: '7px 9px', borderRadius: '6px', cursor: 'pointer'
                            }}
                          >
                            <MessageSquare size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order)}
                            title="Excluir Pedido"
                            style={{
                              backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5',
                              padding: '7px 9px', borderRadius: '6px', cursor: 'pointer'
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

      {/* =========================================================================
          MODAL 1: COMANDA COMPLETA (VISUALIZAÇÃO & IMPRESSÃO PROFISSIONAL)
         ========================================================================= */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          backgroundColor: 'rgba(23, 43, 20, 0.55)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '720px',
            maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            border: '1px solid rgba(41,69,31,0.12)'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(41,69,31,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF8F2'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)' }}>
                  Comanda Oficial de Expedição & Venda
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
                  Pedido #{selectedOrder.order_number}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleStartEdit(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  style={{
                    backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.2)', padding: '6px 12px',
                    borderRadius: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--snack-green-dark)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Edit3 size={13} /> Editar Pedido
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-muted)', padding: '6px', fontSize: '18px' }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Customer summary */}
              <div style={{ backgroundColor: '#FAF8F2', padding: '16px', borderRadius: '12px', border: '1px solid rgba(41,69,31,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--snack-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Dados do Comprador</span>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--snack-green-dark)', marginTop: '2px' }}>
                      {selectedOrder.customer_name}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '800',
                    backgroundColor: statusColors[selectedOrder.status]?.bg || '#FEF3C7',
                    color: statusColors[selectedOrder.status]?.text || '#92400E'
                  }}>
                    {statusColors[selectedOrder.status]?.label || selectedOrder.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '10px', fontSize: '12px', color: 'var(--snack-text)' }}>
                  <div>📱 <strong>WhatsApp:</strong> {selectedOrder.customer_phone || 'Não informado'}</div>
                  {selectedOrder.customer_email && <div>✉️ <strong>E-mail:</strong> {selectedOrder.customer_email}</div>}
                  <div style={{ gridColumn: '1 / -1' }}>📍 <strong>Endereço Principal:</strong> {selectedOrder.customer_address || 'Balcão / Retirada'}</div>
                </div>

                {selectedOrder.notes && (
                  <div style={{ fontSize: '12px', color: 'var(--snack-text)', marginTop: '10px', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <strong>Observações:</strong> {selectedOrder.notes}
                  </div>
                )}
              </div>

              {/* Multi-recipient shipments if present (Dropshipping Neutro) */}
              {Array.isArray(selectedOrder.shipments) && selectedOrder.shipments.length > 0 && (
                <div style={{ backgroundColor: '#EDE9FE', border: '1px solid #DDD6FE', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#5B21B6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={16} /> Entregas Múltiplas Dropshipping ({selectedOrder.shipments.length} Pacotes Distintos)
                    </h4>
                    <span style={{ fontSize: '10px', backgroundColor: '#DDD6FE', color: '#4C1D95', padding: '2px 8px', borderRadius: '99px', fontWeight: '800' }}>
                      Embalagem Neutra
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedOrder.shipments.map((shp, idx) => (
                      <div key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', padding: '12px 14px', border: '1px solid #C4B5FD' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: '800', fontSize: '13px', color: '#4C1D95' }}>
                            {idx + 1}. {shp.recipient_name || `Destinatário #${idx + 1}`}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#6D28D9' }}>
                            Frete: R$ {parseFloat(shp.shipping_fee || 14.90).toFixed(2)}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#4B5563', marginTop: '4px' }}>
                          📍 {shp.recipient_address || 'Endereço não cadastrado'}
                        </div>
                        {shp.recipient_phone && (
                          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                            📱 {shp.recipient_phone}
                          </div>
                        )}
                        {Array.isArray(shp.items) && (
                          <div style={{ marginTop: '6px', fontSize: '11px', color: '#374151', borderTop: '1px dashed #E5E7EB', paddingTop: '6px' }}>
                            <strong>Fragrâncias deste pacote: </strong>
                            {shp.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Table in Comanda */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--snack-green-dark)', margin: '0 0 8px 0' }}>
                  Fragrâncias do Pedido:
                </h4>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '10px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '8px 12px' }}>Produto</th>
                        <th style={{ padding: '8px 8px', textAlign: 'center' }}>Qtd</th>
                        <th style={{ padding: '8px 8px', textAlign: 'right' }}>Preço Venda</th>
                        <th style={{ padding: '8px 8px', textAlign: 'right' }}>Preço Custo</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).map((item, idx) => {
                        const qty = parseInt(item.quantity, 10) || 1;
                        const price = parseFloat(item.price || 0);
                        const cost = parseFloat(item.cost_price || (price * 0.45));
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '10px 12px', fontWeight: '600' }}>
                              {item.name} <span style={{ color: '#94A3B8', fontSize: '11px' }}>({item.volume || '25ml'})</span>
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '700' }}>
                              {qty}x
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                              R$ {price.toFixed(2)}
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'right', color: '#64748B' }}>
                              R$ {cost.toFixed(2)}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                              R$ {(price * qty).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div style={{ backgroundColor: '#FAF8F2', borderRadius: '12px', padding: '16px', border: '1px solid rgba(41,69,31,0.08)' }}>
                {(() => {
                  const subtotal = (selectedOrder.items || []).reduce((acc, it) => acc + ((parseFloat(it.price) || 0) * (parseInt(it.quantity, 10) || 1)), 0);
                  const totalCost = (selectedOrder.items || []).reduce((acc, it) => acc + ((parseFloat(it.cost_price) || ((parseFloat(it.price) || 0) * 0.45)) * (parseInt(it.quantity, 10) || 1)), 0);
                  const shipping = parseFloat(selectedOrder.shipping_amount || 0);
                  const discount = parseFloat(selectedOrder.discount_amount || 0);
                  const total = parseFloat(selectedOrder.total_amount || (subtotal + shipping - discount));
                  const grossProfit = total - totalCost - shipping;
                  const marginPct = total > 0 ? ((grossProfit / total) * 100).toFixed(1) : 0;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                        <span>Subtotal dos Produtos:</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      {shipping > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                          <span>Frete Total de Entrega:</span>
                          <span>+ R$ {shipping.toFixed(2)}</span>
                        </div>
                      )}
                      {discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: '700' }}>
                          <span>Desconto Aplicado:</span>
                          <span>- R$ {discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', borderTop: '1px dashed #CBD5E1', paddingTop: '6px' }}>
                        <span>Custo Total dos Produtos:</span>
                        <span>R$ {totalCost.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0369A1', fontWeight: '700' }}>
                        <span>Lucro Bruto Estimado:</span>
                        <span>R$ {grossProfit.toFixed(2)} ({marginPct}%)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '900', color: 'var(--snack-green-dark)', borderTop: '1px solid #CBD5E1', paddingTop: '8px' }}>
                        <span>VALOR TOTAL:</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Mercado Pago Pix Box */}
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QrCode size={18} style={{ color: '#166534' }} />
                    <span style={{ fontWeight: '800', fontSize: '13px', color: '#166534' }}>
                      Cobrança Mercado Pago (Pix)
                    </span>
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '99px',
                    backgroundColor: selectedOrder.status === 'pago' ? '#DCFCE7' : '#FEF3C7',
                    color: selectedOrder.status === 'pago' ? '#166534' : '#92400E'
                  }}>
                    {selectedOrder.status === 'pago' ? 'PAGAMENTO APROVADO' : 'AGUARDANDO PIX'}
                  </span>
                </div>

                {selectedOrder.pix_code ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedOrder.pix_qr_code_base64 && (
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <img
                          src={`data:image/png;base64,${selectedOrder.pix_qr_code_base64}`}
                          alt="Pix QR Code"
                          style={{ width: '150px', height: '150px', margin: '0 auto', display: 'block', borderRadius: '8px', border: '1px solid #E2E8F0' }}
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
                        type="button"
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
                      Gerar chave Pix oficial do Mercado Pago para este pedido:
                    </span>
                    <button
                      type="button"
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

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    flex: '1 1 180px', backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', padding: '12px',
                    borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Printer size={16} /> Imprimir Comanda
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp(selectedOrder)}
                  style={{
                    flex: '1 1 180px', backgroundColor: '#25D366', color: '#FFFFFF', padding: '12px',
                    borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <MessageSquare size={16} /> Enviar no WhatsApp
                </button>

                {(selectedOrder.status === 'pendente' || selectedOrder.status === 'aguardando_pix') && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, 'cancelado')}
                    style={{
                      backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '12px 16px',
                      borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer'
                    }}
                  >
                    Cancelar Pedido
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIÇÃO INTEGRAL DO PEDIDO (ADMIN FULL CONTROL)
         ========================================================================= */}
      {editingOrder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1250,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '780px',
            maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '1px solid #CBD5E1'
          }}>
            {/* Header */}
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid #E2E8F0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', color: '#FFFFFF'
            }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#38BDF8' }}>
                  Modo de Edição Administrativa
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontFamily: 'var(--font-display)', color: '#FFFFFF' }}>
                  Editar Pedido #{editingOrder.order_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '20px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Customer fields */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>
                  1. Dados do Cliente / Destinatário
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      Nome do Cliente:
                    </label>
                    <input
                      type="text"
                      value={editingOrder.customer_name}
                      onChange={e => setEditingOrder({ ...editingOrder, customer_name: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      WhatsApp / Telefone:
                    </label>
                    <input
                      type="text"
                      value={editingOrder.customer_phone}
                      onChange={e => setEditingOrder({ ...editingOrder, customer_phone: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      E-mail:
                    </label>
                    <input
                      type="email"
                      value={editingOrder.customer_email}
                      onChange={e => setEditingOrder({ ...editingOrder, customer_email: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      Endereço de Entrega:
                    </label>
                    <input
                      type="text"
                      value={editingOrder.customer_address}
                      onChange={e => setEditingOrder({ ...editingOrder, customer_address: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      Status do Pedido:
                    </label>
                    <select
                      value={editingOrder.status}
                      onChange={e => setEditingOrder({ ...editingOrder, status: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '600' }}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="aguardando_pix">Aguardando Pix</option>
                      <option value="pago">Pago</option>
                      <option value="revisao">Em Revisão</option>
                      <option value="separacao">Em Separação</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      Forma de Pagamento:
                    </label>
                    <select
                      value={editingOrder.payment_method}
                      onChange={e => setEditingOrder({ ...editingOrder, payment_method: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '600' }}
                    >
                      <option value="Pix">Pix (Mercado Pago)</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Dinheiro / Balcão">Dinheiro / Balcão</option>
                      <option value="A Prazo">A Prazo</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      Observações:
                    </label>
                    <textarea
                      rows={2}
                      value={editingOrder.notes}
                      onChange={e => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Items Management */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    2. Itens, Quantidades e Preços (Venda & Custo)
                  </h4>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Altere o preço de venda para aplicar descontos ou reajustes
                  </span>
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '8px 12px' }}>Produto</th>
                        <th style={{ padding: '8px 8px', width: '100px', textAlign: 'center' }}>Qtd</th>
                        <th style={{ padding: '8px 8px', width: '110px' }}>Preço Venda (R$)</th>
                        <th style={{ padding: '8px 8px', width: '110px' }}>Preço Custo (R$)</th>
                        <th style={{ padding: '8px 8px', textAlign: 'right', width: '90px' }}>Subtotal</th>
                        <th style={{ padding: '8px 8px', width: '40px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingOrder.items.map((it, idx) => {
                        const subtotal = (parseFloat(it.price) || 0) * (parseInt(it.quantity, 10) || 1);
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ fontWeight: '700', color: '#0F172A' }}>{it.name}</div>
                              <div style={{ fontSize: '10px', color: '#94A3B8' }}>SKU: {it.code}</div>
                            </td>

                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...editingOrder.items];
                                    if (updated[idx].quantity > 1) {
                                      updated[idx].quantity -= 1;
                                      setEditingOrder({ ...editingOrder, items: updated });
                                    }
                                  }}
                                  style={{ width: '22px', height: '22px', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  -
                                </button>
                                <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{it.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...editingOrder.items];
                                    updated[idx].quantity += 1;
                                    setEditingOrder({ ...editingOrder, items: updated });
                                  }}
                                  style={{ width: '22px', height: '22px', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td style={{ padding: '10px 8px' }}>
                              <input
                                type="number"
                                step="0.10"
                                value={it.price}
                                onChange={e => {
                                  const updated = [...editingOrder.items];
                                  updated[idx].price = parseFloat(e.target.value) || 0;
                                  setEditingOrder({ ...editingOrder, items: updated });
                                }}
                                style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '700' }}
                              />
                            </td>

                            <td style={{ padding: '10px 8px' }}>
                              <input
                                type="number"
                                step="0.10"
                                value={it.cost_price}
                                onChange={e => {
                                  const updated = [...editingOrder.items];
                                  updated[idx].cost_price = parseFloat(e.target.value) || 0;
                                  setEditingOrder({ ...editingOrder, items: updated });
                                }}
                                style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#64748B' }}
                              />
                            </td>

                            <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                              R$ {subtotal.toFixed(2)}
                            </td>

                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = editingOrder.items.filter((_, i) => i !== idx);
                                  setEditingOrder({ ...editingOrder, items: updated });
                                }}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                title="Remover item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add product dropdown */}
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={editingOrder.selectedProductToAdd || ''}
                    onChange={e => setEditingOrder({ ...editingOrder, selectedProductToAdd: e.target.value })}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                  >
                    <option value="">Selecionar fragrância do catálogo para adicionar...</option>
                    {products.map(p => (
                      <option key={p.code} value={p.code}>
                        {p.name} ({p.brand || 'Brand Collection'}) - R$ {parseFloat(p.price || 0).toFixed(2)} (Estoque: {p.stock || 0})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddItemToEditingOrder(editingOrder.selectedProductToAdd)}
                    disabled={!editingOrder.selectedProductToAdd}
                    style={{
                      backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none', padding: '8px 16px',
                      borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Plus size={14} /> Adicionar
                  </button>
                </div>
              </div>

              {/* Adjustments & Financial Totals */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>
                  3. Ajuste de Frete, Desconto Geral e Fechamento
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      Valor do Frete (R$):
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={editingOrder.shipping_amount}
                      onChange={e => setEditingOrder({ ...editingOrder, shipping_amount: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                      Desconto Geral (R$):
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={editingOrder.discount_amount}
                      onChange={e => setEditingOrder({ ...editingOrder, discount_amount: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', color: '#166534' }}
                    />
                  </div>

                  {/* Calculated summary */}
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
                    {(() => {
                      const sub = editingOrder.items.reduce((acc, it) => acc + ((parseFloat(it.price) || 0) * (parseInt(it.quantity, 10) || 1)), 0);
                      const cost = editingOrder.items.reduce((acc, it) => acc + ((parseFloat(it.cost_price) || 0) * (parseInt(it.quantity, 10) || 1)), 0);
                      const ship = parseFloat(editingOrder.shipping_amount || 0);
                      const disc = parseFloat(editingOrder.discount_amount || 0);
                      const totalFinal = Math.max(0, sub + ship - disc);
                      const profit = totalFinal - cost - ship;

                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              Subtotal Produtos: <strong>R$ {sub.toFixed(2)}</strong> • Custo Total: <strong>R$ {cost.toFixed(2)}</strong>
                            </div>
                            <div style={{ fontSize: '12px', color: '#0369A1', fontWeight: '700', marginTop: '2px' }}>
                              Lucro Bruto Estimado: R$ {profit.toFixed(2)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>Novo Total a Pagar:</span>
                            <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--snack-green-dark)' }}>
                              R$ {totalFinal.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  style={{
                    padding: '10px 18px', borderRadius: '8px', border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF', color: '#475569', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveOrderEdit}
                  style={{
                    padding: '10px 24px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#166534', color: '#FFFFFF', fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(22,101,52,0.25)'
                  }}
                >
                  <Save size={16} /> Salvar Alterações no Pedido
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
