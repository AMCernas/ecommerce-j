import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth/actions';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Admin | Jardín Verde',
    template: '%s | Admin Jardín Verde',
  },
  description: 'Panel de administración de Jardín Verde',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen flex">
          <aside className="w-64 bg-white border-r hidden lg:block relative">
            <div className="p-6">
              <h1 className="text-xl font-bold text-green-600">Jardín Verde</h1>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
            <nav className="px-4 pb-20">
              <ul className="space-y-1">
                <li>
                  <a
                    href="/admin"
                    className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/productos"
                    className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Productos
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/ordenes"
                    className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Órdenes
                  </a>
                </li>
                <li>
                  <a
                    href="/admin/descuentos"
                    className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Descuentos
                  </a>
                </li>
              </ul>
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <form action={async () => {
                'use server';
                await signOut();
              }}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 w-full rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </aside>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
