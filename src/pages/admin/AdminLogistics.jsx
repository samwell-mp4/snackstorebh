import React, { useState, useMemo } from 'react';
import { 
  Zap, Package, DollarSign, AlertTriangle, CheckCircle2, Clock, 
  Search, Filter, Check, X, ArrowUpDown, RefreshCw, Layers, ShieldCheck, 
  ChevronDown, Save, Sliders, Calendar
} from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogistics() {
  const { products, updateProductLogistics, bulkUpdateLogistics, categories } = useStoreData();
  const { currentUser, isStaff, isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [quickFilter, setQuickFilter] = useState('ALL');
  // 'ALL' | 'EXPRESSO_ON' | 'EXPRESSO_OFF' | 'PROGRAMADO_ON' | 'ECONOMICO_ON' | 'NONE_ACTIVE' | 'LOW_STOCK' | 'NOT_UPDATED_TODAY' | 'UPDATED_TODAY'

  const [selectedCodes, setSelectedCodes] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('enable_expresso');
  const [bulkPercent, setBulkPercent] = useState('5');
  const [bulkModality, setBulkModality] = useState('expresso');
  const [bulkStock, setBulkStock] = useState('10');
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Local draft state for quick in-table edits before saving or for immediate saving
  const [draftConfigs, setDraftConfigs] = useState({});
  const [savingCodes, setSavingCodes] = useState({});

  const showToast = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  // Computed Indicators
  const stats = useMemo(() => {
    let expressoCount = 0;
    let programadoCount = 0;
    let economicoCount = 0;
    let noneCount = 0;
    let lowStockCount = 0;
    let unreviewedTodayCount = 0;

    products.forEach(p => {
      const l = p.logistics_config || {};
      const expOn = l.expresso?.active === true;
      const progOn = l.programado_7?.active === true;
      const econOn = l.economico_15?.active === true;

      if (expOn) expressoCount++;
      if (progOn) programadoCount++;
      if (econOn) economicoCount++;
      if (!expOn && !progOn && !econOn) noneCount++;

      const expStock = l.expresso?.stock !== undefined ? l.expresso.stock : p.stock;
      if (expOn && (expStock || 0) <= (p.min_stock || 5)) lowStockCount++;

      const lastUp = (p.logistics_updated_at || p.updated_at || '').slice(0, 10);
      if (lastUp !== todayStr) unreviewedTodayCount++;
    });

    return {
      total: products.length,
      expressoCount,
      programadoCount,
      economicoCount,
      noneCount,
      lowStockCount,
      unreviewedTodayCount
    };
  }, [products, todayStr]);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand))).filter(Boolean).sort();
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(term) ||
                          p.code.toLowerCase().includes(term) ||
                          (p.inspiredBy && p.inspiredBy.toLowerCase().includes(term));
      
      const matchCat = selectedCategory === 'ALL' || (p.categorySlugs && p.categorySlugs.includes(selectedCategory));
      const matchBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;

      const l = p.logistics_config || {};
      const expOn = l.expresso?.active === true;
      const progOn = l.programado_7?.active === true;
      const econOn = l.economico_15?.active === true;
      const expStock = l.expresso?.stock !== undefined ? l.expresso.stock : p.stock;
      const lastUp = (p.logistics_updated_at || p.updated_at || '').slice(0, 10);

      let matchQuick = true;
      if (quickFilter === 'EXPRESSO_ON') matchQuick = expOn;
      else if (quickFilter === 'EXPRESSO_OFF') matchQuick = !expOn;
      else if (quickFilter === 'PROGRAMADO_ON') matchQuick = progOn;
      else if (quickFilter === 'ECONOMICO_ON') matchQuick = econOn;
      else if (quickFilter === 'NONE_ACTIVE') matchQuick = (!expOn && !progOn && !econOn);
      else if (quickFilter === 'LOW_STOCK') matchQuick = expOn && (expStock || 0) <= (p.min_stock || 5);
      else if (quickFilter === 'NOT_UPDATED_TODAY') matchQuick = lastUp !== todayStr;
      else if (quickFilter === 'UPDATED_TODAY') matchQuick = lastUp === todayStr;

      return matchSearch && matchCat && matchBrand && matchQuick;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, quickFilter, todayStr]);

  // Multi-select handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCodes(filteredProducts.map(p => p.code));
    } else {
      setSelectedCodes([]);
    }
  };

  const handleToggleSelect = (code) => {
    setSelectedCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Inline configuration helpers
  const getProductConfig = (p) => {
    return draftConfigs[p.code] || p.logistics_config || {
      expresso: { active: true, price: p.price, stock: p.stock || 0, label: 'Expresso' },
      programado_7: { active: true, price: Math.round(p.price * 0.88 * 10) / 10, stock: null, label: 'Programado' },
      economico_15: { active: true, price: Math.round(p.price * 0.78 * 10) / 10, stock: null, label: 'Econômico' }
    };
  };

  const handleUpdateModalityField = (product, modality, field, value) => {
    const current = getProductConfig(product);
    const updated = {
      ...current,
      [modality]: {
        ...current[modality],
        [field]: value
      }
    };
    setDraftConfigs(prev => ({
      ...prev,
      [product.code]: updated
    }));
  };

  const handleSaveProductLogistics = async (product) => {
    const config = getProductConfig(product);
    setSavingCodes(prev => ({ ...prev, [product.code]: true }));
    try {
      await updateProductLogistics(product.code, config, currentUser?.name || 'Admin');
      // Clear draft for this product
      setDraftConfigs(prev => {
        const copy = { ...prev };
        delete copy[product.code];
        return copy;
      });
      showToast(`Disponibilidade de "${product.name}" atualizada!`);
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSavingCodes(prev => ({ ...prev, [product.code]: false }));
    }
  };

  // Bulk action submission
  const handleApplyBulk = async () => {
    if (selectedCodes.length === 0) return;
    setIsProcessingBulk(true);
    try {
      let value = null;
      if (bulkAction === 'adjust_price_percent') {
        value = { modality: bulkModality, percent: parseFloat(bulkPercent) };
      } else if (bulkAction === 'set_stock') {
        value = parseInt(bulkStock, 10) || 0;
      }

      await bulkUpdateLogistics(selectedCodes, bulkAction, value, currentUser?.name || 'Admin');
      setIsBulkModalOpen(false);
      setSelectedCodes([]);
      showToast(`Ação aplicada com sucesso a ${selectedCodes.length} produtos!`);
    } catch (err) {
      alert('Erro ao processar ação em massa: ' + err.message);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // Relative date format helper
  const formatLastUpdated = (dateStr) => {
    if (!dateStr) return 'Não revisado';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Não revisado';

    const isToday = d.toISOString().slice(0, 10) === todayStr;
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Hoje às ${time}`;

    const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return `Ontem às ${time}`;
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Top Banner */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px 26px',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)' }}>
            Logística & Disponibilidade Diária
          </span>
          <h2 style={{ margin: '3px 0 0 0', fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
            Central de Disponibilidade dos Perfumes
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--snack-muted)' }}>
            Controle em tempo real quais perfumes estão no ⚡ <strong>Expresso BH</strong>, 📦 <strong>Programado</strong> ou 💰 <strong>Econômico</strong>.
          </p>
        </div>

        {selectedCodes.length > 0 && isStaff && (
          <button
            onClick={() => setIsBulkModalOpen(true)}
            style={{
              backgroundColor: 'var(--snack-gold)', color: '#000', border: 'none',
              padding: '12px 22px', borderRadius: '10px', fontSize: '12px', fontWeight: '800',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 15px rgba(196,161,90,0.3)'
            }}
          >
            <Sliders size={16} /> Ações em Massa ({selectedCodes.length} selecionados)
          </button>
        )}
      </div>

      {feedback && (
        <div style={{
          backgroundColor: '#dcfce7', color: '#166534', padding: '12px 18px',
          borderRadius: '10px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <CheckCircle2 size={18} /> {feedback}
        </div>
      )}

      {/* OPERATIONAL KPI DASHBOARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        
        {/* Expresso Card */}
        <div 
          onClick={() => setQuickFilter(quickFilter === 'EXPRESSO_ON' ? 'ALL' : 'EXPRESSO_ON')}
          style={{
            backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px',
            border: quickFilter === 'EXPRESSO_ON' ? '2px solid var(--snack-green-dark)' : '1px solid rgba(41,69,31,0.08)',
            cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--snack-muted)', textTransform: 'uppercase' }}>⚡ Expresso Ativo</span>
            <span style={{ fontSize: '10px', backgroundColor: '#FAF2DE', color: '#854D0E', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>BH Local</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
            {stats.expressoCount} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--snack-muted)' }}>/ {stats.total}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '4px' }}>Pronta entrega rápida</div>
        </div>

        {/* Programado Card */}
        <div 
          onClick={() => setQuickFilter(quickFilter === 'PROGRAMADO_ON' ? 'ALL' : 'PROGRAMADO_ON')}
          style={{
            backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px',
            border: quickFilter === 'PROGRAMADO_ON' ? '2px solid var(--snack-green-dark)' : '1px solid rgba(41,69,31,0.08)',
            cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--snack-muted)', textTransform: 'uppercase' }}>📦 Programado</span>
            <span style={{ fontSize: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Até 7 dias</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
            {stats.programadoCount} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--snack-muted)' }}>/ {stats.total}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '4px' }}>Preço intermediário</div>
        </div>

        {/* Economico Card */}
        <div 
          onClick={() => setQuickFilter(quickFilter === 'ECONOMICO_ON' ? 'ALL' : 'ECONOMICO_ON')}
          style={{
            backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px',
            border: quickFilter === 'ECONOMICO_ON' ? '2px solid var(--snack-green-dark)' : '1px solid rgba(41,69,31,0.08)',
            cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--snack-muted)', textTransform: 'uppercase' }}>💰 Econômico</span>
            <span style={{ fontSize: '10px', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Até 15 dias</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
            {stats.economicoCount} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--snack-muted)' }}>/ {stats.total}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '4px' }}>Melhor preço garantido</div>
        </div>

        {/* Sem modalidade Card */}
        <div 
          onClick={() => setQuickFilter(quickFilter === 'NONE_ACTIVE' ? 'ALL' : 'NONE_ACTIVE')}
          style={{
            backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px',
            border: quickFilter === 'NONE_ACTIVE' ? '2px solid #ef4444' : '1px solid rgba(41,69,31,0.08)',
            cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#991b1b', textTransform: 'uppercase' }}>Sem Disponibilidade</span>
            <AlertTriangle size={14} color="#991b1b" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: stats.noneCount > 0 ? '#991b1b' : 'var(--snack-text)' }}>
            {stats.noneCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '4px' }}>Inativos no site</div>
        </div>

        {/* Nao atualizados hoje Card */}
        <div 
          onClick={() => setQuickFilter(quickFilter === 'NOT_UPDATED_TODAY' ? 'ALL' : 'NOT_UPDATED_TODAY')}
          style={{
            backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px',
            border: quickFilter === 'NOT_UPDATED_TODAY' ? '2px solid #f59e0b' : '1px solid rgba(41,69,31,0.08)',
            cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#b45309', textTransform: 'uppercase' }}>Não Revisados Hoje</span>
            <Clock size={14} color="#b45309" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309' }}>
            {stats.unreviewedTodayCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '4px' }}>Revisão recomendada</div>
        </div>

      </div>

      {/* FILTER & SEARCH BAR */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '16px 20px',
        border: '1px solid rgba(41,69,31,0.08)', display: 'flex', flexWrap: 'wrap', gap: '12px',
        alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por nome, SKU ou contratipo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px',
              border: '1px solid rgba(41,69,31,0.15)', fontSize: '13px', backgroundColor: '#FAF8F2',
              outline: 'none'
            }}
          />
        </div>

        {/* Category select */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2' }}
        >
          <option value="ALL">Todas as Categorias</option>
          {categories.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Brand select */}
        <select
          value={selectedBrand}
          onChange={e => setSelectedBrand(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2' }}
        >
          <option value="ALL">Todas as Marcas</option>
          {brands.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Quick filter pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'EXPRESSO_ON', label: '⚡ Expresso ON' },
            { id: 'EXPRESSO_OFF', label: '⚡ Expresso OFF' },
            { id: 'PROGRAMADO_ON', label: '📦 Programado ON' },
            { id: 'ECONOMICO_ON', label: '💰 Econômico ON' },
            { id: 'NOT_UPDATED_TODAY', label: '🕒 Não Revisados Hoje' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setQuickFilter(f.id)}
              style={{
                border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: quickFilter === f.id ? '700' : '500',
                cursor: 'pointer', backgroundColor: quickFilter === f.id ? 'var(--snack-green-dark)' : '#FAF8F2',
                color: quickFilter === f.id ? '#FFFFFF' : 'var(--snack-text)', whiteSpace: 'nowrap'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS LOGISTICS TABLE */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(41,69,31,0.08)', color: 'var(--snack-muted)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedCodes.length === filteredProducts.length}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '14px 12px', minWidth: '220px' }}>Produto / SKU</th>
                <th style={{ padding: '14px 12px', minWidth: '180px' }}>⚡ Expresso (BH)</th>
                <th style={{ padding: '14px 12px', minWidth: '150px' }}>📦 Programado (7d)</th>
                <th style={{ padding: '14px 12px', minWidth: '150px' }}>💰 Econômico (15d)</th>
                <th style={{ padding: '14px 14px' }}>Última Revisão</th>
                {isStaff && <th style={{ padding: '14px 16px', textAlign: 'right' }}>Ação</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--snack-muted)' }}>
                    Nenhum perfume encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const cfg = getProductConfig(p);
                  const isSelected = selectedCodes.includes(p.code);
                  const isDirty = Boolean(draftConfigs[p.code]);
                  const isSaving = Boolean(savingCodes[p.code]);

                  const expActive = cfg.expresso?.active === true;
                  const progActive = cfg.programado_7?.active === true;
                  const econActive = cfg.economico_15?.active === true;

                  return (
                    <tr
                      key={p.code}
                      style={{
                        borderBottom: '1px solid rgba(41,69,31,0.05)',
                        backgroundColor: isSelected ? '#FAF2DE' : isDirty ? '#FFFDF5' : 'transparent',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.code)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Product details */}
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={p.image || '/perfumes/200.webp'}
                            alt={p.name}
                            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#FAF8F2', border: '1px solid rgba(0,0,0,0.06)' }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--snack-green-dark)', fontSize: '13px', lineHeight: '1.3' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--snack-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                              <span>SKU: <strong>{p.code}</strong></span>
                              {p.inspiredBy && <span>• {p.inspiredBy}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ⚡ Expresso column */}
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateModalityField(p, 'expresso', 'active', !expActive)}
                              style={{
                                border: 'none', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                                cursor: 'pointer', backgroundColor: expActive ? '#dcfce7' : '#fee2e2',
                                color: expActive ? '#166534' : '#991b1b'
                              }}
                            >
                              {expActive ? '⚡ ATIVO' : 'OFF'}
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>R$</span>
                              <input
                                type="number"
                                step="0.5"
                                value={cfg.expresso?.price ?? ''}
                                onChange={e => handleUpdateModalityField(p, 'expresso', 'price', parseFloat(e.target.value) || 0)}
                                style={{ width: '65px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '11px' }}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--snack-muted)' }}>
                            <span>Estoque BH:</span>
                            <input
                              type="number"
                              value={cfg.expresso?.stock ?? 0}
                              onChange={e => handleUpdateModalityField(p, 'expresso', 'stock', parseInt(e.target.value) || 0)}
                              style={{ width: '45px', padding: '2px 4px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '10px' }}
                            />
                            {expActive && (cfg.expresso?.stock ?? 0) <= 5 && (
                              <span style={{ color: '#d97706', fontWeight: 'bold' }}>🔥 Baixo</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 📦 Programado column */}
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateModalityField(p, 'programado_7', 'active', !progActive)}
                            style={{
                              border: 'none', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                              cursor: 'pointer', backgroundColor: progActive ? '#e0f2fe' : '#fee2e2',
                              color: progActive ? '#0369a1' : '#991b1b'
                            }}
                          >
                            {progActive ? '📦 ATIVO' : 'OFF'}
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>R$</span>
                            <input
                              type="number"
                              step="0.5"
                              value={cfg.programado_7?.price ?? ''}
                              onChange={e => handleUpdateModalityField(p, 'programado_7', 'price', parseFloat(e.target.value) || 0)}
                              style={{ width: '65px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '11px' }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 💰 Econômico column */}
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateModalityField(p, 'economico_15', 'active', !econActive)}
                            style={{
                              border: 'none', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                              cursor: 'pointer', backgroundColor: econActive ? '#dcfce7' : '#fee2e2',
                              color: econActive ? '#166534' : '#991b1b'
                            }}
                          >
                            {econActive ? '💰 ATIVO' : 'OFF'}
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--snack-muted)' }}>R$</span>
                            <input
                              type="number"
                              step="0.5"
                              value={cfg.economico_15?.price ?? ''}
                              onChange={e => handleUpdateModalityField(p, 'economico_15', 'price', parseFloat(e.target.value) || 0)}
                              style={{ width: '65px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '11px' }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Última revisão */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--snack-text)', fontWeight: '600' }}>
                          {formatLastUpdated(p.logistics_updated_at || p.updated_at)}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--snack-muted)' }}>
                          Por: {p.logistics_updated_by || 'Sistema'}
                        </div>
                      </td>

                      {/* Ações */}
                      {isStaff && (
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          {isDirty ? (
                            <button
                              type="button"
                              onClick={() => handleSaveProductLogistics(p)}
                              disabled={isSaving}
                              style={{
                                backgroundColor: 'var(--snack-green-dark)', color: '#fff', border: 'none',
                                padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold',
                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                              }}
                            >
                              <Save size={12} /> {isSaving ? 'Salvando...' : 'Salvar'}
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={12} /> Atualizado
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE AÇÕES EM MASSA (BULK ACTIONS) */}
      {isBulkModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          backgroundColor: 'rgba(23,43,20,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '480px',
            padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid rgba(41,69,31,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--snack-gold)', textTransform: 'uppercase' }}>
                  Edição em Lote
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', color: 'var(--snack-green-dark)', fontFamily: 'var(--font-display)' }}>
                  Ações para {selectedCodes.length} Perfume(s)
                </h3>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                  Selecione a Ação a Aplicar:
                </label>
                <select
                  value={bulkAction}
                  onChange={e => setBulkAction(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px', backgroundColor: '#fff' }}
                >
                  <optgroup label="Disponibilidade">
                    <option value="enable_expresso">⚡ Ativar Expresso (BH)</option>
                    <option value="disable_expresso">⚡ Desativar Expresso (BH)</option>
                    <option value="enable_programado">📦 Ativar Programado (7 dias)</option>
                    <option value="disable_programado">📦 Desativar Programado (7 dias)</option>
                    <option value="enable_economico">💰 Ativar Econômico (15 dias)</option>
                    <option value="disable_economico">💰 Desativar Econômico (15 dias)</option>
                  </optgroup>
                  <optgroup label="Ajuste de Preços">
                    <option value="adjust_price_percent">Reajustar Preço por Porcentagem (%)</option>
                  </optgroup>
                  <optgroup label="Estoque Expresso">
                    <option value="set_stock">Definir Estoque Expresso Fixo</option>
                  </optgroup>
                </select>
              </div>

              {bulkAction === 'adjust_price_percent' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Modalidade</label>
                    <select
                      value={bulkModality}
                      onChange={e => setBulkModality(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }}
                    >
                      <option value="expresso">⚡ Expresso</option>
                      <option value="programado_7">📦 Programado</option>
                      <option value="economico_15">💰 Econômico</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Variação (%) ex: 10 ou -5</label>
                    <input
                      type="number"
                      step="1"
                      value={bulkPercent}
                      onChange={e => setBulkPercent(e.target.value)}
                      placeholder="Ex: 5 ou -10"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }}
                    />
                  </div>
                </div>
              )}

              {bulkAction === 'set_stock' && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    Quantidade em Estoque (Expresso BH)
                  </label>
                  <input
                    type="number"
                    value={bulkStock}
                    onChange={e => setBulkStock(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyBulk}
                disabled={isProcessingBulk}
                style={{
                  backgroundColor: 'var(--snack-green-dark)', color: '#fff', border: 'none',
                  padding: '10px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold',
                  cursor: isProcessingBulk ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessingBulk ? 'Aplicando...' : 'Confirmar e Aplicar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
