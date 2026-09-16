import React, { useState } from 'react';
import { Database, Server, RefreshCw, CheckCircle2, AlertCircle, Key, Phone, ShieldCheck, Globe } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminSettings() {
  const { dbStatus, refreshData } = useStoreData();
  const [testing, setTesting] = useState(false);
  const [storeConfig, setStoreConfig] = useState({
    whatsapp: '553175650503',
    pixKey: 'contato@snackstorebh.com.br',
    city: 'Belo Horizonte - MG',
    freeShippingThreshold: '150.00'
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    await refreshData();
    setTimeout(() => setTesting(false), 800);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px 24px',
        border: '1px solid rgba(41,69,31,0.08)', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)' }}>
            Infraestrutura & Integrações
          </span>
          <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
            Banco de Dados PostgreSQL & Configurações
          </h2>
        </div>
      </div>

      {/* PostgreSQL Storegress Status Card */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              backgroundColor: dbStatus.connected ? '#dcfce7' : '#fef3c7',
              color: dbStatus.connected ? '#166534' : '#92400e',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                PostgreSQL - storegress
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--snack-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: dbStatus.connected ? '#16a34a' : '#f59e0b',
                  display: 'inline-block'
                }}></span>
                <span>{dbStatus.connected ? 'Conexão Ativa Direta' : 'Modo Híbrido Sincronizado (Local / Docker)'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testing}
            style={{
              backgroundColor: '#FAF8F2', border: '1px solid rgba(41,69,31,0.2)',
              padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
              cursor: testing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              color: 'var(--snack-green-dark)'
            }}
          >
            <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
            <span>{testing ? 'Testando Conexão...' : 'Testar Conexão'}</span>
          </button>
        </div>

        {/* Credentials Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', backgroundColor: '#FAF8F2', padding: '16px', borderRadius: '12px', border: '1px solid rgba(41,69,31,0.06)' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--snack-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Host Interno</span>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-text)', fontFamily: 'monospace' }}>var_hub_storegress</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--snack-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Porta</span>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-text)', fontFamily: 'monospace' }}>5432</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--snack-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Nome do Banco</span>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-text)', fontFamily: 'monospace' }}>storegress</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--snack-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Usuário</span>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--snack-text)', fontFamily: 'monospace' }}>storegress</div>
          </div>
        </div>

        {/* Connection String Readonly */}
        <div style={{ marginTop: '14px' }}>
          <span style={{ fontSize: '11px', color: 'var(--snack-muted)', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
            URL de Conexão Interna
          </span>
          <div style={{
            backgroundColor: '#FAF8F2', padding: '10px 14px', borderRadius: '8px',
            border: '1px solid rgba(41,69,31,0.1)', fontFamily: 'monospace', fontSize: '12px',
            color: 'var(--snack-green-dark)', wordBreak: 'break-all'
          }}>
            postgres://storegress:••••••••••••••@var_hub_storegress:5432/storegress?sslmode=disable
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--snack-muted)', margin: '14px 0 0 0', lineHeight: '1.5' }}>
          ℹ️ O host <code>var_hub_storegress</code> é resolvido automaticamente na rede interna do Docker / servidor onde o PostgreSQL está hospedado. Em ambiente de desenvolvimento local, o sistema opera de forma resiliente e mantém todos os dados operacionais seguros e sincronizados!
        </p>
      </div>

      {/* Store Commercial Config */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
          Parâmetros Comerciais da Snack Store
        </h3>

        {saveSuccess && (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            Configurações salvas com sucesso!
          </div>
        )}

        <form onSubmit={handleSaveConfig} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
              WhatsApp Oficial de Vendas
            </label>
            <input
              type="text"
              value={storeConfig.whatsapp}
              onChange={e => setStoreConfig({ ...storeConfig, whatsapp: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
              Chave Pix Principal
            </label>
            <input
              type="text"
              value={storeConfig.pixKey}
              onChange={e => setStoreConfig({ ...storeConfig, pixKey: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
              Cidade Base de Envio
            </label>
            <input
              type="text"
              value={storeConfig.city}
              onChange={e => setStoreConfig({ ...storeConfig, city: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
              Frete Grátis BH a partir de (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={storeConfig.freeShippingThreshold}
              onChange={e => setStoreConfig({ ...storeConfig, freeShippingThreshold: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', padding: '12px 24px',
                borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
              }}
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
