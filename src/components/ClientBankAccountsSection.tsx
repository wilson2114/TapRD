import React, { useState } from 'react';
import { ClientBankAccount } from '../types/client';
import { Copy, Check, Info, Landmark } from 'lucide-react';

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

function getBankAccent(bankName: string): {
  bar: string;
  badge: string;
  abbr: string;
} {
  const b = (bankName || '').toLowerCase();
  if (b.includes('popular')) {
    return {
      bar: 'from-blue-600 to-sky-500',
      badge: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/25',
      abbr: 'BP'
    };
  }
  if (b.includes('banreservas') || b.includes('reservas')) {
    return {
      bar: 'from-sky-500 to-cyan-500',
      badge: 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/25',
      abbr: 'BR'
    };
  }
  if (b.includes('bhd')) {
    return {
      bar: 'from-emerald-600 to-teal-500',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/25',
      abbr: 'BHD'
    };
  }
  if (b.includes('scotiabank') || b.includes('scotia')) {
    return {
      bar: 'from-rose-600 to-red-500',
      badge: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/25',
      abbr: 'SB'
    };
  }
  if (b.includes('santa cruz')) {
    return {
      bar: 'from-amber-500 to-orange-500',
      badge: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/25',
      abbr: 'BSC'
    };
  }
  if (b.includes('apap') || b.includes('popular de ahorros')) {
    return {
      bar: 'from-indigo-600 to-violet-500',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/25',
      abbr: 'APAP'
    };
  }
  if (b.includes('qik')) {
    return {
      bar: 'from-violet-600 to-fuchsia-500',
      badge: 'bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-400/25',
      abbr: 'QIK'
    };
  }
  if (b.includes('banesco')) {
    return {
      bar: 'from-teal-600 to-emerald-500',
      badge: 'bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-400/25',
      abbr: 'BN'
    };
  }
  const cleanWords = (bankName || 'BK').trim().split(/\s+/);
  const abbr = cleanWords.length > 1
    ? `${cleanWords[0][0] || ''}${cleanWords[1][0] || ''}`.toUpperCase()
    : (bankName || 'BK').slice(0, 2).toUpperCase();

  return {
    bar: 'from-slate-600 to-slate-500',
    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/15',
    abbr
  };
}

export function ClientBankAccountsSection({
  accounts = [],
  legacyBankInfo,
  className = ''
}: ClientBankAccountsSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
    <section
      id="section-client-bank-accounts"
      className={`bg-white dark:bg-slate-900/65 dark:backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-[0_6px_28px_-6px_rgba(15,23,42,0.07)] dark:shadow-[0_12px_36px_-8px_rgba(0,0,0,0.45)] p-5 space-y-4 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-400/20 flex items-center justify-center shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] dark:text-white">
              Cuentas Bancarias
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Transferencias directas ACH, LBTR o Pago al Instante
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-white/10 shrink-0">
          {normalizedAccounts.length} {normalizedAccounts.length === 1 ? 'cuenta' : 'cuentas'}
        </span>
      </div>

      <div className="space-y-3">
        {normalizedAccounts.map((acc, index) => {
          const accNumberKey = `num-${acc.id || index}`;
          const rncKey = `rnc-${acc.id || index}`;
          const isUsd = acc.currency === 'USD';
          const accent = getBankAccent(acc.bank);

          return (
            <div
              key={acc.id || index}
              className="relative overflow-hidden p-4 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-3 transition-all"
            >
              {/* Barra lateral de acento por entidad bancaria */}
              <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${accent.bar}`} />

              {/* Header de la cuenta: Badge de entidad + Banco + Moneda */}
              <div className="flex items-center justify-between gap-2 pl-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black border shrink-0 ${accent.badge}`}>
                    {accent.abbr}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A] dark:text-white truncate">
                      {acc.bank}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                      {acc.accountType}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border font-mono shrink-0 ${
                    isUsd
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/25'
                      : 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/25'
                  }`}
                >
                  {isUsd ? 'US$ USD' : 'RD$ DOP'}
                </span>
              </div>

              {/* Número de cuenta + botón Copiar grande táctil */}
              <div className="ml-2 flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200/90 dark:border-white/10 gap-2.5">
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Número de Cuenta
                  </span>
                  <span className="font-mono text-sm font-black text-[#0F172A] dark:text-white tracking-wide select-all break-all">
                    {acc.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(acc.accountNumber, accNumberKey)}
                  className={`min-h-[48px] w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                    copiedKey === accNumberKey
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                      : 'bg-[#0F172A] hover:bg-slate-800 text-white dark:bg-white/10 dark:hover:bg-white/15 dark:border dark:border-white/15'
                  }`}
                  title="Copiar número de cuenta"
                >
                  {copiedKey === accNumberKey ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar cuenta</span>
                    </>
                  )}
                </button>
              </div>

              {/* Titular y RNC / Cédula */}
              {(acc.holder || acc.rncOrCedula) && (
                <div className="ml-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {acc.holder && (
                    <div className="bg-white/80 dark:bg-white/[0.03] px-3 py-2.5 rounded-xl border border-slate-200/70 dark:border-white/10">
                      <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        Titular
                      </span>
                      <span className="font-bold text-[#0F172A] dark:text-slate-100 truncate block mt-0.5">
                        {acc.holder}
                      </span>
                    </div>
                  )}

                  {acc.rncOrCedula && (
                    <div className="bg-white/80 dark:bg-white/[0.03] px-3 py-2 rounded-xl border border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          RNC / Cédula
                        </span>
                        <span className="font-mono font-bold text-[#0F172A] dark:text-slate-100 select-all truncate block mt-0.5">
                          {acc.rncOrCedula}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(acc.rncOrCedula!, rncKey)}
                        className={`min-h-[44px] px-3 rounded-xl text-[11px] font-bold transition-all active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer ${
                          copiedKey === rncKey
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15'
                        }`}
                        title="Copiar RNC / Cédula"
                        aria-label="Copiar RNC o Cédula"
                      >
                        {copiedKey === rncKey ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Listo!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Nota o instrucción adicional */}
              {acc.notes && (
                <div className="ml-2 flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300 bg-amber-50/80 dark:bg-amber-500/10 p-2.5 rounded-xl border border-amber-200/70 dark:border-amber-400/20 font-medium">
                  <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{acc.notes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
