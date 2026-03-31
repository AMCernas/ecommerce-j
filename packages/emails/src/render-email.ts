import { render as reactEmailRender } from '@react-email/render';
import { ReactElement } from 'react';

/**
 * Render a React Email component to HTML string.
 * 
 * @param emailComponent - A React Email component (e.g., OrderConfirmationEmail)
 * @returns HTML string suitable for sending via Resend API
 * 
 * @example
 * ```typescript
 * import { renderEmail, OrderConfirmationEmail } from '@ecoomerce-jardineria/emails';
 * 
 * const html = await renderEmail(OrderConfirmationEmail({
 *   orderId: '123',
 *   customerName: 'María',
 *   // ... other props
 * }));
 * 
 * await sendEmail({ to: 'user@example.com', subject: 'Order Confirmed', html });
 * ```
 */
export async function renderEmail(emailComponent: ReactElement): Promise<string> {
  return reactEmailRender(emailComponent, {
    pretty: true,
  });
}
