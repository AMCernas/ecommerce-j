import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getUserOrders } from '@/lib/orders/actions';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Debes iniciar sesión para ver tu cuenta</p>
      </div>
    );
  }

  const orders = await getUserOrders(user.id);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-2">Bienvenido de nuevo</h2>
        <p className="text-gray-600">
          Desde aquí puedes gestionar tus pedidos, direcciones y preferencias.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/cuenta/pedidos"
          className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
        >
          <Package className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold mb-1">Mis pedidos</h3>
          <p className="text-sm text-gray-500">Ver historial y estado</p>
        </Link>
        
        <Link
          href="/cuenta/direcciones"
          className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
        >
          <Package className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold mb-1">Direcciones</h3>
          <p className="text-sm text-gray-500">Gestionar direcciones</p>
        </Link>
        
        <Link
          href="/cuenta/wishlist"
          className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
        >
          <Package className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold mb-1">Favoritos</h3>
          <p className="text-sm text-gray-500">Productos guardados</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pedidos recientes</h2>
          <Link href="/cuenta/pedidos" className="text-green-600 hover:text-green-700 flex items-center gap-1">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tienes pedidos aún</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Pedido #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${Number(order.total).toFixed(2)}</p>
                  <span className={`text-sm px-2 py-1 rounded ${
                    order.status === 'paid' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status === 'paid' ? 'Pagado' :
                     order.status === 'pending' ? 'Pendiente' :
                     order.status === 'shipped' ? 'Enviado' :
                     order.status === 'delivered' ? 'Entregado' : order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
