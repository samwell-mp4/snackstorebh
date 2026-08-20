import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Check, Menu, X } from 'lucide-react';
import { perfumes } from './perfumesData';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import { SeoHead } from './components/SeoHead';
import SeoLandingPage from './pages/SeoLandingPage';
import { seoPages } from './seoPagesData';
import LegalPage from './pages/LegalPage';
import Cidades from './pages/Cidades';

const WHATSAPP_NUMBER = "553175650503"; // Número comercial BH

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const footerProducts = perfumes.slice(0, 5);


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

  const totalCart = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

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
    setOrderSuccess(true);
  };

  const searchDropdownResults = searchTerm.trim() !== '' 
    ? perfumes.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
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
            width: '100%', padding: '10px 16px 10px 40px', backgroundColor: '#f5f5f5',
            border: 'none', borderRadius: '99px', fontSize: '13px', outline: 'none', color: '#000000'
          }}
        />
        <Search size={16} style={{ position: 'absolute', left: '16px', color: '#888888' }} />
      </div>

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
              onClick={() => {
                setSearchTerm('');
                navigate(`/produto/${p.slug}`);
              }}
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
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#1a1a1a', fontFamily: '"Outfit", sans-serif' }}>
      <SeoHead />

      {/* Faixa de Destaque */}
      <div style={{ backgroundColor: '#000000', color: '#ffffff', textAlign: 'center', padding: '8px', fontSize: '11px', letterSpacing: '2px', fontWeight: '500', textTransform: 'uppercase' }}>
        ✨ GANHE FRETE GRÁTIS EM BELO HORIZONTE PARA COMPRAS ACIMA DE R$ 150
      </div>

      {/* Navbar Snack Store Clean */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0', padding: '16px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>

          <Link to="/" style={{ textDecoration: 'none' }} onClick={() => { setSearchTerm(''); setOrderSuccess(false); }}>
            <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '3px', color: '#000000', fontFamily: 'serif' }}>SNACK STORE</span>
          </Link>

          <div className="nav-search" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            {searchBox({ width: '100%', maxWidth: '350px' })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <Link to="/mini-perfumes-importados" style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textDecoration: 'none', color: '#888' }}>Todos</Link>
              <Link to="/mini-perfumes-femininos" style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textDecoration: 'none', color: '#888' }}>Femininos</Link>
              <Link to="/mini-perfumes-masculinos" style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textDecoration: 'none', color: '#888' }}>Masculinos</Link>
              <Link to="/brand-collection" style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textDecoration: 'none', color: '#888' }}>Brand</Link>
              <Link to="/arabic-collection" style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textDecoration: 'none', color: '#888' }}>Arabic</Link>
            </div>

            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setIsCartOpen(true); }}>
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

            <button className="nav-hamburger" onClick={() => setIsMenuOpen(true)} aria-label="Abrir menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000000', display: 'none' }}>
              <Menu size={26} />
            </button>
          </div>
        </div>
      </nav>

      {/* Menu lateral (celular) */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 130, display: 'flex' }}>
          <div onClick={() => setIsMenuOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}></div>
          <div style={{
            position: 'relative', width: '85%', maxWidth: '320px', height: '100%', backgroundColor: '#ffffff',
            overflowY: 'auto', padding: '24px', boxShadow: '10px 0 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '3px', color: '#000000', fontFamily: 'serif' }}>SNACK STORE</span>
              <button onClick={() => setIsMenuOpen(false)} aria-label="Fechar menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000000' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '28px' }}>
              {searchBox({ width: '100%' })}
            </div>

            <nav aria-label="Menu principal">
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { to: '/mini-perfumes-importados', label: 'Todos os Perfumes' },
                  { to: '/mini-perfumes-femininos', label: 'Femininos' },
                  { to: '/mini-perfumes-masculinos', label: 'Masculinos' },
                  { to: '/brand-collection', label: 'Brand Collection' },
                  { to: '/arabic-collection', label: 'Arabic Collection' },
                  { to: '/cidades', label: 'Cidades Atendidas' }
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '12px 4px', textDecoration: 'none', color: '#1a1a1a', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #f0f0f0' }}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px', backgroundColor: '#25D366', color: '#ffffff', textDecoration: 'none', padding: '14px', borderRadius: '2px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              💬 Falar no WhatsApp
            </a>
            <p style={{ fontSize: '11px', color: '#888888', lineHeight: '1.8', marginTop: '16px' }}>
              📍 Belo Horizonte, MG<br />
              ✉️ contato@snackstorebh.com.br<br />
              ⏰ Seg a Sex - 9h às 18h
            </p>
          </div>
        </div>
      )}

      {orderSuccess ? (
        <main style={{ maxWidth: '500px', margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', color: '#000' }}>
            <Check size={32} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', fontFamily: 'serif' }}>Pedido Redirecionado!</h2>
          <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.6', marginBottom: 32 }}>
            Sua comanda com os perfumes foi gerada e enviada para o nosso WhatsApp. Clique no botão abaixo para retornar à Snack Store.
          </p>
          <button onClick={() => setOrderSuccess(false)} style={{ backgroundColor: '#000000', border: 'none', color: '#ffffff', padding: '14px 28px', borderRadius: '2px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
            Voltar à Loja
          </button>
        </main>
      ) : (
        <Routes>
          <Route path="/" element={<Home perfumes={perfumes} addToCart={addToCart} />} />
          <Route path="/produto/:slug" element={<ProductPage perfumes={perfumes} addToCart={addToCart} />} />
          
          {/* Páginas de Legislações e Políticas */}
          <Route path="/politica-de-privacidade" element={<LegalPage type="privacy" />} />
          <Route path="/trocas-e-devolucoes" element={<LegalPage type="returns" />} />
          <Route path="/termos-de-servico" element={<LegalPage type="terms" />} />
          <Route path="/perguntas-frequentes" element={<LegalPage type="faq" />} />
          
          {/* Índice de Cidades */}
          <Route path="/cidades" element={<Cidades />} />

          {seoPages.map(page => (
            <Route key={page.slug} path={`/${page.slug}`} element={<SeoLandingPage pageSlug={page.slug} perfumes={perfumes} addToCart={addToCart} />} />
          ))}
          <Route path="/:categorySlug" element={<CategoryPage perfumes={perfumes} addToCart={addToCart} />} />
        </Routes>
      )}

      {/* Carrinho Lateral */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={() => setIsCartOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}></div>
          
          <div style={{
            position: 'relative', width: '100%', maxWidth: '400px', height: '100%',
            backgroundColor: '#ffffff', borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Sacola ({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: '#888888' }}>Fechar</button>
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
                        <button onClick={() => removeFromCart(item.code)} style={{ border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Remover</button>
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
          boxShadow: '0 6px 20px rgba(37, 211, 102, 0.45)', color: '#ffffff'
        }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </a>

      {/* Rodapé Profissional */}
      <footer style={{ backgroundColor: '#000000', color: '#ffffff', marginTop: '100px' }}>
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

        {/* Barra de novidades */}
        <div style={{ borderBottom: '1px solid #1c1c1c' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Receba novidades e ofertas</h3>
              <p style={{ fontSize: '12px', color: '#a0a0a0', margin: 0 }}>Lançamentos, cupons e descontos exclusivos por e-mail.</p>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); const email = e.target.email.value; window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Quero receber novidades e ofertas. Meu e-mail: ${email}`)}`, '_blank'); e.target.reset(); }}
              style={{ display: 'flex', gap: '8px', flex: '1 1 320px', maxWidth: '460px' }}
            >
              <input name="email" type="email" required placeholder="Seu melhor e-mail" aria-label="Seu melhor e-mail" style={{ flex: 1, padding: '12px 14px', borderRadius: '2px', border: '1px solid #333', backgroundColor: '#111', color: '#ffffff', fontSize: '13px', outline: 'none' }} />
              <button type="submit" style={{ backgroundColor: '#ffffff', color: '#000000', border: 'none', padding: '12px 22px', borderRadius: '2px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Inscrever</button>
            </form>
          </div>
        </div>

        <div style={{ padding: '56px 16px 48px 16px' }}>
          <div className="footer-grid" style={{ maxWidth: '1200px', margin: '0 auto', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Snack Store BH</h4>
              <p style={{ fontSize: '12px', color: '#a0a0a0', lineHeight: '1.8', maxWidth: '280px', margin: '0 0 16px 0' }}>
                Curadoria exclusiva de perfumes importados originais em frascos de miniatura 25ml. Elevando sua experiência olfativa com o melhor custo-benefício.
              </p>
              <address style={{ fontSize: '11px', color: '#777777', fontStyle: 'normal', lineHeight: '1.8', margin: '0 0 16px 0' }}>
                Belo Horizonte - MG • Brasil
              </address>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="https://www.instagram.com/snackstorebh" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #333', color: '#ffffff' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #333', color: '#ffffff' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </a>
                <a href="mailto:contato@snackstorebh.com.br" aria-label="E-mail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #333', color: '#ffffff' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </a>
              </div>
            </div>

            <nav aria-label="Produtos">
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Produtos</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '12px', color: '#a0a0a0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/mini-perfumes-importados" style={{ color: 'inherit', textDecoration: 'none' }}>Todas as Miniaturas</Link></li>
                <li><Link to="/brand-collection" style={{ color: 'inherit', textDecoration: 'none' }}>Brand Collection</Link></li>
                <li><Link to="/arabic-collection" style={{ color: 'inherit', textDecoration: 'none' }}>Arabic Collection</Link></li>
                {footerProducts.map(p => (
                  <li key={p.code}><Link to={`/produto/${p.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{p.name}</Link></li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Entregas">
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Entregas</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '12px', color: '#a0a0a0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/loja-de-perfumes-importados-bh" style={{ color: 'inherit', textDecoration: 'none' }}>Entregas em BH</Link></li>
                <li><Link to="/comprar-miniaturas-perfumes-sao-paulo" style={{ color: 'inherit', textDecoration: 'none' }}>Entregas em São Paulo</Link></li>
                <li><Link to="/cidades" style={{ textDecoration: 'none', fontWeight: 'bold', color: '#ffffff' }}>Ver Cidades Atendidas</Link></li>
              </ul>
            </nav>

            <nav aria-label="Ajuda">
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Ajuda e Políticas</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '12px', color: '#a0a0a0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/politica-de-privacidade" style={{ color: 'inherit', textDecoration: 'none' }}>Política de Privacidade</Link></li>
                <li><Link to="/trocas-e-devolucoes" style={{ color: 'inherit', textDecoration: 'none' }}>Trocas e Devoluções</Link></li>
                <li><Link to="/termos-de-servico" style={{ color: 'inherit', textDecoration: 'none' }}>Termos de Serviço</Link></li>
                <li><Link to="/perguntas-frequentes" style={{ color: 'inherit', textDecoration: 'none' }}>Perguntas Frequentes (FAQ)</Link></li>
              </ul>
            </nav>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Contato</h4>
              <address style={{ fontSize: '12px', color: '#a0a0a0', lineHeight: '1.9', fontStyle: 'normal' }}>
                📍 Belo Horizonte, MG<br />
                💬 WhatsApp: (31) 97565-0503<br />
                ✉️ contato@snackstorebh.com.br<br />
                ⏰ Atendimento: Seg a Sex - 9h às 18h
              </address>
              <h4 style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', margin: '24px 0 12px 0' }}>Pagamento</h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['PIX', 'VISA', 'MASTERCARD', 'ELO', 'BOLETO'].map(p => (
                  <span key={p} style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '1px', border: '1px solid #333', borderRadius: '2px', padding: '5px 8px', color: '#a0a0a0' }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1c1c1c', padding: '20px 16px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', fontSize: '11px', color: '#666666' }}>
            <span>© {new Date().getFullYear()} Snack Store BH • CNPJ: 32.404.968/0001-70 • Todos os direitos reservados.</span>
            <span>Loja de miniaturas de perfumes importados - Belo Horizonte, MG</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
