'use client';

import { create } from 'zustand';

export type CheckoutStep = 'envio' | 'pago' | 'confirmation';
export type PaymentMethod = 'oxxo' | 'spei' | 'card';

export interface ShippingAddress {
  email: string;
  name: string;
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

export interface VoucherData {
  reference: string;
  expiresAt: string;
  pdfUrl: string;
}

export interface ClabeData {
  clabe: string;
  reference: string;
  expiresAt: string;
}

export interface DiscountInfo {
  code: string;
  type: 'percentage' | 'fixed_mxn';
  value: string;
  calculatedDiscount: number;
}

interface CheckoutStore {
  // State
  currentStep: CheckoutStep;
  shippingData: ShippingAddress | null;
  paymentMethod: PaymentMethod | null;
  orderId: string | null;
  clientSecret: string | null;
  voucherData: VoucherData | null;
  clabeData: ClabeData | null;
  discount: DiscountInfo | null;
  discountError: string | null;

  // Actions
  setStep: (step: CheckoutStep) => void;
  setShippingData: (data: ShippingAddress) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setOrderId: (orderId: string) => void;
  setClientSecret: (secret: string) => void;
  setVoucherData: (data: VoucherData | null) => void;
  setClabeData: (data: ClabeData | null) => void;
  applyDiscount: (discount: DiscountInfo) => void;
  clearDiscount: () => void;
  setDiscountError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 'envio' as CheckoutStep,
  shippingData: null,
  paymentMethod: null,
  orderId: null,
  clientSecret: null,
  voucherData: null,
  clabeData: null,
  discount: null,
  discountError: null,
};

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setShippingData: (data) => set({ shippingData: data }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setOrderId: (orderId) => set({ orderId }),

  setClientSecret: (secret) => set({ clientSecret: secret }),

  setVoucherData: (data) => set({ voucherData: data }),

  setClabeData: (data) => set({ clabeData: data }),

  applyDiscount: (discount) => set({ discount, discountError: null }),

  clearDiscount: () => set({ discount: null, discountError: null }),

  setDiscountError: (error) => set({ discountError: error }),

  reset: () => set(initialState),
}));
