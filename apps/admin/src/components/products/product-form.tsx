'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import type { ProductFormValues, Category, Subcategory, SpaceNeeded, NeedLevel } from './types';
import { categoryOptions, subcategoryOptions, spaceNeededOptions, needLevelLabels, monthNames } from './types';
import { cn } from '@/lib/utils';

// Zod schema for product form validation
const productFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  slug: z.string().min(1, 'El slug es requerido').max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'El slug debe ser lowercase y contener solo letras, números y guiones',
  }),
  category: z.enum(['semilla', 'tierra', 'composta', 'accesorio']),
  subcategory: z.enum(['hortaliza', 'flor', 'árbol', 'hierba', 'ornamental']).optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  isOrganic: z.boolean().optional(),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo').default(0),
  // Optional numeric fields
  germinationRate: z.number().min(0).max(100).optional(),
  daysToGerminate: z.number().int().positive().optional(),
  daysToHarvest: z.number().int().positive().optional(),
  // Care fields (1-3)
  waterNeeds: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  sunNeeds: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  careLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  spaceNeeded: z.enum(['maceta_pequeña', 'maceta_grande', 'jardín', 'campo']).optional(),
  // Arrays
  sowMonths: z.array(z.number().min(1).max(12)).optional(),
  harvestMonths: z.array(z.number().min(1).max(12)).optional(),
  climateZones: z.array(z.string()).optional(),
  images: z.array(z.string()).refine(
    (imgs) => imgs.every((img) => img.startsWith('http://') || img.startsWith('https://')),
    { message: 'Todas las URLs de imágenes deben comenzar con http:// o https://' }
  ).optional(),
  // SEO
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
});

