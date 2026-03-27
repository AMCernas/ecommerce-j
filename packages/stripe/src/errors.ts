/**
 * Custom error classes for Stripe payment operations
 * Provides structured error handling with error codes per spec
 */

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

export interface PaymentErrorDetails {
  code: PaymentErrorCode;
  message: string;
  httpStatus: number;
  details?: Record<string, unknown>;
}

/**
 * Base payment error class
 * All Stripe-related errors extend this
 */
export class PaymentError extends Error {
  public readonly code: PaymentErrorCode;
  public readonly httpStatus: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: PaymentErrorCode,
    message: string,
    httpStatus: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;

    // Maintains proper stack trace for where error was thrown (V8 only)
    (Error as unknown as { captureStackTrace: (target: object, constructor: Function) => void }).captureStackTrace?.(this, this.constructor);
  }

  toJSON(): PaymentErrorDetails {
    return {
      code: this.code,
      message: this.message,
      httpStatus: this.httpStatus,
      details: this.details,
    };
  }
}

/**
 * Validation error for invalid input
 * HTTP 400
 */
export class ValidationError extends PaymentError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('INVALID_AMOUNT', message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Invalid order ID format
 * HTTP 400
 */
export class InvalidOrderIdError extends PaymentError {
  constructor(orderId: string) {
    super('INVALID_ORDER_ID', `Invalid order ID format: ${orderId}`, 400, { orderId });
    this.name = 'InvalidOrderIdError';
  }
}

/**
 * Invalid email format
 * HTTP 400
 */
export class InvalidEmailError extends PaymentError {
  constructor(email: string) {
    super('INVALID_EMAIL', `Invalid email format: ${email}`, 400, { email });
    this.name = 'InvalidEmailError';
  }
}

/**
 * Order not found in database
 * HTTP 404
 */
export class OrderNotFoundError extends PaymentError {
  constructor(orderId: string) {
    super('ORDER_NOT_FOUND', `Order not found: ${orderId}`, 404, { orderId });
    this.name = 'OrderNotFoundError';
  }
}

/**
 * Order already paid - cannot process payment
 * HTTP 409
 */
export class OrderAlreadyPaidError extends PaymentError {
  constructor(orderId: string) {
    super('ORDER_ALREADY_PAID', `Order already paid: ${orderId}`, 409, { orderId });
    this.name = 'OrderAlreadyPaidError';
  }
}

/**
 * OXXO voucher has expired
 * HTTP 410
 */
export class VoucherExpiredError extends PaymentError {
  constructor(voucherId: string, expiredAt: Date) {
    super('VOUCHER_EXPIRED', `OXXO voucher has expired: ${voucherId}`, 410, {
      voucherId,
      expiredAt: expiredAt.toISOString(),
    });
    this.name = 'VoucherExpiredError';
  }
}

/**
 * Webhook signature validation failed
 * HTTP 401
 */
export class WebhookSignatureError extends PaymentError {
  constructor(reason: string) {
    super('INVALID_SIGNATURE', `Webhook signature invalid: ${reason}`, 401, { reason });
    this.name = 'WebhookSignatureError';
  }
}

/**
 * Missing stripe-signature header
 * HTTP 401
 */
export class MissingSignatureError extends PaymentError {
  constructor() {
    super('MISSING_SIGNATURE', 'Missing stripe-signature header', 401);
    this.name = 'MissingSignatureError';
  }
}

/**
 * Webhook timestamp too old (replay attack prevention)
 * HTTP 401
 */
export class TimestampExpiredError extends PaymentError {
  constructor(timestamp: number, toleranceSeconds: number) {
    super(
      'TIMESTAMP_EXPIRED',
      `Webhook timestamp expired: ${timestamp} is more than ${toleranceSeconds}s old`,
      401,
      { timestamp, toleranceSeconds }
    );
    this.name = 'TimestampExpiredError';
  }
}

/**
 * Idempotency key conflict - request body differs
 * HTTP 422
 */
export class IdempotencyConflictError extends PaymentError {
  constructor(
    originalRequest: Record<string, unknown>,
    newRequest: Record<string, unknown>
  ) {
    super('IDEMPOTENCY_CONFLICT', 'Idempotency key conflict: request body differs', 422, {
      originalRequest,
      newRequest,
    });
    this.name = 'IdempotencyConflictError';
  }
}

/**
 * Rate limit exceeded
 * HTTP 429
 */
export class RateLimitError extends PaymentError {
  constructor(retryAfterSeconds: number) {
    super('RATE_LIMIT_EXCEEDED', `Rate limit exceeded, retry after ${retryAfterSeconds}s`, 429, {
      retryAfter: retryAfterSeconds,
    });
    this.name = 'RateLimitError';
  }
}

/**
 * Stripe API error
 * HTTP 502
 */
export class StripeApiError extends PaymentError {
  constructor(stripeError: Error) {
    super('STRIPE_ERROR', `Stripe API error: ${stripeError.message}`, 502, {
      originalError: stripeError.message,
    });
    this.name = 'StripeApiError';
  }
}

/**
 * Internal server error
 * HTTP 500
 */
export class InternalError extends PaymentError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('INTERNAL_ERROR', message, 500, details);
    this.name = 'InternalError';
  }
}
