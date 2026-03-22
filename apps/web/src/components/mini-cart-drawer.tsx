'use client';

import { useCartStore } from '@/store/cart';
import { Button } from '@ecoomerce-jardineria/ui';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';

export function MiniCartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, getSubtotal, getShippingCost, getTotal } = useCartStore();

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();
  const freeShippingThreshold = 1000;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setCartOpen(false)}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrito ({items.length})
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        {subtotal < freeShippingThreshold && (
          <div className="px-4 py-3 bg-green-50">
            <p className="text-sm text-green-700">
              ¡Faltan ${amountToFreeShipping.toFixed(2)} para envío gratis!
            </p>
            <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 transition-all"
                style={{ width: `${(subtotal / freeShippingThreshold) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Tu carrito está vacío</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setCartOpen(false)}
              >
                Continuar comprando
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.variantG}g</p>
                    <p className="font-semibold text-green-600 mt-1">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 bg-white border rounded hover:bg-gray-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 bg-white border rounded hover:bg-gray-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" onClick={() => setCartOpen(false)}>
              <Button className="w-full" size="lg">
                Proceder al pago
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setCartOpen(false)}
            >
              Continuar comprando
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
