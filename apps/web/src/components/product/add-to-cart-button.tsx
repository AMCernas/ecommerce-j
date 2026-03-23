'use client';

import { useState } from 'react';
import { Button } from '@ecoomerce-jardineria/ui';
import { useCartStore } from '@/store/cart';
import { addToCart } from '@/lib/cart/actions';
import { Minus, Plus, Loader2 } from 'lucide-react';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: string | number;
    weightOptions?: Array<{ g: number; price: number; stock: number }>;
    images?: string[];
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
          slug: '', // We'll need to add slug to the product type
          variantG: selectedWeight || 0,
          price: result.item.price,
          quantity,
          image: product.images?.[0] || null,
        });
      }
    } catch (err) {
      setError('Error al añadir al carrito');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Weight/variant selector */}
      {hasVariants && (
        <div>
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
      <div className="flex items-center gap-4">
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
        <p className="text-red-500 text-sm">{error}</p>
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
        ) : (
          `Añadir al carrito - $${(currentPrice * quantity).toFixed(2)}`
        )}
      </Button>
    </div>
  );
}
