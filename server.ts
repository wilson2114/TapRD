import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  createClientAccessHandler,
  resendClientInvitationHandler,
  suspendClientAccessHandler,
  reactivateClientAccessHandler,
  verifyClientAccessStatusHandler,
  batchVerifyClientAccessStatusesHandler,
  completeActivationHandler,
  toggleClientProfileStatusHandler,
  getClientAnalyticsHandler,
  trackPublicAnalyticsHandler
} from './server/clientAccessController';

function isAllowedCorsOrigin(origin: string, requestHost: string): boolean {
  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();
    const cleanHost = requestHost.split(':')[0].toLowerCase();

    if (cleanHost && hostname === cleanHost) return true;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname === 'taprd.com' || hostname.endsWith('.taprd.com')) return true;
    if (hostname === 'tap-rd.vercel.app') return true;
    if (hostname.endsWith('.run.app')) return true;

    return false;
  } catch {
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware de parsing JSON con límite de tamaño para evitar ataques DoS
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Headers de seguridad HTTP (Requirement 18 & 19)
  app.use((req, res, next) => {
    // 1. Headers de protección estándar
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.header(
      'Content-Security-Policy-Report-Only',
      "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com https://vitals.vercel-insights.com https://va.vercel-scripts.com;"
    );

    if (req.path === '/cliente' || req.path.startsWith('/cliente/')) {
      res.header('X-Robots-Tag', 'noindex, nofollow');
    }

    // 2. Control de CORS estricto para TapRD
    const origin = req.headers.origin;
    const host = req.get('host') || '';

    if (origin && isAllowedCorsOrigin(origin, host)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Max-Age', '86400');
    }

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    // 3. Protección CSRF para peticiones que modifican estado en /api/*
    if (
      req.path.startsWith('/api/') &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())
    ) {
      const fetchSite = String(req.headers['sec-fetch-site'] || '').toLowerCase();
      if (origin && !isAllowedCorsOrigin(origin, host)) {
        res.status(403).json({ error: 'Origen no autorizado (protección CSRF).' });
        return;
      }
      if (!origin && req.headers.referer && !isAllowedCorsOrigin(req.headers.referer, host)) {
        res.status(403).json({ error: 'Referer no autorizado (protección CSRF).' });
        return;
      }
      if (fetchSite === 'cross-site' && (!origin || !isAllowedCorsOrigin(origin, host))) {
        res.status(403).json({ error: 'Solicitud cross-site bloqueada (protección CSRF).' });
        return;
      }
    }

    next();
  });

  // Rutas de API backend primero
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'TapRD Backend API' });
  });

  // Endpoints administrativos de gestión de accesos (Parte 7.1)
  app.post('/api/admin/client-access/create', createClientAccessHandler);
  app.post('/api/admin/client-access/resend', resendClientInvitationHandler);
  app.post('/api/admin/client-access/suspend', suspendClientAccessHandler);
  app.post('/api/admin/client-access/reactivate', reactivateClientAccessHandler);
  app.post('/api/admin/client-access/activate', reactivateClientAccessHandler);
  app.post('/api/admin/client-access/verify-status', verifyClientAccessStatusHandler);
  app.post('/api/admin/client-access/batch-verify-status', batchVerifyClientAccessStatusesHandler);
  app.post('/api/admin/clients/toggle-status', toggleClientProfileStatusHandler);

  // Endpoint de activación segura de clientes y analytics
  app.post('/api/client/complete-activation', completeActivationHandler);
  app.get('/api/client/analytics', getClientAnalyticsHandler);
  app.post('/api/public/analytics/track', trackPublicAnalyticsHandler);

  // Garantía: Si alguna ruta /api/* no coincide, devolver siempre JSON y nunca HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `Ruta de API no encontrada: ${req.method} ${req.path}` });
  });

  // Vite middleware para desarrollo o archivos estáticos en producción
  const isProduction = process.env.NODE_ENV === 'production' || !process.argv[1]?.endsWith('server.ts');

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Buscar carpeta dist de forma resiliente tanto en CWD como relativo al archivo actual
    const currentDir = typeof __dirname !== 'undefined'
      ? __dirname
      : path.dirname(fileURLToPath(import.meta.url));
    const distPath = fs.existsSync(path.join(currentDir, 'index.html'))
      ? currentDir
      : path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TapRD Server] Ejecutándose en el puerto ${PORT} (0.0.0.0)`);
  });
}

startServer().catch((err) => {
  console.error('[TapRD Server] Error fatal al iniciar el servidor:', err);
});
