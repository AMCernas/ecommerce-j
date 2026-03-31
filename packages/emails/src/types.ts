/**
 * Email Template Props Interfaces
 * 
 * These interfaces define the props for each email template component.
 */

/**
 * Props for OrderConfirmationEmail
 * Sent after order creation with payment instructions for OXXO/SPEI
 * or confirmation for card payments.
 */
export interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  paymentMethod: 'oxxo' | 'spei' | 'card';
  oxxoVoucherUrl?: string;
  speiCLABE?: string;
}

/**
 * Props for OrderStatusUpdateEmail
 * Sent when order status changes (paid, shipped, delivered, refunded).
 */
export interface OrderStatusUpdateEmailProps {
  orderId: string;
  customerName: string;
  previousStatus: string;
  newStatus: string;
  trackingNumber?: string;
  message?: string;
}

/**
 * Props for WelcomeEmail
 * Sent to new users after successful registration.
 */
export interface WelcomeEmailProps {
  customerName: string;
  email: string;
}
