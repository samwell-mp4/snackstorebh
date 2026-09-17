import React, { useState, useMemo } from 'react';
import { 
  Truck, Package, CheckCircle2, Clock, Search, Filter, 
  MapPin, Phone, User, Check, Eye, ChevronRight, ChevronDown, 
  X, Printer, ShieldAlert, Send, ArrowRight, Edit3, Trash2, 
  Layers, QrCode, Tag, CheckSquare, Square, Save, AlertCircle
} from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminShipments() {
  const { 
    shipments, 
    orders, 
    updateShipment,
    deleteShipment,
    updateShipmentStatus, 
    updateShipmentTracking 
  } = useStoreData();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalityFilter, setModalityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'list'
  const [expandedResellers, setExpandedResellers] = useState(new Set()); // Set of expanded reseller keys

  // Modals state
  const [selectedShipment, setSelectedShipment] = useState(null); // For picking checklist
  const [editingShipment, setEditingShipment] = useState(null); // For editing shipment
  const [labelShipment, setLabelShipment] = useState(null); // For printing label
  const [trackingInput, setTrackingInput] = useState('');
  const [pickedItems, setPickedItems] = useState({});
  const [feedback, setFeedback] = useState('');

  const showToast = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  };

  const statusMap = {
    pendente: { label: 'Pendente', bg: '#fef3c7', text: '#92400e' },
    aguardando_estoque: { label: 'Aguardando Estoque', bg: '#fee2e2', text: '#991b1b' },
    separacao: { label: 'Separação (Picking)', bg: '#e0f2fe', text: '#0369a1' },
    embalagem: { label: 'Embalagem', bg: '#ede9fe', text: '#5b21b6' },
    pronto_envio: { label: 'Pronto para Envio', bg: '#fef9c3', text: '#854d0e' },
    enviado: { label: 'Enviado / Em Trânsito', bg: '#dbeafe', text: '#1e40af' },
    entregue: { label: 'Entregue', bg: '#dcfce7', text: '#166534' },
    cancelado: { label: 'Cancelado', bg: '#fee2e2', text: '#991b1b' }
  };

  // Map orders by ID for fast lookup
  const ordersMap = useMemo(() => {
    const map = new Map();
    (orders || []).forEach(o => {
      map.set(o.id, o);
      if (o.order_number) map.set(o.order_number, o);
    });
    return map;
  }, [orders]);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const term = searchTerm.toLowerCase();
      const order = ordersMap.get(s.order_id);
      const resellerName = order?.customer_name || '';

      const matchSearch = (s.shipment_number || '').toLowerCase().includes(term) ||
                          (s.recipient_name || '').toLowerCase().includes(term) ||
                          (s.recipient_phone || '').includes(term) ||
                          (s.recipient_address || '').toLowerCase().includes(term) ||
                          resellerName.toLowerCase().includes(term) ||
                          String(s.order_id || '').includes(term);

      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchModality = modalityFilter === 'ALL' || s.logistics_mode === modalityFilter;

      return matchSearch && matchStatus && matchModality;
    });
  }, [shipments, searchTerm, statusFilter, modalityFilter, ordersMap]);

  // Group shipments by reseller
  const groupedByReseller = useMemo(() => {
    const groups = new Map();

    filteredShipments.forEach(s => {
      const order = ordersMap.get(s.order_id);
      const resellerKey = order?.customer_name || (s.neutral_packing ? 'Revendedor VIP' : 'Varejo / Balcão');
      const resellerPhone = order?.customer_phone || '';

      if (!groups.has(resellerKey)) {
        groups.set(resellerKey, {
          resellerName: resellerKey,
          phone: resellerPhone,
          orderId: s.order_id,
          orderNumber: order?.order_number || s.order_id,
          shipments: [],
          totalUnits: 0,
          modalities: new Set(),
          hasNeutralPacking: false
        });
      }

      const g = groups.get(resellerKey);
      g.shipments.push(s);
      if (s.neutral_packing) g.hasNeutralPacking = true;
      if (s.logistics_mode) g.modalities.add(s.logistics_mode);

      const items = Array.isArray(s.items_json) ? s.items_json : [];
      g.totalUnits += items.reduce((acc, i) => acc + (parseInt(i.quantity, 10) || 1), 0);
    });

    return Array.from(groups.values());
  }, [filteredShipments, ordersMap]);

  // Toggle reseller accordion
  const toggleReseller = (resellerName) => {
    setExpandedResellers(prev => {
      const next = new Set(prev);
      if (next.has(resellerName)) next.delete(resellerName);
      else next.add(resellerName);
      return next;
    });
  };

  // Expand all / Collapse all
  const toggleAllResellers = () => {
    if (expandedResellers.size >= groupedByReseller.length) {
      setExpandedResellers(new Set());
    } else {
      setExpandedResellers(new Set(groupedByReseller.map(g => g.resellerName)));
    }
  };

  // Initialize expanded set on first load if empty
  React.useEffect(() => {
    if (groupedByReseller.length > 0 && expandedResellers.size === 0) {
      setExpandedResellers(new Set(groupedByReseller.slice(0, 5).map(g => g.resellerName)));
    }
  }, [groupedByReseller]);

  // Picking handler
  const handleOpenPicking = (shipment) => {
    setSelectedShipment(shipment);
    setTrackingInput(shipment.tracking_code || '');
    setPickedItems({});
  };

  const handleTogglePick = (idx) => {
    setPickedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleQuickStatusChange = async (shipmentId, nextStatus) => {
    try {
      await updateShipmentStatus(shipmentId, nextStatus);
      if (selectedShipment && selectedShipment.id === shipmentId) {
        setSelectedShipment(prev => ({ ...prev, status: nextStatus }));
      }
      showToast(`Remessa atualizada para "${statusMap[nextStatus]?.label || nextStatus}"!`);
    } catch (err) {
      alert('Erro ao atualizar: ' + err.message);
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedShipment) return;
    try {
      await updateShipmentTracking(selectedShipment.id, trackingInput.trim());
      setSelectedShipment(prev => ({ ...prev, tracking_code: trackingInput.trim(), status: 'enviado' }));
      showToast('Código de rastreamento salvo e remessa marcada como Enviada!');
    } catch (err) {
      alert('Erro ao salvar rastreamento: ' + err.message);
    }
  };

  // Delete shipment
  const handleDeleteShipment = async (shipment) => {
    if (!window.confirm(`Tem certeza que deseja EXCLUIR a remessa ${shipment.shipment_number}?`)) return;
    try {
      await deleteShipment(shipment.id);
      if (selectedShipment && selectedShipment.id === shipment.id) setSelectedShipment(null);
      if (editingShipment && editingShipment.id === shipment.id) setEditingShipment(null);
      showToast(`Remessa ${shipment.shipment_number} excluída com sucesso!`);
    } catch (err) {
      alert('Erro ao excluir remessa: ' + err.message);
    }
  };

  // Edit shipment save
  const handleSaveShipmentEdit = async () => {
    if (!editingShipment) return;
    try {
      await updateShipment(editingShipment.id, editingShipment);
      showToast(`Remessa ${editingShipment.shipment_number} atualizada com sucesso!`);
      setEditingShipment(null);
    } catch (err) {
      alert('Erro ao atualizar remessa: ' + err.message);
    }
  };

  // Check if all items in picking are checked
  const currentItems = selectedShipment ? (Array.isArray(selectedShipment.items_json) ? selectedShipment.items_json : []) : [];
  const allPicked = currentItems.length > 0 && currentItems.every((_, idx) => pickedItems[idx]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Top Header */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px 26px',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)' }}>
            Expedição & Fulfillment
          </span>
          <h2 style={{ margin: '3px 0 0 0', fontSize: '22px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
            Gestão de Remessas & Picking (Agrupado por Revendedor)
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--snack-muted)' }}>
            Separação física de frascos agrupada por revendedor, gestão de múltiplos endereços e expedição com embalagem neutra
          </p>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              style={{
                border: 'none', padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: viewMode === 'grouped' ? 'var(--snack-green-dark)' : 'transparent',
                color: viewMode === 'grouped' ? '#FFFFFF' : '#64748B'
              }}
            >
              <Layers size={14} /> Agrupado por Revendedor
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                border: 'none', padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: viewMode === 'list' ? 'var(--snack-green-dark)' : 'transparent',
                color: viewMode === 'list' ? '#FFFFFF' : '#64748B'
              }}
            >
              <Truck size={14} /> Lista Geral
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div style={{
          backgroundColor: '#dcfce7', color: '#166534', padding: '12px 18px',
          borderRadius: '10px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <CheckCircle2 size={18} /> {feedback}
        </div>
      )}

      {/* Filter Bar */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '16px 20px',
        border: '1px solid rgba(41,69,31,0.08)', display: 'flex', flexWrap: 'wrap', gap: '12px',
        alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por remessa, revendedor, destinatário ou endereço..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px',
              border: '1px solid rgba(41,69,31,0.15)', fontSize: '13px', backgroundColor: '#FAF8F2',
              outline: 'none'
            }}
          />
        </div>

        {/* Modalidade filter */}
        <select
          value={modalityFilter}
          onChange={e => setModalityFilter(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2', fontWeight: '600' }}
        >
          <option value="ALL">Todas as Modalidades</option>
          <option value="EXPRESSO">⚡ Expresso BH (1-6h)</option>
          <option value="PROGRAMADO_7">📦 Programado (7d)</option>
          <option value="ECONOMICO_15">💰 Econômico (15d)</option>
        </select>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
          {[
            { id: 'ALL', label: 'Todas' },
            { id: 'separacao', label: 'Em Separação' },
            { id: 'embalagem', label: 'Embalagem' },
            { id: 'pronto_envio', label: 'Pronto p/ Envio' },
            { id: 'enviado', label: 'Enviadas' },
            { id: 'entregue', label: 'Entregues' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              style={{
                border: 'none', padding: '6px 11px', borderRadius: '6px', fontSize: '11px', fontWeight: statusFilter === f.id ? '700' : '500',
                cursor: 'pointer', backgroundColor: statusFilter === f.id ? 'var(--snack-green-dark)' : '#FAF8F2',
                color: statusFilter === f.id ? '#FFFFFF' : 'var(--snack-text)', whiteSpace: 'nowrap'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {viewMode === 'grouped' && (
          <button
            type="button"
            onClick={toggleAllResellers}
            style={{
              backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.15)',
              padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
              cursor: 'pointer', color: 'var(--snack-green-dark)'
            }}
          >
            {expandedResellers.size >= groupedByReseller.length ? 'Recolher Todos' : 'Expandir Todos'}
          </button>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: AGRUPADO POR REVENDEDOR COM TOGGLE EXPANSÍVEL
         ========================================================================= */}
      {viewMode === 'grouped' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {groupedByReseller.length === 0 ? (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(41,69,31,0.08)', padding: '48px 24px', textAlign: 'center', color: 'var(--snack-muted)' }}>
              <Package size={42} style={{ margin: '0 auto 12px auto', color: '#94A3B8' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Nenhuma remessa encontrada.</h3>
            </div>
          ) : (
            groupedByReseller.map(group => {
              const isExpanded = expandedResellers.has(group.resellerName);
              const totalShipments = group.shipments.length;

              return (
                <div 
                  key={group.resellerName}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: isExpanded ? '2px solid var(--snack-green-dark)' : '1px solid rgba(41,69,31,0.12)',
                    overflow: 'hidden',
                    boxShadow: isExpanded ? '0 8px 25px rgba(0,0,0,0.05)' : '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Reseller Group Header (Accordion Toggle) */}
                  <div
                    onClick={() => toggleReseller(group.resellerName)}
                    style={{
                      padding: '18px 22px',
                      backgroundColor: isExpanded ? '#FAF8F2' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      borderBottom: isExpanded ? '1px solid rgba(41,69,31,0.08)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        backgroundColor: isExpanded ? 'var(--snack-green-dark)' : '#EDE9FE',
                        color: isExpanded ? '#FFFFFF' : '#6D28D9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <User size={20} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                            {group.resellerName}
                          </h3>
                          {group.hasNeutralPacking && (
                            <span style={{ fontSize: '10px', backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 7px', borderRadius: '99px', fontWeight: '800' }}>
                              📦 EMBALAGEM NEUTRA
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--snack-muted)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
                          {group.phone && <span>📱 {group.phone}</span>}
                          <span>Pedido Origem: #{group.orderNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Metric Badges */}
                      <span style={{
                        backgroundColor: '#E0F2FE', color: '#0369A1', padding: '6px 12px',
                        borderRadius: '8px', fontSize: '12px', fontWeight: '800'
                      }}>
                        {totalShipments} {totalShipments === 1 ? 'Pacote / Destino' : 'Pacotes Distintos'}
                      </span>

                      <span style={{
                        backgroundColor: '#DCFCE7', color: '#166534', padding: '6px 12px',
                        borderRadius: '8px', fontSize: '12px', fontWeight: '800'
                      }}>
                        {group.totalUnits} Frascos no Total
                      </span>

                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--snack-text)'
                      }}>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Shipments Content */}
                  {isExpanded && (
                    <div style={{ padding: '20px 22px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Destinatários e Pacotes deste Revendedor:
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                        {group.shipments.map((s, idx) => {
                          const items = Array.isArray(s.items_json) ? s.items_json : [];
                          const units = items.reduce((acc, i) => acc + (parseInt(i.quantity, 10) || 1), 0);
                          const st = statusMap[s.status] || { label: s.status, bg: '#f1f5f9', text: '#334155' };

                          return (
                            <div 
                              key={s.id}
                              style={{
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                padding: '16px',
                                backgroundColor: '#FAF8F2',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: '12px'
                              }}
                            >
                              <div>
                                {/* Card Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                  <div>
                                    <span style={{ fontSize: '10px', color: 'var(--snack-gold)', fontWeight: '800', textTransform: 'uppercase' }}>
                                      Pacote #{idx + 1} • {s.shipment_number}
                                    </span>
                                    <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--snack-green-dark)', marginTop: '2px' }}>
                                      {s.recipient_name}
                                    </div>
                                  </div>
                                  <span style={{
                                    backgroundColor: st.bg, color: st.text, padding: '3px 8px',
                                    borderRadius: '6px', fontSize: '10px', fontWeight: '800'
                                  }}>
                                    {st.label}
                                  </span>
                                </div>

                                {/* Address & Contact */}
                                <div style={{ fontSize: '12px', color: 'var(--snack-text)', lineHeight: '1.4' }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                    <MapPin size={13} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--snack-muted)' }} />
                                    <span>{s.recipient_address || 'Endereço não informado'}</span>
                                  </div>
                                  {s.recipient_phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#4B5563' }}>
                                      <Phone size={12} color="#94A3B8" /> {s.recipient_phone}
                                    </div>
                                  )}
                                </div>

                                {/* Items list */}
                                <div style={{ marginTop: '10px', backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '10px', border: '1px solid #E2E8F0' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: 'var(--snack-green-dark)', marginBottom: '4px' }}>
                                    <span>Fragrâncias a Separar:</span>
                                    <span>{units} un.</span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#475569' }}>
                                    {items.map(it => `${it.quantity || 1}x ${it.name}`).join(', ')}
                                  </div>
                                </div>

                                {/* Tracking Code if present */}
                                {s.tracking_code && (
                                  <div style={{ marginTop: '8px', fontSize: '11px', fontFamily: 'monospace', backgroundColor: '#EDE9FE', color: '#5B21B6', padding: '4px 8px', borderRadius: '6px' }}>
                                    Rastreio: <strong>{s.tracking_code}</strong>
                                  </div>
                                )}
                              </div>

                              {/* Operations buttons */}
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenPicking(s)}
                                  style={{
                                    flex: 1, backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', border: 'none',
                                    padding: '8px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                                  }}
                                >
                                  <Package size={13} /> Picking / Separação
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setEditingShipment({ ...s })}
                                  title="Editar Remessa / Endereço"
                                  style={{
                                    backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '8px 10px',
                                    borderRadius: '6px', cursor: 'pointer', color: '#475569'
                                  }}
                                >
                                  <Edit3 size={13} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setLabelShipment({ ...s, resellerName: group.resellerName, resellerPhone: group.phone })}
                                  title="Imprimir Etiqueta de Envio"
                                  style={{
                                    backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '8px 10px',
                                    borderRadius: '6px', cursor: 'pointer', color: '#475569'
                                  }}
                                >
                                  <Printer size={13} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteShipment(s)}
                                  title="Excluir Remessa"
                                  style={{
                                    backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', padding: '8px 10px',
                                    borderRadius: '6px', cursor: 'pointer', color: '#991B1B'
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* =========================================================================
            VIEW 2: TABELA GERAL LISTADA
           ========================================================================= */
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden',
          border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
        }}>
          <div className="responsive-table-wrapper" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(41,69,31,0.08)', color: 'var(--snack-muted)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 18px' }}>Remessa / Pedido</th>
                  <th style={{ padding: '14px 14px' }}>Revendedor</th>
                  <th style={{ padding: '14px 14px' }}>Destinatário & Endereço</th>
                  <th style={{ padding: '14px 14px' }}>Modalidade</th>
                  <th style={{ padding: '14px 14px' }}>Itens</th>
                  <th style={{ padding: '14px 14px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Operação</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--snack-muted)' }}>
                      Nenhuma remessa encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map(s => {
                    const order = ordersMap.get(s.order_id);
                    const items = Array.isArray(s.items_json) ? s.items_json : [];
                    const totalUnits = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
                    const st = statusMap[s.status] || { label: s.status, bg: '#f1f5f9', text: '#334155' };

                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(41,69,31,0.05)' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: '800', color: 'var(--snack-green-dark)', fontSize: '13px' }}>
                            {s.shipment_number}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '2px' }}>
                            Pedido: #{order?.order_number || s.order_id}
                          </div>
                        </td>

                        <td style={{ padding: '14px 14px' }}>
                          <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '13px' }}>
                            {order?.customer_name || 'Varejo / Balcão'}
                          </div>
                        </td>

                        <td style={{ padding: '14px 14px' }}>
                          <div style={{ fontWeight: '700', color: 'var(--snack-text)' }}>
                            {s.recipient_name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '2px' }}>
                            {s.recipient_address}
                          </div>
                          {s.neutral_packing && (
                            <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '9px', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>
                              📦 EMBALAGEM NEUTRA
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '14px 14px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
                            {s.logistics_mode || 'EXPRESSO'}
                          </span>
                        </td>

                        <td style={{ padding: '14px 14px' }}>
                          <span style={{ fontWeight: '700' }}>{totalUnits} un.</span>
                        </td>

                        <td style={{ padding: '14px 14px' }}>
                          <span style={{ backgroundColor: st.bg, color: st.text, padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                            {st.label}
                          </span>
                        </td>

                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenPicking(s)}
                            style={{
                              backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', border: 'none',
                              padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Picking
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PICKING / CONFERÊNCIA FÍSICA NO ESTOQUE
         ========================================================================= */}
      {selectedShipment && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          backgroundColor: 'rgba(23,43,20,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '640px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '1px solid rgba(41,69,31,0.1)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(41,69,31,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF8F2',
              position: 'sticky', top: 0, zIndex: 10
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--snack-gold)', textTransform: 'uppercase' }}>
                  Conferência Física de Separação (Picking)
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', color: 'var(--snack-green-dark)', fontFamily: 'var(--font-display)' }}>
                  Remessa {selectedShipment.shipment_number}
                </h3>
              </div>
              <button onClick={() => setSelectedShipment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Recipient card */}
              <div style={{ backgroundColor: '#FAF8F2', borderRadius: '12px', padding: '16px', border: '1px solid rgba(41,69,31,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--snack-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Destinatário da Entrega</span>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--snack-green-dark)' }}>{selectedShipment.recipient_name}</div>
                  </div>
                  {selectedShipment.neutral_packing && (
                    <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '10px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                      📦 EMBALAGEM NEUTRA
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--snack-text)', lineHeight: '1.4' }}>
                  <MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  {selectedShipment.recipient_address}
                </div>
                {selectedShipment.recipient_phone && (
                  <div style={{ fontSize: '12px', color: 'var(--snack-muted)', marginTop: '4px' }}>
                    <Phone size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    {selectedShipment.recipient_phone}
                  </div>
                )}
              </div>

              {/* Items checklist */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--snack-green-dark)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  Itens a Separar no Estoque ({currentItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} unidades):
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentItems.map((item, idx) => {
                    const isChecked = Boolean(pickedItems[idx]);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleTogglePick(idx)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', borderRadius: '10px',
                          border: isChecked ? '2px solid #10b981' : '1px solid rgba(41,69,31,0.12)',
                          backgroundColor: isChecked ? '#f0fdf4' : '#ffffff',
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', color: isChecked ? '#065f46' : 'var(--snack-text)', fontSize: '13px' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '2px' }}>
                              SKU: {item.code || '-'} • Volume: {item.volume || '25ml'}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            backgroundColor: isChecked ? '#10b981' : 'var(--snack-green-dark)',
                            color: '#FFFFFF', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '800'
                          }}>
                            {item.quantity || 1}x
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Transition Bar */}
              <div style={{ backgroundColor: '#FAF8F2', borderRadius: '12px', padding: '16px', border: '1px solid rgba(41,69,31,0.08)' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--snack-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Mover Etapa Operacional da Remessa:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(selectedShipment.id, 'embalagem')}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: 'none',
                      backgroundColor: selectedShipment.status === 'embalagem' ? '#5b21b6' : '#ede9fe',
                      color: selectedShipment.status === 'embalagem' ? '#fff' : '#5b21b6',
                      fontWeight: 'bold', fontSize: '11px', cursor: 'pointer'
                    }}
                  >
                    📦 Embalagem
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(selectedShipment.id, 'pronto_envio')}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: 'none',
                      backgroundColor: selectedShipment.status === 'pronto_envio' ? '#854d0e' : '#fef9c3',
                      color: selectedShipment.status === 'pronto_envio' ? '#fff' : '#854d0e',
                      fontWeight: 'bold', fontSize: '11px', cursor: 'pointer'
                    }}
                  >
                    🏷️ Pronto p/ Envio
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(selectedShipment.id, 'enviado')}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: 'none',
                      backgroundColor: selectedShipment.status === 'enviado' ? '#1e40af' : '#dbeafe',
                      color: selectedShipment.status === 'enviado' ? '#fff' : '#1e40af',
                      fontWeight: 'bold', fontSize: '11px', cursor: 'pointer'
                    }}
                  >
                    🚚 Enviado / Despachado
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickStatusChange(selectedShipment.id, 'entregue')}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: 'none',
                      backgroundColor: selectedShipment.status === 'entregue' ? '#166534' : '#dcfce7',
                      color: selectedShipment.status === 'entregue' ? '#fff' : '#166534',
                      fontWeight: 'bold', fontSize: '11px', cursor: 'pointer'
                    }}
                  >
                    ✅ Entregue
                  </button>
                </div>
              </div>

              {/* Tracking Code input */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--snack-text)', display: 'block', marginBottom: '6px' }}>
                  Código de Rastreamento (Correios / Transportadora / Motoboy):
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Ex: NL123456789BR ou Entrega Flash 01"
                    value={trackingInput}
                    onChange={e => setTrackingInput(e.target.value)}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveTracking}
                    style={{ backgroundColor: 'var(--snack-gold)', color: '#000', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Salvar Rastreio
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDITAR REMESSA (DESTINATÁRIO, ENDEREÇO, RASTREIO)
         ========================================================================= */}
      {editingShipment && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1250,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '1px solid #CBD5E1'
          }}>
            <div style={{
              padding: '18px 22px', borderBottom: '1px solid #E2E8F0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', color: '#FFFFFF'
            }}>
              <div>
                <span style={{ fontSize: '10px', color: '#38BDF8', fontWeight: '800', textTransform: 'uppercase' }}>Edição de Remessa</span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', color: '#FFFFFF' }}>{editingShipment.shipment_number}</h3>
              </div>
              <button type="button" onClick={() => setEditingShipment(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>Nome do Destinatário:</label>
                <input
                  type="text"
                  value={editingShipment.recipient_name || ''}
                  onChange={e => setEditingShipment({ ...editingShipment, recipient_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>Telefone do Destinatário:</label>
                <input
                  type="text"
                  value={editingShipment.recipient_phone || ''}
                  onChange={e => setEditingShipment({ ...editingShipment, recipient_phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>Endereço Completo de Entrega:</label>
                <textarea
                  rows={3}
                  value={editingShipment.recipient_address || ''}
                  onChange={e => setEditingShipment({ ...editingShipment, recipient_address: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>Modalidade:</label>
                  <select
                    value={editingShipment.logistics_mode || 'EXPRESSO'}
                    onChange={e => setEditingShipment({ ...editingShipment, logistics_mode: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="EXPRESSO">⚡ Expresso BH</option>
                    <option value="PROGRAMADO_7">📦 Programado (7d)</option>
                    <option value="ECONOMICO_15">💰 Econômico (15d)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>Status da Remessa:</label>
                  <select
                    value={editingShipment.status || 'separacao'}
                    onChange={e => setEditingShipment({ ...editingShipment, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="separacao">Em Separação</option>
                    <option value="embalagem">Embalagem</option>
                    <option value="pronto_envio">Pronto p/ Envio</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregue">Entregue</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>Código de Rastreamento:</label>
                <input
                  type="text"
                  value={editingShipment.tracking_code || ''}
                  onChange={e => setEditingShipment({ ...editingShipment, tracking_code: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingShipment(null)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFF', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveShipmentEdit}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#166534', color: '#FFF', fontWeight: '700', cursor: 'pointer' }}
                >
                  Salvar Remessa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: IMPRESSÃO DE ETIQUETA DE EXPEDIÇÃO (A4 / TÉRMICA)
         ========================================================================= */}
      {labelShipment && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1300,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '14px', width: '100%', maxWidth: '480px',
            padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '2px dashed #0F172A'
          }}>
            <div style={{ borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900' }}>
                  {labelShipment.neutral_packing ? 'EXPEDIÇÃO NEUTRA' : 'SNACK STORE BH'}
                </h3>
                <span style={{ fontSize: '11px', color: '#666' }}>Remessa: {labelShipment.shipment_number}</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 8px', border: '1px solid #000', borderRadius: '4px' }}>
                {labelShipment.logistics_mode || 'EXPRESSO'}
              </span>
            </div>

            {/* Recipient info */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', color: '#888' }}>DESTINATÁRIO:</span>
              <div style={{ fontSize: '16px', fontWeight: '900', marginTop: '2px' }}>{labelShipment.recipient_name}</div>
              <div style={{ fontSize: '13px', marginTop: '4px', lineHeight: '1.4' }}>{labelShipment.recipient_address}</div>
              {labelShipment.recipient_phone && (
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Tel: {labelShipment.recipient_phone}</div>
              )}
            </div>

            {/* Sender info */}
            <div style={{ borderTop: '1px solid #DDD', paddingTop: '10px', marginBottom: '16px', fontSize: '11px', color: '#555' }}>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: '900', color: '#888' }}>REMETENTE:</span>
              <div>{labelShipment.neutral_packing ? labelShipment.resellerName : 'Snack Store BH - Centro de Distribuição'}</div>
              <div>Belo Horizonte - MG</div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ flex: 1, backgroundColor: '#000', color: '#FFF', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', border: 'none' }}
              >
                Imprimir Etiqueta
              </button>
              <button
                type="button"
                onClick={() => setLabelShipment(null)}
                style={{ padding: '10px 16px', backgroundColor: '#EEE', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
