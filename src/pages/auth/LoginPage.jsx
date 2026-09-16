import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    password: '',
    phone: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegisterMode) {
      const res = await register({
        name: formData.name,
        email: formData.identifier,
        password: formData.password,
        phone: formData.phone
      });
      if (res.success) {
        navigate('/minha-conta');
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = await login(formData.identifier, formData.password);
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

  return (
    <div style={{ minHeight: '85vh', backgroundColor: '#FAF8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '420px',
        padding: '36px', boxShadow: '0 10px 40px rgba(23,43,20,0.05)', border: '1px solid rgba(41,69,31,0.1)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '3px', color: 'var(--snack-green-dark)', fontFamily: 'var(--font-display)' }}>
              SNACK STORE
            </span>
          </Link>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--snack-green-dark)', marginTop: '8px', marginBottom: '4px' }}>
            {isRegisterMode ? 'Criar Conta' : 'Acessar Conta'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--snack-muted)', margin: 0 }}>
            {isRegisterMode ? 'Cadastre seus dados para compras e envios' : 'Entre com suas credenciais de acesso'}
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
              {isRegisterMode ? 'E-mail' : 'Usuário ou E-mail'}
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--snack-muted)' }} />
              <input
                type="text"
                required
                placeholder={isRegisterMode ? "seu.email@exemplo.com" : "admin ou seu e-mail"}
                value={formData.identifier}
                onChange={e => setFormData({ ...formData, identifier: e.target.value })}
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
                WhatsApp
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
              marginTop: '6px', backgroundColor: 'var(--snack-green-dark)', color: '#FFFFFF',
              padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              textTransform: 'uppercase', letterSpacing: '1px'
            }}
          >
            <span>{isRegisterMode ? 'Criar Conta' : 'Entrar'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={() => { setIsRegisterMode(!isRegisterMode); setErrorMsg(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--snack-green-dark)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            {isRegisterMode ? 'Já possui conta? Faça login' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>

      </div>
    </div>
  );
}
