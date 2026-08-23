type CourseProgressCardProps = {
  title: string;
  progress: number;
  image?: string;
  status?: string;
};

export function CourseProgressCard({ title, progress, image, status = 'ĐANG HỌC' }: CourseProgressCardProps) {
  return (
    <article className="min-w-[220px] overflow-hidden rounded-[28px] border border-[#eadffb] bg-white shadow-sm">
      <div className="relative h-32 bg-[#f3edff]">
        {image && <img src={image} alt="" className="h-full w-full object-cover" />}
        <span className="absolute left-3 top-3 rounded-full bg-[#7042e6] px-3 py-1 text-[10px] font-black text-white">
          {status}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-black text-[#171822]">{title}</h3>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eee8f8]">
          <div className="h-full rounded-full bg-[#7042e6]" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm font-bold text-[#77798a]">{progress}% hoàn thành</p>
      </div>
    </article>
  );
}
