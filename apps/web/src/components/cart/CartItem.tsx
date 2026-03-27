'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { CartItem as CartItemType } from '@/store/cart';
import { cn } from '@ecoomerce-jardineria/ui';

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDecrement = () => {
    if (item.quantity <= 1) {
      onRemove();
    } else {
      onUpdateQuantity(item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.quantity + 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      if (value === 0) {
        onRemove();
      } else {
        onUpdateQuantity(value);
      }
    }
  };

  const lineTotal = item.price * item.quantity;

  return (
    <div
      className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            🌱
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
              {item.variantG}kg
            </span>
          </div>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className={cn(
              'p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
            aria-label="Eliminar del carrito"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {/* Price */}
          <p className="text-sm text-gray-500">
            ${item.price.toFixed(2)} c/u
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-3 w-3" />
            </button>

            <input
              type="number"
              value={item.quantity}
              onChange={handleQuantityChange}
              className="w-12 h-8 text-center border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
            />

            <button
              onClick={handleIncrement}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Line Total */}
        <p className="mt-2 text-right font-semibold text-green-700">
          ${lineTotal.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
