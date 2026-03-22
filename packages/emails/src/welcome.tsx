import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  customerName: string;
  email: string;
}

export function WelcomeEmail({ customerName, email }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a Jardín Verde</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>¡Bienvenido a Jardín Verde!</Heading>
          
          <Text style={styles.greeting}>Hola {customerName || 'amigo cultivador'},</Text>
          
          <Text style={styles.text}>
            Gracias por unirte a nuestra comunidad de jardineros. Estamos emocionados de tenerte
            como parte de Jardín Verde, tu tienda de semillas, composta y accesorios de jardinería.
          </Text>

          <Section style={styles.tips}>
            <Heading as="h3" style={styles.tipsTitle}>
              Consejos para empezar:
            </Heading>
            <ul style={styles.tipsList}>
              <li>Explora nuestro catálogo de semillas con alta tasa de germinación</li>
              <li>Usa los filtros por nivel de cuidado para encontrar lo ideal para ti</li>
              <li>Revisa nuestra sección de guías de cultivo</li>
              <li>Activa las notificaciones para recibir ofertas especiales</li>
            </ul>
          </Section>

          <Section style={styles.cta}>
            <Text style={styles.ctaText}>
              ¿Listo para comenzar? Explora nuestro catálogo y encuentra todo lo que necesitas
              para tu huerto o jardín.
            </Text>
            <Button href="https://jardinverde.com/catalogo" style={styles.button}>
              Ver catálogo
            </Button>
          </Section>

          <Text style={styles.footer}>
            ¿Tienes preguntas? Estamos aquí para ayudarte. Contáctanos por WhatsApp o responde este email.
          </Text>

          <Text style={styles.signature}>
            Con cariño,
            <br />
            El equipo de Jardín Verde 🌱
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
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: '24px',
    textAlign: 'center' as const,
  },
  greeting: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  text: {
    fontSize: '16px',
    color: '#4a4a4a',
    lineHeight: '24px',
    marginBottom: '16px',
  },
  tips: {
    backgroundColor: '#f0fdf4',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '24px',
  },
  tipsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#166534',
    marginBottom: '12px',
  },
  tipsList: {
    fontSize: '14px',
    color: '#166534',
    lineHeight: '24px',
    paddingLeft: '20px',
    margin: '0',
  },
  cta: {
    textAlign: 'center' as const,
    marginTop: '32px',
  },
  ctaText: {
    fontSize: '16px',
    color: '#4a4a4a',
    lineHeight: '24px',
    marginBottom: '16px',
  },
  button: {
    backgroundColor: '#059669',
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
  },
  footer: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center' as const,
    marginTop: '32px',
  },
  signature: {
    fontSize: '14px',
    color: '#4a4a4a',
    marginTop: '24px',
    lineHeight: '20px',
  },
};
