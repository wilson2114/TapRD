import React, { useState, useEffect, useRef } from 'react';
import { useClientAuth } from '../../hooks/useClientAuth';
import { ClientLayout } from '../../components/client/ClientLayout';
import { ClientBankAccount } from '../../types/client';
import { DOMINICAN_BANKS, ACCOUNT_TYPES, CURRENCIES } from '../../config/bankConstants';
import {
  Landmark,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

interface ClientBankAccountsPageProps {
  onNavigate: (path: string) => void;
}

export function ClientBankAccountsPage({ onNavigate }: ClientBankAccountsPageProps) {
  const { client, updateClient } = useClientAuth();
  const syncedClientIdRef = useRef<string | null>(client?.id || null);

  const [bankAccounts, setBankAccounts] = useState<ClientBankAccount[]>(() => client?.bankAccounts || []);
  const [showOnProfile, setShowOnProfile] = useState<boolean>(() => client?.settings?.showBankAccounts !== false);

  useEffect(() => {
    if (client && client.id !== syncedClientIdRef.current) {
      syncedClientIdRef.current = client.id;
      setBankAccounts(client.bankAccounts || []);
      setShowOnProfile(client.settings?.showBankAccounts !== false);
    }
  }, [client]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [bankName, setBankName] = useState(DOMINICAN_BANKS[0].name);
  const [customBankName, setCustomBankName] = useState('');
  const [accountType, setAccountType] = useState<string>(ACCOUNT_TYPES[0]);
  const [currency, setCurrency] = useState<'DOP' | 'USD'>('DOP');
  const [accountNumber, setAccountNumber] = useState('');
  const [holder, setHolder] = useState(client?.businessName || client?.ownerName || '');
  const [rncOrCedula, setRncOrCedula] = useState('');
  const [notes, setNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!client) return null;

  const persistAccounts = async (
    nextAccounts: ClientBankAccount[],
    previousAccounts: ClientBankAccount[],
    nextShowOnProfile: boolean = showOnProfile
  ): Promise<boolean> => {
    setErrorMessage(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const updated = await updateClient({
        bankAccounts: nextAccounts,
        settings: {
          ...client.settings,
          showBankAccounts: nextShowOnProfile
        }
      });

      if (updated) {
        setBankAccounts(updated.bankAccounts || nextAccounts);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        return true;
      } else {
        setBankAccounts(previousAccounts);
        setErrorMessage('No se pudieron guardar las cuentas bancarias.');
        return false;
      }
    } catch (err: any) {
      setBankAccounts(previousAccounts);
      setErrorMessage(err.message || 'Error guardando las cuentas bancarias.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setBankName(DOMINICAN_BANKS[0].name);
    setCustomBankName('');
    setAccountType(ACCOUNT_TYPES[0]);
    setCurrency('DOP');
    setAccountNumber('');
    setHolder(client.businessName || client.ownerName || '');
    setRncOrCedula('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalBank = bankName === 'Otro banco o cooperativa'
      ? (customBankName.trim() || 'Otro banco')
      : bankName;

    if (!accountNumber.trim()) {
      setErrorMessage('El número de cuenta es obligatorio.');
      return;
    }

    if (!holder.trim()) {
      setErrorMessage('El nombre del titular de la cuenta es obligatorio.');
      return;
    }

    const previousAccounts = bankAccounts;
    let nextAccounts: ClientBankAccount[];

    if (editingId) {
      nextAccounts = bankAccounts.map(acc =>
        acc.id === editingId
          ? {
              ...acc,
              bank: finalBank,
              accountType,
              currency,
              accountNumber: accountNumber.trim(),
              holder: holder.trim(),
              rncOrCedula: rncOrCedula.trim() || undefined,
              notes: notes.trim() || undefined
            }
          : acc
      );
    } else {
      const newAcc: ClientBankAccount = {
        id: `bnk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        bank: finalBank,
        accountType,
        currency,
        accountNumber: accountNumber.trim(),
        holder: holder.trim(),
        rncOrCedula: rncOrCedula.trim() || undefined,
        notes: notes.trim() || undefined
      };
      nextAccounts = [...bankAccounts, newAcc];
    }

    setBankAccounts(nextAccounts);
    const saved = await persistAccounts(nextAccounts, previousAccounts);
    if (saved) {
      resetForm();
    }
  };

  const handleEdit = (acc: ClientBankAccount) => {
    setEditingId(acc.id);
    const isKnown = DOMINICAN_BANKS.some(b => b.name === acc.bank);
    if (isKnown) {
      setBankName(acc.bank);
      setCustomBankName('');
    } else {
      setBankName('Otro banco o cooperativa');
      setCustomBankName(acc.bank);
    }
    setAccountType(acc.accountType || 'Cuenta de Ahorros');
    setCurrency((acc.currency as 'DOP' | 'USD') || 'DOP');
    setAccountNumber(acc.accountNumber || '');
    setHolder(acc.holder || '');
    setRncOrCedula(acc.rncOrCedula || '');
    setNotes(acc.notes || '');
    setErrorMessage(null);
  };

  const handleDelete = async (id: string) => {
    const previousAccounts = bankAccounts;
    const nextAccounts = bankAccounts.filter(a => a.id !== id);
    setBankAccounts(nextAccounts);
    if (editingId === id) {
      resetForm();
    }
    await persistAccounts(nextAccounts, previousAccounts);
  };

  const handleToggleVisibility = async () => {
    const nextShow = !showOnProfile;
    setShowOnProfile(nextShow);
    await persistAccounts(bankAccounts, bankAccounts, nextShow);
  };

  return (
    <ClientLayout
      currentPath="/cliente/cuentas"
      onNavigate={onNavigate}
      title="Cuentas Bancarias & Transferencias"
      subtitle="Agrega las cuentas de tu negocio para que tus clientes puedan copiarse los datos y pagarte por transferencia."
      actions={
        <button
          type="button"
          disabled={isSaving}
          onClick={handleToggleVisibility}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer disabled:opacity-50 ${
            showOnProfile
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
        >
          {showOnProfile ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{showOnProfile ? 'Visible en perfil' : 'Oculto en perfil'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>¡Cuentas bancarias guardadas! Ya se reflejan en tu tarjeta NFC y perfil público.</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario agregar / editar cuenta */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  {editingId ? 'Editar Cuenta Bancaria' : 'Agregar Cuenta Bancaria'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cuentas en Pesos (DOP) o Dólares (USD) para transferencias ACH, LBTR o Pago al Instante.
                </p>
              </div>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Banco / Entidad</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  {DOMINICAN_BANKS.map((b) => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {bankName === 'Otro banco o cooperativa' && (
                <div className="sm:col-span-7 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nombre del banco o cooperativa</label>
                  <input
                    type="text"
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    placeholder="Ej. Cooperativa San José"
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              )}

              <div className={`${bankName === 'Otro banco o cooperativa' ? 'sm:col-span-6' : 'sm:col-span-4'} space-y-1`}>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de cuenta</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className={`${bankName === 'Otro banco o cooperativa' ? 'sm:col-span-6' : 'sm:col-span-3'} space-y-1`}>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'DOP' | 'USD')}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-6 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Número de cuenta <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Ej. 812-345678-9"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-6 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Titular de la cuenta <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={holder}
                  onChange={(e) => setHolder(e.target.value)}
                  placeholder="Nombre de la empresa o persona"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="sm:col-span-6 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">RNC o Cédula (opcional)</label>
                <input
                  type="text"
                  value={rncOrCedula}
                  onChange={(e) => setRncOrCedula(e.target.value)}
                  placeholder="Ej. 1-31-12345-6 o 001-1234567-8"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="sm:col-span-6 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nota / Instrucción (opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Enviar comprobante por WhatsApp"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 text-cyan-400" />
                )}
                <span>{isSaving ? 'Guardando...' : editingId ? 'Actualizar cuenta bancaria' : 'Agregar cuenta bancaria'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Lista de cuentas registradas */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Cuentas Registradas ({bankAccounts.length})
            </h2>
          </div>

          {bankAccounts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Landmark className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-bold">No tienes cuentas bancarias registradas aún.</p>
              <p className="text-[11px]">Agrega una cuenta arriba para mostrarla en tu tarjeta digital.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bankAccounts.map((acc) => {
                const isUsd = acc.currency === 'USD';
                return (
                  <div
                    key={acc.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          {acc.bank}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          isUsd
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {isUsd ? 'USD ($)' : 'DOP (RD$)'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {acc.accountType}
                        </span>
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                        Cuenta: {acc.accountNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Titular: <span className="font-bold text-slate-700 dark:text-slate-300">{acc.holder}</span>
                        {acc.rncOrCedula ? ` • RNC/Cédula: ${acc.rncOrCedula}` : ''}
                      </p>
                      {acc.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">{acc.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(acc)}
                        className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Editar cuenta"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(acc.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Eliminar cuenta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
