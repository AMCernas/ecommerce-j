// Order types
export interface Order {
  id: string;
  userId: string | null;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded';
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
