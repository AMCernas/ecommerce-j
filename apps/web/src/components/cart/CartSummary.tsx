'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@ecoomerce-jardineria/ui';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  isEmpty?: boolean;
  onCheckout?: () => void;
}

export function CartSummary({
  subtotal,
  shipping,
  total,
  isEmpty = false,
}: CartSummaryProps) {
  return (
    <div className="space-y-4 py-4 border-t border-gray-200">
      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Envío</span>
        {shipping === 0 ? (
          <span className="font-medium text-green-600">¡Gratis!</span>
        ) : (
          <span className="font-medium">${shipping.toFixed(2)}</span>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between pt-3 border-t border-gray-200">
        <span className="font-semibold text-gray-900">Total</span>
        <span className="font-bold text-lg text-green-700">${total.toFixed(2)}</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Link href="/checkout/envio" className="block">
          <Button
            className="w-full"
            size="lg"
            disabled={isEmpty}
          >
            Proceder al Pago
          </Button>
        </Link>
        <Link href="/carrito" className="flex items-center justify-center gap-2 w-full py-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
          <ShoppingBag className="h-4 w-4" />
          Ver Carrito
        </Link>
      </div>
    </div>
  );
}
