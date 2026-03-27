'use client';

import { CreditCard, Building2, Wallet } from 'lucide-react';
import { cn } from '@ecoomerce-jardineria/ui';
import { PaymentMethod } from '@/store/checkout';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const paymentMethods = [
  {
    id: 'card' as const,
    title: 'Tarjeta de Crédito/Débito',
    description: 'Visa, Mastercard, AMEX',
    icon: CreditCard,
  },
  {
    id: 'oxxo' as const,
    title: 'Pago en OXXO',
    description: 'Paga en cualquier tienda OXXO',
    icon: Building2,
  },
  {
    id: 'spei' as const,
    title: 'Transferencia SPEI',
    description: 'Transferencia desde cualquier banco',
    icon: Wallet,
  },
];

export function PaymentMethodSelector({
  selected,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => {
        const isSelected = selected === method.id;
        const Icon = method.icon;

        return (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={cn(
              'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left',
              'hover:border-green-300 hover:bg-green-50/50',
              isSelected
                ? 'border-green-500 bg-green-50 shadow-sm'
                : 'border-gray-200 bg-white'
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  isSelected ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3
                  className={cn(
                    'font-semibold',
                    isSelected ? 'text-green-700' : 'text-gray-900'
                  )}
                >
                  {method.title}
                </h3>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
              <div
                className={cn(
                  'ml-auto w-5 h-5 rounded-full border-2',
                  isSelected
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300',
                  'relative'
                )}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
