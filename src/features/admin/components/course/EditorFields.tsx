import type { ReactNode } from 'react';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function EditorField({ id, label, hint, required = false, children }: FieldProps) {
  return <label htmlFor={id} className="block"><span className="text-sm font-semibold text-[#334155]">{label}{required && <span aria-hidden="true"> *</span>}</span>{children}{hint && <span className="mt-1 block text-xs leading-5 text-[#7B8796]">{hint}</span>}</label>;
}

export const editorControlClass = 'mt-1.5 min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white px-3 py-2 text-sm text-[#172033] outline-none transition focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15';

export function EditorSelect({ id, value, onChange, children }: { id: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={editorControlClass}>{children}</select>;
}
