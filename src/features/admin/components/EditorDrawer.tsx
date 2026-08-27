import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface EditorDrawerProps {
  open: boolean;
  title: string;
  description?: string;
  onRequestClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function EditorDrawer({ open, title, description, onRequestClose, children, footer }: EditorDrawerProps) {
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
      onRequestClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onRequestClose]);

  if (!open) return null;

  return (
    <dialog ref={dialogRef} aria-labelledby="admin-editor-title" onClick={(event) => { if (event.target === dialogRef.current) onRequestClose(); }} className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-[#172033]/35 lg:ml-auto lg:w-[min(42rem,100vw)]">
      <section className="flex h-full flex-col bg-[#FFFCF7] text-[#172033] shadow-[-20px_0_50px_rgba(23,32,51,0.18)]">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E4D8C9] px-5 py-4">
          <div className="min-w-0"><h2 id="admin-editor-title" className="text-xl font-bold">{title}</h2>{description && <p className="mt-1 text-sm leading-6 text-[#5F6B7C]">{description}</p>}</div>
          <button type="button" onClick={onRequestClose} aria-label="Đóng trình chỉnh sửa" className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#D9CBB9] bg-white text-[#315C73] transition hover:bg-[#F8F2EA]"><X aria-hidden="true" size={18} /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <footer className="sticky bottom-0 shrink-0 border-t border-[#E4D8C9] bg-[#FFFCF7] px-5 py-4">{footer}</footer>}
      </section>
    </dialog>
  );
}
