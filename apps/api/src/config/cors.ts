import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js';

const DEFAULT_ORIGINS = ['http://localhost:5173'];

/**
 * Builds CORS options from CORS_ORIGINS (comma-separated list).
 * Defaults to the Vite dev server so apps/web works out of the box.
 */
export function buildCorsOptions(raw = process.env.CORS_ORIGINS): CorsOptions {
  const origins = raw
    ? raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : DEFAULT_ORIGINS;
  return {
    origin: origins.includes('*') ? true : origins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  };
}
