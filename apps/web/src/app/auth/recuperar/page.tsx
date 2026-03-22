'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@ecoomerce-jardineria/ui';
import Link from 'next/link';
import { resetPassword } from '@/lib/auth/actions';
import type { AuthResult } from '@/lib/auth/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      className="w-full" 
      size="lg"
      disabled={pending}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Enviando...
        </span>
      ) : (
        'Enviar enlace de recuperación'
      )}
    </Button>
  );
}

export default function RecoverPage() {
  const [state, formAction] = useFormState<AuthResult | null, FormData>(
    resetPassword,
    null
  );

  // Success state
  if (state?.success && state.user?.email) {
    return (
      <main className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <span className="text-6xl">📧</span>
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-4">¡Revisa tu correo!</h1>
          <p className="text-gray-600 mb-6">
            Hemos enviado un enlace para restablecer tu contraseña a <strong>{state.user.email}</strong>.
          </p>
          <p className="text-sm text-gray-500">
            ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
            <Link href="/auth/recuperar" className="text-green-600 hover:underline">
              intenta de nuevo
            </Link>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-6">
            <span className="text-5xl mb-4 block">🔑</span>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Recupera tu contraseña
            </h1>
            <p className="text-gray-600">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          {state?.success === false && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="tu@email.com"
              />
            </div>

            <SubmitButton />
          </form>

          <p className="text-center mt-6 text-gray-600">
            ¿Recordaste tu contraseña?{' '}
            <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
