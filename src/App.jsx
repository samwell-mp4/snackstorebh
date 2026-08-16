import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Check } from 'lucide-react';
import { perfumes } from './perfumesData';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import { SeoHead } from './components/SeoHead';
import SeoLandingPage from './pages/SeoLandingPage';
import { seoPages } from './seoPagesData';
const WHATSAPP_NUMBER = "553175650503"; // Número comercial BH

export default function App() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#1a1a1a', fontFamily: '"Outfit", sans-serif' }}>
      <SeoHead />

      {/* Faixa de Destaque */}
      <div style={{ backgroundColor: '#000000', color: '#ffffff', textAlign: 'center', padding: '8px', fontSize: '11px', letterSpacing: '2px', fontWeight: '500', textTransform: 'uppercase' }}>
        ✨ GANHE FRETE GRÁTIS EM BELO HORIZONTE PARA COMPRAS ACIMA DE R$ 150
      </div>

      {/* Navbar Snack Store Clean */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0', padding: '20px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <Link to="/" style={{ textDecoration: 'none' }} onClick={() => { setSearchTerm(''); setOrderSuccess(false); }}>
            <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '3px', color: '#000000', fontFamily: 'serif' }}>SNACK STORE</span>
          </Link>

          <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <Link to="/mini-perfumes-importados" style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textDecoration: 'none', color: '#888' }}>Todos</Link>
            <Link to="/mini-perfumes-femininos" style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textDecoration: 'none', color: '#888' }}>Femininos</Link>
            <Link to="/mini-perfumes-masculinos" style={{ cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', textDecoration: 'none', color: '#888' }}>Masculinos</Link>
            
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
          </div>
        </div>
      </nav>

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
          {seoPages.map(page => (
            <Route key={page.slug} path={`/${page.slug}`} element={<SeoLandingPage perfumes={perfumes} addToCart={addToCart} />} />
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

      {/* Rodapé Sephora Style */}
      <footer style={{ backgroundColor: '#000000', color: '#ffffff', padding: '60px 16px', marginTop: '100px' }}>
        <div className="footer-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>SOBRE A SNACK STORE</h4>
            <p style={{ fontSize: '12px', color: '#a0a0a0', lineHeight: '1.8', maxWidth: '300px' }}>
              Curadoria exclusiva de perfumes importados originais em frascos de miniatura 25ml. Entregas expressas em Belo Horizonte, Minas Gerais.
            </p>
          </div>
          
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>DESTAQUES</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '12px', color: '#a0a0a0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/brand-collection" style={{ color: 'inherit', textDecoration: 'none' }}>Brand Collection 25ml</Link></li>
              <li><Link to="/arabic-collection" style={{ color: 'inherit', textDecoration: 'none' }}>Arabic Collection 25ml</Link></li>
              <li><Link to="/mini-perfumes-para-presente" style={{ color: 'inherit', textDecoration: 'none' }}>Para Presente</Link></li>
              <li><Link to="/mini-perfumes-em-bh" style={{ color: 'inherit', textDecoration: 'none' }}>Perfumes em BH</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>TOP BUSCAS</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '12px', color: '#a0a0a0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {seoPages.slice(0, 5).map(page => (
                <li key={`footer-${page.slug}`}><Link to={`/${page.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{page.title.split('|')[0].trim()}</Link></li>
              ))}
            </ul>
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
