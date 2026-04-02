import { ProductForm } from '@/components/products/product-form';

export default function NuevoProductoPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Producto</h1>
        <p className="text-gray-500 mt-1">Crea un nuevo producto en el catálogo</p>
      </div>

      <ProductForm />
    </div>
  );
}
