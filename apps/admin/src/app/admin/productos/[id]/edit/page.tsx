'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { ProductForm } from '@/components/products/product-form';
import type { ProductFormValues } from '@/components/products/types';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  
  const { data: product, isLoading, isError } = trpc.products.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <p className="ml-2 text-gray-500">Cargando producto...</p>
      </div>
    );
  }

  if (isError || !product) {
    return notFound();
  }

  // Transform API product to form data
  const initialData: Partial<ProductFormValues> & { id: string } = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category as ProductFormValues['category'],
    subcategory: product.subcategory as ProductFormValues['subcategory'],
    description: product.description,
    isOrganic: product.isOrganic,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    stock: typeof product.stock === 'string' ? parseInt(product.stock) : product.stock,
    germinationRate: typeof product.germinationRate === 'string' ? parseFloat(product.germinationRate) : product.germinationRate,
    daysToGerminate: typeof product.daysToGerminate === 'string' ? parseInt(product.daysToGerminate) : product.daysToGerminate,
    daysToHarvest: typeof product.daysToHarvest === 'string' ? parseInt(product.daysToHarvest) : product.daysToHarvest,
    waterNeeds: product.waterNeeds as ProductFormValues['waterNeeds'],
    sunNeeds: product.sunNeeds as ProductFormValues['sunNeeds'],
    careLevel: product.careLevel as ProductFormValues['careLevel'],
    spaceNeeded: product.spaceNeeded as ProductFormValues['spaceNeeded'],
    sowMonths: product.sowMonths,
    harvestMonths: product.harvestMonths,
    climateZones: product.climateZones,
    images: product.images,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/productos"
          className="inline-flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a productos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
        <p className="text-gray-500 mt-1">Edita la información del producto</p>
      </div>

      <ProductForm initialData={initialData} />
    </div>
  );
}
