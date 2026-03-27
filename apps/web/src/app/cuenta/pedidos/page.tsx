import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserOrders } from '@/lib/account/actions';
import { OrderCard } from '@/components/account/OrderCard';
import { Button } from '@ecoomerce-jardineria/ui';
import { OrderStatusFilter } from './OrderStatusFilter';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page } = await searchParams;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/cuenta/pedidos');
  }

  const currentPage = Number(page) || 1;
  const currentStatus = status || 'all';
  
  const { orders, total } = await getUserOrders(user.id, {
    status: currentStatus === 'all' ? undefined : currentStatus,
    page: currentPage,
    limit: 10,
  });

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mis Pedidos</h2>
      </div>

      {/* Filters */}
      <OrderStatusFilter currentStatus={currentStatus} />

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-500 mb-4">No tienes pedidos aún</p>
          <Link href="/productos">
            <Button variant="outline">Ver productos</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/cuenta/pedidos?page=${currentPage - 1}${currentStatus !== 'all' ? `&status=${currentStatus}` : ''}`}
                >
                  <Button variant="outline" size="sm">
                    Anterior
                  </Button>
                </Link>
              )}
              
              <span className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </span>
              
              {currentPage < totalPages && (
                <Link
                  href={`/cuenta/pedidos?page=${currentPage + 1}${currentStatus !== 'all' ? `&status=${currentStatus}` : ''}`}
                >
                  <Button variant="outline" size="sm">
                    Siguiente
                  </Button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
