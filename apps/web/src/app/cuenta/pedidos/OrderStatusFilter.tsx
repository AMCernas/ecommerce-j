'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

interface OrderStatusFilterProps {
  currentStatus: string;
}

export function OrderStatusFilter({ currentStatus }: OrderStatusFilterProps) {
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-wrap gap-2">
      {statusOptions.map((status) => {
        const isActive = currentStatus === status.value;
        
        // Build URL with current page reset
        const params = new URLSearchParams();
        if (status.value !== 'all') {
          params.set('status', status.value);
        }
        const queryString = params.toString();
        const href = `/cuenta/pedidos${queryString ? `?${queryString}` : ''}`;

        return (
          <Link
            key={status.value}
            href={href}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-green-600 text-white'
                : 'bg-white border text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status.label}
          </Link>
        );
      })}
    </div>
  );
}
