import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getClientById, createClient, updateClient, generateSlug } from '../../services/clientService';
import { uploadClientLogo, deleteClientLogo, validateLogoFile } from '../../services/storageService';
import { PUBLIC_BASE_URL, getWhatsAppUrl } from '../../config/constants';
import { Client, ClientService, ClientStatus, ClientSettings, ClientSocialLinks, ClientDayHours } from '../../types';
import { ProfileQRCode } from '../../components/admin/ProfileQRCode';
import { ClientProfile } from '../../components/ClientProfile';
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Edit2, 
  Upload, 
  Image as ImageIcon, 
  Globe, 
  Radio, 
  Info, 
  ExternalLink,
  Sparkles,
  Layers,
  X,
  Loader2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  UserCheck,
  UserX,
  Send,
  RefreshCw,
  Mail,
  Landmark,
  CreditCard
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
  createClientAccess,
  resendClientInvitation,
  suspendClientAccess,
  reactivateClientAccess
} from '../../services/clientAccessService';
import { ClientAccessStatus, ClientBankAccount } from '../../types/client';
import { DOMINICAN_BANKS, ACCOUNT_TYPES, CURRENCIES } from '../../config/bankConstants';

interface AdminClientFormPageProps {
  clientId?: string; // Si está presente, es modo edición
  onNavigate: (path: string) => void;
}

const DEFAULT_DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

const CATEGORIES = [
  'Barbería',
  'Restaurante',
  'Inmobiliaria',
  'Salón de belleza',
  'Consultorio Médico',
  'Estudio Legal',
  'Cafetería',
  'Taller & Mecánica',
  'Servicios Profesionales',
  'Comercio / Tienda',
  'Otro'
];

const CITIES = [
  'Santo Domingo',
  'Santiago de los Caballeros',
  'La Romana',
  'Punta Cana / Bávaro',
  'Puerto Plata',
  'San Cristóbal',
  'San Pedro de Macorís',
  'Higüey',
  'La Vega',
  'Bonao',
  'Las Terrenas / Samaná'
];

