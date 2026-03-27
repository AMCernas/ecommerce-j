import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getOrderDetails } from '@/lib/account/actions';
import { orderStatusLabels, paymentMethodLabels } from '@/lib/account/types';
import { Button } from '@ecoomerce-jardineria/ui';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id: orderId } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/cuenta/pedidos');
  }

  const order = await getOrderDetails(orderId, user.id);

  if (!order) {
    notFound();
  }

  const statusLabel = orderStatusLabels[order.status] || order.status;
  const paymentMethod = order.paymentMethod ? paymentMethodLabels[order.paymentMethod] : 'N/A';

  const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    refunded: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const shippingAddress = order.shippingAddress;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/cuenta/pedidos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Pedidos
          </Button>
        </Link>
      </div>

      {/* Order Header */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Pedido #{order.id.slice(0, 8)}</h2>
            <p className="text-gray-500">
              {new Date(order.createdAt).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full ${statusStyles[order.status] || 'bg-gray-100 text-gray-700'}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos
            </h3>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      {item.variantG}g × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${Number(item.totalPrice).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      ${Number(item.unitPrice).toFixed(2)} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dirección de Envío
            </h3>
            <div className="text-gray-600">
              <p className="font-medium">{shippingAddress?.name}</p>
              <p>{shippingAddress?.street} {shippingAddress?.exteriorNumber}</p>
              {shippingAddress?.interiorNumber && <p>Interior: {shippingAddress?.interiorNumber}</p>}
              <p>{shippingAddress?.neighborhood}</p>
              <p>{shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postalCode}</p>
              <p>Tel: {shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Método de Pago
            </h3>
            <p className="text-gray-600">{paymentMethod}</p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">Resumen del Pedido</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                <span>${Number(order.shippingCost).toFixed(2)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento</span>
                  <span>-${Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
