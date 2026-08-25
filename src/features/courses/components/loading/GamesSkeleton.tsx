import { SkeletonBlock } from './SkeletonBlock';

export function GamesSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-[620px] grid-cols-1 gap-3 min-[420px]:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <article key={index} className="rounded-[16px] border border-[#e8e3f2] bg-white p-2.5">
          <SkeletonBlock className="h-28 w-full" rounded="rounded-[12px]" />
          <div className="space-y-2 px-1 pb-1 pt-3">
            <SkeletonBlock className="h-3 w-[78%]" rounded="rounded-md" />
            <SkeletonBlock className="h-2.5 w-[62%]" rounded="rounded-full" />
          </div>
        </article>
      ))}
    </div>
  );
}
