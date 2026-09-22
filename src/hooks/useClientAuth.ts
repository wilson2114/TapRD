import { useState, useEffect, useCallback } from 'react';
import { Client } from '../types/client';
import { AppUser } from '../types/user';
import { 
  getCurrentClient, 
  getCurrentUser, 
  logoutClient, 
  onAuthStateChanged,
  CLIENT_SESSION_KEY
} from '../services/authService';
import { updateClientByOwner } from '../services/clientService';

export function useClientAuth() {
  const [client, setClient] = useState<Client | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshClient = useCallback(async () => {
    try {
      const currentClient = await getCurrentClient();
      setClient(currentClient);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.warn('Error refrescando cliente:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshClient();

    // Escuchar cambios de autenticación
    const unsubscribe = onAuthStateChanged((newUser: AppUser | null) => {
      setUser(newUser);
      if (newUser) {
        getCurrentClient().then(setClient);
      } else {
        setClient(null);
      }
    });

    return () => unsubscribe();
  }, [refreshClient]);

  const handleLogout = async () => {
    await logoutClient();
    setClient(null);
    setUser(null);
  };

  const handleUpdate = async (updates: Partial<Client>): Promise<Client | null> => {
    if (!client) return null;
    const updated = await updateClientByOwner(client.id, updates);
    if (updated) {
      setClient(updated);
    }
    return updated;
  };

  const isSuspended = client?.accessStatus === 'suspended';
  const isAuthenticated = Boolean(user && client);

  return {
    client,
    user,
    loading,
    isAuthenticated,
    isSuspended,
    refreshClient,
    logout: handleLogout,
    updateClient: handleUpdate
  };
}
