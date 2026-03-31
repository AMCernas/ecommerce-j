/**
 * Template Unit Tests
 * 
 * Tests for email template rendering with different prop combinations.
 */

import { describe, it, expect } from 'vitest';
import { renderEmail } from '../render-email';
import { OrderConfirmationEmail } from '../order-confirmation';
import { OrderStatusUpdateEmail } from '../order-status-update';
import { WelcomeEmail } from '../welcome';

describe('OrderConfirmationEmail Template', () => {
  const baseProps = {
    orderId: 'ORD-123',
    customerName: 'María García',
    items: [
      { name: 'Semillas de Tomate', quantity: 2, price: 89.00 },
      { name: 'Composta 5kg', quantity: 1, price: 150.00 },
    ],
    subtotal: 328.00,
    shippingCost: 99.00,
    discount: 0,
    total: 427.00,
    shippingAddress: {
      street: 'Av. Principal 123',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '01000',
    },
    paymentMethod: 'card' as const,
  };

  it('should render with card payment method', async () => {
    const html = await renderEmail(OrderConfirmationEmail(baseProps));
    
    expect(html).toContain('Tu pago está siendo procesado.');
    expect(html).toContain('María García');
    expect(html).toContain('ORD-123');
  });

  it('should render with OXXO payment method and voucher URL', async () => {
    const props = {
      ...baseProps,
      paymentMethod: 'oxxo' as const,
      oxxoVoucherUrl: 'https://resend.com/oxxo/voucher.pdf',
    };
    
    const html = await renderEmail(OrderConfirmationEmail(props));
    
    expect(html).toContain('Te enviamos tu voucher de OXXO para completar el pago.');
    expect(html).toContain('Descargar voucher de OXXO');
  });

  it('should render with OXXO payment without voucher URL', async () => {
    const props = {
      ...baseProps,
      paymentMethod: 'oxxo' as const,
    };
    
    const html = await renderEmail(OrderConfirmationEmail(props));
    
    expect(html).toContain('Te enviamos tu voucher de OXXO para completar el pago.');
    expect(html).not.toContain('Descargar voucher de OXXO');
  });

  it('should render with SPEI payment method and CLABE', async () => {
    const props = {
      ...baseProps,
      paymentMethod: 'spei' as const,
      speiCLABE: '002010777777777777',
    };
    
    const html = await renderEmail(OrderConfirmationEmail(props));
    
    expect(html).toContain('Te enviamos los datos para realizar tu transferencia SPEI.');
    expect(html).toContain('002010777777777777');
  });

  it('should render discount when discount > 0', async () => {
    const props = {
      ...baseProps,
      discount: 50.00,
      total: 377.00,
    };
    
    const html = await renderEmail(OrderConfirmationEmail(props));
    
    expect(html).toContain('Descuento');
    expect(html).toContain('50.00');
  });

  it('should not render discount section when discount is 0', async () => {
    const html = await renderEmail(OrderConfirmationEmail(baseProps));
    
    expect(html).not.toContain('Descuento');
  });

  it('should render order items correctly', async () => {
    const html = await renderEmail(OrderConfirmationEmail(baseProps));
    
    expect(html).toContain('Semillas de Tomate');
    expect(html).toContain('Composta 5kg');
  });

  it('should render shipping address', async () => {
    const html = await renderEmail(OrderConfirmationEmail(baseProps));
    
    expect(html).toContain('Av. Principal 123');
    expect(html).toContain('Ciudad de México');
    expect(html).toContain('CDMX');
    expect(html).toContain('01000');
  });

  it('should render correct totals', async () => {
    const html = await renderEmail(OrderConfirmationEmail(baseProps));
    
    expect(html).toContain('328.00'); // subtotal
    expect(html).toContain('99.00');  // shipping
    expect(html).toContain('427.00'); // total
  });
});

