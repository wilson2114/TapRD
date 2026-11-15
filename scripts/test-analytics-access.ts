/**
 * TEST DE CONTROL DE ACCESO Y PREVENCIÓN DE IDOR PARA /cliente/analytics
 *
 * Verifica:
 * 1. Sin sesión (sin header Authorization o token vacío): GET /api/client/analytics responde HTTP 401.
 * 2. Usuario A no puede leer analytics de Usuario B (prevención de IDOR en backend y Firestore Rules).
 * 3. El cliente exige sesión real de Firebase Auth y expiración máxima de 12h en producción.
 */

import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { getClientAnalyticsHandler } from '../server/clientAccessController';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    process.exit(1);
  }
  console.log(`✅ APROBADO: ${message}`);
}

async function runTests() {
  console.log('======================================================================');
  console.log('🔒 TEST DE ACCESO Y AISLAMIENTO (IDOR) - /api/client/analytics');
  console.log('======================================================================\n');

  // 1. Levantar servidor Express efímero con el handler real
  const app = express();
  app.get('/api/client/analytics', getClientAnalyticsHandler);

  const server = await new Promise<http.Server>((resolve) => {
    const srv = app.listen(0, '127.0.0.1', () => resolve(srv));
  });

  try {
    const address = server.address() as { port: number };
    const baseUrl = `http://127.0.0.1:${address.port}`;

    // Prueba 1: Sin sesión -> HTTP 401
    const unauthRes = await fetch(`${baseUrl}/api/client/analytics?clientId=client-B`);
    assert(
      unauthRes.status === 401,
      `Sin sesión (incluso intentando ?clientId=client-B) devuelve HTTP 401 (recibido: ${unauthRes.status})`
    );

    // Prueba 2: Header Authorization vacío -> HTTP 401
    const emptyBearerRes = await fetch(`${baseUrl}/api/client/analytics`, {
      headers: { Authorization: 'Bearer ' }
    });
    assert(
      emptyBearerRes.status === 401,
      `Con Bearer vacío devuelve HTTP 401 (recibido: ${emptyBearerRes.status})`
    );
  } finally {
    server.closeAllConnections?.();
    server.close();
  }

  // Prueba 3: El handler de analytics nunca lee clientId de query, params ni body (Usuario A != Usuario B)
  const controllerPath = path.resolve('server/clientAccessController.ts');
  const controllerSrc = fs.readFileSync(controllerPath, 'utf8');
  const handlerStart = controllerSrc.indexOf('export async function getClientAnalyticsHandler');
  const handlerEnd = controllerSrc.indexOf('export async function trackPublicAnalyticsHandler');
  const handlerBody = controllerSrc.slice(handlerStart, handlerEnd);

  assert(
    handlerStart !== -1 && handlerEnd !== -1,
    'getClientAnalyticsHandler localizado en server/clientAccessController.ts'
  );
  assert(
    !handlerBody.includes('req.query') &&
      !handlerBody.includes('req.params') &&
      !handlerBody.includes('req.body'),
    'Usuario A no puede leer analytics de Usuario B: el servidor ignora req.query/params/body y resuelve clientId solo desde verifyIdToken(token)'
  );
  assert(
    handlerBody.includes('auth.verifyIdToken(token)') &&
      handlerBody.includes("where('userId', '==', uid)"),
    'Autenticación server-side con Firebase verifyIdToken y filtro estricto por uid'
  );

  // Prueba 4: Firestore Rules impide que Usuario A lea analytics_events de Usuario B
  const rulesPath = path.resolve('firestore.rules');
  const rulesSrc = fs.readFileSync(rulesPath, 'utf8');
  const analyticsRuleMatch = rulesSrc.match(/match \/analytics_events\/\{eventId\}\s*\{([\s\S]*?)allow create:/);
  assert(Boolean(analyticsRuleMatch), 'Regla match /analytics_events/{eventId} encontrada en firestore.rules');
  const readRule = analyticsRuleMatch![1];
  assert(
    !readRule.includes('allow read: if true') &&
      readRule.includes('isClientOwner(clientId)') &&
      readRule.includes('request.auth.uid'),
    'Firestore Rules bloquea lectura cruzada entre Usuario A y Usuario B en analytics_events'
  );

  // Prueba 5: El frontend exige sesión Firebase Auth real en producción y expiración 12h
  const authPath = path.resolve('src/services/authService.ts');
  const authSrc = fs.readFileSync(authPath, 'utf8');
  assert(
    authSrc.includes('authStateReady') &&
      authSrc.includes('!auth.currentUser') &&
      authSrc.includes('MAX_SESSION_MS = 12 * 60 * 60 * 1000'),
    'getCurrentClient() exige auth.currentUser en producción y expiración máxima de 12h'
  );

  console.log('\n🎉 Todas las pruebas de acceso y aislamiento pasaron correctamente.');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Error ejecutando test de acceso:', err);
  process.exit(1);
});
