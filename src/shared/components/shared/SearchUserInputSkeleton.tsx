import { Skeleton } from '@/shared/components/ui/skeleton';

export function SearchUserInputSkeleton() {
  return (
    <div className="flex items-center gap-2 p-2 ">
      <Skeleton className="h-10 w-[60px] xs:w-[190px] sm:w-[300px] lg:w-[400px] xl:w-[500px] rounded-xl" />
    </div>
  );
}
