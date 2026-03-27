import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Jardín Verde | Semillas, Composta y Accesorios de Jardinería',
    template: '%s | Jardín Verde',
  },
  description:
    'Tienda online de semillas, composta, tierra preparada y accesorios de jardinería. Envíos en Colima y toda México. Filtros por nivel de cuidado, riego y espacio.',
  keywords: [
    'semillas',
    'composta',
    'tierra para jardín',
    'jardinería',
    'Colima',
    'México',
    'huertos urbanos',
    'semillas orgánicas',
  ],
  authors: [{ name: 'Jardín Verde' }],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Jardín Verde',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <CartDrawer />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="bg-green-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌱</span>
              <span className="font-bold text-xl">Jardín Verde</span>
            </div>
            <p className="text-green-200 text-sm">
              Tu tienda de confianza para semillas, composta y accesorios de jardinería en Colima.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Catálogo</h3>
            <ul className="space-y-2 text-green-200 text-sm">
              <li><a href="/catalogo?categoria=semillas" className="hover:text-white">Semillas</a></li>
              <li><a href="/catalogo?categoria=composta" className="hover:text-white">Composta</a></li>
              <li><a href="/catalogo?categoria=tierra" className="hover:text-white">Tierra</a></li>
              <li><a href="/catalogo?categoria=accesorios" className="hover:text-white">Accesorios</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-green-200 text-sm">
              <li>📍 Colima, México</li>
              <li>📞 +52 312 123 4567</li>
              <li>✉️ hola@jardinverde.com</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-green-200 text-sm">
              <li><a href="/privacidad" className="hover:text-white">Política de privacidad</a></li>
              <li><a href="/terminos" className="hover:text-white">Términos y condiciones</a></li>
              <li><a href="/envios" className="hover:text-white">Política de envíos</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-green-800 mt-8 pt-8 text-center text-green-300 text-sm">
          <p>© {new Date().getFullYear()} Jardín Verde. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
