import { UserOrder, orderStatusLabels } from '@/lib/account/types';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface OrderCardProps {
  order: UserOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  const statusLabel = orderStatusLabels[order.status] || order.status;

  const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    refunded: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <Link 
      href={`/cuenta/pedidos/${order.id}`}
      className="block bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Pedido #{order.id.slice(0, 8)}</p>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">${Number(order.total).toFixed(2)}</p>
          <span className={`text-sm px-2 py-1 rounded ${statusStyles[order.status] || 'bg-gray-100 text-gray-700'}`}>
            {statusLabel}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end text-green-600 hover:text-green-700">
        <span className="text-sm">Ver detalles</span>
        <ArrowRight className="h-4 w-4 ml-1" />
      </div>
    </Link>
  );
}
