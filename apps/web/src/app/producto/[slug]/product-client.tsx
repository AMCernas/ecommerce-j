'use client';

import { useState } from 'react';
import { Badge, Button } from '@ecoomerce-jardineria/ui';
import { useCartStore } from '@/store/cart';
import { addToCart } from '@/lib/cart/actions';
import { Minus, Plus, Loader2 } from 'lucide-react';

interface ProductClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    category: string;
    description: string;
    price: string | number;
    images?: string[];
    isOrganic?: boolean;
    stock?: number;
    germinationRate?: string;
    daysToGerminate?: number;
    daysToHarvest?: number;
    waterNeeds?: number;
    sunNeeds?: number;
    careLevel?: number;
    spaceNeeded?: string;
    sowMonths?: number[];
    harvestMonths?: number[];
    weightOptions?: unknown;
  };
}

export function ProductClient({ product }: ProductClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);
  
  const price = typeof product.price === 'string' 
    ? parseFloat(product.price) 
    : product.price;
  
  const weightOptions = product.weightOptions as Array<{ g: number; price: number; stock: number }> | undefined;
  const hasVariants = weightOptions && weightOptions.length > 0;
  
  const currentPrice = selectedWeight && hasVariants
    ? weightOptions.find(w => w.g === selectedWeight)?.price || price
    : price;
  
  const handleAddToCart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await addToCart({
        productId: product.id,
        quantity,
        weight: selectedWeight?.toString(),
      });
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.success && result.item) {
        addItem({
          productId: product.id,
          name: product.name,
          slug: product.slug,
          variantG: selectedWeight || 0,
          price: result.item.price,
          quantity,
          image: product.images?.[0] || null,
        });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      }
    } catch (err) {
      setError('Error al añadir al carrito');
    } finally {
      setLoading(false);
    }
  };
  
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

            {/* Add to cart - Interactive */}
            <div className="mb-8">
              {/* Weight/variant selector */}
              {hasVariants && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Presentación</label>
                  <div className="grid grid-cols-3 gap-2">
                    {weightOptions.map((option) => (
                      <button
                        key={option.g}
                        onClick={() => setSelectedWeight(option.g)}
                        disabled={option.stock === 0}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          selectedWeight === option.g
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${option.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="block font-medium">{option.g}g</span>
                        <span className="block text-sm text-green-600">${option.price.toFixed(2)}</span>
                        {option.stock === 0 && (
                          <span className="block text-xs text-red-500">Agotado</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity selector */}
              <div className="flex items-center gap-4 mb-4">
                <label className="block text-sm font-medium">Cantidad</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Error message */}
              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}
              
              {/* Add to cart button */}
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleAddToCart}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Añadiendo...
                  </>
                ) : addedToCart ? (
                  '✓ Añadido al carrito'
                ) : (
                  `Añadir al carrito - $${(currentPrice * quantity).toFixed(2)}`
                )}
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
