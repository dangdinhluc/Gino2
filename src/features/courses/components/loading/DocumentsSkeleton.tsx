import { SkeletonBlock } from './SkeletonBlock';

export function DocumentsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-12 min-w-0 flex-1" rounded="rounded-2xl" />
        <SkeletonBlock className="h-12 w-12" rounded="rounded-2xl" />
      </div>

      <div className="flex gap-2 overflow-hidden pb-0.5">
        {[76, 58, 82, 66].map((width, index) => <SkeletonBlock key={index} className="h-8 shrink-0" style={{ width }} rounded="rounded-full" />)}
      </div>

      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <article key={index} className="flex min-h-[106px] items-start gap-3 rounded-[18px] border border-[#e8e3f2] bg-white p-3.5">
            <SkeletonBlock className="h-10 w-10" rounded="rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-3.5 w-[78%]" rounded="rounded-md" />
              <SkeletonBlock className="h-2.5 w-[92%]" rounded="rounded-full" />
              <div className="flex gap-1.5 pt-1">
                <SkeletonBlock className="h-5 w-12" rounded="rounded-full" />
                <SkeletonBlock className="h-5 w-16" rounded="rounded-full" />
              </div>
            </div>
            <SkeletonBlock className="h-8 w-8" rounded="rounded-full" />
          </article>
        ))}
      </div>
    </div>
  );
}
