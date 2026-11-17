import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ProfilePage } from './pages/ProfilePage';
import { QrRedirectPage } from './pages/QrRedirectPage';
import { GlobalMotionShell } from './components/GlobalMotionShell';
import { getProductBySlug } from './data/products';

const lazyNamed = <T extends Record<string, React.ComponentType<any>>>(
  loader: () => Promise<T>,
  name: keyof T
) => lazy(() => loader().then((m) => ({ default: m[name] })));

const HomePage = lazyNamed(() => import('./pages/HomePage'), 'HomePage');
const ProductsPage = lazyNamed(() => import('./pages/ProductsPage'), 'ProductsPage');
const ProductDetailPage = lazyNamed(() => import('./pages/ProductDetailPage'), 'ProductDetailPage');

// Auth Pages (Unified Login & Activation)
const LoginPage = lazyNamed(() => import('./pages/auth/LoginPage'), 'LoginPage');
const ClientActivationPage = lazyNamed(() => import('./pages/client/ClientActivationPage'), 'ClientActivationPage');

// Admin Panel Pages
const AdminDashboardPage = lazyNamed(() => import('./pages/admin/AdminDashboardPage'), 'AdminDashboardPage');
const AdminClientsPage = lazyNamed(() => import('./pages/admin/AdminClientsPage'), 'AdminClientsPage');
const AdminClientFormPage = lazyNamed(() => import('./pages/admin/AdminClientFormPage'), 'AdminClientFormPage');
const AdminProfilesPage = lazyNamed(() => import('./pages/admin/AdminProfilesPage'), 'AdminProfilesPage');
const AdminProductsPage = lazyNamed(() => import('./pages/admin/AdminProductsPage'), 'AdminProductsPage');
const AdminSettingsPage = lazyNamed(() => import('./pages/admin/AdminSettingsPage'), 'AdminSettingsPage');
const ProtectedRoute = lazyNamed(() => import('./components/admin/ProtectedRoute'), 'ProtectedRoute');

// Client Portal Pages
const ClientDashboardPage = lazyNamed(() => import('./pages/client/ClientDashboardPage'), 'ClientDashboardPage');
const ClientProfilePage = lazyNamed(() => import('./pages/client/ClientProfilePage'), 'ClientProfilePage');
const ClientServicesPage = lazyNamed(() => import('./pages/client/ClientServicesPage'), 'ClientServicesPage');
const ClientBankAccountsPage = lazyNamed(() => import('./pages/client/ClientBankAccountsPage'), 'ClientBankAccountsPage');
const ClientHoursPage = lazyNamed(() => import('./pages/client/ClientHoursPage'), 'ClientHoursPage');
const ClientSocialsPage = lazyNamed(() => import('./pages/client/ClientSocialsPage'), 'ClientSocialsPage');
const ClientQrPage = lazyNamed(() => import('./pages/client/ClientQrPage'), 'ClientQrPage');
const ClientSupportPage = lazyNamed(() => import('./pages/client/ClientSupportPage'), 'ClientSupportPage');
const ClientSettingsPage = lazyNamed(() => import('./pages/client/ClientSettingsPage'), 'ClientSettingsPage');
const ClientAnalyticsPage = lazyNamed(() => import('./pages/client/ClientAnalyticsPage'), 'ClientAnalyticsPage');
const ClientRoute = lazyNamed(() => import('./components/client/ClientRoute'), 'ClientRoute');

// Plans & Pricing Pages (Parte 9)
const PlansPage = lazyNamed(() => import('./pages/PlansPage'), 'PlansPage');
const ComparePlansPage = lazyNamed(() => import('./pages/ComparePlansPage'), 'ComparePlansPage');
const AdminPlansPage = lazyNamed(() => import('./pages/admin/AdminPlansPage'), 'AdminPlansPage');
const AdminPlanFormPage = lazyNamed(() => import('./pages/admin/AdminPlanFormPage'), 'AdminPlanFormPage');

