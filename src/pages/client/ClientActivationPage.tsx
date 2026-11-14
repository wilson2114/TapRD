import React, { useState, useEffect, useCallback } from 'react';
import {
  verifyActivationToken,
  completeActivation,
  extractActivationParams
} from '../../services/activationService';
import {
  findAndLinkClient,
  setActivationInProgress,
  syncClientSession
} from '../../services/authService';
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '../../lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { COMPANY_CONFIG } from '../../config/company';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  Link2
} from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

interface ClientActivationPageProps {
  onNavigate: (path: string) => void;
}

export function ClientActivationPage({ onNavigate }: ClientActivationPageProps) {
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [activationToken, setActivationToken] = useState<string | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [manualLinkInput, setManualLinkInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [missingTokenPrompt, setMissingTokenPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const validateParams = useCallback(
    async (tokenParam?: string, codeParam?: string, emailParam?: string) => {
      setIsVerifyingCode(true);
      setErrorMessage(null);
      setMissingTokenPrompt(false);

      if (emailParam) {
        setEmail(emailParam);
      }

      // 1. Prioridad: Token de activación TapRD (?token=...)
      if (tokenParam) {
        setActivationToken(tokenParam);
        setOobCode(null);
        const result = await verifyActivationToken(tokenParam, emailParam || undefined);

        if (result.valid) {
          setIsTokenValid(true);
          if (result.email) setEmail(result.email);
          if (result.businessName) setBusinessName(result.businessName);
        } else {
          setIsTokenValid(false);
          setErrorMessage(result.error || 'El enlace de activación es inválido o ha expirado.');
        }
        setIsVerifyingCode(false);
        return;
      }

      // 2. Fallback: Código estándar de Firebase Auth (?oobCode=...)
      if (codeParam) {
        setOobCode(codeParam);
        setActivationToken(null);
        if (isFirebaseConfigured && auth) {
          try {
            const verifiedEmail = await verifyPasswordResetCode(auth, codeParam);
            setEmail(verifiedEmail);
            setIsTokenValid(true);
          } catch {
            setIsTokenValid(false);
            setErrorMessage('El código de activación ha expirado o ya fue utilizado.');
          }
        } else {
          setIsTokenValid(true);
        }
        setIsVerifyingCode(false);
        return;
      }

      // 3. No hay token todavía en la URL: permitir pegar enlace o código manualmente
      setIsTokenValid(false);
      setMissingTokenPrompt(true);
      setIsVerifyingCode(false);
    },
    []
  );

  // Leer parámetros de la URL tolerando enlaces escapados (&amp;)
  useEffect(() => {
    const rawSearch = window.location.search.replace(/&amp;/g, '&');
    const urlParams = new URLSearchParams(rawSearch);
    const tokenParam = urlParams.get('token')?.trim() || undefined;
    const codeParam = (urlParams.get('oobCode') || urlParams.get('code'))?.trim() || undefined;
    const emailParam = urlParams.get('email')?.trim() || undefined;

    validateParams(tokenParam, codeParam, emailParam);
  }, [validateParams]);

  const handleVerifyManualInput = async (e: React.FormEvent) => {
    e.preventDefault();
    const extracted = extractActivationParams(manualLinkInput);
    if (!extracted.token && !extracted.oobCode) {
      setErrorMessage('Pega el enlace completo de activación o el código (act_...) que te envió TapRD.');
      return;
    }

    if (typeof window !== 'undefined' && extracted.token) {
      const nextUrl = `/activar?token=${encodeURIComponent(extracted.token)}${
        extracted.email ? `&email=${encodeURIComponent(extracted.email)}` : ''
      }`;
      window.history.replaceState({}, '', nextUrl);
    }

    await validateParams(extracted.token, extracted.oobCode, extracted.email);
  };

  // Validación de requisitos de seguridad de contraseña
  const isLengthValid = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid =
    isLengthValid && hasNumber && hasLetter && passwordsMatch && Boolean(email.trim()) && termsAccepted;

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isLengthValid) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (!hasNumber || !hasLetter) {
      setErrorMessage('La contraseña debe contener al menos una letra y un número.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Si tenemos token de activación TapRD
      if (activationToken) {
        const result = await completeActivation(activationToken, password, email);
        if (result.success) {
          setIsActivated(true);
          setSuccessMessage('¡Tu cuenta ha sido activada con éxito! Redirigiendo a tu portal de negocio...');
          setTimeout(() => {
            onNavigate('/cliente');
          }, 1200);
          return;
        } else {
          setErrorMessage(result.error || 'No se pudo completar la activación.');
          return;
        }
      }

      // 2. Si vino con código de Firebase Auth oobCode
      if (oobCode) {
        const cleanEmail = email.trim().toLowerCase();
        setActivationInProgress(true);
        try {
          if (auth.currentUser && auth.currentUser.email?.toLowerCase() !== cleanEmail) {
            try {
              await firebaseSignOut(auth);
            } catch {}
          }

          await confirmPasswordReset(auth, oobCode, password);
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          const user = cred.user;
          const now = new Date().toISOString();

          const linkedClient = await findAndLinkClient(user.uid, cleanEmail);

          try {
            await setDoc(
              doc(db, 'users', user.uid),
              {
                uid: user.uid,
                email: cleanEmail,
                role: 'CLIENT',
                clientId: linkedClient?.id,
                displayName: linkedClient?.businessName || user.displayName || cleanEmail.split('@')[0],
                active: true,
                termsAccepted: true,
                privacyAccepted: true,
                termsAcceptedAt: now,
                privacyAcceptedAt: now,
                termsVersion: COMPANY_CONFIG.termsVersion,
                privacyVersion: COMPANY_CONFIG.privacyVersion,
                updatedAt: now
              },
              { merge: true }
            );
          } catch {}

          if (linkedClient?.id) {
            try {
              await updateDoc(doc(db, 'clients', linkedClient.id), {
                userId: user.uid,
                clientEmail: cleanEmail,
                active: true,
                status: 'active',
                accessStatus: 'active',
                termsAccepted: true,
                privacyAccepted: true,
                termsAcceptedAt: now,
                privacyAcceptedAt: now,
                termsVersion: COMPANY_CONFIG.termsVersion,
                privacyVersion: COMPANY_CONFIG.privacyVersion,
                updatedAt: now
              });
            } catch {}
          }

          syncClientSession(
            {
              uid: user.uid,
              email: cleanEmail,
              displayName: linkedClient?.businessName || cleanEmail.split('@')[0],
              role: 'CLIENT',
              clientId: linkedClient?.id,
              active: true,
              createdAt: now,
              lastLogin: now,
              termsAccepted: true,
              privacyAccepted: true
            },
            linkedClient
          );

          setIsActivated(true);
          setSuccessMessage('¡Tu cuenta ha sido activada con éxito! Redirigiendo a tu portal...');
          setTimeout(() => {
            onNavigate('/cliente');
          }, 1200);
          return;
        } finally {
          setActivationInProgress(false);
        }
      }

      setErrorMessage('Token de activación no disponible.');
    } catch (err: any) {
      console.error('[Activación] Error:', err);
      if (err.code === 'auth/invalid-action-code' || err.code === 'auth/expired-action-code') {
        setErrorMessage('El enlace de activación ha expirado o ya fue utilizado.');
      } else {
        setErrorMessage(err.message || 'No se pudo completar la activación de la cuenta.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      <SEOHead
        title="Activa tu cuenta TapRD"
        description="Portal seguro de activación de cuenta comercial TapRD para nuevos clientes."
      />

      {/* Luces y ambientación de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-900/20 via-blue-950/10 to-transparent pointer-events-none" />
      <div className="absolute -top-32 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-xl shadow-blue-500/20 mb-4 ring-4 ring-white/5">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Activa tu cuenta TapRD
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium">
            {businessName
              ? `Configura el acceso para ${businessName}`
              : 'Crea tu contraseña para ingresar a tu portal de negocio'}
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Verificando estado */}
          {isVerifyingCode && (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-sm font-bold text-white">Validando enlace de activación...</h3>
              <p className="text-xs text-slate-400">Comprobando legitimidad y vigencia de la invitación.</p>
            </div>
          )}

          {/* Mensajes de error / éxito */}
          {errorMessage && !isVerifyingCode && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div className="font-medium leading-relaxed">{successMessage}</div>
              </div>
              {isActivated && (
                <button
                  type="button"
                  onClick={() => onNavigate('/cliente')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
                >
                  <span>Entrar a mi portal ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Formulario de activación (solo si token es válido y no activado) */}
          {!isVerifyingCode && isTokenValid && !isActivated && (
            <form onSubmit={handleActivate} className="space-y-5" noValidate>
              {/* Correo electrónico asociado (solo lectura) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Correo electrónico asociado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={email}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800/80 rounded-xl text-slate-300 text-sm cursor-not-allowed select-none min-h-[44px]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Este es el correo donde recibirás notificaciones y con el que iniciarás sesión.
                </p>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-10 pr-11 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Indicadores de requisitos */}
                <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${isLengthValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isLengthValid ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span>8+ caracteres</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber && hasLetter ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasNumber && hasLetter ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    <span>Letras y números</span>
                  </div>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu nueva contraseña"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px]"
                  />
                </div>
                {password.length > 0 && confirmPassword.length > 0 && (
                  <p
                    className={`mt-1.5 text-[11px] font-medium flex items-center gap-1.5 ${
                      passwordsMatch ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                  </p>
                )}
              </div>

              {/* Consentimiento Legal Explicito */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer select-none group hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    Al activar tu cuenta aceptas los{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('/terminos');
                      }}
                      className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                    >
                      Términos y condiciones
                    </button>{' '}
                    y reconoces la{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('/privacidad');
                      }}
                      className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                    >
                      Política de privacidad
                    </button>{' '}
                    de TapRD.
                  </span>
                </label>
              </div>

              {/* Botón Activar Cuenta */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer min-h-[44px] active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activando cuenta...</span>
                  </>
                ) : (
                  <>
                    <span>Activar mi cuenta y entrar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Si falta token o es inválido, permitir pegar el enlace/código manualmente o ir al login */}
          {!isVerifyingCode && !isTokenValid && (
            <div className="space-y-5">
              <form onSubmit={handleVerifyManualInput} className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  {missingTokenPrompt
                    ? 'Pega tu enlace o código de activación'
                    : '¿Tienes otro enlace o código de activación?'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={manualLinkInput}
                    onChange={(e) => setManualLinkInput(e.target.value)}
                    placeholder="https://.../activar?token=act_... o act_..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[44px]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2 border border-slate-700"
                >
                  <span>Validar enlace o código</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 border-t border-slate-800/80 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  Si ya activaste tu cuenta con anterioridad, puedes iniciar sesión directamente con tu correo y contraseña:
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/20 transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
                >
                  <span>Ir al inicio de sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Seguridad y Privacidad */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Activación cifrada y validada por Firebase Authentication</span>
          </div>
        </div>

        {/* Enlace para volver */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-400 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>¿Ya tienes contraseña? Iniciar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}

