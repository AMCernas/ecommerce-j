'use client';

import { useState } from 'react';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@ecoomerce-jardineria/ui';
import { useCheckoutStore } from '@/store/checkout';
import { useCartStore } from '@/store/cart';
import { createOrder } from '@/lib/orders/actions';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

const cardElementStyle = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#EF4444',
    },
  },
};

interface CardPaymentFormProps {
  onSuccess: (orderId: string) => void;
  onBack: () => void;
}

function CardPaymentFormInner({ onSuccess, onBack }: CardPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { shippingData, setOrderId } = useCheckoutStore();
  const { items, getSubtotal, getShippingCost, clearCart } = useCartStore();

  const total = getSubtotal() + getShippingCost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe no está cargado. Por favor, recarga la página.');
      return;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      setError('Error al cargar los campos de la tarjeta.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Create order first
      if (!shippingData) {
        throw new Error('Falta información de envío');
      }

      const orderResult = await createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.name,
          variantG: item.variantG,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        subtotal: getSubtotal(),
        shippingCost: getShippingCost(),
        discount: 0,
        total,
        paymentMethod: 'card',
        shippingAddress: {
          name: shippingData.name,
          street: shippingData.street,
          exteriorNumber: shippingData.exteriorNumber,
          interiorNumber: shippingData.interiorNumber,
          neighborhood: shippingData.neighborhood,
          city: shippingData.city,
          state: shippingData.state,
          postalCode: shippingData.postalCode,
          phone: shippingData.phone,
        },
      });

      if (!orderResult.success || !orderResult.orderId) {
        throw new Error('Error al crear la orden');
      }

      setOrderId(orderResult.orderId);

      // 2. Create payment intent
      const intentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderResult.orderId,
          amount: Math.round(total * 100), // Convert to cents
          customerEmail: shippingData.email,
        }),
      });

      if (!intentResponse.ok) {
        throw new Error('Error al crear el intent de pago');
      }

      const { clientSecret } = await intentResponse.json();

      // 3. Confirm card payment
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardNumber,
            billing_details: {
              email: shippingData.email,
              name: shippingData.name,
            },
          },
        });

      if (stripeError) {
        throw new Error(
          stripeError.message || 'Tu tarjeta fue declinada. Intenta con otro método de pago.'
        );
      }

      if (paymentIntent?.status === 'succeeded') {
        clearCart();
        onSuccess(orderResult.orderId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el pago');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Número de tarjeta
          </label>
          <div className="p-3 border border-gray-300 rounded-lg bg-white">
            <CardNumberElement options={cardElementStyle} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Fecha de expiración
            </label>
            <div className="p-3 border border-gray-300 rounded-lg bg-white">
              <CardExpiryElement options={cardElementStyle} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">CVC</label>
            <div className="p-3 border border-gray-300 rounded-lg bg-white">
              <CardCvcElement options={cardElementStyle} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Volver
        </Button>
        <Button type="submit" className="flex-1" disabled={!stripe || isLoading}>
          {isLoading ? 'Procesando...' : `Pagar $${total.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}

export function CardPaymentForm(props: CardPaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CardPaymentFormInner {...props} />
    </Elements>
  );
}
