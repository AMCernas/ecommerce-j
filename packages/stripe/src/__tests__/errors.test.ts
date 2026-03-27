/**
 * Error Classes Tests
 * 
 * Tests for custom payment error classes.
 * Verifies that errors have correct codes and HTTP status codes per spec.
 */

import { describe, it, expect } from 'vitest';
import {
  PaymentError,
  ValidationError,
  InvalidOrderIdError,
  InvalidEmailError,
  OrderNotFoundError,
  OrderAlreadyPaidError,
  VoucherExpiredError,
  WebhookSignatureError,
  MissingSignatureError,
  TimestampExpiredError,
  IdempotencyConflictError,
  RateLimitError,
  StripeApiError,
  InternalError,
} from '../errors';

describe('PaymentError Base Class', () => {
  it('should create error with code, message, and httpStatus', () => {
    const error = new PaymentError('INTERNAL_ERROR', 'Test message', 400);
    
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.httpStatus).toBe(400);
    expect(error.name).toBe('PaymentError');
  });

  it('should default to 500 httpStatus', () => {
    const error = new PaymentError('INTERNAL_ERROR', 'Test');
    
    expect(error.httpStatus).toBe(500);
  });

  it('should include details when provided', () => {
    const error = new PaymentError('INTERNAL_ERROR', 'Test', 400, { orderId: '123' });
    
    expect(error.details).toBeDefined();
    expect(error.details?.orderId).toBe('123');
  });

  it('should serialize to JSON correctly', () => {
    const error = new PaymentError('INTERNAL_ERROR', 'Test message', 400, { key: 'value' });
    const json = error.toJSON();
    
    expect(json).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'Test message',
      httpStatus: 400,
      details: { key: 'value' },
    });
  });

  it('should be an instance of Error', () => {
    const error = new PaymentError('INTERNAL_ERROR', 'Test');
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PaymentError);
  });
});

