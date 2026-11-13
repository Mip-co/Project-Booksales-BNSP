import { Check, Clock, PackageCheck, Truck, BookOpen } from 'lucide-react';
import { ORDER_STEPS, STATUS_LABEL } from '../utils/format.js';

const STEP_ICONS = { pending: Clock, diproses: BookOpen, dikirim: Truck, selesai: PackageCheck };

/** Progress bar interaktif: Pending -> Diproses -> Dikirim -> Selesai. */
export default function OrderProgress({ status }) {
  const current = ORDER_STEPS.indexOf(status);

  return (
    <ol className="flex items-start">
      {ORDER_STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const Icon = STEP_ICONS[step];

        return (
          <li key={step} className="relative flex flex-1 flex-col items-center text-center">
            {index > 0 && (
              <span
                className={`absolute right-1/2 top-5 h-1 w-full -translate-y-1/2 rounded ${
                  index <= current ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              />
            )}
            <span
              className={`relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 transition ${
                done
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : active
                    ? 'border-emerald-600 bg-white text-emerald-700 ring-4 ring-emerald-100'
                    : 'border-slate-200 bg-white text-slate-400'
              }`}
            >
              {done ? <Check size={18} /> : <Icon size={18} />}
            </span>
            <span
              className={`mt-2 text-xs font-semibold ${
                done || active ? 'text-emerald-800' : 'text-slate-400'
              }`}
            >
              {STATUS_LABEL[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
