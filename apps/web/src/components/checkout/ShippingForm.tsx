'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Label } from '@ecoomerce-jardineria/ui';
import { useCartStore } from '@/store/cart';
import { useCheckoutStore, ShippingAddress } from '@/store/checkout';
import { DiscountInput } from './DiscountInput';

const shippingSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  street: z.string().min(1, 'La calle es requerida'),
  exteriorNumber: z.string().min(1, 'El número exterior es requerido'),
  interiorNumber: z.string().optional(),
  neighborhood: z.string().min(1, 'La colonia es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  state: z.string().min(1, 'El estado es requerido'),
  postalCode: z
    .string()
    .length(5, 'El código postal debe tener 5 dígitos')
    .regex(/^\d{5}$/, 'Solo números'),
  phone: z
    .string()
    .length(10, 'El teléfono debe tener 10 dígitos')
    .regex(/^\d{10}$/, 'Solo números'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  onBack?: () => void;
}

export function ShippingForm({ onBack }: ShippingFormProps) {
  const router = useRouter();
  const { items, getSubtotal, getShippingCost } = useCartStore();
  const { setShippingData, setStep, shippingData } = useCheckoutStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: shippingData || undefined,
  });

  const onSubmit = async (data: ShippingFormData) => {
    setShippingData(data as ShippingAddress);
    setStep('pago');
    router.push('/checkout/pago');
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    router.push('/carrito');
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Información de Envío
        </h2>

        {/* Email */}
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
          Continuar al Pago
        </Button>
      </div>
    </form>
  );
}
