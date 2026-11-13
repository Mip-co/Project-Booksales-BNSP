import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { rupiah, rupiahCompact } from '../../../utils/format.js';

const AXIS_TICK = { fontSize: 12, fill: '#94a3b8' };

/** Grafik garis "Tren Penjualan" — data: [{ label: 'Jun', total: 237000 }, ...] */
export default function SalesTrendChart({ data }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} />
          <YAxis tickFormatter={rupiahCompact} tickLine={false} axisLine={false} width={70} tick={AXIS_TICK} />
          <Tooltip formatter={(value) => [rupiah(value), 'Omset']} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#trendFill)"
            dot={{ r: 3, fill: '#10b981' }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
