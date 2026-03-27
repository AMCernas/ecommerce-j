/**
 * @ecoomerce-jardineria/stripe
 * 
 * Stripe payment integration package for Mexican market payments.
 * Supports card, OXXO, and SPEI payment methods.
 */

// Core service
export { StripeService, createStripeService } from './stripe.service';

// Webhook utilities
export { 
  verifyWebhookSignature, 
  parseWebhookEvent,
  isProcessableEvent,
  mapEventToOrderStatus,
  type ParsedWebhookEvent,
  type VerifyWebhookOptions,
} from './webhooks';

// CLABE utilities (SPEI)
export { 
  generateCLABE, 
  validateCLABE, 
  parseCLABE, 
  generateCLABEResult,
  type ParsedCLABE,
} from './utils/clabe';

// Voucher utilities (OXXO)
export { 
  generateOXXOVoucher, 
  sanitizeCustomerName,
  generateVoucherData,
  type OXXOVoucherOptions,
} from './utils/voucher';

// Types
export type {
  StripeConfig,
  PaymentMethodType,
  CreatePaymentIntentOptions,
  CreateOXXOVoucherOptions,
  CreateSPEIOptions,
  PaymentIntentResult,
  OXXOResult,
  SPEIResult,
  CLABEResult,
  WebhookEventResult,
  PaymentErrorCode,
  OXXOVoucherData,
} from './types';

// Errors
export {
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
  type PaymentErrorDetails,
} from './errors';
