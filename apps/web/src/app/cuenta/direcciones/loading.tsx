import { AddressCardSkeleton, Skeleton } from '@/components/account/Skeleton';

export default function AddressesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Addresses grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <AddressCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
