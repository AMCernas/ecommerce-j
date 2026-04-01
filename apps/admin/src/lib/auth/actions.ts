'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Auth result types
export type AuthResult = 
  | { success: true; user: { id: string; email: string } }
  | { success: false; error: string };

export async function signInWithEmail(
  _prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email y contraseña son requeridos' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: 'Credenciales inválidas' };
  }

  // Verify user has admin role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (userData?.role !== 'admin') {
    await supabase.auth.signOut();
    return { success: false, error: 'No tienes permisos de administrador' };
  }

  revalidatePath('/', 'layout');
  redirect('/admin');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/admin/login');
}
