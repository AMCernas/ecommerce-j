/**
 * OXXO Voucher Generation Utility
 * 
 * Generates PDF vouchers for OXXO cash payments.
 * The voucher contains:
 * - Payment reference barcode (Code 128)
 * - Amount in MXN
 * - Expiration date
 * - Payment instructions
 */

import PDFDocument from 'pdfkit';

export interface OXXOVoucherOptions {
  orderId: string;
  amount: number; // MXN cents
  customerName: string;
  reference: string;
  expiresAt: Date;
  companyName: string;
}

/**
 * Sanitizes customer name for voucher printing
 * - Strips HTML tags
 * - Replaces spaces with underscores
 * - Removes special characters
 */
export function sanitizeCustomerName(name: string): string {
  // Strip HTML tags
  let sanitized = name.replace(/<[^>]*>/g, '');
  
  // Remove special characters except letters, numbers, and basic punctuation
  sanitized = sanitized.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Replace spaces with underscores for voucher printing
  sanitized = sanitized.replace(/\s+/g, '_');
  
  // Limit length
  if (sanitized.length > 50) {
    sanitized = sanitized.substring(0, 50);
  }
  
  return sanitized;
}

/**
 * Formats amount for display (MXN cents to display format)
 */
function formatAmount(amountInCents: number): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

/**
 * Formats date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Generates a Code 128 barcode as SVG path data
 * This is a simplified barcode generator for the payment reference
 * 
 * Code 128 encoding: Each character maps to a pattern of bars and spaces
 */
function generateCode128Barcode(text: string): {
  width: number;
  bars: Array<{ x: number; width: number; height: number }>;
} {
  // Code 128B character patterns (simplified)
  const patterns: Record<string, number[]> = {
    '0': [2, 1, 2, 2, 2, 1],
    '1': [2, 2, 2, 1, 2, 1],
    '2': [2, 2, 2, 1, 1, 2],
    '3': [1, 2, 1, 2, 2, 2],
    '4': [1, 2, 1, 1, 2, 2],
    '5': [1, 1, 2, 2, 2, 1],
    '6': [2, 2, 1, 2, 1, 2],
    '7': [2, 2, 1, 1, 2, 1],
    '8': [2, 1, 2, 1, 2, 2],
    '9': [1, 1, 2, 1, 2, 1],
  };

  // Start with quiet zone
  const bars: Array<{ x: number; width: number; height: number }> = [];
  let x = 10; // Quiet zone
  const unit = 2; // Width of each bar unit
  const height = 60;
  
  // Add start character (Code 128B Start B = 104)
  // Simplified: just add some bars
  x += 20;
  
  for (const char of text) {
    const pattern = patterns[char] || patterns['0'];
    for (let i = 0; i < pattern.length; i++) {
      const width = pattern[i] * unit;
      if (i % 2 === 0) {
        // Draw bar
        bars.push({ x, width, height });
      }
      x += width;
    }
  }
  
  // Add stop character
  x += 20;
  
  return { width: x + 10, bars };
}

/**
 * Generates OXXO payment voucher PDF
 * 
 * @param options - Voucher configuration
 * @returns PDF buffer
 */
export async function generateOXXOVoucher(options: OXXOVoucherOptions): Promise<Buffer> {
  const {
    orderId,
    amount,
    customerName,
    reference,
    expiresAt,
    companyName,
  } = options;

  // Sanitize customer name
  const safeName = sanitizeCustomerName(customerName);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#0033A0'; // OXXO blue
      const textColor = '#333333';
      const grayColor = '#666666';

      // Header
      doc
        .fontSize(10)
        .fillColor(grayColor)
        .text('PAGO EN EFECTIVO EN TIENDAS OXXO', 50, 50, { align: 'center' });

      doc.moveDown(0.5);

      // Company name
      doc
        .fontSize(14)
        .fillColor(textColor)
        .text(companyName, { align: 'center' });

      doc.moveDown(1);

      // Divider
      doc
        .strokeColor(primaryColor)
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(1);

      // Amount
      doc
        .fontSize(28)
        .fillColor(primaryColor)
        .text(formatAmount(amount), { align: 'center' });

      doc.moveDown(0.5);

      // Label
      doc
        .fontSize(10)
        .fillColor(grayColor)
        .text('CANTIDAD A PAGAR', { align: 'center' });

      doc.moveDown(1);

      // Barcode section
      doc
        .fontSize(12)
        .fillColor(textColor)
        .text('REFERENCIA DE PAGO', { align: 'center' });

      doc.moveDown(0.5);

      // Draw barcode manually using rectangles (Code 128 style)
      const barcodeData = generateCode128Barcode(reference);
      doc.save();
      
      doc.fillColor('#000000');
      for (const bar of barcodeData.bars) {
        doc.rect(bar.x, doc.y, bar.width, bar.height).fill();
      }
      
      doc.restore();
      doc.moveDown(1.5);

      // Reference number (text representation)
      doc
        .fontSize(16)
        .fillColor(textColor)
        .text(reference, { align: 'center', characterSpacing: 4 });

      doc.moveDown(2);

      // Instructions
      doc
        .fontSize(11)
        .fillColor(textColor)
        .text('INSTRUCCIONES:', { underline: true });

      doc.moveDown(0.5);

      const instructions = [
        '1. Acude a cualquier tienda OXXO.',
        '2. Indica al cajero que quieres hacer un pago de servicios.',
        '3. Proporciona la referencia de pago indicada arriba.',
        '4. Realiza el pago en efectivo.',
        '5. Conserva tu comprobante de pago.',
      ];

      doc
        .fontSize(10)
        .fillColor(grayColor);

      for (const instruction of instructions) {
        doc.text(instruction, { align: 'left' });
        doc.moveDown(0.3);
      }

      doc.moveDown(1);

      // Expiration warning
      doc
        .fontSize(10)
        .fillColor('#CC0000')
        .text(`IMPORTANTE: Este pago tiene vigencia hasta el ${formatDate(expiresAt)}`, { align: 'center' });

      doc.moveDown(0.5);

      doc
        .fontSize(9)
        .fillColor(grayColor)
        .text(`Orden: ${orderId}`, { align: 'center' });

      doc.moveDown(0.5);

      doc
        .fontSize(9)
        .fillColor(grayColor)
        .text(`Cliente: ${safeName}`, { align: 'center' });

      // Footer
      doc
        .fontSize(8)
        .fillColor(grayColor)
        .text(
          'Powered by Stripe • No es necesario presentar este documento en tienda',
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generates voucher data for storage
 */
export function generateVoucherData(
  orderId: string,
  amount: number,
  customerName: string,
  expiresAt: Date
): {
  reference: string;
  orderId: string;
  amount: number;
  customerName: string;
  expiresAt: Date;
} {
  // Generate a 14-digit reference number
  const timestamp = Date.now().toString().slice(-8);
  const orderHash = orderId.replace(/-/g, '').slice(0, 6);
  const reference = (timestamp + orderHash).padStart(14, '0');

  return {
    reference,
    orderId,
    amount,
    customerName: sanitizeCustomerName(customerName),
    expiresAt,
  };
}
