'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Label } from '@ecoomerce-jardineria/ui';
import { updateUserProfile } from '@/lib/account/actions';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const profileFormSchema = z.object({
  email: z.string().email('Correo inválido'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  phone: z
    .string()
    .length(10, 'El teléfono debe tener 10 dígitos')
    .regex(/^\d{10}$/, 'Solo números')
    .optional()
    .or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  userId: string;
  initialData?: {
    email: string;
    name: string;
    phone: string;
  };
}

export function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: initialData?.email || '',
      name: initialData?.name || '',
      phone: initialData?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setSuccess(false);
    setError(null);

    const result = await updateUserProfile(userId, {
      name: data.name,
      phone: data.phone || undefined,
    });

    setIsSubmitting(false);

    if ('error' in result) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
          <CheckCircle className="h-5 w-5" />
          <span>Perfil actualizado correctamente</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Email (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          disabled
          className="bg-gray-50"
        />
        <p className="text-sm text-gray-500">El correo electrónico no se puede cambiar</p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre completo *</Label>
        <Input
          id="name"
          placeholder="Juan Pérez García"
          {...register('name')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
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
        <p className="text-sm text-gray-500">10 dígitos</p>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          'Guardar Cambios'
        )}
      </Button>
    </form>
  );
}
