'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Label } from '@ecoomerce-jardineria/ui';
import { useCartStore } from '@/store/cart';
import { useCheckoutStore, ShippingAddress } from '@/store/checkout';
import { createAddress, updateAddress } from '@/lib/account/actions';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { addressSchema } from '@/lib/account/types';

const shippingSchema = addressSchema.extend({
  email: z.string().email('Ingresa un correo electrónico válido').optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  mode?: 'checkout' | 'standalone';
  userId?: string;
  addressId?: string;
  defaultValues?: Partial<ShippingFormData>;
  onBack?: () => void;
  onSuccess?: () => void;
}

export function ShippingForm({ 
  mode = 'checkout', 
  userId,
  addressId,
  defaultValues,
  onBack, 
  onSuccess 
}: ShippingFormProps) {
  const router = useRouter();
  const { items } = useCartStore();
  const { setShippingData, setStep, shippingData } = useCheckoutStore();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: defaultValues || shippingData || undefined,
  });

  const onSubmit = async (data: ShippingFormData) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    if (mode === 'standalone' && userId) {
      // Standalone mode: create or update address
      const addressData = {
        name: data.name,
        street: data.street,
        exteriorNumber: data.exteriorNumber,
        interiorNumber: data.interiorNumber,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        phone: data.phone,
        isDefault: true,
      };

      let result;
      if (addressId) {
        result = await updateAddress(addressId, userId, addressData);
      } else {
        result = await createAddress(userId, addressData);
      }

      if ('error' in result) {
        setSubmitError(result.error);
      } else {
        setSubmitSuccess(true);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/cuenta/direcciones');
          router.refresh();
        }
      }
    } else {
      // Checkout mode: proceed to payment
      setShippingData(data as ShippingAddress);
      setStep('pago');
      router.push('/checkout/pago');
    }
  };

  // Redirect if cart is empty in checkout mode
  if (mode === 'checkout' && items.length === 0) {
    router.push('/carrito');
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success Message */}
      {submitSuccess && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
          <CheckCircle className="h-5 w-5" />
          <span>Dirección guardada correctamente</span>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {mode === 'standalone' ? 'Dirección de Envío' : 'Información de Envío'}
        </h2>

        {/* Email - only in checkout mode */}
        {mode === 'checkout' && (
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        )}

        {/* Nombre Completo */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo *</Label>
          <Input
            id="name"
            placeholder="María García López"
            {...register('name')}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Calle y Número */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 space-y-2">
            <Label htmlFor="street">Calle *</Label>
            <Input
              id="street"
              placeholder="Av. Reforma"
              {...register('street')}
              aria-invalid={!!errors.street}
            />
            {errors.street && (
              <p className="text-sm text-red-500">{errors.street.message}</p>
            )}
          </div>
          <div className="col-span-1 space-y-2">
            <Label htmlFor="exteriorNumber">Número exterior *</Label>
            <Input
              id="exteriorNumber"
              placeholder="1234"
              {...register('exteriorNumber')}
              aria-invalid={!!errors.exteriorNumber}
            />
            {errors.exteriorNumber && (
              <p className="text-sm text-red-500">
                {errors.exteriorNumber.message}
              </p>
            )}
          </div>
        </div>

        {/* Número Interior */}
        <div className="space-y-2">
          <Label htmlFor="interiorNumber">Número interior (opcional)</Label>
          <Input
            id="interiorNumber"
            placeholder="Apt. 101"
            {...register('interiorNumber')}
          />
        </div>

        {/* Colonia */}
        <div className="space-y-2">
          <Label htmlFor="neighborhood">Colonia *</Label>
          <Input
            id="neighborhood"
            placeholder="Juárez"
            {...register('neighborhood')}
            aria-invalid={!!errors.neighborhood}
          />
          {errors.neighborhood && (
            <p className="text-sm text-red-500">
              {errors.neighborhood.message}
            </p>
          )}
        </div>

        {/* Ciudad y Estado */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 space-y-2">
            <Label htmlFor="city">Ciudad *</Label>
            <Input
              id="city"
              placeholder="Ciudad de México"
              {...register('city')}
              aria-invalid={!!errors.city}
            />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city.message}</p>
            )}
          </div>
          <div className="col-span-1 space-y-2">
            <Label htmlFor="state">Estado *</Label>
            <Input
              id="state"
              placeholder="CDMX"
              {...register('state')}
              aria-invalid={!!errors.state}
            />
            {errors.state && (
              <p className="text-sm text-red-500">{errors.state.message}</p>
            )}
          </div>
        </div>

        {/* Código Postal y Teléfono */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 space-y-2">
            <Label htmlFor="postalCode">Código postal *</Label>
            <Input
              id="postalCode"
              placeholder="06600"
              maxLength={5}
              {...register('postalCode')}
              aria-invalid={!!errors.postalCode}
            />
            {errors.postalCode && (
              <p className="text-sm text-red-500">
                {errors.postalCode.message}
              </p>
            )}
          </div>
          <div className="col-span-1 space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              placeholder="5512345678"
              maxLength={10}
              {...register('phone')}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Volver
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : mode === 'standalone' ? (
            'Guardar Dirección'
          ) : (
            'Continuar al Pago'
          )}
        </Button>
      </div>
    </form>
  );
}
