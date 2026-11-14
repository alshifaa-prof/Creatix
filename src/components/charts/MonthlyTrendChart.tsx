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
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#D4C2AE] rounded-xl bg-[#FAF7F2]/60">
        <p className="text-xs text-[#7B726C]">No monthly financial records to display.</p>
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
          <CartesianGrid strokeDasharray="2 2" stroke="#EAE1D6" vertical={false} />
          <XAxis
            dataKey="displayMonth"
            tick={{ fontSize: 11, fill: '#7B726C', fontFamily: 'DM Sans, sans-serif' }}
            tickLine={false}
            axisLine={{ stroke: '#D4C2AE' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#7B726C', fontFamily: 'JetBrains Mono, monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#FAF7F2] border border-[#D4C2AE] p-3.5 rounded-xl shadow-luxury text-xs font-sans">
                    <p className="font-serif font-bold text-sm text-[#171514] mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                      <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
                        <span className="text-[#5A534F] flex items-center gap-1.5 text-xs">
                          <span
                            className="w-2.5 h-2.5 rounded-xs"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}:
                        </span>
                        <span className="font-bold font-mono-numbers text-[#171514]">
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
            wrapperStyle={{ fontSize: '11px', color: '#5A534F', fontFamily: 'DM Sans, sans-serif' }}
          />
          <Bar dataKey="income" name="Received Income" fill="#171514" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="expenses" name="Expenses" fill="#A85F48" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Line
            type="monotone"
            dataKey="net"
            name="Net Earnings"
            stroke="#B49A70"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#B49A70' }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
