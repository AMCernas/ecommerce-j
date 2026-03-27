'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { useCheckoutStore } from '@/store/checkout';
import { useCartStore } from '@/store/cart';

export default function EnvioPage() {
  const router = useRouter();
  const { setStep, currentStep } = useCheckoutStore();
  const { items } = useCartStore();

  useEffect(() => {
    // Reset to envio step when entering
    if (currentStep !== 'envio') {
      setStep('envio');
    }
  }, [currentStep, setStep]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/carrito');
    }
  }, [items, router]);

  if (items.length === 0) {
    return null;
  }

  return <ShippingForm />;
}
