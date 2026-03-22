'use server';

import { revalidatePath } from 'next/cache';

export async function addToCart(formData: FormData) {
  const productId = formData.get('productId') as string;
  const variantG = parseInt(formData.get('variantG') as string) || 0;
  const quantity = parseInt(formData.get('quantity') as string) || 1;

  // TODO: Implement actual cart logic with Supabase
  console.log('Adding to cart:', { productId, variantG, quantity });

  revalidatePath('/catalogo');
  revalidatePath('/');
}
