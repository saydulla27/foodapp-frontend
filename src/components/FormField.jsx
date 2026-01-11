export default function FormField({ label, children, hint }) {
    return (
      <label className="block">
        <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
        {children}
        {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
      </label>
    );
  }
  