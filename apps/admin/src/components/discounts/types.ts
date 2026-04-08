export type DiscountType = 'percentage' | 'fixed_mxn';

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: string;
  usedCount: number;
  maxUses: number | null;
  minOrderAmount: string | null;
  expiresAt: string | Date | null;
  isActive: boolean;
  createdAt: string | Date;
}

export interface DiscountFormData {
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string;
}

export interface DiscountListResponse {
  discounts: Discount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const discountTypeOptions = [
  { value: 'percentage', label: 'Porcentaje (%)' },
  { value: 'fixed_mxn', label: 'Monto fijo (MXN)' },
] as const;