import React, { useState, useMemo, useEffect } from 'react';
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
  Send,
  MapPin,
  Calculator,
  Users,
  Check,
  Split,
  Loader2
} from 'lucide-react';
import { apiService } from '../../../services/api';

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

  // Safe wholesale price computation directly synchronized with admin Central de Logística
  const getProductWholesalePrice = (p, modality = 'expresso') => {
    if (!p) return 79.90;
    const retail = parseFloat(p.price) || 79.90;

    if (modality === 'programado_7') {
      const p7Logistics = p.logistics_config?.programado_7?.price;
      if (p7Logistics !== undefined && p7Logistics !== null && p7Logistics !== '') {
        const parsed = parseFloat(p7Logistics);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      if (p.wholesale_prog7) {
        const parsed = parseFloat(p.wholesale_prog7);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      const rawW = parseFloat(p.wholesale_price);
      const baseW = (!isNaN(rawW) && rawW > 0) ? rawW : (retail * 0.72);
      return Math.round(baseW * 0.90 * 100) / 100;
    }

    if (modality === 'economico_15') {
      const e15Logistics = p.logistics_config?.economico_15?.price;
      if (e15Logistics !== undefined && e15Logistics !== null && e15Logistics !== '') {
        const parsed = parseFloat(e15Logistics);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      if (p.wholesale_econ15) {
        const parsed = parseFloat(p.wholesale_econ15);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      const rawW = parseFloat(p.wholesale_price);
      const baseW = (!isNaN(rawW) && rawW > 0) ? rawW : (retail * 0.72);
      return Math.round(baseW * 0.85 * 100) / 100;
    }

    // Expresso BH
    const expLogistics = p.logistics_config?.expresso?.price;
    if (expLogistics !== undefined && expLogistics !== null && expLogistics !== '') {
      const parsed = parseFloat(expLogistics);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const rawWholesale = parseFloat(p.wholesale_price);
    if (!isNaN(rawWholesale) && rawWholesale > 0) return rawWholesale;
    return Math.round(retail * 0.72 * 100) / 100;
  };
  
  // Selected order items: Array of { product, quantity, modality, price }
  const [orderItems, setOrderItems] = useState(() => {
    if (initialSelectedItems && initialSelectedItems.length > 0) {
      return initialSelectedItems.map(item => {
        const mod = item.has_expresso ? 'expresso' : (item.has_prog7 ? 'programado_7' : 'economico_15');
        return {
          product: item,
          quantity: item.initialQuantity || 1,
          modality: mod,
          price: getProductWholesalePrice(item, mod)
        };
      });
    }
    return [];
  });

  // Delivery destination mode: 'self' | 'direct_customer'
  const [deliveryType, setDeliveryType] = useState('self');
  
  // Sub-mode for dropshipping: 'single' | 'multi'
  const [dropshipMode, setDropshipMode] = useState('single');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');

  // Reseller's own address state (for 'self' delivery)
  const [selfAddress, setSelfAddress] = useState({
    cep: currentUser?.cep || '',
    address: currentUser?.address || '',
    number: currentUser?.number || '',
    complement: currentUser?.complement || '',
    neighborhood: currentUser?.neighborhood || '',
    city: currentUser?.city || 'Belo Horizonte',
    state: currentUser?.state || 'MG'
  });
  const [isEditingSelfAddress, setIsEditingSelfAddress] = useState(!currentUser?.address);

  // Multi-recipient state (for 5+ items)
  const [multiShipments, setMultiShipments] = useState([
    {
      id: 'ship_1',
      recipient_id: '',
      recipient_name: '',
      recipient_phone: '',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: 'Belo Horizonte',
      state: 'MG',
      cep: '',
      shipping_cost: 14.90,
      shipping_carrier: 'Motoboy Expresso BH (1 a 6h)',
      shipping_quotes: [],
      is_calculating: false,
      items: {}
    }
  ]);

  // Inline recipient form for single dropshipping
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

  // Single shipping options
  const [shippingCost, setShippingCost] = useState(14.90);
  const [selectedCarrierName, setSelectedCarrierName] = useState('Motoboy Expresso BH (1 a 6 horas)');
  const [shippingQuotes, setShippingQuotes] = useState([]);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isBhRegion, setIsBhRegion] = useState(true);
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

  // Add product to order
  const handleAddProduct = (prod) => {
    setOrderItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.code === prod.code);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      const initialMod = (prod.stock > 0 || prod.logistics_config?.expresso?.active !== false) ? 'expresso' : (prod.logistics_config?.programado_7?.active !== false ? 'programado_7' : 'economico_15');
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

  // Total shipping fee calculation (sum of all recipients if multi, or single shipping cost)
  const totalShippingFee = useMemo(() => {
    if (deliveryType === 'direct_customer' && dropshipMode === 'multi') {
      return multiShipments.reduce((sum, s) => sum + (parseFloat(s.shipping_cost) || 14.90), 0);
    }
    return parseFloat(shippingCost) || 14.90;
  }, [deliveryType, dropshipMode, multiShipments, shippingCost]);

  const finalOrderTotal = subtotalWholesale + totalShippingFee;

  // Maximum allowed recipients based on units purchased
  const maxAllowedRecipients = useMemo(() => {
    if (totalUnits < 5) return 1;
    if (totalUnits < 10) return 2;   // 5 a 9 unidades: até 2 endereços
    if (totalUnits < 15) return 3;   // 10 a 14 unidades: até 3 endereços
    if (totalUnits < 20) return 4;   // 15 a 19 unidades: até 4 endereços
    return 8;                         // 20+ unidades: até 8 endereços
  }, [totalUnits]);

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

  // Single Shipping Calculator
  const handleCalculateShipping = async (targetCep) => {
    const cleanCep = (targetCep || '').replace(/\D/g, '');
    if (cleanCep.length < 8) {
      alert('Digite um CEP válido com 8 dígitos.');
      return;
    }

    const cepNum = parseInt(cleanCep, 10) || 0;
    const isBh = (cepNum >= 30000000 && cepNum <= 34999999);
    setIsBhRegion(isBh);

    if (isBh) {
      // BH e Região Metropolitana: Frete fixo e exclusivo de R$ 14,90 (Motoboy)
      setShippingCost(14.90);
      setSelectedCarrierName('Motoboy Expresso BH (1 a 6 horas)');
      setShippingQuotes([]);
      return;
    }

    // Fora de BH: calcular via Melhor Envio / Correios
    setIsCalculatingShipping(true);
    try {
      const res = await apiService.calculateShipping(cleanCep, totalUnits, subtotalWholesale);
      const quotes = (res && Array.isArray(res.quotes)) ? res.quotes : [];
      setShippingQuotes(quotes);

      if (quotes.length > 0) {
        const cheapest = quotes[0];
        setShippingCost(parseFloat(cheapest.price) || 24.90);
        setSelectedCarrierName(`${cheapest.name} (${cheapest.company?.name || 'Correios'})`);
      } else {
        setShippingCost(24.90);
        setSelectedCarrierName('Correios PAC');
      }
    } catch (err) {
      console.warn('Erro ao calcular frete:', err);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  // Multi-Recipient Individual Shipping Calculator
  const handleCalculateMultiShipping = async (shipIndex) => {
    const s = multiShipments[shipIndex];
    const cleanCep = (s.cep || '').replace(/\D/g, '');
    if (cleanCep.length < 8) {
      alert(`Digite o CEP completo com 8 dígitos para calcular o frete do Destinatário #${shipIndex + 1}.`);
      return;
    }

    const cepNum = parseInt(cleanCep, 10) || 0;
    const isBh = (cepNum >= 30000000 && cepNum <= 34999999);

    if (isBh) {
      setMultiShipments(prev => {
        const copy = [...prev];
        copy[shipIndex] = {
          ...copy[shipIndex],
          shipping_cost: 14.90,
          shipping_carrier: 'Motoboy Expresso BH (1 a 6h)',
          shipping_quotes: [],
          is_calculating: false
        };
        return copy;
      });
      return;
    }

    // Fora de BH: consulta Melhor Envio
    setMultiShipments(prev => {
      const copy = [...prev];
      copy[shipIndex] = { ...copy[shipIndex], is_calculating: true };
      return copy;
    });

    try {
      const shipUnits = Object.values(s.items).reduce((a, b) => a + (b || 0), 0) || 1;
      const res = await apiService.calculateShipping(cleanCep, shipUnits, 79.9 * shipUnits);
      const quotes = (res && Array.isArray(res.quotes)) ? res.quotes : [];

      setMultiShipments(prev => {
        const copy = [...prev];
        const defaultQuote = quotes[0];
        copy[shipIndex] = {
          ...copy[shipIndex],
          shipping_cost: defaultQuote ? parseFloat(defaultQuote.price) : 24.90,
          shipping_carrier: defaultQuote ? `${defaultQuote.name} (${defaultQuote.company?.name || 'Correios'})` : 'Correios PAC',
          shipping_quotes: quotes,
          is_calculating: false
        };
        return copy;
      });
    } catch (err) {
      setMultiShipments(prev => {
        const copy = [...prev];
        copy[shipIndex] = { ...copy[shipIndex], is_calculating: false };
        return copy;
      });
    }
  };

  // Handle Save New Recipient Inline
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
          if (newRecipient.cep) {
            handleCalculateShipping(newRecipient.cep);
          }
        }
      }
      setIsAddingRecipient(false);
      alert('Cliente cadastrado com sucesso!');
    } catch (err) {
      console.warn('Erro ao salvar destinatário:', err);
    }
  };

  // Multi-recipient item allocation helper
  const handleUpdateMultiItemQty = (shipmentIndex, productCode, delta) => {
    setMultiShipments(prev => {
      const copy = [...prev];
      const target = { ...copy[shipmentIndex] };
      const currentQty = target.items[productCode] || 0;
      const newQty = Math.max(0, currentQty + delta);
      
      const totalItem = orderItems.find(it => it.product.code === productCode)?.quantity || 0;
      const currentOtherAlloc = copy.reduce((sum, s, idx) => {
        if (idx === shipmentIndex) return sum;
        return sum + (s.items[productCode] || 0);
      }, 0);

      if (delta > 0 && (currentOtherAlloc + newQty) > totalItem) {
        alert(`Você já alocou o total de ${totalItem} unidades compradas desta fragrância.`);
        return prev;
      }

      target.items = { ...target.items, [productCode]: newQty };
      copy[shipmentIndex] = target;
      return copy;
    });
  };

  // Add another recipient box in multi mode
  const handleAddMultiRecipient = () => {
    if (multiShipments.length >= maxAllowedRecipients) {
      alert(`O limite para seu pedido de ${totalUnits} unidades é de até ${maxAllowedRecipients} endereços diferentes.`);
      return;
    }
    setMultiShipments(prev => [
      ...prev,
      {
        id: `ship_${prev.length + 1}`,
        recipient_id: '',
        recipient_name: '',
        recipient_phone: '',
        address: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: 'Belo Horizonte',
        state: 'MG',
        cep: '',
        shipping_cost: 14.90,
        shipping_carrier: 'Motoboy Expresso BH (1 a 6h)',
        shipping_quotes: [],
        is_calculating: false,
        items: {}
      }
    ]);
  };

  const handleRemoveMultiRecipient = (idx) => {
    if (multiShipments.length <= 1) return;
    setMultiShipments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSelectRecipientForShipment = (idx, recId) => {
    const found = recipients.find(r => r.id.toString() === recId.toString());
    setMultiShipments(prev => {
      const copy = [...prev];
      if (found) {
        copy[idx] = {
          ...copy[idx],
          recipient_id: found.id,
          recipient_name: found.name,
          recipient_phone: found.phone || '',
          address: found.address || '',
          number: found.number || '',
          complement: found.complement || '',
          neighborhood: found.neighborhood || '',
          city: found.city || 'Belo Horizonte',
          state: found.state || 'MG',
          cep: found.cep || ''
        };
        if (found.cep) {
          setTimeout(() => handleCalculateMultiShipping(idx), 100);
        }
      } else {
        copy[idx] = { ...copy[idx], recipient_id: '' };
      }
      return copy;
    });
  };

  // Handle Final Submit Order
  const handleConfirmOrder = async () => {
    if (orderItems.length === 0) {
      alert('Adicione ao menos um produto ao pedido.');
      return;
    }

    if (deliveryType === 'self') {
      if (!selfAddress.address || !selfAddress.city || !selfAddress.cep) {
        alert('Por favor, informe seu endereço completo de entrega com CEP.');
        return;
      }
    } else if (deliveryType === 'direct_customer') {
      if (dropshipMode === 'single') {
        if (!selectedRecipientId && !isAddingRecipient) {
          alert('Selecione ou cadastre o cliente destinatário para entrega direta.');
          return;
        }
      } else {
        // Multi-recipient validation
        for (let i = 0; i < multiShipments.length; i++) {
          const s = multiShipments[i];
          if (!s.recipient_name || !s.address || !s.cep) {
            alert(`Preencha o nome, endereço e CEP completo para o Destinatário #${i + 1}.`);
            return;
          }
          const totalShipAllocated = Object.values(s.items).reduce((a, b) => a + (b || 0), 0);
          if (totalShipAllocated === 0) {
            alert(`Distribua ao menos 1 fragrância para o Destinatário #${i + 1} (${s.recipient_name}).`);
            return;
          }
        }
      }
    }

    setIsSubmitting(true);
    try {
      const recipientObj = recipients.find(r => r.id.toString() === selectedRecipientId?.toString());
      const orderNumber = `AT-${Date.now().toString().slice(-5)}`;

      let builtShipments = [];
      if (deliveryType === 'direct_customer' && dropshipMode === 'multi') {
        builtShipments = multiShipments.map((s, idx) => {
          const allocatedItems = Object.entries(s.items)
            .filter(([_, qty]) => qty > 0)
            .map(([code, qty]) => {
              const itemRef = orderItems.find(it => it.product.code === code);
              return {
                code,
                name: itemRef?.product.name || code,
                quantity: qty,
                price: itemRef?.price || 0
              };
            });

          return {
            shipment_number: `${orderNumber}-S${idx + 1}`,
            recipient_id: s.recipient_id || null,
            recipient_name: s.recipient_name,
            recipient_phone: s.recipient_phone,
            recipient_address: `${s.address}, ${s.number || 'S/N'}${s.complement ? ` - ${s.complement}` : ''} - ${s.neighborhood || ''}, ${s.city}/${s.state} CEP: ${s.cep}`,
            shipping_fee: parseFloat(s.shipping_cost) || 14.90,
            shipping_carrier: s.shipping_carrier || 'Motoboy Expresso BH',
            neutral_packing: neutralPackaging,
            items: allocatedItems
          };
        });
      } else if (deliveryType === 'direct_customer') {
        builtShipments = [{
          shipment_number: `${orderNumber}-S1`,
          recipient_id: recipientObj?.id || null,
          recipient_name: recipientObj?.name || 'Cliente Final',
          recipient_phone: recipientObj?.phone || '',
          recipient_address: `${recipientObj?.address || ''}, ${recipientObj?.number || 'S/N'}${recipientObj?.complement ? ` - ${recipientObj?.complement}` : ''} - ${recipientObj?.neighborhood || ''}, ${recipientObj?.city || ''}/${recipientObj?.state || ''} CEP: ${recipientObj?.cep || ''}`,
          shipping_fee: parseFloat(shippingCost) || 14.90,
          shipping_carrier: selectedCarrierName,
          neutral_packing: neutralPackaging,
          items: orderItems.map(it => ({
            code: it.product.code,
            name: it.product.name,
            quantity: it.quantity,
            price: it.price
          }))
        }];
      } else {
        builtShipments = [{
          shipment_number: `${orderNumber}-S1`,
          recipient_id: null,
          recipient_name: currentUser?.name || 'Revendedor',
          recipient_phone: currentUser?.phone || '',
          recipient_address: `${selfAddress.address}, ${selfAddress.number || 'S/N'}${selfAddress.complement ? ` - ${selfAddress.complement}` : ''} - ${selfAddress.neighborhood || ''}, ${selfAddress.city}/${selfAddress.state} CEP: ${selfAddress.cep}`,
          shipping_fee: parseFloat(shippingCost) || 14.90,
          shipping_carrier: selectedCarrierName,
          neutral_packing: false,
          items: orderItems.map(it => ({
            code: it.product.code,
            name: it.product.name,
            quantity: it.quantity,
            price: it.price
          }))
        }];
      }
      
      const payload = {
        order_number: orderNumber,
        customer_id: currentUser?.id,
        customer_name: deliveryType === 'direct_customer' 
          ? (dropshipMode === 'multi' ? `Multi-Clientes (${multiShipments.length} Destinatários)` : (recipientObj?.name || 'Cliente Final')) 
          : (currentUser?.name || 'Revendedor VIP'),
        customer_email: currentUser?.email || 'revenda@snackstorebh.com.br',
        customer_phone: currentUser?.phone || '553175650503',
        customer_address: deliveryType === 'self' 
          ? `${selfAddress.address}, ${selfAddress.number || 'S/N'}${selfAddress.complement ? ` - ${selfAddress.complement}` : ''} - ${selfAddress.neighborhood}, ${selfAddress.city}/${selfAddress.state} CEP: ${selfAddress.cep}`
          : (recipientObj ? `${recipientObj.address}, ${recipientObj.number || 'S/N'}${recipientObj.complement ? ` - ${recipientObj.complement}` : ''} - ${recipientObj.neighborhood}, ${recipientObj.city}/${recipientObj.state} CEP: ${recipientObj.cep}` : 'Envio Múltiplo Dropshipping'),
        status: 'pendente',
        payment_status: 'aguardando_pix',
        total_amount: Math.round(finalOrderTotal * 100) / 100,
        subtotal: Math.round(subtotalWholesale * 100) / 100,
        shipping_fee: Math.round(totalShippingFee * 100) / 100,
        shipping_carrier: deliveryType === 'direct_customer' && dropshipMode === 'multi' ? `Múltiplos (${multiShipments.length} envios)` : selectedCarrierName,
        fulfillment_mode: deliveryType === 'direct_customer' ? (dropshipMode === 'multi' ? 'multiple' : 'direct_customer') : 'single',
        recipient_count: deliveryType === 'direct_customer' && dropshipMode === 'multi' ? multiShipments.length : 1,
        shipments: builtShipments,
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
          logistics_mode: it.modality
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

    let text = `👑 *NOVO PEDIDO NO ATACADO - SNACK STORE BH*\n`;
    text += `*Número do Pedido:* #${num}\n`;
    text += `*Revendedor:* ${currentUser?.name || 'Revendedor VIP'} (${currentUser?.email || ''})\n\n`;
    text += `📦 *ITENS DO PEDIDO (${totalUnits} un):*\n`;
    
    orderItems.forEach((it, idx) => {
      text += `${idx + 1}. ${it.quantity}x ${it.product.name} [${it.modality === 'expresso' ? '⚡ Expresso 1-6h' : it.modality === 'programado_7' ? '📦 7 dias' : '💰 15 dias'}] - ${formatCurrency(it.price * it.quantity)}\n`;
    });

    text += `\n💰 *Subtotal Produtos:* ${formatCurrency(subtotalWholesale)}`;

    if (deliveryType === 'direct_customer' && dropshipMode === 'multi') {
      text += `\n\n🎯 *DROPSHIPPING COM DIVISÃO POR MÚLTIPLOS CLIENTES (${multiShipments.length} Endereços):*\n`;
      multiShipments.forEach((s, idx) => {
        text += `\n*Destinatário #${idx + 1}:* ${s.recipient_name} (${s.recipient_phone || 'sem fone'})\n`;
        text += `📍 *Endereço Completo:* ${s.address}, ${s.number || 'S/N'}${s.complement ? ` - ${s.complement}` : ''} - ${s.neighborhood || ''}, ${s.city}/${s.state} - CEP: ${s.cep}\n`;
        const allocStr = Object.entries(s.items)
          .filter(([_, qty]) => qty > 0)
          .map(([c, qty]) => `${qty}x ${orderItems.find(i => i.product.code === c)?.product.name || c}`)
          .join(', ');
        text += `📦 *Fragrâncias:* ${allocStr || 'Nenhum item'}\n`;
        text += `🚚 *Frete deste envio:* ${formatCurrency(s.shipping_cost || 14.90)} (${s.shipping_carrier || 'Motoboy Expresso BH'})\n`;
      });
      text += `\n🚚 *Total de Fretes (${multiShipments.length} envios):* ${formatCurrency(totalShippingFee)}`;
    } else if (deliveryType === 'direct_customer') {
      const recipient = recipients.find(r => r.id.toString() === selectedRecipientId?.toString());
      text += `\n\n🎯 *ENTREGA DIRETA PARA CLIENTE (DROPSHIPPING):*\n`;
      text += `*Destinatário:* ${recipient?.name || 'Cliente'}\n`;
      text += `📍 *Endereço Completo:* ${recipient?.address || ''}, ${recipient?.number || 'S/N'}${recipient?.complement ? ` - ${recipient?.complement}` : ''} - ${recipient?.neighborhood || ''}, ${recipient?.city || ''}/${recipient?.state || ''} - CEP: ${recipient?.cep}\n`;
      text += `🚚 *Frete:* ${formatCurrency(shippingCost)} (${selectedCarrierName})\n`;
      text += `*Embalagem Neutra:* ${neutralPackaging ? 'SIM' : 'Padrão'}\n`;
    } else {
      text += `\n\n🏠 *Entrega para Revendedor:*\n`;
      text += `📍 *Endereço:* ${selfAddress.address}, ${selfAddress.number || 'S/N'}${selfAddress.complement ? ` - ${selfAddress.complement}` : ''} - ${selfAddress.neighborhood || ''}, ${selfAddress.city}/${selfAddress.state} - CEP: ${selfAddress.cep}\n`;
      text += `🚚 *Frete:* ${formatCurrency(shippingCost)} (${selectedCarrierName})\n`;
    }

    text += `\n🔥 *TOTAL GERAL DO PEDIDO:* ${formatCurrency(finalOrderTotal)}\n`;
    text += `📈 *Lucro Estimado do Revendedor:* ${formatCurrency(totalEstimatedProfit)}\n\n`;

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
        maxWidth: '920px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden'
      }}>
        
        {/* MODAL HEADER */}
        <div style={{
          padding: '18px 24px',
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
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
                Seu pedido foi registrado no sistema. Agora, clique no botão abaixo para enviar o resumo completo diretamente para a equipe da Snack Store no WhatsApp e obter a chave Pix oficial do Mercado Pago para faturamento.
              </p>

              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px', maxWidth: '480px', margin: '0 auto 24px auto', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748B' }}>
                  <span>Quantidade de Itens:</span>
                  <strong style={{ color: '#0F172A' }}>{totalUnits} unidades</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748B' }}>
                  <span>Subtotal Atacado:</span>
                  <strong style={{ color: '#0F172A' }}>{formatCurrency(subtotalWholesale)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748B' }}>
                  <span>
                    Frete {deliveryType === 'direct_customer' && dropshipMode === 'multi' ? `(${multiShipments.length} destinos)` : `(${selectedCarrierName})`}:
                  </span>
                  <strong style={{ color: '#0F172A' }}>{formatCurrency(totalShippingFee)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px dashed #CBD5E1', fontSize: '16px', fontWeight: '800', color: '#166534' }}>
                  <span>Total Geral a Pagar:</span>
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
                                {p.brand} • Expresso: <strong style={{ color: '#166534' }}>{formatCurrency(getProductWholesalePrice(p, 'expresso'))}</strong> • 7d: <strong style={{ color: '#0284C7' }}>{formatCurrency(getProductWholesalePrice(p, 'programado_7'))}</strong> • 15d: <strong style={{ color: '#B45309' }}>{formatCurrency(getProductWholesalePrice(p, 'economico_15'))}</strong>
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
                              Preço atacado: <strong style={{ color: '#166534' }}>{formatCurrency(item.price)}</strong>
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
                            📦 7 dias ({formatCurrency(getProductWholesalePrice(item.product, 'programado_7'))})
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
                            💰 15 dias ({formatCurrency(getProductWholesalePrice(item.product, 'economico_15'))})
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

              {/* ETAPA 2: DESTINO DO PEDIDO */}
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
                      Entrega no seu endereço para você receber os produtos e entregar pessoalmente aos seus clientes.
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
                      Enviamos diretamente para o cliente com embalagem neutra sem valores de atacado.
                    </p>
                  </div>

                </div>

                {/* Seção "Para Meu Endereço" */}
                {deliveryType === 'self' && (
                  <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={15} /> Endereço Completo do Revendedor:
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingSelfAddress(!isEditingSelfAddress)}
                        style={{ backgroundColor: 'transparent', border: 'none', color: '#0369A1', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        {isEditingSelfAddress ? 'Salvar Edição' : '✏️ Alterar Endereço'}
                      </button>
                    </div>

                    {isEditingSelfAddress ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                          <div>
                            <input
                              type="text"
                              placeholder="CEP (ex: 30140-071) *"
                              value={selfAddress.cep}
                              onChange={(e) => setSelfAddress({ ...selfAddress, cep: e.target.value })}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCalculateShipping(selfAddress.cep)}
                            disabled={isCalculatingShipping}
                            style={{ backgroundColor: '#166534', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <Calculator size={13} /> {isCalculatingShipping ? 'Cotando frete...' : 'Calcular Frete deste CEP'}
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Rua / Endereço *"
                            value={selfAddress.address}
                            onChange={(e) => setSelfAddress({ ...selfAddress, address: e.target.value })}
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="Número *"
                            value={selfAddress.number}
                            onChange={(e) => setSelfAddress({ ...selfAddress, number: e.target.value })}
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="Complemento"
                            value={selfAddress.complement}
                            onChange={(e) => setSelfAddress({ ...selfAddress, complement: e.target.value })}
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Bairro *"
                            value={selfAddress.neighborhood}
                            onChange={(e) => setSelfAddress({ ...selfAddress, neighborhood: e.target.value })}
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="Cidade *"
                            value={selfAddress.city}
                            onChange={(e) => setSelfAddress({ ...selfAddress, city: e.target.value })}
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="Estado (ex: MG) *"
                            value={selfAddress.state}
                            onChange={(e) => setSelfAddress({ ...selfAddress, state: e.target.value })}
                            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#334155', backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <strong>{currentUser?.name || 'Revendedor'}</strong> • {selfAddress.address ? `${selfAddress.address}, ${selfAddress.number || 'S/N'}${selfAddress.complement ? ` (${selfAddress.complement})` : ''} - ${selfAddress.neighborhood || ''}, ${selfAddress.city}/${selfAddress.state} (CEP: ${selfAddress.cep})` : 'Endereço ainda não configurado.'}
                      </div>
                    )}
                  </div>
                )}

                {/* Alerta caso < 5 unidades para envio direto */}
                {!isDirectDeliveryEligible && deliveryType === 'direct_customer' && (
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

                {/* SEÇÃO DROPSHIPPING (DIRETO PARA CLIENTE) */}
                {deliveryType === 'direct_customer' && isDirectDeliveryEligible && (
                  <div style={{
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}>
                    {/* Toggle entre Destinatário Único e Múltiplos Endereços */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setDropshipMode('single')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            backgroundColor: dropshipMode === 'single' ? '#6B21A8' : '#FFFFFF',
                            color: dropshipMode === 'single' ? '#FFFFFF' : '#6B21A8'
                          }}
                        >
                          Destinatário Único
                        </button>
                        <button
                          type="button"
                          onClick={() => setDropshipMode('multi')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: dropshipMode === 'multi' ? '#6B21A8' : '#FFFFFF',
                            color: dropshipMode === 'multi' ? '#FFFFFF' : '#6B21A8'
                          }}
                        >
                          <Split size={13} /> Dividir Envio entre Múltiplos Clientes
                        </button>
                      </div>

                      {dropshipMode === 'multi' && (
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B21A8', backgroundColor: '#EDE9FE', padding: '3px 8px', borderRadius: '6px' }}>
                          Limite liberado: até {maxAllowedRecipients} endereços diferentes
                        </span>
                      )}
                    </div>

                    {/* MODO 1: Destinatário Único */}
                    {dropshipMode === 'single' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                            onChange={(e) => {
                              setSelectedRecipientId(e.target.value);
                              const found = recipients.find(r => r.id.toString() === e.target.value.toString());
                              if (found && found.cep) {
                                handleCalculateShipping(found.cep);
                              }
                            }}
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
                                placeholder="CEP *"
                                value={newRecipient.cep}
                                onChange={(e) => setNewRecipient({ ...newRecipient, cep: e.target.value })}
                                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                              <input
                                type="text"
                                placeholder="Rua / Endereço *"
                                value={newRecipient.address}
                                onChange={(e) => setNewRecipient({ ...newRecipient, address: e.target.value })}
                                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                              <input
                                type="text"
                                placeholder="Número *"
                                value={newRecipient.number}
                                onChange={(e) => setNewRecipient({ ...newRecipient, number: e.target.value })}
                                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder="Complemento"
                                value={newRecipient.complement}
                                onChange={(e) => setNewRecipient({ ...newRecipient, complement: e.target.value })}
                                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                              <input
                                type="text"
                                placeholder="Bairro *"
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
                                placeholder="Estado (UF) *"
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
                      </div>
                    ) : (
                      /* MODO 2: Multi-Clientes (Divisão em Múltiplos Endereços com Calculadora Individual) */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ fontSize: '12px', color: '#6B21A8' }}>
                          Cada cliente receberá um pacote individual no endereço correspondente. Informe o endereço completo e calcule o frete de cada destino:
                        </div>

                        {multiShipments.map((s, idx) => (
                          <div key={s.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', padding: '14px', border: '1px solid #DDD6FE', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '13px', color: '#5B21B6' }}>
                                  Destinatário #{idx + 1}
                                </strong>
                                <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '4px' }}>
                                  Frete deste envio: {formatCurrency(s.shipping_cost || 14.90)}
                                </span>
                              </div>
                              {multiShipments.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMultiRecipient(idx)}
                                  style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}
                                >
                                  Remover
                                </button>
                              )}
                            </div>

                            {/* Client selector or inputs */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                              <div>
                                <label style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Puxar da lista:</label>
                                <select
                                  value={s.recipient_id}
                                  onChange={(e) => handleSelectRecipientForShipment(idx, e.target.value)}
                                  style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                                >
                                  <option value="">Digitar novo...</option>
                                  {recipients.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} ({r.city}/{r.state})</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Nome do Cliente *:</label>
                                <input
                                  type="text"
                                  placeholder="Nome *"
                                  value={s.recipient_name}
                                  onChange={(e) => {
                                    const copy = [...multiShipments];
                                    copy[idx].recipient_name = e.target.value;
                                    setMultiShipments(copy);
                                  }}
                                  style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>WhatsApp do Cliente:</label>
                                <input
                                  type="text"
                                  placeholder="WhatsApp"
                                  value={s.recipient_phone}
                                  onChange={(e) => {
                                    const copy = [...multiShipments];
                                    copy[idx].recipient_phone = e.target.value;
                                    setMultiShipments(copy);
                                  }}
                                  style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                            </div>

                            {/* Endereço Completo */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder="CEP *"
                                value={s.cep}
                                onChange={(e) => {
                                  const copy = [...multiShipments];
                                  copy[idx].cep = e.target.value;
                                  setMultiShipments(copy);
                                }}
                                style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                              <input
                                type="text"
                                placeholder="Rua / Endereço *"
                                value={s.address}
                                onChange={(e) => {
                                  const copy = [...multiShipments];
                                  copy[idx].address = e.target.value;
                                  setMultiShipments(copy);
                                }}
                                style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                              <input
                                type="text"
                                placeholder="Nº *"
                                value={s.number}
                                onChange={(e) => {
                                  const copy = [...multiShipments];
                                  copy[idx].number = e.target.value;
                                  setMultiShipments(copy);
                                }}
                                style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                              <input
                                type="text"
                                placeholder="Complemento"
                                value={s.complement}
                                onChange={(e) => {
                                  const copy = [...multiShipments];
                                  copy[idx].complement = e.target.value;
                                  setMultiShipments(copy);
                                }}
                                style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                              <input
                                type="text"
                                placeholder="Bairro *"
                                value={s.neighborhood}
                                onChange={(e) => {
                                  const copy = [...multiShipments];
                                  copy[idx].neighborhood = e.target.value;
                                  setMultiShipments(copy);
                                }}
                                style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                              <input
                                type="text"
                                placeholder="Cidade *"
                                value={s.city}
                                onChange={(e) => {
                                  const copy = [...multiShipments];
                                  copy[idx].city = e.target.value;
                                  setMultiShipments(copy);
                                }}
                                style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                              <input
                                type="text"
                                placeholder="Estado (UF) *"
                                value={s.state}
                                onChange={(e) => {
                                  const copy = [...multiShipments];
                                  copy[idx].state = e.target.value;
                                  setMultiShipments(copy);
                                }}
                                style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleCalculateMultiShipping(idx)}
                                disabled={s.is_calculating}
                                style={{
                                  backgroundColor: '#166534',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  padding: '7px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px'
                                }}
                              >
                                {s.is_calculating ? <Loader2 size={12} className="animate-spin" /> : <Calculator size={12} />}
                                {s.is_calculating ? 'Cotando...' : 'Calcular Frete'}
                              </button>
                            </div>

                            {/* Cotações do Melhor Envio para este Destinatário (se fora de BH) */}
                            {Array.isArray(s.shipping_quotes) && s.shipping_quotes.length > 0 && (
                              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', marginBottom: '4px' }}>
                                  Opções de Frete Melhor Envio para este CEP ({s.cep}):
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {s.shipping_quotes.map((q, qIdx) => (
                                    <button
                                      key={qIdx}
                                      type="button"
                                      onClick={() => {
                                        const copy = [...multiShipments];
                                        copy[idx].shipping_cost = parseFloat(q.price) || 24.90;
                                        copy[idx].shipping_carrier = `${q.name} (${q.company?.name || 'Correios'})`;
                                        setMultiShipments(copy);
                                      }}
                                      style={{
                                        border: s.shipping_carrier?.includes(q.name) ? '2px solid #166534' : '1px solid #CBD5E1',
                                        backgroundColor: s.shipping_carrier?.includes(q.name) ? '#DCFCE7' : '#FFFFFF',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {q.name} - {formatCurrency(q.price)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Item allocation for this recipient */}
                            <div style={{ backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px dashed #CBD5E1' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>
                                Fragrâncias enviadas para este cliente:
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {orderItems.map(it => {
                                  const allocatedThis = s.items[it.product.code] || 0;
                                  const totalAllocAll = multiShipments.reduce((sum, ms) => sum + (ms.items[it.product.code] || 0), 0);
                                  const remaining = it.quantity - totalAllocAll;

                                  return (
                                    <div key={it.product.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                      <span>{it.product.name} (Total pedido: {it.quantity} un | Restam: {remaining} un)</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateMultiItemQty(idx, it.product.code, -1)}
                                          style={{ width: '24px', height: '24px', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#FFFFFF' }}
                                        >
                                          -
                                        </button>
                                        <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '800' }}>
                                          {allocatedThis}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateMultiItemQty(idx, it.product.code, 1)}
                                          style={{ width: '24px', height: '24px', border: '1px solid #CBD5E1', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#FFFFFF' }}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}

                        {multiShipments.length < maxAllowedRecipients && (
                          <button
                            type="button"
                            onClick={handleAddMultiRecipient}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              backgroundColor: '#F3E8FF',
                              color: '#6B21A8',
                              border: '1px dashed #C084FC',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <Plus size={14} /> + Adicionar Outro Endereço de Destino ({multiShipments.length}/{maxAllowedRecipients})
                          </button>
                        )}
                      </div>
                    )}

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#0F172A', cursor: 'pointer', marginTop: '4px' }}>
                      <input
                        type="checkbox"
                        checked={neutralPackaging}
                        onChange={(e) => setNeutralPackaging(e.target.checked)}
                      />
                      <span><strong>Embalagem 100% Neutra:</strong> Sem preço de atacado, sem dados de revenda e remetente neutro.</span>
                    </label>
                  </div>
                )}

              </div>

              {/* ETAPA 3: MODALIDADE DE FRETE & ENTREGA */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    3. Modalidade de Frete & Entrega:
                  </label>
                  <span style={{ fontSize: '12px', color: '#166534', fontWeight: '700' }}>
                    Total Frete: {formatCurrency(totalShippingFee)}
                  </span>
                </div>

                {deliveryType === 'direct_customer' && dropshipMode === 'multi' ? (
                  /* MÚLTIPLOS DESTINATÁRIOS: RESUMO DOS FRETES SOMADOS */
                  <div style={{ backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#5B21B6', marginBottom: '8px' }}>
                      📦 Fretes Individuais Somados ({multiShipments.length} pacotes):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {multiShipments.map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', backgroundColor: '#FFFFFF', padding: '6px 10px', borderRadius: '6px' }}>
                          <span>
                            <strong>Destino #{idx + 1}:</strong> {s.recipient_name || 'Destinatário'} ({s.city}/{s.state}) • {s.shipping_carrier || 'Motoboy Expresso'}
                          </span>
                          <strong style={{ color: '#166534' }}>{formatCurrency(s.shipping_cost || 14.90)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : isBhRegion ? (
                  /* DESTINATÁRIO EM BELO HORIZONTE: FIXO R$ 14,90 */
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '2px solid #166534',
                    backgroundColor: '#F0FDF4',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={16} /> Entrega Expressa BH e Região Metropolitana
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                        Chega em 1 a 6 horas via Motoboy dedicado exclusivo (Fixo para BH e cidades vizinhas).
                      </div>
                    </div>
                    <strong style={{ fontSize: '16px', color: '#166534' }}>R$ 14,90</strong>
                  </div>
                ) : (
                  /* FORA DE BH: MELHOR ENVIO SELETOR */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Destino fora de Belo Horizonte. Selecione a opção de envio cotada via Melhor Envio:
                    </div>
                    {shippingQuotes.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {shippingQuotes.map((q, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setShippingCost(parseFloat(q.price) || 24.90);
                              setSelectedCarrierName(`${q.name} (${q.company?.name || 'Correios'})`);
                            }}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 14px',
                              backgroundColor: selectedCarrierName.includes(q.name) ? '#DCFCE7' : '#FFFFFF',
                              borderRadius: '8px',
                              border: selectedCarrierName.includes(q.name) ? '2px solid #166534' : '1px solid #CBD5E1',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            <div>
                              <strong>{q.name}</strong> • {q.company?.name || 'Transportadora'} ({q.delivery_time ? `${q.delivery_time} dias úteis` : 'Rápido'})
                            </div>
                            <strong style={{ color: '#166534', fontSize: '14px' }}>{formatCurrency(q.price)}</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#64748B' }}>
                        Clique em "Calcular Frete deste CEP" acima para cotar via PAC, SEDEX ou Transportadoras.
                      </div>
                    )}
                  </div>
                )}
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
                Itens: <strong>{totalUnits} un</strong> • Frete: <strong>{formatCurrency(totalShippingFee)}</strong>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>
                Total Geral: <span style={{ color: '#166534' }}>{formatCurrency(finalOrderTotal)}</span>
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
