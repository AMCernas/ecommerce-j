import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const DEFAULT_FROM_NAME = process.env.RESEND_FROM_NAME || 'Jardín Verde';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend API.
 * 
 * @param options - Email options including recipient, subject, HTML body, and optional sender
 * @returns Result object with success status, messageId on success, or error message on failure
 * 
 * @example
 * ```typescript
 * const result = await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome!',
 *   html: '<p>Hello world</p>',
 * });
 * 
 * if (result.success) {
 *   console.log('Email sent:', result.messageId);
 * } else {
 *   console.error('Failed:', result.error);
 * }
 * ```
 */
export async function sendEmail({
  to,
  subject,
  html,
  from,
}: SendEmailOptions): Promise<SendEmailResult> {
  // Validate API key presence
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  // Validate recipient format (basic)
  if (!to || !to.includes('@')) {
    console.warn(`Invalid recipient email: ${to}`);
    return { success: false, error: 'Invalid recipient email format' };
  }

  const sender = from || `${DEFAULT_FROM_NAME} <${DEFAULT_FROM}>`;

  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`Email send failed: ${error.message}`, { to, subject });
      return { success: false, error: error.message };
    }

    console.log(`Email sent successfully`, {
      to,
      subject,
      messageId: data?.id,
    });

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Email send error: ${errorMessage}`, { to, subject });
    return { success: false, error: errorMessage };
  }
}
