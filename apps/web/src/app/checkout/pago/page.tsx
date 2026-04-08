'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckoutStore, PaymentMethod } from '@/store/checkout';
import { useCartStore } from '@/store/cart';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { CardPaymentForm } from '@/components/checkout/CardPaymentForm';
import { OXXOPayment } from '@/components/checkout/OXXOPayment';
import { SPEIPayment } from '@/components/checkout/SPEIPayment';
import { DiscountInput } from '@/components/checkout/DiscountInput';

export default function PagoPage() {
  const router = useRouter();
  const { setStep, currentStep, paymentMethod, setPaymentMethod, shippingData, discount } =
    useCheckoutStore();
  const { items, getSubtotal, getShippingCost, getTotal } = useCartStore();

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const discountAmount = discount?.calculatedDiscount ?? 0;
  const total = getTotal() - discountAmount;

  useEffect(() => {
    // Ensure we're on the pago step
    if (currentStep !== 'pago') {
      setStep('pago');
    }
  }, [currentStep, setStep]);

  // Redirect if no shipping data
  useEffect(() => {
    if (!shippingData) {
      router.push('/checkout/envio');
    }
  }, [shippingData, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/carrito');
    }
  }, [items, router]);

  if (!shippingData || items.length === 0) {
    return null;
  }

  const handlePaymentSuccess = (orderId: string) => {
    setStep('confirmation');
    router.push(`/checkout/confirmation?orderId=${orderId}`);
  };

  const handleBack = () => {
    router.push('/checkout/envio');
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Envío</span>
            <span className="font-medium">${shippingCost.toFixed(2)}</span>
          </div>
          {discount && (
            <div className="flex justify-between items-center text-green-600">
              <span>Descuento ({discount.code})</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between items-center">
            <span className="text-gray-900 font-semibold">Total a pagar</span>
            <span className="text-2xl font-bold text-green-700">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Discount Code Input */}
      <DiscountInput subtotal={subtotal} />

      {/* Payment Method Selection */}
      {!paymentMethod && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Método de Pago
          </h2>
          <PaymentMethodSelector
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />
        </div>
      )}

      {/* Payment Forms */}
      {paymentMethod && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          {paymentMethod === 'card' && (
            <CardPaymentForm
              onSuccess={handlePaymentSuccess}
              onBack={handleBack}
            />
          )}
          {paymentMethod === 'oxxo' && (
            <OXXOPayment
              onSuccess={handlePaymentSuccess}
              onBack={handleBack}
            />
          )}
          {paymentMethod === 'spei' && (
            <SPEIPayment
              onSuccess={handlePaymentSuccess}
              onBack={handleBack}
            />
          )}
        </div>
      )}

      {/* Change Payment Method */}
      {paymentMethod && (
        <button
          onClick={() => setPaymentMethod(null)}
          className="w-full text-center text-sm text-gray-500 hover:text-green-600"
        >
          Cambiar método de pago
        </button>
      )}
    </div>
  );
}
