import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => apiService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If no user is logged in, default to null or stay logged in
    const user = apiService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiService.login(email, password);
      if (res.success) {
        setCurrentUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Falha no login.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await apiService.register(userData);
      if (res.success) {
        setCurrentUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Falha no cadastro.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setCurrentUser(null);
  };

  // Quick switch role utility for immediate testing and verification
  const switchRole = (newRole) => {
    if (!currentUser) {
      const demoUser = {
        id: 99,
        name: newRole === 'admin' ? 'Administrador Snack Store' : newRole === 'gerente' ? 'Gerente de Estoque' : newRole === 'revendedor' ? 'Camila Revendedora VIP' : 'Cliente Vip',
        email: `${newRole}@snackstorebh.com.br`,
        role: newRole,
        phone: '553175650503'
      };
      setCurrentUser(demoUser);
      localStorage.setItem('snack_store_auth_user', JSON.stringify(demoUser));
      return;
    }
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    localStorage.setItem('snack_store_auth_user', JSON.stringify(updated));
  };

  const impersonateUser = (targetUser) => {
    if (!targetUser) return;
    const { password, password_hash, ...safe } = targetUser;
    setCurrentUser(safe);
    localStorage.setItem('snack_store_auth_user', JSON.stringify(safe));
  };

  const role = currentUser?.role || 'visitante';
  const isAdmin = role === 'admin';
  const isManager = role === 'gerente';
  const isReseller = role === 'revendedor';
  const isStaff = isAdmin || isManager;
  const isCustomer = role === 'comprador' || role === 'revendedor';

  return (
    <AuthContext.Provider value={{
      currentUser,
      role,
      isAdmin,
      isManager,
      isReseller,
      isStaff,
      isCustomer,
      login,
      register,
      logout,
      switchRole,
      impersonateUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
