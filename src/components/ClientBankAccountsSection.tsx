import React, { useState } from 'react';
import { ClientBankAccount } from '../types/client';
import { CreditCard, Copy, Check, Building2, Info, Landmark } from 'lucide-react';

interface ClientBankAccountsSectionProps {
  accounts?: ClientBankAccount[];
  legacyBankInfo?: {
    bank: string;
    accountType: string;
    accountNumber: string;
    holder: string;
    rncOrCedula?: string;
  };
  className?: string;
}

export function ClientBankAccountsSection({
  accounts = [],
  legacyBankInfo,
  className = ''
}: ClientBankAccountsSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Normalizar cuentas bancarias a renderizar
  const normalizedAccounts: ClientBankAccount[] = React.useMemo(() => {
    if (accounts && accounts.length > 0) {
      return accounts;
    }
    if (legacyBankInfo && legacyBankInfo.bank && legacyBankInfo.accountNumber) {
      return [
        {
          id: 'legacy-bank',
          bank: legacyBankInfo.bank,
          accountType: legacyBankInfo.accountType || 'Cuenta de Ahorros',
          accountNumber: legacyBankInfo.accountNumber,
          currency: 'DOP',
          holder: legacyBankInfo.holder || '',
          rncOrCedula: legacyBankInfo.rncOrCedula
        }
      ];
    }
    return [];
  }, [accounts, legacyBankInfo]);

  if (normalizedAccounts.length === 0) {
    return null;
  }

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      id="section-client-bank-accounts"
      className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Cuentas Bancarias & Transferencias
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Datos para transferencias directas (ACH, LBTR o Pago al Instante)
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
          {normalizedAccounts.length} {normalizedAccounts.length === 1 ? 'cuenta' : 'cuentas'}
        </span>
      </div>

      <div className="space-y-3">
        {normalizedAccounts.map((acc, index) => {
          const accNumberKey = `num-${acc.id || index}`;
          const rncKey = `rnc-${acc.id || index}`;
          const isUsd = acc.currency === 'USD';

          return (
            <div
              key={acc.id || index}
              className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3 transition-colors"
            >
              {/* Header de la cuenta: Banco + Moneda + Tipo */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {acc.bank}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md border font-mono ${
                        isUsd
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800'
                      }`}
                    >
                      {isUsd ? 'US$ Dólares' : 'RD$ Pesos'}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {acc.accountType}
                  </p>
                </div>
              </div>

              {/* Número de cuenta con botón copiar destacado */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-900/90 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs gap-2">
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Número de Cuenta
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-wide select-all">
                    {acc.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(acc.accountNumber, accNumberKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    copiedKey === accNumberKey
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                  title="Copiar número de cuenta"
                >
                  {copiedKey === accNumberKey ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Titular y RNC / Cédula */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {acc.holder && (
                  <div className="bg-white/60 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                      Titular
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {acc.holder}
                    </span>
                  </div>
                )}

                {acc.rncOrCedula && (
                  <div className="bg-white/60 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        RNC / Cédula
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 select-all truncate block">
                        {acc.rncOrCedula}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(acc.rncOrCedula!, rncKey)}
                      className={`p-1.5 rounded-lg text-xs transition-colors shrink-0 cursor-pointer ${
                        copiedKey === rncKey
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                      }`}
                      title="Copiar RNC / Cédula"
                    >
                      {copiedKey === rncKey ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Nota o instrucción adicional */}
              {acc.notes && (
                <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 font-medium">
                  <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{acc.notes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
