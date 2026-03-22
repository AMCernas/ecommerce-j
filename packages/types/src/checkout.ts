// Checkout types
export interface CheckoutSession {
  orderId: string;
  clientSecret: string | null; // For card payments
  oxxoVoucherUrl: string | null; // For OXXO payments
  speiCLABE: string | null; // For SPEI transfers
  expiresAt: Date;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: 'mxn';
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  paymentMethodTypes: ('card' | 'oxxo' | 'spei')[];
  metadata: {
    orderId: string;
  };
}

// Discount codes
export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_mxn';
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}
