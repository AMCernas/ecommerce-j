import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
} from '@react-email/components';

interface OrderStatusUpdateEmailProps {
  orderId: string;
  customerName: string;
  previousStatus: string;
  newStatus: string;
  trackingNumber?: string;
  message?: string;
}

const statusMessages: Record<string, { title: string; description: string }> = {
  paid: {
    title: 'Pago confirmado',
    description: 'Tu pago ha sido confirmado. Estamos preparando tu pedido.',
  },
  shipped: {
    title: '¡Tu pedido ha sido enviado!',
    description: 'Tu pedido está en camino. Recibirás más detalles pronto.',
  },
  delivered: {
    title: 'Pedido entregado',
    description: 'Tu pedido ha sido entregado. ¡Esperamos que lo disfrutes!',
  },
  refunded: {
    title: 'Reembolso procesado',
    description: 'El reembolso ha sido procesado. El dinero aparecerá en tu cuenta en 5-10 días hábiles.',
  },
};

export function OrderStatusUpdateEmail({
  orderId,
  customerName,
  newStatus,
  trackingNumber,
  message,
}: OrderStatusUpdateEmailProps) {
  const statusInfo = statusMessages[newStatus] || {
    title: 'Actualización de pedido',
    description: 'Hay una actualización en tu pedido.',
  };

  return (
    <Html>
      <Head />
      <Preview>{statusInfo.title} - Pedido #{orderId}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{statusInfo.title}</Heading>
          <Text style={styles.text}>Hola {customerName},</Text>
          <Text style={styles.text}>{statusInfo.description}</Text>

          {trackingNumber && (
            <div style={styles.trackingBox}>
              <Text style={styles.trackingLabel}>Número de seguimiento:</Text>
              <Text style={styles.trackingNumber}>{trackingNumber}</Text>
            </div>
          )}

          {message && <Text style={styles.message}>{message}</Text>}

          <Text style={styles.orderId}>Número de pedido: #{orderId}</Text>

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
  text: {
    fontSize: '16px',
    color: '#4a4a4a',
    lineHeight: '24px',
    marginBottom: '16px',
  },
  trackingBox: {
    backgroundColor: '#ecfdf5',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '24px',
    textAlign: 'center' as const,
  },
  trackingLabel: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    marginBottom: '4px',
  },
  trackingNumber: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#059669',
    fontFamily: 'monospace',
  },
  message: {
    fontSize: '14px',
    color: '#4a4a4a',
    lineHeight: '20px',
    marginTop: '16px',
    fontStyle: 'italic' as const,
  },
  orderId: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '24px',
  },
  footer: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center' as const,
    marginTop: '32px',
  },
};
