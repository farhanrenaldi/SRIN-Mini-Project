const inputClass =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm ring-1 ring-inset ring-slate-300 transition placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500';

function Label({ htmlFor, label, required }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}

export function TextField({ id, label, required, error, ...props }) {
  return (
    <div>
      <Label htmlFor={id} label={label} required={required} />
      <input id={id} className={inputClass} {...props} />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function NumberField({ id, label, required, error, ...props }) {
  return (
    <div>
      <Label htmlFor={id} label={label} required={required} />
      <input id={id} type="number" className={inputClass} {...props} />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function DateField({ id, label, required, error, ...props }) {
  return (
    <div>
      <Label htmlFor={id} label={label} required={required} />
      <input id={id} type="date" className={inputClass} {...props} />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function TextArea({ id, label, required, error, rows = 3, ...props }) {
  return (
    <div>
      <Label htmlFor={id} label={label} required={required} />
      <textarea id={id} rows={rows} className={inputClass} {...props} />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function SelectField({ id, label, required, error, children, ...props }) {
  return (
    <div>
      <Label htmlFor={id} label={label} required={required} />
      <select id={id} className={inputClass} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
