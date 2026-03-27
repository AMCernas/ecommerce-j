/**
 * Stripe Webhook Verification and Event Parsing
 * 
 * Handles signature verification and event parsing for Stripe webhooks.
 * Ensures all webhook requests are authenticated via HMAC-SHA256.
 */

import crypto from 'node:crypto';
import Stripe from 'stripe';
import {
  WebhookSignatureError,
  MissingSignatureError,
  TimestampExpiredError,
} from './errors';

const DEFAULT_TOLERANCE_SECONDS = 300; // 5 minutes

export interface VerifyWebhookOptions {
  rawBody: string;
  signature: string;
  secret: string;
  toleranceSeconds?: number;
}

/**
 * Verifies Stripe webhook signature
 * 
 * Uses Stripe's HMAC-SHA256 signature verification.
 * Rejects requests older than tolerance (default 5 minutes) to prevent replay attacks.
 * 
 * @param rawBody - Raw request body as string
 * @param signature - stripe-signature header value
 * @param secret - Stripe webhook signing secret (whsec_...)
 * @param toleranceSeconds - Max age of webhook timestamp (default: 300s)
 * @returns Parsed Stripe event
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
  toleranceSeconds: number = DEFAULT_TOLERANCE_SECONDS
): Promise<Stripe.Event> {
  if (!signature) {
    throw new MissingSignatureError();
  }

  const stripe = new Stripe(secret, {
    // Use a dummy key since we're only verifying signatures
    apiVersion: '2023-10-16',
  });

  try {
    // Parse signature header to check timestamp
    const sigParts = signature.split(',');
    let timestamp: number | null = null;
    let v1Signature: string | null = null;

    for (const part of sigParts) {
      const [key, value] = part.split('=');
      if (key === 't') {
        timestamp = parseInt(value, 10);
      } else if (key === 'v1') {
        v1Signature = value;
      }
    }

    if (!timestamp || !v1Signature) {
      throw new WebhookSignatureError('Invalid signature header format');
    }

    // Check timestamp age
    const now = Math.floor(Date.now() / 1000);
    const age = now - timestamp;

    if (age > toleranceSeconds) {
      throw new TimestampExpiredError(timestamp, toleranceSeconds);
    }

    // Verify signature manually using Node.js crypto
    const payload = `${timestamp}.${rawBody}`;
    const expectedSignature = computeSignature(payload, secret);

    if (v1Signature !== expectedSignature) {
      throw new WebhookSignatureError('Signature mismatch');
    }

    // Parse the event from body
    const eventData = JSON.parse(rawBody) as Stripe.Event;
    
    // Additional validation: ensure event ID and type are present
    if (!eventData.id) {
      throw new WebhookSignatureError('Missing event ID');
    }

    if (!eventData.type) {
      throw new WebhookSignatureError('Missing event type');
    }

    return eventData;
  } catch (error) {
    if (error instanceof MissingSignatureError || 
        error instanceof TimestampExpiredError ||
        error instanceof WebhookSignatureError) {
      throw error;
    }
    
    // Stripe parsing errors
    throw new WebhookSignatureError(
      error instanceof Error ? error.message : 'Unknown verification error'
    );
  }
}

/**
 * Computes HMAC-SHA256 signature for webhook payload
 */
function computeSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Parses webhook event and extracts relevant data
 */
export interface ParsedWebhookEvent {
  eventId: string;
  eventType: string;
  paymentIntentId: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: string;
  failureMessage?: string;
}

/**
 * Extracts payment intent data from a webhook event
 */
export function parseWebhookEvent(event: Stripe.Event): ParsedWebhookEvent | null {
  const data = event.data.object as Stripe.PaymentIntent;

  // Extract order ID from metadata
  const orderId = data.metadata?.order_id || data.metadata?.orderId;

  return {
    eventId: event.id,
    eventType: event.type,
    paymentIntentId: data.id,
    orderId,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    failureMessage: data.last_payment_error?.message,
  };
}

/**
 * Determines if an event type should be processed
 */
export function isProcessableEvent(eventType: string): boolean {
  const processableEvents = [
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'payment_intent.canceled',
    'charge.refunded',
  ];

  return processableEvents.includes(eventType);
}

/**
 * Maps Stripe event type to order status
 */
export function mapEventToOrderStatus(eventType: string): string | null {
  const statusMap: Record<string, string> = {
    'payment_intent.succeeded': 'paid',
    'payment_intent.payment_failed': 'failed',
    'payment_intent.canceled': 'cancelled',
    'charge.refunded': 'refunded',
  };

  return statusMap[eventType] || null;
}
