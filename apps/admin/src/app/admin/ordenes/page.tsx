'use client';

import { OrderTable } from '@/components/orders/order-table';

export default function OrdenesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Órdenes</h1>
        <p className="text-gray-500 mt-1">Gestiona los pedidos de los clientes</p>
      </div>

      <OrderTable />
    </div>
  );
}