import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Check, Menu, X, User, Shield, Users, Truck, Box, Sparkles } from 'lucide-react';
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

const WHATSAPP_NUMBER = "553175650503"; // Número comercial BH

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentUser, role, isStaff } = useAuth();
  const { products, createOrder } = useStoreData();
  const activePerfumes = products && products.length > 0 ? products : perfumes;
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name: "", email: "" });
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
    const item = cart.find(i => (i.cartKey || i.code) === key);
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

  // Auto-reset fulfillment mode if cart drops below 5 units
  useEffect(() => {
    if (totalQuantity < 5 && fulfillmentMode === 'multi_recipient') {
      setFulfillmentMode('single');
      setDistribution([]);
    }
  }, [totalQuantity, fulfillmentMode]);

  const handleCreateOrderRecord = async (paymentMethod = 'Pix') => {
    try {
      const orderPayload = {
        customer_name: checkoutForm.name || currentUser?.name || 'Cliente Loja Online',
        customer_email: checkoutForm.email || currentUser?.email || '',
        customer_phone: currentUser?.phone || '',
        customer_address: currentUser?.address || '',
        customer_id: currentUser?.id || null,
        items: cart.map(i => ({
          code: i.code,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          logistics_mode: i.logistics_mode || 'expresso',
          lead_time: i.lead_time || '1 a 2 dias úteis'
        })),
        total_amount: totalCart,
        payment_method: paymentMethod,
        fulfillment_mode: fulfillmentMode,
        recipient_count: fulfillmentMode === 'multi_recipient' ? (distribution.length || 1) : 1,
        neutral_packing: neutralPacking,
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
        await createOrder(orderPayload);
      }
    } catch (err) {
      console.warn('Erro ao salvar pedido na base:', err);
    }
  };

  const checkoutMercadoPago = async () => {
    if (!checkoutForm.name || !checkoutForm.email) {
      alert("Por favor, preencha nome e e-mail para continuar para o Mercado Pago.");
      return;
    }
    setIsCheckoutLoading(true);
    try {
      await handleCreateOrderRecord('Mercado Pago');
      const response = await fetch('/api/checkout/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customer: checkoutForm,
          fulfillment_mode: fulfillmentMode,
          distribution,
          neutral_packing: neutralPacking
        })
      });
      const data = await response.json();
      if (data.init_point) {
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
  
  const checkoutWhatsAppDirect = async () => {
    let itensStr = "";
    cart.forEach(item => {
      const modeTag = item.logistics_mode === 'programado_7' ? ' [Programado 7d]' : item.logistics_mode === 'economico_15' ? ' [Econômico 15d]' : ' [Expresso BH]';
      itensStr += `- *${item.quantity}x ${item.name}*${modeTag} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    let fulfillmentStr = "";
    if (fulfillmentMode === 'multi_recipient' && distribution.length > 0) {
      fulfillmentStr = `\n*MODALIDADE FULFILLMENT / MULTI-DESTINATÁRIOS:*\nEmbalagem Neutra: ${neutralPacking ? 'SIM' : 'NÃO'}\n`;
      distribution.forEach((d, idx) => {
        const destItems = (d.items || []).filter(i => i.quantity > 0).map(i => `${i.quantity}x ${i.name}`).join(', ');
        fulfillmentStr += `> *Destino ${idx + 1}:* ${d.recipient_name} (${d.recipient_address}) -> Itens: ${destItems}\n`;
      });
    }

    const msg = `Olá! Gostaria de finalizar meu pedido na Snack Store:\n\n*Produtos:*\n${itensStr}${fulfillmentStr}\n*Total:* R$ ${totalCart.toFixed(2)}\n\nPor favor, envie as opções de Pix e confirmação de entrega!`;
    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`;
    
    await handleCreateOrderRecord('Pix / WhatsApp');

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: cart.map(item => item.code),
        content_type: 'product',
        value: totalCart,
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
            position: 'relative', width: '100%', maxWidth: '400px', height: '100%',
            backgroundColor: 'var(--snack-paper)', borderLeft: '1px solid var(--snack-border)', display: 'flex', flexDirection: 'column',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.08)'
          }}>
            
            {/* Added to Cart Header Toast Alert */}
            {justAdded && (
              <div style={{
                backgroundColor: 'var(--snack-green-dark)', color: 'var(--snack-cream)',
                padding: '16px 20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px',
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
                    onClick={() => setJustAdded(null)} 
                    style={{ flex: 1, backgroundColor: 'var(--snack-gold)', border: 'none', color: 'var(--snack-green-dark)', padding: '8px', borderRadius: '999px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  >
                    Ir Para Sacola
                  </button>
                </div>
              </div>
            )}

            <div style={{ padding: '24px', borderBottom: '1px solid var(--snack-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--snack-green-dark)', fontFamily: 'var(--font-display)' }}>Sacola ({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', color: 'var(--snack-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Fechar</button>
            </div>

            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--snack-muted)', marginTop: '40px', fontSize: '14px' }}>Sacola vazia</div>
              ) : (
                cart.map(item => (
                  <div key={item.cartKey || item.code} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(41,69,31,.06)', paddingBottom: '16px' }}>
                    <div style={{ width: '60px', height: '60px', border: '1px solid var(--snack-border)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '8px', flexShrink: 0 }}>
                      <img src={item.image} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0', color: 'var(--snack-text)' }}>{item.name}</h4>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Shipping modality tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0 8px 0', flexWrap: 'wrap' }}>
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
                        <div style={{ display: 'flex', border: '1px solid var(--snack-border)', borderRadius: '99px', overflow: 'hidden' }}>
                          <button onClick={() => updateQuantity(item.cartKey || item.code, item.quantity - 1)} style={{ border: 'none', background: 'none', padding: '2px 10px', cursor: 'pointer', color: 'var(--snack-green)' }}>-</button>
                          <span style={{ fontSize: '11px', padding: '2px 8px', display: 'inline-block', minWidth: '20px', textAlign: 'center', fontWeight: 'bold', color: 'var(--snack-text)' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartKey || item.code, item.quantity + 1)} style={{ border: 'none', background: 'none', padding: '2px 10px', cursor: 'pointer', color: 'var(--snack-green)' }}>+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.cartKey || item.code)} style={{ border: 'none', background: 'none', color: '#d94646', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Remover</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '24px', borderTop: '1px solid var(--snack-border)', backgroundColor: 'var(--snack-cream)', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                
                {/* Dynamic BH Free Shipping Calculator */}
                {totalCart >= 150 ? (
                  <div style={{
                    backgroundColor: 'rgba(41, 69, 31, 0.08)', color: 'var(--snack-green)',
                    padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold',
                    marginBottom: '16px', textAlign: 'center', border: '1px solid rgba(41, 69, 31, 0.15)'
                  }}>
                    🎉 Parabéns! Você ganhou Frete Grátis em BH!
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#faf4e8', color: '#a67216',
                    padding: '12px', borderRadius: '8px', fontSize: '11px', fontWeight: '500',
                    marginBottom: '16px', textAlign: 'center', border: '1px solid rgba(196, 161, 90, 0.25)'
                  }}>
                    Faltam <strong>R$ {(150 - totalCart).toFixed(2)}</strong> para o <strong>Frete Grátis em BH</strong>.
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', marginBottom: '16px', color: 'var(--snack-green-dark)' }}>
                  <span>Subtotal:</span>
                  <span>R$ {totalCart.toFixed(2)}</span>
                </div>

                {/* Fulfillment / Multi-Recipient Card */}
                {totalQuantity >= 5 ? (
                  <div style={{
                    backgroundColor: '#FFFFFF', border: '1px solid rgba(41, 69, 31, 0.15)',
                    borderRadius: '10px', padding: '12px 14px', marginBottom: '16px',
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
                    borderRadius: '8px', padding: '8px 12px', marginBottom: '16px', fontSize: '11px', color: '#78541a'
                  }}>
                    💡 <strong>Para Revendedores:</strong> Adicione 5 ou mais perfumes para desbloquear a entrega direta para múltiplos endereços de clientes (Fulfillment) com Embalagem Neutra!
                  </div>
                )}
                
                <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <input type="text" placeholder="Seu Nome Completo" value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '12px', outline: 'none' }} />
                  <input type="email" placeholder="Seu E-mail" value={checkoutForm.email} onChange={e => setCheckoutForm({...checkoutForm, email: e.target.value})} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '12px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={checkoutMercadoPago}
                    disabled={isCheckoutLoading}
                    style={{
                      width: '100%', backgroundColor: '#009EE3', color: '#ffffff', border: 'none',
                      padding: '16px 0', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase',
                      letterSpacing: '1px', cursor: isCheckoutLoading ? 'not-allowed' : 'pointer', borderRadius: '999px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isCheckoutLoading ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(0,158,227,0.2)', transition: 'background-color 0.2s'
                    }}
                  >
                    {isCheckoutLoading ? 'Aguarde...' : 'Pagar Agora (Cartão/PIX)'}
                  </button>
                  <button
                    onClick={checkoutWhatsAppDirect}
                    style={{
                      width: '100%', backgroundColor: '#25D366', color: '#ffffff', border: 'none',
                      padding: '16px 0', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase',
                      letterSpacing: '1px', cursor: 'pointer', borderRadius: '999px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 4px 12px rgba(37,211,102,0.15)', transition: 'background-color 0.2s'
                    }}
                  >
                    Ou Comprar pelo WhatsApp
                  </button>
                </div>
                </>

              </div>
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

    </div>
  );
}
