import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Truck, 
  User, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Package, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag,
  ExternalLink,
  AlertTriangle,
  Send
} from 'lucide-react';

export default function ResellerNewOrderModal({ 
  isOpen, 
  onClose, 
  products = [], 
  recipients = [], 
  saveRecipient, 
  createOrder, 
  currentUser,
  minDirectDeliveryUnits = 5,
  initialSelectedItems = [],
  onOrderSuccess
}) {
  if (!isOpen) return null;

  // Search products
  const [productSearch, setProductSearch] = useState('');
  
  // Selected order items: Array of { product, quantity, modality, price }
  const [orderItems, setOrderItems] = useState(() => {
    if (initialSelectedItems && initialSelectedItems.length > 0) {
      return initialSelectedItems.map(item => ({
        product: item,
        quantity: item.initialQuantity || 1,
        modality: item.has_expresso ? 'expresso' : (item.has_prog7 ? 'programado_7' : 'economico_15'),
        price: item.wholesale_price || (Math.round((parseFloat(item.price || 79.9) * 0.72) * 10) / 10)
      }));
    }
    return [];
  });

  // Delivery destination mode: 'self' | 'direct_customer'
  const [deliveryType, setDeliveryType] = useState('self');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  
  // New inline recipient form
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Belo Horizonte',
    state: 'MG'
  });

  // Order logistics option: 'expresso' | 'programado_7' | 'economico_15' | 'custom'
  const [orderShippingMode, setOrderShippingMode] = useState('expresso');
  const [shippingCost, setShippingCost] = useState(14.90);
  const [orderNotes, setOrderNotes] = useState('');
  const [neutralPackaging, setNeutralPackaging] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrderResult, setCreatedOrderResult] = useState(null);

  // Helper formatting
  const formatCurrency = (val) => {
    return (parseFloat(val) || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Safe wholesale price computation
  const getProductWholesalePrice = (p, modality = 'expresso') => {
    const retail = parseFloat(p.price) || 79.90;
    const rawWholesale = parseFloat(p.wholesale_price);
    const baseWholesale = (!isNaN(rawWholesale) && rawWholesale > 0) 
      ? rawWholesale 
      : Math.round(retail * 0.72 * 10) / 10;

    if (modality === 'programado_7') {
      const rawP7 = p.wholesale_prog7 || (p.logistics_config?.programado_7?.price ? parseFloat(p.logistics_config.programado_7.price) * 0.72 : baseWholesale * 0.90);
      return Math.round(rawP7 * 10) / 10;
    }
    if (modality === 'economico_15') {
      const rawE15 = p.wholesale_econ15 || (p.logistics_config?.economico_15?.price ? parseFloat(p.logistics_config.economico_15.price) * 0.72 : baseWholesale * 0.82);
      return Math.round(rawE15 * 10) / 10;
    }
    return baseWholesale;
  };

  // Add product to order
  const handleAddProduct = (prod) => {
    setOrderItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.code === prod.code);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      const initialMod = prod.stock > 0 ? 'expresso' : (prod.logistics_config?.programado_7?.active !== false ? 'programado_7' : 'economico_15');
      const unitPrice = getProductWholesalePrice(prod, initialMod);
      return [...prev, {
        product: prod,
        quantity: 1,
        modality: initialMod,
        price: unitPrice
      }];
    });
  };

  // Update item quantity
  const handleUpdateQuantity = (code, delta) => {
    setOrderItems(prev => {
      return prev.map(item => {
        if (item.product.code === code) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  // Update item modality
  const handleUpdateModality = (code, newModality) => {
    setOrderItems(prev => {
      return prev.map(item => {
        if (item.product.code === code) {
          const newPrice = getProductWholesalePrice(item.product, newModality);
          return {
            ...item,
            modality: newModality,
            price: newPrice
          };
        }
        return item;
      });
    });
  };

  // Remove item
  const handleRemoveItem = (code) => {
    setOrderItems(prev => prev.filter(item => item.product.code !== code));
  };

  // Totals calculations
  const totalUnits = orderItems.reduce((acc, it) => acc + it.quantity, 0);
  const subtotalWholesale = orderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const totalRetailSuggested = orderItems.reduce((acc, it) => {
    const retail = parseFloat(it.product.price) || 79.90;
    return acc + (retail * it.quantity);
  }, 0);
  const totalEstimatedProfit = Math.max(0, totalRetailSuggested - subtotalWholesale);
  const finalOrderTotal = subtotalWholesale + (parseFloat(shippingCost) || 0);

  // Eligible for direct customer shipping
  const isDirectDeliveryEligible = totalUnits >= minDirectDeliveryUnits;

  // Filtered product candidates for search
  const filteredProductCandidates = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 10);
    const q = productSearch.toLowerCase();
    return products.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [products, productSearch]);

  // Handle Save New Recipient
  const handleSaveRecipientInline = async (e) => {
    e.preventDefault();
    if (!newRecipient.name || !newRecipient.city) {
      alert('Preencha ao menos o Nome e Cidade do cliente.');
      return;
    }
    try {
      if (saveRecipient) {
        const saved = await saveRecipient({
          ...newRecipient,
          owner_user_id: currentUser?.id,
          created_at: new Date().toISOString()
        });
        if (saved && saved.id) {
          setSelectedRecipientId(saved.id.toString());
        }
      }
      setIsAddingRecipient(false);
      alert('Cliente cadastrado com sucesso!');
    } catch (err) {
      console.warn('Erro ao salvar destinatário:', err);
    }
  };

  // Handle Final Submit Order
  const handleConfirmOrder = async () => {
    if (orderItems.length === 0) {
      alert('Adicione ao menos um produto ao pedido.');
      return;
    }

    if (deliveryType === 'direct_customer' && !selectedRecipientId && !isAddingRecipient) {
      alert('Selecione ou cadastre o cliente destinatário para entrega direta.');
      return;
    }

    setIsSubmitting(true);
    try {
      const recipientObj = recipients.find(r => r.id.toString() === selectedRecipientId?.toString());
      const orderNumber = `AT-${Date.now().toString().slice(-5)}`;
      
      const payload = {
        order_number: orderNumber,
        customer_id: currentUser?.id,
        customer_name: deliveryType === 'direct_customer' ? (recipientObj?.name || 'Cliente Final') : (currentUser?.name || 'Revendedor VIP'),
        customer_email: currentUser?.email || 'revenda@snackstorebh.com.br',
        customer_phone: currentUser?.phone || '553175650503',
        status: 'pendente',
        payment_status: 'aguardando_pix',
        total_amount: Math.round(finalOrderTotal * 100) / 100,
        subtotal: Math.round(subtotalWholesale * 100) / 100,
        shipping_fee: parseFloat(shippingCost) || 0,
        fulfillment_mode: deliveryType === 'direct_customer' ? 'direct_customer' : 'single',
        recipient_info: deliveryType === 'direct_customer' ? recipientObj : null,
        neutral_packaging: neutralPackaging,
        notes: orderNotes,
        created_at: new Date().toISOString(),
        items: orderItems.map(it => ({
          code: it.product.code,
          name: it.product.name,
          brand: it.product.brand,
          image: it.product.image,
          quantity: it.quantity,
          price: it.price,
          unit_wholesale: it.price,
          unit_retail: parseFloat(it.product.price) || 79.90,
          logistics_mode: it.modality,
          lead_time: it.modality === 'expresso' ? '1 a 6 horas' : (it.modality === 'programado_7' ? 'Até 7 dias úteis' : 'Até 15 dias úteis')
        }))
      };

      let created = null;
      if (createOrder) {
        created = await createOrder(payload);
      }

      setCreatedOrderResult(created || payload);
      if (onOrderSuccess) onOrderSuccess();
    } catch (err) {
      console.error('Erro ao registrar pedido:', err);
      alert('Houve um erro ao processar seu pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp link generator
  const getWhatsAppMessageUrl = () => {
    if (!createdOrderResult) return '#';
    const num = createdOrderResult.order_number;
    const recipient = createdOrderResult.recipient_info;

    let text = `👑 *NOVO PEDIDO NO ATACADO - SNACK STORE BH*\n`;
    text += `*Número do Pedido:* #${num}\n`;
    text += `*Revendedor:* ${currentUser?.name || 'Revendedor VIP'} (${currentUser?.email || ''})\n\n`;
    text += `📦 *ITENS DO PEDIDO (${totalUnits} un):*\n`;
    
    orderItems.forEach((it, idx) => {
      text += `${idx + 1}. ${it.quantity}x ${it.product.name} [${it.modality === 'expresso' ? '⚡ Expresso' : it.modality === 'programado_7' ? '📦 7 dias' : '💰 15 dias'}] - ${formatCurrency(it.price * it.quantity)}\n`;
    });

    text += `\n💰 *Subtotal Atacado:* ${formatCurrency(subtotalWholesale)}`;
    text += `\n🚚 *Frete:* ${formatCurrency(shippingCost)} (${orderShippingMode === 'expresso' ? '⚡ Expresso BH 1-6h' : orderShippingMode === 'programado_7' ? '📦 7 dias' : '💰 15 dias'})`;
    text += `\n🔥 *TOTAL DO PEDIDO:* ${formatCurrency(finalOrderTotal)}\n`;
    text += `📈 *Lucro Estimado do Revendedor:* ${formatCurrency(totalEstimatedProfit)}\n\n`;

    if (deliveryType === 'direct_customer' && recipient) {
      text += `🎯 *ENTREGA DIRETA PARA CLIENTE (DROPSHIPPING NEUTRO):*\n`;
      text += `*Destinatário:* ${recipient.name}\n`;
      text += `*Telefone:* ${recipient.phone || 'Não informado'}\n`;
      text += `*Endereço:* ${recipient.address}, ${recipient.number || 'S/N'}\n`;
      if (recipient.complement) text += `*Complemento:* ${recipient.complement}\n`;
      text += `*Bairro/Cidade:* ${recipient.neighborhood || ''} - ${recipient.city}/${recipient.state}\n`;
      text += `*CEP:* ${recipient.cep}\n`;
      text += `*Embalagem Neutra:* ${neutralPackaging ? 'SIM (Sem valores ou logomarca Snack)' : 'Padrão'}\n\n`;
    } else {
      text += `🏠 *Entrega:* Para o endereço cadastrado do revendedor\n\n`;
    }

    if (orderNotes) {
      text += `📝 *Observações:* ${orderNotes}\n\n`;
    }

    text += `Aguardando confirmação e chave Pix para faturamento! 🚀`;
    return `https://wa.me/553175650503?text=${encodeURIComponent(text)}`;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden'
      }}>
        
        {/* MODAL HEADER */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0F172A',
          color: '#FFFFFF'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', backgroundColor: '#166534', color: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>
                Atacado VIP
              </span>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>Snack Store BH</span>
            </div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>
              Novo Pedido de Revenda
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SUCESSO DO PEDIDO */}
          {createdOrderResult ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                backgroundColor: '#DCFCE7',
                color: '#166534',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <CheckCircle2 size={40} />
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                Pedido #{createdOrderResult.order_number} Criado com Sucesso!
              </h3>
              <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '520px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                Seu pedido foi registrado no sistema. Agora, clique no botão abaixo para enviar o resumo completo diretamente para a equipe da Snack Store no WhatsApp e obter a chave Pix para faturamento.
              </p>

              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px', maxWidth: '440px', margin: '0 auto 24px auto', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748B' }}>
                  <span>Quantidade de Itens:</span>
                  <strong style={{ color: '#0F172A' }}>{totalUnits} unidades</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748B' }}>
                  <span>Total Atacado:</span>
                  <strong style={{ color: '#0F172A' }}>{formatCurrency(subtotalWholesale)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748B' }}>
                  <span>Frete ({orderShippingMode === 'expresso' ? '1 a 6 horas' : 'Programado'}):</span>
                  <strong style={{ color: '#0F172A' }}>{formatCurrency(shippingCost)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px dashed #CBD5E1', fontSize: '16px', fontWeight: '800', color: '#166534' }}>
                  <span>Total a Pagar:</span>
                  <span>{formatCurrency(finalOrderTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', fontWeight: '700', color: '#0369A1' }}>
                  <span>Seu Lucro Estimado:</span>
                  <span>+{formatCurrency(totalEstimatedProfit)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href={getWhatsAppMessageUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37,211,102,0.3)'
                  }}
                >
                  <Send size={18} /> Enviar Comanda no WhatsApp
                </a>
                <button
                  onClick={onClose}
                  style={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ETAPA 1: ADICIONAR PRODUTOS */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    1. Fragrâncias & Quantidades ({orderItems.length} tipos selecionados):
                  </label>
                  <span style={{ fontSize: '12px', color: '#166534', fontWeight: '700' }}>
                    Total: {totalUnits} unidades
                  </span>
                </div>

                {/* Campo de Busca Rápida de Produtos */}
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Buscar fragrância por nome, código ou marca para adicionar..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Dropdown / Resultados da Busca */}
                {productSearch.trim() && (
                  <div style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginBottom: '16px'
                  }}>
                    {filteredProductCandidates.length === 0 ? (
                      <div style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
                        Nenhuma fragrância encontrada com "{productSearch}"
                      </div>
                    ) : (
                      filteredProductCandidates.map(p => (
                        <div
                          key={p.code}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={p.image} alt={p.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{p.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                {p.brand} • Atacado: <strong style={{ color: '#166534' }}>{formatCurrency(getProductWholesalePrice(p))}</strong>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddProduct(p)}
                            style={{
                              backgroundColor: '#166534',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Plus size={14} /> Adicionar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Lista de Itens no Pedido */}
                {orderItems.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                    <ShoppingBag size={28} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                      Nenhum item adicionado ainda. Busque e adicione produtos acima ou selecione no catálogo.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                    {orderItems.map(item => (
                      <div
                        key={item.product.code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '10px',
                          border: '1px solid #E2E8F0',
                          flexWrap: 'wrap',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px' }}>
                          <img src={item.product.image} alt={item.product.name} style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                              {item.product.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              Preço un: <strong style={{ color: '#166534' }}>{formatCurrency(item.price)}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Modality Selector for this item */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateModality(item.product.code, 'expresso')}
                            style={{
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              backgroundColor: item.modality === 'expresso' ? '#DCFCE7' : '#FFFFFF',
                              color: item.modality === 'expresso' ? '#166534' : '#64748B'
                            }}
                          >
                            ⚡ Expresso (1-6h)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateModality(item.product.code, 'programado_7')}
                            style={{
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              backgroundColor: item.modality === 'programado_7' ? '#E0F2FE' : '#FFFFFF',
                              color: item.modality === 'programado_7' ? '#0369A1' : '#64748B'
                            }}
                          >
                            📦 7 dias
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateModality(item.product.code, 'economico_15')}
                            style={{
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              backgroundColor: item.modality === 'economico_15' ? '#FEF3C7' : '#FFFFFF',
                              color: item.modality === 'economico_15' ? '#92400E' : '#64748B'
                            }}
                          >
                            💰 15 dias
                          </button>
                        </div>

                        {/* Quantity Counter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.product.code, -1)}
                              style={{ width: '28px', height: '28px', border: 'none', backgroundColor: '#F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: '800', fontSize: '13px' }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.product.code, 1)}
                              style={{ width: '28px', height: '28px', border: 'none', backgroundColor: '#F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div style={{ width: '80px', textAlign: 'right', fontWeight: '800', fontSize: '13px', color: '#0F172A' }}>
                            {formatCurrency(item.price * item.quantity)}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.product.code)}
                            style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ETAPA 2: DESTINO DA ENTREGA & REGRA 5+ PRODUTOS */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  2. Destino do Pedido:
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  
                  {/* Opção 1: Enviar para o Revendedor */}
                  <div
                    onClick={() => setDeliveryType('self')}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: deliveryType === 'self' ? '2px solid #166534' : '1px solid #E2E8F0',
                      backgroundColor: deliveryType === 'self' ? '#F0FDF4' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <User size={16} color={deliveryType === 'self' ? '#166534' : '#64748B'} />
                      <strong style={{ fontSize: '13px', color: deliveryType === 'self' ? '#166534' : '#0F172A' }}>
                        Para Meu Endereço
                      </strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>
                      Entrega no seu endereço cadastrado de revendedor para você entregar pessoalmente.
                    </p>
                  </div>

                  {/* Opção 2: Envio Direto para Cliente (Dropshipping) */}
                  <div
                    onClick={() => {
                      if (isDirectDeliveryEligible) {
                        setDeliveryType('direct_customer');
                      }
                    }}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: deliveryType === 'direct_customer' ? '2px solid #6B21A8' : '1px solid #E2E8F0',
                      backgroundColor: deliveryType === 'direct_customer' ? '#FAF5FF' : (isDirectDeliveryEligible ? '#FFFFFF' : '#F8FAFC'),
                      cursor: isDirectDeliveryEligible ? 'pointer' : 'not-allowed',
                      opacity: isDirectDeliveryEligible ? 1 : 0.75
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Truck size={16} color={deliveryType === 'direct_customer' ? '#6B21A8' : '#64748B'} />
                        <strong style={{ fontSize: '13px', color: deliveryType === 'direct_customer' ? '#6B21A8' : '#0F172A' }}>
                          Direto para o Cliente
                        </strong>
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: '800', backgroundColor: '#F3E8FF', color: '#6B21A8', padding: '2px 6px', borderRadius: '4px' }}>
                        DROPSHIPPING
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>
                      Enviamos diretamente para o seu cliente com embalagem neutra e sem nota com valor de atacado.
                    </p>
                  </div>

                </div>

                {/* Alerta caso < 5 unidades para envio direto */}
                {!isDirectDeliveryEligible && (
                  <div style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    color: '#92400E',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <AlertTriangle size={16} />
                    <span>
                      O envio direto para cliente (dropshipping neutro) é liberado a partir de <strong>{minDirectDeliveryUnits} unidades</strong> no pedido. Adicione mais {minDirectDeliveryUnits - totalUnits} unidade(s) para habilitar.
                    </span>
                  </div>
                )}

                {/* Seleção de Cliente / Destinatário quando "direct_customer" está ativo */}
                {deliveryType === 'direct_customer' && isDirectDeliveryEligible && (
                  <div style={{
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#6B21A8', textTransform: 'uppercase' }}>
                        Selecione o Cliente Destinatário:
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingRecipient(!isAddingRecipient)}
                        style={{
                          backgroundColor: '#6B21A8',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {isAddingRecipient ? 'Cancelar Cadastro' : '+ Cadastrar Novo Cliente'}
                      </button>
                    </div>

                    {!isAddingRecipient ? (
                      <select
                        value={selectedRecipientId}
                        onChange={(e) => setSelectedRecipientId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '13px',
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <option value="">Selecione um cliente cadastrado...</option>
                        {recipients.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} — {r.city}/{r.state} ({r.phone || 'Sem tel'})
                          </option>
                        ))}
                      </select>
                    ) : (
                      /* Formulário Inline de Novo Cliente */
                      <form onSubmit={handleSaveRecipientInline} style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Nome Completo do Cliente *"
                            value={newRecipient.name}
                            onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                            required
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="WhatsApp / Telefone"
                            value={newRecipient.phone}
                            onChange={(e) => setNewRecipient({ ...newRecipient, phone: e.target.value })}
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="CEP"
                            value={newRecipient.cep}
                            onChange={(e) => setNewRecipient({ ...newRecipient, cep: e.target.value })}
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="Rua / Endereço"
                            value={newRecipient.address}
                            onChange={(e) => setNewRecipient({ ...newRecipient, address: e.target.value })}
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="Número"
                            value={newRecipient.number}
                            onChange={(e) => setNewRecipient({ ...newRecipient, number: e.target.value })}
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Bairro"
                            value={newRecipient.neighborhood}
                            onChange={(e) => setNewRecipient({ ...newRecipient, neighborhood: e.target.value })}
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="Cidade *"
                            value={newRecipient.city}
                            onChange={(e) => setNewRecipient({ ...newRecipient, city: e.target.value })}
                            required
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="Estado (ex: MG)"
                            value={newRecipient.state}
                            onChange={(e) => setNewRecipient({ ...newRecipient, state: e.target.value })}
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                        </div>

                        <button
                          type="submit"
                          style={{
                            backgroundColor: '#166534',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer',
                            alignSelf: 'flex-start',
                            marginTop: '4px'
                          }}
                        >
                          Salvar e Usar este Cliente
                        </button>
                      </form>
                    )}

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#0F172A', cursor: 'pointer', marginTop: '4px' }}>
                      <input
                        type="checkbox"
                        checked={neutralPackaging}
                        onChange={(e) => setNeutralPackaging(e.target.checked)}
                      />
                      <span><strong>Embalagem 100% Neutra:</strong> Sem preço de atacado, sem nota com seus custos e remetente discreto.</span>
                    </label>
                  </div>
                )}

              </div>

              {/* ETAPA 3: MODALIDADE DE ENVIO / FRETE */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  3. Modalidade de Frete:
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div
                    onClick={() => {
                      setOrderShippingMode('expresso');
                      setShippingCost(14.90);
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: orderShippingMode === 'expresso' ? '2px solid #166534' : '1px solid #E2E8F0',
                      backgroundColor: orderShippingMode === 'expresso' ? '#F0FDF4' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>⚡ Expresso BH</span>
                      <strong style={{ color: '#166534', fontSize: '13px' }}>R$ 14,90</strong>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>1 a 6 horas via Motoboy</span>
                  </div>

                  <div
                    onClick={() => {
                      setOrderShippingMode('programado_7');
                      setShippingCost(0);
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: orderShippingMode === 'programado_7' ? '2px solid #0284C7' : '1px solid #E2E8F0',
                      backgroundColor: orderShippingMode === 'programado_7' ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>📦 Programado</span>
                      <strong style={{ color: '#0284C7', fontSize: '13px' }}>Grátis / Incluso</strong>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>Até 7 dias úteis</span>
                  </div>

                  <div
                    onClick={() => {
                      setOrderShippingMode('economico_15');
                      setShippingCost(0);
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: orderShippingMode === 'economico_15' ? '2px solid #B45309' : '1px solid #E2E8F0',
                      backgroundColor: orderShippingMode === 'economico_15' ? '#FFFBEB' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>💰 Econômico</span>
                      <strong style={{ color: '#B45309', fontSize: '13px' }}>Grátis / Incluso</strong>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>Até 15 dias úteis</span>
                  </div>
                </div>
              </div>

              {/* Observações do Pedido */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  Observações para a expedição (opcional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Entregar após as 14h, ou cliente prefere perfume embalado para presente..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </>
          )}

        </div>

        {/* MODAL FOOTER */}
        {!createdOrderResult && (
          <div style={{
            padding: '18px 24px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Itens: <strong>{totalUnits} un</strong> • Frete: <strong>{formatCurrency(shippingCost)}</strong>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>
                Total: <span style={{ color: '#166534' }}>{formatCurrency(finalOrderTotal)}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#0369A1', fontWeight: '700' }}>
                Seu lucro estimado na revenda: +{formatCurrency(totalEstimatedProfit)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSubmitting || orderItems.length === 0}
                onClick={handleConfirmOrder}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isSubmitting || orderItems.length === 0 ? '#94A3B8' : '#166534',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: isSubmitting || orderItems.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(22,101,52,0.3)'
                }}
              >
                {isSubmitting ? 'Processando...' : 'Confirmar e Gerar Pedido'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
