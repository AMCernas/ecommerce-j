'use client';

import { cn } from '@ecoomerce-jardineria/ui';

interface FreeShippingProgressProps {
  subtotal: number;
  threshold?: number;
}

export function FreeShippingProgress({
  subtotal,
  threshold = 1000,
}: FreeShippingProgressProps) {
  const isFreeShipping = subtotal >= threshold;
  const percentage = Math.min((subtotal / threshold) * 100, 100);
  const remaining = threshold - subtotal;

  if (isFreeShipping) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Envío</span>
          <span className="font-medium text-green-600">¡Gratis!</span>
        </div>
        <div className="h-2 bg-green-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Envío</span>
        <span className="text-gray-500">${(150).toFixed(2)}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full bg-green-500 rounded-full transition-all duration-300 ease-out'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-green-600 text-center">
        ¡Faltan ${remaining.toFixed(2)} para envío gratis!
      </p>
    </div>
  );
}
