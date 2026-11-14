import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { CollaborationProfitability } from '../../lib/calculations';
import { formatINR } from '../../lib/format';

export const ProfitabilityChart: React.FC<{ data: CollaborationProfitability[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-stone-200 rounded-xl bg-white/40">
        <p className="text-xs text-stone-500">
          No collaboration records linked to financial transactions yet.
        </p>
      </div>
    );
  }

  // Shorten campaign titles for clean x-axis display
  const chartData = data.map((d) => ({
    ...d,
    shortTitle:
      d.campaignTitle.length > 18 ? `${d.campaignTitle.slice(0, 16)}...` : d.campaignTitle,
  }));

  return (
    <div className="h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e5db" vertical={false} />
          <XAxis
            dataKey="shortTitle"
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
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as CollaborationProfitability;
                return (
                  <div className="bg-white border border-stone-200 p-3 rounded-lg shadow-md text-xs font-sans">
                    <p className="font-bold text-stone-900 mb-0.5">{item.campaignTitle}</p>
                    <p className="text-[10px] text-stone-500 mb-2">{item.brandName}</p>
                    <div className="flex items-center justify-between gap-4 py-0.5">
                      <span className="text-stone-600">Received Income:</span>
                      <span className="font-bold font-mono-numbers text-stone-900">
                        {formatINR(item.income)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-0.5">
                      <span className="text-stone-600">Expenses:</span>
                      <span className="font-bold font-mono-numbers text-stone-900">
                        {formatINR(item.expenses)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-0.5 border-t border-stone-100 mt-1 pt-1">
                      <span className="font-bold text-stone-900">Net Profit:</span>
                      <span
                        className={`font-bold font-mono-numbers ${
                          item.net < 0 ? 'text-rose-600' : 'text-creator-900'
                        }`}
                      >
                        {formatINR(item.net)}
                      </span>
                    </div>
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
          <Bar dataKey="income" name="Received Income" fill="#1b4332" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expenses" name="Expenses" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="net" name="Net Profit" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
