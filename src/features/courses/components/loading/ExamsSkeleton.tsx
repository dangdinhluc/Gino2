import { SkeletonBlock } from './SkeletonBlock';

export function ExamsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[620px] space-y-2.5 px-3 lg:px-0">
      <div className="flex items-center justify-between gap-3 px-1">
        <SkeletonBlock className="h-2.5 w-48 max-w-[68%]" rounded="rounded-full" />
        <SkeletonBlock className="h-6 w-12" rounded="rounded-full" />
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <article key={index} className="flex min-h-[80px] items-center gap-3 rounded-[18px] border border-[#e8e3f2] bg-white p-3">
          <SkeletonBlock className="h-11 w-11" rounded="rounded-[13px]" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-3 w-[72%]" rounded="rounded-md" />
            <SkeletonBlock className="h-2.5 w-[52%]" rounded="rounded-full" />
            <SkeletonBlock className="h-2 w-20" rounded="rounded-full" />
          </div>
          <SkeletonBlock className="h-9 w-16" rounded="rounded-full" />
        </article>
      ))}
    </div>
  );
}
