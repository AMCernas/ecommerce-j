// Product form types matching the API schema

export type Category = 'semilla' | 'tierra' | 'composta' | 'accesorio';
export type Subcategory = 'hortaliza' | 'flor' | 'árbol' | 'hierba' | 'ornamental';
export type SpaceNeeded = 'maceta_pequeña' | 'maceta_grande' | 'jardín' | 'campo';
export type NeedLevel = 1 | 2 | 3;

export interface ProductFormValues {
  // Required
  name: string;
  category: Category;
  description: string;
  price: number;

  // Optional - Identification
  slug?: string;
  subcategory?: Subcategory;
  isOrganic?: boolean;

  // Optional - Agronomic
  germinationRate?: number;
  daysToGerminate?: number;
  sowMonths?: number[];
  harvestMonths?: number[];
  climateZones?: string[];
  daysToHarvest?: number;

  // Optional - Care
  waterNeeds?: NeedLevel;
  sunNeeds?: NeedLevel;
  careLevel?: NeedLevel;
  spaceNeeded?: SpaceNeeded;

  // Optional - Inventory/Media
  weightOptions?: Array<{ g: number; price: number; stock: number }>;
  images?: string[];
  stock?: number;

  // Optional - SEO
  seoTitle?: string;
  seoDescription?: string;
}

export interface ProductFormProps {
  initialData?: Partial<ProductFormValues> & { id: string };
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Product type from API (full product with system fields)
export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description: string;
  isOrganic: boolean;
  isArchived: boolean;
  price: string | number;
  stock?: number | string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  // Optional fields from ProductFormValues (allow string | number for DB compatibility)
  germinationRate?: number | string;
  daysToGerminate?: number | string;
  sowMonths?: number[];
  harvestMonths?: number[];
  climateZones?: string[];
  daysToHarvest?: number | string;
  waterNeeds?: number | string;
  sunNeeds?: number | string;
  careLevel?: number | string;
  spaceNeeded?: string;
  weightOptions?: Array<{ g: number; price: number; stock: number }>;
  seoTitle?: string;
  seoDescription?: string;
}

// Products list response
export interface ProductsListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Product filters
export interface ProductFilters {
  category?: Category;
  subcategory?: Subcategory;
  isOrganic?: boolean;
  search?: string;
  archived?: boolean;
}

// API input types (Zod schemas extracted from API)
export const categoryOptions: { value: Category; label: string }[] = [
  { value: 'semilla', label: 'Semilla' },
  { value: 'tierra', label: 'Tierra' },
  { value: 'composta', label: 'Composta' },
  { value: 'accesorio', label: 'Accesorio' },
];

export const subcategoryOptions: { value: Subcategory; label: string }[] = [
  { value: 'hortaliza', label: 'Hortaliza' },
  { value: 'flor', label: 'Flor' },
  { value: 'árbol', label: 'Árbol' },
  { value: 'hierba', label: 'Hierba' },
  { value: 'ornamental', label: 'Ornamental' },
];

export const spaceNeededOptions: { value: SpaceNeeded; label: string }[] = [
  { value: 'maceta_pequeña', label: 'Maceta Pequeña' },
  { value: 'maceta_grande', label: 'Maceta Grande' },
  { value: 'jardín', label: 'Jardín' },
  { value: 'campo', label: 'Campo' },
];

export const needLevelLabels: Record<NeedLevel, string> = {
  1: 'Bajo',
  2: 'Medio',
  3: 'Alto',
};

export const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
