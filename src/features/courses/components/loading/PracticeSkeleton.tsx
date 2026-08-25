import { SkeletonBlock } from './SkeletonBlock';

export function PracticeSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[620px] space-y-3">
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex min-h-[66px] items-center gap-3 rounded-[14px] border border-[#e8e3f2] bg-white px-3.5 py-3">
            <SkeletonBlock className="h-10 w-10" rounded="rounded-[10px]" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-3 w-32 max-w-[70%]" rounded="rounded-md" />
              <SkeletonBlock className="h-2.5 w-48 max-w-[90%]" rounded="rounded-full" />
            </div>
            <SkeletonBlock className="h-2.5 w-12" rounded="rounded-full" />
          </div>
        ))}
      </div>

      <section className="rounded-[14px] border border-[#e8e3f2] bg-white p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-32" rounded="rounded-md" />
            <SkeletonBlock className="h-2.5 w-40" rounded="rounded-full" />
          </div>
          <SkeletonBlock className="h-6 w-20" rounded="rounded-full" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[5, 10, 15, 20].map((count) => <SkeletonBlock key={count} className="h-9 w-[62px]" rounded="rounded-lg" />)}
        </div>
        <SkeletonBlock className="mt-3 h-10 w-full" rounded="rounded-lg" />
      </section>
    </div>
  );
}