describe('Error Classes with Spec-Defined Codes', () => {
  describe('ValidationError', () => {
    it('should have INVALID_AMOUNT code', () => {
      const error = new ValidationError('Amount must be positive');
      
      expect(error.code).toBe('INVALID_AMOUNT');
      expect(error.httpStatus).toBe(400);
    });

    it('should have correct name', () => {
      expect(new ValidationError('msg').name).toBe('ValidationError');
    });
  });

  describe('InvalidOrderIdError', () => {
    it('should have INVALID_ORDER_ID code', () => {
      const error = new InvalidOrderIdError('invalid-id');
      
      expect(error.code).toBe('INVALID_ORDER_ID');
      expect(error.httpStatus).toBe(400);
      expect(error.message).toContain('invalid-id');
    });

    it('should include orderId in details', () => {
      const error = new InvalidOrderIdError('order-123');
      
      expect(error.details?.orderId).toBe('order-123');
    });
  });

  describe('InvalidEmailError', () => {
    it('should have INVALID_EMAIL code', () => {
      const error = new InvalidEmailError('bad-email');
      
      expect(error.code).toBe('INVALID_EMAIL');
      expect(error.httpStatus).toBe(400);
      expect(error.message).toContain('bad-email');
    });

    it('should include email in details', () => {
      const error = new InvalidEmailError('test@example.com');
      
      expect(error.details?.email).toBe('test@example.com');
    });
  });

  describe('OrderNotFoundError', () => {
    it('should have ORDER_NOT_FOUND code', () => {
      const error = new OrderNotFoundError('order-123');
      
      expect(error.code).toBe('ORDER_NOT_FOUND');
      expect(error.httpStatus).toBe(404);
      expect(error.message).toContain('order-123');
    });

    it('should include orderId in details', () => {
      const error = new OrderNotFoundError('order-456');
      
      expect(error.details?.orderId).toBe('order-456');
    });
  });

  describe('OrderAlreadyPaidError', () => {
    it('should have ORDER_ALREADY_PAID code', () => {
      const error = new OrderAlreadyPaidError('order-123');
      
      expect(error.code).toBe('ORDER_ALREADY_PAID');
      expect(error.httpStatus).toBe(409);
      expect(error.message).toContain('order-123');
    });

    it('should include orderId in details', () => {
      const error = new OrderAlreadyPaidError('order-789');
      
      expect(error.details?.orderId).toBe('order-789');
    });
  });

  describe('VoucherExpiredError', () => {
    it('should have VOUCHER_EXPIRED code', () => {
      const expiredAt = new Date('2024-01-01');
      const error = new VoucherExpiredError('voucher-123', expiredAt);
      
      expect(error.code).toBe('VOUCHER_EXPIRED');
      expect(error.httpStatus).toBe(410);
      expect(error.message).toContain('voucher-123');
    });

    it('should include voucherId and expiredAt in details', () => {
      const expiredAt = new Date('2024-01-01T00:00:00Z');
      const error = new VoucherExpiredError('voucher-123', expiredAt);
      
      expect(error.details?.voucherId).toBe('voucher-123');
      expect(error.details?.expiredAt).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('WebhookSignatureError', () => {
    it('should have INVALID_SIGNATURE code', () => {
      const error = new WebhookSignatureError('Signature mismatch');
      
      expect(error.code).toBe('INVALID_SIGNATURE');
      expect(error.httpStatus).toBe(401);
      expect(error.message).toContain('Signature mismatch');
    });

    it('should include reason in details', () => {
      const error = new WebhookSignatureError('payload modified');
      
      expect(error.details?.reason).toBe('payload modified');
    });
  });

  describe('MissingSignatureError', () => {
    it('should have MISSING_SIGNATURE code', () => {
      const error = new MissingSignatureError();
      
      expect(error.code).toBe('MISSING_SIGNATURE');
      expect(error.httpStatus).toBe(401);
      expect(error.message).toContain('Missing stripe-signature header');
    });
  });

  describe('TimestampExpiredError', () => {
    it('should have TIMESTAMP_EXPIRED code', () => {
      const error = new TimestampExpiredError(1234567890, 300);
      
      expect(error.code).toBe('TIMESTAMP_EXPIRED');
      expect(error.httpStatus).toBe(401);
      expect(error.message).toContain('1234567890');
      expect(error.message).toContain('300');
    });

    it('should include timestamp and toleranceSeconds in details', () => {
      const error = new TimestampExpiredError(1234567890, 300);
      
      expect(error.details?.timestamp).toBe(1234567890);
      expect(error.details?.toleranceSeconds).toBe(300);
    });
  });

  describe('IdempotencyConflictError', () => {
    it('should have IDEMPOTENCY_CONFLICT code', () => {
      const original = { amount: 100 };
      const newReq = { amount: 200 };
      const error = new IdempotencyConflictError(original, newReq);
      
      expect(error.code).toBe('IDEMPOTENCY_CONFLICT');
      expect(error.httpStatus).toBe(422);
    });

    it('should include request data in details', () => {
      const original = { orderId: '123' };
      const newReq = { orderId: '456' };
      const error = new IdempotencyConflictError(original, newReq);
      
      expect(error.details?.originalRequest).toEqual(original);
      expect(error.details?.newRequest).toEqual(newReq);
    });
  });

  describe('RateLimitError', () => {
    it('should have RATE_LIMIT_EXCEEDED code', () => {
      const error = new RateLimitError(60);
      
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.httpStatus).toBe(429);
      expect(error.message).toContain('60');
    });

    it('should include retryAfter in details', () => {
      const error = new RateLimitError(120);
      
      expect(error.details?.retryAfter).toBe(120);
    });
  });

  describe('StripeApiError', () => {
    it('should have STRIPE_ERROR code', () => {
      const originalError = new Error('Card declined');
      const error = new StripeApiError(originalError);
      
      expect(error.code).toBe('STRIPE_ERROR');
      expect(error.httpStatus).toBe(502);
      expect(error.message).toContain('Card declined');
    });

    it('should include original error message in details', () => {
      const originalError = new Error('Rate limit exceeded');
      const error = new StripeApiError(originalError);
      
      expect(error.details?.originalError).toBe('Rate limit exceeded');
    });
  });

  describe('InternalError', () => {
    it('should have INTERNAL_ERROR code', () => {
      const error = new InternalError('Unexpected condition');
      
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.httpStatus).toBe(500);
      expect(error.message).toBe('Unexpected condition');
    });

    it('should include details when provided', () => {
      const error = new InternalError('Error', { context: 'test' });
      
      expect(error.details?.context).toBe('test');
    });
  });
});

describe('Error Code Mapping', () => {
  it('should match spec error codes', () => {
    const errorCodes: Record<string, number> = {
      INVALID_AMOUNT: 400,
      INVALID_ORDER_ID: 400,
      INVALID_EMAIL: 400,
      ORDER_NOT_FOUND: 404,
      ORDER_ALREADY_PAID: 409,
      VOUCHER_EXPIRED: 410,
      INVALID_SIGNATURE: 401,
      MISSING_SIGNATURE: 401,
      TIMESTAMP_EXPIRED: 401,
      IDEMPOTENCY_CONFLICT: 422,
      RATE_LIMIT_EXCEEDED: 429,
      STRIPE_ERROR: 502,
      INTERNAL_ERROR: 500,
    };

    // Verify each code maps to correct HTTP status
    expect(new ValidationError('msg').httpStatus).toBe(errorCodes.INVALID_AMOUNT);
    expect(new InvalidOrderIdError('id').httpStatus).toBe(errorCodes.INVALID_ORDER_ID);
    expect(new InvalidEmailError('email').httpStatus).toBe(errorCodes.INVALID_EMAIL);
    expect(new OrderNotFoundError('id').httpStatus).toBe(errorCodes.ORDER_NOT_FOUND);
    expect(new OrderAlreadyPaidError('id').httpStatus).toBe(errorCodes.ORDER_ALREADY_PAID);
    expect(new VoucherExpiredError('id', new Date()).httpStatus).toBe(errorCodes.VOUCHER_EXPIRED);
    expect(new WebhookSignatureError('reason').httpStatus).toBe(errorCodes.INVALID_SIGNATURE);
    expect(new MissingSignatureError().httpStatus).toBe(errorCodes.MISSING_SIGNATURE);
    expect(new TimestampExpiredError(0, 0).httpStatus).toBe(errorCodes.TIMESTAMP_EXPIRED);
    expect(new IdempotencyConflictError({}, {}).httpStatus).toBe(errorCodes.IDEMPOTENCY_CONFLICT);
    expect(new RateLimitError(60).httpStatus).toBe(errorCodes.RATE_LIMIT_EXCEEDED);
    expect(new StripeApiError(new Error()).httpStatus).toBe(errorCodes.STRIPE_ERROR);
    expect(new InternalError('msg').httpStatus).toBe(errorCodes.INTERNAL_ERROR);
  });
});
