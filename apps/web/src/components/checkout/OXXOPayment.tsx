'use client';

import { useState } from 'react';
import { Copy, Download, CheckCircle } from 'lucide-react';
import { Button, Input, Label } from '@ecoomerce-jardineria/ui';
import { useCheckoutStore } from '@/store/checkout';
import { useCartStore } from '@/store/cart';
import { createOrder } from '@/lib/orders/actions';
import { DiscountInput } from './DiscountInput';

interface OXXOPaymentProps {
  onSuccess: (orderId: string) => void;
  onBack: () => void;
}

export function OXXOPayment({ onSuccess, onBack }: OXXOPaymentProps) {
  const [customerName, setCustomerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { shippingData, orderId, setOrderId, voucherData, setVoucherData, discount } =
    useCheckoutStore();
  const { getSubtotal, getShippingCost } = useCartStore();

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const discountAmount = discount?.calculatedDiscount ?? 0;
  const total = subtotal + shippingCost - discountAmount;

  const handleGenerateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setError('Ingresa el nombre del titular');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create order if not exists
      if (!orderId) {
        if (!shippingData) {
          throw new Error('Falta información de envío');
        }

        const orderResult = await createOrder({
          customerEmail: shippingData.email,
          customerName: customerName,
          items: [], // Will be filled from cart
          subtotal: subtotal,
          shippingCost: shippingCost,
          discount: discountAmount,
          total,
          paymentMethod: 'oxxo',
          discountCode: discount?.code,
          shippingAddress: {
            name: shippingData.name,
            street: shippingData.street,
            exteriorNumber: shippingData.exteriorNumber,
            interiorNumber: shippingData.interiorNumber,
            neighborhood: shippingData.neighborhood,
            city: shippingData.city,
            state: shippingData.state,
            postalCode: shippingData.postalCode,
            phone: shippingData.phone,
          },
        });

        if (!orderResult.success || !orderResult.orderId) {
          throw new Error('Error al crear la orden');
        }

        setOrderId(orderResult.orderId);
      }

      // Generate OXXO voucher
      const response = await fetch('/api/payments/create-oxxo-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId || '',
          amount: Math.round(total * 100),
          customerEmail: shippingData?.email || '',
          customerName,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar el voucher');
      }

      const data = await response.json();
      setVoucherData({
        reference: data.reference,
        expiresAt: data.expiresAt,
        pdfUrl: data.voucherUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar voucher');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (voucherData?.pdfUrl) {
      window.open(voucherData.pdfUrl, '_blank');
    }
  };

  const handleConfirmPayment = () => {
    if (orderId) {
      onSuccess(orderId);
    }
  };

  // Show voucher details if generated
  if (voucherData) {
    const expiresDate = new Date(voucherData.expiresAt);
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">
              Voucher Generado
            </h3>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Número de Referencia</p>
              <p className="text-3xl font-mono font-bold text-green-700 tracking-wider">
                {voucherData.reference}
              </p>
            </div>

            <div className="flex justify-between text-sm border-t pt-4">
              <span className="text-gray-600">Monto a pagar</span>
              <span className="font-semibold">${total.toFixed(2)} MXN</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expira</span>
              <span className="font-medium">
                {expiresDate.toLocaleDateString('es-MX', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              className="flex-1 flex items-center gap-2"
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </Button>
            <Button className="flex-1" onClick={handleConfirmPayment}>
              Ya hice mi pago
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show form to generate voucher
  return (
    <form onSubmit={handleGenerateVoucher} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Datos para el Voucher
        </h3>

        <div className="space-y-2">
          <Label htmlFor="customerName">Nombre del titular *</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Como aparece en tu ID"
            disabled={isLoading}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Después de generar tu voucher, tendrás un número de referencia que
            podrás usar para pagar en cualquier tienda OXXO. El voucher expira
            en 3 días.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Volver
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Generando...' : 'Generar Voucher'}
        </Button>
      </div>
    </form>
  );
}
