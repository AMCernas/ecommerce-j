import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@ecoomerce-jardineria/api';
import { createContext as createApiContext } from '@ecoomerce-jardineria/api';

// Wrapper to extract auth header from fetch Request
function createContext({ req }: { req: Request }) {
  const authHeader = req.headers.get('authorization');
  return createApiContext({
    env: {
      req: {
        headers: {
          get: (name: string) => {
            if (name === 'authorization') return authHeader;
            return null;
          },
        },
      },
    } as Parameters<typeof createApiContext>[0]['env'],
  });
}

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ req }),
    onError: ({ error, path }) => {
      console.error(`tRPC error on ${path}:`, error);
    },
  });

export { handler as GET, handler as POST };
