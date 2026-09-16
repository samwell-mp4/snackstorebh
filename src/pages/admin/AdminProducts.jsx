import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Copy, AlertTriangle, Check, X, ArrowUpDown, Filter, Eye, EyeOff } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock } = useStoreData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null); // null = new product
  const [formProduct, setFormProduct] = useState({
    name: '',
    brand: 'Brand Collection',
    volume: '25ml',
    price: 69.90,
    cost_price: 32.00,
    stock: 12,
    min_stock: 5,
    gender: 'Feminino',
    image: '/perfumes/200.webp',
    description: '',
    olfactoryFamily: '',
    inspiredBy: '',
    is_active: true
  });

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Unique brands list for filter
  const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean).sort();

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.inspiredBy && p.inspiredBy.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
    const matchGender = selectedGender === 'ALL' || p.gender === selectedGender;
    
    let matchStock = true;
    if (stockFilter === 'IN_STOCK') matchStock = (p.stock || 0) > (p.min_stock || 5);
    else if (stockFilter === 'LOW_STOCK') matchStock = (p.stock || 0) > 0 && (p.stock || 0) <= (p.min_stock || 5);
    else if (stockFilter === 'OUT_OF_STOCK') matchStock = (p.stock || 0) <= 0;

    return matchSearch && matchBrand && matchGender && matchStock;
  });

  const handleOpenAddModal = () => {
    setEditingCode(null);
    setFormProduct({
      name: '',
      brand: 'Brand Collection',
      volume: '25ml',
      price: 69.90,
      cost_price: 32.00,
      stock: 12,
      min_stock: 5,
      gender: 'Feminino',
      image: '/perfumes/200.webp',
      description: '',
      olfactoryFamily: 'Floral',
      inspiredBy: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingCode(p.code);
    setFormProduct({
      name: p.name,
      brand: p.brand,
      volume: p.volume || '25ml',
      price: p.price,
      cost_price: p.cost_price || Math.round(p.price * 0.45 * 100) / 100,
      stock: p.stock !== undefined ? p.stock : 10,
      min_stock: p.min_stock || 5,
      gender: p.gender || 'Unissex',
      image: p.image || '/perfumes/200.webp',
      description: p.description || '',
      olfactoryFamily: p.olfactoryFamily || '',
      inspiredBy: p.inspiredBy || '',
      is_active: p.is_active !== undefined ? p.is_active : true
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingCode) {
      updateProduct(editingCode, formProduct);
      showToast(`Produto "${formProduct.name}" atualizado com sucesso!`);
    } else {
      addProduct(formProduct);
      showToast(`Novo perfume cadastrado no catálogo!`);
    }
    setIsModalOpen(false);
  };

  const handleDuplicate = (p) => {
    const copy = {
      ...p,
      code: 'CPY-' + Math.floor(1000 + Math.random() * 9000),
      name: p.name + ' (Cópia)',
      stock: 5
    };
    delete copy.slug;
    addProduct(copy);
    showToast(`Perfume duplicado com sucesso!`);
  };

  const handleDelete = (code, name) => {
    if (window.confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      deleteProduct(code);
      showToast(`Produto excluído.`);
    }
  };

  // Markup calculation
  const markupPercent = formProduct.cost_price > 0
    ? (((formProduct.price - formProduct.cost_price) / formProduct.cost_price) * 100).toFixed(0)
    : 0;
  const unitProfit = (formProduct.price - formProduct.cost_price).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', padding: '12px 20px',
          borderRadius: '10px', boxShadow: '0 8px 25px rgba(0,0,0,0.15)', fontSize: '13px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Check size={16} color="var(--snack-gold)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px 24px',
        border: '1px solid rgba(41,69,31,0.08)', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
            Catálogo de Produtos & Controle de Estoque
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--snack-muted)' }}>
            Total de {products.length} fragrâncias cadastradas ({filteredProducts.length} exibidas no filtro atual)
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          style={{
            backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', border: 'none',
            padding: '10px 20px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}
        >
          <Plus size={16} /> Novo Perfume
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '16px 20px',
        border: '1px solid rgba(41,69,31,0.08)', display: 'flex', flexWrap: 'wrap', gap: '12px',
        alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por nome, código SKU ou inspiração..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px',
              border: '1px solid rgba(41,69,31,0.15)', fontSize: '13px', backgroundColor: '#FAF8F2',
              outline: 'none'
            }}
          />
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* Brand */}
          <select
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2', color: 'var(--snack-text)' }}
          >
            <option value="ALL">Todas as Marcas</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Gender */}
          <select
            value={selectedGender}
            onChange={e => setSelectedGender(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2', color: 'var(--snack-text)' }}
          >
            <option value="ALL">Todos os Gêneros</option>
            <option value="Feminino">Femininos</option>
            <option value="Masculino">Masculinos</option>
            <option value="Unissex">Unissex</option>
          </select>

          {/* Stock status filter chips */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#FAF8F2', padding: '3px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.1)' }}>
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'IN_STOCK', label: 'Em Estoque' },
              { id: 'LOW_STOCK', label: 'Estoque Baixo' },
              { id: 'OUT_OF_STOCK', label: 'Esgotado' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStockFilter(f.id)}
                style={{
                  border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: stockFilter === f.id ? '700' : '500',
                  cursor: 'pointer', backgroundColor: stockFilter === f.id ? '#FFFFFF' : 'transparent',
                  color: stockFilter === f.id ? 'var(--snack-green-dark)' : 'var(--snack-muted)',
                  boxShadow: stockFilter === f.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(41,69,31,0.08)', color: 'var(--snack-muted)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px' }}>
                <th style={{ padding: '14px 18px' }}>Produto</th>
                <th style={{ padding: '14px 14px' }}>Marca / Linha</th>
                <th style={{ padding: '14px 14px' }}>Preço Venda</th>
                <th style={{ padding: '14px 14px' }}>Custo</th>
                <th style={{ padding: '14px 14px' }}>Estoque Atual</th>
                <th style={{ padding: '14px 14px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--snack-muted)' }}>
                    Nenhum produto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const stock = p.stock !== undefined ? p.stock : 10;
                  const minStock = p.min_stock || 5;
                  const isOut = stock <= 0;
                  const isLow = stock > 0 && stock <= minStock;

                  return (
                    <tr
                      key={p.code}
                      style={{
                        borderBottom: '1px solid rgba(41,69,31,0.04)',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF8F2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Product Name & Code */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={p.image || '/perfumes/200.webp'}
                            alt={p.name}
                            style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', padding: '2px' }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--snack-text)' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--snack-muted)', display: 'flex', gap: '6px' }}>
                              <span>SKU: {p.code}</span>
                              {p.inspiredBy && (
                                <span>• Insp: <strong style={{ color: 'var(--snack-green-dark)' }}>{p.inspiredBy}</strong></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Brand & Volume */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--snack-text)' }}>{p.brand}</div>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>{p.volume || '25ml'} • {p.gender}</div>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                        R$ {p.price?.toFixed(2)}
                      </td>

                      {/* Cost */}
                      <td style={{ padding: '12px 14px', color: 'var(--snack-muted)' }}>
                        R$ {(p.cost_price || p.price * 0.45)?.toFixed(2)}
                      </td>

                      {/* Stock with quick buttons */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => adjustStock(p.code, -1)}
                            style={{
                              width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(41,69,31,0.2)',
                              backgroundColor: '#FAF8F2', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                            }}
                          >
                            -
                          </button>
                          <span style={{
                            minWidth: '32px', textAlign: 'center', fontWeight: '800', fontSize: '13px',
                            color: isOut ? '#ef4444' : isLow ? '#f59e0b' : 'var(--snack-green-dark)'
                          }}>
                            {stock}
                          </span>
                          <button
                            onClick={() => adjustStock(p.code, 1)}
                            style={{
                              width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(41,69,31,0.2)',
                              backgroundColor: '#FAF8F2', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Stock Badge */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '99px',
                          backgroundColor: isOut ? '#fee2e2' : isLow ? '#fef3c7' : '#dcfce7',
                          color: isOut ? '#991b1b' : isLow ? '#92400e' : '#166534'
                        }}>
                          {isOut ? 'Esgotado' : isLow ? 'Estoque Baixo' : 'Em Estoque'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Editar perfume"
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(41,69,31,0.1)', background: '#FAF8F2', cursor: 'pointer', color: 'var(--snack-green-dark)' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(p)}
                            title="Duplicar perfume"
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid rgba(41,69,31,0.1)', background: '#FAF8F2', cursor: 'pointer', color: 'var(--snack-muted)' }}
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.code, p.name)}
                            title="Excluir do catálogo"
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fff', cursor: 'pointer', color: '#ef4444' }}
                          >
                            <Trash2 size={14} />
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

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          backgroundColor: 'rgba(23, 43, 20, 0.45)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '680px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            border: '1px solid rgba(41,69,31,0.12)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(41,69,31,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF8F2'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)' }}>
                  {editingCode ? 'Editar Cadastro' : 'Novo Produto'}
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
                  {editingCode ? formProduct.name : 'Adicionar Fragrância ao Catálogo'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-muted)', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Name */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                  Nome Comercial *
                </label>
                <input
                  type="text"
                  required
                  value={formProduct.name}
                  onChange={e => setFormProduct({ ...formProduct, name: e.target.value })}
                  placeholder="Ex: Perfume Brand Collection 001 - Miss Dior 25ml"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              {/* Brand & Volume & Gender */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Marca / Linha
                  </label>
                  <input
                    type="text"
                    required
                    value={formProduct.brand}
                    onChange={e => setFormProduct({ ...formProduct, brand: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Volume
                  </label>
                  <input
                    type="text"
                    value={formProduct.volume}
                    onChange={e => setFormProduct({ ...formProduct, volume: e.target.value })}
                    placeholder="25ml"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Gênero
                  </label>
                  <select
                    value={formProduct.gender}
                    onChange={e => setFormProduct({ ...formProduct, gender: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Unissex">Unissex</option>
                  </select>
                </div>
              </div>

              {/* Financial & Stock Details */}
              <div style={{ backgroundColor: '#FAF8F2', padding: '16px', borderRadius: '12px', border: '1px solid rgba(41,69,31,0.08)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--snack-gold)', display: 'block', marginBottom: '10px' }}>
                  Precificação & Margens Financeiras
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                      Preço Venda (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formProduct.price}
                      onChange={e => setFormProduct({ ...formProduct, price: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                      Preço Custo (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formProduct.cost_price}
                      onChange={e => setFormProduct({ ...formProduct, cost_price: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                      Estoque Atual
                    </label>
                    <input
                      type="number"
                      required
                      value={formProduct.stock}
                      onChange={e => setFormProduct({ ...formProduct, stock: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                      Alerta Mínimo
                    </label>
                    <input
                      type="number"
                      value={formProduct.min_stock}
                      onChange={e => setFormProduct({ ...formProduct, min_stock: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--snack-green-dark)', display: 'flex', gap: '16px' }}>
                  <span>Lucro unitário: <strong>R$ {unitProfit}</strong></span>
                  <span>Margem Markup: <strong>{markupPercent}%</strong></span>
                </div>
              </div>

              {/* Olfactory Inspirations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Inspirado Em (Contratipo)
                  </label>
                  <input
                    type="text"
                    value={formProduct.inspiredBy}
                    onChange={e => setFormProduct({ ...formProduct, inspiredBy: e.target.value })}
                    placeholder="Ex: Dior Sauvage / Good Girl"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Família Olfativa
                  </label>
                  <input
                    type="text"
                    value={formProduct.olfactoryFamily}
                    onChange={e => setFormProduct({ ...formProduct, olfactoryFamily: e.target.value })}
                    placeholder="Ex: Oriental Amadeirado, Floral Frutado"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Image URL with preview */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                  URL da Imagem
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={formProduct.image}
                    onChange={e => setFormProduct({ ...formProduct, image: e.target.value })}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                  <img
                    src={formProduct.image || '/perfumes/200.webp'}
                    alt="Preview"
                    style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#FAF8F2', border: '1px solid rgba(0,0,0,0.1)' }}
                  />
                </div>
              </div>

              {/* Action Submit */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '12px 20px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', background: 'transparent', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
                >
                  {editingCode ? 'Salvar Alterações' : 'Cadastrar Perfume'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
