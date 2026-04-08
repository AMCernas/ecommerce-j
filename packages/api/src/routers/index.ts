import { router } from '../context';
import { productsRouter } from './products';
import { ordersRouter } from './orders';
import { authRouter } from './auth';
import { discountsRouter } from './discounts';

export const appRouter = router({
  products: productsRouter,
  orders: ordersRouter,
  auth: authRouter,
  discounts: discountsRouter,
});

export type AppRouter = typeof appRouter;
