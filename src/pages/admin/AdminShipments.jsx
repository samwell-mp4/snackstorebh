import React, { useState, useMemo } from 'react';
import { 
  Truck, Package, CheckCircle2, Clock, Search, Filter, 
  MapPin, Phone, User, Check, Eye, ChevronRight, X, 
  Printer, ShieldAlert, Send, ArrowRight
} from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminShipments() {
  const { shipments, updateShipmentStatus, updateShipmentTracking } = useStoreData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalityFilter, setModalityFilter] = useState('ALL');
  const [selectedShipment, setSelectedShipment] = useState(null);
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

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const term = searchTerm.toLowerCase();
      const matchSearch = (s.shipment_number || '').toLowerCase().includes(term) ||
                          (s.recipient_name || '').toLowerCase().includes(term) ||
                          (s.recipient_phone || '').includes(term) ||
                          (s.recipient_address || '').toLowerCase().includes(term);

      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchModality = modalityFilter === 'ALL' || s.logistics_mode === modalityFilter;

      return matchSearch && matchStatus && matchModality;
    });
  }, [shipments, searchTerm, statusFilter, modalityFilter]);

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
            Gestão Operacional de Remessas & Picking
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--snack-muted)' }}>
            Separação física de frascos, emissão de embalagens neutras para revendedores e despacho logístico
          </p>
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
            placeholder="Buscar por remessa, destinatário, endereço ou telefone..."
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
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)', fontSize: '12px', backgroundColor: '#FAF8F2' }}
        >
          <option value="ALL">Todas as Modalidades</option>
          <option value="EXPRESSO">⚡ Expresso BH</option>
          <option value="PROGRAMADO_7">📦 Programado (7 dias)</option>
          <option value="ECONOMICO_15">💰 Econômico (15 dias)</option>
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
              onClick={() => setStatusFilter(f.id)}
              style={{
                border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: statusFilter === f.id ? '700' : '500',
                cursor: 'pointer', backgroundColor: statusFilter === f.id ? 'var(--snack-green-dark)' : '#FAF8F2',
                color: statusFilter === f.id ? '#FFFFFF' : 'var(--snack-text)', whiteSpace: 'nowrap'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments Table */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(41,69,31,0.08)', color: 'var(--snack-muted)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 18px' }}>Remessa / Pedido</th>
                <th style={{ padding: '14px 14px' }}>Destinatário & Endereço</th>
                <th style={{ padding: '14px 14px' }}>Modalidade</th>
                <th style={{ padding: '14px 14px' }}>Itens</th>
                <th style={{ padding: '14px 14px' }}>Status Atual</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Operação</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--snack-muted)' }}>
                    Nenhuma remessa encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredShipments.map(s => {
                  const items = Array.isArray(s.items_json) ? s.items_json : [];
                  const totalUnits = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
                  const st = statusMap[s.status] || { label: s.status, bg: '#f1f5f9', text: '#334155' };

                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid rgba(41,69,31,0.05)',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      {/* Remessa */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--snack-green-dark)', fontSize: '14px' }}>
                          {s.shipment_number}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '2px' }}>
                          Pedido: #{s.order_id}
                        </div>
                      </td>

                      {/* Destinatário */}
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--snack-text)' }}>
                          {s.recipient_name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <MapPin size={12} /> {s.recipient_address}
                        </div>
                        {s.recipient_phone && (
                          <div style={{ fontSize: '11px', color: 'var(--snack-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Phone size={12} /> {s.recipient_phone}
                          </div>
                        )}
                        {s.neutral_packing && (
                          <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '9px', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>
                            📦 EMBALAGEM NEUTRA
                          </span>
                        )}
                      </td>

                      {/* Modalidade */}
                      <td style={{ padding: '14px 14px' }}>
                        <span style={{
                          display: 'inline-block', fontSize: '11px', fontWeight: '800', padding: '4px 8px', borderRadius: '6px',
                          backgroundColor: s.logistics_mode === 'EXPRESSO' ? '#FAF2DE' : s.logistics_mode === 'PROGRAMADO_7' ? '#e0f2fe' : '#dcfce7',
                          color: s.logistics_mode === 'EXPRESSO' ? '#854D0E' : s.logistics_mode === 'PROGRAMADO_7' ? '#0369a1' : '#166534'
                        }}>
                          {s.logistics_mode === 'EXPRESSO' ? '⚡ EXPRESSO' : s.logistics_mode === 'PROGRAMADO_7' ? '📦 PROGRAMADO' : '💰 ECONÔMICO'}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '4px' }}>
                          {s.estimated_delivery}
                        </div>
                      </td>

                      {/* Itens */}
                      <td style={{ padding: '14px 14px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                          {totalUnits} unidade(s)
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '2px' }}>
                          {items.length} produto(s)
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 14px' }}>
                        <span style={{
                          backgroundColor: st.bg, color: st.text, padding: '4px 8px',
                          borderRadius: '6px', fontSize: '11px', fontWeight: '700', display: 'inline-block'
                        }}>
                          {st.label}
                        </span>
                        {s.tracking_code && (
                          <div style={{ fontSize: '10px', color: 'var(--snack-muted)', marginTop: '4px', fontFamily: 'monospace' }}>
                            Rastreio: {s.tracking_code}
                          </div>
                        )}
                      </td>

                      {/* Operação */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenPicking(s)}
                          style={{
                            backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', border: 'none',
                            padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          <Package size={14} /> Abrir Picking / Separação
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

      {/* PICKING / SEPARAÇÃO MODAL */}
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
                  Conferência Física de Separação
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
                    <span style={{ fontSize: '11px', color: 'var(--snack-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Destinatário</span>
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
                              SKU: {item.code} • Volume: {item.volume || '25ml'}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            backgroundColor: isChecked ? '#10b981' : 'var(--snack-green-dark)',
                            color: '#FFFFFF', padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '800'
                          }}>
                            {item.quantity}x
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

    </div>
  );
}
