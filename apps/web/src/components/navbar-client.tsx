'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, Search } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { UserMenu } from './user-menu';
import { CartDrawer } from './cart/CartDrawer';

interface NavbarClientProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  } | null;
}

export function NavbarClient({ user }: NavbarClientProps) {
  const { getTotalItems, setCartOpen } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="font-bold text-xl text-green-700">Jardín Verde</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/catalogo" className="text-gray-700 hover:text-green-600 transition-colors">
                Catálogo
              </Link>
              <Link href="/catalogo?categoria=semillas" className="text-gray-700 hover:text-green-600 transition-colors">
                Semillas
              </Link>
              <Link href="/catalogo?categoria=composta" className="text-gray-700 hover:text-green-600 transition-colors">
                Composta
              </Link>
              <Link href="/catalogo?categoria=tierra" className="text-gray-700 hover:text-green-600 transition-colors">
                Tierra
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="h-5 w-5 text-gray-600" />
              </button>
              
              {/* User Menu - replaces the old User icon */}
              <UserMenu user={user} />
              
              <button 
                onClick={() => setCartOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <ShoppingBag className="h-5 w-5 text-gray-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