// Legal & Compliance Pages (Parte 10)
const TermsPage = lazyNamed(() => import('./pages/legal/TermsPage'), 'TermsPage');
const PrivacyPage = lazyNamed(() => import('./pages/legal/PrivacyPage'), 'PrivacyPage');
const CookiesPage = lazyNamed(() => import('./pages/legal/CookiesPage'), 'CookiesPage');
const CancellationPolicyPage = lazyNamed(() => import('./pages/legal/CancellationPolicyPage'), 'CancellationPolicyPage');
const RefundPolicyPage = lazyNamed(() => import('./pages/legal/RefundPolicyPage'), 'RefundPolicyPage');
const LegalNoticePage = lazyNamed(() => import('./pages/legal/LegalNoticePage'), 'LegalNoticePage');
const AcceptableUsePage = lazyNamed(() => import('./pages/legal/AcceptableUsePage'), 'AcceptableUsePage');
const ContactPage = lazyNamed(() => import('./pages/legal/ContactPage'), 'ContactPage');

// Client Legal & Contract Pages (Parte 10)
const ClientPrivacyPage = lazyNamed(() => import('./pages/client/ClientPrivacyPage'), 'ClientPrivacyPage');
const ClientContractPage = lazyNamed(() => import('./pages/client/ClientContractPage'), 'ClientContractPage');

