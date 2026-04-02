import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-red-50 rounded-full p-4 mb-4">
        <AlertCircle className="w-12 h-12 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h1>
      <p className="text-gray-500 mb-6 text-center">
        El producto que intentas editar no existe o fue eliminado.
      </p>
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a productos
      </Link>
    </div>
  );
}
