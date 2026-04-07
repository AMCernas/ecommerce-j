// Order status type (used across the app)
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'failed' | 'cancelled';

// Order types
export interface Order {
  id: string;
  userId: string | null;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: 'oxxo' | 'spei' | 'card';
  paymentIntentId: string | null;
  shippingAddress: Address;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  variantG: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Address types
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
}

// Cart types
export interface CartItem {
  id: string;
  productId: string;
  product: import('./products').Product;
  variantG: number;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
}

// Admin-specific types
export interface AdminOrderListFilters {
  status?: OrderStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface OrderUpdateInput {
  status?: OrderStatus;
  trackingNumber?: string | null;
  notes?: string | null;
}

export interface PaginatedOrdersResult {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
