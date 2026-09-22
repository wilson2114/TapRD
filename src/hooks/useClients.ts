import { useState, useEffect, useCallback } from 'react';
import { Client, ClientStatus } from '../types/client';
import {
  subscribeToClients,
  fetchClients,
  createClient,
  updateClient,
  deactivateClient,
  toggleClientStatus,
  deleteClient,
  getAdminStats
} from '../services/clientService';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCount: 0,
    pendingCount: 0,
    inactiveCount: 0
  });

  const updateStatsFromList = useCallback((list: Client[]) => {
    setStats({
      totalClients: list.length,
      activeCount: list.filter(c => c.status === 'active').length,
      pendingCount: list.filter(c => c.status === 'pending').length,
      inactiveCount: list.filter(c => c.status === 'inactive').length
    });
  }, []);

  useEffect(() => {
    setLoading(true);

    // Suscribirse a cambios en tiempo real
    const unsubscribe = subscribeToClients((updatedClients) => {
      setClients(updatedClients);
      updateStatsFromList(updatedClients);
      setLoading(false);
    });

    // Carga inicial explícita
    fetchClients()
      .then((data) => {
        setClients(data);
        updateStatsFromList(data);
      })
      .catch((err) => {
        console.warn('Aviso en fetchClients inicial:', err);
        setError('Error al sincronizar clientes.');
      })
      .finally(() => {
        setLoading(false);
      });

    return () => unsubscribe();
  }, [updateStatsFromList]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClients();
      setClients(data);
      updateStatsFromList(data);
      const newStats = await getAdminStats();
      setStats(newStats);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar clientes');
    } finally {
      setLoading(false);
    }
  }, [updateStatsFromList]);

  const create = useCallback(async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient = await createClient(data);
    return newClient;
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Client>) => {
    const updated = await updateClient(id, updates);
    return updated;
  }, []);

  const deactivate = useCallback(async (id: string) => {
    const res = await deactivateClient(id);
    return res;
  }, []);

  const setStatus = useCallback(async (id: string, status: ClientStatus) => {
    const res = await toggleClientStatus(id, status);
    return res;
  }, []);

  const remove = useCallback(async (id: string, hardDelete = false) => {
    const res = await deleteClient(id, hardDelete);
    return res;
  }, []);

  return {
    clients,
    loading,
    error,
    stats,
    refresh,
    create,
    update,
    deactivate,
    setStatus,
    remove
  };
}
