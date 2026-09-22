/**
 * Limitador de frecuencia (Rate Limiter) en memoria para el backend.
 * Protege endpoints y funciones sensibles contra ataques de denegación,
 * spam de invitaciones o fuerza bruta. (Regla 21)
 */

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Limpieza periódica de registros antiguos cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    record.timestamps = record.timestamps.filter(ts => now - ts < 600000); // 10 min
    if (record.timestamps.length === 0) {
      memoryStore.delete(key);
    }
  }
}, 300000);

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  action: string;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; retryAfterMs: number } {
  const key = `${options.action}:${identifier}`;
  const now = Date.now();
  let record = memoryStore.get(key);

  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(key, record);
  }

  // Filtrar marcas de tiempo dentro de la ventana de tiempo
  record.timestamps = record.timestamps.filter(ts => now - ts < options.windowMs);

  if (record.timestamps.length >= options.maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterMs = options.windowMs - (now - oldestTimestamp);
    return {
      allowed: false,
      retryAfterMs: Math.max(1000, retryAfterMs)
    };
  }

  record.timestamps.push(now);
  return { allowed: true, retryAfterMs: 0 };
}
