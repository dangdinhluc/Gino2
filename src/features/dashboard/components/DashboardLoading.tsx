export function DashboardLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[500px] space-y-4 px-3 pb-28 pt-2 sm:px-4"
      aria-busy="true"
      aria-label="Đang tải Dashboard"
    >
      <div className="h-80 animate-pulse rounded-[24px] border border-[#e5dcf2] bg-[#f4effb]" />
      <div className="grid grid-cols-3 gap-2.5">
        <div className="h-48 animate-pulse rounded-[24px] border border-[#e5dcf2] bg-[#fffcff]" />
        <div className="h-48 animate-pulse rounded-[24px] border border-[#e5dcf2] bg-[#fffcff]" />
        <div className="h-48 animate-pulse rounded-[24px] border border-[#e5dcf2] bg-[#fffcff]" />
      </div>
      <div className="h-40 animate-pulse rounded-[24px] border border-[#e5dcf2] bg-[#f4effb]" />
    </div>
  );
}
