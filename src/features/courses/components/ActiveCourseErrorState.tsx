interface ActiveCourseErrorStateProps {
  message: string | null;
  onRetry: () => void;
}

export function ActiveCourseErrorState({ message, onRetry }: ActiveCourseErrorStateProps) {
  return (
    <main className="grid min-h-[55vh] place-items-center px-4 text-center" role="alert">
      <div className="w-full max-w-md rounded-[24px] border border-[#eadffb] bg-white p-6 shadow-sm">
        <strong className="block text-sm font-black text-[#29233d]">Chưa xác định được khóa học</strong>
        <p className="mt-2 text-xs font-medium leading-5 text-[#77718a]">
          {message ?? 'Kết nối tạm thời không ổn định. Dữ liệu học của bạn vẫn được giữ nguyên.'}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-11 rounded-full bg-[#6f45d8] px-5 text-xs font-black text-white shadow-[0_5px_14px_rgba(111,69,216,.2)]"
        >
          Thử lại
        </button>
      </div>
    </main>
  );
}
