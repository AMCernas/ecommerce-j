'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, ChevronLeft, ChevronRight, Edit, Archive, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import type { Product, ProductFilters, Category } from './types';
import { categoryOptions } from './types';
import { cn } from '@/lib/utils';

interface ProductTableProps {
  onArchive?: (product: Product) => void;
  onRestore?: (product: Product) => void;
}

export function ProductTable({ onArchive, onRestore }: ProductTableProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<ProductFilters>({
    category: undefined,
    search: '',
    archived: false,
  });
  const [page, setPage] = useState(1);
  const [archiveDialog, setArchiveDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });

  // Build query filters - include archived filter
  const queryFilters = {
    ...(filters.category && { category: filters.category }),
    ...(filters.search && { search: filters.search }),
  };

  const { data, isLoading, isError } = trpc.products.list.useQuery({
    filters: queryFilters,
    page,
    limit: 20,
  });

  // Filter archived products client-side (API returns non-archived by default)
  // Note: The API publicProcedure doesn't filter by archived, so we show all
  const allProducts = (data?.products || []) as unknown as Product[];
  const showArchived = filters.archived;
  
  const filteredProducts = showArchived 
    ? allProducts 
    : allProducts.filter(p => !p.isArchived);

  const archiveMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      setArchiveDialog({ open: false, product: null });
      onArchive?.(archiveDialog.product!);
      toast.success('Producto archivado', { description: 'El producto ya no aparecerá en la tienda.' });
    },
    onError: (error) => {
      toast.error('Error al archivar', { description: error.message });
    },
  });

  const handleArchive = (product: Product) => {
    archiveMutation.mutate({
      id: product.id,
      data: { isArchived: true },
    });
  };

  const handleRestore = (product: Product) => {
    archiveMutation.mutate({
      id: product.id,
      data: { isArchived: false },
    });
    onRestore?.(product);
    toast.success('Producto restaurado', { description: 'El producto vuelve a estar activo.' });
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(numPrice);
  };

  const getCategoryLabel = (category: string) => {
    return categoryOptions.find(c => c.value === category)?.label || category;
  };

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error al cargar los productos. Por favor intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={filters.search}
            onChange={(e) => {
              setFilters({ ...filters, search: e.target.value });
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filters.category || ''}
            onChange={(e) => {
              setFilters({ ...filters, category: (e.target.value as Category) || undefined });
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todas las categorías</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.archived}
            onChange={(e) => {
              setFilters({ ...filters, archived: e.target.checked });
              setPage(1);
            }}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">Mostrar archivados</span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Precio</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
                    <p className="mt-2 text-gray-500">Cargando productos...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      product.isArchived && 'bg-gray-50 text-gray-500'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {getCategoryLabel(product.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        Number(product.stock) === 0 && 'text-red-600',
                        Number(product.stock) > 0 && Number(product.stock) < 10 && 'text-yellow-600'
                      )}>
                        {product.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.isArchived ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Archivado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/productos/${product.id}/edit`)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {product.isArchived ? (
                          <button
                            onClick={() => handleRestore(product as unknown as Product)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Restaurar"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setArchiveDialog({ open: true, product: product as unknown as Product })}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Archivar"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-600">
              Mostrando {((page - 1) * 20) + 1} - {Math.min(page * 20, data.total)} de {data.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                let pageNum: number;
                if (data.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= data.totalPages - 2) {
                  pageNum = data.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      'w-8 h-8 text-sm rounded-lg',
                      page === pageNum
                        ? 'bg-green-600 text-white'
                        : 'border hover:bg-gray-50'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === data.totalPages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Archive Confirmation Dialog */}
      <ConfirmationDialog
        open={archiveDialog.open}
        onOpenChange={(open) => !open && setArchiveDialog({ open: false, product: null })}
        title="Archivar producto"
        description={`¿Estás seguro de que deseas archivar "${archiveDialog.product?.name}"? El producto dejará de aparecer en la tienda.`}
        confirmLabel="Archivar"
        variant="warning"
        isPending={archiveMutation.isPending}
        onConfirm={() => archiveDialog.product && handleArchive(archiveDialog.product)}
      />
    </div>
  );
}
