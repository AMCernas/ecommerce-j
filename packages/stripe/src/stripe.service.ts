/**
 * Stripe Service - Main payment processing service
 * 
 * Provides methods for creating payment intents for card, OXXO, and SPEI payments.
 * Follows the layered architecture defined in the proposal.
 */

import Stripe from 'stripe';
import {
  StripeConfig,
  CreatePaymentIntentOptions,
  CreateOXXOVoucherOptions,
  CreateSPEIOptions,
  PaymentIntentResult,
  OXXOResult,
  SPEIResult,
  PaymentMethodType,
} from './types';
import {
  ValidationError,
  OrderAlreadyPaidError,
  StripeApiError,
} from './errors';
import {
  generateOXXOVoucher,
  generateVoucherData,
  sanitizeCustomerName,
} from './utils/voucher';
import { generateCLABEResult, generateCLABE } from './utils/clabe';

// Default expiry times (in hours)
const DEFAULT_OXXO_EXPIRY_HOURS = 72;
const DEFAULT_SPEI_EXPIRY_HOURS = 72;

/**
 * StripeService provides methods for processing payments via Stripe
 */
export class StripeService {
  private stripe: Stripe;
  private config: StripeConfig;
  private oxxoExpiryHours: number;
  private speiExpiryHours: number;

  constructor(config: StripeConfig, options?: { oxxoExpiryHours?: number; speiExpiryHours?: number }) {
    this.config = config;
    this.oxxoExpiryHours = options?.oxxoExpiryHours ?? DEFAULT_OXXO_EXPIRY_HOURS;
    this.speiExpiryHours = options?.speiExpiryHours ?? DEFAULT_SPEI_EXPIRY_HOURS;

    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Generates idempotency key for payment requests
   */
  private generateIdempotencyKey(orderId: string, paymentMethod: PaymentMethodType): string {
    return `${orderId}:${paymentMethod}:${Date.now()}`;
  }

  /**
   * Validates amount is a positive integer in MXN cents
   */
  private validateAmount(amount: number): void {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new ValidationError('Amount must be a positive integer in MXN cents');
    }
  }

