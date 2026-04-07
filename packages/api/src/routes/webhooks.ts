/**
 * Stripe Webhooks Router
 * 
 * Handles incoming Stripe webhook events for payment status updates.
 * Verifies webhook signatures and processes events idempotently.
 */

import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { verifyWebhookSignature, parseWebhookEvent, mapEventToOrderStatus } from '@ecoomerce-jardineria/stripe';
import { db } from '@ecoomerce-jardineria/db';
import { orders, paymentEvents } from '@ecoomerce-jardineria/db';
import { sendEmail, renderEmail, OrderStatusUpdateEmail } from '@ecoomerce-jardineria/emails';
import { isValidStatusTransition } from '../utils/order-status';
import type { Env } from '../app';

export const webhooksRouter = new Hono<{ Bindings: Env }>();

/**
 * POST /webhooks/stripe
 * 
 * Receives and processes Stripe webhook events.
 * Validates signature, checks for duplicates, and updates order status.
 */
webhooksRouter.post('/stripe', async (c) => {
  const signature = c.req.header('stripe-signature');

  // Check for signature header
  if (!signature) {
    console.warn('Webhook received without signature header');
    return c.json({ error: 'Missing stripe-signature header' }, 401);
  }

  // Get raw body for signature verification
  // Note: Hono requires using c.req.raw.clone() to get the raw body
  let rawBody: string;
  try {
    rawBody = await c.req.raw.clone().text();
  } catch (error) {
    console.error('Failed to read webhook body:', error);
    return c.json({ error: 'Failed to read request body' }, 400);
  }

  const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET;

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = await verifyWebhookSignature(rawBody, signature, webhookSecret);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Webhook signature verification failed: ${errorMessage}`);
    
    if (errorMessage.includes('Missing stripe-signature')) {
      return c.json({ error: 'Missing stripe-signature header' }, 401);
    }
    if (errorMessage.includes('timestamp')) {
      return c.json({ error: 'Webhook timestamp expired' }, 401);
    }
    return c.json({ error: 'Invalid signature' }, 401);
  }

  // Check for duplicate event (idempotency)
  try {
    const existingEvent = await db.query.paymentEvents.findFirst({
      where: eq(paymentEvents.eventId, event.id),
    });

    if (existingEvent) {
      console.log(`Duplicate webhook event ignored: ${event.id}`);
      return c.json({ received: true, duplicate: true });
    }
  } catch (error) {
    console.error('Error checking for duplicate event:', error);
    // Continue processing - don't fail on DB errors
  }

  // Process the event
  try {
    await processWebhookEvent(event);
    return c.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    // Return 200 to prevent Stripe from retrying
    // Log the error for investigation
    return c.json({ received: true, error: 'Processing failed' });
  }
});

/**
 * Process a webhook event
 */
async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  const paymentIntentId = (event.data.object as Stripe.PaymentIntent).id;
  const orderId = (event.data.object as Stripe.PaymentIntent).metadata?.order_id;

  console.log(`Processing webhook event: ${event.type} for payment ${paymentIntentId}`);

  // Find the order by payment intent ID
  let order = null;
  if (orderId) {
    order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
  }

  // If no order found by metadata, try by payment intent ID
  if (!order && paymentIntentId) {
    order = await db.query.orders.findFirst({
      where: eq(orders.paymentIntentId, paymentIntentId),
    });
  }

  // Log warning if order not found but don't fail
  if (!order) {
    console.warn(`Order not found for payment intent ${paymentIntentId}, acknowledging webhook`);
    return;
  }

  // Get the new order status
  const newStatus = mapEventToOrderStatus(event.type);
  if (!newStatus) {
    console.log(`Ignoring non-payment event: ${event.type}`);
    return;
  }

  // Check if status transition is valid
  if (!order.status || !isValidStatusTransition(order.status, newStatus)) {
    console.log(`Invalid status transition: ${order.status} -> ${newStatus}, ignoring`);
    return;
  }

  // Update order and create audit record in a transaction
  try {
    await db.transaction(async (tx) => {
      // Update order status
      await tx.update(orders)
        .set({ 
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order!.id));

      // Insert payment event audit record
      await tx.insert(paymentEvents).values({
        orderId: order!.id,
        paymentIntentId,
        eventType: newStatus,
        eventId: event.id,
        eventData: event as unknown as Record<string, unknown>,
        processedAt: new Date(),
      });
    });

    console.log(`Order ${order.id} updated to status: ${newStatus}`);

    // Send status update email (non-blocking, errors logged but not thrown)
    sendStatusUpdateEmail(order, newStatus);
  } catch (error) {
    console.error('Failed to update order:', error);
    throw error;
  }
}

/**
 * Send order status update email
 * Non-blocking: errors are logged but not thrown to prevent webhook failures
 */
async function sendStatusUpdateEmail(order: typeof orders.$inferSelect, newStatus: string): Promise<void> {
  try {
    const html = await renderEmail(OrderStatusUpdateEmail({
      orderId: order.id,
      customerName: order.customerName,
      previousStatus: order.status || 'unknown',
      newStatus,
      trackingNumber: order.trackingNumber || undefined,
    }));

    const result = await sendEmail({
      to: order.customerEmail,
      subject: `Actualización de tu pedido #${order.id}`,
      html,
    });

    if (!result.success) {
      console.warn(`Failed to send status email for order ${order.id}: ${result.error}`);
    } else {
      console.log(`Status email sent for order ${order.id}, messageId: ${result.messageId}`);
    }
  } catch (err) {
    console.error(`Error sending status email for order ${order.id}:`, err);
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const orderId = paymentIntent.metadata?.order_id;
  
  if (!orderId) {
    console.warn('Payment succeeded without order_id in metadata');
    return;
  }

  await db.update(orders)
    .set({ 
      status: 'paid',
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  await db.insert(paymentEvents).values({
    orderId,
    paymentIntentId: paymentIntent.id,
    eventType: 'succeeded',
    eventId: paymentIntent.id,
    eventData: paymentIntent as unknown as Record<string, unknown>,
    processedAt: new Date(),
  });
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const orderId = paymentIntent.metadata?.order_id;
  const failureMessage = paymentIntent.last_payment_error?.message || 'Unknown error';

  if (!orderId) {
    console.warn('Payment failed without order_id in metadata');
    return;
  }

  await db.update(orders)
    .set({ 
      status: 'failed',
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  await db.insert(paymentEvents).values({
    orderId,
    paymentIntentId: paymentIntent.id,
    eventType: 'failed',
    eventId: paymentIntent.id,
    eventData: { ...paymentIntent as unknown as Record<string, unknown>, failureMessage },
    processedAt: new Date(),
  });

  console.log(`Payment failed for order ${orderId}: ${failureMessage}`);
}

/**
 * Handle payment_intent.canceled event
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const orderId = paymentIntent.metadata?.order_id;

  if (!orderId) {
    console.warn('Payment canceled without order_id in metadata');
    return;
  }

  await db.update(orders)
    .set({ 
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  await db.insert(paymentEvents).values({
    orderId,
    paymentIntentId: paymentIntent.id,
    eventType: 'canceled',
    eventId: paymentIntent.id,
    eventData: paymentIntent as unknown as Record<string, unknown>,
    processedAt: new Date(),
  });

  console.log(`Payment canceled for order ${orderId}`);
}

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) {
    console.warn('Charge refunded without payment_intent');
    return;
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.paymentIntentId, paymentIntentId),
  });

  if (!order) {
    console.warn(`Order not found for payment intent ${paymentIntentId}`);
    return;
  }

  await db.update(orders)
    .set({ 
      status: 'refunded',
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));

  await db.insert(paymentEvents).values({
    orderId: order.id,
    paymentIntentId,
    eventType: 'refunded',
    eventId: charge.id,
    eventData: charge as unknown as Record<string, unknown>,
    processedAt: new Date(),
  });

  console.log(`Order ${order.id} marked as refunded`);
}
