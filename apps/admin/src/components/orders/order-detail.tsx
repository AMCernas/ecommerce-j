'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Truck, FileText, CreditCard, MapPin, User, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { StatusBadge } from './status-badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { cn } from '@/lib/utils';
import type { OrderStatus, Order, OrderItem } from '@ecoomerce-jardineria/types';

interface OrderDetailProps {
  orderId: string;
}

type TabType = 'info' | 'items' | 'status' | 'tracking' | 'notes';

const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled', 'failed'],
  paid: ['shipped', 'refunded', 'cancelled'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  refunded: [],
  failed: ['pending'],
  cancelled: ['pending'],
};

const paymentMethodLabels: Record<string, string> = {
  oxxo: 'OXXO',
  spei: 'SPEI',
  card: 'Tarjeta',
};

export function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; newStatus: OrderStatus | null }>({
    open: false,
    newStatus: null,
  });
  const [trackingInput, setTrackingInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const { data: order, isLoading, isError, refetch } = trpc.orders.getById.useQuery(
    { id: orderId },
    { enabled: !!orderId }
  );

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Estado actualizado', { description: 'El estado de la orden ha sido actualizado.' });
      setStatusDialog({ open: false, newStatus: null });
      refetch();
    },
    onError: (error) => {
      toast.error('Error al actualizar estado', { description: error.message });
    },
  });

  const updateTrackingMutation = trpc.orders.updateTracking.useMutation({
    onSuccess: () => {
      toast.success('Tracking actualizado', { description: 'El número de tracking ha sido actualizado.' });
      setIsSavingTracking(false);
      refetch();
    },
    onError: (error) => {
      toast.error('Error al actualizar tracking', { description: error.message });
      setIsSavingTracking(false);
    },
  });

  const updateNotesMutation = trpc.orders.updateNotes.useMutation({
    onSuccess: () => {
      toast.success('Notas guardadas', { description: 'Las notas internas han sido guardadas.' });
      setIsSavingNotes(false);
      refetch();
    },
    onError: (error) => {
      toast.error('Error al guardar notas', { description: error.message });
      setIsSavingNotes(false);
    },
  });

  const handleStatusChange = () => {
    if (statusDialog.newStatus) {
      updateStatusMutation.mutate({
        id: orderId,
        status: statusDialog.newStatus,
      });
    }
  };

  const handleTrackingSave = () => {
    setIsSavingTracking(true);
    updateTrackingMutation.mutate({
      id: orderId,
      trackingNumber: trackingInput || null,
    });
  };

  const handleNotesSave = () => {
    setIsSavingNotes(true);
    updateNotesMutation.mutate({
      id: orderId,
      notes: notesInput || null,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error al cargar la orden. Por favor intenta de nuevo.</p>
      </div>
    );
  }

  const currentStatus = order.status as OrderStatus;
  const availableTransitions = statusTransitions[currentStatus] || [];

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Información', icon: <User className="w-4 h-4" /> },
    { id: 'items', label: 'Productos', icon: <Package className="w-4 h-4" /> },
    { id: 'status', label: 'Estado', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'tracking', label: 'Tracking', icon: <Truck className="w-4 h-4" /> },
    { id: 'notes', label: 'Notas', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/ordenes')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orden {order.id.slice(0, 8)}</h1>
          <p className="text-gray-500">Creada el {formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={currentStatus} />
          </div>
          <span className="text-sm text-gray-500">
            Última actualización: {formatDate(order.updatedAt)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border p-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Datos del Cliente
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Dirección de Envío
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street} {order.shippingAddress.exteriorNumber}</p>
                {order.shippingAddress.interiorNumber && (
                  <p>Int. {order.shippingAddress.interiorNumber}</p>
                )}
                <p>{order.shippingAddress.neighborhood}, {order.shippingAddress.city}</p>
                <p>{order.shippingAddress.state}, CP {order.shippingAddress.postalCode}</p>
                <p>Tel: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Información de Pago
              </h3>
              <div className="flex items-center gap-4">
                <span className="font-medium">{paymentMethodLabels[order.paymentMethod]}</span>
                {order.paymentIntentId && (
                  <span className="text-sm text-gray-500">ID: {order.paymentIntentId}</span>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Envío</span>
                  <span>{formatPrice(Number(order.shippingCost))}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento</span>
                    <span>-{formatPrice(Number(order.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-4">
            {order.items && (order.items as unknown[]).length > 0 ? (
              <div className="divide-y">
                {(order.items as unknown[]).map((item: unknown) => {
                  const typedItem = item as { id: string; productName: string; variantG: string | number; quantity: string | number; totalPrice: string | number };
                  return (
                    <div key={typedItem.id} className="py-4 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{typedItem.productName}</p>
                        <p className="text-sm text-gray-500">Variante: {Number(typedItem.variantG)}g</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Cantidad: {Number(typedItem.quantity)}</p>
                        <p className="font-medium">{formatPrice(Number(typedItem.totalPrice))}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No hay productos en esta orden.</p>
            )}
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Estado actual:</span>
              <StatusBadge status={currentStatus} />
            </div>

            {availableTransitions.length > 0 ? (
              <div>
                <p className="text-sm text-gray-500 mb-3">Cambiar estado:</p>
                <div className="flex flex-wrap gap-2">
                  {availableTransitions.map((newStatus) => (
                    <button
                      key={newStatus}
                      onClick={() => setStatusDialog({ open: true, newStatus })}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      → {newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No hay transiciones de estado disponibles.</p>
            )}
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Tracking
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder={order.trackingNumber || 'Ingresa el número de tracking'}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={handleTrackingSave}
                  disabled={isSavingTracking}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isSavingTracking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar
                </button>
              </div>
              {order.trackingNumber && (
                <p className="mt-2 text-sm text-gray-500">
                  Tracking actual: <span className="font-mono">{order.trackingNumber}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Internas
              </label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder={order.notes || 'Agregar notas internas sobre esta orden...'}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>
            <button
              onClick={handleNotesSave}
              disabled={isSavingNotes}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSavingNotes ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar Notas
            </button>
          </div>
        )}
      </div>

      {/* Status Change Dialog */}
      <ConfirmationDialog
        open={statusDialog.open}
        onOpenChange={(open) => !open && setStatusDialog({ open: false, newStatus: null })}
        title="Cambiar estado de orden"
        description={`¿Estás seguro de que deseas cambiar el estado de "${currentStatus}" a "${statusDialog.newStatus}"?`}
        confirmLabel="Cambiar Estado"
        variant="warning"
        isPending={updateStatusMutation.isPending}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}