import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

/** Doughnut "Genre Buku" — data: [{ name: 'Teknologi', qty: 12 }, ...] */
export default function GenreDoughnut({ data }) {
  if (data.length === 0) {
    return (
      <div className="grid h-72 place-items-center text-center text-sm text-slate-400">
        Belum ada transaksi selesai.
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="qty" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={2} stroke="none">
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} buku`, name]} />
          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
