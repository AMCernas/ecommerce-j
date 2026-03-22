import { Badge, Button } from '@ecoomerce-jardineria/ui';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) {
    notFound();
  }

  const price = typeof product.price === 'string' 
    ? parseFloat(product.price) 
    : product.price;

  const emojiMap: Record<string, string> = {
    semilla: '🌱',
    tierra: '🌍',
    composta: '🪱',
    accesorio: '🛠️',
  };

  const waterLabels = ['', 'Poco', 'Moderado', 'Frecuente'];
  const sunLabels = ['', 'Sombra', 'Sol parcial', 'Sol pleno'];
  const careLabels = ['', 'Mínimo', 'Semanal', 'Seguimiento'];
  const spaceLabels: Record<string, string> = {
    maceta_pequeña: 'Maceta pequeña',
    maceta_grande: 'Maceta grande',
    jardín: 'Jardín',
    campo: 'Campo',
  };

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const sowMonths = product.sowMonths?.map(m => monthNames[m - 1]).join(', ') || 'N/A';
  const harvestMonths = product.harvestMonths?.map(m => monthNames[m - 1]).join(', ') || 'N/A';

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <nav className="text-sm text-gray-500 mb-6">
          <a href="/catalogo" className="hover:text-green-600">Catálogo</a>
          <span className="mx-2">/</span>
          <a href={`/catalogo?categoria=${product.category}`} className="hover:text-green-600 capitalize">
            {product.category}
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
              {product.images && product.images[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-9xl">{emojiMap[product.category] || '📦'}</span>
              )}
            </div>
            {product.isOrganic && (
              <Badge variant="success" className="absolute top-4 left-4">
                100% Orgánico
              </Badge>
            )}
          </div>

          {/* Product info */}
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-bold text-green-600">
                ${price.toFixed(2)}
              </span>
              {product.stock && product.stock < 10 && (
                <Badge variant="warning">
                  Últimas {product.stock} unidades
                </Badge>
              )}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Agronomic data (for seeds) */}
            {product.category === 'semilla' && (
              <div className="bg-green-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  🌱 Datos agronómicos
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.germinationRate && (
                    <div>
                      <p className="text-gray-500">Tasa de germinación</p>
                      <p className="font-semibold">{product.germinationRate}%</p>
                    </div>
                  )}
                  {product.daysToGerminate && (
                    <div>
                      <p className="text-gray-500">Días a germinar</p>
                      <p className="font-semibold">{product.daysToGerminate} días</p>
                    </div>
                  )}
                  {product.daysToHarvest && (
                    <div>
                      <p className="text-gray-500">Días a cosecha</p>
                      <p className="font-semibold">{product.daysToHarvest} días</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Riego</p>
                    <p className="font-semibold">{waterLabels[product.waterNeeds || 0]}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Luz solar</p>
                    <p className="font-semibold">{sunLabels[product.sunNeeds || 0]}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cuidado</p>
                    <p className="font-semibold">{careLabels[product.careLevel || 0]}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Espacio</p>
                    <p className="font-semibold">{spaceLabels[product.spaceNeeded || ''] || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-gray-600">
                    <strong>Meses de siembra:</strong> {sowMonths}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Meses de cosecha:</strong> {harvestMonths}
                  </p>
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="flex gap-4 mb-8">
              <div className="flex items-center border rounded-lg">
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100">-</button>
                <span className="px-4 font-medium">1</span>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100">+</button>
              </div>
              <Button size="lg" className="flex-1">
                Añadir al carrito
              </Button>
            </div>

            {/* Features */}
            <div className="border-t pt-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✓</span>
                  Envío gratis +$1,000 MXN
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✓</span>
                  Alta germinación garantizada
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✓</span>
                  Soporte por WhatsApp
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✓</span>
                  Pago seguro (OXXO, SPEI, Tarjeta)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
