import React, { useEffect, useState } from 'react';
import { fetchClientBySlug, getCachedClientBySlug, incrementClientViews } from '../services/clientService';
import { trackAnalyticsEvent } from '../services/profileService';
import { resolveQrRedirectTarget, ResolvedQrTarget } from '../utils/qrRedirect';
import { Client } from '../types';
import { ProfilePage } from './ProfilePage';
import { Loader2, ShieldAlert, ArrowLeft, ExternalLink, QrCode } from 'lucide-react';

interface QrRedirectPageProps {
  slug: string;
  onNavigateHome: () => void;
  onSelectDemoProfile: (slug: string) => void;
}

export function QrRedirectPage({ slug, onNavigateHome, onSelectDemoProfile }: QrRedirectPageProps) {
  const cleanSlug = slug.toLowerCase().replace(/^\/q\//, '').replace(/\/+$/, '').trim();

  const [status, setStatus] = useState<'loading' | 'redirecting' | 'profile' | 'paused'>('loading');
  const [client, setClient] = useState<Client | null>(null);
  const [resolvedTarget, setResolvedTarget] = useState<ResolvedQrTarget | null>(null);

  useEffect(() => {
    let isMounted = true;
    let redirectTimer: number | undefined;

    const handleClient = (found: Client | null) => {
      if (!isMounted) return;

      if (!found) {
        setStatus('profile');
        return;
      }

      setClient(found);

      if (found.status === 'inactive' || found.profileStatus === 'inactive' || found.active === false) {
        setStatus('paused');
        return;
      }

      const target = resolveQrRedirectTarget(found);
      setResolvedTarget(target);

      if (target.isExternal && target.targetUrl) {
        incrementClientViews(found.id);
        trackAnalyticsEvent(found.id, 'qrScan', found.slug);
        setStatus('redirecting');
        const destination = target.targetUrl;
        redirectTimer = window.setTimeout(() => {
          window.location.replace(destination);
        }, 250);
      } else {
        trackAnalyticsEvent(found.id, 'qrScan', found.slug);
        setStatus('profile');
      }
    };

    fetchClientBySlug(cleanSlug)
      .then((fetched) => {
        if (fetched) {
          handleClient(fetched);
        } else {
          handleClient(getCachedClientBySlug(cleanSlug));
        }
      })
      .catch(() => {
        handleClient(getCachedClientBySlug(cleanSlug));
      });

    return () => {
      isMounted = false;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [cleanSlug]);

  if (status === 'profile') {
    return (
      <ProfilePage
        slug={cleanSlug}
        onNavigateHome={onNavigateHome}
        onSelectDemoProfile={onSelectDemoProfile}
      />
    );
  }

  if (status === 'paused' && client) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-white">Perfil temporalmente inactivo</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              El perfil de <strong className="text-slate-200">{client.businessName}</strong> ha sido pausado. Si eres el propietario, comunícate con soporte o ingresa al panel de TapRD.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </button>
        </div>
      </div>
    );
  }

  if (status === 'redirecting' && resolvedTarget?.targetUrl) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30">
            <QrCode className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Código QR Dinámico TapRD
            </p>
            <h1 className="text-lg font-black text-white">
              Redirigiendo a {resolvedTarget.label}...
            </h1>
            {client && (
              <p className="text-xs text-slate-400">{client.businessName}</p>
            )}
          </div>
          <a
            href={resolvedTarget.targetUrl}
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <span>Continuar ahora</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30 animate-pulse">
        <span>T</span>
      </div>
      <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        <span>Abriendo destino QR...</span>
      </div>
    </div>
  );
}
