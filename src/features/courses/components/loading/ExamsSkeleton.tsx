import { SkeletonBlock } from './SkeletonBlock';

export function ExamsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[620px] space-y-2.5">
      {Array.from({ length: 4 }).map((_, index) => (
        <article key={index} className="flex min-h-[76px] items-center gap-3 rounded-[14px] border border-[#e8e3f2] bg-white p-3">
          <SkeletonBlock className="h-10 w-10" rounded="rounded-[10px]" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-3 w-[72%]" rounded="rounded-md" />
            <SkeletonBlock className="h-2.5 w-[52%]" rounded="rounded-full" />
            <SkeletonBlock className="h-2 w-20" rounded="rounded-full" />
          </div>
          <SkeletonBlock className="h-8 w-16" rounded="rounded-lg" />
        </article>
      ))}
    </div>
  );
}
