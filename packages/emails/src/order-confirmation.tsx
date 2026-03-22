import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface OrderConfirmationEmailProps {
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

export function OrderConfirmationEmail({
  orderId,
  customerName,
  items,
  subtotal,
  shippingCost,
  discount,
  total,
  shippingAddress,
  paymentMethod,
  oxxoVoucherUrl,
  speiCLABE,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu pedido #{orderId} ha sido recibido</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>¡Pedido confirmado!</Heading>
          <Text style={styles.text}>Hola {customerName},</Text>
          <Text style={styles.text}>
            Hemos recibido tu pedido #{orderId}.{' '}
            {paymentMethod === 'oxxo' && 'Te enviamos tu voucher de OXXO para completar el pago.'}
            {paymentMethod === 'spei' && 'Te enviamos los datos para realizar tu transferencia SPEI.'}
            {paymentMethod === 'card' && 'Tu pago está siendo procesado.'}
          </Text>

          {oxxoVoucherUrl && (
            <Section style={styles.buttonContainer}>
              <Button href={oxxoVoucherUrl} style={styles.button}>
                Descargar voucher de OXXO
              </Button>
            </Section>
          )}

          {speiCLABE && (
            <Section style={styles.highlightBox}>
              <Text style={styles.highlightTitle}>Datos para transferencia SPEI:</Text>
              <Text style={styles.highlightText}>CLABE: {speiCLABE}</Text>
              <Text style={styles.highlightText}>Monto: ${total.toFixed(2)} MXN</Text>
              <Text style={styles.highlightText}>Concepto: {orderId}</Text>
            </Section>
          )}

          <Section style={styles.section}>
            <Heading as="h3" style={styles.subheading}>
              Resumen del pedido
            </Heading>
            {items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </div>
            ))}
            <div style={styles.divider} />
            <div style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
            </div>
            <div style={styles.totalRow}>
              <Text style={styles.totalLabel}>Envío</Text>
              <Text style={styles.totalValue}>${shippingCost.toFixed(2)}</Text>
            </div>
            {discount > 0 && (
              <div style={styles.totalRow}>
                <Text style={styles.totalLabel}>Descuento</Text>
                <Text style={styles.discount}>-${discount.toFixed(2)}</Text>
              </div>
            )}
            <div style={styles.divider} />
            <div style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>${total.toFixed(2)} MXN</Text>
            </div>
          </Section>

          <Section style={styles.section}>
            <Heading as="h3" style={styles.subheading}>
              Dirección de envío
            </Heading>
            <Text style={styles.addressText}>
              {shippingAddress.street}
              <br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
            </Text>
          </Section>

          <Text style={styles.footer}>
            ¿Tienes alguna pregunta? Contáctanos por WhatsApp o responde este email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px 20px',
    maxWidth: '600px',
    borderRadius: '8px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '24px',
    textAlign: 'center' as const,
  },
  subheading: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: '0',
    marginBottom: '16px',
  },
  text: {
    fontSize: '16px',
    color: '#4a4a4a',
    lineHeight: '24px',
    marginBottom: '16px',
  },
  section: {
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  itemName: {
    fontSize: '14px',
    color: '#4a4a4a',
  },
  itemPrice: {
    fontSize: '14px',
    color: '#4a4a4a',
  },
  divider: {
    borderTop: '1px solid #e5e7eb',
    margin: '12px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  totalLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  totalValue: {
    fontSize: '14px',
    color: '#4a4a4a',
  },
  discount: {
    fontSize: '14px',
    color: '#059669',
  },
  grandTotalLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  grandTotalValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#059669',
  },
  highlightBox: {
    backgroundColor: '#fef3c7',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '24px',
  },
  highlightTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: '8px',
  },
  highlightText: {
    fontSize: '14px',
    color: '#92400e',
    marginBottom: '4px',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    marginTop: '24px',
  },
  button: {
    backgroundColor: '#059669',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
  addressText: {
    fontSize: '14px',
    color: '#4a4a4a',
    lineHeight: '20px',
  },
  footer: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center' as const,
    marginTop: '32px',
  },
};
