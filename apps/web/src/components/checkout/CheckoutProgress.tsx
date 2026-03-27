'use client';

import { Check } from 'lucide-react';
import { cn } from '@ecoomerce-jardineria/ui';
import { CheckoutStep } from '@/store/checkout';

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
}

const steps = [
  { id: 'envio', label: 'Envío' },
  { id: 'pago', label: 'Pago' },
  { id: 'confirmation', label: 'Confirmación' },
] as const;

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Progreso del checkout">
      <ol className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
                    isCompleted && 'bg-green-600 text-white',
                    isCurrent && 'bg-green-600 text-white ring-4 ring-green-100',
                    !isCompleted && !isCurrent && 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm font-medium',
                    isCurrent && 'text-green-700',
                    !isCurrent && 'text-gray-500'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-16 md:w-24 h-1 mx-2 rounded-full transition-all duration-200',
                    index < currentIndex ? 'bg-green-600' : 'bg-gray-200'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
