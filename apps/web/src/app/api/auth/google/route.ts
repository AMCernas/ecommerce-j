import { signInWithGoogle } from '@/lib/auth/actions';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await signInWithGoogle();
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL));
  } catch (error) {
    // Redirect with error
    const message = error instanceof Error ? error.message : 'auth_error';
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(message)}`, process.env.NEXT_PUBLIC_SITE_URL)
    );
  }
}
