/**
 * Payments REST API Router
 * 
 * Handles payment intent creation for card, OXXO, and SPEI payments.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import {
  StripeService,
  PaymentError,
  ValidationError,
  OrderNotFoundError,
  OrderAlreadyPaidError,
  VoucherExpiredError,
} from '@ecoomerce-jardineria/stripe';
import { db } from '@ecoomerce-jardineria/db';
import { orders, vouchers } from '@ecoomerce-jardineria/db';
import type { Env } from '../app';

// Rate limiting store (in-memory for MVP, use Redis for production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiting middleware
 */
function rateLimit(getKey: (c: any) => string, maxRequests: number, windowMs: number) {
  return async (c: any, next: () => Promise<void>) => {
    const key = getKey(c);
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (entry && entry.resetAt > now) {
      if (entry.count >= maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return c.json(
          { code: 'RATE_LIMIT_EXCEEDED', message: `Rate limit exceeded, retry after ${retryAfter}s` },
          { status: 429, headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetAt.toString(),
          }}
        );
      }
      entry.count++;
    } else {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    }

    await next();
  };
}

/**
 * IP-based rate limit key generator
 */
function getRateLimitKey(c: any, endpoint: string): string {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0] || c.req.header('cf-connecting-ip') || 'unknown';
  return `${ip}:${endpoint}`;
}

// Validation schemas
const createIntentSchema = z.object({
  orderId: z.string().uuid('Invalid order ID format'),
  amount: z.number().int().positive('Amount must be a positive integer in MXN cents'),
  customerEmail: z.string().email('Invalid email format'),
});

const createOXXOSchema = createIntentSchema.extend({
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Customer name too long'),
});

const createSPEISchema = createIntentSchema;

// Idempotency cache (in-memory for MVP)
const idempotencyCache = new Map<string, { response: any; expiresAt: number }>();

function getIdempotencyKey(c: any): string | null {
  const key = c.req.header('Idempotency-Key');
  if (!key) return null;
  
  // Include order ID and payment method in the cache key
  return key;
}

function checkIdempotency(c: any): { cached: boolean; response: any } | null {
  const key = getIdempotencyKey(c);
  if (!key) return null;

  const cached = idempotencyCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { cached: true, response: cached.response };
  }
  
  return null;
}

function setIdempotencyCache(c: any, response: any) {
  const key = getIdempotencyKey(c);
  if (!key) return;

  // Cache for 24 hours
  idempotencyCache.set(key, {
    response,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
}

export const paymentsRouter = new Hono<{ Bindings: Env }>();

// POST /payments/create-intent - Create card payment intent
paymentsRouter.post(
  '/create-intent',
  rateLimit((c) => getRateLimitKey(c, 'create-intent'), 10, 60 * 1000),
  async (c) => {
    // Check idempotency
    const idempotencyCheck = checkIdempotency(c);
    if (idempotencyCheck?.cached) {
      return c.json(idempotencyCheck.response);
    }

    // Parse and validate request
    const body = await c.req.json();
    const parsed = createIntentSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { code: 'INVALID_REQUEST', message: parsed.error.errors[0]?.message || 'Validation failed' },
        400
      );
    }

    const { orderId, amount, customerEmail } = parsed.data;

    try {
      // Verify order exists and is pending
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
      });

      if (!order) {
        throw new OrderNotFoundError(orderId);
      }

      if (order.status !== 'pending') {
        throw new OrderAlreadyPaidError(orderId);
      }

      // Create Stripe payment intent
      const stripeService = new StripeService({
        secretKey: c.env.STRIPE_SECRET_KEY,
        webhookSecret: c.env.STRIPE_WEBHOOK_SECRET,
        companyName: c.env.COMPANY_NAME,
        companyCLABE: c.env.COMPANY_CLABE,
      });

      const result = await stripeService.createPaymentIntent({
        orderId,
        amount,
        customerEmail,
        paymentMethod: 'card',
      });

      const response = {
        clientSecret: result.clientSecret,
        paymentIntentId: result.id,
        amount: result.amount,
        currency: result.currency,
      };

      // Cache response for idempotency
      setIdempotencyCache(c, response);

      return c.json(response);
    } catch (error) {
      if (error instanceof PaymentError) {
        return c.json({ code: error.code, message: error.message }, error.httpStatus as 400 | 401 | 404 | 409 | 410 | 500);
      }
      console.error('Payment intent error:', error);
      return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to create payment intent' }, 500);
    }
  }
);

