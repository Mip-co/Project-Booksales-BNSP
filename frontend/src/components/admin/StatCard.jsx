const TONES = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  sky: 'bg-sky-100 text-sky-700',
};

export default function StatCard({ label, value, hint, Icon, tone = 'emerald' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${TONES[tone]}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {hint && (
        <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {hint}
        </span>
      )}
    </div>
  );
}