export function AdminClientFormPage({ clientId, onNavigate }: AdminClientFormPageProps) {
  const isEditing = Boolean(clientId);

  // Form states
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [manualSlugEdit, setManualSlugEdit] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('+1 809-555-0100');
  const [whatsapp, setWhatsapp] = useState('18095550100');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [address, setAddress] = useState('');
  const [productAssigned, setProductAssigned] = useState('Tap Card');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [logo, setLogo] = useState<string | undefined>(undefined);

  // Social Links
  const [socialLinks, setSocialLinks] = useState<ClientSocialLinks>({
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    website: ''
  });

  // Business Hours
  const [hours, setHours] = useState<ClientDayHours[]>(() => 
    DEFAULT_DAYS.map(day => ({
      day,
      isOpen: day !== 'Domingo',
      openTime: '09:00',
      closeTime: '19:00',
      display: day === 'Domingo' ? 'Cerrado' : '9:00 AM – 7:00 PM'
    }))
  );

  // Services
  const [services, setServices] = useState<ClientService[]>([
    {
      id: 'srv-init-1',
      name: 'Servicio Principal',
      description: 'Atención personalizada y asesoría directa.',
      price: 'RD$500'
    }
  ]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('RD$');

  // Settings switches
  const [settings, setSettings] = useState<ClientSettings>({
    showPhone: true,
    showWhatsapp: true,
    showInstagram: true,
    showFacebook: true,
    showTikTok: true,
    showAddress: true,
    showHours: true,
    showServices: true,
    showReviews: true,
    showBankAccounts: true
  });

  // Bank accounts state (Cuentas bancarias para transferencias)
  const [bankAccounts, setBankAccounts] = useState<ClientBankAccount[]>([]);
  const [newBankName, setNewBankName] = useState(DOMINICAN_BANKS[0].name);
  const [customBankName, setCustomBankName] = useState('');
  const [newAccountType, setNewAccountType] = useState('Cuenta de Ahorros');
  const [newCurrency, setNewCurrency] = useState<'DOP' | 'USD'>('DOP');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAccountHolder, setNewAccountHolder] = useState('');
  const [newRncOrCedula, setNewRncOrCedula] = useState('');
  const [newBankNotes, setNewBankNotes] = useState('');
  const [editingBankAccountId, setEditingBankAccountId] = useState<string | null>(null);
  const [bankFormError, setBankFormError] = useState<string | null>(null);

  // UI state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedNfcUrl, setCopiedNfcUrl] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Logo upload state (Firebase Storage)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Estados para Acceso del Cliente al Portal (Parte 7.1)
  const [accessStatus, setAccessStatus] = useState<ClientAccessStatus>('none');
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [clientAccessEmail, setClientAccessEmail] = useState('');
  const [isCreatingAccess, setIsCreatingAccess] = useState(false);
  const [isResendingInvitation, setIsResendingInvitation] = useState(false);
  const [isTogglingAccess, setIsTogglingAccess] = useState(false);
  const [accessFeedback, setAccessFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [activationLink, setActivationLink] = useState<string | null>(null);
  const [copiedActivationLink, setCopiedActivationLink] = useState(false);

  // Cargar datos en modo edición
  useEffect(() => {
    if (clientId) {
      Promise.resolve(getClientById(clientId)).then((found) => {
        if (found) {
          setOwnerName(found.ownerName || '');
          setBusinessName(found.businessName || '');
          setSlug(found.slug || '');
          setManualSlugEdit(true);
          setCategory(found.category || CATEGORIES[0]);
          setDescription(found.description || '');
          setPhone(found.phone || '');
          setWhatsapp(found.whatsapp || '');
          setEmail(found.email || '');
          setCity(found.city || CITIES[0]);
          setAddress(found.address || '');
          setProductAssigned(found.productAssigned || 'Tap Card');
          setStatus(found.status || 'active');
          setLogo(found.logoUrl || found.logo);
          setSocialLinks(found.socialLinks || {});
          if (found.hours && found.hours.length > 0) setHours(found.hours);
          if (found.services && found.services.length > 0) setServices(found.services);
          if (found.settings) {
            setSettings({
              ...found.settings,
              showBankAccounts: found.settings.showBankAccounts !== false
            });
          }

          // Cargar cuentas bancarias
          if (found.bankAccounts && found.bankAccounts.length > 0) {
            setBankAccounts(found.bankAccounts);
          } else if (found.bankInfo && found.bankInfo.bank) {
            setBankAccounts([
              {
                id: 'bnk-legacy',
                bank: found.bankInfo.bank,
                accountType: found.bankInfo.accountType || 'Cuenta de Ahorros',
                accountNumber: found.bankInfo.accountNumber || '',
                currency: 'DOP',
                holder: found.bankInfo.holder || found.businessName || '',
                rncOrCedula: found.bankInfo.rncOrCedula
              }
            ]);
          }

          // Cargar datos de acceso del cliente (Parte 7.1)
          setAccessStatus(found.accessStatus || (found.userId ? 'active' : 'none'));
          setUserId(found.userId);
          setClientAccessEmail(found.clientEmail || found.email || '');
        }
      });
    }
  }, [clientId]);

  // Manejadores de Gestión Segura de Accesos (Parte 7.1)
  const handleCreateAccess = async () => {
    if (!clientId) return;
    const targetEmail = clientAccessEmail.trim() || email.trim();
    if (!targetEmail) {
      setAccessFeedback({
        type: 'error',
        message: 'Introduce el correo electrónico del cliente para crear su acceso.'
      });
      return;
    }

    setIsCreatingAccess(true);
    setAccessFeedback(null);

    try {
      const res = await createClientAccess(clientId, targetEmail, businessName);
      if (res.success) {
        setAccessStatus('pending');
        setUserId(res.userId);
        if (res.activationLink) {
          setActivationLink(res.activationLink);
        }
        // TODO: conectar proveedor de correo transaccional para invitaciones (Regla 28)
        setAccessFeedback({
          type: 'success',
          message: res.message || 'Acceso creado. El sistema de invitación por correo todavía no está configurado.'
        });
      } else {
        setAccessFeedback({
          type: 'error',
          message: res.message || 'El acceso no pudo crearse. Verifica los datos o revisa si el cliente ya tiene una cuenta.'
        });
      }
    } catch (err: any) {
      setAccessFeedback({
        type: 'error',
        message: 'Error inesperado al conectar con el servidor backend.'
      });
    } finally {
      setIsCreatingAccess(false);
    }
  };

  const handleResendInvitation = async () => {
    if (!clientId) return;
    setIsResendingInvitation(true);
    setAccessFeedback(null);

    try {
      const res = await resendClientInvitation(clientId);
      if (res.success) {
        if (res.activationLink) setActivationLink(res.activationLink);
        setAccessFeedback({
          type: 'success',
          message: 'Invitación reenviada correctamente.'
        });
      } else {
        setAccessFeedback({
          type: 'error',
          message: res.message || 'No se pudo reenviar la invitación.'
        });
      }
    } catch (err: any) {
      setAccessFeedback({
        type: 'error',
        message: 'Error de red al reenviar la invitación.'
      });
    } finally {
      setIsResendingInvitation(false);
    }
  };

  const handleSuspendAccess = async () => {
    if (!clientId) return;
    if (!window.confirm('¿Deseas suspender el acceso de este cliente? No podrá ingresar al portal privado hasta ser reactivado.')) {
      return;
    }

    setIsTogglingAccess(true);
    setAccessFeedback(null);

    try {
      const res = await suspendClientAccess(clientId);
      if (res.success) {
        setAccessStatus('suspended');
        setAccessFeedback({
          type: 'info',
          message: 'Acceso suspendido.'
        });
      } else {
        setAccessFeedback({
          type: 'error',
          message: res.message || 'No se pudo suspender el acceso.'
        });
      }
    } catch (err: any) {
      setAccessFeedback({
        type: 'error',
        message: 'Error de red al suspender el acceso.'
      });
    } finally {
      setIsTogglingAccess(false);
    }
  };

  const handleReactivateAccess = async () => {
    if (!clientId) return;
    setIsTogglingAccess(true);
    setAccessFeedback(null);

    try {
      const res = await reactivateClientAccess(clientId);
      if (res.success) {
        setAccessStatus('active');
        setAccessFeedback({
          type: 'success',
          message: 'Acceso reactivado.'
        });
      } else {
        setAccessFeedback({
          type: 'error',
          message: res.message || 'No se pudo reactivar el acceso.'
        });
      }
    } catch (err: any) {
      setAccessFeedback({
        type: 'error',
        message: 'Error de red al reactivar el acceso.'
      });
    } finally {
      setIsTogglingAccess(false);
    }
  };

  const handleSendOfficialPasswordReset = async () => {
    const targetEmail = clientAccessEmail.trim() || email.trim();
    if (!targetEmail) {
      setAccessFeedback({
        type: 'error',
        message: 'No hay un correo asociado a este cliente.'
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setAccessFeedback({
        type: 'success',
        message: 'Enlace oficial de recuperación enviado al correo del cliente.'
      });
    } catch (err: any) {
      setAccessFeedback({
        type: 'error',
        message: err.message || 'No se pudo enviar el correo de recuperación.'
      });
    }
  };

  const handleCopyActivationLink = async () => {
    if (!activationLink) return;
    try {
      await navigator.clipboard.writeText(activationLink);
      setCopiedActivationLink(true);
      setTimeout(() => setCopiedActivationLink(false), 2500);
    } catch {}
  };

  // Generación automática del slug al tipear el nombre del negocio (Regla 10)
  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBusinessName(val);
    if (!manualSlugEdit || !slug) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualSlugEdit(true);
    setSlug(generateSlug(e.target.value));
  };

  // Agregar servicio (Regla 8)
  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    const newSrv: ClientService = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      description: newServiceDesc.trim() || 'Servicio profesional garantizado.',
      price: newServicePrice.trim() || 'A consultar'
    };
    setServices([...services, newSrv]);
    setNewServiceName('');
    setNewServiceDesc('');
    setNewServicePrice('RD$');
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  // Manejadores de Cuentas Bancarias
  const handleAddOrUpdateBankAccount = () => {
    const finalBank = newBankName === 'Otro banco o cooperativa' 
      ? (customBankName.trim() || 'Otro banco') 
      : newBankName;

    if (!newAccountNumber.trim()) {
      setBankFormError('El número de cuenta es obligatorio.');
      return;
    }

    if (!newAccountHolder.trim()) {
      setBankFormError('El nombre del titular de la cuenta es obligatorio.');
      return;
    }

    setBankFormError(null);

    if (editingBankAccountId) {
      setBankAccounts(prev => prev.map(acc => {
        if (acc.id === editingBankAccountId) {
          return {
            ...acc,
            bank: finalBank,
            accountType: newAccountType,
            currency: newCurrency,
            accountNumber: newAccountNumber.trim(),
            holder: newAccountHolder.trim(),
            rncOrCedula: newRncOrCedula.trim() || undefined,
            notes: newBankNotes.trim() || undefined
          };
        }
        return acc;
      }));
      setEditingBankAccountId(null);
    } else {
      const newAcc: ClientBankAccount = {
        id: `bnk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        bank: finalBank,
        accountType: newAccountType,
        currency: newCurrency,
        accountNumber: newAccountNumber.trim(),
        holder: newAccountHolder.trim(),
        rncOrCedula: newRncOrCedula.trim() || undefined,
        notes: newBankNotes.trim() || undefined
      };
      setBankAccounts(prev => [...prev, newAcc]);
    }

    // Reset campos
    setNewAccountNumber('');
    setNewRncOrCedula('');
    setNewBankNotes('');
    setCustomBankName('');
  };

  const handleEditBankAccount = (acc: ClientBankAccount) => {
    setEditingBankAccountId(acc.id);
    const isKnown = DOMINICAN_BANKS.some(b => b.name === acc.bank);
    if (isKnown) {
      setNewBankName(acc.bank);
      setCustomBankName('');
    } else {
      setNewBankName('Otro banco o cooperativa');
      setCustomBankName(acc.bank);
    }
    setNewAccountType(acc.accountType || 'Cuenta de Ahorros');
    setNewCurrency((acc.currency as 'DOP' | 'USD') || 'DOP');
    setNewAccountNumber(acc.accountNumber || '');
    setNewAccountHolder(acc.holder || '');
    setNewRncOrCedula(acc.rncOrCedula || '');
    setNewBankNotes(acc.notes || '');
    setBankFormError(null);
  };

  const handleCancelEditBankAccount = () => {
    setEditingBankAccountId(null);
    setNewAccountNumber('');
    setNewRncOrCedula('');
    setNewBankNotes('');
    setCustomBankName('');
    setBankFormError(null);
  };

  const handleRemoveBankAccount = (id: string) => {
    setBankAccounts(prev => prev.filter(a => a.id !== id));
    if (editingBankAccountId === id) {
      handleCancelEditBankAccount();
    }
  };

  // Modificar horarios de apertura/cierre
  const handleToggleDayOpen = (index: number) => {
    const updated = [...hours];
    updated[index].isOpen = !updated[index].isOpen;
    if (!updated[index].isOpen) {
      updated[index].display = 'Cerrado';
    } else {
      updated[index].display = `${updated[index].openTime || '9:00 AM'} – ${updated[index].closeTime || '7:00 PM'}`;
    }
    setHours(updated);
  };

  const handleHourTimeChange = (index: number, field: 'openTime' | 'closeTime', value: string) => {
    const updated = [...hours];
    updated[index][field] = value;
    updated[index].display = `${updated[index].openTime || '09:00'} – ${updated[index].closeTime || '19:00'}`;
    setHours(updated);
  };

  // Carga de logo con Firebase Storage
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError(null);
    const validation = validateLogoFile(file);
    if (!validation.valid) {
      setLogoError(validation.error || 'Archivo no válido');
      return;
    }

    setIsUploadingLogo(true);
    setLogoUploadProgress(15);
    try {
      const uploadId = clientId || `temp-${Date.now()}`;
      const url = await uploadClientLogo(file, uploadId, (pct) => {
        setLogoUploadProgress(pct);
      });
      setLogo(url);
      setLogoUploadProgress(100);
    } catch (err: any) {
      console.error('Error al subir logo:', err);
      setLogoError(err.message || 'No se pudo subir la imagen.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (logo) {
      try {
        await deleteClientLogo(logo);
      } catch {
        // Fallback silencioso
      }
      setLogo(undefined);
    }
  };

  // Toggle de configuración de botones (Regla 9)
  const handleToggleSetting = (key: keyof ClientSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const profileUrl = `${PUBLIC_BASE_URL}/p/${slug || 'mi-negocio'}`;

  // Objeto temporal para la vista previa en vivo (Regla 14)
  const currentPreviewClient: Client = {
    id: clientId || 'preview-temp',
    ownerName,
    businessName: businessName || 'Nombre del Negocio',
    slug: slug || 'mi-negocio',
    category,
    description: description || 'Descripción de los servicios ofrecidos por este negocio en República Dominicana.',
    phone,
    whatsapp,
    email,
    city,
    address,
    logo,
    logoUrl: logo,
    avatarInitials: businessName.substring(0, 2).toUpperCase() || 'TR',
    avatarBgColor: 'bg-blue-600',
    coverGradient: 'from-slate-900 via-blue-950 to-slate-900',
    socialLinks,
    services,
    hours,
    bankAccounts,
    settings,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    productAssigned
  };

  // Guardar datos con validaciones estrictas
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!businessName.trim()) {
      setErrorMessage('El nombre del negocio es obligatorio.');
      return;
    }

    if (!category.trim()) {
      setErrorMessage('Debes seleccionar una categoría.');
      return;
    }

    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    if (!cleanWhatsapp || cleanWhatsapp.length < 8) {
      setErrorMessage('El número de WhatsApp es obligatorio y debe incluir al menos 8 a 10 dígitos.');
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('El correo electrónico introducido no tiene un formato válido.');
      return;
    }

    // Validar servicios
    const invalidService = services.find(s => !s.name.trim());
    if (invalidService) {
      setErrorMessage('Todos los servicios registrados deben tener un nombre válido.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    const payload = {
      ownerName,
      businessName: businessName.trim(),
      slug: slug.trim() || generateSlug(businessName),
      category,
      description,
      phone,
      whatsapp: cleanWhatsapp,
      email: email.trim(),
      city,
      address,
      logo,
      logoUrl: logo,
      socialLinks,
      services,
      hours,
      bankAccounts,
      settings,
      status,
      productAssigned
    };

    try {
      if (isEditing && clientId) {
        await updateClient(clientId, payload);
      } else {
        await createClient(payload);
      }

      setSavedSuccess(true);
      setTimeout(() => {
        onNavigate('/admin/clientes');
      }, 1000);
    } catch (err: any) {
      console.error('Error al guardar cliente en Firestore:', err);
      setErrorMessage(err.message || 'Ocurrió un error al guardar el cliente en Firestore. Verifica los permisos.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const handleCopyNfcUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedNfcUrl(true);
      setTimeout(() => setCopiedNfcUrl(false), 2000);
    } catch {}
  };

  return (
    <AdminLayout
      currentPath={isEditing ? `/admin/clientes/${clientId}/editar` : '/admin/clientes/nuevo'}
      onNavigate={onNavigate}
      title={isEditing ? `Editar: ${businessName || 'Cliente'}` : 'Crear Nuevo Cliente'}
      subtitle="Configura la información del negocio, servicios, horarios y enlaces para el perfil digital NFC."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => onNavigate('/admin/clientes')}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vista previa</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-75"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>
              {isSaving 
                ? 'Guardando en Firestore...' 
                : isEditing 
                ? 'Guardar cambios' 
                : 'Crear cliente'}
            </span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSave} className="space-y-8 pb-12">

        {savedSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {isEditing
                ? '¡Cliente actualizado correctamente en Cloud Firestore! Redirigiendo...'
                : '¡Cliente creado correctamente en Cloud Firestore! Redirigiendo...'}
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* SECCIÓN 1: INFORMACIÓN DEL NEGOCIO */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                1. Información del Negocio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Datos generales y de contacto visibles para el cliente final
              </p>
            </div>

            {/* Estado del Perfil (Regla 15) */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Estado:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="active">Activo (Publicado)</option>
                <option value="pending">Pendiente</option>
                <option value="inactive">Inactivo (Pausado)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={handleBusinessNameChange}
                placeholder="Ej. Barbería Wilson"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Nombre del Propietario / Contacto
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-colors"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Solución / Producto Asignado
              </label>
              <select
                value={productAssigned}
                onChange={(e) => setProductAssigned(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-colors"
              >
                <option value="Tap Card">Tap Card (Tarjeta NFC)</option>
                <option value="Tap Business">Tap Business (Placa de Mostrador)</option>
                <option value="Tap Review">Tap Review (Placa de Reseñas)</option>
                <option value="Tap Sticker">Tap Sticker (Adhesivo)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Descripción del Negocio
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente los servicios que ofrece el negocio, especialidades y valor diferencial..."
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                WhatsApp del Negocio (Solo dígitos) *
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="18095550100"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Teléfono Fijo / Celular
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 809-555-0100"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@negocio.com"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Ciudad
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-colors"
              >
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Dirección Física
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. Av. Winston Churchill #102, Plaza Central, Piantini"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* SECCIÓN: ACCESO DEL CLIENTE AL PORTAL (PARTE 7.1) */}
        {/* ----------------------------------------------------------------- */}
        {isEditing && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Acceso del Cliente al Portal
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Permite al cliente iniciar sesión en <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">/cliente/login</span> para administrar su perfil
                  </p>
                </div>
              </div>

              {/* Badges de Estado (Regla 19) */}
              <div className="flex items-center gap-2 shrink-0">
                {accessStatus === 'none' && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Sin acceso
                  </span>
                )}
                {accessStatus === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Pendiente de activación
                  </span>
                )}
                {accessStatus === 'active' && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Activo
                  </span>
                )}
                {accessStatus === 'suspended' && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Suspendido
                  </span>
                )}
              </div>
            </div>

            {/* Mensajes de Feedback */}
            {accessFeedback && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-3 animate-in fade-in ${
                  accessFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : accessFeedback.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                    : 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                }`}
              >
                {accessFeedback.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div>{accessFeedback.message}</div>
                  {/* TODO: conectar proveedor de correo transaccional para invitaciones (Regla 28) */}
                  {accessStatus === 'pending' && (
                    <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      El cliente puede utilizar la pantalla de activación <span className="font-mono text-blue-600 dark:text-blue-400">/cliente/activar</span> o solicitar un enlace de restablecimiento con su correo.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enlace de activación generado si está disponible */}
            {activationLink && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Enlace seguro de activación / restablecimiento (Oficial Firebase Auth)
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activationLink}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-200 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyActivationLink}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedActivationLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedActivationLink ? 'Copiado' : 'Copiar enlace'}</span>
                  </button>
                  <a
                    href={activationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir</span>
                  </a>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Correo Electrónico para Acceso al Portal
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={clientAccessEmail}
                    disabled={accessStatus !== 'none' && Boolean(userId)}
                    onChange={(e) => setClientAccessEmail(e.target.value)}
                    placeholder="correo@negocio.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 disabled:opacity-75 disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                  />
                </div>
                {userId && (
                  <p className="mt-1.5 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    UID: {userId}
                  </p>
                )}
              </div>

              {/* Botones de acción según estado */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-6">
                {accessStatus === 'none' && (
                  <button
                    type="button"
                    disabled={isCreatingAccess || !clientAccessEmail.trim()}
                    onClick={handleCreateAccess}
                    className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {isCreatingAccess ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creando acceso...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Crear acceso</span>
                      </>
                    )}
                  </button>
                )}

                {accessStatus === 'pending' && (
                  <>
                    <button
                      type="button"
                      disabled={isResendingInvitation}
                      onClick={handleResendInvitation}
                      className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      {isResendingInvitation ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Reenviando invitación...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Reenviar invitación</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isTogglingAccess}
                      onClick={handleSuspendAccess}
                      className="py-2.5 px-3.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Suspender acceso</span>
                    </button>
                  </>
                )}

                {accessStatus === 'active' && (
                  <>
                    <button
                      type="button"
                      disabled={isTogglingAccess}
                      onClick={handleSuspendAccess}
                      className="py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Suspender acceso</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendOfficialPasswordReset}
                      className="py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Restablecer contraseña</span>
                    </button>
                  </>
                )}

                {accessStatus === 'suspended' && (
                  <button
                    type="button"
                    disabled={isTogglingAccess}
                    onClick={handleReactivateAccess}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isTogglingAccess ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Reactivando...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Reactivar acceso</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-200">Seguridad & Privacidad:</p>
              <p>• La creación de cuentas y asignación de permisos se ejecuta en backend con Firebase Admin SDK.</p>
              <p>• Los administradores nunca introducen ni visualizan contraseñas de los clientes.</p>
              <p>• El cliente establece su contraseña de forma privada y segura mediante el enlace de activación.</p>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* SECCIÓN 2: SLUG & URL NFC CENTRALIZADA (Regla 10 y 12) */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                2. Enlace de Perfil & URL para NFC
              </h2>
              <p className="text-xs text-slate-400">
                Esta URL es la que debe programarse en el chip de la tarjeta, placa o sticker
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Slug Editor */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Slug del Perfil (Generado automáticamente)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-2.5 rounded-xl border border-slate-700">
                    /p/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="barberia-wilson"
                    className="flex-1 py-2.5 px-3.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono text-xs sm:text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* URL Preview & NFC instructions */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 text-xs space-y-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                    URL Oficial para Programar en NFC:
                  </span>
                  <p className="font-mono text-sm text-cyan-300 font-bold break-all mt-1">
                    {profileUrl}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyNfcUrl}
                    className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedNfcUrl ? <Check className="w-3.5 h-3.5 text-cyan-200" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar URL para NFC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.open(profileUrl, '_blank')}
                    className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir en navegador</span>
                  </button>
                </div>

                {/* Importante Nota NFC (Regla 12) */}
                <div className="p-3 bg-blue-950/70 border border-blue-900 rounded-xl text-[11px] text-slate-300 leading-relaxed space-y-1">
                  <p className="font-bold text-blue-300">
                    💡 Arquitectura NFC Inteligente:
                  </p>
                  <p>
                    La tarjeta NFC debe apuntar siempre al perfil de TapRD (<code className="text-cyan-300">{profileUrl}</code>), 
                    NUNCA directamente a WhatsApp o Instagram. Esto permite actualizar teléfonos, precios o servicios del cliente 
                    en el futuro sin tener que reprogramar o cambiar físicamente su tarjeta o placa NFC.
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Block (Regla 11) */}
            <div className="flex justify-center">
              <ProfileQRCode
                url={profileUrl}
                businessName={businessName || 'Negocio'}
                onOpenProfile={() => setPreviewOpen(true)}
              />
            </div>

          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* SECCIÓN 3: LOGO O IMAGEN DEL NEGOCIO (Regla 7) */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              3. Logo o Imagen del Negocio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Imagen principal que se mostrará en el encabezado del perfil digital
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Preview Box */}
            <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden shadow-inner shrink-0">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2">
                  <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">Sin logo</span>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="space-y-3 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <label className={`inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors ${
                  isUploadingLogo ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                }`}>
                  {isUploadingLogo ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 text-cyan-400" />
                  )}
                  <span>{isUploadingLogo ? 'Subiendo a Storage...' : 'Subir imagen o logo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isUploadingLogo}
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logo && !isUploadingLogo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Eliminar imagen
                  </button>
                )}
              </div>

              {/* Progress bar */}
              {isUploadingLogo && (
                <div className="space-y-1 max-w-xs">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${logoUploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold font-mono">
                    {logoUploadProgress}% completado
                  </span>
                </div>
              )}

              {/* Logo Error */}
              {logoError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{logoError}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Formatos soportados: PNG, JPG o WEBP. Tamaño máximo: 5MB. Se almacena de forma segura en Firebase Storage.
              </p>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* SECCIÓN 4: REDES SOCIALES */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              4. Redes Sociales
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enlaces a los perfiles oficiales del negocio
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Instagram (Usuario sin @)
              </label>
              <div className="flex items-center">
                <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700">
                  @
                </span>
                <input
                  type="text"
                  value={socialLinks.instagram || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  placeholder="barberiawilson.rd"
                  className="flex-1 py-2.5 px-3 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Facebook (Usuario o Página)
              </label>
              <input
                type="text"
                value={socialLinks.facebook || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                placeholder="barberiawilsonrd"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                TikTok (Usuario)
              </label>
              <div className="flex items-center">
                <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700">
                  @
                </span>
                <input
                  type="text"
                  value={socialLinks.tiktok || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                  placeholder="barberiawilson"
                  className="flex-1 py-2.5 px-3 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                YouTube (Canal)
              </label>
              <input
                type="text"
                value={socialLinks.youtube || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                placeholder="barberiawilsontv"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Sitio Web Oficial
              </label>
              <input
                type="url"
                value={socialLinks.website || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                placeholder="https://barberiawilson.com"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* ----------------------------------------------------------------- */}
        {/* SECCIÓN 5: SERVICIOS DEL CLIENTE (Regla 8) */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                5. Servicios & Productos Ofrecidos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lista de servicios con precio que verá el cliente al escanear
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              {services.length} registrados
            </span>
          </div>

          {/* Current Services List */}
          <div className="space-y-3">
            {services.map((srv, idx) => (
              <div
                key={srv.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {srv.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pl-7">
                    {srv.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 font-mono shadow-2xs">
                    {srv.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(srv.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title="Eliminar servicio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Service Box */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-3">
            <span className="text-xs font-black uppercase text-blue-700 dark:text-blue-400 tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar nuevo servicio</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Nombre del servicio (ej. Corte clásico)"
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:border-blue-500"
              />
              <input
                type="text"
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                placeholder="Descripción corta"
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:border-blue-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  placeholder="Precio (RD$500)"
                  className="w-28 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* SECCIÓN 6: HORARIO (Regla 6) */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              6. Horario Semanal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configura apertura y cierre para cada día de la semana
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {hours.map((item, index) => (
              <div key={item.day} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 w-32">
                  <button
                    type="button"
                    onClick={() => handleToggleDayOpen(index)}
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                      item.isOpen ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {item.isOpen && <Check className="w-3 h-3" />}
                  </button>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{item.day}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.isOpen ? (
                    <>
                      <input
                        type="time"
                        value={item.openTime || '09:00'}
                        onChange={(e) => handleHourTimeChange(index, 'openTime', e.target.value)}
                        className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                      <span className="text-slate-400 dark:text-slate-500">a</span>
                      <input
                        type="time"
                        value={item.closeTime || '19:00'}
                        onChange={(e) => handleHourTimeChange(index, 'closeTime', e.target.value)}
                        className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg">
                      Cerrado todo el día
                    </span>
                  )}
                </div>

                <div className="text-right text-slate-500 dark:text-slate-400 text-[11px] font-medium sm:w-40">
                  {item.display}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* SECCIÓN 7: CUENTAS BANCARIAS PARA TRANSFERENCIAS (RD$ / USD) */}
        {/* ----------------------------------------------------------------- */}
        <div id="section-admin-bank-accounts" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  7. Cuentas Bancarias para Transferencias (RD$ y USD)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Permite a los clientes ver las cuentas oficiales de la empresa para transferencias directas
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              {bankAccounts.length} {bankAccounts.length === 1 ? 'cuenta registrada' : 'cuentas registradas'}
            </span>
          </div>

          {/* Lista de cuentas existentes */}
          {bankAccounts.length > 0 ? (
            <div className="space-y-3">
              {bankAccounts.map((acc, idx) => {
                const isUsd = acc.currency === 'USD';
                return (
                  <div
                    key={acc.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                          {acc.bank}
                        </h3>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md border font-mono ${
                            isUsd
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800'
                          }`}
                        >
                          {isUsd ? 'US$ Dólares' : 'RD$ Pesos'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          ({acc.accountType})
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs pl-7 flex-wrap">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          {acc.accountNumber}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          Titular: <strong className="text-slate-900 dark:text-white">{acc.holder}</strong>
                        </span>
                        {acc.rncOrCedula && (
                          <span className="text-slate-500 dark:text-slate-400 font-mono">
                            RNC/Cédula: {acc.rncOrCedula}
                          </span>
                        )}
                      </div>

                      {acc.notes && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 pl-7 italic">
                          Nota: {acc.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditBankAccount(acc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                        title="Editar cuenta"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBankAccount(acc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Eliminar cuenta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center py-6">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aún no has agregado cuentas bancarias para este cliente. Utiliza el formulario a continuación para registrar la primera cuenta.
              </p>
            </div>
          )}

          {/* Formulario de Agregar / Editar Cuenta Bancaria */}
          <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                {editingBankAccountId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{editingBankAccountId ? 'Editar cuenta bancaria' : 'Agregar nueva cuenta bancaria'}</span>
              </span>
              {editingBankAccountId && (
                <button
                  type="button"
                  onClick={handleCancelEditBankAccount}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
                >
                  Cancelar edición
                </button>
              )}
            </div>

            {bankFormError && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bankFormError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Banco */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Banco *
                </label>
                <select
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:border-emerald-500"
                >
                  {DOMINICAN_BANKS.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {newBankName === 'Otro banco o cooperativa' && (
                  <input
                    type="text"
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    placeholder="Escribe el nombre de la institución"
                    className="w-full mt-1.5 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:border-emerald-500"
                  />
                )}
              </div>

              {/* Tipo de Cuenta */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Tipo de Cuenta *
                </label>
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:border-emerald-500"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Moneda */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Moneda *
                </label>
                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setNewCurrency(c.code as 'DOP' | 'USD')}
                      className={`flex-1 py-2 px-2 text-xs font-bold transition-colors cursor-pointer text-center ${
                        newCurrency === c.code
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {c.symbol} {c.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Número de Cuenta */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Número de Cuenta *
                </label>
                <input
                  type="text"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                  placeholder="Ej. 792834912"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Titular de la Cuenta */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Titular de la Cuenta *
                  </label>
                  {businessName && !newAccountHolder && (
                    <button
                      type="button"
                      onClick={() => setNewAccountHolder(businessName)}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Usar nombre negocio
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={newAccountHolder}
                  onChange={(e) => setNewAccountHolder(e.target.value)}
                  placeholder="Ej. Barbería Wilson SRL o Wilson Abelino"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Cédula o RNC */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  RNC o Cédula del Titular (Opcional)
                </label>
                <input
                  type="text"
                  value={newRncOrCedula}
                  onChange={(e) => setNewRncOrCedula(e.target.value)}
                  placeholder="Ej. 1-31-98765-4 o 402-1928374-1"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Instrucción o Nota */}
              <div className="space-y-1 sm:col-span-2 lg:col-span-2">
                <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Nota o Instrucción adicional (Opcional)
                </label>
                <input
                  type="text"
                  value={newBankNotes}
                  onChange={(e) => setNewBankNotes(e.target.value)}
                  placeholder="Ej. Favor enviar comprobante de pago por WhatsApp tras transferir"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Botón Guardar Cuenta */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddOrUpdateBankAccount}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingBankAccountId ? 'Actualizar Cuenta' : 'Guardar Cuenta Bancaria'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* SECCIÓN 8: CONFIGURACIÓN DE VISIBILIDAD DE BOTONES (Regla 9) */}
        {/* ----------------------------------------------------------------- */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              8. Configuración del Perfil (Switches de Visibilidad)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Elige qué elementos y botones estarán activos en el perfil público
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'showWhatsapp', label: 'Mostrar WhatsApp' },
              { key: 'showPhone', label: 'Mostrar Teléfono' },
              { key: 'showInstagram', label: 'Mostrar Instagram' },
              { key: 'showFacebook', label: 'Mostrar Facebook' },
              { key: 'showTikTok', label: 'Mostrar TikTok' },
              { key: 'showAddress', label: 'Mostrar Dirección' },
              { key: 'showHours', label: 'Mostrar Horario' },
              { key: 'showServices', label: 'Mostrar Servicios' },
              { key: 'showBankAccounts', label: 'Mostrar Cuentas Bancarias' },
              { key: 'showReviews', label: 'Mostrar Botón de Reseñas' },
            ].map((sw) => {
              const active = settings[sw.key as keyof ClientSettings];
              return (
                <div
                  key={sw.key}
                  onClick={() => handleToggleSetting(sw.key as keyof ClientSettings)}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between cursor-pointer transition-all select-none"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {sw.label}
                  </span>
                  <div
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* BOTONES FINALES DE ACCIÓN */}
        {/* ----------------------------------------------------------------- */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/admin/clientes')}
            className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Vista previa interactiva</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto py-3.5 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Guardar cambios' : 'Crear y registrar cliente'}</span>
          </button>
        </div>

      </form>

      {/* =================================================================== */}
      {/* MODAL VISTA PREVIA INTERACTIVA (Regla 14: Exactamente el mismo ClientProfile) */}
      {/* =================================================================== */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-100 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-700">
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-black">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Vista Previa del Perfil: {businessName || 'Cliente'}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ClientProfile
                client={currentPreviewClient}
                isPreview={true}
                onNavigateHome={() => setPreviewOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
