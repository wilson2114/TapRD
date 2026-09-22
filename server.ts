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

  // Middleware de parsing JSON
  app.use(express.json());

  // Rutas de API backend primero
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'TapRD Backend API' });
  });

  // Endpoints administrativos de gestión de accesos (Parte 7.1)
  app.post('/api/admin/client-access/create', createClientAccessHandler);
  app.post('/api/admin/client-access/resend', resendClientInvitationHandler);
  app.post('/api/admin/client-access/suspend', suspendClientAccessHandler);
  app.post('/api/admin/client-access/reactivate', reactivateClientAccessHandler);

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
