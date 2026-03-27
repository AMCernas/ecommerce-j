'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';
import { useCheckoutStore } from '@/store/checkout';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setStep } = useCheckoutStore();

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    setStep('confirmation');
  }, [setStep]);

  if (!orderId) {
    router.push('/checkout/envio');
    return null;
  }

  return <OrderConfirmation orderId={orderId} />;
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
