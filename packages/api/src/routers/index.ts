import { router } from '../context';
import { productsRouter } from './products';
import { ordersRouter } from './orders';
import { authRouter } from './auth';

export const appRouter = router({
  products: productsRouter,
  orders: ordersRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
