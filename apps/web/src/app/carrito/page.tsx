'use client';

import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { Button } from '@ecoomerce-jardineria/ui';
import { FreeShippingProgress } from '@/components/cart/FreeShippingProgress';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShippingCost,
    getTotal,
    clearCart,
  } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();
  const isEmpty = items.length === 0;

  const handleCheckout = () => {
    router.push('/checkout/envio');
  };

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-16 w-16 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-8">
              ¡Explora nuestro catálogo y encuentra productos increíbles para tu jardín!
            </p>
            <Link href="/catalogo">
              <Button size="lg">Ver Catálogo</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Continuar comprando
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tu Carrito de Compras
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Desktop Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                <div className="col-span-6">Producto</div>
                <div className="col-span-2 text-center">Precio</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Cart Items */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="md:grid md:grid-cols-12 md:gap-4 md:items-center p-4 md:p-6"
                  >
                    {/* Product Info */}
                    <div className="col-span-6 flex gap-4">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🌱
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          {item.variantG}kg
                        </span>
                        <p className="mt-1 text-sm text-gray-500 md:hidden">
                          ${item.price.toFixed(2)} c/u
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="mt-2 md:mt-3 flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Price - Desktop */}
                    <div className="hidden md:flex col-span-2 items-center justify-center">
                      <span className="text-gray-700">${item.price.toFixed(2)}</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-2 flex items-center justify-center gap-2 mt-4 md:mt-0">
                      <button
                        onClick={() =>
                          item.quantity === 1
                            ? removeItem(item.id)
                            : updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value)) {
                            if (value === 0) {
                              removeItem(item.id);
                            } else {
                              updateQuantity(item.id, value);
                            }
                          }
                        }}
                        className="w-14 h-8 text-center border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="1"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="col-span-2 flex items-center justify-between md:justify-end gap-4 mt-4 md:mt-0">
                      <span className="md:hidden text-sm text-gray-500">
                        Subtotal:
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={clearCart}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen del Pedido
              </h2>

              {/* Free Shipping Progress */}
              <div className="mb-6">
                <FreeShippingProgress subtotal={subtotal} />
              </div>

              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  {shipping === 0 ? (
                    <span className="font-medium text-green-600">¡Gratis!</span>
                  ) : (
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between py-4">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl text-green-700">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
              >
                Proceder al Pago
              </Button>

              <p className="mt-4 text-xs text-gray-500 text-center">
                Los impuestos y gastos de envío se calculan al finalizar la compra.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
