'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@ecoomerce-jardineria/ui';
import { useCheckoutStore } from '@/store/checkout';
import { useCartStore } from '@/store/cart';
import { getOrder } from '@/lib/orders/actions';

interface OrderConfirmationProps {
  orderId: string;
}

interface OrderDetails {
  id: string;
  total: string;
  paymentMethod: string;
  items?: Array<{
    productName: string;
    quantity: number;
    unitPrice: string;
  }>;
}

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { clearCart } = useCartStore();
  const { reset } = useCheckoutStore();

  useEffect(() => {
    async function fetchOrder() {
      try {
        const orderData = await getOrder(orderId);
        if (orderData) {
          setOrder(orderData as OrderDetails);
        } else {
          setError('No se encontró la orden');
        }
      } catch {
        setError('Error al cargar los detalles del pedido');
      } finally {
        setIsLoading(false);
      }
    }

    // Clear cart and reset checkout on mount
    clearCart();
    reset();

    fetchOrder();
  }, [orderId, clearCart, reset]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">
            Lo sentimos, no pudimos encontrar los detalles de tu pedido.
          </p>
          <Link href="/catalogo">
            <Button>Explorar Catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const paymentMethodLabels: Record<string, string> = {
    card: 'Tarjeta de Crédito/Débito',
    oxxo: 'Pago en OXXO',
    spei: 'Transferencia SPEI',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Pedido Confirmado!
            </h1>
            <p className="text-gray-600">
              Gracias por tu compra. Te hemos enviado un correo de confirmación.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            {/* Order Header */}
            <div className="bg-green-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5" />
                  <span className="font-semibold">Pedido #{orderId.slice(0, 8).toUpperCase()}</span>
                </div>
                <span className="text-sm opacity-90">Completado</span>
              </div>
            </div>

            {/* Order Info */}
            <div className="p-6 space-y-6">
              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Método de pago</p>
                  <p className="font-medium">
                    {paymentMethodLabels[order?.paymentMethod || 'card']}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total pagado</p>
                  <p className="font-bold text-xl text-green-700">
                    ${parseFloat(order?.total || '0').toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Items */}
              {order?.items && order.items.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Productos comprados
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">
                      Información de envío
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Recibirás un correo con los detalles de seguimiento una vez
                      que tu pedido sea enviado. El tiempo estimado de entrega es
                      de 3-5 días hábiles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/catalogo" className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                Seguir Comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
