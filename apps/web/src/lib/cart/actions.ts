'use server';

import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface AddToCartInput {
  productId: string;
  quantity: number;
  weight?: string;
}

export async function addToCart(input: AddToCartInput) {
  const { productId, quantity, weight } = input;
  
  // Get product from DB
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  
  if (!product) {
    return { error: 'Producto no encontrado' };
  }
  
  // Calculate price based on weight variant
  let price = typeof product.price === 'string' 
    ? parseFloat(product.price) 
    : Number(product.price);
  
  if (weight && product.weightOptions) {
    const weightOptions = product.weightOptions as Array<{ g: number; price: number }>;
    const weightOption = weightOptions.find(
      (w) => w.g === parseInt(weight)
    );
    if (weightOption) {
      price = weightOption.price;
    }
  }
  
  // Return cart item data (client will handle state)
  return {
    success: true,
    item: {
      productId,
      name: product.name,
      price,
      quantity,
      image: product.images?.[0] || '',
      weight,
    },
  };
}

export async function getProductPrice(productId: string, weight?: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  
  if (!product) return null;
  
  let price = typeof product.price === 'string' 
    ? parseFloat(product.price) 
    : Number(product.price);
  
  if (weight && product.weightOptions) {
    const weightOptions = product.weightOptions as Array<{ g: number; price: number }>;
    const weightOption = weightOptions.find(
      (w) => w.g === parseInt(weight)
    );
    if (weightOption) {
      price = weightOption.price;
    }
  }
  
  return { price, stock: product.stock };
}
