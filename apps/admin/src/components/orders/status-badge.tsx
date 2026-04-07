'use client';

import { OrderStatus } from '@ecoomerce-jardineria/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
  paid: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pagado' },
  shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Enviado' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Entregado' },
  refunded: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Reembolsado' },
  failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Fallido' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Cancelado' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const isCancelled = status === 'cancelled';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bg,
        config.text,
        isCancelled && 'line-through'
      )}
    >
      {config.label}
    </span>
  );
}