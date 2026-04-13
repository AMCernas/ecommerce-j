'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import type { DiscountFormData, DiscountType } from './types';
import { discountTypeOptions } from './types';

// Zod schema for discount form validation
const discountFormSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(50).transform(val => val.toUpperCase()),
  type: z.enum(['percentage', 'fixed_mxn']),
  value: z.number().positive('El valor debe ser positivo'),
  minOrderAmount: z.number().nonnegative().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
});

type DiscountFormSchema = z.infer<typeof discountFormSchema>;

interface DiscountFormProps {
  initialData?: Partial<DiscountFormData> & { id?: string };
}

export function DiscountForm({ initialData }: DiscountFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData?.id;

  // Fetch existing discount for edit mode
  const { data: existingDiscount, isLoading: isLoadingDiscount } = trpc.discounts.getById.useQuery(
    { id: initialData!.id! },
    { enabled: isEditMode && !!initialData?.id }
  );

  // tRPC mutations
  const createMutation = trpc.discounts.create.useMutation({
    onSuccess: () => {
      toast.success('Código creado', { description: 'El código de descuento se ha creado correctamente.' });
      router.push('/admin/descuentos');
    },
    onError: (error) => {
      handleApiError(error.message);
    },
  });

  const updateMutation = trpc.discounts.update.useMutation({
    onSuccess: () => {
      toast.success('Código actualizado', { description: 'Los cambios se han guardado correctamente.' });
      router.push('/admin/descuentos');
    },
    onError: (error) => {
      handleApiError(error.message);
    },
  });

  // Handle API validation errors
  const handleApiError = (errorMessage: string) => {
    if (errorMessage.includes('ya existe')) {
      setErrors({ code: errorMessage });
      toast.error('Error de validación', { description: errorMessage });
      return;
    }
    toast.error('Error', { description: errorMessage });
  };

  // Form state
  const [formData, setFormData] = useState<Partial<DiscountFormSchema>>({
    code: initialData?.code || '',
    type: (initialData?.type as DiscountType) || 'percentage',
    value: initialData?.value || 0,
    minOrderAmount: initialData?.minOrderAmount,
    maxUses: initialData?.maxUses,
    expiresAt: initialData?.expiresAt,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when existing discount is loaded
  useEffect(() => {
      if (existingDiscount) {
        const expiresAtVal = existingDiscount.expiresAt as string | Date | null;
        setFormData({
          code: existingDiscount.code,
          type: existingDiscount.type,
          value: Number(existingDiscount.value),
          minOrderAmount: existingDiscount.minOrderAmount ? Number(existingDiscount.minOrderAmount) : undefined,
          maxUses: existingDiscount.maxUses || undefined,
          expiresAt: expiresAtVal 
            ? (typeof expiresAtVal === 'string' ? expiresAtVal.slice(0, 16) : new Date(expiresAtVal).toISOString().slice(0, 16))
            : undefined,
        });
      }
  }, [existingDiscount]);

  // Show usage warning for edit mode
  const showUsageWarning = isEditMode && existingDiscount && existingDiscount.usedCount > 0;

  const handleChange = (field: keyof DiscountFormSchema, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    try {
      discountFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        code: formData.code!,
        type: formData.type!,
        value: formData.value!,
        ...(formData.minOrderAmount && { minOrderAmount: formData.minOrderAmount }),
        ...(formData.maxUses && { maxUses: formData.maxUses }),
        ...(formData.expiresAt && { expiresAt: new Date(formData.expiresAt).toISOString() }),
      };

      if (isEditMode && initialData?.id) {
        updateMutation.mutate({
          id: initialData.id,
          data: submitData,
        });
      } else {
        createMutation.mutate(submitData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isEditMode && isLoadingDiscount;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-500">Cargando...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Usage Warning */}
      {showUsageWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ Este código ya ha sido usado {existingDiscount.usedCount} veces. Los cambios están limitados.
          </p>
        </div>
      )}

      {/* Code */}
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
          Código <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="code"
          value={formData.code || ''}
          onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
          placeholder="EJEMPLO20"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            errors.code ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isEditMode && existingDiscount && existingDiscount.usedCount > 0}
        />
        {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
        <p className="mt-1 text-xs text-gray-500">El código se guardará en mayúsculas</p>
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de descuento <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          {discountTypeOptions.map((option) => (
            <label key={option.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={formData.type === option.value}
                onChange={(e) => handleChange('type', e.target.value as DiscountType)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Value */}
      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
          Valor <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          {formData.type === 'percentage' ? (
            <input
              type="number"
              id="value"
              value={formData.value || ''}
              onChange={(e) => handleChange('value', parseFloat(e.target.value))}
              min="0"
              max="100"
              step="1"
              placeholder="10"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.value ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          ) : (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="value"
                value={formData.value || ''}
                onChange={(e) => handleChange('value', parseFloat(e.target.value))}
                min="0"
                step="0.01"
                placeholder="50.00"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.value ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
          )}
        </div>
        {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
        <p className="mt-1 text-xs text-gray-500">
          {formData.type === 'percentage' ? 'Porcentaje de descuento (0-100%)' : 'Monto fijo en MXN'}
        </p>
      </div>

      {/* Min Order Amount */}
      <div>
        <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700 mb-1">
          Monto mínimo de compra
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            id="minOrderAmount"
            value={formData.minOrderAmount || ''}
            onChange={(e) => handleChange('minOrderAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Dejar vacío para sin mínimo</p>
      </div>

      {/* Max Uses */}
      <div>
        <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 mb-1">
          Límite de usos
        </label>
        <input
          type="number"
          id="maxUses"
          value={formData.maxUses || ''}
          onChange={(e) => handleChange('maxUses', e.target.value ? parseInt(e.target.value) : undefined)}
          min="1"
          step="1"
          placeholder="Ilimitado"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
        <p className="mt-1 text-xs text-gray-500">Dejar vacío para ilimitado</p>
      </div>

      {/* Expires At */}
      <div>
        <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de expiración
        </label>
        <input
          type="datetime-local"
          id="expiresAt"
          value={formData.expiresAt || ''}
          onChange={(e) => handleChange('expiresAt', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
        <p className="mt-1 text-xs text-gray-500">Dejar vacío para sin fecha de expiración</p>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditMode ? 'Guardar cambios' : 'Crear código'}
        </button>
      </div>
    </form>
  );
}