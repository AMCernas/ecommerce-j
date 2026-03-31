// Email templates export
export { OrderConfirmationEmail } from './order-confirmation';
export { OrderStatusUpdateEmail } from './order-status-update';
export { WelcomeEmail } from './welcome';

// Email utilities
export { sendEmail } from './send-email';
export type { SendEmailOptions, SendEmailResult } from './send-email';
export { renderEmail } from './render-email';

// Types
export type {
  OrderConfirmationEmailProps,
  OrderStatusUpdateEmailProps,
  WelcomeEmailProps,
} from './types';
