'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Package, MapPin, Heart, Settings, LogOut } from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?redirect=/cuenta');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  const menuItems = [
    { href: '/cuenta', label: 'Mi cuenta', icon: Package },
    { href: '/cuenta/pedidos', label: 'Mis pedidos', icon: Package },
    { href: '/cuenta/direcciones', label: 'Direcciones', icon: MapPin },
    { href: '/cuenta/wishlist', label: 'Favoritos', icon: Heart },
    { href: '/cuenta/configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Mi cuenta</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-4">
              <div className="mb-6 pb-4 border-b">
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-gray-500">Cliente</p>
              </div>
              
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar sesión
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
