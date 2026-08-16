import React, { useState, useEffect } from 'react';
import { perfumes } from './perfumesData';
import { 
  ShoppingBag, 
  Trash2, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Tag, 
  ArrowRight,
  SlidersHorizontal,
  X,
  RotateCcw
} from 'lucide-react';

const WHATSAPP_NUMBER = "553175650503"; // Número comercial BH

export default function App() {
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  
  // Filtros Avançados
  const [brandFilter, setBrandFilter] = useState('Todos');
  const [noteFilter, setNoteFilter] = useState('Todos');
  
  const [activeTab, setActiveTab] = useState('home'); // home | product | success | filters
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [recentBuyer, setRecentBuyer] = useState(null);
  const names = ['Ana Silva', 'Marcos Souza', 'Mariana Costa', 'Gabriel Santos', 'Juliana Rezende', 'Thiago Moreira'];
  const cities = ['Savassi, BH', 'Lourdes, BH', 'Buritis, BH', 'Belvedere, BH', 'Sion, BH', 'Pampulha, BH'];
  const perfumesList = perfumes.map(p => p.name);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomPerfume = perfumesList[Math.floor(Math.random() * perfumesList.length)];
      setRecentBuyer({ name: randomName, city: randomCity, product: randomPerfume });
      
      setTimeout(() => {
        setRecentBuyer(null);
      }, 5000);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.code === product.code);
    if (existing) {
      setCart(cart.map(item => item.code === product.code ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (code) => {
    setCart(cart.filter(item => item.code !== code));
  };

  const updateQuantity = (code, qty) => {
    if (qty <= 0) {
      removeFromCart(code);
      return;
    }
    setCart(cart.map(item => item.code === code ? { ...item, quantity: qty } : item));
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setActiveTab('product');
    setSearchTerm('');
    setIsSearchFocused(false);
    window.scrollTo(0, 0);
  };

  const totalCart = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const allBrands = ['Todos', ...new Set(perfumes.map(p => p.brand))];
  const allNotes = ['Todos', ...new Set(perfumes.flatMap(p => p.notes))].slice(0, 15);

  const filteredPerfumes = perfumes.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' || p.gender === categoryFilter;
    const matchesBrand = brandFilter === 'Todos' || p.brand === brandFilter;
    const matchesNote = noteFilter === 'Todos' || p.notes.includes(noteFilter);
    return matchesSearch && matchesCategory && matchesBrand && matchesNote;
  });

  // Filtros rápidos para o dropdown de busca
  const searchDropdownResults = searchTerm.trim() !== '' 
    ? perfumes.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];

  const getRelatedPerfumes = (currentCode) => {
    return perfumes.filter(p => p.code !== currentCode).slice(0, 4);
  };

  const resetAllFilters = () => {
    setCategoryFilter('Todos');
    setBrandFilter('Todos');
    setNoteFilter('Todos');
    setSearchTerm('');
  };

  const navigateToCategory = (gender) => {
    setCategoryFilter(gender);
    setActiveTab('filters');
    window.scrollTo(0, 0);
  };

  const buyNowWhatsApp = (product) => {
    const msg = `Olá! Gostaria de comprar agora a miniatura:\n- *1x ${product.name}* (25ml) - R$ 79,90.\n\nPor favor, envie as informações de entrega e o Pix para Belo Horizonte!`;
    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const checkoutWhatsAppDirect = () => {
    let itensStr = "";
    cart.forEach(item => {
      itensStr += `- *${item.quantity}x ${item.name}* (${item.volume}) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    const msg = `Olá! Gostaria de finalizar meu pedido na Snack Store:\n\n*Produtos:*\n${itensStr}\n*Total:* R$ ${totalCart.toFixed(2)}\n\nPor favor, envie as opções de Pix e prazo de entrega expressa em BH!`;
    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    
    setCart([]);
    setIsCartOpen(false);
    setActiveTab('success');
  };

  const promoPerfumes = perfumes.slice(0, 4);
  const trendingPerfumes = perfumes.slice(4, 8);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#1a1a1a', fontFamily: '"Outfit", sans-serif' }}>
      
      {/* Faixa de Destaque */}
      <div style={{ backgroundColor: '#000000', color: '#ffffff', textAlign: 'center', padding: '8px', fontSize: '11px', letterSpacing: '2px', fontWeight: '500', textTransform: 'uppercase' }}>
        ✨ GANHE FRETE GRÁTIS EM BELO HORIZONTE PARA COMPRAS ACIMA DE R$ 150
      </div>

      {/* Prova Social */}
      {recentBuyer && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '20px', zIndex: 999,
          backgroundColor: '#ffffff', border: '1px solid #e0e0e0',
          borderRadius: '4px', padding: '16px', maxWidth: '320px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderLeft: '4px solid #000000'
        }}>
          <p style={{ fontSize: '10px', color: '#888888', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Pedido Recente</p>
          <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0', color: '#000000' }}>{recentBuyer.name} ({recentBuyer.city})</p>
          <p style={{ fontSize: '12px', color: '#555555', margin: 0 }}>Comprou 1x {recentBuyer.product}</p>
        </div>
      )}

      {/* Navbar Snack Store Clean */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0', padding: '20px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Logo */}
          <div style={{ cursor: 'pointer' }} onClick={() => { setActiveTab('home'); setSelectedProduct(null); }}>
            <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '3px', color: '#000000', fontFamily: 'serif' }}>SNACK STORE</span>
          </div>

          {/* Buscador Central com Dropdown Sugestivo de Produtos */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Buscar marcas, perfumes..."
                value={searchTerm}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay para clique no item
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (activeTab === 'home') {
                    // Direcionar para filtro se o usuario digitar algo
                    setActiveTab('filters');
                  }
                }}
                style={{
                  width: '100%', padding: '10px 16px 10px 40px', backgroundColor: '#f5f5f5',
                  border: 'none', borderRadius: '99px', fontSize: '13px', outline: 'none', color: '#000000'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '16px', color: '#888888' }} />
            </div>

            {/* Dropdown de Sugestões de Busca */}
            {isSearchFocused && searchDropdownResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '44px', left: 0, right: 0,
                backgroundColor: '#ffffff', border: '1px solid #e0e0e0',
                borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                zIndex: 120, overflow: 'hidden'
              }}>
                {searchDropdownResults.map(p => (
                  <div 
                    key={`search-drop-${p.code}`}
                    onClick={() => openProductDetails(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f9f9f9',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={p.image} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>{p.name}</h4>
                      <p style={{ fontSize: '11px', color: '#888888', margin: 0 }}>{p.brand}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Menus e Sacola */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: activeTab === 'filters' && categoryFilter === 'Todos' ? '#000' : '#888' }} onClick={() => { setCategoryFilter('Todos'); setActiveTab('filters'); }}>Todos</span>
            <span style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: activeTab === 'filters' && categoryFilter === 'Feminino' ? '#000' : '#888' }} onClick={() => navigateToCategory('Feminino')}>Femininos</span>
            <span style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: activeTab === 'filters' && categoryFilter === 'Masculino' ? '#000' : '#888' }} onClick={() => navigateToCategory('Masculino')}>Masculinos</span>
            
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { if (cart.length > 0) setIsCartOpen(true); }}>
              <ShoppingBag size={22} style={{ color: '#000000' }} />
              {cart.length > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  backgroundColor: '#000000', color: '#ffffff',
                  borderRadius: '50%', width: '16px', height: '16px',
                  fontSize: '9px', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </div>
          </div>

        </div>
      </nav>

      {/* ROTA DA PÁGINA INICIAL */}
      {activeTab === 'home' && (
        <>
          {/* Hero Banner Principal */}
          <div className="hero-banner" style={{ position: 'relative', height: '380px', backgroundColor: '#f6f6f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <div style={{ textAlign: 'center', zIndex: 10, padding: '0 20px' }}>
              <span style={{ color: '#888888', fontSize: '11px', letterSpacing: '3px', fontWeight: 'bold', textTransform: 'uppercase' }}>O LUXO DO ORIENTE EM BELO HORIZONTE</span>
              <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#000000', margin: '12px 0 20px 0', fontFamily: 'serif', letterSpacing: '1px' }}>Miniaturas de Perfumes 25 ml</h1>
              <p style={{ color: '#555555', fontSize: '15px', maxWidth: '600px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
                Frascos luxuosos de 25ml com fragrâncias originais de alta fixação. Compre com exclusividade por apenas R$ 79,90.
              </p>
              <button 
                onClick={() => {
                  setActiveTab('filters');
                  window.scrollTo(0, 0);
                }}
                style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', padding: '14px 36px', fontWeight: 'bold', letterSpacing: '1px', fontSize: '12px', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px' }}
              >
                Filtrar Todos os Perfumes
              </button>
            </div>
          </div>

          {/* Banner de Categorias (Masculino e Feminino) */}
          <section style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 16px' }}>
            <div className="category-grid">
              
              {/* Bloco Feminino */}
              <div 
                onClick={() => navigateToCategory('Feminino')}
                style={{
                  position: 'relative', height: '240px', backgroundColor: '#faf4f4', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px',
                  borderRadius: '4px', border: '1px solid #f0e6e6', overflow: 'hidden'
                }}
              >
                <div style={{ zIndex: 10 }}>
                  <span style={{ fontSize: '11px', color: '#c29a9a', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Coleção Feminina</span>
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000000', margin: '8px 0 16px 0', fontFamily: 'serif' }}>Suave &amp; Gourmand</h3>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    VER PRODUTOS COM FILTROS <ArrowRight size={14} />
                  </span>
                </div>
                <div style={{ position: 'absolute', right: '10%', bottom: '-10%', fontSize: '120px', color: '#f3e6e6', fontFamily: 'serif', pointerEvents: 'none' }}>♀</div>
              </div>

              {/* Bloco Masculino */}
              <div 
                onClick={() => navigateToCategory('Masculino')}
                style={{
                  position: 'relative', height: '240px', backgroundColor: '#f4f6fa', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px',
                  borderRadius: '4px', border: '1px solid #e6ebf0', overflow: 'hidden'
                }}
              >
                <div style={{ zIndex: 10 }}>
                  <span style={{ fontSize: '11px', color: '#9ab0c2', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Coleção Masculina</span>
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000000', margin: '8px 0 16px 0', fontFamily: 'serif' }}>Amadeirado &amp; Intenso</h3>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    VER PRODUTOS COM FILTROS <ArrowRight size={14} />
                  </span>
                </div>
                <div style={{ position: 'absolute', right: '10%', bottom: '-10%', fontSize: '120px', color: '#e6ebf3', fontFamily: 'serif', pointerEvents: 'none' }}>♂</div>
              </div>

            </div>
          </section>

          {/* Apresentação 1: Ofertas */}
          <section style={{ maxWidth: '1200px', margin: '64px auto', padding: '0 16px' }}>
            <div style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Tag size={20} style={{ color: '#000000' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>OFERTAS IMPERDÍVEIS</h2>
            </div>

            <div className="product-grid">
              {promoPerfumes.map(perfume => (
                <div 
                  key={`promo-${perfume.code}`}
                  onClick={() => openProductDetails(perfume)}
                  style={{ cursor: 'pointer', backgroundColor: '#ffffff' }}
                >
                  <div style={{ height: '220px', border: '1px solid #f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', marginBottom: '12px', position: 'relative' }}>
                    <img src={perfume.image} alt={perfume.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#d97706', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px' }}>OFERTA</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase' }}>{perfume.brand}</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', color: '#1a1a1a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfume.name}</h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#888888', textDecoration: 'line-through' }}>R$ 119,90</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#d97706' }}>R$ 79,90</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Banner Comercial de Cupom */}
          <section style={{ maxWidth: '1200px', margin: '64px auto', padding: '0 16px' }}>
            <div className="commercial-banner" style={{ backgroundColor: '#000000', color: '#ffffff', borderRadius: '4px', padding: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ zIndex: 10, maxWidth: '600px' }}>
                <span style={{ color: '#c5a880', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>FIXAÇÃO PREMIUM ATÉ 12 HORAS</span>
                <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '12px 0 16px 0', fontFamily: 'serif' }}>Leve Mais e Ganhe Brindes Especiais</h2>
                <p style={{ color: '#a0a0a0', fontSize: '14px', lineHeight: '1.6', marginBottom: 0 }}>
                  Compre a partir de 3 miniaturas importadas de 25ml e ganhe uma amostra grátis surpresa diretamente na sua sacola de compras. Entrega grátis expressa hoje em BH.
                </p>
              </div>
              <div style={{ zIndex: 10 }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#a0a0a0', marginBottom: '8px' }}>CUPOM NO CHECKOUT</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', border: '1px dashed #c5a880', padding: '8px 16px', color: '#c5a880', letterSpacing: '1px' }}>MAISONBH</span>
              </div>
            </div>
          </section>

          {/* Apresentação 2: Tendências */}
          <section style={{ maxWidth: '1200px', margin: '64px auto', padding: '0 16px' }}>
            <div style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles size={20} style={{ color: '#000000' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>TENDÊNCIAS DO MOMENTO</h2>
            </div>

            <div className="product-grid">
              {trendingPerfumes.map(perfume => (
                <div 
                  key={`trend-${perfume.code}`}
                  onClick={() => openProductDetails(perfume)}
                  style={{ cursor: 'pointer', backgroundColor: '#ffffff' }}
                >
                  <div style={{ height: '220px', border: '1px solid #f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', marginBottom: '12px' }}>
                    <img src={perfume.image} alt={perfume.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: '10px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase' }}>{perfume.brand}</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', color: '#1a1a1a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfume.name}</h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#888888', textDecoration: 'line-through' }}>R$ 119,90</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* APRESENTAÇÃO DE TODOS OS PERFUMES NA PÁGINA INICIAL */}
          <section id="vitrine" style={{ maxWidth: '1200px', margin: '80px auto 40px auto', padding: '0 16px' }}>
            <div style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>MINIATURAS DE PERFUMES 25ML ({perfumes.length})</h2>
            </div>

            <div className="product-grid">
              {perfumes.map(perfume => (
                <div 
                  key={`home-all-${perfume.code}`}
                  onClick={() => openProductDetails(perfume)}
                  style={{
                    backgroundColor: '#ffffff', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', transition: 'transform 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    height: '280px', backgroundColor: '#ffffff', display: 'flex',
                    alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '16px',
                    border: '1px solid #f0f0f0', borderRadius: '4px', position: 'relative'
                  }}>
                    <img src={perfume.image} alt={perfume.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#000000', color: '#ffffff', fontSize: '9px', fontWeight: 'bold', padding: '4px 8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {perfume.gender}
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px 0 0 0', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ fontSize: '11px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{perfume.brand}</span>
                    <h3 style={{ fontSize: '15px', margin: '6px 0', color: '#1a1a1a', fontWeight: 'bold', lineHeight: '1.4' }}>{perfume.name}</h3>
                    <p style={{ fontSize: '12px', color: '#666666', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>{perfume.description}</p>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#888888', textDecoration: 'line-through' }}>R$ 119,90</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(perfume); }}
                        style={{
                          width: '100%', backgroundColor: '#000000', border: 'none', color: '#ffffff',
                          padding: '12px 0', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase',
                          cursor: 'pointer', letterSpacing: '1px', borderRadius: '2px'
                        }}
                      >
                        Adicionar à Sacola
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ROTA DE FILTROS AVANÇADOS */}
      {activeTab === 'filters' && (
        <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 16px' }}>
          
          <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#888888', marginBottom: '24px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('home')}>Início</span>
            <span>/</span>
            <span style={{ color: '#000000', fontWeight: '600' }}>Filtro de Perfumes</span>
          </div>

          <div className="details-grid">
            
            {/* Sidebar Lateral de Filtros */}
            <aside style={{ border: '1px solid #e0e0e0', padding: '24px', borderRadius: '4px', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SlidersHorizontal size={16} /> Filtros
                </span>
                <button 
                  onClick={resetAllFilters}
                  style={{ background: 'none', border: 'none', color: '#888888', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <RotateCcw size={12} /> Limpar
                </button>
              </div>

              {/* Filtro por Gênero */}
              <div style={{ marginBottom: '24px', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Gênero</h4>
                {['Todos', 'Feminino', 'Masculino', 'Compartilhável'].map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="gender" 
                      checked={categoryFilter === cat}
                      onChange={() => setCategoryFilter(cat)}
                      style={{ accentColor: '#000' }}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>

              {/* Filtro por Marca */}
              <div style={{ marginBottom: '24px', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Marca</h4>
                <select 
                  value={brandFilter} 
                  onChange={(e) => setBrandFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '2px', border: '1px solid #d0d0d0', outline: 'none', fontSize: '13px' }}
                >
                  {allBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Notas Olfativas */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Notas de Destaque</h4>
                <select 
                  value={noteFilter} 
                  onChange={(e) => setNoteFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '2px', border: '1px solid #d0d0d0', outline: 'none', fontSize: '13px' }}
                >
                  {allNotes.map(note => (
                    <option key={note} value={note}>{note}</option>
                  ))}
                </select>
              </div>

            </aside>

            {/* Vitrine de Produtos Filtrados */}
            <div>
              <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '14px', color: '#555555' }}>Mostrando {filteredPerfumes.length} perfumes correspondentes</span>
              </div>

              <div className="product-grid">
                {filteredPerfumes.map(perfume => (
                  <div 
                    key={perfume.code}
                    onClick={() => openProductDetails(perfume)}
                    style={{
                      backgroundColor: '#ffffff', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', transition: 'transform 0.2s',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      height: '240px', backgroundColor: '#ffffff', display: 'flex',
                      alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '16px',
                      border: '1px solid #f0f0f0', borderRadius: '4px', position: 'relative'
                    }}>
                      <img src={perfume.image} alt={perfume.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    
                    <div style={{ padding: '12px 0 0 0', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <span style={{ fontSize: '10px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{perfume.brand}</span>
                      <h3 style={{ fontSize: '14px', margin: '4px 0', color: '#1a1a1a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfume.name}</h3>
                      
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#888888', textDecoration: 'line-through' }}>R$ 119,90</span>
                          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToCart(perfume); }}
                          style={{
                            width: '100%', backgroundColor: '#000000', border: 'none', color: '#ffffff',
                            padding: '10px 0', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase',
                            cursor: 'pointer', letterSpacing: '1px', borderRadius: '2px'
                          }}
                        >
                          Adicionar à Sacola
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </main>
      )}

      {/* Detalhes do Produto & Produtos Relacionados */}
      {activeTab === 'product' && selectedProduct && (
        <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 16px' }}>
          
          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#888888', marginBottom: '32px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('home')}>Início</span>
            <span>/</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('filters')}>Filtros</span>
            <span>/</span>
            <span style={{ color: '#000000', fontWeight: '600' }}>{selectedProduct.name}</span>
          </div>

          <div className="details-grid" style={{ marginBottom: '80px' }}>
            
            {/* Foto Grande */}
            <div style={{ border: '1px solid #f0f0f0', borderRadius: '4px', backgroundColor: '#ffffff', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '480px' }}>
              <img src={selectedProduct.image} alt={selectedProduct.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            </div>

            {/* Informações */}
            <div>
              <span style={{ color: '#888888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '2px' }}>{selectedProduct.brand}</span>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#000000', margin: '8px 0 16px 0', fontFamily: 'serif' }}>{selectedProduct.name}</h2>
              <span style={{ display: 'inline-block', backgroundColor: '#f0f0f0', color: '#000000', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '99px', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Miniatura {selectedProduct.volume}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '32px' }}>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                <span style={{ color: '#888888', textDecoration: 'line-through', fontSize: '16px' }}>R$ 119,90</span>
              </div>

              <div style={{ borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', padding: '24px 0', marginBottom: '32px' }}>
                <h4 style={{ fontSize: '12px', uppercase: true, fontWeight: 'bold', color: '#000000', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>Descrição Olfativa</h4>
                <p style={{ color: '#555555', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{selectedProduct.description}</p>
                
                <h4 style={{ fontSize: '12px', uppercase: true, fontWeight: 'bold', color: '#000000', letterSpacing: '1px', marginTop: '24px', marginBottom: '12px', textTransform: 'uppercase' }}>Principais Notas</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedProduct.notes.map(note => (
                    <span key={note} style={{ backgroundColor: '#f5f5f5', color: '#555555', padding: '6px 12px', fontSize: '12px', borderRadius: '2px' }}>{note}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => buyNowWhatsApp(selectedProduct)}
                  style={{
                    flex: 1, minWidth: '200px', backgroundColor: '#25D366', border: 'none', color: '#ffffff',
                    padding: '18px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
                    textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '2px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  💬 WhatsApp
                </button>
                <button 
                  onClick={() => addToCart(selectedProduct)}
                  style={{
                    flex: 1, minWidth: '200px', backgroundColor: '#000000', border: 'none', color: '#ffffff',
                    padding: '18px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
                    textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '2px'
                  }}
                >
                  Adicionar à Sacola
                </button>
              </div>
            </div>

          </div>

          {/* Quem Comprou Também Gostou */}
          <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '48px', marginBottom: '80px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '32px', fontFamily: 'serif' }}>Quem Comprou Também Gostou</h3>
            
            <div className="product-grid">
              {getRelatedPerfumes(selectedProduct.code).map(related => (
                <div 
                  key={related.code}
                  onClick={() => openProductDetails(related)}
                  style={{ cursor: 'pointer', backgroundColor: '#ffffff' }}
                >
                  <div style={{ height: '200px', border: '1px solid #f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', marginBottom: '12px' }}>
                    <img src={related.image} alt={related.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: '10px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase' }}>{related.brand}</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', color: '#1a1a1a', fontWeight: 'bold' }}>{related.name}</h4>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      )}

      {/* Sucesso */}
      {activeTab === 'success' && (
        <main style={{ maxWidth: '500px', margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: '#000' }}>
            <Check size={32} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', fontFamily: 'serif' }}>Pedido Redirecionado!</h2>
          <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.6', marginBottom: 32 }}>
            Sua comanda com os perfumes foi gerada e enviada para o nosso WhatsApp. Clique no botão abaixo para retornar à Snack Store.
          </p>
          <button onClick={() => setActiveTab('home')} style={{ backgroundColor: '#000000', border: 'none', color: '#ffffff', padding: '14px 28px', borderRadius: '2px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
            Voltar à Loja
          </button>
        </main>
      )}

      {/* Carrinho Lateral */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', justifyContent: 'flex-end' }}>
          <div 
            onClick={() => setIsCartOpen(false)}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
          ></div>
          
          <div style={{
            position: 'relative', width: '100%', maxWidth: '400px', height: '100%',
            backgroundColor: '#ffffff', borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.1)'
          }}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Sacola ({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>
              <button 
                onClick={() => setIsCartOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: '#888888' }}
              >
                Fechar
              </button>
            </div>

            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888888', marginTop: '40px' }}>Sacola vazia</div>
              ) : (
                cart.map(item => (
                  <div key={item.code} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #f9f9f9', paddingBottom: '16px' }}>
                    <div style={{ width: '60px', height: '60px', border: '1px solid #f0f0f0', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                      <img src={item.image} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{item.name}</h4>
                      <p style={{ fontSize: '12px', color: '#888888', margin: '0 0 12px 0' }}>Qtd: {item.quantity} • {item.volume}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', border: '1px solid #e0e0e0', borderRadius: '2px' }}>
                          <button onClick={() => updateQuantity(item.code, item.quantity - 1)} style={{ border: 'none', background: 'none', padding: '2px 8px', cursor: 'pointer' }}>-</button>
                          <span style={{ fontSize: '12px', padding: '2px 8px', display: 'inline-block' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.code, item.quantity + 1)} style={{ border: 'none', background: 'none', padding: '2px 8px', cursor: 'pointer' }}>+</button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.code)}
                          style={{ border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '24px', borderTop: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', marginBottom: '20px' }}>
                  <span>Subtotal:</span>
                  <span>R$ {totalCart.toFixed(2)}</span>
                </div>
                <button
                  onClick={checkoutWhatsAppDirect}
                  style={{
                    width: '100%', backgroundColor: '#25D366', color: '#ffffff', border: 'none',
                    padding: '16px 0', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase',
                    letterSpacing: '1px', cursor: 'pointer', borderRadius: '2px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  💬 Enviar Comanda pelo WhatsApp
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Rodapé Sephora Style */}
      <footer style={{ backgroundColor: '#000000', color: '#ffffff', padding: '60px 16px', marginTop: '100px' }}>
        <div className="footer-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>SOBRE A SNACK STORE</h4>
            <p style={{ fontSize: '12px', color: '#a0a0a0', lineHeight: '1.8' }}>
              Curadoria exclusiva de perfumes importados originais em frascos de miniatura 25ml. Entregas expressas em Belo Horizonte, Minas Gerais.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>POLÍTICAS</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '12px', color: '#a0a0a0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>Garantia de Originalidade</li>
              <li>Envio em até 24 horas</li>
              <li>Trocas e Devoluções</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>CONTATO</h4>
            <p style={{ fontSize: '12px', color: '#a0a0a0', lineHeight: '1.8' }}>
              📍 Belo Horizonte, MG<br />
              💬 WhatsApp: (31) 97565-0503<br />
              ✉️ contato@snackstore.com.br
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