// Admin Moderation & Privacy Pages (Parte 10)
const AdminReportsPage = lazyNamed(() => import('./pages/admin/AdminReportsPage'), 'AdminReportsPage');
const AdminPrivacyPage = lazyNamed(() => import('./pages/admin/AdminPrivacyPage'), 'AdminPrivacyPage');

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [currentSearch, setCurrentSearch] = useState<string>(() => {
    return window.location.search || '';
  });

  // Listen for browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setCurrentSearch(window.location.search || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    // Handle anchor links on home page
    if (path.includes('#')) {
      const [basePath, anchor] = path.split('#');
      const targetBase = (basePath || '/').split('?')[0] || '/';

      if (currentPath !== targetBase) {
        window.history.pushState({}, '', path);
        setCurrentPath(targetBase);
        setCurrentSearch(window.location.search || '');
        setTimeout(() => {
          const el = document.getElementById(anchor);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.history.pushState({}, '', path);
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Standard navigation
    window.history.pushState({}, '', path);
    const [nextPathname, nextQuery] = path.split('?');
    setCurrentPath(nextPathname || '/');
    setCurrentSearch(nextQuery ? `?${nextQuery}` : '');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Helper for demo profiles
  const openDemoProfile = (slug: string = 'barberia-wilson') => {
    let target = `/p/${slug}`;
    if (slug === 'barberia') target = '/demo/barberia';
    else if (slug === 'restaurante') target = '/demo/restaurante';
    else if (slug === 'inmobiliaria') target = '/demo/inmobiliaria';
    navigate(target);
  };

  // Detectar parámetros de activación incluso si el enlace apunta a raíz o /login
  const searchParams = new URLSearchParams(currentSearch.replace(/&amp;/g, '&'));
  const hasActivationQuery = Boolean(searchParams.get('token') || searchParams.get('oobCode'));

  const renderPage = (): React.ReactNode => {
  // Perfiles públicos NFC y QR dinámicos
  if (currentPath.startsWith('/p/')) {
    const slug = currentPath.replace(/^\/p\//, '');
    return (
      <ProfilePage
        slug={slug}
        onNavigateHome={() => navigate('/')}
        onSelectDemoProfile={(s) => navigate(`/demo/${s}`)}
      />
    );
  }

  if (currentPath.startsWith('/q/')) {
    const slug = currentPath.replace(/^\/q\//, '');
    return (
      <QrRedirectPage
        slug={slug}
        onNavigateHome={() => navigate('/')}
        onSelectDemoProfile={(s) => navigate(`/demo/${s}`)}
      />
    );
  }

  if (currentPath.startsWith('/demo/')) {
    const slug = currentPath.replace(/^\/demo\//, '');
    return (
      <ProfilePage
        slug={slug}
        onNavigateHome={() => navigate('/')}
        onSelectDemoProfile={(s) => navigate(`/demo/${s}`)}
      />
    );
  }
  // =========================================================================
  // PUBLIC AUTHENTICATION & ACTIVATION ROUTES
  // =========================================================================

  // Route: /activar, /cliente/activar (Flujo seguro de activación por correo)
  if (
    currentPath === '/activar' || currentPath === '/activar/' ||
    currentPath === '/cliente/activar' || currentPath === '/cliente/activar/' ||
    (hasActivationQuery && (currentPath === '/' || currentPath === '/login' || currentPath === '/login/'))
  ) {
    return <ClientActivationPage key={currentSearch || 'default'} onNavigate={navigate} />;
  }

  // Route: /login, /admin/login, /cliente/login, /ingresar, /iniciar-sesion
  if (
    currentPath === '/login' || currentPath === '/login/' ||
    currentPath === '/admin/login' || currentPath === '/admin/login/' ||
    currentPath === '/cliente/login' || currentPath === '/cliente/login/' ||
    currentPath === '/admin/registro' || currentPath === '/admin/registro/' ||
    currentPath === '/admin/register' || currentPath === '/admin/register/' ||
    currentPath === '/ingresar' || currentPath === '/iniciar-sesion'
  ) {
    return <LoginPage onNavigate={navigate} initialMode="login" />;
  }

  // Route: /recuperar, /recuperar-contrasena, /cliente/recuperar
  if (
    currentPath === '/recuperar' || currentPath === '/recuperar/' ||
    currentPath === '/recuperar-contrasena' || currentPath === '/recuperar-contrasena/' ||
    currentPath === '/cliente/recuperar' || currentPath === '/cliente/recuperar/'
  ) {
    return <LoginPage onNavigate={navigate} initialMode="recovery" />;
  }

  // =========================================================================
  // ADMIN PANEL ROUTES (Solo accesibles por ADMIN)
  // =========================================================================

  // All other /admin routes require authentication
  if (currentPath.startsWith('/admin')) {
    let adminContent: React.ReactNode = null;

    // Route: /admin/clientes/nuevo
    if (currentPath === '/admin/clientes/nuevo' || currentPath === '/admin/clientes/nuevo/') {
      adminContent = <AdminClientFormPage onNavigate={navigate} />;
    } else {
      // Route: /admin/clientes/:id or /admin/clientes/:id/editar
      const editMatch = currentPath.match(/^\/admin\/clientes\/([^/]+)(\/editar)?\/?$/);
      if (editMatch && editMatch[1] !== 'nuevo') {
        const clientId = editMatch[1];
        adminContent = <AdminClientFormPage clientId={clientId} onNavigate={navigate} />;
      } else if (currentPath === '/admin/clientes' || currentPath === '/admin/clientes/') {
        adminContent = <AdminClientsPage onNavigate={navigate} />;
      } else if (currentPath === '/admin/planes/nuevo' || currentPath === '/admin/planes/nuevo/') {
        adminContent = <AdminPlanFormPage onNavigate={navigate} />;
      } else if (currentPath.startsWith('/admin/planes/') && currentPath !== '/admin/planes/') {
        const planId = currentPath.replace(/^\/admin\/planes\//, '').replace(/\/$/, '');
        adminContent = <AdminPlanFormPage planId={planId} onNavigate={navigate} />;
      } else if (currentPath === '/admin/planes' || currentPath === '/admin/planes/') {
        adminContent = <AdminPlansPage onNavigate={navigate} />;
      } else if (currentPath === '/admin/perfiles' || currentPath === '/admin/perfiles/') {
        adminContent = <AdminProfilesPage onNavigate={navigate} />;
      } else if (currentPath === '/admin/productos' || currentPath === '/admin/productos/') {
        adminContent = <AdminProductsPage onNavigate={navigate} />;
      } else if (currentPath === '/admin/reportes' || currentPath === '/admin/reportes/') {
        adminContent = <AdminReportsPage onNavigate={navigate} />;
      } else if (currentPath === '/admin/privacidad' || currentPath === '/admin/privacidad/') {
        adminContent = <AdminPrivacyPage onNavigate={navigate} />;
      } else if (currentPath === '/admin/configuracion' || currentPath === '/admin/configuracion/') {
        adminContent = <AdminSettingsPage onNavigate={navigate} />;
      } else {
        // Default admin route: /admin (Dashboard)
        adminContent = <AdminDashboardPage onNavigate={navigate} />;
      }
    }

    return <ProtectedRoute onNavigate={navigate}>{adminContent}</ProtectedRoute>;
  }

  // =========================================================================
  // CLIENT PORTAL ROUTES (Solo accesibles por CLIENT)
  // =========================================================================

  // All other /cliente routes require client authentication
  if (currentPath.startsWith('/cliente')) {
    let clientContent: React.ReactNode = null;

    if (currentPath === '/cliente/perfil' || currentPath === '/cliente/perfil/') {
      clientContent = <ClientProfilePage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/servicios' || currentPath === '/cliente/servicios/') {
      clientContent = <ClientServicesPage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/cuentas' || currentPath === '/cliente/cuentas/') {
      clientContent = <ClientBankAccountsPage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/horarios' || currentPath === '/cliente/horarios/') {
      clientContent = <ClientHoursPage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/redes' || currentPath === '/cliente/redes/') {
      clientContent = <ClientSocialsPage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/qr' || currentPath === '/cliente/qr/') {
      clientContent = <ClientQrPage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/configuracion' || currentPath === '/cliente/configuracion/') {
      clientContent = <ClientSettingsPage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/analytics' || currentPath === '/cliente/analytics/') {
      clientContent = <ClientAnalyticsPage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/soporte' || currentPath === '/cliente/soporte/') {
      clientContent = <ClientSupportPage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/privacidad' || currentPath === '/cliente/privacidad/') {
      clientContent = <ClientPrivacyPage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/contrato' || currentPath === '/cliente/contrato/') {
      clientContent = <ClientContractPage onNavigate={navigate} />;
    } else {
      // Default: /cliente/dashboard o /cliente
      clientContent = <ClientDashboardPage onNavigate={navigate} />;
    }

    return <ClientRoute onNavigate={navigate}>{clientContent}</ClientRoute>;
  }

  // =========================================================================
  // LEGAL & COMPLIANCE ROUTES (Parte 10)
  // =========================================================================

  if (currentPath === '/terminos' || currentPath === '/terminos/') {
    return <TermsPage onNavigate={navigate} />;
  }
  if (currentPath === '/privacidad' || currentPath === '/privacidad/') {
    return <PrivacyPage onNavigate={navigate} />;
  }
  if (currentPath === '/cookies' || currentPath === '/cookies/') {
    return <CookiesPage onNavigate={navigate} />;
  }
  if (currentPath === '/politica-cancelacion' || currentPath === '/politica-cancelacion/') {
    return <CancellationPolicyPage onNavigate={navigate} />;
  }
  if (currentPath === '/politica-reembolso' || currentPath === '/politica-reembolso/') {
    return <RefundPolicyPage onNavigate={navigate} />;
  }
  if (currentPath === '/aviso-legal' || currentPath === '/aviso-legal/') {
    return <LegalNoticePage onNavigate={navigate} />;
  }
  if (currentPath === '/uso-aceptable' || currentPath === '/uso-aceptable/') {
    return <AcceptableUsePage onNavigate={navigate} />;
  }
  if (currentPath === '/contacto' || currentPath === '/contacto/') {
    return <ContactPage onNavigate={navigate} />;
  }

  // =========================================================================
  // PUBLIC & COMMERCE ROUTES (Partes 1-4 intactas + Planes)
  // =========================================================================

  // Route: Planes y Precios (/planes)
  if (currentPath === '/planes' || currentPath === '/planes/') {
    return <PlansPage onNavigate={navigate} />;
  }

  // Route: Comparar Planes (/planes/comparar)
  if (currentPath === '/planes/comparar' || currentPath === '/planes/comparar/') {
    return <ComparePlansPage onNavigate={navigate} />;
  }

  // Route: Individual product page (/productos/:slug)
  if (currentPath.startsWith('/productos/') && currentPath !== '/productos/') {
    const slug = currentPath.replace(/^\/productos\//, '').split('/')[0];
    const product = getProductBySlug(slug);
    if (product) {
      return (
        <ProductDetailPage
          product={product}
          onNavigate={navigate}
          onOpenDemo={openDemoProfile}
        />
      );
    }
  }

  // Route: Main catalog page (/productos)
  if (currentPath === '/productos' || currentPath === '/productos/') {
    return (
      <ProductsPage
        onNavigate={navigate}
        onOpenDemo={openDemoProfile}
      />
    );
  }

  // Default to HomePage
  return (
    <HomePage
      onNavigate={navigate}
      onOpenDemo={openDemoProfile}
    />
  );
  };

  return (
    <GlobalMotionShell routeKey={currentPath}>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120]">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600/30 border-t-blue-600 animate-spin" />
          </div>
        }
      >
        {renderPage()}
      </Suspense>
    </GlobalMotionShell>
  );
}
