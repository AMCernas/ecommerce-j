import { Button } from '@ecoomerce-jardineria/ui';

export default function UpdatePasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-2">🌱 Jardín Verde</h1>
          <p className="text-gray-600">Actualiza tu contraseña</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <form action="/api/auth/update-password" method="POST" className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Mínimo 10 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                minLength={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Repite la contraseña"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Actualizar contraseña
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