// POST /payments/create-oxxo-voucher - Create OXXO payment with voucher
paymentsRouter.post(
  '/create-oxxo-voucher',
  rateLimit((c) => getRateLimitKey(c, 'create-oxxo'), 5, 60 * 1000),
  async (c) => {
    // Check idempotency
    const idempotencyCheck = checkIdempotency(c);
    if (idempotencyCheck?.cached) {
      return c.json(idempotencyCheck.response);
    }

    // Parse and validate request
    const body = await c.req.json();
    const parsed = createOXXOSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { code: 'INVALID_REQUEST', message: parsed.error.errors[0]?.message || 'Validation failed' },
        400
      );
    }

    const { orderId, amount, customerEmail, customerName } = parsed.data;

    try {
      // Verify order exists and is pending
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
      });

      if (!order) {
        throw new OrderNotFoundError(orderId);
      }

      if (order.status !== 'pending') {
        throw new OrderAlreadyPaidError(orderId);
      }

      // Create Stripe OXXO payment and generate voucher
      const stripeService = new StripeService({
        secretKey: c.env.STRIPE_SECRET_KEY,
        webhookSecret: c.env.STRIPE_WEBHOOK_SECRET,
        companyName: c.env.COMPANY_NAME,
        companyCLABE: c.env.COMPANY_CLABE,
      });

      const result = await stripeService.createOXXOPaymentIntent({
        orderId,
        amount,
        customerEmail,
        customerName,
        paymentMethod: 'oxxo',
      });

      // Store voucher in database
      await db.insert(vouchers).values({
        id: result.reference,
        orderId,
        paymentIntentId: result.id,
        pdfData: result.pdfBuffer.toString('base64'),
        amount: amount.toString(),
        customerName,
        reference: result.reference,
        expiresAt: result.expiresAt,
      });

      const response = {
        voucherUrl: result.voucherUrl,
        expiresAt: result.expiresAt.toISOString(),
        amount: result.amount,
        reference: result.reference,
      };

      // Cache response for idempotency
      setIdempotencyCache(c, response);

      return c.json(response);
    } catch (error) {
      if (error instanceof PaymentError) {
        return c.json({ code: error.code, message: error.message }, error.httpStatus as 400 | 401 | 404 | 409 | 410 | 500);
      }
      console.error('OXXO voucher error:', error);
      return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to create OXXO voucher' }, 500);
    }
  }
);

// GET /payments/oxxo-voucher/:id - Download OXXO voucher PDF
paymentsRouter.get('/oxxo-voucher/:id', async (c) => {
  const voucherId = c.req.param('id');

  try {
    const voucher = await db.query.vouchers.findFirst({
      where: eq(vouchers.id, voucherId),
    });

    if (!voucher) {
      return c.json({ code: 'VOUCHER_NOT_FOUND', message: 'Voucher not found' }, 404);
    }

    // Check if voucher has expired
    if (new Date(voucher.expiresAt) < new Date()) {
      throw new VoucherExpiredError(voucherId, new Date(voucher.expiresAt));
    }

    // Return PDF
    const pdfBuffer = Buffer.from(voucher.pdfData, 'base64');

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="voucher-${voucherId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    if (error instanceof VoucherExpiredError) {
      return c.json({ code: error.code, message: error.message }, 410);
    }
    if (error instanceof PaymentError) {
      return c.json({ code: error.code, message: error.message }, error.httpStatus as 400 | 401 | 404 | 409 | 410 | 500);
    }
    console.error('Voucher download error:', error);
    return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to download voucher' }, 500);
  }
});

// POST /payments/get-clabe - Get SPEI CLABE for bank transfer
paymentsRouter.post(
  '/get-clabe',
  rateLimit((c) => getRateLimitKey(c, 'get-clabe'), 5, 60 * 1000),
  async (c) => {
    // Check idempotency
    const idempotencyCheck = checkIdempotency(c);
    if (idempotencyCheck?.cached) {
      return c.json(idempotencyCheck.response);
    }

    // Parse and validate request
    const body = await c.req.json();
    const parsed = createSPEISchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { code: 'INVALID_REQUEST', message: parsed.error.errors[0]?.message || 'Validation failed' },
        400
      );
    }

    const { orderId, amount, customerEmail } = parsed.data;

    try {
      // Verify order exists and is pending
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
      });

      if (!order) {
        throw new OrderNotFoundError(orderId);
      }

      if (order.status !== 'pending') {
        throw new OrderAlreadyPaidError(orderId);
      }

      // Generate CLABE for SPEI
      const stripeService = new StripeService({
        secretKey: c.env.STRIPE_SECRET_KEY,
        webhookSecret: c.env.STRIPE_WEBHOOK_SECRET,
        companyName: c.env.COMPANY_NAME,
        companyCLABE: c.env.COMPANY_CLABE,
      });

      const result = stripeService.generateSPEICLABE(orderId, amount);

      const response = {
        clabe: result.clabe,
        bank: 'STP',
        beneficiary: c.env.COMPANY_NAME.toUpperCase(),
        reference: result.reference,
        amount,
        expiresAt: result.expiresAt.toISOString(),
      };

      // Cache response for idempotency
      setIdempotencyCache(c, response);

      return c.json(response);
    } catch (error) {
      if (error instanceof PaymentError) {
        return c.json({ code: error.code, message: error.message }, error.httpStatus as 400 | 401 | 404 | 409 | 410 | 500);
      }
      console.error('SPEI CLABE error:', error);
      return c.json({ code: 'INTERNAL_ERROR', message: 'Failed to generate CLABE' }, 500);
    }
  }
);
