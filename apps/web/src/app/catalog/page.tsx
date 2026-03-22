import { Badge, Button } from '@ecoomerce-jardineria/ui';
import Link from 'next/link';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { sql, desc } from 'drizzle-orm';

interface PageProps {
  searchParams: Promise<{ categoria?: string }>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoria = params.categoria || 'todas';

  // Get products from Supabase directly
  const conditions = [sql`${products.isArchived} = false`];
  
  if (categoria && categoria !== 'todas') {
    conditions.push(sql`${products.category} = ${categoria}`);
  }

  const productList = await db
    .select()
    .from(products)
    .where(sql.join(conditions, sql` AND `))
    .orderBy(desc(products.createdAt))
    .limit(50);

  const categoryMap: Record<string, string> = {
    semilla: '🌱 Semillas',
    tierra: '🌍 Tierra',
    composta: '🪱 Composta',
    accesorio: '🛠️ Accesorios',
  };

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {categoria === 'todas' ? 'Catálogo completo' : categoryMap[categoria] || capitalize(categoria)}
          </h1>
          <p className="text-gray-600">
            Encuentra todo para tu jardín: semillas, composta, tierra y accesorios
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {productList.length} productos
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b">
          <Link href="/catalogo">
            <Badge variant={categoria === 'todas' ? 'default' : 'outline'} className="cursor-pointer">
              Todas
            </Badge>
          </Link>
          <Link href="/catalogo?categoria=semilla">
            <Badge variant={categoria === 'semilla' ? 'default' : 'outline'} className="cursor-pointer">
              🌱 Semillas
            </Badge>
          </Link>
          <Link href="/catalogo?categoria=composta">
            <Badge variant={categoria === 'composta' ? 'default' : 'outline'} className="cursor-pointer">
              🪱 Composta
            </Badge>
          </Link>
          <Link href="/catalogo?categoria=tierra">
            <Badge variant={categoria === 'tierra' ? 'default' : 'outline'} className="cursor-pointer">
              🌍 Tierra
            </Badge>
          </Link>
          <Link href="/catalogo?categoria=accesorio">
            <Badge variant={categoria === 'accesorio' ? 'default' : 'outline'} className="cursor-pointer">
              🛠️ Accesorios
            </Badge>
          </Link>
        </div>

        {/* Products grid */}
        {productList.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No hay productos en esta categoría</p>
            <Link href="/catalogo">
              <Button variant="outline" className="mt-4">
                Ver todos los productos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ProductCard({ product }: { product: typeof products.$inferSelect }) {
  const emojiMap: Record<string, string> = {
    semilla: '🌱',
    tierra: '🌍',
    composta: '🪱',
    accesorio: '🛠️',
  };

  const price = typeof product.price === 'string' 
    ? parseFloat(product.price) 
    : product.price;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      <Link href={`/producto/${product.slug}`}>
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
          {product.images && product.images[0] ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl">{emojiMap[product.category] || '📦'}</span>
          )}
          {product.isOrganic && (
            <Badge variant="success" className="absolute top-3 left-3">
              Orgánico
            </Badge>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <Link href={`/producto/${product.slug}`}>
          <h3 className="font-semibold mb-1 hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-green-600">
            ${price.toFixed(2)}
          </span>
          <Button size="sm">
            Añadir
          </Button>
        </div>
      </div>
    </div>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
