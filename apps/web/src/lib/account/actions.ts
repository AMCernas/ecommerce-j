'use server';

import { db } from '@/lib/db';
import { users, addresses, orders, orderItems } from '@/lib/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { profileSchema, addressSchema } from './types';
import type { 
  UserProfile, 
  Address, 
  AddressInput, 
  UserOrder, 
  OrderDetail,
  UpdateProfileInput 
} from './types';

// ==================== PROFILE ====================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
  };
}

export async function updateUserProfile(
  userId: string, 
  input: UpdateProfileInput
): Promise<{ success: boolean } | { error: string }> {
  try {
    const validated = profileSchema.parse(input);
    
    const updateData: Partial<typeof users.$inferSelect> = {};
    
    if (validated.name !== undefined) {
      updateData.name = validated.name;
    }
    if (validated.phone !== undefined) {
      updateData.phone = validated.phone;
    }

    if (Object.keys(updateData).length === 0) {
      return { error: 'No hay datos para actualizar' };
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    revalidatePath('/cuenta/perfil');
    
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Error al actualizar el perfil' };
  }
}

// ==================== ADDRESSES ====================

export async function getAddresses(userId: string): Promise<Address[]> {
  const results = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));

  return results.map(addr => ({
    id: addr.id,
    userId: addr.userId,
    name: addr.name,
    street: addr.street,
    exteriorNumber: addr.exteriorNumber,
    interiorNumber: addr.interiorNumber,
    neighborhood: addr.neighborhood,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    phone: addr.phone,
    isDefault: addr.isDefault,
    createdAt: addr.createdAt,
    updatedAt: addr.updatedAt,
  }));
}

export async function getAddress(addressId: string): Promise<Address | null> {
  const [address] = await db
    .select()
    .from(addresses)
    .where(eq(addresses.id, addressId))
    .limit(1);

  if (!address) return null;

  return {
    id: address.id,
    userId: address.userId,
    name: address.name,
    street: address.street,
    exteriorNumber: address.exteriorNumber,
    interiorNumber: address.interiorNumber,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    phone: address.phone,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

export async function createAddress(
  userId: string, 
  input: AddressInput
): Promise<{ success: boolean; addressId: string } | { error: string }> {
  try {
    const validated = addressSchema.parse(input);

    // Check if this is the first address (auto-set as default)
    const existingAddresses = await db
      .select({ id: addresses.id })
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .limit(1);

    const isFirstAddress = existingAddresses.length === 0;
    const shouldBeDefault = validated.isDefault || isFirstAddress;

    // If setting as default, unset other addresses first
    if (shouldBeDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false } as any)
        .where(eq(addresses.userId, userId));
    }

    const insertValues = {
      userId,
      name: validated.name,
      street: validated.street,
      exteriorNumber: validated.exteriorNumber,
      interiorNumber: validated.interiorNumber,
      neighborhood: validated.neighborhood,
      city: validated.city,
      state: validated.state,
      postalCode: validated.postalCode,
      phone: validated.phone,
      isDefault: shouldBeDefault,
    };

    const [newAddress] = await db
      .insert(addresses)
      .values(insertValues as any)
      .returning();

    revalidatePath('/cuenta/direcciones');

    return {
      success: true,
      addressId: newAddress.id,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Error al crear la dirección' };
  }
}

export async function updateAddress(
  addressId: string,
  userId: string,
  input: AddressInput
): Promise<{ success: boolean } | { error: string }> {
  try {
    // First verify ownership
    const [address] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, addressId))
      .limit(1);

    if (!address) {
      return { error: 'Dirección no encontrada' };
    }

    if (address.userId !== userId) {
      return { error: 'No tienes permiso para editar esta dirección' };
    }

    const validated = addressSchema.parse(input);

    // Handle default flag
    if (validated.isDefault && !address.isDefault) {
      // Unset other defaults
      await db
        .update(addresses)
        .set({ isDefault: false } as any)
        .where(eq(addresses.userId, userId));
    }

    await db
      .update(addresses)
      .set({
        name: validated.name,
        street: validated.street,
        exteriorNumber: validated.exteriorNumber,
        interiorNumber: validated.interiorNumber,
        neighborhood: validated.neighborhood,
        city: validated.city,
        state: validated.state,
        postalCode: validated.postalCode,
        phone: validated.phone,
        isDefault: validated.isDefault ?? address.isDefault,
      } as any)
      .where(eq(addresses.id, addressId));

    revalidatePath('/cuenta/direcciones');

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Error al actualizar la dirección' };
  }
}

export async function deleteAddress(
  addressId: string,
  userId: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    // First verify ownership
    const [address] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, addressId))
      .limit(1);

    if (!address) {
      return { error: 'Dirección no encontrada' };
    }

    if (address.userId !== userId) {
      return { error: 'No tienes permiso para eliminar esta dirección' };
    }

    await db
      .delete(addresses)
      .where(eq(addresses.id, addressId));

    revalidatePath('/cuenta/direcciones');

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Error al eliminar la dirección' };
  }
}

// ==================== ORDERS ====================

export interface GetUserOrdersOptions {
  status?: string;
  page?: number;
  limit?: number;
}

export async function getUserOrders(
  userId: string,
  options: GetUserOrdersOptions = {}
): Promise<{ orders: UserOrder[]; total: number }> {
  const { status, page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  // Build query conditions
  const conditions = [eq(orders.userId, userId)];
  if (status && status !== 'all') {
    conditions.push(eq(orders.status, status));
  }

  // Get total count
  const countQuery = await db
    .select({ count: orders.id })
    .from(orders)
    .where(and(...conditions));
  
  const countResult = countQuery[0];
  const totalCount = Number(countResult?.count ?? 0);

  // Get paginated orders
  const results = await db
    .select()
    .from(orders)
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  const ordersList: UserOrder[] = results.map(order => ({
    id: order.id,
    userId: order.userId,
    status: order.status as UserOrder['status'],
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    discount: order.discount,
    total: order.total,
    paymentMethod: order.paymentMethod as UserOrder['paymentMethod'],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }));

  return { orders: ordersList, total: totalCount };
}

export async function getOrderDetails(
  orderId: string,
  userId: string
): Promise<OrderDetail | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) return null;

  // Verify ownership
  if (order.userId !== userId) {
    return null;
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return {
    id: order.id,
    userId: order.userId,
    status: order.status as OrderDetail['status'],
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    discount: order.discount,
    total: order.total,
    paymentMethod: order.paymentMethod as OrderDetail['paymentMethod'],
    shippingAddress: order.shippingAddress as OrderDetail['shippingAddress'],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: items.map(item => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName: item.productName,
      variantG: item.variantG,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
  };
}
