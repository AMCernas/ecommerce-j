import { z } from 'zod';

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
}

// Address
export interface Address {
  id: string;
  userId: string;
  name: string;
  street: string;
  exteriorNumber: string;
  interiorNumber: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressInput {
  name: string;
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault?: boolean;
}

// Order
export interface UserOrder {
  id: string;
  userId: string | null;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'cancelled';
  subtotal: string;
  shippingCost: string;
  discount: string;
  total: string;
  paymentMethod: 'oxxo' | 'spei' | 'card' | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  variantG: number;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface OrderDetail {
  id: string;
  userId: string | null;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'cancelled';
  subtotal: string;
  shippingCost: string;
  discount: string;
  total: string;
  paymentMethod: 'oxxo' | 'spei' | 'card' | null;
  shippingAddress: {
    name: string;
    street: string;
    exteriorNumber: string;
    interiorNumber?: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

// Zod Schemas
export const profileSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  phone: z
    .string()
    .length(10, 'El teléfono debe tener 10 dígitos')
    .regex(/^\d{10}$/, 'Solo números')
    .optional(),
});

export const addressSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  street: z.string().min(1, 'La calle es requerida'),
  exteriorNumber: z.string().min(1, 'El número exterior es requerido'),
  interiorNumber: z.string().optional(),
  neighborhood: z.string().min(1, 'La colonia es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  state: z.string().min(1, 'El estado es requerido'),
  postalCode: z
    .string()
    .length(5, 'El código postal debe tener 5 dígitos')
    .regex(/^\d{5}$/, 'Solo números'),
  phone: z
    .string()
    .length(10, 'El teléfono debe tener 10 dígitos')
    .regex(/^\d{10}$/, 'Solo números'),
  isDefault: z.boolean().optional(),
});

// Order status translation
export const orderStatusLabels: Record<UserOrder['status'], string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  refunded: 'Reembolsado',
  cancelled: 'Cancelado',
};

export const paymentMethodLabels: Record<string, string> = {
  oxxo: 'OXXO',
  spei: 'SPEI',
  card: 'Tarjeta',
};
