'use client';

import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { useCheckoutStore } from '@/store/checkout';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentStep } = useCheckoutStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl">🌱</span>
          <span className="font-bold text-xl text-green-700 ml-2">
            Jardín Verde
          </span>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <CheckoutProgress currentStep={currentStep} />
        </div>

        {/* Content */}
        <div className="max-w-xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
