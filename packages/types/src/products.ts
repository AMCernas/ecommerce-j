// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'semilla' | 'tierra' | 'composta' | 'accesorio';
  subcategory: 'hortaliza' | 'flor' | 'árbol' | 'hierba' | 'ornamental' | null;
  description: string;
  isOrganic: boolean;
  climateZones: string[];
  sowMonths: number[];
  harvestMonths: number[];
  waterNeeds: 1 | 2 | 3;
  sunNeeds: 1 | 2 | 3;
  careLevel: 1 | 2 | 3;
  spaceNeeded: 'maceta_pequeña' | 'maceta_grande' | 'jardín' | 'campo';
  germinationRate: number | null;
  daysToGerminate: number | null;
  daysToHarvest: number | null;
  weightOptions: WeightOption[];
  images: string[];
  price: number; // Base price for display
  stock: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeightOption {
  g: number;
  price: number;
  stock: number;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
}
