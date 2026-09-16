import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, UserCheck, ShoppingBag, ArrowRight, Lock, Mail, User, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, switchRole, loading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegisterMode) {
      const res = await register(formData);
      if (res.success) {
        navigate('/minha-conta');
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        if (res.user.role === 'admin' || res.user.role === 'gerente') {
          navigate('/admin');
        } else {
          navigate('/minha-conta');
        }
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const handleDemoLogin = (role) => {
    switchRole(role);
    if (role === 'admin' || role === 'gerente') {
      navigate('/admin');
    } else {
      navigate('/minha-conta');
    }
  };

  return (
    <div style={{ minHeight: '90vh', backgroundColor: '#FAF8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '440px',
        padding: '36px', boxShadow: '0 10px 40px rgba(23,43,20,0.06)', border: '1px solid rgba(41,69,31,0.1)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '3px', color: 'var(--snack-green-dark)', fontFamily: 'var(--font-display)' }}>
              SNACK STORE
            </span>
          </Link>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--snack-green-dark)', marginTop: '8px', marginBottom: '4px' }}>
            {isRegisterMode ? 'Criar Nova Conta' : 'Acesse sua Conta'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--snack-muted)', margin: 0 }}>
            {isRegisterMode ? 'Cadastre-se para acompanhar seus pedidos em BH' : 'Painel administrativo e área de pedidos'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {isRegisterMode && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--snack-muted)', display: 'block', marginBottom: '4px' }}>
                Nome Completo
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--snack-muted)', display: 'block', marginBottom: '4px' }}>
              E-mail
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--snack-muted)', display: 'block', marginBottom: '4px' }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--snack-muted)', display: 'block', marginBottom: '4px' }}>
                WhatsApp para Avisos de Entrega
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
                <input
                  type="text"
                  placeholder="31999998888"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.2)', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px', backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF',
              padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              textTransform: 'uppercase', letterSpacing: '1px'
            }}
          >
            <span>{isRegisterMode ? 'Concluir Cadastro' : 'Entrar'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={() => { setIsRegisterMode(!isRegisterMode); setErrorMsg(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--snack-green-dark)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            {isRegisterMode ? 'Já possui cadastro? Faça login' : 'Não tem conta? Crie uma agora'}
          </button>
        </div>

        {/* DEMO ACCESS SECTION */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(41,69,31,0.08)' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--snack-gold)', display: 'block', textAlign: 'center', marginBottom: '12px' }}>
            ⚡ Acesso Rápido de Demonstração (Roles)
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => handleDemoLogin('admin')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)',
                backgroundColor: '#FAF8F2', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: 'var(--snack-green-dark)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="var(--snack-green-dark)" />
                <span>Entrar como Administrador Geral</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--snack-muted)' }}>Acesso Total →</span>
            </button>

            <button
              onClick={() => handleDemoLogin('gerente')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)',
                backgroundColor: '#FAF8F2', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#92400e'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={16} color="#92400e" />
                <span>Entrar como Gerente de Estoque</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--snack-muted)' }}>Operação →</span>
            </button>

            <button
              onClick={() => handleDemoLogin('comprador')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(41,69,31,0.15)',
                backgroundColor: '#FAF8F2', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#166534'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={16} color="#166534" />
                <span>Entrar como Cliente Comprador</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--snack-muted)' }}>Meus Pedidos →</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
