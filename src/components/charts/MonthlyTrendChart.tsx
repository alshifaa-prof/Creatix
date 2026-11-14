import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { MonthlyFinancialSummary } from '../../lib/calculations';
import { formatINR } from '../../lib/format';

export const MonthlyTrendChart: React.FC<{ data: MonthlyFinancialSummary[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-stone-200 rounded-xl bg-white/40">
        <p className="text-xs text-stone-500">No monthly financial records to display.</p>
      </div>
    );
  }

  // Format YYYY-MM into short readable month (e.g. Jun 26)
  const formattedData = data.map((d) => {
    const [y, m] = d.month.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
    const label = dateObj.toLocaleDateString('en-IN', { month: 'short' });
    return {
      ...d,
      displayMonth: label,
    };
  });

  return (
    <div className="h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e5db" vertical={false} />
          <XAxis
            dataKey="displayMonth"
            tick={{ fontSize: 11, fill: '#78716c' }}
            tickLine={false}
            axisLine={{ stroke: '#e8e5db' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#78716c' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-stone-200 p-3 rounded-lg shadow-md text-xs font-sans">
                    <p className="font-bold text-stone-900 mb-1.5">{label}</p>
                    {payload.map((entry: any, index: number) => (
                      <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
                        <span className="text-stone-600 flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-xs"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}:
                        </span>
                        <span className="font-bold font-mono-numbers text-stone-900">
                          {formatINR(entry.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: '#57534e' }}
          />
          <Bar dataKey="income" name="Received Income" fill="#1b4332" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="expenses" name="Expenses" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Line
            type="monotone"
            dataKey="net"
            name="Net Earnings"
            stroke="#0f172a"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#0f172a' }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
