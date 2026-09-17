import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Check, Menu, X, User, Shield, Users, Truck, Box, Sparkles, QrCode, Copy, CheckCheck, Loader2, MapPin, Phone, AlertCircle, CreditCard, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { perfumes } from './perfumesData';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import { SeoHead } from './components/SeoHead';
import SeoLandingPage from './pages/SeoLandingPage';
import { seoPages } from './seoPagesData';
import LegalPage from './pages/LegalPage';
import Cidades from './pages/Cidades';
import BrandCollectionCatalogo from './pages/BrandCollectionCatalogo';
import BrandCollectionEquivalencias from './pages/BrandCollectionEquivalencias';
import AtacadoRevenda from './pages/AtacadoRevenda';
import BlogHub from './pages/BlogHub';
import ArticlePage from './pages/ArticlePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import LoginPage from './pages/auth/LoginPage';
import CustomerPortal from './pages/customer/CustomerPortal';
import ResellerDashboard from './pages/reseller/ResellerDashboard';
import MultiRecipientModal from './components/MultiRecipientModal';
import { useAuth } from './context/AuthContext';
import { useStoreData } from './context/StoreDataContext';
import { apiService } from './services/api';

const WHATSAPP_NUMBER = "553175650503"; // Número comercial BH

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentUser, role, isStaff } = useAuth();
  const { products, createOrder } = useStoreData();
  const activePerfumes = products && products.length > 0 ? products : perfumes;
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartDrawerTab, setCartDrawerTab] = useState('cart'); // 'cart' | 'checkout'
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Checkout & Customer delivery address states
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "MG"
  });
  const [selectedShippingQuote, setSelectedShippingQuote] = useState(null);
  const [availableShippingQuotes, setAvailableShippingQuotes] = useState([]);
  const [shippingQuotesPage, setShippingQuotesPage] = useState(1);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');
  
  // Mercado Pago Pix Modal states
  const [pixModalData, setPixModalData] = useState(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  
  // Logistics & Fulfillment states
  const [isMultiRecipientOpen, setIsMultiRecipientOpen] = useState(false);
  const [fulfillmentMode, setFulfillmentMode] = useState('single'); // 'single' | 'multi_recipient'
  const [distribution, setDistribution] = useState([]);
  const [neutralPacking, setNeutralPacking] = useState(false);

  // Custom states for premium UI interaction
  const [isScrolled, setIsScrolled] = useState(false);
  const [justAdded, setJustAdded] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  // Shrink header on scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clear toast timeout
  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [justAdded]);

  const footerProducts = activePerfumes.slice(0, 5);
  const addToCart = (product, modalityChoice = null) => {
    const chosenModality = modalityChoice?.modality || 'expresso';
    const chosenPrice = parseFloat(modalityChoice?.price) || parseFloat(product.price) || 79.90;
    const chosenLeadTime = modalityChoice?.lead_time || (chosenModality === 'programado_7' ? 'Até 7 dias úteis' : chosenModality === 'economico_15' ? 'Até 15 dias úteis' : '1 a 2 dias úteis');
    const chosenLabel = modalityChoice?.label || (chosenModality === 'expresso' ? '⚡ Receber Mais Rápido' : chosenModality === 'programado_7' ? '📦 Economizar' : '💰 Melhor Preço');

    const cartKey = `${product.code}_${chosenModality}`;

    if (chosenModality === 'expresso') {
      if ((product.stock !== undefined && product.stock <= 0) || product.is_active === false) {
        alert(`O perfume "${product.name}" está sem pronta entrega em BH no momento. Você pode encomendá-lo na modalidade "Economizar (7 dias)" ou "Melhor Preço (15 dias)".`);
        return;
      }
    }

    const addQty = parseInt(modalityChoice?.quantity || product.quantity, 10) || 1;
    const existing = cart.find(item => (item.cartKey || item.code) === cartKey);
    if (existing) {
      if (chosenModality === 'expresso' && product.stock !== undefined && (existing.quantity + addQty) > product.stock) {
        alert(`Desculpe, temos apenas ${product.stock} unidade(s) de "${product.name}" em pronta entrega.`);
        return;
      }
      setCart(cart.map(item => (item.cartKey || item.code) === cartKey ? { ...item, quantity: item.quantity + addQty } : item));
    } else {
      setCart([...cart, {
        ...product,
        cartKey,
        logistics_mode: chosenModality,
        price: chosenPrice,
        lead_time: chosenLeadTime,
        modality_label: chosenLabel,
        quantity: addQty
      }]);
    }
    setJustAdded(product.name);
    setCartDrawerTab('cart');
    setIsCartOpen(true);

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'AddToCart', {
        content_ids: [product.code],
        content_name: product.name,
        content_type: 'product',
        value: chosenPrice,
        currency: 'BRL'
      });
    }
  };

  const removeFromCart = (key) => {
    setCart(cart.filter(item => (item.cartKey || item.code) !== key));
  };

  const updateQuantity = (key, qty) => {
    if (qty <= 0) {
      removeFromCart(key);
      return;
    }
    const item = cart.find(i => (i.cartKey || item.code) === key);
    if (item && item.logistics_mode === 'expresso') {
      const currentProd = activePerfumes.find(p => p.code === item.code);
      if (currentProd && currentProd.stock !== undefined && qty > currentProd.stock) {
        alert(`Quantidade máxima em pronta entrega atingida (${currentProd.stock} unidades).`);
        qty = currentProd.stock;
      }
    }
    setCart(cart.map(item => (item.cartKey || item.code) === key ? { ...item, quantity: qty } : item));
  };

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCart = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Auto-reset cart tab to 'cart' if cart is emptied
  useEffect(() => {
    if (cart.length === 0 && cartDrawerTab !== 'cart') {
      setCartDrawerTab('cart');
    }
  }, [cart.length, cartDrawerTab]);

  // Auto-reset fulfillment mode if cart drops below 5 units
  useEffect(() => {
    if (totalQuantity < 5 && fulfillmentMode === 'multi_recipient') {
      setFulfillmentMode('single');
      setDistribution([]);
    }
  }, [totalQuantity, fulfillmentMode]);

  // Prefill logged user information
  useEffect(() => {
    if (currentUser) {
      setCheckoutForm(prev => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
        street: prev.street || currentUser.address || ''
      }));
    }
  }, [currentUser]);

  // Recalculate BH shipping if cart total crosses R$ 150 boundary
  useEffect(() => {
    if (selectedShippingQuote && selectedShippingQuote.id === 'expresso_bh') {
      const isFree = totalCart >= 150;
      setSelectedShippingQuote(prev => ({
        ...prev,
        price: isFree ? 0 : 14.90,
        is_free: isFree,
        badge: isFree ? '🎉 FRETE GRÁTIS' : '⚡ 1 A 6 HORAS'
      }));
    }
  }, [totalCart]);

  // Auto-lookup CEP via ViaCEP + Calculate Shipping Quotes
  const handleLookupCepAndShipping = async (targetCep) => {
    const clean = (targetCep || checkoutForm.cep || '').replace(/\D/g, '');
    if (clean.length !== 8) {
      setShippingError('Digite um CEP válido com 8 dígitos.');
      return;
    }
    setIsCalculatingShipping(true);
    setShippingError('');
    try {
      // 1. ViaCep autofill
      try {
        const viaRes = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const viaData = await viaRes.json();
        if (!viaData.erro) {
          setCheckoutForm(prev => ({
            ...prev,
            cep: clean.replace(/^(\d{5})(\d{3})/, '$1-$2'),
            street: viaData.logradouro || prev.street,
            neighborhood: viaData.bairro || prev.neighborhood,
            city: viaData.localidade || prev.city,
            state: viaData.uf || prev.state || 'MG'
          }));
        }
      } catch (viaErr) {
        console.warn('ViaCep error:', viaErr);
      }

      // 2. Calculate shipping quote
      const cepNum = parseInt(clean, 10) || 0;
      const isBh = cepNum >= 30000000 && cepNum <= 34999999;
      const isFree = totalCart >= 150;

      if (isBh) {
        const bhOption = {
          id: 'expresso_bh',
          name: 'Motoboy Expresso BH (1 a 6 horas)',
          price: isFree ? 0 : 14.90,
          original_price: 14.90,
          delivery_time: '1 a 6 horas',
          carrier: 'Motoboy Expresso BH',
          is_free: isFree,
          badge: isFree ? '🎉 FRETE GRÁTIS' : '⚡ 1 A 6 HORAS'
        };
        setAvailableShippingQuotes([bhOption]);
        setShippingQuotesPage(1);
        setSelectedShippingQuote(bhOption);
      } else {
        const calcRes = await apiService.calculateShipping(clean, totalQuantity || 1, totalCart || 79.9);
        if (calcRes && calcRes.quotes && calcRes.quotes.length > 0) {
          const quotesList = calcRes.quotes.map(q => ({
            id: String(q.id || q.name),
            name: `${q.company?.name ? q.company.name + ' - ' : ''}${q.name}`,
            price: parseFloat(q.price) || 0,
            delivery_time: `${q.delivery_time} dias úteis`,
            carrier: q.company?.name || 'Transportadora',
            badge: `📦 ${q.delivery_time} dias`
          }));
          setAvailableShippingQuotes(quotesList);
          setShippingQuotesPage(1);
          setSelectedShippingQuote(quotesList[0]);
        } else {
          const fallback = {
            id: 'pac_correios',
            name: 'Correios PAC',
            price: 24.90,
            delivery_time: '5 a 8 dias úteis',
            carrier: 'Correios',
            badge: '📦 5 a 8 dias'
          };
          setAvailableShippingQuotes([fallback]);
          setShippingQuotesPage(1);
          setSelectedShippingQuote(fallback);
        }
      }
    } catch (err) {
      setShippingError('Erro ao consultar o frete. Tente novamente.');
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const shippingFee = selectedShippingQuote ? parseFloat(selectedShippingQuote.price || 0) : 0;
  const finalOrderTotal = totalCart + shippingFee;

  const validateAddressForm = () => {
    if (!checkoutForm.name?.trim()) {
      alert("Por favor, preencha seu Nome Completo.");
      return false;
    }
    if (!checkoutForm.phone?.trim()) {
      alert("Por favor, preencha seu WhatsApp / Telefone com DDD.");
      return false;
    }
    if (!checkoutForm.email?.trim() || !checkoutForm.email.includes('@')) {
      alert("Por favor, preencha um E-mail válido para confirmação.");
      return false;
    }
    const cleanCep = (checkoutForm.cep || '').replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      alert("Por favor, digite seu CEP (8 dígitos) e clique em 'Buscar' para calcular o frete.");
      return false;
    }
    if (!checkoutForm.street?.trim() || !checkoutForm.number?.trim() || !checkoutForm.neighborhood?.trim() || !checkoutForm.city?.trim()) {
      alert("Por favor, preencha todos os dados do endereço (Rua, Número, Bairro e Cidade).");
      return false;
    }
    if (!selectedShippingQuote) {
      alert("Por favor, selecione uma opção de frete calculada para continuar.");
      return false;
    }
    return true;
  };

  const cleanCepStr = (checkoutForm.cep || '').replace(/\D/g, '');
  const isAddressComplete = Boolean(
    checkoutForm.name?.trim() &&
    checkoutForm.email?.trim() &&
    checkoutForm.phone?.trim() &&
    cleanCepStr.length === 8 &&
    checkoutForm.street?.trim() &&
    checkoutForm.number?.trim() &&
    checkoutForm.neighborhood?.trim() &&
    checkoutForm.city?.trim() &&
    selectedShippingQuote
  );

  const getFullAddressString = () => {
    return `${checkoutForm.street}, nº ${checkoutForm.number}${checkoutForm.complement ? ' - ' + checkoutForm.complement : ''}, ${checkoutForm.neighborhood}, ${checkoutForm.city} - ${checkoutForm.state || 'MG'}, CEP: ${checkoutForm.cep}`;
  };

  const handleCreateOrderRecord = async (paymentMethod = 'Pix') => {
    try {
      const fullAddress = getFullAddressString();
      const orderPayload = {
        customer_name: checkoutForm.name || currentUser?.name || 'Cliente Loja Online',
        customer_email: checkoutForm.email || currentUser?.email || '',
        customer_phone: checkoutForm.phone || currentUser?.phone || '',
        customer_address: fullAddress,
        customer_id: currentUser?.id || null,
        items: cart.map(i => ({
          code: i.code,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
          logistics_mode: selectedShippingQuote?.id === 'expresso_bh' ? 'expresso' : (i.logistics_mode || 'expresso'),
          lead_time: selectedShippingQuote?.delivery_time || i.lead_time || '1 a 6 horas'
        })),
        shipping_fee: shippingFee,
        shipping_carrier: selectedShippingQuote?.name || 'Expresso BH',
        total_amount: finalOrderTotal,
        payment_method: paymentMethod,
        fulfillment_mode: fulfillmentMode,
        recipient_count: fulfillmentMode === 'multi_recipient' ? (distribution.length || 1) : 1,
        neutral_packing: neutralPacking,
        notes: `Frete: ${selectedShippingQuote?.name || 'Padrão'} (R$ ${shippingFee.toFixed(2)}) | CEP: ${checkoutForm.cep}`,
        shipments: fulfillmentMode === 'multi_recipient' ? distribution.map((dist, idx) => ({
          recipient_id: dist.recipient_id || null,
          recipient_name: dist.recipient_name,
          recipient_phone: dist.recipient_phone,
          recipient_address: dist.recipient_address,
          logistics_mode: (dist.items.find(it => it.quantity > 0)?.logistics_mode) || 'expresso',
          items: dist.items.filter(it => it.quantity > 0)
        })) : null
      };

      if (createOrder) {
        const created = await createOrder(orderPayload);
        return created;
      }
      return null;
    } catch (err) {
      console.warn('Erro ao salvar pedido na base:', err);
      return null;
    }
  };

  // 1. Pagamento Direto com PIX Mercado Pago (QR Code na Tela)
  const checkoutMercadoPagoPix = async () => {
    if (!validateAddressForm()) return;
    setIsCheckoutLoading(true);
    try {
      const order = await handleCreateOrderRecord('Mercado Pago (PIX)');
      const orderId = order?.id || order?.order_number;
      
      let pixRes = null;
      if (orderId) {
        try {
          pixRes = await apiService.generateOrderPix(orderId);
        } catch (pErr) {
          console.warn('Erro ao gerar Pix no MP:', pErr);
        }
      }

      const pixCode = pixRes?.pix_code || order?.pix_code || `00020126580014br.gov.bcb.pix0136${order?.order_number || 'SNK-BH'}520400005303986540${finalOrderTotal.toFixed(2)}5802BR5914SNACK STORE BH6009BELO HORIZONTE62070503***6304`;
      const qrBase64 = pixRes?.pix_qr_code_base64 || order?.pix_qr_code_base64 || '';

      setPixModalData({
        order_id: order?.id,
        order_number: order?.order_number || ('SNK-' + Math.floor(1000 + Math.random() * 9000)),
        total_amount: finalOrderTotal,
        shipping_fee: shippingFee,
        shipping_carrier: selectedShippingQuote?.name,
        address: getFullAddressString(),
        customer_name: checkoutForm.name,
        customer_phone: checkoutForm.phone,
        customer_email: checkoutForm.email,
        pix_code: pixCode,
        pix_qr_code_base64: qrBase64
      });

      if (typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout', {
          content_ids: cart.map(item => item.code),
          content_type: 'product',
          value: finalOrderTotal,
          currency: 'BRL',
          num_items: totalQuantity
        });
      }
    } catch (e) {
      alert("Erro ao processar pagamento via PIX: " + e.message);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // 2. Pagamento com Cartão de Crédito / Mercado Pago Checkout
  const checkoutMercadoPagoCard = async () => {
    if (!validateAddressForm()) return;
    setIsCheckoutLoading(true);
    try {
      const order = await handleCreateOrderRecord('Mercado Pago (Cartão)');
      const response = await fetch('/api/checkout/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          shipping_fee: shippingFee,
          shipping_carrier: selectedShippingQuote?.name,
          order_id: order?.id,
          order_number: order?.order_number,
          customer: {
            ...checkoutForm,
            address: getFullAddressString()
          },
          fulfillment_mode: fulfillmentMode,
          distribution,
          neutral_packing: neutralPacking
        })
      });
      const data = await response.json();
      if (data.init_point) {
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'InitiateCheckout', {
            content_ids: cart.map(item => item.code),
            content_type: 'product',
            value: finalOrderTotal,
            currency: 'BRL',
            num_items: totalQuantity
          });
        }
        window.location.href = data.init_point;
      } else {
        alert("Erro ao gerar link de pagamento.");
      }
    } catch (e) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // 3. Finalizar pelo WhatsApp
  const checkoutWhatsAppDirect = async () => {
    if (!validateAddressForm()) return;
    let itensStr = "";
    cart.forEach(item => {
      const modeTag = item.logistics_mode === 'programado_7' ? ' [Programado 7d]' : item.logistics_mode === 'economico_15' ? ' [Econômico 15d]' : ' [Expresso BH]';
      itensStr += `- *${item.quantity}x ${item.name}*${modeTag} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    const fullAddr = getFullAddressString();
    const freightStr = `\n*FRETE & ENTREGA:*\nModalidade: ${selectedShippingQuote?.name || 'Expresso BH'}\nValor: ${shippingFee === 0 ? 'GRÁTIS' : 'R$ ' + shippingFee.toFixed(2)}`;
    const addressStr = `\n*ENDEREÇO DE ENTREGA:*\nDestinatário: ${checkoutForm.name}\nWhatsApp: ${checkoutForm.phone}\nE-mail: ${checkoutForm.email}\nEndereço: ${fullAddr}\n`;

    const msg = `Olá! Gostaria de finalizar meu pedido na Snack Store BH:\n\n*PRODUTOS:*\n${itensStr}${freightStr}${addressStr}\n*Subtotal:* R$ ${totalCart.toFixed(2)}\n*Frete:* ${shippingFee === 0 ? 'GRÁTIS' : 'R$ ' + shippingFee.toFixed(2)}\n*TOTAL FINAL:* R$ ${finalOrderTotal.toFixed(2)}\n\nPor favor, confirme a disponibilidade e a chave PIX para envio imediato!`;
    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`;
    
    await handleCreateOrderRecord('Pix / WhatsApp');

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: cart.map(item => item.code),
        content_type: 'product',
        value: finalOrderTotal,
        currency: 'BRL',
        num_items: totalQuantity
      });
    }

    window.open(url, '_blank');
    setCart([]);
    setDistribution([]);
    setIsCartOpen(false);
    setOrderSuccess(true);
  };

  const searchDropdownResults = searchTerm.trim() !== '' 
    ? activePerfumes.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];

  const searchBox = (style) => (
    <div style={{ position: 'relative', ...style }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar marcas, perfumes..."
          value={searchTerm}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '10px 16px 10px 40px', backgroundColor: 'var(--snack-cream)',
            border: '1px solid rgba(41,69,31,.08)', borderRadius: '99px', fontSize: '13px', outline: 'none', color: 'var(--snack-text)',
            fontFamily: 'var(--font-sans)', transition: 'border-color 0.2s'
          }}
          onFocusCapture={() => setIsSearchFocused(true)}
        />
        <Search size={16} style={{ position: 'absolute', left: '16px', color: 'var(--snack-muted)' }} />
      </div>

      {isSearchFocused && searchDropdownResults.length > 0 && (
        <div style={{
          position: 'absolute', top: '44px', left: 0, right: 0,
          backgroundColor: 'var(--snack-paper)', border: '1px solid var(--snack-border)',
          borderRadius: '12px', boxShadow: 'var(--box-shadow-premium)',
          zIndex: 120, overflow: 'hidden'
        }}>
          {searchDropdownResults.map(p => (
            <div
              key={`search-drop-${p.code}`}
              onClick={() => {
                setSearchTerm('');
                navigate(`/produto/${p.slug}`);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(41,69,31,.04)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-cream)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '6px', padding: '2px', border: '1px solid rgba(0,0,0,0.03)' }}>
                <img src={p.image} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--snack-text)', margin: 0 }}>{p.name}</h4>
                <p style={{ fontSize: '11px', color: 'var(--snack-muted)', margin: 0 }}>{p.brand}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (pathname.startsWith('/admin')) {
    return <AdminDashboard />;
  }

  // Dashboard Exclusiva do Revendedor VIP:
  // Área 100% isolada com Sidebar dedicada, sem cabeçalho e sem rodapé da loja pública
  if (pathname.startsWith('/revendedor') || (pathname.startsWith('/minha-conta') && role === 'revendedor')) {
    return <ResellerDashboard addToCart={addToCart} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--snack-paper)', color: 'var(--snack-text)', fontFamily: 'var(--font-sans)' }}>
      <SeoHead />

      {/* Faixa de Destaque Superior */}
      <div style={{ backgroundColor: 'var(--snack-green-dark)', color: 'var(--snack-cream)', textAlign: 'center', padding: '8px', fontSize: '11px', letterSpacing: '2px', fontWeight: '600', textTransform: 'uppercase', borderBottom: '1px solid rgba(196,161,90,0.2)' }}>
        ✨ FRETE GRÁTIS EM BH ACIMA DE R$ 150 • ENVIO PARA TODO O BRASIL
      </div>

      {/* Sticky Navbar Premium */}
      <nav className={isScrolled ? 'sticky-nav-active' : ''} style={{
        position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'var(--snack-paper)', borderBottom: '1px solid var(--snack-border)',
        padding: '16px 24px', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Primeira Linha: LOGO | BUSCA | MENU/BAG */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            
            <Link to="/" style={{ textDecoration: 'none' }} onClick={() => { setSearchTerm(''); setOrderSuccess(false); }}>
              <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '4px', color: 'var(--snack-green-dark)', fontFamily: 'var(--font-display)' }}>SNACK STORE</span>
            </Link>

            <div className="nav-search" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              {searchBox({ width: '100%', maxWidth: '420px' })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              
              {/* Account / Admin Action Button */}
              {isStaff ? (
                <button
                  onClick={() => navigate('/admin')}
                  style={{
                    backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', border: 'none',
                    padding: '7px 14px', borderRadius: '99px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 2px 10px rgba(23,43,20,0.2)'
                  }}
                  aria-label="Painel Administrativo"
                >
                  <Shield size={14} color="var(--snack-gold)" />
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Painel Admin</span>
                </button>
              ) : currentUser ? (
                <button
                  onClick={() => navigate('/minha-conta')}
                  style={{
                    backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.2)', color: 'var(--snack-green-dark)',
                    padding: '6px 14px', borderRadius: '99px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                  aria-label="Minha conta"
                >
                  <User size={15} />
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Minha Conta</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-green-dark)',
                    display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                  aria-label="Entrar na conta"
                >
                  <User size={18} />
                  <span className="nav-links" style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Entrar</span>
                </button>
              )}

              {/* BH & Região icon */}
              <button 
                onClick={() => navigate('/cidades')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-green-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}
                aria-label="Cidades atendidas"
              >
                <span className="nav-links" style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>BH & Região</span>
              </button>

              {/* Shopping Bag */}
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setIsCartOpen(true); }} aria-label="Ver sacola">
                <ShoppingBag size={22} style={{ color: 'var(--snack-green-dark)' }} />
                {cart.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    backgroundColor: 'var(--snack-gold)', color: 'var(--snack-green-dark)',
                    borderRadius: '50%', width: '16px', height: '16px',
                    fontSize: '9px', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </div>

              {/* Hamburger Menu button */}
              <button className="nav-hamburger" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-green-dark)', display: 'none' }}>
                <Menu size={26} />
              </button>

            </div>

          </div>

          {/* Segunda Linha: MENU CATEGORIAS (Escondido em Sticky se desejado, ou sutil) */}
          <div className="nav-links" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '28px', borderTop: '1px solid rgba(41,69,31,.04)', paddingTop: '10px' }}>
            <Link to="/mini-perfumes-25ml/" style={{ cursor: 'pointer', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--snack-text)', letterSpacing: '1px' }}>Todos</Link>
            
            {/* FEMININOS MEGA MENU */}
            <div className="mega-menu-trigger">
              <Link to="/perfumes-femininos/" style={{ cursor: 'pointer', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--snack-text)', letterSpacing: '1px', paddingBottom: '10px' }}>Femininos</Link>
              <div className="mega-menu-panel">
                <div className="mega-menu-image">
                  <img src="/assets/campaign/revised_IMG_3243.webp" alt="Perfume Feminino" />
                </div>
                <div className="mega-menu-content">
                  <h4 className="mega-menu-title">Femininos</h4>
                  <p className="mega-menu-desc">Descubra fragrâncias florais, doces, elegantes e marcantes em miniaturas 25ml.</p>
                  <div className="mega-menu-links">
                    <Link to="/mini-perfumes-25ml/?marca=Dior" className="mega-menu-link">Dior</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Carolina%20Herrera" className="mega-menu-link">Carolina Herrera</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Lanc%C3%B4me" className="mega-menu-link">Lancôme</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Chanel" className="mega-menu-link">Chanel</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Versace" className="mega-menu-link">Versace</Link>
                  </div>
                  <Link to="/perfumes-femininos/" className="mega-menu-cta">Ver Femininos →</Link>
                </div>
              </div>
            </div>

            {/* MASCULINOS MEGA MENU */}
            <div className="mega-menu-trigger">
              <Link to="/perfumes-masculinos/" style={{ cursor: 'pointer', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--snack-text)', letterSpacing: '1px', paddingBottom: '10px' }}>Masculinos</Link>
              <div className="mega-menu-panel">
                <div className="mega-menu-image">
                  <img src="/assets/campaign/revised_IMG_3248.webp" alt="Perfume Masculino" />
                </div>
                <div className="mega-menu-content">
                  <h4 className="mega-menu-title">Masculinos</h4>
                  <p className="mega-menu-desc">Dos frescos aos intensos. Fragrâncias premium para acompanhar cada momento.</p>
                  <div className="mega-menu-links">
                    <Link to="/mini-perfumes-25ml/?marca=Dior" className="mega-menu-link">Dior</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Giorgio%20Armani" className="mega-menu-link">Armani</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Paco%20Rabanne" className="mega-menu-link">Paco Rabanne</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Versace" className="mega-menu-link">Versace</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Carolina%20Herrera" className="mega-menu-link">Carolina Herrera</Link>
                  </div>
                  <Link to="/perfumes-masculinos/" className="mega-menu-cta">Ver Masculinos →</Link>
                </div>
              </div>
            </div>

            {/* BRAND COLLECTION MEGA MENU */}
            <div className="mega-menu-trigger">
              <Link to="/brand-collection/" style={{ cursor: 'pointer', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--snack-text)', letterSpacing: '1px', paddingBottom: '10px' }}>Brand Collection</Link>
              <div className="mega-menu-panel">
                <div className="mega-menu-image">
                  <img src="/assets/campaign/revised_IMG_3297.webp" alt="Brand Collection" />
                </div>
                <div className="mega-menu-content">
                  <h4 className="mega-menu-title">Brand Collection</h4>
                  <p className="mega-menu-desc">Ícones que você já conhece em frascos compactos de alta fixação.</p>
                  <div className="mega-menu-links">
                    <Link to="/brand-collection/catalogo/" className="mega-menu-link" style={{ fontWeight: 'bold', color: 'var(--snack-green-dark)' }}>📖 Ver Catálogo</Link>
                    <Link to="/brand-collection/equivalencias/" className="mega-menu-link" style={{ fontWeight: 'bold', color: 'var(--snack-gold)' }}>⇄ Equivalências</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Dior" className="mega-menu-link">Dior</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Chanel" className="mega-menu-link">Chanel</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Carolina%20Herrera" className="mega-menu-link">Carolina Herrera</Link>
                  </div>
                  <Link to="/brand-collection/" className="mega-menu-cta">Explorar Brand Collection →</Link>
                </div>
              </div>
            </div>

            {/* ARABIC COLLECTION MEGA MENU */}
            <div className="mega-menu-trigger">
              <Link to="/perfumes-arabes/" style={{ cursor: 'pointer', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--snack-gold)', letterSpacing: '1px', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '12px' }}>✦</span> Arabic Collection
              </Link>
              <div className="mega-menu-panel">
                <div className="mega-menu-image">
                  <img src="/assets/campaign/revised_IMG_3254.webp" alt="Arabic Collection" />
                </div>
                <div className="mega-menu-content">
                  <h4 className="mega-menu-title" style={{ color: 'var(--snack-gold)' }}>Arabic Collection</h4>
                  <p className="mega-menu-desc">A opulência e intensidade da perfumaria árabe. Lattafa, Armaf e Afnan.</p>
                  <div className="mega-menu-links">
                    <Link to="/mini-perfumes-25ml/?marca=Lattafa" className="mega-menu-link">Lattafa</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Armaf" className="mega-menu-link">Armaf</Link>
                    <Link to="/mini-perfumes-25ml/?marca=Afnan" className="mega-menu-link">Afnan</Link>
                  </div>
                  <Link to="/perfumes-arabes/" className="mega-menu-cta" style={{ color: 'var(--snack-gold)' }}>Explorar Arabic Collection →</Link>
                </div>
              </div>
            </div>

            <Link to="/atacado-revenda-perfumes/" style={{ cursor: 'pointer', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--snack-text)', letterSpacing: '1px' }}>Atacado</Link>
            <Link to="/blog/perfumes/" style={{ cursor: 'pointer', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--snack-text)', letterSpacing: '1px' }}>Blog</Link>

            <Link to="/grupos-whatsapp-perfumes/" style={{ cursor: 'pointer', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--snack-green-dark)', letterSpacing: '1px', border: '1px solid rgba(30,64,24,0.15)', padding: '6px 12px', borderRadius: '99px', backgroundColor: '#F6F2E9' }}>Grupo WhatsApp</Link>

            <Link to="/mini-perfumes-25ml/" style={{ cursor: 'pointer', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--snack-text)', letterSpacing: '1px' }}>Mais Vendidos</Link>
          </div>

        </div>
      </nav>

      {/* Menu lateral (celular) */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 130, display: 'flex' }}>
          <div onClick={() => setIsMenuOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}></div>
          <div style={{
            position: 'relative', width: '85%', maxWidth: '320px', height: '100%', backgroundColor: 'var(--snack-paper)',
            overflowY: 'auto', padding: '24px', boxShadow: '10px 0 30px rgba(0,0,0,0.1)', borderRight: '1px solid var(--snack-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '3px', color: 'var(--snack-green-dark)', fontFamily: 'var(--font-display)' }}>SNACK STORE</span>
              <button onClick={() => setIsMenuOpen(false)} aria-label="Fechar menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-green-dark)' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '28px' }}>
              {searchBox({ width: '100%' })}
            </div>

            <nav aria-label="Menu principal celular">
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { to: '/mini-perfumes-25ml/', label: 'Todos os Perfumes' },
                  { to: '/perfumes-femininos/', label: 'Femininos' },
                  { to: '/perfumes-masculinos/', label: 'Masculinos' },
                  { to: '/brand-collection/', label: 'Brand Collection' },
                  { to: '/brand-collection/catalogo/', label: '📖 Ver Catálogo' },
                  { to: '/brand-collection/equivalencias/', label: '⇄ Equivalências' },
                  { to: '/perfumes-arabes/', label: 'Arabic Collection' },
                  { to: '/atacado-revenda-perfumes/', label: 'Atacado e Revenda' },
                  { to: '/blog/perfumes/', label: 'Blog & Dicas' },
                  { to: '/grupos-whatsapp-perfumes/', label: '💬 Grupo WhatsApp' },
                  { to: '/cidades/', label: 'Cidades Atendidas' }
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '12px 4px', textDecoration: 'none', color: 'var(--snack-text)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(41,69,31,.05)' }}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '32px', backgroundColor: '#25D366', color: '#ffffff', textDecoration: 'none', padding: '14px', borderRadius: '999px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 12px rgba(37,211,102,0.2)' }}
            >
              💬 Falar no WhatsApp
            </a>
            <p style={{ fontSize: '11px', color: 'var(--snack-muted)', lineHeight: '1.8', marginTop: '24px' }}>
              📍 Belo Horizonte, MG<br />
              ✉️ contato@snackstorebh.com.br<br />
              ⏰ Seg a Sex - 9h às 18h
            </p>
          </div>
        </div>
      )}

      {orderSuccess ? (
        <main style={{ maxWidth: '500px', margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--snack-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: 'var(--snack-green-dark)', border: '1px solid var(--snack-border)' }}>
            <Check size={32} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>Pedido Redirecionado!</h2>
          <p style={{ color: 'var(--snack-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: 32 }}>
            Sua comanda com os perfumes foi gerada e enviada para o nosso WhatsApp. Clique no botão abaixo para retornar à Snack Store.
          </p>
          <button onClick={() => setOrderSuccess(false)} style={{ backgroundColor: 'var(--snack-green-dark)', border: 'none', color: 'var(--snack-cream)', padding: '14px 28px', borderRadius: '999px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', transition: 'background-color 0.2s' }}>
            Voltar à Loja
          </button>
        </main>
      ) : (
        <Routes>
          <Route path="/" element={<Home perfumes={activePerfumes} addToCart={addToCart} />} />
          <Route path="/produto/:slug" element={<ProductPage perfumes={activePerfumes} addToCart={addToCart} />} />
          
          {/* Autenticação e Área do Cliente / Revendedor */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/minha-conta" element={<CustomerPortal addToCart={addToCart} />} />
          <Route path="/revendedor" element={<ResellerDashboard addToCart={addToCart} />} />
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* Páginas de Legislações e Políticas */}
          <Route path="/politica-de-privacidade" element={<LegalPage type="privacy" />} />
          <Route path="/trocas-e-devolucoes" element={<LegalPage type="returns" />} />
          <Route path="/termos-de-servico" element={<LegalPage type="terms" />} />
          <Route path="/perguntas-frequentes" element={<LegalPage type="faq" />} />
          
          {/* Novas Páginas de SEO e Blog da Planilha */}
          <Route path="/brand-collection/catalogo" element={<BrandCollectionCatalogo perfumes={activePerfumes} addToCart={addToCart} />} />
          <Route path="/brand-collection/equivalencias" element={<BrandCollectionEquivalencias perfumes={activePerfumes} addToCart={addToCart} />} />
          <Route path="/atacado-revenda-perfumes" element={<AtacadoRevenda />} />
          <Route path="/blog/perfumes" element={<BlogHub />} />
          <Route path="/blog/:articleSlug" element={<ArticlePage />} />

          {/* Índice de Cidades */}
          <Route path="/cidades" element={<Cidades />} />

          {seoPages.map(page => (
            <Route key={page.slug} path={`/${page.slug}`} element={<SeoLandingPage pageSlug={page.slug} perfumes={activePerfumes} addToCart={addToCart} />} />
          ))}
          <Route path="/:categorySlug" element={<CategoryPage perfumes={activePerfumes} addToCart={addToCart} />} />
          
          {/* Catch-all 404 Page (Important for SEO) */}
          <Route path="*" element={
            <main style={{ padding: '120px 24px', textAlign: 'center', minHeight: '60vh' }}>
              <h1 style={{ fontSize: '48px', color: 'var(--snack-green-dark)' }}>404 - Página não encontrada</h1>
              <p style={{ marginTop: '16px', color: 'var(--snack-muted)' }}>A fragrância ou página que você procura não está aqui.</p>
              <Link to="/" style={{ display: 'inline-block', marginTop: '24px', backgroundColor: 'var(--snack-gold)', color: 'var(--snack-green-dark)', padding: '12px 24px', borderRadius: '999px', textDecoration: 'none', fontWeight: 'bold' }}>Voltar ao Início</Link>
            </main>
          } />
        </Routes>
      )}

      {/* Sacola / Carrinho Lateral */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={() => setIsCartOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}></div>
          
          <div style={{
            position: 'relative', width: '100%', maxWidth: '480px', height: '100%',
            backgroundColor: 'var(--snack-paper)', borderLeft: '1px solid var(--snack-border)', display: 'flex', flexDirection: 'column',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.12)'
          }}>
            
            {/* Added to Cart Header Toast Alert */}
            {justAdded && (
              <div style={{
                backgroundColor: 'var(--snack-green-dark)', color: 'var(--snack-cream)',
                padding: '14px 18px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
                borderBottom: '1px solid rgba(196,161,90,0.2)', position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', letterSpacing: '0.5px' }}>Sua fragrância já está na sacola. ✨</span>
                  <button onClick={() => setJustAdded(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.8 }} aria-label="Fechar alerta"><X size={14} /></button>
                </div>
                <p style={{ fontSize: '11px', opacity: 0.85, margin: 0, fontStyle: 'italic' }}>"{justAdded}" adicionado com sucesso.</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button 
                    onClick={() => setIsCartOpen(false)} 
                    style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', padding: '8px', borderRadius: '999px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  >
                    Continuar Descobrindo
                  </button>
                  <button 
                    onClick={() => { setJustAdded(null); setCartDrawerTab('cart'); }} 
                    style={{ flex: 1, backgroundColor: 'var(--snack-gold)', border: 'none', color: 'var(--snack-green-dark)', padding: '8px', borderRadius: '999px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  >
                    Ir Para Sacola
                  </button>
                </div>
              </div>
            )}

            {/* Step Tabs Header */}
            <div style={{
              display: 'flex', alignItems: 'stretch', borderBottom: '1px solid var(--snack-border)',
              backgroundColor: '#ffffff', flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => setCartDrawerTab('cart')}
                style={{
                  flex: 1, padding: '16px 12px', border: 'none', background: 'none',
                  borderBottom: cartDrawerTab === 'cart' ? '3px solid var(--snack-green-dark)' : '3px solid transparent',
                  color: cartDrawerTab === 'cart' ? 'var(--snack-green-dark)' : 'var(--snack-muted)',
                  fontWeight: cartDrawerTab === 'cart' ? '800' : '600',
                  fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <ShoppingBag size={16} />
                <span>1. Sacola ({totalQuantity})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (cart.length > 0) setCartDrawerTab('checkout');
                }}
                disabled={cart.length === 0}
                style={{
                  flex: 1, padding: '16px 12px', border: 'none', background: 'none',
                  borderBottom: cartDrawerTab === 'checkout' ? '3px solid var(--snack-green-dark)' : '3px solid transparent',
                  color: cartDrawerTab === 'checkout' ? 'var(--snack-green-dark)' : cart.length === 0 ? '#cbd5e1' : 'var(--snack-muted)',
                  fontWeight: cartDrawerTab === 'checkout' ? '800' : '600',
                  fontSize: '13px', cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <CreditCard size={16} />
                <span>2. Finalizar Pedido</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                style={{
                  padding: '0 16px', background: 'none', border: 'none', color: 'var(--snack-muted)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {cartDrawerTab === 'cart' ? (
              <>
                {/* Scrollable Cart Items List */}
                <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--snack-muted)', marginTop: '60px', padding: '0 20px' }}>
                      <ShoppingBag size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--snack-text)', marginBottom: '8px' }}>Sua sacola está vazia</h4>
                      <p style={{ fontSize: '13px', color: 'var(--snack-muted)', marginBottom: '20px' }}>Descubra nossas fragrâncias premium inspiradas nas maiores grifes do mundo.</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        style={{
                          backgroundColor: 'var(--snack-gold)', color: 'var(--snack-green-dark)',
                          border: 'none', padding: '12px 24px', borderRadius: '999px', fontSize: '12px',
                          fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px'
                        }}
                      >
                        Explorar Catálogo
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Dynamic BH Free Shipping Calculator */}
                      {totalCart >= 150 ? (
                        <div style={{
                          backgroundColor: 'rgba(41, 69, 31, 0.08)', color: 'var(--snack-green)',
                          padding: '12px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold',
                          textAlign: 'center', border: '1px solid rgba(41, 69, 31, 0.15)'
                        }}>
                          🎉 Parabéns! Você ganhou Frete Grátis em BH!
                        </div>
                      ) : (
                        <div style={{
                          backgroundColor: '#faf4e8', color: '#a67216',
                          padding: '12px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '500',
                          textAlign: 'center', border: '1px solid rgba(196, 161, 90, 0.25)'
                        }}>
                          Faltam <strong>R$ {(150 - totalCart).toFixed(2)}</strong> para o <strong>Frete Grátis em BH</strong>.
                        </div>
                      )}

                      {/* Item list */}
                      {cart.map(item => (
                        <div key={item.cartKey || item.code} style={{ display: 'flex', gap: '14px', borderBottom: '1px solid rgba(41,69,31,.08)', paddingBottom: '14px' }}>
                          <div style={{ width: '64px', height: '64px', border: '1px solid var(--snack-border)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '8px', flexShrink: 0 }}>
                            <img src={item.image} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0', color: 'var(--snack-text)', lineHeight: 1.3 }}>{item.name}</h4>
                              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--snack-green-dark)', whiteSpace: 'nowrap' }}>
                                R$ {(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>

                            {/* Shipping modality tag */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '3px 0 8px 0', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px',
                                backgroundColor: item.logistics_mode === 'programado_7' ? '#e0f2fe' : item.logistics_mode === 'economico_15' ? '#fef3c7' : '#dcfce7',
                                color: item.logistics_mode === 'programado_7' ? '#0369a1' : item.logistics_mode === 'economico_15' ? '#92400e' : '#166534'
                              }}>
                                {item.logistics_mode === 'programado_7' ? '📦 Programado (7d)' : item.logistics_mode === 'economico_15' ? '💰 Econômico (15d)' : '⚡ Expresso BH'}
                              </span>
                              <span style={{ fontSize: '10px', color: 'var(--snack-muted)' }}>
                                R$ {item.price.toFixed(2)}/un
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', border: '1px solid var(--snack-border)', borderRadius: '99px', overflow: 'hidden', backgroundColor: '#fff' }}>
                                <button onClick={() => updateQuantity(item.cartKey || item.code, item.quantity - 1)} style={{ border: 'none', background: 'none', padding: '3px 10px', cursor: 'pointer', color: 'var(--snack-green)', fontWeight: 'bold' }}>-</button>
                                <span style={{ fontSize: '11px', padding: '3px 8px', display: 'inline-block', minWidth: '20px', textAlign: 'center', fontWeight: 'bold', color: 'var(--snack-text)' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.cartKey || item.code, item.quantity + 1)} style={{ border: 'none', background: 'none', padding: '3px 10px', cursor: 'pointer', color: 'var(--snack-green)', fontWeight: 'bold' }}>+</button>
                              </div>
                              <button onClick={() => removeFromCart(item.cartKey || item.code)} style={{ border: 'none', background: 'none', color: '#d94646', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Remover</button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Fulfillment / Multi-Recipient Card for Resellers */}
                      {totalQuantity >= 5 ? (
                        <div style={{
                          backgroundColor: '#FFFFFF', border: '1px solid rgba(41, 69, 31, 0.15)',
                          borderRadius: '10px', padding: '12px 14px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Users size={14} color="var(--snack-green)" />
                              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                                Entrega / Destinatários
                              </span>
                            </div>
                            <span style={{ fontSize: '10px', backgroundColor: '#ecfdf5', color: '#065f46', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                              {totalQuantity} perfumes
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                            <button
                              type="button"
                              onClick={() => { setFulfillmentMode('single'); setDistribution([]); }}
                              style={{
                                flex: 1, padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                border: fulfillmentMode === 'single' ? '2px solid var(--snack-green-dark)' : '1px solid #e5e7eb',
                                backgroundColor: fulfillmentMode === 'single' ? '#f0fdf4' : '#ffffff',
                                color: fulfillmentMode === 'single' ? 'var(--snack-green-dark)' : '#6b7280',
                                cursor: 'pointer'
                              }}
                            >
                              1 Endereço Único
                            </button>
                            <button
                              type="button"
                              onClick={() => { setFulfillmentMode('multi_recipient'); setIsMultiRecipientOpen(true); }}
                              style={{
                                flex: 1, padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                border: fulfillmentMode === 'multi_recipient' ? '2px solid var(--snack-green-dark)' : '1px solid #e5e7eb',
                                backgroundColor: fulfillmentMode === 'multi_recipient' ? '#f0fdf4' : '#ffffff',
                                color: fulfillmentMode === 'multi_recipient' ? 'var(--snack-green-dark)' : '#6b7280',
                                cursor: 'pointer'
                              }}
                            >
                              Dividir p/ Clientes (Fulfillment)
                            </button>
                          </div>

                          {fulfillmentMode === 'multi_recipient' && (
                            <div style={{ backgroundColor: '#f8fafc', borderRadius: '6px', padding: '8px 10px', border: '1px solid #e2e8f0', fontSize: '11px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#334155', fontWeight: '600' }}>
                                  {distribution.length > 0 ? `✓ Configurado para ${distribution.length} destinatários` : '⚠️ Distribuição pendente'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsMultiRecipientOpen(true)}
                                  style={{ background: 'none', border: 'none', color: 'var(--snack-gold)', fontWeight: '800', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
                                >
                                  {distribution.length > 0 ? 'Editar' : 'Configurar Agora'}
                                </button>
                              </div>
                              {neutralPacking && (
                                <div style={{ color: '#059669', fontSize: '10px', fontWeight: '700', marginTop: '4px' }}>
                                  ✓ Embalagem Neutra ativada
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          backgroundColor: 'rgba(196, 161, 90, 0.08)', border: '1px dashed rgba(196, 161, 90, 0.4)',
                          borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: '#78541a'
                        }}>
                          💡 <strong>Para Revendedores:</strong> Adicione 5 ou mais perfumes para desbloquear a entrega direta para múltiplos endereços de clientes (Fulfillment) com Embalagem Neutra!
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Fixed Footer for Sacola Tab */}
                {cart.length > 0 && (
                  <div style={{
                    padding: '20px 24px', borderTop: '1px solid var(--snack-border)',
                    backgroundColor: '#ffffff', flexShrink: 0, boxShadow: '0 -4px 12px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--snack-muted)' }}>Subtotal dos Produtos:</span>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--snack-green-dark)' }}>R$ {totalCart.toFixed(2)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCartDrawerTab('checkout')}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--snack-gold)',
                        color: 'var(--snack-green-dark)',
                        border: 'none',
                        padding: '15px 20px',
                        borderRadius: '999px',
                        fontWeight: '800',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 15px rgba(196,161,90,0.35)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>Avançar para Entrega e Pagamento</span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      style={{
                        width: '100%', background: 'none', border: 'none', color: 'var(--snack-muted)',
                        fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
                        cursor: 'pointer', marginTop: '12px', textAlign: 'center'
                      }}
                    >
                      Continuar Comprando
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Back to Cart Bar */}
                <div style={{
                  padding: '12px 20px', backgroundColor: '#fcfaf6', borderBottom: '1px solid var(--snack-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
                }}>
                  <button
                    type="button"
                    onClick={() => setCartDrawerTab('cart')}
                    style={{
                      background: 'none', border: 'none', color: 'var(--snack-green-dark)',
                      fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <ArrowLeft size={15} />
                    <span>Voltar para Sacola</span>
                  </button>

                  <span style={{ fontSize: '11px', color: 'var(--snack-muted)', fontWeight: '600' }}>
                    {totalQuantity} {totalQuantity === 1 ? 'item' : 'itens'} • R$ {totalCart.toFixed(2)}
                  </span>
                </div>

                {/* Scrollable Checkout Form Body */}
                <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Resumo Compacto dos Itens Selecionados */}
                  <div style={{
                    backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid rgba(41,69,31,0.12)',
                    padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                        Itens do seu pedido ({totalQuantity})
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '2px' }}>
                        Subtotal: <strong>R$ {totalCart.toFixed(2)}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCartDrawerTab('cart')}
                      style={{
                        background: 'none', border: '1px solid var(--snack-border)', borderRadius: '6px',
                        padding: '4px 8px', fontSize: '10px', fontWeight: '700', color: 'var(--snack-green-dark)',
                        cursor: 'pointer'
                      }}
                    >
                      Editar Itens
                    </button>
                  </div>

                  {/* Formulário de Endereço */}
                  <div style={{
                    backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid rgba(41,69,31,0.15)',
                    padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}>
                      <MapPin size={16} color="var(--snack-green)" />
                      <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--snack-green-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Endereço de Entrega & Frete
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Nome Completo */}
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '3px' }}>
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Maria Oliveira Santos"
                          value={checkoutForm.name}
                          onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* WhatsApp & Email */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '3px' }}>
                            WhatsApp / Celular *
                          </label>
                          <input
                            type="tel"
                            placeholder="(31) 99999-9999"
                            value={checkoutForm.phone}
                            onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '3px' }}>
                            E-mail *
                          </label>
                          <input
                            type="email"
                            placeholder="seu@email.com"
                            value={checkoutForm.email}
                            onChange={e => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      {/* CEP com busca automática e botão */}
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '3px' }}>
                          CEP de Entrega *
                        </label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="text"
                            placeholder="00000-000"
                            maxLength={9}
                            value={checkoutForm.cep}
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
                              const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
                              setCheckoutForm(prev => ({ ...prev, cep: formatted }));
                              if (raw.length === 8) {
                                handleLookupCepAndShipping(raw);
                              }
                            }}
                            style={{ flex: 1, padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleLookupCepAndShipping(checkoutForm.cep)}
                            disabled={isCalculatingShipping}
                            style={{
                              backgroundColor: 'var(--snack-green-dark)', color: '#ffffff', border: 'none',
                              borderRadius: '6px', padding: '0 14px', fontSize: '11px', fontWeight: 'bold',
                              cursor: isCalculatingShipping ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            {isCalculatingShipping ? <Loader2 size={14} className="animate-spin" /> : 'Calcular'}
                          </button>
                        </div>
                        {shippingError && (
                          <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>
                            ⚠️ {shippingError}
                          </div>
                        )}
                      </div>

                      {/* Rua e Número */}
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '3px' }}>
                            Rua / Logradouro *
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Rua da Bahia"
                            value={checkoutForm.street}
                            onChange={e => setCheckoutForm({ ...checkoutForm, street: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '3px' }}>
                            Número *
                          </label>
                          <input
                            type="text"
                            placeholder="120"
                            value={checkoutForm.number}
                            onChange={e => setCheckoutForm({ ...checkoutForm, number: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      {/* Bairro e Complemento */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '3px' }}>
                            Bairro *
                          </label>
                          <input
                            type="text"
                            placeholder="Bairro"
                            value={checkoutForm.neighborhood}
                            onChange={e => setCheckoutForm({ ...checkoutForm, neighborhood: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '3px' }}>
                            Complemento (Opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Apto, Bloco..."
                            value={checkoutForm.complement}
                            onChange={e => setCheckoutForm({ ...checkoutForm, complement: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      {/* Cidade e Estado */}
                      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '3px' }}>
                            Cidade *
                          </label>
                          <input
                            type="text"
                            placeholder="Cidade"
                            value={checkoutForm.city}
                            onChange={e => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4b5563', marginBottom: '3px' }}>
                            UF *
                          </label>
                          <input
                            type="text"
                            maxLength={2}
                            placeholder="MG"
                            value={checkoutForm.state}
                            onChange={e => setCheckoutForm({ ...checkoutForm, state: e.target.value.toUpperCase() })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none', textAlign: 'center', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      {/* Seleção de Frete */}
                      <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px dashed #e5e7eb' }}>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--snack-green-dark)', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Opções de Envio:
                        </span>

                        {availableShippingQuotes.length > 0 ? (() => {
                          const quotesPerPage = 3;
                          const totalShippingPages = Math.ceil(availableShippingQuotes.length / quotesPerPage);
                          const currentPage = Math.min(Math.max(1, shippingQuotesPage), totalShippingPages);
                          const paginatedQuotes = availableShippingQuotes.slice((currentPage - 1) * quotesPerPage, currentPage * quotesPerPage);

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                maxHeight: '210px',
                                overflowY: 'auto',
                                paddingRight: '2px'
                              }}>
                                {paginatedQuotes.map(q => {
                                  const isSelected = selectedShippingQuote?.id === q.id;
                                  const isFree = q.price === 0;
                                  return (
                                    <div
                                      key={q.id}
                                      onClick={() => setSelectedShippingQuote(q)}
                                      style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                                        border: isSelected ? '2px solid var(--snack-green-dark)' : '1px solid #e5e7eb',
                                        backgroundColor: isSelected ? '#f0fdf4' : '#fafafa',
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                          type="radio"
                                          checked={isSelected}
                                          onChange={() => setSelectedShippingQuote(q)}
                                          style={{ accentColor: 'var(--snack-green-dark)', cursor: 'pointer' }}
                                        />
                                        <div>
                                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#1f2937' }}>
                                            {q.name}
                                          </div>
                                          <div style={{ fontSize: '10px', color: '#6b7280' }}>
                                            Prazo estimado: <strong>{q.delivery_time}</strong>
                                          </div>
                                        </div>
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                          fontSize: '12px', fontWeight: '900',
                                          color: isFree ? '#15803d' : 'var(--snack-green-dark)'
                                        }}>
                                          {isFree ? 'GRÁTIS' : `R$ ${parseFloat(q.price).toFixed(2)}`}
                                        </span>
                                        {q.badge && (
                                          <div style={{ fontSize: '9px', fontWeight: '700', color: isFree ? '#15803d' : '#b45309' }}>
                                            {q.badge}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Paginação de Fretes para não tampar a tela */}
                              {totalShippingPages > 1 && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  paddingTop: '6px',
                                  borderTop: '1px solid #f3f4f6',
                                  marginTop: '2px'
                                }}>
                                  <button
                                    type="button"
                                    disabled={currentPage <= 1}
                                    onClick={(e) => { e.preventDefault(); setShippingQuotesPage(p => Math.max(1, p - 1)); }}
                                    style={{
                                      padding: '4px 10px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      borderRadius: '6px',
                                      border: '1px solid #e5e7eb',
                                      backgroundColor: currentPage <= 1 ? '#f9fafb' : '#ffffff',
                                      color: currentPage <= 1 ? '#9ca3af' : 'var(--snack-green-dark)',
                                      cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    ← Anterior
                                  </button>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {Array.from({ length: totalShippingPages }).map((_, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setShippingQuotesPage(idx + 1); }}
                                        style={{
                                          width: '22px',
                                          height: '22px',
                                          borderRadius: '5px',
                                          border: currentPage === idx + 1 ? '1px solid var(--snack-green-dark)' : '1px solid #e5e7eb',
                                          backgroundColor: currentPage === idx + 1 ? 'var(--snack-green-dark)' : '#ffffff',
                                          color: currentPage === idx + 1 ? '#ffffff' : '#4b5563',
                                          fontSize: '11px',
                                          fontWeight: '700',
                                          cursor: 'pointer',
                                          padding: 0,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        {idx + 1}
                                      </button>
                                    ))}
                                  </div>

                                  <button
                                    type="button"
                                    disabled={currentPage >= totalShippingPages}
                                    onClick={(e) => { e.preventDefault(); setShippingQuotesPage(p => Math.min(totalShippingPages, p + 1)); }}
                                    style={{
                                      padding: '4px 10px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      borderRadius: '6px',
                                      border: '1px solid #e5e7eb',
                                      backgroundColor: currentPage >= totalShippingPages ? '#f9fafb' : '#ffffff',
                                      color: currentPage >= totalShippingPages ? '#9ca3af' : 'var(--snack-green-dark)',
                                      cursor: currentPage >= totalShippingPages ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    Próxima →
                                  </button>
                                </div>
                              )}

                              {/* Indicador de frete selecionado fora da página atual */}
                              {selectedShippingQuote && !paginatedQuotes.some(q => q.id === selectedShippingQuote.id) && (
                                <div style={{ fontSize: '10px', color: '#15803d', fontWeight: '700', textAlign: 'center', backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '4px' }}>
                                  ✓ Frete selecionado: {selectedShippingQuote.name} ({selectedShippingQuote.price === 0 ? 'GRÁTIS' : `R$ ${parseFloat(selectedShippingQuote.price).toFixed(2)}`})
                                </div>
                              )}
                            </div>
                          );
                        })() : (
                          <div style={{
                            backgroundColor: '#f9fafb', borderRadius: '6px', padding: '10px',
                            border: '1px solid #e5e7eb', fontSize: '11px', color: '#6b7280', textAlign: 'center'
                          }}>
                            {isCalculatingShipping ? 'Consultando transportadoras...' : 'Digite o seu CEP acima para calcular o valor e prazo de entrega.'}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Resumo Financeiro Completo com Frete */}
                  <div style={{
                    backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid rgba(41,69,31,0.15)',
                    padding: '12px 16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4b5563', marginBottom: '4px' }}>
                      <span>Subtotal dos Produtos:</span>
                      <span>R$ {totalCart.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4b5563', marginBottom: '8px' }}>
                      <span>Frete ({selectedShippingQuote ? (selectedShippingQuote.carrier || 'Entrega') : 'Pendente'}):</span>
                      <span style={{ fontWeight: '700', color: shippingFee === 0 && selectedShippingQuote ? '#15803d' : '#1f2937' }}>
                        {selectedShippingQuote ? (shippingFee === 0 ? 'GRÁTIS' : `R$ ${shippingFee.toFixed(2)}`) : 'Informe o CEP'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderTop: '1px solid #e5e7eb', paddingTop: '8px', fontWeight: '800',
                      fontSize: '16px', color: 'var(--snack-green-dark)'
                    }}>
                      <span>TOTAL DO PEDIDO:</span>
                      <span>R$ {finalOrderTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Alerta de Validação */}
                  {!isAddressComplete && (
                    <div style={{
                      backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px',
                      padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: '11px', color: '#92400e'
                    }}>
                      <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0 }} />
                      <span>
                        Preencha seu endereço completo e selecione o frete acima para liberar os botões de pagamento.
                      </span>
                    </div>
                  )}

                  {/* Botões de Pagamento */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Botão Principal: PIX Mercado Pago Direto na Tela */}
                    <button
                      onClick={checkoutMercadoPagoPix}
                      disabled={isCheckoutLoading || !isAddressComplete}
                      style={{
                        width: '100%',
                        background: !isAddressComplete ? '#9ca3af' : 'linear-gradient(135deg, #009EE3 0%, #007bb2 100%)',
                        color: '#ffffff', border: 'none', padding: '15px 12px', fontWeight: '800', fontSize: '12px',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        cursor: (!isAddressComplete || isCheckoutLoading) ? 'not-allowed' : 'pointer',
                        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: !isAddressComplete ? 'none' : '0 4px 14px rgba(0,158,227,0.3)',
                        opacity: isCheckoutLoading ? 0.7 : 1, transition: 'all 0.2s'
                      }}
                    >
                      {isCheckoutLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Gerando Pix Seguro...</span>
                        </>
                      ) : (
                        <>
                          <QrCode size={16} />
                          <span>Pagar Agora com PIX (Aprovação Imediata)</span>
                        </>
                      )}
                    </button>

                    {/* Botão Secundário: Cartão de Crédito Mercado Pago */}
                    <button
                      onClick={checkoutMercadoPagoCard}
                      disabled={isCheckoutLoading || !isAddressComplete}
                      style={{
                        width: '100%',
                        backgroundColor: !isAddressComplete ? '#e5e7eb' : '#1f2937',
                        color: !isAddressComplete ? '#9ca3af' : '#ffffff',
                        border: 'none', padding: '13px 12px', fontWeight: '700', fontSize: '11px',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        cursor: (!isAddressComplete || isCheckoutLoading) ? 'not-allowed' : 'pointer',
                        borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <CreditCard size={15} />
                      <span>Cartão de Crédito ou Parcelado (Mercado Pago)</span>
                    </button>

                    {/* Botão Terciário: WhatsApp */}
                    <button
                      onClick={checkoutWhatsAppDirect}
                      disabled={!isAddressComplete}
                      style={{
                        width: '100%',
                        backgroundColor: !isAddressComplete ? '#e5e7eb' : '#25D366',
                        color: !isAddressComplete ? '#9ca3af' : '#ffffff',
                        border: 'none', padding: '13px 12px', fontWeight: '700', fontSize: '11px',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        cursor: !isAddressComplete ? 'not-allowed' : 'pointer',
                        borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: !isAddressComplete ? 'none' : '0 4px 12px rgba(37,211,102,0.15)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>💬 Ou Comprar pelo WhatsApp com Atendente</span>
                    </button>
                  </div>

                  {/* Security Footer Notice */}
                  <div style={{
                    marginTop: '8px', textAlign: 'center', fontSize: '10px', color: '#9ca3af',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                  }}>
                    <span>🔒 Compra 100% Segura</span>
                    <span>•</span>
                    <span>⚡ Envio Rápido</span>
                    <span>•</span>
                    <span>🛡️ Garantia de Satisfação</span>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Botão flutuante WhatsApp */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Vim pelo site da Snack Store e quero mais informações.')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 105,
          width: '58px', height: '58px', borderRadius: '50%', backgroundColor: '#25D366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(37, 211, 102, 0.45)', color: '#ffffff',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </a>

      {/* Rodapé Profissional Redesenhado */}
      <footer style={{ backgroundColor: 'var(--snack-green-dark)', color: 'var(--snack-cream)', marginTop: '100px', borderTop: '1px solid rgba(196,161,90,0.1)' }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Snack Store BH",
          "url": "https://www.snackstorebh.com.br",
          "taxID": "32404968000170",
          "email": "contato@snackstorebh.com.br",
          "telephone": "+55-31-97565-0503",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Belo Horizonte",
            "addressLocality": "Belo Horizonte",
            "addressRegion": "MG",
            "addressCountry": "BR"
          },
          "sameAs": [
            "https://www.instagram.com/snackstorebh",
            "https://wa.me/553175650503"
          ]
        }) }} />

        {/* Faixa Newsletter Premium */}
        <div style={{ borderBottom: '1px solid rgba(245,241,232,0.06)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '28px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: 'var(--snack-gold)', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>ENTRE PARA A LISTA.</h3>
              <p style={{ fontSize: '13px', color: 'rgba(245,241,232,0.7)', margin: 0 }}>Novas fragrâncias, reposições e ofertas especiais direto no seu e-mail.</p>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); const email = e.target.email.value; window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Quero receber novidades e ofertas. Meu e-mail: ${email}`)}`, '_blank'); e.target.reset(); }}
              style={{ display: 'flex', gap: '10px', flex: '1 1 320px', maxWidth: '460px' }}
            >
              <input name="email" type="email" required placeholder="seu melhor e-mail" aria-label="Seu melhor e-mail" style={{ flex: 1, padding: '12px 18px', borderRadius: '999px', border: '1px solid rgba(245,241,232,0.15)', backgroundColor: 'rgba(0,0,0,0.15)', color: 'var(--snack-cream)', fontSize: '13px', outline: 'none' }} />
              <button type="submit" style={{ backgroundColor: 'var(--snack-gold)', color: 'var(--snack-green-dark)', border: 'none', padding: '12px 28px', borderRadius: '999px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background-color 0.2s' }}>Quero Receber</button>
            </form>
          </div>
        </div>

        <div style={{ padding: '60px 24px' }}>
          <div className="footer-grid" style={{ maxWidth: '1200px', margin: '0 auto', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', color: 'var(--snack-gold)' }}>Snack Store BH</h4>
              <p style={{ fontSize: '13px', color: 'rgba(245,241,232,0.7)', lineHeight: '1.8', maxWidth: '280px', margin: '0 0 16px 0' }}>
                Curadoria exclusiva de perfumes importados originais em frascos de miniatura 25ml. Elevando sua experiência olfativa com o melhor custo-benefício.
              </p>
              <address style={{ fontSize: '12px', color: 'rgba(245,241,232,0.5)', fontStyle: 'normal', lineHeight: '1.8', margin: '0 0 16px 0' }}>
                Belo Horizonte - MG • Brasil
              </address>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="https://www.instagram.com/snackstorebh" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(245,241,232,0.1)', color: 'var(--snack-cream)', transition: 'all 0.2s' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(245,241,232,0.1)', color: 'var(--snack-cream)', transition: 'all 0.2s' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </a>
              </div>
            </div>

            <nav aria-label="Categorias de produtos footer">
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', color: 'var(--snack-gold)' }}>Produtos</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'rgba(245,241,232,0.7)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/mini-perfumes-25ml/" style={{ color: 'inherit', textDecoration: 'none' }}>Todas as Miniaturas</Link></li>
                <li><Link to="/brand-collection/" style={{ color: 'inherit', textDecoration: 'none' }}>Brand Collection</Link></li>
                <li><Link to="/perfumes-arabes/" style={{ color: 'inherit', textDecoration: 'none' }}>Arabic Collection</Link></li>
                {footerProducts.map(p => (
                  <li key={p.code}><Link to={`/produto/${p.slug}/`} style={{ color: 'inherit', textDecoration: 'none' }}>{p.name}</Link></li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Regiões de entregas footer">
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', color: 'var(--snack-gold)' }}>Entregas</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'rgba(245,241,232,0.7)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/loja-de-perfumes-importados-bh" style={{ color: 'inherit', textDecoration: 'none' }}>Entregas em BH</Link></li>
                <li><Link to="/comprar-miniaturas-perfumes-sao-paulo" style={{ color: 'inherit', textDecoration: 'none' }}>Entregas em São Paulo</Link></li>
                <li><Link to="/cidades" style={{ textDecoration: 'none', fontWeight: 'bold', color: 'var(--snack-gold)' }}>Ver Cidades Atendidas</Link></li>
              </ul>
            </nav>

            <nav aria-label="Comunidade oficial footer">
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', color: 'var(--snack-gold)' }}>Comunidade</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'rgba(245,241,232,0.7)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/grupos-whatsapp-perfumes/" style={{ color: 'inherit', textDecoration: 'none' }}>Grupo de WhatsApp</Link></li>
                <li><Link to="/grupo-whatsapp-ofertas-perfumes/" style={{ color: 'inherit', textDecoration: 'none' }}>Ofertas de Perfumes</Link></li>
                <li><Link to="/grupo-whatsapp-perfumes-importados/" style={{ color: 'inherit', textDecoration: 'none' }}>Perfumes Importados</Link></li>
                <li><Link to="/grupo-whatsapp-perfumes-arabes/" style={{ color: 'inherit', textDecoration: 'none' }}>Perfumes Árabes</Link></li>
                <li><Link to="/grupo-whatsapp-miniaturas-perfumes/" style={{ color: 'inherit', textDecoration: 'none' }}>Miniaturas 25ml</Link></li>
              </ul>
            </nav>

            <nav aria-label="Políticas e ajuda footer">
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', color: 'var(--snack-gold)' }}>Ajuda e Políticas</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'rgba(245,241,232,0.7)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/politica-de-privacidade" style={{ color: 'inherit', textDecoration: 'none' }}>Política de Privacidade</Link></li>
                <li><Link to="/trocas-e-devolucoes" style={{ color: 'inherit', textDecoration: 'none' }}>Trocas e Devoluções</Link></li>
                <li><Link to="/termos-de-servico" style={{ color: 'inherit', textDecoration: 'none' }}>Termos de Serviço</Link></li>
                <li><Link to="/perguntas-frequentes" style={{ color: 'inherit', textDecoration: 'none' }}>Perguntas Frequentes (FAQ)</Link></li>
              </ul>
            </nav>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', color: 'var(--snack-gold)' }}>Contato</h4>
              <address style={{ fontSize: '13px', color: 'rgba(245,241,232,0.7)', lineHeight: '1.9', fontStyle: 'normal' }}>
                📍 Belo Horizonte, MG<br />
                💬 WhatsApp: (31) 97565-0503<br />
                ✉️ contato@snackstorebh.com.br<br />
                ⏰ Atendimento: Seg a Sex - 9h às 18h
              </address>
              <h4 style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', margin: '24px 0 12px 0', color: 'var(--snack-gold)' }}>Pagamento</h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['PIX', 'VISA', 'MASTERCARD', 'ELO', 'BOLETO'].map(p => (
                  <span key={p} style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '1px', border: '1px solid rgba(245,241,232,0.1)', borderRadius: '4px', padding: '5px 8px', color: 'rgba(245,241,232,0.5)' }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(245,241,232,0.06)', padding: '24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', fontSize: '11px', color: 'rgba(245,241,232,0.4)' }}>
            <span>© {new Date().getFullYear()} Snack Store BH • CNPJ: 32.404.968/0001-70 • Todos os direitos reservados.</span>
            <span>Loja de miniaturas de perfumes importados - Belo Horizonte, MG</span>
          </div>
        </div>
      </footer>

      {/* Fulfillment / Multi-Recipient Modal */}
      <MultiRecipientModal
        isOpen={isMultiRecipientOpen}
        onClose={() => setIsMultiRecipientOpen(false)}
        cart={cart}
        distribution={distribution}
        onSaveDistribution={newDist => {
          setDistribution(newDist);
          setFulfillmentMode('multi_recipient');
        }}
        neutralPacking={neutralPacking}
        setNeutralPacking={setNeutralPacking}
      />

      {/* Modal PIX Mercado Pago Direto na Tela */}
      {pixModalData && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 120,
          backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(0,158,227,0.2)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode size={20} color="#009EE3" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827' }}>Pagamento via PIX</h3>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Mercado Pago • Pedido #{pixModalData.order_number}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setPixModalData(null); setIsCartOpen(false); setCart([]); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {/* Total value callout */}
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', color: '#166534', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Valor Total a Pagar</span>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#15803d', marginTop: '2px' }}>
                R$ {parseFloat(pixModalData.total_amount).toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: '#166534', marginTop: '4px' }}>
                Inclui frete via <strong>{pixModalData.shipping_carrier || 'Entrega Expressa'}</strong> ({pixModalData.shipping_fee === 0 ? 'Grátis' : `R$ ${pixModalData.shipping_fee?.toFixed(2)}`})
              </div>
            </div>

            {/* QR Code */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                display: 'inline-block', padding: '12px', backgroundColor: '#ffffff',
                borderRadius: '16px', border: '2px solid #009EE3', boxShadow: '0 4px 16px rgba(0,158,227,0.1)'
              }}>
                {pixModalData.pix_qr_code_base64 ? (
                  <img
                    src={`data:image/png;base64,${pixModalData.pix_qr_code_base64}`}
                    alt="QR Code Pix Mercado Pago"
                    style={{ width: '220px', height: '220px', display: 'block', margin: '0 auto' }}
                  />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixModalData.pix_code || '')}`}
                    alt="QR Code Pix"
                    style={{ width: '220px', height: '220px', display: 'block', margin: '0 auto' }}
                  />
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '10px 0 0 0' }}>
                Abra o app do seu banco e escaneie o código acima
              </p>
            </div>

            {/* Pix Copia e Cola */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#374151', marginBottom: '6px' }}>
                Ou Copie o Código PIX (Copia e Cola):
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={pixModalData.pix_code || ''}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db',
                    fontSize: '11px', fontFamily: 'monospace', backgroundColor: '#f9fafb', color: '#4b5563'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (pixModalData.pix_code) {
                      navigator.clipboard.writeText(pixModalData.pix_code);
                      setCopiedPix(true);
                      setTimeout(() => setCopiedPix(false), 3500);
                    }
                  }}
                  style={{
                    backgroundColor: copiedPix ? '#15803d' : '#009EE3', color: '#ffffff',
                    border: 'none', borderRadius: '8px', padding: '0 16px', fontWeight: '700',
                    fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'background-color 0.2s', flexShrink: 0
                  }}
                >
                  {copiedPix ? <CheckCheck size={16} /> : <Copy size={16} />}
                  {copiedPix ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Delivery address review */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '11px' }}>
              <div style={{ fontWeight: '700', color: '#334155', marginBottom: '4px' }}>📍 Destino da Entrega:</div>
              <div style={{ color: '#64748b' }}>{pixModalData.address}</div>
              <div style={{ color: '#64748b', marginTop: '4px' }}>Destinatário: <strong>{pixModalData.customer_name}</strong> • Tel: <strong>{pixModalData.customer_phone}</strong></div>
            </div>

            {/* WhatsApp confirmation button */}
            <a
              href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(`Olá! Acabei de realizar o pagamento do Pedido #${pixModalData.order_number} via PIX Mercado Pago no valor de R$ ${parseFloat(pixModalData.total_amount).toFixed(2)}.\n\nNome: ${pixModalData.customer_name}\nEndereço: ${pixModalData.address}\n\nSegue meu comprovante:`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '100%', backgroundColor: '#25D366', color: '#ffffff', border: 'none',
                padding: '14px 0', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase',
                letterSpacing: '0.5px', cursor: 'pointer', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 12px rgba(37,211,102,0.25)', textDecoration: 'none', marginBottom: '10px'
              }}
            >
              💬 Já Paguei! Enviar Comprovante no WhatsApp
            </a>

            <button
              type="button"
              onClick={() => { setPixModalData(null); setIsCartOpen(false); setCart([]); }}
              style={{
                width: '100%', backgroundColor: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb',
                padding: '10px 0', fontWeight: '600', fontSize: '12px', cursor: 'pointer', borderRadius: '8px'
              }}
            >
              Fechar e Concluir Pedido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
