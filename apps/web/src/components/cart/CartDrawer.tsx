'use client';

import { X, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { CartItem } from './CartItem';
import { FreeShippingProgress } from './FreeShippingProgress';
import { CartSummary } from './CartSummary';
import { Dialog, DialogDrawer } from '@ecoomerce-jardineria/ui';

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isOpen,
    setCartOpen,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShippingCost,
    getTotal,
  } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();
  const isEmpty = items.length === 0;

  const handleCheckout = () => {
    setCartOpen(false);
    router.push('/checkout/envio');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setCartOpen}>
      <DialogDrawer>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tu Carrito</h2>
            <button
              onClick={() => setCartOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
                <Link
                  href="/catalogo"
                  className="text-green-600 hover:text-green-700 font-medium"
                  onClick={() => setCartOpen(false)}
                >
                  ¡Explora nuestro catálogo!
                </Link>
              </div>
            ) : (
              <div className="px-4">
                {/* Free Shipping Progress */}
                <div className="py-4">
                  <FreeShippingProgress subtotal={subtotal} />
                </div>

                {/* Cart Items */}
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onRemove={() => removeItem(item.id)}
                      onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Summary */}
          {!isEmpty && (
            <div className="px-4 pb-6 bg-white">
              <CartSummary
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                isEmpty={isEmpty}
                onCheckout={handleCheckout}
              />
            </div>
          )}
        </div>
      </DialogDrawer>
    </Dialog>
  );
}
