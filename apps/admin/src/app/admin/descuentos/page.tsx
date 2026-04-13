'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DiscountTable } from '@/components/discounts/discount-table';

export default function DescuentosPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Descuentos</h1>
          <p className="text-gray-500 mt-1">Gestiona los códigos de descuento</p>
        </div>
        <Link
          href="/admin/descuentos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Código
        </Link>
      </div>

      <DiscountTable />
    </div>
  );
}