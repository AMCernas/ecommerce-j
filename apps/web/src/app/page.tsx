import Link from 'next/link';
import { Button } from '@ecoomerce-jardineria/ui';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-8xl">🌻</div>
          <div className="absolute top-40 right-20 text-6xl">🌿</div>
          <div className="absolute bottom-20 left-1/4 text-7xl">🪴</div>
          <div className="absolute bottom-32 right-1/4 text-5xl">🌾</div>
        </div>
        <div className="container px-4 mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
            🌱 Envíos gratis en pedidos +$1,000 MXN
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-green-900 mb-6 leading-tight">
            Cultiva tu propio<br />
            <span className="text-green-600">jardín orgánico</span>
          </h1>
          <p className="text-xl text-green-700 max-w-2xl mx-auto mb-8">
            Semillas de alta germinación, composta premium y todo lo que necesitas 
            para empezar tu huerto urbano. Ideales para el clima de Colima.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalogo">
              <Button size="lg" className="w-full sm:w-auto">
                Ver catálogo
              </Button>
            </Link>
            <Link href="/catalogo?categoria=semillas">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explorar semillas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 container px-4 mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Nuestras categorías
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Todo lo que necesitas para tu huerto o jardín, seleccionado especialmente 
          para las condiciones climáticas de Colima y México.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalogo?categoria=${cat.slug}`}
              className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 text-center border border-gray-100"
            >
              <span className="text-5xl mb-4 block">{cat.emoji}</span>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-gray-500 text-sm">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-green-50">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para empezar tu huerto?
          </h2>
          <p className="text-green-100 max-w-2xl mx-auto mb-8 text-lg">
            Explora nuestro catálogo y descubre semillas con alta tasa de germinación, 
            composta orgánica y todo lo necesario para cultivar.
          </p>
          <Link href="/catalogo">
            <Button 
              size="lg" 
              className="bg-white text-green-700 hover:bg-green-50"
            >
              Comenzar ahora
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

const categories = [
  {
    name: 'Semillas',
    slug: 'semillas',
    emoji: '🌱',
    description: 'Alta germinación, certificadas para México',
  },
  {
    name: 'Composta',
    slug: 'composta',
    emoji: '🪱',
    description: 'Orgánica y premium, ideal para tu huerto',
  },
  {
    name: 'Tierra',
    slug: 'tierra',
    emoji: '🌍',
    description: 'Preparada especialmente para cada tipo de cultivo',
  },
  {
    name: 'Accesorios',
    slug: 'accesorios',
    emoji: '🛠️',
    description: 'Herramientas y todo para tu jardín',
  },
];

const features = [
  {
    icon: '✨',
    title: 'Alta germinación',
    description: 'Semillas certificadas con tasa de germinación garantizada superior al 85%.',
  },
  {
    icon: '🚚',
    title: 'Envío rápido',
    description: 'Enviamos a Colima y todo México. Envío gratis en pedidos +$1,000.',
  },
  {
    icon: '💚',
    title: '100% Orgánico',
    description: 'Productos seleccionados para cultivo orgánico y respetuoso con el medio ambiente.',
  },
  {
    icon: '📍',
    title: 'Para clima de Colima',
    description: 'Calendario de siembra y recomendaciones adaptées a tu zona climática.',
  },
  {
    icon: '💬',
    title: 'Soporte WhatsApp',
    description: '¿Dudas? Escríbenos por WhatsApp y te ayudamos a elegir.',
  },
  {
    icon: '🔒',
    title: 'Pago seguro',
    description: 'Tarjeta, OXXO, SPEI. Tu pago está protegido.',
  },
];
