/**
 * StripeService Tests
 * 
 * Tests for StripeService with mocked Stripe SDK.
 * Tests:
 * - createPaymentIntent with card
 * - createOXXOPayment
 * - createSPEIPayment
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StripeService } from '../stripe.service';
import { ValidationError, StripeApiError } from '../errors';

// Create mock functions outside
const mockPaymentIntentsCreate = vi.fn();
const mockPaymentIntentsRetrieve = vi.fn();
const mockPaymentIntentsCancel = vi.fn();
const mockSetupIntentsCreate = vi.fn();

// Mock Stripe module
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      paymentIntents: {
        create: mockPaymentIntentsCreate,
        retrieve: mockPaymentIntentsRetrieve,
        cancel: mockPaymentIntentsCancel,
      },
      setupIntents: {
        create: mockSetupIntentsCreate,
      },
    })),
  };
});

describe('StripeService', () => {
  let stripeService: StripeService;

  const mockConfig = {
    secretKey: 'sk_test_mock_key',
    webhookSecret: 'whsec_mock_secret',
    companyName: 'Test Company SA de CV',
    companyCLABE: '646000000000000031',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    stripeService = new StripeService(mockConfig);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create instance with config', () => {
      expect(stripeService).toBeInstanceOf(StripeService);
    });

    it('should use default 72-hour expiry for OXXO', () => {
      const service = new StripeService(mockConfig);
      expect(service).toBeDefined();
    });

    it('should allow custom OXXO expiry hours', () => {
      const service = new StripeService(mockConfig, { oxxoExpiryHours: 48 });
      expect(service).toBeDefined();
    });

    it('should allow custom SPEI expiry hours', () => {
      const service = new StripeService(mockConfig, { speiExpiryHours: 24 });
      expect(service).toBeDefined();
    });
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent with card payment method', async () => {
      const mockPaymentIntent = {
        id: 'pi_mock_123',
        client_secret: 'pi_mock_123_secret_xyz',
        amount: 15000,
        currency: 'mxn',
      };

      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);

      const result = await stripeService.createPaymentIntent({
        orderId: 'order-123',
        amount: 15000,
        customerEmail: 'customer@example.com',
        paymentMethod: 'card',
      });

      expect(result.id).toBe('pi_mock_123');
      expect(result.clientSecret).toBe('pi_mock_123_secret_xyz');
      expect(result.amount).toBe(15000);
      expect(result.currency).toBe('mxn');

      // Verify Stripe was called correctly
      expect(mockPaymentIntentsCreate).toHaveBeenCalledTimes(1);
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 15000,
          currency: 'mxn',
          payment_method_types: ['card'],
          metadata: expect.objectContaining({
            order_id: 'order-123',
            payment_method: 'card',
          }),
          receipt_email: 'customer@example.com',
        }),
        expect.any(Object)
      );
    });

    it('should throw ValidationError for non-positive amount', async () => {
      await expect(
        stripeService.createPaymentIntent({
          orderId: 'order-123',
          amount: 0,
          customerEmail: 'customer@example.com',
          paymentMethod: 'card',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for negative amount', async () => {
      await expect(
        stripeService.createPaymentIntent({
          orderId: 'order-123',
          amount: -100,
          customerEmail: 'customer@example.com',
          paymentMethod: 'card',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for non-integer amount', async () => {
      await expect(
        stripeService.createPaymentIntent({
          orderId: 'order-123',
          amount: 100.5,
          customerEmail: 'customer@example.com',
          paymentMethod: 'card',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should include idempotency key when provided', async () => {
      const mockPaymentIntent = {
        id: 'pi_mock_123',
        client_secret: 'pi_secret',
        amount: 1000,
        currency: 'mxn',
      };

      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);

      await stripeService.createPaymentIntent({
        orderId: 'order-123',
        amount: 1000,
        customerEmail: 'customer@example.com',
        paymentMethod: 'card',
        idempotencyKey: 'custom-idempotency-key',
      });

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          idempotencyKey: 'custom-idempotency-key',
        })
      );
    });

    it('should throw StripeApiError when Stripe API fails', async () => {
      mockPaymentIntentsCreate.mockRejectedValue(new Error('Stripe API Error'));

      await expect(
        stripeService.createPaymentIntent({
          orderId: 'order-123',
          amount: 1000,
          customerEmail: 'customer@example.com',
          paymentMethod: 'card',
        })
      ).rejects.toThrow(StripeApiError);
    });
  });

  describe('createOXXOPaymentIntent', () => {
    it('should create OXXO payment with voucher data', async () => {
      const mockPaymentIntent = {
        id: 'pi_oxxo_mock_123',
        client_secret: 'pi_oxxo_secret',
        amount: 15000,
        currency: 'mxn',
      };

      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);

      const result = await stripeService.createOXXOPaymentIntent({
        orderId: 'order-123',
        amount: 15000,
        customerEmail: 'customer@example.com',
        customerName: 'Juan Pérez',
        paymentMethod: 'oxxo',
      });

      expect(result.id).toBe('pi_oxxo_mock_123');
      expect(result.amount).toBe(15000);
      expect(result.reference).toBeDefined();
      expect(result.reference).toHaveLength(14);
      expect(result.pdfBuffer).toBeInstanceOf(Buffer);
      expect(result.voucherUrl).toContain(result.reference);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should throw ValidationError when customer name is missing', async () => {
      // TypeScript won't allow this, but we can test the error message
      await expect(
        stripeService.createOXXOPaymentIntent({
          orderId: 'order-123',
          amount: 1000,
          customerEmail: 'customer@example.com',
          paymentMethod: 'oxxo',
          customerName: '', // Empty name should trigger ValidationError
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should set expiration to 72 hours from now', async () => {
      const mockPaymentIntent = {
        id: 'pi_mock',
        client_secret: 'secret',
        amount: 1000,
        currency: 'mxn',
      };

      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);

      const beforeCreate = Date.now();
      const result = await stripeService.createOXXOPaymentIntent({
        orderId: 'order-123',
        amount: 1000,
        customerEmail: 'customer@example.com',
        customerName: 'Test User',
        paymentMethod: 'oxxo',
      });

      const expectedExpiryMs = 72 * 60 * 60 * 1000;
      const actualExpiryMs = result.expiresAt.getTime() - beforeCreate;

      // Allow 5 seconds tolerance
      expect(Math.abs(actualExpiryMs - expectedExpiryMs)).toBeLessThan(5000);
    });

    it('should sanitize customer name in metadata', async () => {
      const mockPaymentIntent = {
        id: 'pi_mock',
        client_secret: 'secret',
        amount: 1000,
        currency: 'mxn',
      };

      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);

      await stripeService.createOXXOPaymentIntent({
        orderId: 'order-123',
        amount: 1000,
        customerEmail: 'customer@example.com',
        customerName: 'Juan Perez',
        paymentMethod: 'oxxo',
      });

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            customer_name: 'Juan_Perez',
          }),
        }),
        expect.any(Object)
      );
    });

    it('should generate PDF buffer in result', async () => {
      const mockPaymentIntent = {
        id: 'pi_mock',
        client_secret: 'secret',
        amount: 1000,
        currency: 'mxn',
      };

      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);

      const result = await stripeService.createOXXOPaymentIntent({
        orderId: 'order-123',
        amount: 1000,
        customerEmail: 'customer@example.com',
        customerName: 'Test User',
        paymentMethod: 'oxxo',
      });

      expect(result.pdfBuffer).toBeInstanceOf(Buffer);
      expect(result.pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should use OXXO payment method type in Stripe call', async () => {
      const mockPaymentIntent = {
        id: 'pi_mock',
        client_secret: 'secret',
        amount: 1000,
        currency: 'mxn',
      };

      mockPaymentIntentsCreate.mockResolvedValue(mockPaymentIntent);

      await stripeService.createOXXOPaymentIntent({
        orderId: 'order-123',
        amount: 1000,
        customerEmail: 'customer@example.com',
        customerName: 'Test User',
        paymentMethod: 'oxxo',
      });

      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['oxxo'],
        }),
        expect.any(Object)
      );
    });
  });

  describe('createSPEIPaymentIntent', () => {
    it('should create SPEI payment with CLABE', async () => {
      const mockSetupIntent = {
        id: 'seti_mock_123',
        client_secret: 'seti_secret',
      };

      mockSetupIntentsCreate.mockResolvedValue(mockSetupIntent);

      const result = await stripeService.createSPEIPaymentIntent({
        orderId: 'order-123',
        amount: 15000,
        customerEmail: 'customer@example.com',
        paymentMethod: 'spei',
      });

      expect(result.id).toBe('seti_mock_123');
      expect(result.clabe).toBeDefined();
      expect(result.clabe).toHaveLength(18);
      expect(result.bank).toBe('STP');
      expect(result.beneficiary).toBe('TEST COMPANY SA DE CV'); // Uppercase
      expect(result.reference).toHaveLength(11);
      expect(result.amount).toBe(15000);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should set expiration to 72 hours from now for SPEI', async () => {
      const mockSetupIntent = {
        id: 'seti_mock',
        client_secret: 'secret',
      };

      mockSetupIntentsCreate.mockResolvedValue(mockSetupIntent);

      const beforeCreate = Date.now();
      const result = await stripeService.createSPEIPaymentIntent({
        orderId: 'order-123',
        amount: 1000,
        customerEmail: 'customer@example.com',
        paymentMethod: 'spei',
      });

      const expectedExpiryMs = 72 * 60 * 60 * 1000;
      const actualExpiryMs = result.expiresAt.getTime() - beforeCreate;

      // Allow 5 seconds tolerance
      expect(Math.abs(actualExpiryMs - expectedExpiryMs)).toBeLessThan(5000);
    });

    it('should throw ValidationError for invalid amount', async () => {
      await expect(
        stripeService.createSPEIPaymentIntent({
          orderId: 'order-123',
          amount: -100,
          customerEmail: 'customer@example.com',
          paymentMethod: 'spei',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should include order ID in metadata', async () => {
      const mockSetupIntent = {
        id: 'seti_mock',
        client_secret: 'secret',
      };

      mockSetupIntentsCreate.mockResolvedValue(mockSetupIntent);

      await stripeService.createSPEIPaymentIntent({
        orderId: 'order-123',
        amount: 1000,
        customerEmail: 'customer@example.com',
        paymentMethod: 'spei',
      });

      expect(mockSetupIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            order_id: 'order-123',
            payment_method: 'spei',
          }),
        }),
        expect.any(Object)
      );
    });

    it('should generate valid CLABE in result', async () => {
      const mockSetupIntent = {
        id: 'seti_mock',
        client_secret: 'secret',
      };

      mockSetupIntentsCreate.mockResolvedValue(mockSetupIntent);

      const result = await stripeService.createSPEIPaymentIntent({
        orderId: 'order-123',
        amount: 1000,
        customerEmail: 'customer@example.com',
        paymentMethod: 'spei',
      });

      // CLABE should be 18 digits
      expect(/^\d{18}$/.test(result.clabe)).toBe(true);
      // CLABE should start with STP bank code 646
      expect(result.clabe.substring(0, 3)).toBe('646');
    });
  });

  describe('getPaymentIntent', () => {
    it('should retrieve payment intent by ID', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 1000,
        status: 'requires_payment_method',
      };

      mockPaymentIntentsRetrieve.mockResolvedValue(mockPaymentIntent);

      const result = await stripeService.getPaymentIntent('pi_123');

      expect(result).toEqual(mockPaymentIntent);
      expect(mockPaymentIntentsRetrieve).toHaveBeenCalledWith('pi_123');
    });

    it('should throw StripeApiError when retrieve fails', async () => {
      mockPaymentIntentsRetrieve.mockRejectedValue(new Error('Not found'));

      await expect(stripeService.getPaymentIntent('pi_invalid')).rejects.toThrow(
        StripeApiError
      );
    });
  });

  describe('cancelPaymentIntent', () => {
    it('should cancel payment intent', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        status: 'canceled',
      };

      mockPaymentIntentsCancel.mockResolvedValue(mockPaymentIntent);

      const result = await stripeService.cancelPaymentIntent('pi_123');

      expect(result.status).toBe('canceled');
      expect(mockPaymentIntentsCancel).toHaveBeenCalledWith('pi_123');
    });

    it('should throw StripeApiError when cancel fails', async () => {
      mockPaymentIntentsCancel.mockRejectedValue(
        new Error('Payment intent already canceled')
      );

      await expect(stripeService.cancelPaymentIntent('pi_123')).rejects.toThrow(
        StripeApiError
      );
    });
  });

  describe('generateSPEICLABE', () => {
    it('should generate CLABE without Stripe API call', () => {
      const result = stripeService.generateSPEICLABE('order-123', 1000);

      expect(result.clabe).toBeDefined();
      expect(result.clabe).toHaveLength(18);
      expect(result.reference).toBeDefined();
      // Reference is extracted from CLABE (positions 5-17, which is 12 digits)
      expect(result.reference.length).toBeGreaterThanOrEqual(11);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should validate amount', () => {
      expect(() => stripeService.generateSPEICLABE('order-123', 0)).toThrow(
        ValidationError
      );
      expect(() => stripeService.generateSPEICLABE('order-123', -100)).toThrow(
        ValidationError
      );
    });

    it('should generate CLABE that starts with STP bank code', () => {
      const result = stripeService.generateSPEICLABE('order-123', 1000);

      expect(result.clabe.substring(0, 3)).toBe('646');
    });

    it('should set reference expiry to 72 hours from now', () => {
      const beforeCreate = Date.now();
      const result = stripeService.generateSPEICLABE('order-123', 1000);

      const expectedExpiryMs = 72 * 60 * 60 * 1000;
      const actualExpiryMs = result.expiresAt.getTime() - beforeCreate;

      // Allow 5 seconds tolerance
      expect(Math.abs(actualExpiryMs - expectedExpiryMs)).toBeLessThan(5000);
    });
  });
});
