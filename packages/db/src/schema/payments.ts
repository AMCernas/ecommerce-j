/**
 * Payment Events Schema
 * 
 * Stores audit trail for all Stripe payment events.
 * This table is immutable - records should never be updated or deleted.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { orders } from './orders';

/**
 * Payment event types corresponding to Stripe events
 */
export type PaymentEventType = 'succeeded' | 'failed' | 'canceled' | 'refunded';

/**
 * Payment events table
 * 
 * Tracks all Stripe webhook events for audit and idempotency purposes.
 * The event_id column is unique to ensure idempotent webhook processing.
 */
export const paymentEvents = pgTable(
  'payment_events',
  {
    /**
     * Primary key - UUID generated for each record
     */
    id: uuid('id').primaryKey().defaultRandom(),

    /**
     * Reference to the order this event belongs to
     */
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'restrict' }),

    /**
     * Stripe PaymentIntent ID
     */
    paymentIntentId: text('payment_intent_id').notNull(),

    /**
     * Event type: succeeded, failed, canceled, refunded
     */
    eventType: text('event_type').notNull(),

    /**
     * Stripe event ID - used for idempotency checks
     * This is unique to prevent duplicate processing
     */
    eventId: text('event_id').notNull(),

    /**
     * Full Stripe event payload for debugging and reconciliation
     */
    eventData: jsonb('event_data').$type<Record<string, unknown>>(),

    /**
     * When the event was processed by our system
     */
    processedAt: timestamp('processed_at').defaultNow(),

    /**
     * Record creation timestamp
     */
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    // Index for finding events by order
    index('idx_payment_events_order').on(table.orderId),

    // Index for finding events by payment intent
    index('idx_payment_events_payment_intent').on(table.paymentIntentId),

    // Index for idempotency check
    index('idx_payment_events_event_id').on(table.eventId),

    // Unique constraint on event ID for idempotency
    uniqueIndex('uq_payment_events_event_id').on(table.eventId),
  ]
);

/**
 * Voucher storage table (for OXXO)
 * 
 * Stores generated OXXO voucher data for retrieval.
 */
export const vouchers = pgTable(
  'vouchers',
  {
    /**
     * Primary key - reference number from Stripe
     */
    id: text('id').primaryKey(),

    /**
     * Reference to the order
     */
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'restrict' }),

    /**
     * Stripe PaymentIntent ID
     */
    paymentIntentId: text('payment_intent_id').notNull(),

    /**
     * PDF buffer stored as base64 string
     */
    pdfData: text('pdf_data').notNull(), // Base64 encoded PDF

    /**
     * Amount in MXN cents
     */
    amount: text('amount').notNull(), // Stored as string for precision

    /**
     * Customer name (sanitized)
     */
    customerName: text('customer_name').notNull(),

    /**
     * Payment reference number
     */
    reference: text('reference').notNull(),

    /**
     * Voucher expiration time
     */
    expiresAt: timestamp('expires_at').notNull(),

    /**
     * Whether the voucher has been used
     */
    isUsed: text('is_used').default('false'),

    /**
     * When the voucher was generated
     */
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    // Index for finding vouchers by order
    index('idx_vouchers_order').on(table.orderId),

    // Index for expiration cleanup
    index('idx_vouchers_expires').on(table.expiresAt),
  ]
);
