import { SkeletonBlock } from './SkeletonBlock';

export function VocabularySkeleton() {
  return (
    <div className="space-y-3">
      <div className="rounded-[18px] border border-[#e8e3f2] bg-white p-2.5">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-10 w-32" rounded="rounded-xl" />
          <SkeletonBlock className="h-10 flex-1" rounded="rounded-xl" />
          <SkeletonBlock className="h-10 w-10" rounded="rounded-xl" />
        </div>
        <div className="mt-2 flex gap-2 overflow-hidden">
          {[72, 88, 64, 78].map((width, index) => <SkeletonBlock key={index} className="h-8 shrink-0" style={{ width }} rounded="rounded-full" />)}
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-[#e8e3f2] bg-white p-2">
        <div className="divide-y divide-[#f0edf6]">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex min-h-[68px] items-center gap-3 px-3.5 py-2.5">
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-2.5 w-16" rounded="rounded-full" />
                <SkeletonBlock className="h-4 w-36 max-w-[78%]" rounded="rounded-md" />
                <SkeletonBlock className="h-2.5 w-44 max-w-[92%]" rounded="rounded-full" />
              </div>
              <SkeletonBlock className="h-11 w-11" rounded="rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
