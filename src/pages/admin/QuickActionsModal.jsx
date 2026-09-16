import React, { useState } from 'react';
import { X, Plus, Package, FileText, ShoppingBag, Download, Check } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function QuickActionsModal({ isOpen, onClose }) {
  const { products, addProduct, adjustStock, createOrder } = useStoreData();
  const [activeTab, setActiveTab] = useState('express_product'); // 'express_product' | 'quick_stock' | 'manual_order' | 'export_csv'
  const [successMsg, setSuccessMsg] = useState('');

  // Express product form
  const [expressProd, setExpressProd] = useState({
    name: '',
    brand: 'Brand Collection',
    volume: '25ml',
    price: 69.90,
    cost_price: 32.00,
    stock: 15,
    gender: 'Feminino',
    image: '/perfumes/200.webp'
  });

  // Quick stock state
  const [selectedProductCode, setSelectedProductCode] = useState('');
  const [stockDelta, setStockDelta] = useState(5);

  // Manual order state
  const [manualOrder, setManualOrder] = useState({
    customer_name: '',
    customer_phone: '',
    product_code: '',
    quantity: 1,
    payment_method: 'Pix',
    notes: 'Venda presencial / WhatsApp'
  });

  if (!isOpen) return null;

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleAddExpressProduct = async (e) => {
    e.preventDefault();
    if (!expressProd.name) return;
    await addProduct({
      ...expressProd,
      price: parseFloat(expressProd.price),
      cost_price: parseFloat(expressProd.cost_price),
      stock: parseInt(expressProd.stock)
    });
    showNotification(`Produto "${expressProd.name}" adicionado com sucesso!`);
    setExpressProd({
      name: '',
      brand: 'Brand Collection',
      volume: '25ml',
      price: 69.90,
      cost_price: 32.00,
      stock: 15,
      gender: 'Feminino',
      image: '/perfumes/200.webp'
    });
  };

  const handleQuickStock = (e) => {
    e.preventDefault();
    if (!selectedProductCode) return;
    adjustStock(selectedProductCode, parseInt(stockDelta));
    const p = products.find(prod => prod.code === selectedProductCode);
    showNotification(`Estoque de "${p?.name || selectedProductCode}" ajustado em ${stockDelta > 0 ? '+' : ''}${stockDelta} unidades.`);
  };

  const handleCreateManualOrder = async (e) => {
    e.preventDefault();
    const prod = products.find(p => p.code === manualOrder.product_code);
    if (!prod) return;

    const qty = parseInt(manualOrder.quantity) || 1;
    const total = prod.price * qty;
    const cost = (prod.cost_price || prod.price * 0.45) * qty;

    await createOrder({
      customer_name: manualOrder.customer_name || 'Cliente Balcão',
      customer_phone: manualOrder.customer_phone || '',
      customer_address: 'Retirada no Balcão BH',
      items: [
        { code: prod.code, name: prod.name, price: prod.price, cost_price: prod.cost_price, quantity: qty, volume: prod.volume }
      ],
      total_amount: total,
      cost_amount: cost,
      status: 'pago',
      payment_method: manualOrder.payment_method,
      notes: manualOrder.notes
    });

    showNotification(`Pedido de R$ ${total.toFixed(2)} registrado com sucesso!`);
    setManualOrder({
      customer_name: '',
      customer_phone: '',
      product_code: '',
      quantity: 1,
      payment_method: 'Pix',
      notes: 'Venda presencial / WhatsApp'
    });
  };

  const handleExportCsv = () => {
    let csv = 'Codigo,Nome,Marca,Volume,Preco,Custo,Estoque,Genero,Status\n';
    products.forEach(p => {
      const line = `"${p.code}","${p.name.replace(/"/g, '""')}","${p.brand}","${p.volume}",${p.price},${p.cost_price || 0},${p.stock || 0},"${p.gender}","${p.stock > 0 ? 'Em Estoque' : 'Esgotado'}"\n`;
      csv += line;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `catalogo_estoque_snack_store_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Planilha CSV gerada e baixada com sucesso!');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      backgroundColor: 'rgba(23, 43, 20, 0.45)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '640px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid rgba(41,69,31,0.12)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid rgba(41,69,31,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: '#FAF8F2'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)' }}>
              ⚡ Ações Rápidas
            </span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
              Central Operacional Express
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', color: 'var(--snack-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(41,69,31,0.08)', backgroundColor: '#FAF8F2' }}>
          {[
            { id: 'express_product', label: 'Novo Produto', icon: Plus },
            { id: 'quick_stock', label: 'Ajustar Estoque', icon: Package },
            { id: 'manual_order', label: 'Pedido Balcão', icon: ShoppingBag },
            { id: 'export_csv', label: 'Exportar CSV', icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '12px 8px', border: 'none', background: isActive ? '#FFFFFF' : 'transparent',
                  borderBottom: isActive ? '2px solid var(--snack-green-dark)' : '2px solid transparent',
                  cursor: 'pointer', fontSize: '12px', fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--snack-green-dark)' : 'var(--snack-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {successMsg && (
            <div style={{
              backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46',
              padding: '10px 14px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '16px'
            }}>
              <Check size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB: EXPRESS PRODUCT */}
          {activeTab === 'express_product' && (
            <form onSubmit={handleAddExpressProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                  Nome do Perfume *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Perfume Brand Collection 045 - Sauvage"
                  value={expressProd.name}
                  onChange={e => setExpressProd({ ...expressProd, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Marca / Linha
                  </label>
                  <select
                    value={expressProd.brand}
                    onChange={e => setExpressProd({ ...expressProd, brand: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    <option value="Brand Collection">Brand Collection</option>
                    <option value="Lattafa Perfumes">Lattafa Perfumes</option>
                    <option value="Dior">Dior</option>
                    <option value="Carolina Herrera">Carolina Herrera</option>
                    <option value="Armaf">Armaf</option>
                    <option value="Afnan">Afnan</option>
                    <option value="Outra">Outra</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Gênero
                  </label>
                  <select
                    value={expressProd.gender}
                    onChange={e => setExpressProd({ ...expressProd, gender: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Unissex">Unissex</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Preço Venda (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expressProd.price}
                    onChange={e => setExpressProd({ ...expressProd, price: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Preço Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={expressProd.cost_price}
                    onChange={e => setExpressProd({ ...expressProd, cost_price: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Estoque Inicial
                  </label>
                  <input
                    type="number"
                    required
                    value={expressProd.stock}
                    onChange={e => setExpressProd({ ...expressProd, stock: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '8px', backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF',
                  padding: '12px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '13px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <Plus size={16} />
                Cadastrar no Catálogo
              </button>
            </form>
          )}

          {/* TAB: QUICK STOCK */}
          {activeTab === 'quick_stock' && (
            <form onSubmit={handleQuickStock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                  Selecione o Perfume
                </label>
                <select
                  required
                  value={selectedProductCode}
                  onChange={e => setSelectedProductCode(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', backgroundColor: '#fff' }}
                >
                  <option value="">-- Escolha um produto da loja --</option>
                  {products.map(p => (
                    <option key={p.code} value={p.code}>
                      [{p.code}] {p.name} (Atual: {p.stock || 0} un.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                  Quantidade a Ajustar (use positivo para adicionar, negativo para baixa)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setStockDelta(-1)}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    -1 un.
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockDelta(5)}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', background: '#FAF8F2', fontWeight: 'bold', cursor: 'pointer', color: 'var(--snack-green-dark)' }}
                  >
                    +5 un.
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockDelta(10)}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', background: '#FAF8F2', fontWeight: 'bold', cursor: 'pointer', color: 'var(--snack-green-dark)' }}
                  >
                    +10 un.
                  </button>
                </div>
                <input
                  type="number"
                  value={stockDelta}
                  onChange={e => setStockDelta(e.target.value)}
                  style={{ width: '100%', marginTop: '8px', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              <button
                type="submit"
                disabled={!selectedProductCode}
                style={{
                  backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', opacity: !selectedProductCode ? 0.6 : 1,
                  padding: '12px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '13px',
                  cursor: selectedProductCode ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <Package size={16} />
                Atualizar Estoque Imediatamente
              </button>
            </form>
          )}

          {/* TAB: MANUAL ORDER */}
          {activeTab === 'manual_order' && (
            <form onSubmit={handleCreateManualOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Beatriz Lima"
                    value={manualOrder.customer_name}
                    onChange={e => setManualOrder({ ...manualOrder, customer_name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    WhatsApp do Cliente
                  </label>
                  <input
                    type="text"
                    placeholder="31999999999"
                    value={manualOrder.customer_phone}
                    onChange={e => setManualOrder({ ...manualOrder, customer_phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Perfume Vendido *
                  </label>
                  <select
                    required
                    value={manualOrder.product_code}
                    onChange={e => setManualOrder({ ...manualOrder, product_code: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    <option value="">-- Selecione o perfume --</option>
                    {products.map(p => (
                      <option key={p.code} value={p.code}>
                        {p.name} - R$ {p.price?.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={manualOrder.quantity}
                    onChange={e => setManualOrder({ ...manualOrder, quantity: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                  Forma de Pagamento
                </label>
                <select
                  value={manualOrder.payment_method}
                  onChange={e => setManualOrder({ ...manualOrder, payment_method: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', backgroundColor: '#fff' }}
                >
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro Físico</option>
                  <option value="WhatsApp / Pendente">WhatsApp / Pendente</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!manualOrder.product_code}
                style={{
                  backgroundColor: 'var(--snack-gold)', color: 'var(--snack-green-dark)',
                  padding: '12px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '13px',
                  cursor: manualOrder.product_code ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <ShoppingBag size={16} />
                Registrar Venda & Baixar Estoque
              </button>
            </form>
          )}

          {/* TAB: EXPORT CSV */}
          {activeTab === 'export_csv' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FAF8F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto',
                border: '1px solid rgba(41,69,31,0.1)'
              }}>
                <FileText size={26} color="var(--snack-green-dark)" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--snack-green-dark)', marginBottom: '8px' }}>
                Exportação Completa de Dados
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--snack-muted)', maxWidth: '420px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
                Faça o download instantâneo de todos os {products.length} perfumes cadastrados na loja com códigos, preços, custos, estoques e categorias para abrir no Excel ou Google Sheets.
              </p>
              <button
                onClick={handleExportCsv}
                style={{
                  backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', padding: '12px 24px',
                  borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '8px'
                }}
              >
                <Download size={16} />
                Baixar Planilha CSV Agora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