type ProductFormSchema = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormValues> & { id: string };
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData?.id;

  // tRPC mutations
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success('Producto creado', { description: 'El producto se ha creado correctamente.' });
      router.push('/admin/productos');
    },
    onError: (error) => {
      // Map API errors to form fields
      handleApiError(error.message);
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success('Producto actualizado', { description: 'Los cambios se han guardado correctamente.' });
      router.push('/admin/productos');
    },
    onError: (error) => {
      handleApiError(error.message);
    },
  });

  // Handle API validation errors
  const handleApiError = (errorMessage: string) => {
    // Check for Zod validation error format: "Validation error: {\"code\":\"invalid_type\",\"expected\":\"string\",\"received\":\"undefined\",\"path\":[\"name\"],\"message\":\"Required\"}"
    const zodMatch = errorMessage.match(/Validation error: (.+)/);
    if (zodMatch) {
      try {
        const zodErrors = JSON.parse(zodMatch[1]);
        const newErrors: Record<string, string> = {};
        
        if (Array.isArray(zodErrors)) {
          zodErrors.forEach((err: { path: string[]; message: string }) => {
            const path = err.path.join('.');
            newErrors[path] = err.message;
          });
        }
        
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          toast.error('Error de validación', { description: 'Por favor corrige los errores en el formulario.' });
          return;
        }
      } catch {
        // Not a JSON error, continue
      }
    }

    // Check for slug uniqueness error
    if (errorMessage.includes('slug') && errorMessage.includes('unique')) {
      setErrors({ slug: 'El slug ya está en uso. Por favor usa otro nombre o edita el slug.' });
      toast.error('Error de validación', { description: 'El slug del producto ya existe.' });
      return;
    }

    // Generic error
    toast.error('Error', { description: errorMessage });
  };

  // Form state
  const [formData, setFormData] = useState<Partial<ProductFormSchema>>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    category: (initialData?.category as Category) || ('semilla' as Category),
    subcategory: initialData?.subcategory as Subcategory | undefined,
    description: initialData?.description || '',
    isOrganic: initialData?.isOrganic || false,
    price: initialData?.price || 0,
    stock: initialData?.stock ?? 0,
    // Optional fields
    germinationRate: initialData?.germinationRate,
    daysToGerminate: initialData?.daysToGerminate,
    daysToHarvest: initialData?.daysToHarvest,
    waterNeeds: initialData?.waterNeeds as NeedLevel | undefined,
    sunNeeds: initialData?.sunNeeds as NeedLevel | undefined,
    careLevel: initialData?.careLevel as NeedLevel | undefined,
    spaceNeeded: initialData?.spaceNeeded as SpaceNeeded | undefined,
    sowMonths: initialData?.sowMonths || [],
    harvestMonths: initialData?.harvestMonths || [],
    climateZones: initialData?.climateZones || [],
    images: initialData?.images || [],
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  useEffect(() => {
    if (!initialData?.slug && formData.name) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.name || '') }));
    }
  }, [formData.name, initialData?.slug]);

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    // Auto-generate slug if no manual edit
    if (!initialData?.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate form data client-side first
      productFormSchema.parse(formData);
      
      // Call the appropriate mutation
      if (isEditMode && initialData?.id) {
        updateMutation.mutate({
          id: initialData.id,
          data: formData as any,
        });
      } else {
        createMutation.mutate(formData as any);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        toast.error('Error de validación', { description: 'Por favor corrige los errores en el formulario.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldError = (field: string) => {
    if (errors[field]) {
      return <p className="mt-1 text-sm text-red-600">{errors[field]}</p>;
    }
    return null;
  };

  const inputClass = (field: string) =>
    cn(
      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500',
      errors[field] ? 'border-red-300' : 'border-gray-300'
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información básica</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del producto *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={inputClass('name')}
              placeholder="Ej: Tomate Cherry"
            />
            {renderFieldError('name')}
          </div>

          {/* Slug */}
          <div className="md:col-span-2">
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              URL amigable (slug) *
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className={inputClass('slug')}
              placeholder="ej: tomate-cherry"
            />
            <p className="mt-1 text-xs text-gray-500">
              Se genera automáticamente del nombre. Puedes editarlo manualmente.
            </p>
            {renderFieldError('slug')}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Category }))}
              className={inputClass('category')}
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {renderFieldError('category')}
          </div>

          {/* Subcategory */}
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
              Subcategoría
            </label>
            <select
              id="subcategory"
              value={formData.subcategory || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                subcategory: (e.target.value as Subcategory) || undefined 
              }))}
              className={inputClass('subcategory')}
            >
              <option value="">Seleccionar...</option>
              {subcategoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={inputClass('description')}
              placeholder="Descripción detallada del producto..."
            />
            {renderFieldError('description')}
          </div>

          {/* Price and Stock */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Precio (MXN) *
            </label>
            <input
              type="number"
              id="price"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className={inputClass('price')}
              placeholder="0.00"
            />
            {renderFieldError('price')}
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              min="0"
              value={formData.stock ?? 0}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
              className={inputClass('stock')}
              placeholder="0"
            />
            {renderFieldError('stock')}
          </div>

          {/* Organic */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isOrganic}
                onChange={(e) => setFormData(prev => ({ ...prev, isOrganic: e.target.checked }))}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Producto orgánico</span>
            </label>
          </div>
        </div>
      </section>

      {/* Toggle for advanced fields */}
      <button
        type="button"
        onClick={() => setShowAllFields(!showAllFields)}
        className="text-green-600 hover:text-green-700 text-sm font-medium"
      >
        {showAllFields ? '▲ Ocultar campos avanzados' : '▼ Mostrar campos avanzados'}
      </button>

      {/* Agronomic and Care Fields */}
      {showAllFields && (
        <>
          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información agronómica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Germination Rate */}
              <div>
                <label htmlFor="germinationRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Tasa de germinación (%)
                </label>
                <input
                  type="number"
                  id="germinationRate"
                  min="0"
                  max="100"
                  value={formData.germinationRate ?? ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    germinationRate: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  className={inputClass('germinationRate')}
                />
              </div>

              {/* Days to Germinate */}
              <div>
                <label htmlFor="daysToGerminate" className="block text-sm font-medium text-gray-700 mb-1">
                  Días hasta germinar
                </label>
                <input
                  type="number"
                  id="daysToGerminate"
                  min="1"
                  value={formData.daysToGerminate ?? ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    daysToGerminate: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className={inputClass('daysToGerminate')}
                />
              </div>

              {/* Days to Harvest */}
              <div>
                <label htmlFor="daysToHarvest" className="block text-sm font-medium text-gray-700 mb-1">
                  Días hasta cosecha
                </label>
                <input
                  type="number"
                  id="daysToHarvest"
                  min="1"
                  value={formData.daysToHarvest ?? ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    daysToHarvest: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className={inputClass('daysToHarvest')}
                />
              </div>
            </div>

            {/* Sow Months */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meses de siembra
              </label>
              <div className="flex flex-wrap gap-2">
                {monthNames.map((month, index) => (
                  <label
                    key={month}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm cursor-pointer transition-colors',
                      formData.sowMonths?.includes(index + 1)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.sowMonths?.includes(index + 1) || false}
                      onChange={(e) => {
                        const current = formData.sowMonths || [];
                        const newMonths = e.target.checked
                          ? [...current, index + 1]
                          : current.filter(m => m !== index + 1);
                        setFormData(prev => ({ ...prev, sowMonths: newMonths }));
                      }}
                    />
                    {month.slice(0, 3)}
                  </label>
                ))}
              </div>
            </div>

            {/* Harvest Months */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meses de cosecha
              </label>
              <div className="flex flex-wrap gap-2">
                {monthNames.map((month, index) => (
                  <label
                    key={month}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm cursor-pointer transition-colors',
                      formData.harvestMonths?.includes(index + 1)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.harvestMonths?.includes(index + 1) || false}
                      onChange={(e) => {
                        const current = formData.harvestMonths || [];
                        const newMonths = e.target.checked
                          ? [...current, index + 1]
                          : current.filter(m => m !== index + 1);
                        setFormData(prev => ({ ...prev, harvestMonths: newMonths }));
                      }}
                    />
                    {month.slice(0, 3)}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de cuidado</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Water Needs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Necesidad de agua
                </label>
                <div className="space-y-1">
                  {([1, 2, 3] as const).map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="waterNeeds"
                        checked={formData.waterNeeds === level}
                        onChange={() => setFormData(prev => ({ ...prev, waterNeeds: level }))}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{needLevelLabels[level]} ({level})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sun Needs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Necesidad de sol
                </label>
                <div className="space-y-1">
                  {([1, 2, 3] as const).map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sunNeeds"
                        checked={formData.sunNeeds === level}
                        onChange={() => setFormData(prev => ({ ...prev, sunNeeds: level }))}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{needLevelLabels[level]} ({level})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Care Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de cuidado
                </label>
                <div className="space-y-1">
                  {([1, 2, 3] as const).map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="careLevel"
                        checked={formData.careLevel === level}
                        onChange={() => setFormData(prev => ({ ...prev, careLevel: level }))}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{needLevelLabels[level]} ({level})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Space Needed */}
              <div>
                <label htmlFor="spaceNeeded" className="block text-sm font-medium text-gray-700 mb-1">
                  Espacio necesario
                </label>
                <select
                  id="spaceNeeded"
                  value={formData.spaceNeeded || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    spaceNeeded: (e.target.value as SpaceNeeded) || undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Seleccionar...</option>
                  {spaceNeededOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Imágenes</h2>
            
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                URLs de imágenes (separadas por línea nueva)
              </label>
              <textarea
                id="images"
                rows={3}
                value={(formData.images || []).join('\n')}
                onChange={(e) => {
                  const urls = e.target.value.split('\n').filter(url => url.trim());
                  setFormData(prev => ({ ...prev, images: urls }));
                }}
                className={inputClass('images')}
                placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                Cada URL debe comenzar con http:// o https://
              </p>
              {renderFieldError('images')}
            </div>
          </section>

          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta título
                </label>
                <input
                  type="text"
                  id="seoTitle"
                  value={formData.seoTitle || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  className={inputClass('seoTitle')}
                  placeholder="Título para SEO (max 255 caracteres)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {(formData.seoTitle || '').length}/255 caracteres
                </p>
              </div>

              <div>
                <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta descripción
                </label>
                <textarea
                  id="seoDescription"
                  rows={3}
                  value={formData.seoDescription || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  className={inputClass('seoDescription')}
                  placeholder="Descripción para SEO (max 500 caracteres)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {(formData.seoDescription || '').length}/500 caracteres
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditMode ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  );
}
