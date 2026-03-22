'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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
    return { success: false, error: error.message };
  }

  if (data.user) {
    revalidatePath('/', 'layout');
    redirect('/');
  }

  return { 
    success: true, 
    user: { id: data.user.id, email: data.user.email! } 
  };
}

export async function signUpWithEmail(
  _prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('name') as string;
  const phone = formData.get('phone') as string | null;

  if (!email || !password || !fullName) {
    return { success: false, error: 'Todos los campos son requeridos' };
  }

  if (password.length < 10) {
    return { success: false, error: 'La contraseña debe tener al menos 10 caracteres' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone || '',
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user) {
    // Si el email está confirmado (en dev), redirigimos
    if (data.session) {
      revalidatePath('/', 'layout');
      redirect('/');
    }
    // Si no, el usuario debe confirmar el email
    return { 
      success: true, 
      user: { id: data.user.id, email: data.user.email! } 
    };
  }

  return { success: false, error: 'Error al crear la cuenta' };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function resetPassword(
  _prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, error: 'El email es requerido' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: { id: '', email } };
}

export async function updatePassword(
  _prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const newPassword = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!newPassword || !confirmPassword) {
    return { success: false, error: 'Todos los campos son requeridos' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Las contraseñas no coinciden' };
  }

  if (newPassword.length < 10) {
    return { success: false, error: 'La contraseña debe tener al menos 10 caracteres' };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');

  return { success: true, user: { id: '', email: '' } };
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}
