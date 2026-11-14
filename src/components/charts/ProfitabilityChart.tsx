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
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#D4C2AE] rounded-xl bg-[#FAF7F2]/60">
        <p className="text-xs text-[#7B726C]">
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
          <CartesianGrid strokeDasharray="2 2" stroke="#EAE1D6" vertical={false} />
          <XAxis
            dataKey="shortTitle"
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
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as CollaborationProfitability;
                return (
                  <div className="bg-[#FAF7F2] border border-[#D4C2AE] p-3.5 rounded-xl shadow-luxury text-xs font-sans">
                    <p className="font-serif font-bold text-sm text-[#171514] mb-0.5">{item.campaignTitle}</p>
                    <p className="text-[10px] text-[#7B726C] mb-2 uppercase tracking-wider">{item.brandName}</p>
                    <div className="flex items-center justify-between gap-4 py-0.5">
                      <span className="text-[#5A534F]">Received Income:</span>
                      <span className="font-bold font-mono-numbers text-[#171514]">
                        {formatINR(item.income)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-0.5">
                      <span className="text-[#5A534F]">Expenses:</span>
                      <span className="font-bold font-mono-numbers text-[#A85F48]">
                        {formatINR(item.expenses)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-0.5 border-t border-[#D4C2AE]/60 mt-1.5 pt-1.5">
                      <span className="font-bold text-[#171514]">Net Profit:</span>
                      <span
                        className={`font-bold font-mono-numbers ${
                          item.net < 0 ? 'text-[#A85F48]' : 'text-[#2D6A4F]'
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
            wrapperStyle={{ fontSize: '11px', color: '#5A534F', fontFamily: 'DM Sans, sans-serif' }}
          />
          <Bar dataKey="income" name="Received Income" fill="#171514" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expenses" name="Expenses" fill="#A85F48" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="net" name="Net Profit" fill="#B49A70" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
