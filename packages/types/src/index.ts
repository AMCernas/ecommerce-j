// Shared types for the e-commerce platform
export * from './src/products';
export * from './src/orders';
export * from './src/users';
export * from './src/checkout';

// Type aliases from AGENT.md conventions
export type TProduct = typeof import('./src/products').Product;
export type TOrder = typeof import('./src/orders').Order;
export type TUser = typeof import('./src/users').User;

// Climate zones (GIN index)
export type ClimateZone =
  | 'costera_humeda'   // Colima, Jalisco costa, Veracruz
  | 'seca_calida'      // Sonora, Baja California
  | 'templada'         // CDMX, Puebla, Querétaro
  | 'fria_montana';    // Estado de México, partes de Jalisco

// Resource filters
export type WaterNeeds = 1 | 2 | 3;
export type SunNeeds = 1 | 2 | 3;
export type CareLevel = 1 | 2 | 3;
export type SpaceNeeded = 'maceta_pequeña' | 'maceta_grande' | 'jardín' | 'campo';

// Product categories
export type ProductCategory = 'semilla' | 'tierra' | 'composta' | 'accesorio';
export type ProductSubcategory =
  | 'hortaliza'
  | 'flor'
  | 'árbol'
  | 'hierba'
  | 'ornamental';

// Order status
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded';

// User roles
export type UserRole = 'cliente' | 'admin' | 'mayoreo';
