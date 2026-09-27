import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  createClientAccessHandler,
  resendClientInvitationHandler,
  suspendClientAccessHandler,
  reactivateClientAccessHandler
} from './server/clientAccessController';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware de parsing JSON con límite de tamaño para evitar ataques DoS
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Headers de seguridad HTTP (Requirement 18 & 19)
  app.use((req, res, next) => {
    // 1. Headers de protección estándar
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.header('Permissions-Policy', 'camera=(), microphone=(), payment=()');

    // 2. Control de CORS dinámico para TapRD
    const origin = req.headers.origin;
    const host = req.get('host') || '';

    // Permitir solicitudes del mismo origen o desarrollo
    if (origin) {
      if (
        origin.includes(host) || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        origin.includes('run.app') ||
        origin.includes('taprd.com')
      ) {
        res.header('Access-Control-Allow-Origin', origin);
      }
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
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

  // Garantía: Si alguna ruta /api/* no coincide, devolver siempre JSON y nunca HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `Ruta de API no encontrada: ${req.method} ${req.path}` });
  });

  // Vite middleware para desarrollo o archivos estáticos en producción
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
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
