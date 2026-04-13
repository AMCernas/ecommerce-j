'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DiscountForm } from '@/components/discounts/discount-form';

export default function NuevoDescuentoPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/descuentos"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a descuentos
        </Link>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Crear código de descuento</h1>
        <p className="text-gray-500 mb-6">Crea un nuevo código de descuento para tus clientes</p>

        <DiscountForm />
      </div>
    </div>
  );
}