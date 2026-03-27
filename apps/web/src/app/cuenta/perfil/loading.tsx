import { ProfileFormSkeleton, Skeleton } from '@/components/account/Skeleton';

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <Skeleton className="h-7 w-48 mb-6" />
        <ProfileFormSkeleton />
      </div>
    </div>
  );
}
