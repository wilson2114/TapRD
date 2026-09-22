import { useState, useEffect, useCallback } from 'react';
import {
  AppUser,
  onAuthStateChanged,
  getCurrentUser,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
  isAuthorizedAdminEmail
} from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(() => getCurrentUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Sincronizar estado inicial
    setUser(getCurrentUser());
    setLoading(false);

    // Escuchar cambios de autenticación
    const unsubscribe = onAuthStateChanged((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await loginAdmin(email, pass);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutAdmin();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await registerAdmin(name, email, pass);
      if (res.success && res.user) {
        setUser(res.user);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = Boolean(user);
  // Solo los correos autorizados por TapRD pueden tener privilegios de administrador
  const isAdmin = Boolean(
    user &&
    isAuthorizedAdminEmail(user.email) &&
    (user.role === 'admin' || user.role === 'superadmin' || user.role === 'owner' || user.role === 'ADMIN')
  );
  const isClient = Boolean(user && !isAdmin);

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isClient,
    login,
    logout,
    register
  };
}
