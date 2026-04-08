import { db, discountCodes } from '@ecoomerce-jardineria/db';
import { eq } from 'drizzle-orm';

export type DiscountType = 'percentage' | 'fixed_mxn';

export interface DiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value: string;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date | null;
  maxUses: number | null;
  minOrderAmount: string | null;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  discount?: DiscountCode;
  calculatedDiscount?: number;
}

/**
 * Validates a discount code against a cart total.
 * Validation order:
 * 1. Code exists in database (case-insensitive)
 * 2. Code is active
 * 3. Not expired
 * 4. Not exceeded max uses
 * 5. Cart meets minimum order amount
 */
export async function validateDiscountCode(
  code: string,
  cartTotal: number
): Promise<ValidationResult> {
  // 1. Case-insensitive lookup
  const [discount] = await db
    .select()
    .from(discountCodes)
    .where(eq(discountCodes.code, code.toUpperCase()))
    .limit(1);

  if (!discount) {
    return { valid: false, error: 'Código no encontrado' };
  }

  const discountType = discount.type as DiscountType;
  const discountValue = discount.value;
  const discountUsedCount = discount.usedCount ?? 0;
  const discountMaxUses = discount.maxUses ?? null;
  const discountMinOrder = discount.minOrderAmount ? String(discount.minOrderAmount) : null;

  // 2. Active check
  if (!discount.isActive) {
    return { valid: false, error: 'El código está inactivo' };
  }

  // 3. Expiration check
  if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
    return { valid: false, error: 'El código ha expirado' };
  }

  // 4. Usage limit check
  if (discountMaxUses !== null && discountUsedCount >= discountMaxUses) {
    return { valid: false, error: 'El código ha alcanzado su límite de usos' };
  }

  // 5. Minimum order check
  if (discountMinOrder !== null && cartTotal < Number(discountMinOrder)) {
    return {
      valid: false,
      error: `Monto mínimo de compra: $${discountMinOrder}`,
    };
  }

  // Calculate the discount amount
  const calculatedDiscount = calculateDiscount(
    { type: discountType, value: discountValue },
    cartTotal
  );

  return {
    valid: true,
    discount: {
      id: discount.id,
      code: discount.code,
      type: discountType,
      value: discountValue,
      usedCount: discountUsedCount,
      isActive: discount.isActive,
      expiresAt: discount.expiresAt,
      maxUses: discountMaxUses,
      minOrderAmount: discountMinOrder,
    },
    calculatedDiscount,
  };
}

/**
 * Calculates the discount amount based on type and subtotal.
 * - percentage: (subtotal * value) / 100
 * - fixed_mxn: value (capped at subtotal)
 */
export function calculateDiscount(
  discount: { type: DiscountType; value: string },
  subtotal: number
): number {
  if (discount.type === 'percentage') {
    return (subtotal * Number(discount.value)) / 100;
  }

  // fixed_mxn - cap at subtotal
  return Math.min(Number(discount.value), subtotal);
}