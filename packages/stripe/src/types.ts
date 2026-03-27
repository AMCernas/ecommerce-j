/**
 * Stripe package types for payment processing
 * Supports Mexican market payment methods: card, OXXO, SPEI
 */

import type Stripe from 'stripe';

// Configuration
export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  companyName: string;
  companyCLABE: string;
}

// Payment method types
export type PaymentMethodType = 'card' | 'oxxo' | 'spei';

// Base options for creating payment intents
export interface CreatePaymentIntentOptions {
  orderId: string;
  amount: number; // MXN cents
  customerEmail: string;
  paymentMethod: PaymentMethodType;
  customerName?: string;
  idempotencyKey?: string;
}

// OXXO-specific options (customerName is required)
export interface CreateOXXOVoucherOptions extends CreatePaymentIntentOptions {
  customerName: string;
}

// SPEI-specific options
export interface CreateSPEIOptions extends CreatePaymentIntentOptions {}

// Results
export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  amount: number;
  currency: 'mxn';
}

export interface OXXOResult {
  id: string;
  voucherUrl: string;
  expiresAt: Date;
  amount: number;
  reference: string;
  pdfBuffer: Buffer;
}

export interface SPEIResult {
  id: string;
  clabe: string;
  bank: string;
  beneficiary: string;
  reference: string;
  amount: number;
  expiresAt: Date;
}

export interface CLABEResult {
  clabe: string;
  bank: string;
  beneficiary: string;
  reference: string;
}

// Webhook types
export interface WebhookEventResult {
  eventId: string;
  eventType: string;
  paymentIntentId: string;
  orderId?: string;
  data: Stripe.PaymentIntent | Stripe.Charge;
}

// Error codes matching spec
export type PaymentErrorCode =
  | 'INVALID_AMOUNT'
  | 'INVALID_ORDER_ID'
  | 'INVALID_EMAIL'
  | 'ORDER_NOT_FOUND'
  | 'ORDER_ALREADY_PAID'
  | 'VOUCHER_EXPIRED'
  | 'INVALID_SIGNATURE'
  | 'MISSING_SIGNATURE'
  | 'TIMESTAMP_EXPIRED'
  | 'IDEMPOTENCY_CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'STRIPE_ERROR'
  | 'INTERNAL_ERROR';

// Voucher types
export interface OXXOVoucherData {
  orderId: string;
  amount: number;
  customerName: string;
  reference: string;
  expiresAt: Date;
  paymentIntentId: string;
}