describe('OrderStatusUpdateEmail Template', () => {
  const baseProps = {
    orderId: 'ORD-456',
    customerName: 'Juan Pérez',
    previousStatus: 'pending',
    newStatus: 'paid',
  };

  it('should render with paid status', async () => {
    const html = await renderEmail(OrderStatusUpdateEmail({
      ...baseProps,
      newStatus: 'paid',
    }));
    
    expect(html).toContain('Pago confirmado');
    expect(html).toContain('Tu pago ha sido confirmado');
    expect(html).toContain('Juan Pérez');
  });

  it('should render with shipped status', async () => {
    const html = await renderEmail(OrderStatusUpdateEmail({
      ...baseProps,
      newStatus: 'shipped',
      trackingNumber: 'TRACK123456',
    }));
    
    expect(html).toContain('¡Tu pedido ha sido enviado!');
    expect(html).toContain('TRACK123456');
    expect(html).toContain('Número de seguimiento:');
  });

  it('should render with delivered status', async () => {
    const html = await renderEmail(OrderStatusUpdateEmail({
      ...baseProps,
      newStatus: 'delivered',
    }));
    
    expect(html).toContain('Pedido entregado');
    expect(html).toContain('entregado');
  });

  it('should render with refunded status', async () => {
    const html = await renderEmail(OrderStatusUpdateEmail({
      ...baseProps,
      newStatus: 'refunded',
    }));
    
    expect(html).toContain('Reembolso procesado');
    expect(html).toContain('reembolso ha sido procesado');
  });

  it('should render without tracking number', async () => {
    const html = await renderEmail(OrderStatusUpdateEmail({
      ...baseProps,
      newStatus: 'shipped',
    }));
    
    expect(html).not.toContain('Número de seguimiento:');
    expect(html).not.toContain('trackingBox');
  });

  it('should render with custom message', async () => {
    const html = await renderEmail(OrderStatusUpdateEmail({
      ...baseProps,
      message: 'Tu paquete fue retrasado por mal clima',
    }));
    
    expect(html).toContain('Tu paquete fue retrasado por mal clima');
  });

  it('should render with unknown status fallback', async () => {
    const html = await renderEmail(OrderStatusUpdateEmail({
      ...baseProps,
      newStatus: 'custom_status',
    }));
    
    expect(html).toContain('Actualización de pedido');
    expect(html).toContain('actualización');
  });

  it('should render order ID correctly', async () => {
    const html = await renderEmail(OrderStatusUpdateEmail(baseProps));
    
    expect(html).toContain('ORD-456');
  });
});

describe('WelcomeEmail Template', () => {
  it('should render with customer name', async () => {
    const html = await renderEmail(WelcomeEmail({
      customerName: 'Carlos Mendoza',
      email: 'carlos@example.com',
    }));
    
    expect(html).toContain('Hola');
    expect(html).toContain('Carlos Mendoza');
    expect(html).toContain('Bienvenido a Jardín Verde');
  });

  it('should render with empty name fallback', async () => {
    const html = await renderEmail(WelcomeEmail({
      customerName: '',
      email: 'user@example.com',
    }));
    
    expect(html).toContain('Hola');
    expect(html).toContain('amigo cultivador');
  });

  it('should render catalog CTA button', async () => {
    const html = await renderEmail(WelcomeEmail({
      customerName: 'Test User',
      email: 'test@example.com',
    }));
    
    expect(html).toContain('Ver catálogo');
    expect(html).toContain('https://jardinverde.com/catalogo');
  });

  it('should render gardening tips section', async () => {
    const html = await renderEmail(WelcomeEmail({
      customerName: 'Test User',
      email: 'test@example.com',
    }));
    
    expect(html).toContain('Consejos para empezar');
    expect(html).toContain('Explora nuestro catálogo de semillas');
    expect(html).toContain('germina');
  });

  it('should render footer with contact info', async () => {
    const html = await renderEmail(WelcomeEmail({
      customerName: 'Test User',
      email: 'test@example.com',
    }));
    
    expect(html).toContain('¿Tienes preguntas?');
    expect(html).toContain('WhatsApp');
  });

  it('should render signature with team name', async () => {
    const html = await renderEmail(WelcomeEmail({
      customerName: 'Test User',
      email: 'test@example.com',
    }));
    
    expect(html).toContain('El equipo de Jardín Verde');
    expect(html).toContain('🌱');
  });
});
