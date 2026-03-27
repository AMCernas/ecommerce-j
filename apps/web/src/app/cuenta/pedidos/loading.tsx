import { OrderCardSkeleton, Skeleton } from '@/components/account/Skeleton';

export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
      </div>

      {/* Filter skeleton */}
      <Skeleton className="h-10 w-64" />

      {/* Orders list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}
