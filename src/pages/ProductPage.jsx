import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, ShieldCheck, MapPin, Star, User, MessageCircle, Info, Zap, Package, DollarSign, Clock, Check, Sparkles } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';
import { getDefaultLogistics } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StarRating = ({ rating, size = 16, color = '#facc15' }) => {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          size={size} 
          fill={star <= rating ? color : 'none'} 
          stroke={star <= rating ? color : '#d1d5db'} 
        />
      ))}
    </div>
  );
};

const generateDeterministicReviews = (product) => {
  const hashCode = (str) => {
    let hash = 0;
    if (!str) return hash;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const seed = hashCode(product.slug || product.name);
  const numReviews = (seed % 3) + 3; // Genera 3, 4 ou 5 avaliações
  
  const maleNames = ["Carlos M.", "Lucas Teixeira", "Rafael Lima", "Fernando Costa", "Bruno Rezende", "Marcelo Souza", "Thiago Alves", "Gustavo F.", "Daniel R.", "Rodrigo M."];
  const femaleNames = ["Mariana Silva", "Amanda Rocha", "Juliana Nogueira", "Beatriz Lima", "Camila Santos", "Letícia Gomes", "Vanessa Pires", "Aline Melo", "Gabriela Fonseca", "Patrícia S."];
  
  const commentTemplates = [
    "Achei sensacional. Comprei no escuro e me surpreendi. Lembra muito o {inspiredBy}, a fixação durou o dia todo. Recomendo muito!",
    "Entrega super rápida aqui em BH, chegou no mesmo dia. O perfume {name} é maravilhoso, virou minha nova assinatura.",
    "Perfume excelente, projeção fantástica. Muito parecido com o {inspiredBy}, vale muito a pena pelo preço.",
    "Projeção ótima nas primeiras horas e depois fica super intimista e confortável. O custo-benefício dessa miniatura de 25ml é imbatível.",
    "A semelhança do {name} com o importado de grife é impressionante! A fixação na minha pele passou de 8 horas tranquilamente.",
    "Comprei o {name} para experimentar e adorei! Já quero fazer coleção de outros da marca. Ótimo atendimento da Snack Store.",
    "Fiel à fragrância original do {inspiredBy}. Spray de ótima qualidade e a caixa é linda, idêntica à do importado.",
    "Cheiro incrível, muito marcante e recebo elogios sempre que uso. Fixação excelente pelo tamanho do frasco.",
    "A colônia {name} é bem versátil, ótima para o dia a dia. A qualidade do perfume me surpreendeu bastante.",
    "Entrega expressa impecável. O perfume veio super bem embalado e a fragrância fixa na pele por muito tempo."
  ];

  const generated = [];
  const selectedNames = product.gender === 'F' ? [...femaleNames] : (product.gender === 'M' ? [...maleNames] : [...femaleNames, ...maleNames]);

  // Misturar nomes baseados no seed
  for (let i = selectedNames.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    const temp = selectedNames[i];
    selectedNames[i] = selectedNames[j];
    selectedNames[j] = temp;
  }

  // Generar avaliações
  for (let i = 0; i < numReviews; i++) {
    const nameIndex = i % selectedNames.length;
    const templateIndex = (seed + i) % commentTemplates.length;
    const rating = ((seed + i) % 10 === 0) ? 4 : 5;
    const daysAgo = ((seed * (i + 1)) % 22) + 3;
    const reviewDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');

    let comment = commentTemplates[templateIndex]
      .replace(/{name}/g, product.name)
      .replace(/{inspiredBy}/g, product.inspiredBy || 'original famoso');

    generated.push({
      id: seed + i,
      name: selectedNames[nameIndex],
      rating: rating,
      date: reviewDate,
      comment: comment
    });
  }

  return generated;
};

export default function ProductPage({ perfumes, addToCart }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isReseller } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = perfumes.find(p => p.slug === slug);
  const logConfig = product ? (product.logistics_config || getDefaultLogistics(product.price, product.stock)) : null;

  const isExpressoAvailable = logConfig?.expresso?.active !== false && (product?.stock !== undefined ? product.stock > 0 : true);
  const isProgramadoAvailable = logConfig?.programado_7?.active !== false;
  const isEconomicoAvailable = logConfig?.economico_15?.active !== false;
  const isCompletelyOut = !isExpressoAvailable && !isProgramadoAvailable && !isEconomicoAvailable;

  const [selectedModality, setSelectedModality] = useState(() => {
    if (isExpressoAvailable) return 'expresso';
    if (isProgramadoAvailable) return 'programado_7';
    if (isEconomicoAvailable) return 'economico_15';
    return 'expresso';
  });

  useEffect(() => {
    if (isExpressoAvailable) setSelectedModality('expresso');
    else if (isProgramadoAvailable) setSelectedModality('programado_7');
    else if (isEconomicoAvailable) setSelectedModality('economico_15');
  }, [product?.code, isExpressoAvailable, isProgramadoAvailable, isEconomicoAvailable]);

  const activeModalityConfig = logConfig ? (logConfig[selectedModality] || logConfig.expresso) : null;

  // Preço de Varejo (Consumidor Final / Deslogado) e Preço de Atacado (Revenda)
  const retailPrice = parseFloat(product?.price) || 79.90;
  const wholesalePrice = product?.wholesale_price !== undefined
    ? parseFloat(product.wholesale_price)
    : Math.round((retailPrice * 0.72) * 10) / 10;

  // Se o usuário logado for revendedor, aplica o preço de atacado. Para o deslogado ou cliente varejo, fixa o preço de varejo!
  const currentPrice = isReseller ? wholesalePrice : retailPrice;

  const allImages = product ? (Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.image || '/perfumes/200.webp']) : ['/perfumes/200.webp'];

  const [selectedImage, setSelectedImage] = useState(allImages[0]);

  useEffect(() => {
    if (product) {
      const imgs = Array.isArray(product.images) && product.images.length > 0 
        ? product.images 
        : [product.image || '/perfumes/200.webp'];
      setSelectedImage(imgs[0]);
    }
  }, [product]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    
    // Carregar avaliações do localStorage
    const savedReviews = localStorage.getItem(`reviews_${product.code}`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      // Gerar avaliações falsas iniciais se não houver
      const fakeReviews = generateDeterministicReviews(product);
      setReviews(fakeReviews);
      localStorage.setItem(`reviews_${product.code}`, JSON.stringify(fakeReviews));
    }
  }, [product]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      const reviewObj = {
        id: Date.now(),
        name: newReview.name,
        rating: newReview.rating,
        date: new Date().toLocaleDateString('pt-BR'),
        comment: newReview.comment
      };
      const updatedReviews = [reviewObj, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem(`reviews_${product.code}`, JSON.stringify(updatedReviews));
      setNewReview({ name: '', rating: 5, comment: '' });
      setIsSubmitting(false);
    }, 600);
  };

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Produto não encontrado</h2>
        <Link to="/">Voltar para a página inicial</Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  const relatedPerfumes = perfumes.filter(p => p.code !== product.code && p.gender === product.gender).slice(0, 4);

  const isBrandCollection = product.categorySlugs && product.categorySlugs.includes('brand-collection');

  return (
    <>
      <SeoHead 
        title={`${product.name} | Mini Perfume ${product.gender}${isBrandCollection ? ' | Brand Collection' : ''}`}
        description={`${product.name}: ${product.description} Compre mini perfumes importados da Brand Collection em BH.`}
        url={`/produto/${product.slug}`}
        imageUrl={product.image}
        schemaType="Product"
        productData={{
          ...product,
          averageRating: averageRating,
          reviewCount: reviews.length,
          reviewsList: reviews
        }}
      />

      {/* Breadcrumb e Voltar */}
      <div style={{ padding: '24px 16px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#555', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar à loja inicial
          </Link>
          <span style={{ color: '#ccc', margin: '0 8px' }}>/</span>
          <Link to="/mini-perfumes-25ml/" style={{ fontSize: '12px', color: '#888', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Miniaturas
          </Link>
          <span style={{ color: '#ccc', margin: '0 8px' }}>/</span>
          <span style={{ fontSize: '12px', color: '#1a1a1a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {product.name}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto 40px auto', padding: '0 16px' }}>
        <div className="product-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '480px', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <img src={selectedImage} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transition: 'all 0.2s ease-in-out' }} />
              <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'var(--snack-green-dark, #172b14)', color: '#fff', padding: '6px 14px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {product.volume || '25ml'}
              </div>
            </div>

            {/* Interactive Thumbnails Gallery */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                {allImages.map((img, idx) => {
                  const isSelected = selectedImage === img;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      style={{
                        border: isSelected ? '2px solid var(--snack-gold, #c5a059)' : '1px solid #e2e8f0',
                        borderRadius: '8px', padding: '4px', backgroundColor: '#ffffff', cursor: 'pointer',
                        width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, opacity: isSelected ? 1 : 0.7, transform: isSelected ? 'scale(1.04)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={img} alt={`${product.name} miniatura ${idx + 1}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', backgroundColor: '#f5f5f5', padding: '4px 12px', borderRadius: '99px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {product.brand}
              </span>
              <span style={{ fontSize: '11px', backgroundColor: '#000000', color: '#ffffff', padding: '4px 12px', borderRadius: '99px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {product.gender}
              </span>
              {product.tags && product.tags.map((t, i) => (
                <span key={i} style={{ fontSize: '11px', backgroundColor: '#FAF2DE', color: '#854D0E', padding: '4px 10px', borderRadius: '99px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  ★ {t}
                </span>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                <StarRating rating={Math.round(averageRating)} size={14} />
                <span style={{ fontSize: '12px', color: '#666' }}>({reviews.length} avaliações)</span>
              </div>
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 16px 0', lineHeight: '1.2' }}>{product.name}</h1>
            
            <p style={{ fontSize: '15px', color: '#555555', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              {product.description}
            </p>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              {/* Header Price */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', marginBottom: '4px', color: isReseller ? '#6b21a8' : 'var(--snack-gold, #c4a15a)' }}>
                    {isReseller ? '👑 PREÇO EXCLUSIVO REVENDEDOR VIP' : 'PREÇO DE VAREJO • CONSUMIDOR FINAL'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span style={{ fontSize: '34px', fontWeight: '900', color: isCompletelyOut ? '#9ca3af' : (isReseller ? '#6b21a8' : 'var(--snack-green-dark, #172b14)') }}>
                      R$ {currentPrice.toFixed(2).replace('.', ',')}
                    </span>
                    <span style={{ fontSize: '15px', color: '#9ca3af', textDecoration: 'line-through' }}>
                      {isReseller ? `Varejo: R$ ${retailPrice.toFixed(2).replace('.', ',')}` : `R$ ${(retailPrice * 1.45).toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>
                  {isReseller && (
                    <span style={{ fontSize: '11px', backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: '4px', fontWeight: '800', display: 'inline-block', marginTop: '4px' }}>
                      Você economiza R$ {(retailPrice - wholesalePrice).toFixed(2).replace('.', ',')} por frasco!
                    </span>
                  )}
                </div>

                {!isReseller && (
                  <div style={{ backgroundColor: '#FAF8F2', border: '1px solid #e9d5ff', padding: '8px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="#6b21a8" />
                    <span>Preço Atacado: <strong>R$ {wholesalePrice.toFixed(2).replace('.', ',')}</strong> (10+ un)</span>
                  </div>
                )}
              </div>

              {/* Banner Atacado para Usuário Deslogado / Comprador Comum */}
              {!isReseller && (
                <div style={{
                  marginBottom: '20px', padding: '12px 16px', borderRadius: '10px',
                  backgroundColor: '#FAF8F2', border: '1px dashed #d8b4fe',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>💎</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#6b21a8' }}>
                        Deseja revender? Preço no Atacado: R$ {wholesalePrice.toFixed(2).replace('.', ',')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>
                        Pedido mínimo a partir de 10 unidades com lucros de 80% a 120%.
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/atacado-revenda-perfumes/"
                    style={{ fontSize: '11px', fontWeight: '800', color: '#6b21a8', textDecoration: 'none', borderBottom: '1px solid #6b21a8' }}
                  >
                    Tabela de Atacado →
                  </Link>
                </div>
              )}

              {/* Modality Selector Cards */}
              {!isCompletelyOut && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Escolha como deseja receber:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {/* Expresso Option */}
                    <button
                      type="button"
                      disabled={!isExpressoAvailable}
                      onClick={() => setSelectedModality('expresso')}
                      style={{
                        padding: '12px 16px', borderRadius: '10px', textAlign: 'left',
                        border: selectedModality === 'expresso' ? '2px solid var(--snack-green-dark, #172b14)' : '1px solid #e5e7eb',
                        backgroundColor: selectedModality === 'expresso' ? 'rgba(23,43,20,0.03)' : (!isExpressoAvailable ? '#f9fafb' : '#ffffff'),
                        cursor: !isExpressoAvailable ? 'not-allowed' : 'pointer',
                        opacity: !isExpressoAvailable ? 0.6 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          backgroundColor: selectedModality === 'expresso' ? 'var(--snack-green-dark, #172b14)' : '#f3f4f6',
                          color: selectedModality === 'expresso' ? '#ffffff' : '#4b5563',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Zap size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                            Receber Mais Rápido (Expresso)
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {isExpressoAvailable ? '1 a 2 dias úteis • Pronta entrega em BH e RMBH' : 'Sem pronta entrega imediata'}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>
                          R$ {(parseFloat(logConfig?.expresso?.price || product.price)).toFixed(2).replace('.', ',')}
                        </div>
                        {selectedModality === 'expresso' && (
                          <div style={{ fontSize: '10px', color: 'var(--snack-green, #29451f)', fontWeight: '700' }}>✓ Selecionado</div>
                        )}
                      </div>
                    </button>

                    {/* Programado 7 dias */}
                    <button
                      type="button"
                      disabled={!isProgramadoAvailable}
                      onClick={() => setSelectedModality('programado_7')}
                      style={{
                        padding: '12px 16px', borderRadius: '10px', textAlign: 'left',
                        border: selectedModality === 'programado_7' ? '2px solid var(--snack-green-dark, #172b14)' : '1px solid #e5e7eb',
                        backgroundColor: selectedModality === 'programado_7' ? 'rgba(23,43,20,0.03)' : (!isProgramadoAvailable ? '#f9fafb' : '#ffffff'),
                        cursor: !isProgramadoAvailable ? 'not-allowed' : 'pointer',
                        opacity: !isProgramadoAvailable ? 0.6 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          backgroundColor: selectedModality === 'programado_7' ? 'var(--snack-green-dark, #172b14)' : '#f3f4f6',
                          color: selectedModality === 'programado_7' ? '#ffffff' : '#4b5563',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Package size={16} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Economizar (Programado)</span>
                            <span style={{ fontSize: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>Desconto</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            Até 7 dias úteis • Direto do centro de distribuição
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#047857' }}>
                          R$ {(parseFloat(logConfig?.programado_7?.price || (product.price * 0.88))).toFixed(2).replace('.', ',')}
                        </div>
                        {selectedModality === 'programado_7' && (
                          <div style={{ fontSize: '10px', color: 'var(--snack-green, #29451f)', fontWeight: '700' }}>✓ Selecionado</div>
                        )}
                      </div>
                    </button>

                    {/* Economico 15 dias */}
                    <button
                      type="button"
                      disabled={!isEconomicoAvailable}
                      onClick={() => setSelectedModality('economico_15')}
                      style={{
                        padding: '12px 16px', borderRadius: '10px', textAlign: 'left',
                        border: selectedModality === 'economico_15' ? '2px solid var(--snack-green-dark, #172b14)' : '1px solid #e5e7eb',
                        backgroundColor: selectedModality === 'economico_15' ? 'rgba(23,43,20,0.03)' : (!isEconomicoAvailable ? '#f9fafb' : '#ffffff'),
                        cursor: !isEconomicoAvailable ? 'not-allowed' : 'pointer',
                        opacity: !isEconomicoAvailable ? 0.6 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          backgroundColor: selectedModality === 'economico_15' ? 'var(--snack-green-dark, #172b14)' : '#f3f4f6',
                          color: selectedModality === 'economico_15' ? '#ffffff' : '#4b5563',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <DollarSign size={16} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Melhor Preço (Econômico)</span>
                            <span style={{ fontSize: '10px', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>Super Desconto</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            Até 15 dias úteis • Ideal para revenda e reposição
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#047857' }}>
                          R$ {(parseFloat(logConfig?.economico_15?.price || (product.price * 0.78))).toFixed(2).replace('.', ',')}
                        </div>
                        {selectedModality === 'economico_15' && (
                          <div style={{ fontSize: '10px', color: 'var(--snack-green, #29451f)', fontWeight: '700' }}>✓ Selecionado</div>
                        )}
                      </div>
                    </button>

                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isCompletelyOut ? (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '14px', color: '#991b1b', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠️ Esta fragrância está temporariamente esgotada em todas as modalidades.</span>
                  </div>
                  <button 
                    disabled
                    style={{ width: '100%', backgroundColor: '#e5e7eb', color: '#9ca3af', border: 'none', padding: '16px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '10px' }}
                  >
                    <ShoppingBag size={18} /> Produto Esgotado
                  </button>
                  <a 
                    href={`https://wa.me/553175650503?text=${encodeURIComponent(`Olá! Tenho muito interesse no perfume ${product.name} (SKU: ${product.code}), que consta como esgotado no site. Poderiam me avisar quando chegar reposição?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: '100%', backgroundColor: '#25D366', color: '#ffffff', textDecoration: 'none', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxSizing: 'border-box' }}
                  >
                    <MessageCircle size={18} /> Avise-me quando chegar (WhatsApp)
                  </a>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="#059669" />
                    <span>
                      Prazo estimado: <strong>{activeModalityConfig?.lead_time || '1 a 2 dias úteis'}</strong>. Pagamento via Pix ou Cartão 100% seguro.
                    </span>
                  </p>
                  
                  <button 
                    onClick={() => addToCart(product, {
                      modality: selectedModality,
                      price: currentPrice,
                      lead_time: activeModalityConfig?.lead_time || '1 a 2 dias úteis',
                      label: selectedModality === 'expresso' ? '⚡ Receber Mais Rápido' : selectedModality === 'programado_7' ? '📦 Economizar' : '💰 Melhor Preço'
                    })}
                    style={{
                      width: '100%', backgroundColor: 'var(--snack-green-dark, #172b14)', color: '#ffffff',
                      border: 'none', padding: '16px', borderRadius: '8px', fontSize: '13px',
                      fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                      boxShadow: '0 4px 14px rgba(23,43,20,0.25)', transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#29451f'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--snack-green-dark, #172b14)'}
                  >
                    <ShoppingBag size={18} /> Adicionar à Sacola • R$ {currentPrice.toFixed(2).replace('.', ',')}
                  </button>
                </>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <ShieldCheck size={20} style={{ color: '#000' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>Produto Original</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Garantia de procedência em todas as fragrâncias.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={20} style={{ color: '#000' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>Entrega Expressa BH</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Receba no mesmo dia em Belo Horizonte via motoboy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 80px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '32px' }}>
          <button 
            onClick={() => setActiveTab('details')}
            style={{ 
              padding: '16px 24px', 
              backgroundColor: 'transparent', 
              border: 'none', 
              borderBottom: activeTab === 'details' ? '2px solid #000' : '2px solid transparent',
              color: activeTab === 'details' ? '#000' : '#888',
              fontSize: '14px', 
              fontWeight: 'bold', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Info size={16} /> Detalhes do Produto
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            style={{ 
              padding: '16px 24px', 
              backgroundColor: 'transparent', 
              border: 'none', 
              borderBottom: activeTab === 'reviews' ? '2px solid #000' : '2px solid transparent',
              color: activeTab === 'reviews' ? '#000' : '#888',
              fontSize: '14px', 
              fontWeight: 'bold', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <MessageCircle size={16} /> Avaliações ({reviews.length})
          </button>
        </div>

        {/* Tab Content: Details */}
        {activeTab === 'details' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', fontFamily: 'serif' }}>Sobre a Fragrância</h3>
              <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                {product.longDescription || product.description}
              </p>

              {product.topNotes && (
                <div style={{ marginTop: '32px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Pirâmide Olfativa</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#000' }}>Notas de Topo:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                        {product.topNotes.map((n, i) => <span key={i} style={{ backgroundColor: '#f5f5f5', padding: '4px 10px', borderRadius: '2px', fontSize: '12px' }}>{n}</span>)}
                      </div>
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#000' }}>Notas de Coração:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                        {product.heartNotes.map((n, i) => <span key={i} style={{ backgroundColor: '#f5f5f5', padding: '4px 10px', borderRadius: '2px', fontSize: '12px' }}>{n}</span>)}
                      </div>
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#000' }}>Notas de Fundo:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                        {product.baseNotes.map((n, i) => <span key={i} style={{ backgroundColor: '#f5f5f5', padding: '4px 10px', borderRadius: '2px', fontSize: '12px' }}>{n}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div style={{ backgroundColor: '#f9f9f9', padding: '32px', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>Ficha Técnica</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Marca</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000' }}>{product.brand}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Família Olfativa</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', textAlign: 'right' }}>{product.olfactoryFamily || 'Oriental'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Inspiração (Referência)</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', textAlign: 'right' }}>{product.inspiredBy || 'Exclusiva'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Projeção</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', textAlign: 'right' }}>{product.projection || 'Marcante'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Fixação na Pele</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', textAlign: 'right' }}>{product.duration || 'Longa duração'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Reviews */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            
            {/* Review List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'serif', margin: 0 }}>{averageRating}</h3>
                <div>
                  <StarRating rating={Math.round(averageRating)} size={20} />
                  <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Baseado em {reviews.length} avaliações</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={16} color="#888" />
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{review.name}</span>
                        <span style={{ backgroundColor: '#000', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '2px', textTransform: 'uppercase' }}>Comprador Verificado</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#888' }}>{review.date}</span>
                    </div>
                    <StarRating rating={review.rating} size={14} />
                    <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', marginTop: '12px' }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Write a Review Form */}
            <div>
              <div style={{ backgroundColor: '#f9f9f9', padding: '32px', borderRadius: '4px', border: '1px solid #f0f0f0', position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', fontFamily: 'serif' }}>Escreva uma Avaliação</h3>
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Sua Nota</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          type="button"
                          onClick={() => setNewReview({...newReview, rating: star})}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Star size={24} fill={star <= newReview.rating ? '#facc15' : 'none'} stroke={star <= newReview.rating ? '#facc15' : '#d1d5db'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Seu Nome</label>
                    <input 
                      type="text" 
                      required
                      value={newReview.name}
                      onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                      placeholder="Ex: João Souza"
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '2px', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Seu Comentário</label>
                    <textarea 
                      required
                      rows="4"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                      placeholder="O que você achou da fragrância, fixação e entrega?"
                      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '2px', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{ 
                      backgroundColor: '#000', color: '#fff', border: 'none', padding: '14px', 
                      borderRadius: '2px', fontWeight: 'bold', textTransform: 'uppercase', 
                      letterSpacing: '1px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 
                    }}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}
      </div>
      
      {/* Produtos Relacionados */}
      {relatedPerfumes.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto 80px auto', padding: '0 16px' }}>
          <div style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '16px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Você também pode gostar</h2>
          </div>
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {relatedPerfumes.map(related => (
              <div 
                key={`related-${related.code}`}
                onClick={() => {
                  navigate(`/produto/${related.slug}`);
                }}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              >
                <div style={{ height: '240px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                  <img src={related.image} alt={related.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '12px 0' }}>
                  <span style={{ fontSize: '10px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase' }}>{related.brand}</span>
                  <h4 style={{ fontSize: '13px', margin: '4px 0', color: '#1a1a1a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{related.name}</h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
