'use client';

import type { DiscountInfo } from '@/store/checkout';

interface ValidationResponse {
  valid: boolean;
  error?: string;
  discount?: {
    id: string;
    code: string;
    type: 'percentage' | 'fixed_mxn';
    value: string;
    usedCount: number;
    isActive: boolean;
    expiresAt: Date | null;
    maxUses: number | null;
    minOrderAmount: string | null;
  };
  calculatedDiscount?: number;
}

export async function validateDiscountCode(
  code: string,
  cartTotal: number
): Promise<ValidationResponse> {
  try {
    const response = await fetch('/api/trpc/discounts.validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: { code, cartTotal },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        valid: false,
        error: errorData.error?.message || 'Error al validar el código',
      };
    }

    const result = await response.json();

    if (!result.result?.data?.json) {
      return { valid: false, error: 'Respuesta inválida del servidor' };
    }

    const validation = result.result.data.json;

    if (!validation.valid) {
      return {
        valid: false,
        error: validation.error || 'Código inválido',
      };
    }

    return {
      valid: true,
      discount: validation.discount,
      calculatedDiscount: validation.calculatedDiscount,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Error al conectar con el servidor',
    };
  }
}

export function applyDiscountToTotal(
  subtotal: number,
  discount: DiscountInfo
): number {
  if (discount.type === 'percentage') {
    return (subtotal * Number(discount.value)) / 100;
  }
  return Math.min(Number(discount.value), subtotal);
}