import { Button } from '@ecoomerce-jardineria/ui';
import Link from 'next/link';

export default function RecoverPage() {
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

          <form className="space-y-6">
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

            <Button type="submit" className="w-full" size="lg">
              Enviar enlace de recuperación
            </Button>
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
