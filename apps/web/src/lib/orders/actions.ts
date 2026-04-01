'use server';

import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface ShippingAddress {
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

export interface OrderItemInput {
  productId: string;
  productName: string;
  variantG: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  userId?: string;
  customerEmail: string;
  customerName: string;
  items: OrderItemInput[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: 'oxxo' | 'spei' | 'card';
  shippingAddress: ShippingAddress;
  discountCode?: string;
}

export async function createOrder(input: CreateOrderInput) {
  const { userId, customerEmail, customerName, items, subtotal, shippingCost, discount, total, paymentMethod, shippingAddress } = input;
  
  try {
    // Create order - only required fields
    const orderData = {
      userId: userId || null,
      customerEmail,
      customerName,
      status: 'pending' as const,
      subtotal: String(subtotal),
      shippingCost: String(shippingCost),
      discount: String(discount),
      total: String(total),
      paymentMethod,
      shippingAddress: shippingAddress as unknown as any,
    };
    
    const [order] = await db
      .insert(orders)
      .values(orderData)
      .returning();
    
    const orderId = order.id;
    
    // Create order items
    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: orderId,
        productId: item.productId,
        productName: item.productName,
        variantG: item.variantG,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        totalPrice: String(item.unitPrice * item.quantity),
      });
    }
    
    revalidatePath('/cuenta/pedidos');
    
    return {
      success: true,
      orderId: order.id,
      status: order.status,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return { error: 'Error al crear la orden' };
  }
}

export async function getOrder(orderId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  
  if (!order) return null;
  
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
  
  return { ...order, items };
}

export async function getUserOrders(userId: string) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}
