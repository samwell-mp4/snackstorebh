import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, Users, Plus, Shield, Check, Lock, Unlock } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { currentUser, switchRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'comprador'
  });
  const [feedback, setFeedback] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    await apiService.updateUserRole(userId, newRole);
    loadUsers();
    setFeedback(`Nível de acesso atualizado para "${newRole}" com sucesso.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ativo' ? 'bloqueado' : 'ativo';
    await apiService.updateUserStatus(userId, nextStatus);
    loadUsers();
    setFeedback(`Status do usuário alterado para "${nextStatus}".`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    const res = await apiService.register(newUser);
    if (res.success) {
      loadUsers();
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', password: '', phone: '', role: 'comprador' });
      setFeedback('Usuário cadastrado com sucesso!');
      setTimeout(() => setFeedback(''), 3000);
    } else {
      alert(res.message);
    }
  };

  const roleColors = {
    admin: { bg: '#dbeafe', text: '#1e40af', label: 'Administrador' },
    gerente: { bg: '#fef3c7', text: '#92400e', label: 'Gerente' },
    comprador: { bg: '#dcfce7', text: '#166534', label: 'Comprador (Cliente)' }
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
            Controle de Níveis de Acesso (RBAC)
          </span>
          <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--snack-green-dark)' }}>
            Usuários & Permissões do Sistema
          </h2>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF', border: 'none',
            padding: '10px 18px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      {feedback && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} /> {feedback}
        </div>
      )}

      {/* Role Explanations Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        
        {/* Admin Card */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: '#dbeafe', color: '#1e40af' }}>
              <ShieldCheck size={16} />
            </div>
            <strong style={{ fontSize: '14px', color: 'var(--snack-green-dark)' }}>Administrador (admin)</strong>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--snack-muted)', margin: 0, lineHeight: '1.5' }}>
            Acesso total irrestrito: Catálogo, estoque, financeiro completo, lucros, usuários, papéis e conexão PostgreSQL.
          </p>
        </div>

        {/* Gerente Card */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: '#fef3c7', color: '#92400e' }}>
              <UserCheck size={16} />
            </div>
            <strong style={{ fontSize: '14px', color: 'var(--snack-green-dark)' }}>Gerente (gerente)</strong>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--snack-muted)', margin: 0, lineHeight: '1.5' }}>
            Operação diária: Gestão de produtos, reposição de estoque, separação e atualização de status de pedidos.
          </p>
        </div>

        {/* Comprador Card */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid rgba(41,69,31,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#166534' }}>
              <Users size={16} />
            </div>
            <strong style={{ fontSize: '14px', color: 'var(--snack-green-dark)' }}>Comprador (comprador)</strong>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--snack-muted)', margin: 0, lineHeight: '1.5' }}>
            Cliente da loja: Navega pelo site, compra fragrâncias, acessa o painel do cliente e acompanha seus pedidos.
          </p>
        </div>

      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(41,69,31,0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(41,69,31,0.08)', backgroundColor: '#FAF8F2' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--snack-green-dark)' }}>
            Contas Cadastradas ({users.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(41,69,31,0.08)', color: 'var(--snack-muted)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', backgroundColor: '#FFFFFF' }}>
                <th style={{ padding: '14px 20px' }}>Usuário / E-mail</th>
                <th style={{ padding: '14px 14px' }}>Telefone</th>
                <th style={{ padding: '14px 14px' }}>Nível de Acesso (Role)</th>
                <th style={{ padding: '14px 14px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isCurrent = currentUser?.email?.toLowerCase() === u.email?.toLowerCase();
                const roleConfig = roleColors[u.role] || roleColors.comprador;
                const isBlocked = u.status === 'bloqueado';

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(41,69,31,0.04)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--snack-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {u.name}
                        {isCurrent && (
                          <span style={{ fontSize: '10px', backgroundColor: 'var(--snack-green-dark)', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>Você</span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--snack-muted)' }}>
                        {u.email}
                      </div>
                    </td>

                    <td style={{ padding: '14px 14px', color: 'var(--snack-text)', fontSize: '12px' }}>
                      {u.phone || '—'}
                    </td>

                    <td style={{ padding: '14px 14px' }}>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        style={{
                          padding: '6px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '700',
                          border: 'none', backgroundColor: roleConfig.bg, color: roleConfig.text, cursor: 'pointer'
                        }}
                      >
                        <option value="admin">Administrador</option>
                        <option value="gerente">Gerente</option>
                        <option value="comprador">Comprador</option>
                      </select>
                    </td>

                    <td style={{ padding: '14px 14px' }}>
                      <span style={{
                        display: 'inline-block', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '99px',
                        backgroundColor: isBlocked ? '#fee2e2' : '#dcfce7',
                        color: isBlocked ? '#991b1b' : '#166534', textTransform: 'uppercase'
                      }}>
                        {u.status || 'ativo'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status || 'ativo')}
                        disabled={isCurrent}
                        title={isBlocked ? 'Ativar conta' : 'Bloquear conta'}
                        style={{
                          background: 'none', border: '1px solid rgba(41,69,31,0.2)', padding: '6px 10px',
                          borderRadius: '6px', fontSize: '11px', cursor: isCurrent ? 'not-allowed' : 'pointer',
                          opacity: isCurrent ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        {isBlocked ? <Unlock size={13} /> : <Lock size={13} />}
                        <span>{isBlocked ? 'Desbloquear' : 'Bloquear'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isAddModalOpen && (
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
                Novo Usuário do Sistema
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateUser} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="carlos@snackstorebh.com.br"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>Senha Provisória *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>Telefone WhatsApp</label>
                <input
                  type="text"
                  placeholder="31988887777"
                  value={newUser.phone}
                  onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--snack-text)', display: 'block', marginBottom: '4px' }}>Nível de Permissão (Role) *</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', backgroundColor: '#fff' }}
                >
                  <option value="comprador">Comprador (Cliente)</option>
                  <option value="gerente">Gerente de Operações</option>
                  <option value="admin">Administrador Geral</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', background: 'transparent', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--snack-green-dark)', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Criar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
