import React, { useState, useRef } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Copy, Check, X, 
  UploadCloud, Image as ImageIcon, Tag, FolderPlus, Layers, Loader2
} from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { apiService } from '../../services/api';

export default function AdminProducts() {
  const { 
    products, 
    categories, 
    tags, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    adjustStock,
    setStock,
    bulkUpdate,
    bulkDelete,
    addCategory,
    addTag
  } = useStoreData();

  const [selectedCodes, setSelectedCodes] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkUrlInput, setBulkUrlInput] = useState('');
  const [showBulkUrlBox, setShowBulkUrlBox] = useState(false);

  // Inline Category / Tag Creation State
  const [newCatName, setNewCatName] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  const fileInputRef = useRef(null);

  const defaultFormState = {
    name: '',
    brand: 'Brand Collection',
    volume: '25ml',
    price: 79.90, // Preço de Varejo (Consumidor Final / Deslogado)
    wholesale_price: 55.00, // Preço de Atacado (Revenda / Revendedor)
    cost_price: 35.00, // Preço de Custo (Loja)
    stock: 12,
    min_stock: 5,
    gender: 'Feminino',
    image: '/perfumes/200.webp',
    images: ['/perfumes/200.webp'],
    categorySlugs: ['mini-perfumes-25ml'],
    tags: ['Mais Vendido'],
    description: '',
    longDescription: '',
    olfactoryFamily: 'Floral',
    inspiredBy: '',
    is_active: true
  };

  const [formProduct, setFormProduct] = useState(defaultFormState);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean).sort();

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.inspiredBy && p.inspiredBy.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
    const matchGender = selectedGender === 'ALL' || p.gender === selectedGender;
    
    const matchCategory = selectedCategory === 'ALL' || 
      (p.categorySlugs && p.categorySlugs.includes(selectedCategory));

    const matchTag = selectedTag === 'ALL' || 
      (p.tags && p.tags.includes(selectedTag));

    let matchStock = true;
    if (stockFilter === 'IN_STOCK') matchStock = (p.stock || 0) > (p.min_stock || 5);
    else if (stockFilter === 'LOW_STOCK') matchStock = (p.stock || 0) > 0 && (p.stock || 0) <= (p.min_stock || 5);
    else if (stockFilter === 'OUT_OF_STOCK') matchStock = (p.stock || 0) <= 0;

    return matchSearch && matchBrand && matchGender && matchCategory && matchTag && matchStock;
  });

  const sellPrice = parseFloat(formProduct.price) || 0;
  const wholesalePrice = parseFloat(formProduct.wholesale_price) || Math.round((sellPrice * 0.72) * 10) / 10;
  const costPrice = parseFloat(formProduct.cost_price) || 0;
  const unitProfitRetail = (sellPrice - costPrice).toFixed(2);
  const unitProfitWholesale = (wholesalePrice - costPrice).toFixed(2);
  const resellerProfit = (sellPrice - wholesalePrice).toFixed(2);
  const markupPercent = costPrice > 0
    ? (((sellPrice - costPrice) / costPrice) * 100).toFixed(1)
    : (sellPrice > 0 ? '100.0' : '0.0');

  const handleOpenAddModal = () => {
    setEditingCode(null);
    setFormProduct(defaultFormState);
    setBulkUrlInput('');
    setShowBulkUrlBox(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingCode(p.code);
    const existingImages = Array.isArray(p.images) && p.images.length > 0 
      ? p.images 
      : (p.image ? [p.image] : ['/perfumes/200.webp']);

    const retailVal = parseFloat(p.price) || 79.90;
    const wholesaleVal = p.wholesale_price !== undefined 
      ? parseFloat(p.wholesale_price) 
      : Math.round((retailVal * 0.72) * 10) / 10;
    const costVal = p.cost_price !== undefined 
      ? parseFloat(p.cost_price) 
      : Math.round(retailVal * 0.45 * 100) / 100;

    setFormProduct({
      name: p.name,
      brand: p.brand,
      volume: p.volume || '25ml',
      price: retailVal,
      wholesale_price: wholesaleVal,
      cost_price: costVal,
      stock: p.stock !== undefined ? p.stock : 10,
      min_stock: p.min_stock || 5,
      gender: p.gender || 'Unissex',
      image: p.image || existingImages[0] || '/perfumes/200.webp',
      images: existingImages,
      categorySlugs: Array.isArray(p.categorySlugs) ? p.categorySlugs : ['mini-perfumes-25ml'],
      tags: Array.isArray(p.tags) ? p.tags : [],
      description: p.description || '',
      longDescription: p.longDescription || p.description || '',
      olfactoryFamily: p.olfactoryFamily || '',
      inspiredBy: p.inspiredBy || '',
      is_active: p.is_active !== undefined ? p.is_active : true
    });
    setBulkUrlInput('');
    setShowBulkUrlBox(false);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const base64Promises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const base64List = await Promise.all(base64Promises);
      const uploadedUrls = await apiService.uploadImages(base64List);

      setFormProduct(prev => {
        const combined = [...(prev.images || []), ...uploadedUrls];
        const unique = Array.from(new Set(combined));
        return {
          ...prev,
          images: unique,
          image: unique[0] || prev.image
        };
      });

      showToast(uploadedUrls.length + ' foto(s) adicionada(s) com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar fotos: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddBulkUrls = () => {
    if (!bulkUrlInput.trim()) return;
    const urls = bulkUrlInput
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.length > 5);

    if (urls.length === 0) return;

    setFormProduct(prev => {
      const combined = [...(prev.images || []), ...urls];
      const unique = Array.from(new Set(combined));
      return {
        ...prev,
        images: unique,
        image: unique[0] || prev.image
      };
    });

    setBulkUrlInput('');
    setShowBulkUrlBox(false);
    showToast(urls.length + ' link(s) de imagem adicionado(s)!');
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormProduct(prev => {
      const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
      const fallback = updated.length > 0 ? updated : ['/perfumes/200.webp'];
      return {
        ...prev,
        images: fallback,
        image: fallback[0]
      };
    });
  };

  const handleSetCover = (index) => {
    setFormProduct(prev => {
      const target = prev.images[index];
      const rest = prev.images.filter((_, idx) => idx !== index);
      const reordered = [target, ...rest];
      return {
        ...prev,
        images: reordered,
        image: target
      };
    });
    showToast('Foto definida como capa principal!');
  };

  const toggleCategory = (slug) => {
    setFormProduct(prev => {
      const current = prev.categorySlugs || [];
      const exists = current.includes(slug);
      const updated = exists ? current.filter(s => s !== slug) : [...current, slug];
      return { ...prev, categorySlugs: updated };
    });
  };

  const toggleTag = (tagName) => {
    setFormProduct(prev => {
      const current = prev.tags || [];
      const exists = current.includes(tagName);
      const updated = exists ? current.filter(t => t !== tagName) : [...current, tagName];
      return { ...prev, tags: updated };
    });
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const slug = newCatName.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const created = await addCategory({ name: newCatName.trim(), slug });
      setFormProduct(prev => ({
        ...prev,
        categorySlugs: Array.from(new Set([...(prev.categorySlugs || []), created.slug]))
      }));
      setNewCatName('');
      setShowNewCatInput(false);
      showToast('Categoria "' + created.name + '" criada e selecionada!');
    } catch (err) {
      alert('Erro ao criar categoria: ' + err.message);
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      const name = newTagName.trim();
      const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const created = await addTag({ name, slug });
      setFormProduct(prev => ({
        ...prev,
        tags: Array.from(new Set([...(prev.tags || []), created.name]))
      }));
      setNewTagName('');
      setShowNewTagInput(false);
      showToast('Tag "' + created.name + '" criada e selecionada!');
    } catch (err) {
      alert('Erro ao criar tag: ' + err.message);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const retailVal = parseFloat(formProduct.price) || 0;
      const wholesaleVal = parseFloat(formProduct.wholesale_price) || Math.round((retailVal * 0.72) * 10) / 10;
      const costVal = parseFloat(formProduct.cost_price) || 0;

      const payload = {
        ...formProduct,
        image: formProduct.images[0] || formProduct.image || '/perfumes/200.webp',
        price: retailVal, // Preço de Varejo (Consumidor Final / Deslogado)
        wholesale_price: wholesaleVal, // Preço de Atacado (Revenda)
        cost_price: costVal, // Preço de Custo (Loja)
        stock: parseInt(formProduct.stock) || 0,
        min_stock: parseInt(formProduct.min_stock) || 5
      };

      if (editingCode) {
        await updateProduct(editingCode, payload);
        showToast('Perfume "' + payload.name + '" atualizado e publicado no site!');
      } else {
        await addProduct(payload);
        showToast('Novo perfume publicado com sucesso no site!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar produto: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (p) => {
    const copy = {
      ...p,
      code: 'CPY-' + Math.floor(1000 + Math.random() * 9000),
      name: p.name + ' (Cópia)',
      stock: 5
    };
    delete copy.slug;
    await addProduct(copy);
    showToast('Perfume duplicado e publicado com sucesso!');
  };

  const handleDelete = async (code, name) => {
    if (window.confirm('Tem certeza que deseja excluir "' + name + '"? Ele será removido da loja imediatamente.')) {
      await deleteProduct(code);
      showToast('Produto excluído com sucesso.');
    }
  };

  const isAllSelected = filteredProducts.length > 0 && selectedCodes.length === filteredProducts.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(filteredProducts.map(p => p.code));
    }
  };

  const handleToggleSelect = (code) => {
    setSelectedCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Bulk Actions
  const handleBulkZeroStock = async () => {
    if (!window.confirm(`Tem certeza que deseja ZERAR o estoque de ${selectedCodes.length} perfume(s)?\nEles ficarão marcados como ESGOTADOS na loja.`)) return;
    await bulkUpdate(selectedCodes, { stock: 0 });
    showToast(`Estoque de ${selectedCodes.length} perfume(s) zerado com sucesso!`);
  };

  const handleBulkSetStock = async () => {
    const input = window.prompt(`Definir estoque em massa para ${selectedCodes.length} perfume(s).\nDigite a quantidade exata desejada:`, '10');
    if (input === null) return;
    const num = Math.max(0, parseInt(input, 10) || 0);
    await bulkUpdate(selectedCodes, { stock: num });
    showToast(`Estoque de ${selectedCodes.length} perfume(s) definido para ${num} un.!`);
  };

  const handleBulkAddStock = async (delta) => {
    await bulkUpdate(selectedCodes, { stockDelta: delta });
    showToast(`Adicionadas +${delta} unidades ao estoque de ${selectedCodes.length} perfume(s)!`);
  };

  const handleBulkSetPrice = async () => {
    const input = window.prompt(`Definir Preço de Varejo (Deslogado/Consumidor) para ${selectedCodes.length} perfume(s).\nDigite o valor em R$ (ex.: 79.90):`, '79.90');
    if (input === null) return;
    const price = parseFloat(input.replace(',', '.'));
    if (isNaN(price) || price < 0) {
      alert('Valor inválido.');
      return;
    }
    await bulkUpdate(selectedCodes, { price });
    showToast(`Preço de Varejo de ${selectedCodes.length} perfume(s) atualizado para R$ ${price.toFixed(2)}!`);
  };

  const handleBulkSetWholesalePrice = async () => {
    const input = window.prompt(`Definir Preço de Atacado / Revenda para ${selectedCodes.length} perfume(s).\nDigite o valor em R$ (ex.: 55.00):`, '55.00');
    if (input === null) return;
    const wholesale_price = parseFloat(input.replace(',', '.'));
    if (isNaN(wholesale_price) || wholesale_price < 0) {
      alert('Valor inválido.');
      return;
    }
    await bulkUpdate(selectedCodes, { wholesale_price });
    showToast(`Preço de Atacado de ${selectedCodes.length} perfume(s) atualizado para R$ ${wholesale_price.toFixed(2)}!`);
  };

  const handleBulkToggleActive = async (isActive) => {
    await bulkUpdate(selectedCodes, { is_active: isActive });
    showToast(`${selectedCodes.length} perfume(s) ${isActive ? 'ativados na vitrine' : 'ocultados da vitrine'}!`);
  };

  const handleBulkAddTag = async () => {
    const tagOptions = tags.map(t => t.name).join(', ');
    const input = window.prompt(`Adicionar tag em massa aos ${selectedCodes.length} selecionados.\nTags existentes: ${tagOptions}\nDigite a tag:`, 'Mais Vendido');
    if (!input || !input.trim()) return;
    await bulkUpdate(selectedCodes, { addTag: input.trim() });
    showToast(`Tag "${input.trim()}" adicionada a ${selectedCodes.length} perfume(s)!`);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`ATENÇÃO: Deseja EXCLUIR PERMANENTEMENTE os ${selectedCodes.length} perfume(s) selecionados do catálogo?`)) return;
    await bulkDelete(selectedCodes);
    setSelectedCodes([]);
    showToast(`${selectedCodes.length} perfume(s) excluídos do catálogo.`);
  };

  const handleExportSelectedCsv = () => {
    const selectedProds = products.filter(p => selectedCodes.includes(p.code));
    let csv = "SKU,Nome,Marca,Volume,Preco,Custo,Estoque,Status,Genero\n";
    selectedProds.forEach(p => {
      const isOut = (p.stock || 0) <= 0;
      csv += `"${p.code}","${(p.name || '').replace(/"/g, '""')}","${p.brand || ''}","${p.volume || ''}",${p.price || 0},${p.cost_price || 0},${p.stock || 0},"${isOut ? 'Esgotado' : 'Em Estoque'}","${p.gender || ''}"\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `snack_store_selecionados_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast(`Planilha de ${selectedProds.length} perfume(s) exportada!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 2000,
          backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', padding: '14px 24px',
          borderRadius: '12px', boxShadow: '0 12px 35px rgba(0,0,0,0.25)', fontSize: '13px',
          fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <Check size={18} color="var(--snack-gold)" />
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
            padding: '12px 24px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase',
            letterSpacing: '0.8px', boxShadow: '0 4px 15px rgba(23,43,20,0.15)'
          }}
        >
          <Plus size={16} /> Novo Perfume
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px 20px',
        border: '1px solid rgba(41,69,31,0.08)', display: 'flex', flexWrap: 'wrap', gap: '12px',
        alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
          <Search size={16} color="var(--snack-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por nome, SKU, inspiração..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px',
              border: '1px solid rgba(41,69,31,0.15)', fontSize: '13px', backgroundColor: '#FAF8F2'
            }}
          />
        </div>

        {/* Brand Filter */}
        <select
          value={selectedBrand}
          onChange={e => setSelectedBrand(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2' }}
        >
          <option value="ALL">Todas as Marcas ({brands.length})</option>
          {brands.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2' }}
        >
          <option value="ALL">Todas as Categorias ({categories.length})</option>
          {categories.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Tag Filter */}
        <select
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2' }}
        >
          <option value="ALL">Todas as Tags ({tags.length})</option>
          {tags.map(t => (
            <option key={t.slug} value={t.name}>{t.name}</option>
          ))}
        </select>

        {/* Gender Filter */}
        <select
          value={selectedGender}
          onChange={e => setSelectedGender(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2' }}
        >
          <option value="ALL">Todos os Gêneros</option>
          <option value="Feminino">Feminino</option>
          <option value="Masculino">Masculino</option>
          <option value="Unissex">Unissex</option>
        </select>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2' }}
        >
          <option value="ALL">Todo o Estoque</option>
          <option value="IN_STOCK">Em Estoque</option>
          <option value="LOW_STOCK">Estoque Baixo</option>
          <option value="OUT_OF_STOCK">Esgotados</option>
        </select>
      </div>

      {/* Products Table */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(41,69,31,0.08)',
        overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(41,69,31,0.08)', color: 'var(--snack-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                <th style={{ padding: '14px 12px', width: '36px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={isAllSelected} 
                    onChange={handleToggleSelectAll} 
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--snack-green-dark)' }}
                    title={isAllSelected ? "Desmarcar todos" : "Selecionar todos os perfumes visíveis"}
                  />
                </th>
                <th style={{ padding: '14px 18px' }}>Produto / Fotos</th>
                <th style={{ padding: '14px 14px' }}>Marca & Gênero</th>
                <th style={{ padding: '14px 14px' }}>Tags & Categorias</th>
                <th style={{ padding: '14px 14px' }}>
                  <div>Preço Varejo</div>
                  <div style={{ fontSize: '9px', color: 'var(--snack-gold)', textTransform: 'none', fontWeight: 'bold' }}>Público / Deslogado</div>
                </th>
                <th style={{ padding: '14px 14px' }}>
                  <div>Preço Atacado</div>
                  <div style={{ fontSize: '9px', color: '#8b5cf6', textTransform: 'none', fontWeight: 'bold' }}>Revendedor / 10+ un</div>
                </th>
                <th style={{ padding: '14px 14px' }}>Custo / Margem</th>
                <th style={{ padding: '14px 14px' }}>Estoque (Numeral)</th>
                <th style={{ padding: '14px 14px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--snack-muted)' }}>
                    Nenhum perfume encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const stock = p.stock !== undefined ? p.stock : 0;
                  const min = p.min_stock || 5;
                  const isLow = stock > 0 && stock <= min;
                  const isOut = stock <= 0 || p.is_active === false;
                  const isSelected = selectedCodes.includes(p.code);
                  const photoCount = Array.isArray(p.images) ? p.images.length : 1;

                  return (
                    <tr 
                      key={p.code} 
                      style={{ 
                        borderBottom: '1px solid rgba(41,69,31,0.05)', 
                        backgroundColor: isSelected ? 'rgba(196,161,90,0.08)' : 'transparent',
                        transition: 'background-color 0.15s' 
                      }}
                    >
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => handleToggleSelect(p.code)} 
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--snack-green-dark)' }}
                        />
                      </td>

                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ position: 'relative' }}>
                            <img
                              src={p.image || '/perfumes/200.webp'}
                              alt={p.name}
                              style={{ width: '46px', height: '46px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)', padding: '2px' }}
                            />
                            {photoCount > 1 && (
                              <span style={{
                                position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: 'var(--snack-green-dark)',
                                color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '1px 5px', borderRadius: '99px'
                              }}>
                                {photoCount} fotos
                              </span>
                            )}
                          </div>
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

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--snack-text)' }}>{p.brand}</div>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>{p.volume || '25ml'} • {p.gender}</div>
                      </td>

                      <td style={{ padding: '12px 14px', maxWidth: '200px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {p.tags && p.tags.slice(0, 2).map((t, i) => (
                            <span key={i} style={{ fontSize: '10px', backgroundColor: '#F6F2E9', color: 'var(--snack-gold)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                              {t}
                            </span>
                          ))}
                          {p.categorySlugs && p.categorySlugs.slice(0, 1).map((c, i) => (
                            <span key={i} style={{ fontSize: '10px', backgroundColor: '#E8EFE5', color: 'var(--snack-green-dark)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                              {categories.find(cat => cat.slug === c)?.name || c}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Preço Varejo (Deslogado / Vitrine) */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--snack-green-dark)', fontSize: '13px' }}>
                          R$ {p.price?.toFixed(2)}
                        </div>
                        <span style={{ fontSize: '9px', backgroundColor: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
                          Varejo
                        </span>
                      </td>

                      {/* Preço Atacado (Revenda / 10+ un) */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '800', color: '#6b21a8', fontSize: '13px' }}>
                          R$ {(p.wholesale_price !== undefined ? p.wholesale_price : (p.price * 0.72))?.toFixed(2)}
                        </div>
                        <span style={{ fontSize: '9px', backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '1px 5px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase' }}>
                          Atacado
                        </span>
                      </td>

                      {/* Custo & Margem */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)', fontWeight: '600' }}>
                          Custo: R$ {(p.cost_price || p.price * 0.45)?.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#166534', fontWeight: '800' }}>
                          Lucro: +R$ {(p.price - (p.cost_price || p.price * 0.45)).toFixed(2)}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => adjustStock(p.code, -1)}
                            title="Diminuir 1 unidade"
                            style={{
                              width: '22px', height: '28px', borderRadius: '4px', border: '1px solid rgba(41,69,31,0.2)',
                              backgroundColor: '#FAF8F2', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            -
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            value={stock}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                              setStock(p.code, val);
                            }}
                            title="Digite diretamente o número do estoque"
                            style={{
                              width: '54px', height: '28px', textAlign: 'center', fontWeight: '800', fontSize: '13px',
                              borderRadius: '6px',
                              border: stock <= 0 ? '1px solid #ef4444' : isLow ? '1px solid #f59e0b' : '1px solid rgba(41,69,31,0.25)',
                              backgroundColor: stock <= 0 ? '#fef2f2' : '#ffffff',
                              color: stock <= 0 ? '#ef4444' : isLow ? '#b45309' : 'var(--snack-green-dark)',
                              outline: 'none'
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => adjustStock(p.code, 1)}
                            title="Aumentar 1 unidade"
                            style={{
                              width: '22px', height: '28px', borderRadius: '4px', border: '1px solid rgba(41,69,31,0.2)',
                              backgroundColor: '#FAF8F2', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            +
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setStock(p.code, 0);
                              showToast(`"${p.name}" zerado no estoque (Esgotado).`);
                            }}
                            title="Zerar estoque agora (marcar como esgotado)"
                            style={{
                              padding: '2px 6px', height: '28px', borderRadius: '4px',
                              border: '1px solid #fee2e2', backgroundColor: stock <= 0 ? '#fee2e2' : '#ffffff',
                              color: '#dc2626', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold'
                            }}
                          >
                            Zerar
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '99px',
                          backgroundColor: stock <= 0 ? '#fee2e2' : isLow ? '#fef3c7' : '#dcfce7',
                          color: stock <= 0 ? '#991b1b' : isLow ? '#92400e' : '#166534'
                        }}>
                          {stock <= 0 ? 'Esgotado' : isLow ? 'Estoque Baixo' : 'Em Estoque'}
                        </span>
                        {p.is_active === false && (
                          <span style={{ display: 'block', marginTop: '2px', fontSize: '9px', color: '#991b1b', fontWeight: 'bold' }}>
                            (Oculto no site)
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Editar perfume e fotos"
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

      {/* BARRA FLUTUANTE DE AÇÕES EM MASSA */}
      {selectedCodes.length > 0 && (
        <div style={{
          position: 'sticky', bottom: '20px', zIndex: 1000,
          backgroundColor: 'var(--snack-green-dark, #172b14)', color: '#FFFFFF',
          padding: '14px 24px', borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.35)', border: '1px solid rgba(196,161,90,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--snack-gold, #c4a15a)', letterSpacing: '0.5px' }}>
              ✓ {selectedCodes.length} {selectedCodes.length === 1 ? 'perfume selecionado' : 'perfumes selecionados'}
            </span>
            <button
              onClick={() => setSelectedCodes([])}
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer'
              }}
            >
              Desmarcar todos
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Zerar Estoque */}
            <button
              onClick={handleBulkZeroStock}
              title="Colocar estoque em 0 (Esgotar na loja)"
              style={{
                backgroundColor: '#ef4444', color: '#fff', border: 'none',
                padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Zerar Estoque (Esgotar)
            </button>

            {/* Definir Estoque Numérico */}
            <button
              onClick={handleBulkSetStock}
              title="Definir estoque exato para todos os selecionados"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Definir Estoque...
            </button>

            {/* +5 unidades */}
            <button
              onClick={() => handleBulkAddStock(5)}
              title="Adicionar +5 unidades a todos os selecionados"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              +5 un.
            </button>

            {/* +10 unidades */}
            <button
              onClick={() => handleBulkAddStock(10)}
              title="Adicionar +10 unidades a todos os selecionados"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              +10 un.
            </button>

            {/* Alterar Preço Varejo */}
            <button
              onClick={handleBulkSetPrice}
              title="Alterar o Preço de Varejo (Consumidor Final / Deslogado)"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Preço Varejo...
            </button>

            {/* Alterar Preço Atacado */}
            <button
              onClick={handleBulkSetWholesalePrice}
              title="Alterar o Preço de Atacado / Revenda"
              style={{
                backgroundColor: '#7c3aed', border: '1px solid #a78bfa',
                color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Preço Atacado...
            </button>

            {/* Ativar/Ocultar */}
            <button
              onClick={() => handleBulkToggleActive(true)}
              title="Exibir todos os selecionados na loja online"
              style={{
                backgroundColor: 'var(--snack-gold, #c4a15a)', color: 'var(--snack-green-dark, #172b14)',
                border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Ativar na Loja
            </button>

            <button
              onClick={() => handleBulkToggleActive(false)}
              title="Ocultar todos os selecionados da vitrine"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Ocultar da Loja
            </button>

            {/* Tag em Massa */}
            <button
              onClick={handleBulkAddTag}
              title="Adicionar tag (ex: Mais Vendido, Promoção) aos selecionados"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              + Tag...
            </button>

            {/* Exportar CSV */}
            <button
              onClick={handleExportSelectedCsv}
              title="Exportar planilha CSV dos produtos selecionados"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Exportar CSV
            </button>

            {/* Excluir em massa */}
            <button
              onClick={handleBulkDelete}
              title="Excluir definitivamente os selecionados"
              style={{
                backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none',
                padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Excluir ({selectedCodes.length})
            </button>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          backgroundColor: 'rgba(23, 43, 20, 0.55)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '780px',
            maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '1px solid rgba(41,69,31,0.15)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(41,69,31,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF8F2',
              position: 'sticky', top: 0, zIndex: 10
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)' }}>
                  {editingCode ? 'Editar Perfume' : 'Novo Perfume no Catálogo'}
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
                  {editingCode ? formProduct.name : 'Cadastrar Perfume & Publicar na Loja'}
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
            <form onSubmit={handleSaveProduct} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '6px' }}>
                  Nome Comercial da Fragrância *
                </label>
                <input
                  type="text"
                  required
                  value={formProduct.name}
                  onChange={e => setFormProduct({ ...formProduct, name: e.target.value })}
                  placeholder="Ex: Perfume Brand Collection 001 - Miss Dior 25ml"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '6px' }}>
                    Marca / Linha *
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
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '6px' }}>
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
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '6px' }}>
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

              {/* Photos Section */}
              <div style={{ backgroundColor: '#FAF8F2', padding: '18px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={18} color="var(--snack-green-dark)" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                      Fotos do Perfume (Upload em Massa & Galeria)
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--snack-muted)', fontWeight: '600' }}>
                    {formProduct.images.length} foto(s) cadastradas
                  </span>
                </div>

                <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: 'var(--snack-muted)' }}>
                  A primeira foto será a <strong>Capa Principal</strong> na vitrine. Você pode clicar em "Capa" em qualquer foto para torná-la principal.
                </p>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    disabled={isUploading}
                    style={{
                      backgroundColor: 'var(--snack-green-dark)', color: '#fff', border: 'none',
                      padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                    {isUploading ? 'Enviando Fotos...' : 'Selecionar Fotos em Massa'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBulkUrlBox(!showBulkUrlBox)}
                    style={{
                      backgroundColor: '#FFFFFF', color: 'var(--snack-text)', border: '1px solid rgba(41,69,31,0.2)',
                      padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    + Colar Links de Imagens
                  </button>
                </div>

                {showBulkUrlBox && (
                  <div style={{ marginBottom: '16px', backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px dashed rgba(41,69,31,0.3)' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '6px' }}>
                      Cole as URLs das imagens (uma por linha ou separadas por vírgula):
                    </label>
                    <textarea
                      rows={3}
                      value={bulkUrlInput}
                      onChange={e => setBulkUrlInput(e.target.value)}
                      placeholder="https://exemplo.com/foto1.jpg&#10;https://exemplo.com/foto2.jpg"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '12px', marginBottom: '8px' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddBulkUrls}
                      style={{
                        backgroundColor: 'var(--snack-gold)', color: '#000', border: 'none',
                        padding: '8px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
                      }}
                    >
                      Adicionar URLs à Galeria
                    </button>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
                  {formProduct.images.map((imgUrl, idx) => {
                    const isCover = idx === 0;
                    return (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#FFFFFF', borderRadius: '10px', padding: '6px',
                          border: isCover ? '2px solid var(--snack-gold)' : '1px solid rgba(41,69,31,0.12)',
                          position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                        }}
                      >
                        {isCover && (
                          <span style={{
                            position: 'absolute', top: '-8px', left: '6px', backgroundColor: 'var(--snack-gold)',
                            color: '#000', fontSize: '9px', fontWeight: 'bold', padding: '1px 6px', borderRadius: '4px'
                          }}>
                            ★ CAPA
                          </span>
                        )}

                        <img
                          src={imgUrl}
                          alt={"Foto " + (idx + 1)}
                          style={{ width: '100%', height: '80px', objectFit: 'contain', borderRadius: '6px' }}
                        />

                        <div style={{ display: 'flex', gap: '4px', width: '100%', justifyContent: 'center' }}>
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => handleSetCover(idx)}
                              title="Definir como foto de capa"
                              style={{
                                fontSize: '10px', backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.2)',
                                padding: '3px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600'
                              }}
                            >
                              Capa
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            title="Remover foto"
                            style={{
                              fontSize: '10px', backgroundColor: '#FEE2E2', border: '1px solid #FECACA',
                              color: '#991B1B', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              <div style={{ backgroundColor: '#FAF8F2', padding: '18px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="var(--snack-green-dark)" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                      Categorias do Produto
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(!showNewCatInput)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--snack-green-dark)',
                      fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <FolderPlus size={14} /> + Nova Categoria
                  </button>
                </div>

                {showNewCatInput && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', backgroundColor: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)' }}>
                    <input
                      type="text"
                      placeholder="Nome da nova categoria (ex: Amadeirados Nobres)"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      style={{ backgroundColor: 'var(--snack-green-dark)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Criar Categoria
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {categories.map(cat => {
                    const isSelected = formProduct.categorySlugs && formProduct.categorySlugs.includes(cat.slug);
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => toggleCategory(cat.slug)}
                        style={{
                          padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
                          border: isSelected ? '1px solid var(--snack-green-dark)' : '1px solid rgba(0,0,0,0.12)',
                          backgroundColor: isSelected ? 'var(--snack-green-dark)' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : 'var(--snack-text)',
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        {isSelected && '✓ '} {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div style={{ backgroundColor: '#FAF8F2', padding: '18px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag size={18} color="var(--snack-green-dark)" />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                      Tags do Produto (Badges Promocionais & Destaque)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewTagInput(!showNewTagInput)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--snack-green-dark)',
                      fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    + Nova Tag
                  </button>
                </div>

                {showNewTagInput && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', backgroundColor: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)' }}>
                    <input
                      type="text"
                      placeholder="Nome da tag (ex: Fixação 14h, Edição Limitada)"
                      value={newTagName}
                      onChange={e => setNewTagName(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={handleCreateTag}
                      style={{ backgroundColor: 'var(--snack-gold)', color: '#000', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Criar Tag
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {tags.map(t => {
                    const isSelected = formProduct.tags && formProduct.tags.includes(t.name);
                    return (
                      <button
                        key={t.slug}
                        type="button"
                        onClick={() => toggleTag(t.name)}
                        style={{
                          padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                          border: isSelected ? '1px solid var(--snack-gold)' : '1px solid rgba(0,0,0,0.1)',
                          backgroundColor: isSelected ? '#FAF2DE' : '#FFFFFF',
                          color: isSelected ? '#854D0E' : 'var(--snack-muted)',
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        {isSelected ? '★ ' : ''}{t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Financial & Stock Details */}
              <div style={{ backgroundColor: '#FAF8F2', padding: '18px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--snack-gold)' }}>
                    Precificação Diferenciada: Varejo (Deslogado) vs Atacado (Revenda)
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--snack-muted)', fontWeight: '600' }}>
                    Valores em R$
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  
                  {/* Preço de Varejo */}
                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: '#166534' }}>
                        Preço Varejo *
                      </label>
                      <span style={{ fontSize: '9px', backgroundColor: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>
                        Deslogado / Loja
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formProduct.price}
                      onChange={e => setFormProduct({ ...formProduct, price: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #16a34a', fontSize: '14px', fontWeight: '800', color: '#166534' }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--snack-muted)', display: 'block', marginTop: '4px' }}>
                      Visível para visitantes deslogados
                    </span>
                  </div>

                  {/* Preço de Atacado / Revenda */}
                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: '#6b21a8' }}>
                        Preço Atacado
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const sug = Math.round((parseFloat(formProduct.price || 0) * 0.72) * 10) / 10;
                          setFormProduct({ ...formProduct, wholesale_price: sug });
                        }}
                        style={{ fontSize: '9px', backgroundColor: '#f3e8ff', color: '#6b21a8', border: 'none', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer' }}
                        title="Calcular -28% sobre o preço de varejo"
                      >
                        Sugerir (-28%)
                      </button>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={formProduct.wholesale_price}
                      onChange={e => setFormProduct({ ...formProduct, wholesale_price: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #9333ea', fontSize: '14px', fontWeight: '800', color: '#6b21a8' }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--snack-muted)', display: 'block', marginTop: '4px' }}>
                      Exclusivo para revendedores logados
                    </span>
                  </div>

                  {/* Preço de Custo */}
                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid rgba(41,69,31,0.15)' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                      Preço de Custo (Loja)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formProduct.cost_price}
                      onChange={e => setFormProduct({ ...formProduct, cost_price: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '14px', fontWeight: '700', color: '#475569' }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--snack-muted)', display: 'block', marginTop: '4px' }}>
                      Custo unitário interno do frasco
                    </span>
                  </div>

                </div>

                {/* Stock Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                      Estoque Atual (Unidades) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formProduct.stock}
                      onChange={e => setFormProduct({ ...formProduct, stock: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', fontWeight: '700' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                      Alerta de Estoque Mínimo
                    </label>
                    <input
                      type="number"
                      value={formProduct.min_stock}
                      onChange={e => setFormProduct({ ...formProduct, min_stock: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                    />
                  </div>
                </div>

                {/* Margins breakdown banner */}
                <div style={{
                  backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: '10px',
                  border: '1px solid rgba(41,69,31,0.1)', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '11px'
                }}>
                  <div>
                    <span style={{ color: 'var(--snack-muted)' }}>Lucro Loja no Varejo: </span>
                    <strong style={{ color: '#166534', fontSize: '13px' }}>+R$ {unitProfitRetail}</strong>
                    <span style={{ color: '#166534', marginLeft: '4px' }}>({markupPercent}%)</span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--snack-muted)' }}>Lucro Loja no Atacado: </span>
                    <strong style={{ color: '#6b21a8', fontSize: '13px' }}>+R$ {unitProfitWholesale}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--snack-muted)' }}>Margem do Revendedor: </span>
                    <strong style={{ color: 'var(--snack-green-dark)', fontSize: '13px' }}>+R$ {resellerProfit} / un</strong>
                  </div>
                </div>

              </div>

              {/* Olfactory Inspirations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
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

              {/* Description */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                  Descrição Curta
                </label>
                <textarea
                  rows={2}
                  value={formProduct.description}
                  onChange={e => setFormProduct({ ...formProduct, description: e.target.value })}
                  placeholder="Resumo da fragrância para os cards de produtos..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              {/* Long Description */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                  Descrição Completa & Notas Olfativas
                </label>
                <textarea
                  rows={4}
                  value={formProduct.longDescription}
                  onChange={e => setFormProduct({ ...formProduct, longDescription: e.target.value })}
                  placeholder="Detalhes completos sobre fixação, notas de topo, coração e fundo para a página do produto..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              {/* Action Submit */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', position: 'sticky', bottom: 0, backgroundColor: '#fff', padding: '12px 0', borderTop: '1px solid #eee' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '12px 20px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', background: 'transparent', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '12px 28px', borderRadius: '8px', border: 'none',
                    backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', cursor: 'pointer',
                    fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {editingCode ? 'Salvar e Publicar Alterações' : 'Cadastrar Perfume no Site'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
