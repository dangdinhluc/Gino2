import type { CmsField } from '@/src/features/admin/lib/adminProductionTypes';
import { splitList } from '@/src/features/admin/lib/adminProductionHelpers';

export function FieldControl({ field, value, onChange }: { field: CmsField; value: string; onChange: (value: string) => void }) {
  const id = `cms-${field.key}`;
  const common = 'mt-1 w-full rounded-xl border border-[#E4D8C9] bg-white px-3 py-2 text-sm text-[#172033] outline-none focus:border-[#315C73]';
  return (
    <label className={field.kind === 'textarea' ? 'sm:col-span-2' : ''} htmlFor={id}>
      <span className="text-xs font-bold text-[#5F6B7C]">{field.label}{field.required ? ' *' : ''}</span>
      {field.kind === 'textarea' ? <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${common} min-h-28 resize-y`} /> : field.kind === 'select' ? <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={common}><option value="">Chọn…</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.kind === 'multi' ? <select id={id} multiple value={splitList(value)} onChange={(event) => { const values: string[] = []; for (let index = 0; index < event.currentTarget.selectedOptions.length; index += 1) { const option = event.currentTarget.selectedOptions.item(index); if (option) values.push(option.value); } onChange(values.join(',')); }} className={`${common} min-h-28`}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input id={id} type={field.kind === 'number' ? 'number' : field.kind === 'time' ? 'time' : 'text'} value={value} onChange={(event) => onChange(event.target.value)} className={common} />}
      {field.hint && <span className="mt-1 block text-[11px] text-[#7B8796]">{field.hint}</span>}
    </label>
  );
}

export function Metric({ label, value }: { label: string; value: string | number }) {
  return <article className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7B8796]">{label}</p><p className="mt-2 text-2xl font-black text-[#172033]">{value}</p></article>;
}
