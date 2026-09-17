import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle, Users, Package, MapPin, Phone, ShieldCheck, Box } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';
import { useAuth } from '../context/AuthContext';

export default function MultiRecipientModal({
  isOpen,
  onClose,
  cart,
  distribution,
  onSaveDistribution,
  neutralPacking,
  setNeutralPacking
}) {
  const { recipients, saveRecipient } = useStoreData();
  const { currentUser } = useAuth();

  const totalCartUnits = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Determine maximum allowed recipients based on tier
  const maxRecipients = totalCartUnits >= 20 ? 8 : (totalCartUnits >= 10 ? 4 : 2);

  // Local state for recipients in this order
  // distribution item structure: { recipient_id, recipient_name, recipient_phone, recipient_address, items: [{ code, name, quantity, price, logistics_mode }] }
  const [localDistribution, setLocalDistribution] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    phone: '',
    zipcode: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: 'Belo Horizonte',
    state: 'MG'
  });

  useEffect(() => {
    if (isOpen) {
      if (distribution && distribution.length > 0) {
        setLocalDistribution(distribution);
      } else {
        // Initialize with default recipient or first saved
        const initial = [];
        if (recipients.length > 0) {
          const first = recipients[0];
          initial.push({
            recipient_id: first.id,
            recipient_name: first.name,
            recipient_phone: first.phone,
            recipient_address: `${first.street}, ${first.number} ${first.complement || ''} - ${first.district}, ${first.city}/${first.state}`,
            items: cart.map(c => ({ code: c.code, name: c.name, quantity: 0, price: c.price, logistics_mode: c.logistics_mode || 'expresso' }))
          });
        }
        setLocalDistribution(initial);
      }
    }
  }, [isOpen, distribution, recipients, cart]);

  if (!isOpen) return null;

  // Calculate allocation totals per cart item
  const allocationByCode = {};
  cart.forEach(item => {
    allocationByCode[item.code] = {
      name: item.name,
      total: item.quantity,
      allocated: 0
    };
  });

  localDistribution.forEach(dist => {
    (dist.items || []).forEach(it => {
      if (allocationByCode[it.code]) {
        allocationByCode[it.code].allocated += (parseInt(it.quantity, 10) || 0);
      }
    });
  });

  const totalAllocated = Object.values(allocationByCode).reduce((acc, cur) => acc + cur.allocated, 0);
  const isAllocationComplete = totalAllocated === totalCartUnits && Object.values(allocationByCode).every(c => c.allocated === c.total);

  // Add saved recipient to distribution
  const handleAddSavedRecipient = (rec) => {
    if (localDistribution.length >= maxRecipients) {
      alert(`O limite para um pedido de ${totalCartUnits} unidades é de até ${maxRecipients} endereços.`);
      return;
    }
    if (localDistribution.some(d => d.recipient_id === rec.id)) {
      alert('Este destinatário já foi adicionado.');
      return;
    }

    const newDist = {
      recipient_id: rec.id,
      recipient_name: rec.name,
      recipient_phone: rec.phone,
      recipient_address: `${rec.street}, ${rec.number} ${rec.complement || ''} - ${rec.district}, ${rec.city}/${rec.state}`,
      items: cart.map(c => ({ code: c.code, name: c.name, quantity: 0, price: c.price, logistics_mode: c.logistics_mode || 'expresso' }))
    };

    setLocalDistribution([...localDistribution, newDist]);
  };

  // Create and add new recipient
  const handleCreateNewRecipient = async (e) => {
    e.preventDefault();
    if (!newRecipient.name || !newRecipient.phone || !newRecipient.street || !newRecipient.number) {
      alert('Por favor, preencha pelo menos Nome, WhatsApp, Rua e Número.');
      return;
    }

    if (localDistribution.length >= maxRecipients) {
      alert(`Limite de ${maxRecipients} destinatários atingido.`);
      return;
    }

    const saved = await saveRecipient({
      ...newRecipient,
      owner_user_id: currentUser?.id || 1
    });

    const newDist = {
      recipient_id: saved.id,
      recipient_name: saved.name,
      recipient_phone: saved.phone,
      recipient_address: `${saved.street}, ${saved.number} ${saved.complement || ''} - ${saved.district}, ${saved.city}/${saved.state}`,
      items: cart.map(c => ({ code: c.code, name: c.name, quantity: 0, price: c.price, logistics_mode: c.logistics_mode || 'expresso' }))
    };

    setLocalDistribution([...localDistribution, newDist]);
    setShowAddForm(false);
    setNewRecipient({
      name: '',
      phone: '',
      zipcode: '',
      street: '',
      number: '',
      complement: '',
      district: '',
      city: 'Belo Horizonte',
      state: 'MG'
    });
  };

  const handleRemoveRecipient = (index) => {
    setLocalDistribution(localDistribution.filter((_, idx) => idx !== index));
  };

  const handleQuantityChange = (distIndex, productCode, newQty) => {
    const qty = Math.max(0, parseInt(newQty, 10) || 0);
    setLocalDistribution(prev => {
      const copy = [...prev];
      const targetDist = { ...copy[distIndex] };
      const itemsCopy = (targetDist.items || []).map(it => {
        if (it.code === productCode) {
          return { ...it, quantity: qty };
        }
        return it;
      });
      targetDist.items = itemsCopy;
      copy[distIndex] = targetDist;
      return copy;
    });
  };

  const handleSaveAndConfirm = () => {
    if (localDistribution.length === 0) {
      alert('Adicione pelo menos um destinatário para o envio.');
      return;
    }
    if (!isAllocationComplete) {
      alert(`Atenção: A distribuição está incompleta. Você comprou ${totalCartUnits} unidades e alocou ${totalAllocated}. Ajuste as quantidades para que cada produto seja 100% distribuído.`);
      return;
    }

    onSaveDistribution(localDistribution);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(5px)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '820px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
        border: '1px solid rgba(41,69,31,0.12)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', backgroundColor: 'var(--snack-green-dark, #172b14)', color: '#FFFFFF',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--snack-gold, #c5a059)" />
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', letterSpacing: '0.5px' }}>
                Fulfillment: Envio Multi-Destinatários
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
              Total na Sacola: <strong>{totalCartUnits} perfumes</strong> • Limite para este volume: até <strong>{maxRecipients} endereços</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '6px', opacity: 0.8 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Allocation Progress Bar & Checklist */}
          <div style={{
            backgroundColor: isAllocationComplete ? '#ecfdf5' : '#fffbeb',
            border: `1px solid ${isAllocationComplete ? '#a7f3d0' : '#fde68a'}`,
            borderRadius: '12px', padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isAllocationComplete ? (
                  <CheckCircle2 size={18} color="#059669" />
                ) : (
                  <AlertCircle size={18} color="#d97706" />
                )}
                <span style={{ fontSize: '13px', fontWeight: '800', color: isAllocationComplete ? '#065f46' : '#92400e' }}>
                  {isAllocationComplete ? 'Todos os produtos foram distribuídos com sucesso!' : `Distribua as unidades da sua sacola (${totalAllocated} de ${totalCartUnits} alocados)`}
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: isAllocationComplete ? '#059669' : '#b45309' }}>
                {localDistribution.length} de {maxRecipients} endereços
              </span>
            </div>

            {/* Matrix item status tags */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {Object.entries(allocationByCode).map(([code, data]) => {
                const diff = data.total - data.allocated;
                const isItemOk = diff === 0;
                return (
                  <div key={code} style={{
                    fontSize: '11px', padding: '4px 10px', borderRadius: '6px',
                    backgroundColor: isItemOk ? '#d1fae5' : '#fee2e2',
                    color: isItemOk ? '#065f46' : '#991b1b',
                    fontWeight: '700', border: `1px solid ${isItemOk ? '#a7f3d0' : '#fca5a5'}`
                  }}>
                    {data.name}: {data.allocated}/{data.total} un {isItemOk ? '✓' : `(Falta ${diff})`}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Neutral Packaging Toggle */}
          <div style={{
            backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
            padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Box size={20} color="#475569" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                  Embalagem Neutra (White-label p/ Revenda)
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Enviamos o pedido sem etiquetas com preços ou identificação de compra direta da Snack Store.
                </div>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={neutralPacking}
                onChange={e => setNeutralPacking(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--snack-green-dark, #172b14)' }}
              />
            </label>
          </div>

          {/* Distribution list */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#111827' }}>
                Destinatários Selecionados ({localDistribution.length}/{maxRecipients})
              </h4>
              {!showAddForm && localDistribution.length < maxRecipients && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  style={{
                    backgroundColor: 'var(--snack-green-dark, #172b14)', color: '#FFFFFF',
                    border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px',
                    fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Plus size={14} /> Novo Endereço
                </button>
              )}
            </div>

            {localDistribution.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', border: '2px dashed #cbd5e1', borderRadius: '12px', color: '#64748b' }}>
                <Users size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Nenhum endereço adicionado ainda.</p>
                <p style={{ margin: '4px 0 14px 0', fontSize: '11px' }}>Selecione um cliente salvo ou cadastre um novo destino de entrega.</p>
                {recipients.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {recipients.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleAddSavedRecipient(r)}
                        style={{
                          backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px',
                          padding: '6px 12px', fontSize: '11px', fontWeight: '700', cursor: 'pointer'
                        }}
                      >
                        + {r.name} ({r.city})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Existing Saved Quick Picker */}
            {localDistribution.length < maxRecipients && recipients.length > 0 && (
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Clientes Salvos:</span>
                {recipients.filter(r => !localDistribution.some(d => d.recipient_id === r.id)).map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleAddSavedRecipient(r)}
                    style={{
                      backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px',
                      padding: '4px 10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                      color: '#334155'
                    }}
                  >
                    + {r.name}
                  </button>
                ))}
              </div>
            )}

            {/* Recipient Cards with Allocation Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {localDistribution.map((dist, dIdx) => (
                <div key={dIdx} style={{
                  backgroundColor: '#FFFFFF', border: '1px solid #e5e7eb', borderRadius: '12px',
                  padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ backgroundColor: 'var(--snack-green-dark, #172b14)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                          {dIdx + 1}
                        </span>
                        {dist.recipient_name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {dist.recipient_address}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} /> {dist.recipient_phone}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipient(dIdx)}
                      title="Remover destinatário"
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Products to send to this recipient */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      Fragrâncias p/ este destino:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                      {cart.map(prod => {
                        const itemInDist = (dist.items || []).find(it => it.code === prod.code) || { quantity: 0 };
                        return (
                          <div key={prod.code} style={{
                            backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
                            padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                          }}>
                            <div style={{ overflow: 'hidden', paddingRight: '8px' }}>
                              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {prod.name}
                              </div>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>
                                Sacola: {prod.quantity} un
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(dIdx, prod.code, itemInDist.quantity - 1)}
                                style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                max={prod.quantity}
                                value={itemInDist.quantity}
                                onChange={e => handleQuantityChange(dIdx, prod.code, e.target.value)}
                                style={{ width: '36px', textAlign: 'center', fontSize: '12px', fontWeight: '700', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 0' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(dIdx, prod.code, itemInDist.quantity + 1)}
                                style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Add New Recipient Form */}
            {showAddForm && (
              <form onSubmit={handleCreateNewRecipient} style={{
                backgroundColor: '#fafafa', border: '2px solid var(--snack-green-dark, #172b14)',
                borderRadius: '12px', padding: '16px', marginTop: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>
                    Cadastrar Novo Destinatário
                  </span>
                  <button type="button" onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João Pereira"
                      value={newRecipient.name}
                      onChange={e => setNewRecipient({ ...newRecipient, name: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>WhatsApp / Telefone *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 31 99999-8888"
                      value={newRecipient.phone}
                      onChange={e => setNewRecipient({ ...newRecipient, phone: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>CEP</label>
                    <input
                      type="text"
                      placeholder="30130-100"
                      value={newRecipient.zipcode}
                      onChange={e => setNewRecipient({ ...newRecipient, zipcode: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>Rua / Av *</label>
                    <input
                      type="text"
                      required
                      placeholder="Av. Afonso Pena"
                      value={newRecipient.street}
                      onChange={e => setNewRecipient({ ...newRecipient, street: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>Número *</label>
                    <input
                      type="text"
                      required
                      placeholder="1200"
                      value={newRecipient.number}
                      onChange={e => setNewRecipient({ ...newRecipient, number: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>Complemento / Bairro</label>
                    <input
                      type="text"
                      placeholder="Apt 301 - Centro"
                      value={newRecipient.complement}
                      onChange={e => setNewRecipient({ ...newRecipient, complement: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#4b5563' }}>Cidade / UF</label>
                    <input
                      type="text"
                      value={`${newRecipient.city} / ${newRecipient.state}`}
                      onChange={e => {
                        const parts = e.target.value.split('/');
                        setNewRecipient({ ...newRecipient, city: parts[0]?.trim() || 'Belo Horizonte', state: parts[1]?.trim() || 'MG' });
                      }}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--snack-green-dark, #172b14)', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Salvar e Adicionar
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

        {/* Footer actions */}
        <div style={{
          padding: '16px 24px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#6b7280', fontSize: '13px',
              fontWeight: '700', cursor: 'pointer'
            }}
          >
            Voltar
          </button>
          
          <button
            type="button"
            disabled={!isAllocationComplete}
            onClick={handleSaveAndConfirm}
            style={{
              backgroundColor: isAllocationComplete ? 'var(--snack-green-dark, #172b14)' : '#9ca3af',
              color: '#FFFFFF', border: 'none', padding: '12px 24px', borderRadius: '8px',
              fontSize: '13px', fontWeight: '800', cursor: isAllocationComplete ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '8px', boxShadow: isAllocationComplete ? '0 4px 12px rgba(23,43,20,0.2)' : 'none'
            }}
          >
            <CheckCircle2 size={16} /> Confirmar Distribuição de Envio
          </button>
        </div>

      </div>
    </div>
  );
}