  /**
   * Creates a payment intent for card payments
   */
  async createPaymentIntent(opts: CreatePaymentIntentOptions): Promise<PaymentIntentResult> {
    this.validateAmount(opts.amount);

    try {
      const idempotencyKey = opts.idempotencyKey || this.generateIdempotencyKey(opts.orderId, 'card');

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: opts.amount,
        currency: 'mxn',
        payment_method_types: ['card'],
        metadata: {
          order_id: opts.orderId,
          payment_method: 'card',
        },
        receipt_email: opts.customerEmail,
      }, {
        idempotencyKey,
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency as 'mxn',
      };
    } catch (error) {
      throw new StripeApiError(error instanceof Error ? error : new Error('Unknown Stripe error'));
    }
  }

  /**
   * Creates a payment intent for OXXO cash payments
   */
  async createOXXOPaymentIntent(opts: CreateOXXOVoucherOptions): Promise<OXXOResult> {
    this.validateAmount(opts.amount);

    if (!opts.customerName) {
      throw new ValidationError('Customer name is required for OXXO payments');
    }

    const expiresAt = new Date(Date.now() + this.oxxoExpiryHours * 60 * 60 * 1000);
    const idempotencyKey = opts.idempotencyKey || this.generateIdempotencyKey(opts.orderId, 'oxxo');

    try {
      // Create PaymentIntent for OXXO
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: opts.amount,
        currency: 'mxn',
        payment_method_types: ['oxxo'],
        metadata: {
          order_id: opts.orderId,
          payment_method: 'oxxo',
          customer_name: sanitizeCustomerName(opts.customerName),
        },
        receipt_email: opts.customerEmail,
      }, {
        idempotencyKey,
      });

      // Generate voucher data and PDF
      const voucherData = generateVoucherData(
        opts.orderId,
        opts.amount,
        opts.customerName,
        expiresAt
      );

      const pdfBuffer = await generateOXXOVoucher({
        orderId: opts.orderId,
        amount: opts.amount,
        customerName: opts.customerName,
        reference: voucherData.reference,
        expiresAt,
        companyName: this.config.companyName,
      });

      return {
        id: paymentIntent.id,
        voucherUrl: `/api/payments/oxxo-voucher/${voucherData.reference}`,
        expiresAt,
        amount: opts.amount,
        reference: voucherData.reference,
        pdfBuffer,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new StripeApiError(error instanceof Error ? error : new Error('Unknown Stripe error'));
    }
  }

  /**
   * Creates SPEI payment setup
   * For SPEI, we create a SetupIntent to obtain the CLABE
   */
  async createSPEIPaymentIntent(opts: CreateSPEIOptions): Promise<SPEIResult> {
    this.validateAmount(opts.amount);

    const expiresAt = new Date(Date.now() + this.speiExpiryHours * 60 * 60 * 1000);
    const idempotencyKey = opts.idempotencyKey || this.generateIdempotencyKey(opts.orderId, 'spei');

    try {
      // Create SetupIntent for SPEI
      const setupIntent = await this.stripe.setupIntents.create({
        payment_method_types: ['oxxo', 'card'], // Note: Stripe uses oxxo for SPEI-like flows
        metadata: {
          order_id: opts.orderId,
          payment_method: 'spei',
        },
      }, {
        idempotencyKey,
      });

      // Generate CLABE for SPEI transfer
      const clabeResult = generateCLABEResult(
        opts.orderId,
        opts.amount,
        this.config.companyName,
        this.speiExpiryHours
      );

      return {
        id: setupIntent.id,
        clabe: clabeResult.clabe,
        bank: clabeResult.bank,
        beneficiary: clabeResult.beneficiary,
        reference: clabeResult.reference,
        amount: opts.amount,
        expiresAt,
      };
    } catch (error) {
      throw new StripeApiError(error instanceof Error ? error : new Error('Unknown Stripe error'));
    }
  }

  /**
   * Generates CLABE for SPEI transfer
   * Standalone method without Stripe API call
   */
  generateSPEICLABE(orderId: string, amount: number): { clabe: string; reference: string; expiresAt: Date } {
    this.validateAmount(amount);

    const clabe = generateCLABE(orderId, amount);
    const expiresAt = new Date(Date.now() + this.speiExpiryHours * 60 * 60 * 1000);
    
    // Extract reference from CLABE (digits 5-16)
    const reference = clabe.substring(5, 17);

    return {
      clabe,
      reference,
      expiresAt,
    };
  }

  /**
   * Retrieves a payment intent by ID
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      throw new StripeApiError(error instanceof Error ? error : new Error('Unknown Stripe error'));
    }
  }

  /**
   * Cancels a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error) {
      throw new StripeApiError(error instanceof Error ? error : new Error('Unknown Stripe error'));
    }
  }
}

/**
 * Creates a StripeService instance with configuration from environment
 */
export function createStripeService(env: {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  COMPANY_NAME: string;
  COMPANY_CLABE: string;
  OXXO_VOUCHER_EXPIRY_HOURS?: string;
  SPEI_EXPIRY_HOURS?: string;
}): StripeService {
  const config: StripeConfig = {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    companyName: env.COMPANY_NAME,
    companyCLABE: env.COMPANY_CLABE,
  };

  return new StripeService(config, {
    oxxoExpiryHours: env.OXXO_VOUCHER_EXPIRY_HOURS ? parseInt(env.OXXO_VOUCHER_EXPIRY_HOURS, 10) : undefined,
    speiExpiryHours: env.SPEI_EXPIRY_HOURS ? parseInt(env.SPEI_EXPIRY_HOURS, 10) : undefined,
  });
}
