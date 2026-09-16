import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Plus, PieChart, CreditCard, Receipt, Calendar } from 'lucide-react';
import { useStoreData } from '../../context/StoreDataContext';

export default function AdminFinance() {
  const { financeSummary, transactions, addTransaction } = useStoreData();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Embalagens & Envio',
    amount: '',
    description: '',
    payment_method: 'Pix'
  });

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount) return;
    await addTransaction({
      type: 'despesa',
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description || expenseForm.category,
      payment_method: expenseForm.payment_method
    });
    setExpenseForm({
      category: 'Embalagens & Envio',
      amount: '',
      description: '',
      payment_method: 'Pix'
    });
    setIsExpenseModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Bar */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px 24px',
        border: '1px solid rgba(41,69,31,0.08)', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)' }}>
            Controle Financeiro & Rentabilidade
          </span>
          <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
            Fluxo de Caixa & Demonstração de Resultados (DRE)
          </h2>
        </div>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          style={{
            backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca',
            padding: '10px 18px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Plus size={16} /> Lançar Despesa
        </button>
      </div>

      {/* DRE KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Receita Bruta */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-muted)', textTransform: 'uppercase' }}>Receita Bruta</span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#166534' }}>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--snack-green-dark)' }}>
            R$ {financeSummary.receitaBruta?.toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '4px' }}>
            Total de vendas faturadas
          </div>
        </div>

        {/* CPV (Custo dos Produtos) */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-muted)', textTransform: 'uppercase' }}>Custo Mercadorias (CPV)</span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#92400e' }}>
              <Receipt size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309' }}>
            - R$ {financeSummary.custoTotal?.toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '4px' }}>
            Custo direto dos frascos
          </div>
        </div>

        {/* Despesas Extras */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--snack-muted)', textTransform: 'uppercase' }}>Despesas Operacionais</span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#991b1b' }}>
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626' }}>
            - R$ {financeSummary.despesasExtras?.toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--snack-muted)', marginTop: '4px' }}>
            Embalagens, fretes, tráfego
          </div>
        </div>

        {/* Lucro Líquido Real */}
        <div style={{ backgroundColor: '#FAF8F2', padding: '20px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.18)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-green-dark)', textTransform: 'uppercase' }}>Lucro Líquido Real</span>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--snack-green-dark)', color: 'var(--snack-gold)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--snack-green-dark)' }}>
            R$ {financeSummary.lucroLiquido?.toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700', marginTop: '4px' }}>
            Margem Líquida: {financeSummary.margem}%
          </div>
        </div>

      </div>

      {/* Transactions Ledger */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(41,69,31,0.08)', backgroundColor: '#FAF8F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
            Extrato de Movimentações Financeiras
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--snack-muted)' }}>
            {transactions.length} registros no período
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(41,69,31,0.08)', color: 'var(--snack-muted)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', backgroundColor: '#FFFFFF' }}>
                <th style={{ padding: '12px 20px' }}>Tipo</th>
                <th style={{ padding: '12px 14px' }}>Descrição</th>
                <th style={{ padding: '12px 14px' }}>Categoria</th>
                <th style={{ padding: '12px 14px' }}>Meio</th>
                <th style={{ padding: '12px 14px' }}>Data</th>
                <th style={{ padding: '12px 20px', textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--snack-muted)' }}>
                    Nenhuma movimentação financeira lançada.
                  </td>
                </tr>
              ) : (
                transactions.map(tx => {
                  const isIncome = tx.type === 'receita';
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(41,69,31,0.04)' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px',
                          backgroundColor: isIncome ? '#dcfce7' : '#fee2e2',
                          color: isIncome ? '#166534' : '#991b1b', textTransform: 'uppercase'
                        }}>
                          {isIncome ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--snack-text)' }}>
                        {tx.description}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--snack-muted)', fontSize: '12px' }}>
                        {tx.category}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--snack-text)', fontSize: '12px' }}>
                        {tx.payment_method || 'Pix'}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--snack-muted)', fontSize: '12px' }}>
                        {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '800', color: isIncome ? '#166534' : '#dc2626' }}>
                        {isIncome ? '+' : '-'} R$ {parseFloat(tx.amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          backgroundColor: 'rgba(23, 43, 20, 0.45)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '480px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.2)', border: '1px solid rgba(41,69,31,0.12)'
          }}>
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid rgba(41,69,31,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF8F2'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
                Lançar Despesa Operacional
              </h3>
              <button onClick={() => setIsExpenseModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--snack-muted)' }}>✕</button>
            </div>

            <form onSubmit={handleAddExpense} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                  Categoria da Despesa
                </label>
                <select
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', backgroundColor: '#fff' }}
                >
                  <option value="Embalagens & Envio">Embalagens & Envio</option>
                  <option value="Tráfego & Anúncios">Tráfego & Anúncios (Meta / Google)</option>
                  <option value="Combustível / Frete">Combustível / Frete Motoboy BH</option>
                  <option value="Taxas Bancárias">Taxas Bancárias / Gateway</option>
                  <option value="Outros">Outras Despesas</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                  Descrição / Motivo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Compra de 100 caixas de envio"
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>
                  Forma de Pagamento
                </label>
                <select
                  value={expenseForm.payment_method}
                  onChange={e => setExpenseForm({ ...expenseForm, payment_method: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', backgroundColor: '#fff' }}
                >
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', background: 'transparent', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Registrar Saída
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
