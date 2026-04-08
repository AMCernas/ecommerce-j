'use client';

import { useState } from 'react';
import { Button, Input, Label } from '@ecoomerce-jardineria/ui';
import { validateDiscountCode } from '@/lib/discounts/actions';
import { useCheckoutStore, type DiscountInfo } from '@/store/checkout';

interface DiscountInputProps {
  subtotal: number;
  onDiscountApplied?: (discount: DiscountInfo, discountAmount: number) => void;
}

export function DiscountInput({ subtotal, onDiscountApplied }: DiscountInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { discount, applyDiscount, discountError, clearDiscount, setDiscountError } =
    useCheckoutStore();

  const handleApply = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setLocalError('Ingresa un código de descuento');
      return;
    }

    setIsValidating(true);
    setLocalError(null);
    setDiscountError(null);

    try {
      const result = await validateDiscountCode(trimmedCode, subtotal);

      if (!result.valid) {
        setLocalError(result.error || 'Código inválido');
        return;
      }

      if (result.discount && result.calculatedDiscount !== undefined) {
        const discountInfo: DiscountInfo = {
          code: result.discount.code,
          type: result.discount.type,
          value: result.discount.value,
          calculatedDiscount: result.calculatedDiscount,
        };

        applyDiscount(discountInfo);
        setSuccess(true);
        onDiscountApplied?.(discountInfo, result.calculatedDiscount);
      }
    } catch (err) {
      setLocalError('Error al validar el código');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    clearDiscount();
    setCode('');
    setSuccess(false);
  };

  if (discount) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              Código aplicado: {discount.code}
            </p>
            <p className="text-lg font-bold text-green-700">
              -${discount.calculatedDiscount.toFixed(2)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700"
          >
            Remover
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="discountCode">Código de descuento</Label>
      <div className="flex gap-2">
        <Input
          id="discountCode"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setLocalError(null);
            setSuccess(false);
          }}
          placeholder="Ingresa tu código"
          disabled={isValidating}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleApply}
          disabled={isValidating || !code.trim()}
          className="whitespace-nowrap"
        >
          {isValidating ? '...' : 'Aplicar'}
        </Button>
      </div>
      {(localError || discountError) && (
        <p className="text-sm text-red-500">{localError || discountError}</p>
      )}
      {success && (
        <p className="text-sm text-green-600">¡Código aplicado correctamente!</p>
      )}
    </div>
  );
}