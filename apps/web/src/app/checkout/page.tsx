'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { Button } from '@ecoomerce-jardineria/ui';
import Link from 'next/link';
import { createOrder, ShippingAddress } from '@/lib/orders/actions';
import { Loader2, CreditCard, Building, Wallet } from 'lucide-react';

export default function CheckoutPage() {
  const { items, getSubtotal, getShippingCost, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'oxxo' | 'spei' | 'card'>('oxxo');
  
  const [formData, setFormData] = useState<ShippingAddress>({
    name: '',
    street: '',
    exteriorNumber: '',
    interiorNumber: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  });

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();
  const freeShippingThreshold = 1000;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Transform cart items for order
      const orderItems = items.map(item => ({
        productId: item.productId,
        productName: item.name,
        variantG: item.variantG,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      const result = await createOrder({
        items: orderItems,
        subtotal,
        shippingCost: shipping,
        discount: 0,
        total,
        paymentMethod,
        shippingAddress: formData,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success && result.orderId) {
        clearCart();
        setOrderSuccess(result.orderId);
      }
    } catch (err) {
      setError('Error al procesar el pedido. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderSuccess) {
    return (
      <main className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-8">Añade productos para continuar con tu compra</p>
          <Link href="/catalogo">
            <Button>Ver catálogo</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (orderSuccess) {
    return (
      <main className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center max-w-md">
          <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">¡Pedido realizado!</h1>
          <p className="text-gray-600 mb-2">Tu número de pedido es:</p>
          <p className="text-xl font-mono font-bold text-green-600 mb-6">{orderSuccess}</p>
          <p className="text-gray-600 mb-8">
            Te hemos enviado un correo de confirmación. Puedes seguir tu pedido en tu cuenta.
          </p>
          <Link href="/catalogo">
            <Button className="w-full">Seguir comprando</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-semibold mb-4">Dirección de envío</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Nombre completo</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Calle</label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Av. Revolución"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Número exterior</label>
                    <input
                      type="text"
                      name="exteriorNumber"
                      required
                      value={formData.exteriorNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Número interior (opcional)</label>
                    <input
                      type="text"
                      name="interiorNumber"
                      value={formData.interiorNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Colonia</label>
                    <input
                      type="text"
                      name="neighborhood"
                      required
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ciudad</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Colima"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Colima"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Código postal</label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="28000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="3121234567"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-semibold mb-4">Método de pago</h2>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'oxxo' ? 'border-green-600 bg-green-50' : 'hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="oxxo"
                      checked={paymentMethod === 'oxxo'}
                      onChange={() => setPaymentMethod('oxxo')}
                      className="sr-only"
                    />
                    <Building className="h-5 w-5 mr-3 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Pago en OXXO</p>
                      <p className="text-sm text-gray-500">Genera tu voucher y paga en cualquier tienda OXXO</p>
                    </div>
                    <span className="text-xl">🏪</span>
                  </label>
                  
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'spei' ? 'border-green-600 bg-green-50' : 'hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="spei"
                      checked={paymentMethod === 'spei'}
                      onChange={() => setPaymentMethod('spei')}
                      className="sr-only"
                    />
                    <Wallet className="h-5 w-5 mr-3 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Transferencia SPEI</p>
                      <p className="text-sm text-gray-500">Pago con CLABE interbancaria</p>
                    </div>
                    <span className="text-xl">🏦</span>
                  </label>
                  
                  <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-green-600 bg-green-50' : 'hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="sr-only"
                    />
                    <CreditCard className="h-5 w-5 mr-3 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium">Tarjeta de débito/crédito</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, AMEX</p>
                    </div>
                    <span className="text-xl">💳</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  `Realizar pedido - $${total.toFixed(2)}`
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.variantG}g × {item.quantity}</p>
                      <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {subtotal < freeShippingThreshold && (
                  <p className="text-xs text-green-600">
                    ¡Faltan ${(freeShippingThreshold - subtotal).toFixed(2)} para envío gratis!
                  </p>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
