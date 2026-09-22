import React, { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { getProductBySlug } from './data/products';

// Auth Pages (Unified Login & Activation)
import { LoginPage } from './pages/auth/LoginPage';
import { ClientActivationPage } from './pages/client/ClientActivationPage';

// Admin Panel Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminClientsPage } from './pages/admin/AdminClientsPage';
import { AdminClientFormPage } from './pages/admin/AdminClientFormPage';
import { AdminProfilesPage } from './pages/admin/AdminProfilesPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { ProtectedRoute } from './components/admin/ProtectedRoute';

// Client Portal Pages
import { ClientDashboardPage } from './pages/client/ClientDashboardPage';
import { ClientProfilePage } from './pages/client/ClientProfilePage';
import { ClientServicesPage } from './pages/client/ClientServicesPage';
import { ClientHoursPage } from './pages/client/ClientHoursPage';
import { ClientSocialsPage } from './pages/client/ClientSocialsPage';
import { ClientQrPage } from './pages/client/ClientQrPage';
import { ClientSupportPage } from './pages/client/ClientSupportPage';
import { ClientRoute } from './components/client/ClientRoute';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Listen for browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    // Handle anchor links on home page
    if (path.includes('#')) {
      const [basePath, anchor] = path.split('#');
      const targetBase = basePath || '/';

      if (currentPath !== targetBase) {
        window.history.pushState({}, '', path);
        setCurrentPath(targetBase);
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
    setCurrentPath(path);
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

  // =========================================================================
  // PUBLIC AUTHENTICATION & ACTIVATION ROUTES
  // =========================================================================

  // Route: /login, /admin/login, /cliente/login, /ingresar, /iniciar-sesion
  if (
    currentPath === '/login' || currentPath === '/login/' || currentPath.startsWith('/login?') ||
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

  // Route: /activar, /cliente/activar (Flujo seguro de activación por correo)
  if (
    currentPath === '/activar' || currentPath === '/activar/' || currentPath.startsWith('/activar?') ||
    currentPath === '/cliente/activar' || currentPath === '/cliente/activar/' || currentPath.startsWith('/cliente/activar?')
  ) {
    return <ClientActivationPage onNavigate={navigate} />;
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
      } else if (currentPath === '/admin/perfiles' || currentPath === '/admin/perfiles/') {
        adminContent = <AdminProfilesPage onNavigate={navigate} />;
      } else if (currentPath === '/admin/productos' || currentPath === '/admin/productos/') {
        adminContent = <AdminProductsPage onNavigate={navigate} />;
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
    } else if (currentPath === '/cliente/horarios' || currentPath === '/cliente/horarios/') {
      clientContent = <ClientHoursPage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/redes' || currentPath === '/cliente/redes/') {
      clientContent = <ClientSocialsPage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/qr' || currentPath === '/cliente/qr/') {
      clientContent = <ClientQrPage onNavigate={navigate} />;
    } else if (currentPath === '/cliente/soporte' || currentPath === '/cliente/soporte/') {
      clientContent = <ClientSupportPage onNavigate={navigate} />;
    } else {
      // Default: /cliente/dashboard or /cliente
      clientContent = <ClientDashboardPage onNavigate={navigate} />;
    }

    return <ClientRoute onNavigate={navigate}>{clientContent}</ClientRoute>;
  }

  // =========================================================================
  // PUBLIC & COMMERCE ROUTES (Partes 1-4 intactas)
  // =========================================================================

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

  // Route: Public profile (/p/:slug) - Section 18
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

  // Route: Legacy demo route (/demo/:slug)
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

  // Default to HomePage
  return (
    <HomePage
      onNavigate={navigate}
      onOpenDemo={openDemoProfile}
    />
  );
}
