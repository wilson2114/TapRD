import React, { useState, useEffect } from 'react';
import { getClientBySlug, fetchClientBySlug, getPublicClientData, incrementClientViews } from '../services/clientService';
import { ClientProfile } from '../components/ClientProfile';
import { DigitalProfile } from '../components/DigitalProfile';
import { DEMO_PROFILES } from '../data/mockData';
import { Client } from '../types';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProfilePageProps {
  slug: string;
  onNavigateHome: () => void;
  onSelectDemoProfile: (slug: string) => void;
}

export function ProfilePage({ slug, onNavigateHome, onSelectDemoProfile }: ProfilePageProps) {
  // Normalizar el slug solicitado
  const cleanSlug = slug.toLowerCase().replace(/^\/p\//, '').replace(/^\/demo\//, '').trim();

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Consultar en Cloud Firestore o memoria
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchClientBySlug(cleanSlug)
      .then((fetched) => {
        if (isMounted) {
          setClient(fetched);
          setIsLoading(false);
          if (fetched && fetched.status === 'active') {
            incrementClientViews(fetched.id);
          }
        }
      })
      .catch((err) => {
        console.warn('Aviso consultando perfil en Firestore:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cleanSlug]);

  // Pantalla de carga estética mientras consulta Firestore
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30 animate-pulse">
          <span>T</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>Cargando perfil digital NFC...</span>
        </div>
      </div>
    );
  }

  // 1. Si encontramos el cliente y está INACTIVO
  if (client && client.status === 'inactive') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white">Perfil temporalmente inactivo</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              El perfil de <strong className="text-slate-200">{client.businessName}</strong> ha sido pausado. Si eres el propietario, comunícate con el soporte o ingresa al panel administrativo de TapRD.
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

  // 2. Si encontramos el cliente activo en Firestore o memoria:
  if (client) {
    const publicData = getPublicClientData(client) as Client;
    return (
      <ClientProfile
        client={publicData}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  // 2. Fallback a los perfiles de demostración de mockData si coincide el alias
  let demoProfile = DEMO_PROFILES[cleanSlug];
  if (!demoProfile) {
    if (cleanSlug === 'barberia' || cleanSlug === 'wilson') {
      demoProfile = DEMO_PROFILES['barberia-wilson'];
    } else if (cleanSlug === 'restaurante' || cleanSlug === 'bistro') {
      demoProfile = DEMO_PROFILES['restaurante'];
    } else if (cleanSlug === 'inmobiliaria' || cleanSlug === 'aura') {
      demoProfile = DEMO_PROFILES['inmobiliaria'];
    }
  }

  if (demoProfile) {
    return (
      <DigitalProfile
        profile={demoProfile}
        onNavigateHome={onNavigateHome}
        onSelectDemoProfile={onSelectDemoProfile}
      />
    );
  }

  // 3. Generación dinámica de perfil para cualquier slug nuevo
  const formattedTitle = cleanSlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const dynamicClient: Client = {
    id: `dyn-${cleanSlug}`,
    ownerName: 'Equipo Administrativo',
    businessName: formattedTitle || 'Negocio Registrado',
    slug: cleanSlug,
    category: 'Comercio Profesional',
    description: `Perfil digital verificado de ${formattedTitle}. Contacta por WhatsApp o guarda nuestros datos con un solo toque.`,
    phone: '+1 809-555-0199',
    whatsapp: '18095550199',
    email: `contacto@${cleanSlug}.demo`,
    city: 'Santo Domingo',
    address: 'Av. 27 de Febrero #200, Piantini',
    avatarInitials: formattedTitle.substring(0, 2).toUpperCase() || 'TR',
    avatarBgColor: 'bg-blue-600',
    coverGradient: 'from-slate-900 via-blue-950 to-slate-900',
    productAssigned: 'Tap Card',
    status: 'active',
    socialLinks: {
      instagram: `${cleanSlug}.rd`,
      website: `https://${cleanSlug}.taprd.com`
    },
    services: [
      {
        id: 'srv-dyn-1',
        name: 'Atención Personalizada y Consulta',
        description: 'Asesoría directa y cotización sin costo adicional.',
        price: 'Gratis'
      },
      {
        id: 'srv-dyn-2',
        name: 'Servicio Estándar Comercial',
        description: 'Solución completa con entrega rápida en República Dominicana.',
        price: 'RD$1,500'
      }
    ],
    hours: [
      { day: 'Lunes a Viernes', isOpen: true, display: '8:30 AM – 6:30 PM' },
      { day: 'Sábados', isOpen: true, display: '9:00 AM – 1:00 PM' },
      { day: 'Domingos', isOpen: false, display: 'Cerrado' }
    ],
    settings: {
      showPhone: true,
      showWhatsapp: true,
      showInstagram: true,
      showFacebook: true,
      showTikTok: false,
      showAddress: true,
      showHours: true,
      showServices: true,
      showReviews: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return (
    <ClientProfile
      client={dynamicClient}
      onNavigateHome={onNavigateHome}
    />
  );
}
