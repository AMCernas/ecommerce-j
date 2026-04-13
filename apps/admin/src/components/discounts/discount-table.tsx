'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Edit, Trash2, ToggleLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import type { Discount, DiscountType } from './types';
import { discountTypeOptions } from './types';

export function DiscountTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; discount: Discount | null }>({
    open: false,
    discount: null,
  });

  const { data, isLoading, isError, refetch } = trpc.discounts.list.useQuery({
    page,
    limit: 20,
    isActive: isActiveFilter,
  });

  const toggleMutation = trpc.discounts.toggle.useMutation({
    onSuccess: () => {
      toast.success('Estado actualizado');
      refetch();
    },
    onError: (error) => {
      toast.error('Error al actualizar', { description: error.message });
    },
  });

  const deleteMutation = trpc.discounts.delete.useMutation({
    onSuccess: () => {
      setDeleteDialog({ open: false, discount: null });
      toast.success('Código eliminado');
      refetch();
    },
    onError: (error) => {
      toast.error('Error al eliminar', { description: error.message });
    },
  });

  const formatValue = (discount: Discount) => {
    if (discount.type === 'percentage') {
      return `${discount.value}%`;
    }
    return `$${Number(discount.value).toFixed(2)}`;
  };

  const formatUsage = (discount: Discount) => {
    if (!discount.maxUses) {
      return `${discount.usedCount} / ∞`;
    }
    return `${discount.usedCount} / ${discount.maxUses}`;
  };

  const formatExpiration = (expiresAt: string | Date | null) => {
    if (!expiresAt) return 'Sin fecha';
    const date = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter by search client-side (simple implementation)
  const filteredDiscounts: Discount[] = ((data?.discounts || []) as Discount[]).filter(d => 
    d.id && (search === '' || d.code.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggle = (discount: Discount) => {
    toggleMutation.mutate({ id: discount.id });
  };

  const handleDelete = () => {
    if (deleteDialog.discount) {
      deleteMutation.mutate({ id: deleteDialog.discount.id });
    }
  };

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error al cargar los códigos de descuento. Por favor intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar códigos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <select
            value={isActiveFilter === undefined ? '' : isActiveFilter.toString()}
            onChange={(e) => {
              const val = e.target.value;
              setIsActiveFilter(val === '' ? undefined : val === 'true');
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        <button
          onClick={() => router.push('/admin/descuentos/nuevo')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo código
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Código</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Usos</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Expira</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
                    <p className="mt-2 text-gray-500">Cargando códigos...</p>
                  </td>
                </tr>
              ) : filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    {search || isActiveFilter !== undefined
                      ? 'No se encontraron códigos con esos filtros'
                      : 'No hay códigos de descuento'}
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-medium text-gray-900">{discount.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {discountTypeOptions.find(o => o.value === discount.type)?.label || discount.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatValue(discount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatUsage(discount)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(discount)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          discount.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {discount.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatExpiration(discount.expiresAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/descuentos/${discount.id}/edit`)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, discount })}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                ←
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
                    className={`w-8 h-8 text-sm rounded-lg ${
                      page === pageNum
                        ? 'bg-green-600 text-white'
                        : 'border hover:bg-gray-50'
                    }`}
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
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, discount: null })}
        title="Eliminar código de descuento"
        description={`¿Estás seguro de que deseas eliminar el código "${deleteDialog.discount?.code}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}