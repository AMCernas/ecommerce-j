'use client';

import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { Button } from '@ecoomerce-jardineria/ui';
import { useCheckoutStore } from '@/store/checkout';
import { useCartStore } from '@/store/cart';
import { createOrder } from '@/lib/orders/actions';
import { DiscountInput } from './DiscountInput';
import { cn } from '@ecoomerce-jardineria/ui';

interface SPEIPaymentProps {
  onSuccess: (orderId: string) => void;
  onBack: () => void;
}

export function SPEIPayment({ onSuccess, onBack }: SPEIPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { shippingData, orderId, setOrderId, clabeData, setClabeData, discount } =
    useCheckoutStore();
  const { getSubtotal, getShippingCost } = useCartStore();

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const discountAmount = discount?.calculatedDiscount ?? 0;
  const total = subtotal + shippingCost - discountAmount;

  const handleGetCLABE = async () => {
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
          customerName: shippingData.name,
          items: [],
          subtotal: subtotal,
          shippingCost: shippingCost,
          discount: discountAmount,
          total,
          paymentMethod: 'spei',
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

      // Get CLABE
      const response = await fetch('/api/payments/get-clabe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId || '',
          amount: Math.round(total * 100),
          customerEmail: shippingData?.email || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener la CLABE');
      }

      const data = await response.json();
      setClabeData({
        clabe: data.clabe,
        reference: data.reference,
        expiresAt: data.expiresAt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener CLABE');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCLABE = async () => {
    if (clabeData?.clabe) {
      try {
        await navigator.clipboard.writeText(clabeData.clabe);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setError('No se pudo copiar al portapapeles');
      }
    }
  };

  const handleConfirmPayment = () => {
    if (orderId) {
      onSuccess(orderId);
    }
  };

  // Show CLABE details if retrieved
  if (clabeData) {
    const expiresDate = new Date(clabeData.expiresAt);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">
              Datos para Transferencia SPEI
            </h3>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            {/* CLABE */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">CLABE Interbancaria</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-mono font-bold text-green-700 tracking-wider">
                  {clabeData.clabe}
                </p>
                <button
                  onClick={handleCopyCLABE}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    copied
                      ? 'bg-green-100 text-green-600'
                      : 'bg-white text-gray-500 hover:bg-gray-100'
                  )}
                >
                  {copied ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 mt-1">¡CLABE copiada!</p>
              )}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Banco</span>
                <span className="font-medium">STP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Beneficiario</span>
                <span className="font-medium">Jardín Verde</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Referencia</span>
                <span className="font-mono font-medium">
                  {clabeData.reference}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monto exacto</span>
                <span className="font-bold text-green-700">
                  ${total.toFixed(2)} MXN
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expira</span>
                <span className="font-medium">
                  {expiresDate.toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-yellow-800">
              Realiza la transferencia desde tu banco usando los datos anteriores.
              Usa la CLABE o la referencia para identificar tu pago.
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              className="flex-1 flex items-center gap-2"
              onClick={handleCopyCLABE}
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copiado' : 'Copiar CLABE'}
            </Button>
            <Button className="flex-1" onClick={handleConfirmPayment}>
              Ya hice mi pago
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show button to get CLABE
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transferencia SPEI
        </h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            Al obtener tu CLABE, podrás realizar una transferencia interbancaria
            desde cualquier banco mexicano. El monto exacto es requerido.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Volver
        </Button>
        <Button onClick={handleGetCLABE} className="flex-1" disabled={isLoading}>
          {isLoading ? 'Obteniendo...' : 'Obtener CLABE'}
        </Button>
      </div>
    </div>
  );
}
