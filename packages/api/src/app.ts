/**
 * Hono API Application
 * 
 * Sets up the Hono REST API for payment endpoints and webhooks.
 * This is separate from the tRPC router for handling raw body parsing
 * required for Stripe webhook signature verification.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { paymentsRouter } from './routes/payments';
import { webhooksRouter } from './routes/webhooks';

export interface Env {
  ALLOWED_ORIGINS: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  COMPANY_NAME: string;
  COMPANY_CLABE: string;
  DATABASE_URL: string;
}

export function createApp(env: Env) {
  const app = new Hono<{ Bindings: Env }>();

  // CORS for payment endpoints
  app.use('/*', cors({
    origin: env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
  }));

  // Health check
  app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // Mount payment routes
  app.route('/payments', paymentsRouter);

  // Mount webhook routes
  app.route('/webhooks', webhooksRouter);

  return app;
}

export type App = ReturnType<typeof createApp>;
