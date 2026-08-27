import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel, pending = false, onCancel, onConfirm }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      if (!pending) onCancel();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onCancel, pending]);

  if (!open) return null;

  return (
    <dialog ref={dialogRef} aria-labelledby="admin-confirm-title" className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-0 text-[#172033] shadow-xl backdrop:bg-[#172033]/35">
      <div className="p-5"><span className="grid size-11 place-items-center rounded-2xl bg-red-50 text-red-700"><AlertTriangle aria-hidden="true" size={21} /></span><h2 id="admin-confirm-title" className="mt-4 text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-[#5F6B7C]">{description}</p></div>
      <footer className="flex flex-col-reverse gap-2 border-t border-[#E4D8C9] px-5 py-4 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} disabled={pending} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73] disabled:opacity-50">Hủy</button><button type="button" onClick={onConfirm} disabled={pending} className="min-h-11 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Đang xử lý…' : confirmLabel}</button></footer>
    </dialog>
  );
}
