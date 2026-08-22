import React, { useState, useEffect } from 'react';
import { Search, X, ShoppingBag, ArrowLeft, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';

const norm = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const categoryLinks = [
  { slug: 'mini-perfumes-importados', label: 'Todos' },
  { slug: 'brand-collection', label: 'Brand Collection' },
  { slug: 'arabic-collection', label: 'Arabic Collection' },
  { slug: 'mini-perfumes-femininos', label: 'Femininos' },
  { slug: 'mini-perfumes-masculinos', label: 'Masculinos' },
  { slug: 'mini-perfumes-unissex', label: 'Unissex' },
  { slug: 'mini-perfumes-para-presente', label: 'Para Presente' },
  { slug: 'mini-perfumes-em-bh', label: 'Em BH' }
];

const GENDERS = ['Feminino', 'Masculino', 'Compartilhável'];

export default function CategoryPage({ perfumes, addToCart }) {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [gender, setGender] = useState(null);
  const [collection, setCollection] = useState(null);
  const [activeBrand, setActiveBrand] = useState(() => searchParams.get('marca') || null);
  const [sort, setSort] = useState('relevance');
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const isBrand = p => p.categorySlugs && p.categorySlugs.includes('brand-collection');
  const isArabic = p => p.categorySlugs && p.categorySlugs.includes('arabic-collection');

  let base = perfumes;
  let pageTitle = "Mini Perfumes Importados 25ml | Perfumes em BH";
  let h1Title = "Mini Perfumes Importados";

  if (categorySlug === 'mini-perfumes-femininos') {
    base = perfumes.filter(p => p.gender === 'Feminino');
    pageTitle = "Mini Perfumes Femininos 25ml | Perfumes Importados";
    h1Title = "Mini Perfumes Femininos 25ml";
  } else if (categorySlug === 'mini-perfumes-masculinos') {
    base = perfumes.filter(p => p.gender === 'Masculino');
    pageTitle = "Mini Perfumes Masculinos 25ml | Perfumes Importados";
    h1Title = "Mini Perfumes Masculinos 25ml";
  } else if (categorySlug === 'mini-perfumes-unissex') {
    base = perfumes.filter(p => p.gender === 'Compartilhável');
    pageTitle = "Mini Perfumes Unissex 25ml | Miniaturas Importadas";
    h1Title = "Mini Perfumes Unissex 25ml";
  } else if (categorySlug === 'brand-collection') {
    base = perfumes.filter(isBrand);
    pageTitle = "Brand Collection 25ml | Mini Perfumes Femininos e Masculinos";
    h1Title = "Perfumes Brand Collection 25ml";
  } else if (categorySlug === 'arabic-collection') {
    base = perfumes.filter(isArabic);
    pageTitle = "Arabic Collection 25ml | Mini Perfumes Árabes";
    h1Title = "Perfumes Arabic Collection 25ml";
  } else if (categorySlug === 'mini-perfumes-para-presente') {
    base = perfumes.filter(p => p.categorySlugs && p.categorySlugs.includes('mini-perfumes-para-presente'));
    pageTitle = "Mini Perfumes para Presente | Perfumes 25ml";
    h1Title = "Mini Perfumes para Presente";
  } else if (categorySlug === 'mini-perfumes-em-bh') {
    base = perfumes;
    pageTitle = "Mini Perfumes em BH | Miniaturas de Perfumes 25ml";
    h1Title = "Mini Perfumes em Belo Horizonte";
  }

  const q = norm(search);
  const searchFiltered = base.filter(p => !q || norm(p.name).includes(q) || norm(p.brand).includes(q));

  const brandCounts = {};
  searchFiltered.forEach(p => { brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1; });
  const brandOptions = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);

  let shown = searchFiltered;
  if (gender) shown = shown.filter(p => p.gender === gender);
  if (collection === 'brand') shown = shown.filter(isBrand);
  if (collection === 'arabic') shown = shown.filter(isArabic);
  if (activeBrand) shown = shown.filter(p => p.brand === activeBrand);
  shown = [...shown];

  if (sort === 'price-asc') shown.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') shown.sort((a, b) => b.price - a.price);
  else if (sort === 'name-asc') shown.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'name-desc') shown.sort((a, b) => b.name.localeCompare(a.name));

  const activeCount = [search, gender, collection, activeBrand].filter(Boolean).length;

  const hasActiveFilters = Boolean(search || gender || collection || activeBrand);

  const clearAll = () => {
    setSearch('');
    setGender(null);
    setCollection(null);
    setActiveBrand(null);
    setSort('relevance');
    setCurrentPage(1);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, gender, collection, activeBrand, sort]);

  const totalPages = Math.ceil(shown.length / itemsPerPage);
  const currentItems = shown.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const chipStyle = (active) => ({
    backgroundColor: active ? '#000000' : '#ffffff',
    color: active ? '#ffffff' : '#1a1a1a',
    border: '1px solid #e0e0e0',
    padding: '8px 14px',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    borderRadius: '2px',
    whiteSpace: 'nowrap'
  });

  const visibleBrands = showAllBrands ? brandOptions : brandOptions.slice(0, 12);

  return (
    <>
      <SeoHead
        title={pageTitle}
        description={`Descubra nossa seleção especial de ${h1Title}. Fragrâncias exclusivas em miniaturas de 25ml por apenas R$ 79,90.`}
        url={`/${categorySlug}`}
        schemaType="CollectionPage"
      />

      <div style={{ padding: '24px 16px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#555', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar à loja inicial
          </Link>
        </div>
      </div>

      <section className="category-page" style={{ maxWidth: '1200px', margin: '40px auto 80px auto', padding: '0 16px' }}>
        {/* Categorias rápidas */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {categoryLinks.map(link => (
            <Link
              key={link.slug}
              to={`/${link.slug}`}
              style={{
                ...chipStyle(categorySlug === link.slug),
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {link.label} {categorySlug === link.slug && <ArrowRight size={12} />}
            </Link>
          ))}
        </div>

        {/* Barra fixa de filtros (mobile) */}
        <button
          className="filters-toggle-bar"
          onClick={() => setFiltersOpen(true)}
          style={{
            border: 'none', cursor: 'pointer',
            alignItems: 'center', justifyContent: 'center', gap: '8px',
            backgroundColor: '#000000', color: '#ffffff',
            fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'
          }}
        >
          <SlidersHorizontal size={16} /> Filtrar
          {activeCount > 0 && (
            <span style={{ backgroundColor: '#ffffff', color: '#000000', borderRadius: '50%', padding: '2px 8px', fontSize: '11px' }}>
              {activeCount}
            </span>
          )}
        </button>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Sidebar de filtros */}
          <aside className={`filters-sidebar ${filtersOpen ? 'filters-open' : ''}`} style={{ flex: '1 1 260px', minWidth: '240px' }}>
            <div className="filters-drawer-header" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Filtros</span>
              <button onClick={() => setFiltersOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }} aria-label="Fechar filtros">
                <X size={20} />
              </button>
            </div>
            <div style={{ backgroundColor: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '4px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <SlidersHorizontal size={16} /> Filtros
            </span>
            {hasActiveFilters && (
              <button onClick={clearAll} style={{ background: 'none', border: 'none', color: '#000000', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <X size={14} /> Limpar filtros
              </button>
            )}
          </div>

          {/* Busca */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888888' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou marca... (ex.: CH, Sauvage, Dior, Yara)"
              style={{
                width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e0e0e0',
                borderRadius: '2px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888888' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Gênero */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', minWidth: '70px' }}>Gênero:</span>
            <button onClick={() => setGender(null)} style={chipStyle(!gender)}>Todos</button>
            {GENDERS.map(g => (
              <button key={g} onClick={() => setGender(gender === g ? null : g)} style={chipStyle(gender === g)}>{g}</button>
            ))}
          </div>

          {/* Coleção */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', minWidth: '70px' }}>Coleção:</span>
            <button onClick={() => setCollection(null)} style={chipStyle(!collection)}>Todas</button>
            <button onClick={() => setCollection(collection === 'brand' ? null : 'brand')} style={chipStyle(collection === 'brand')}>Brand Collection</button>
            <button onClick={() => setCollection(collection === 'arabic' ? null : 'arabic')} style={chipStyle(collection === 'arabic')}>Arabic Collection</button>
          </div>

          {/* Marcas */}
          {brandOptions.length > 1 && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                Marcas ({brandOptions.length}):
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveBrand(null)} style={chipStyle(!activeBrand)}>Todas as Marcas</button>
                {visibleBrands.map(([brand, count]) => (
                  <button key={brand} onClick={() => setActiveBrand(activeBrand === brand ? null : brand)} style={chipStyle(activeBrand === brand)}>
                    {brand} <span style={{ opacity: 0.6 }}>({count})</span>
                  </button>
                ))}
                {brandOptions.length > 12 && (
                  <button onClick={() => setShowAllBrands(!showAllBrands)} style={{ ...chipStyle(false), borderStyle: 'dashed' }}>
                    {showAllBrands ? 'Ver menos' : `Ver todas (${brandOptions.length})`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Ordenação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', minWidth: '70px' }}>Ordenar:</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '2px', fontSize: '13px', backgroundColor: '#ffffff', outline: 'none' }}
            >
              <option value="relevance">Relevância</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="name-asc">Nome (A–Z)</option>
              <option value="name-desc">Nome (Z–A)</option>
            </select>
          </div>
            </div>
          </aside>

          {/* Conteúdo: título + grade */}
          <div style={{ flex: '1 1 600px', minWidth: '0' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0' }}>{h1Title}</h1>
              <span style={{ fontSize: '14px', color: '#555555' }}>Mostrando {shown.length} perfumes</span>
            </div>

            {/* Filtros ativos */}
            {hasActiveFilters && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px' }}>Filtros ativos:</span>
            {search && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#000000', color: '#ffffff', padding: '6px 12px', borderRadius: '2px', fontSize: '11px', fontWeight: 'bold' }}>
                "{search}" <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex' }}><X size={12} /></button>
              </span>
            )}
            {gender && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#000000', color: '#ffffff', padding: '6px 12px', borderRadius: '2px', fontSize: '11px', fontWeight: 'bold' }}>
                {gender} <button onClick={() => setGender(null)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex' }}><X size={12} /></button>
              </span>
            )}
            {collection && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#000000', color: '#ffffff', padding: '6px 12px', borderRadius: '2px', fontSize: '11px', fontWeight: 'bold' }}>
                {collection === 'brand' ? 'Brand Collection' : 'Arabic Collection'} <button onClick={() => setCollection(null)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex' }}><X size={12} /></button>
              </span>
            )}
            {activeBrand && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#000000', color: '#ffffff', padding: '6px 12px', borderRadius: '2px', fontSize: '11px', fontWeight: 'bold' }}>
                {activeBrand} <button onClick={() => setActiveBrand(null)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex' }}><X size={12} /></button>
              </span>
            )}
          </div>
        )}

        {shown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888888' }}>
            Nenhum perfume encontrado com esses filtros. Tente limpar alguns filtros.
          </div>
        ) : (
          <>
            <div className="product-grid">
              {currentItems.map(perfume => (
              <div
                key={perfume.code}
                onClick={() => navigate(`/produto/${perfume.slug}`)}
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
                  <span style={{ fontSize: '10px', color: '#888888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{perfume.brand}</span>
                  <h3 style={{ fontSize: '14px', margin: '4px 0', color: '#1a1a1a', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfume.name}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#888888', textDecoration: 'line-through' }}>R$ 119,90</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>R$ 79,90</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(perfume); }}
                    style={{ marginTop: 'auto', backgroundColor: '#ffffff', color: '#000000', border: '1px solid #000000', padding: '10px', borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
                  >
                    <ShoppingBag size={14} /> Adicionar
                  </button>
                </div>
              </div>
            ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '48px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '8px 16px', border: '1px solid #e0e0e0', backgroundColor: currentPage === 1 ? '#fafafa' : '#fff', color: currentPage === 1 ? '#aaa' : '#000', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderRadius: '4px' }}
                >
                  Anterior
                </button>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const p = idx + 1;
                    const isActive = p === currentPage;
                    return (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        style={{
                          width: '36px', height: '36px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: isActive ? '1px solid #000' : '1px solid #e0e0e0',
                          backgroundColor: isActive ? '#000' : '#fff',
                          color: isActive ? '#fff' : '#555',
                          fontWeight: 'bold', fontSize: '13px', borderRadius: '4px', cursor: 'pointer'
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '8px 16px', border: '1px solid #e0e0e0', backgroundColor: currentPage === totalPages ? '#fafafa' : '#fff', color: currentPage === totalPages ? '#aaa' : '#000', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderRadius: '4px' }}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}

          </div>
        </div>

        {categorySlug === 'mini-perfumes-em-bh' && (
          <div style={{ marginTop: '60px', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Entregas Expressas em Belo Horizonte</h2>
            <p>A Snack Store oferece entregas no mesmo dia para diversos bairros de BH. Consulte taxa e disponibilidade via WhatsApp.</p>
          </div>
        )}
      </section>
    </>
  );
}