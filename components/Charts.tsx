import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Transaction, Assets, Asset } from '../types';
import { formatCurrency } from '../utils';

// Modern Palette - Added Cyan for Foreign Stock
const COLORS = ['#F59E0B', '#10B981', '#06b6d4', '#8B5CF6', '#3B82F6', '#EC4899', '#6366F1'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/90 backdrop-blur-md p-4 border border-slate-700 shadow-2xl rounded-2xl text-sm z-50 text-right min-w-[150px]" dir="rtl">
        <p className="font-bold text-slate-200 mb-2 border-b border-slate-600 pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center gap-4 my-1">
            <span style={{ color: entry.color }} className="font-medium text-xs">{entry.name}:</span>
            <span className="font-mono text-white text-xs dir-ltr">{formatCurrency(Math.abs(entry.value))}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Capital Trend Chart (Area Chart for better visual) ---
export const CapitalTrendChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const data = React.useMemo(() => {
    const chronological = [...transactions].reverse();
    let cumulative = 0;
    
    return chronological.map(t => {
      if (t.description.includes('سرمایه اولیه') || t.description.includes('افزایش سرمایه') || t.description.includes('سود')) {
        cumulative += t.amount;
      } else if (t.description.includes('زیان')) {
        cumulative -= t.amount;
      }
      return {
        date: t.date,
        capital: cumulative
      };
    });
  }, [transactions]);

  return (
    <div dir="ltr" className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tick={{fontSize: 10, fontFamily: 'Tahoma', fontWeight: 'bold', fill: '#94a3b8'}} 
            stroke="transparent"
            tickMargin={10}
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} 
            tick={{fontSize: 10, fontFamily: 'Tahoma', fontWeight: 'bold', fill: '#94a3b8'}} 
            stroke="transparent"
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="capital" 
            name="کل سرمایه"
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCapital)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Asset Distribution Pie ---
export const AssetDistributionChart: React.FC<{ assets: Assets }> = ({ assets }) => {
  const data = Object.values(assets).map((a: Asset) => ({ name: a.name, value: a.value }));

  return (
    <div dir="ltr" className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            cornerRadius={6}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            wrapperStyle={{ fontFamily: 'Tahoma', fontWeight: 'bold', fontSize: '11px', paddingTop: '10px' }} 
            formatter={(value) => <span className="text-slate-500 px-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Monthly P/L Bar (Grouped by Asset) ---
export const MonthlyPnLChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const data = React.useMemo(() => {
    const monthly: { [key: string]: { month: string, gold: number, stock: number, foreign: number, crypto: number } } = {};
    
    transactions.forEach(t => {
      // Only process Profit or Loss transactions
      if (!t.description.includes('سود') && !t.description.includes('زیان')) return;

      const month = t.date.substring(0, 7); // yyyy/mm
      if (!monthly[month]) {
        monthly[month] = { month, gold: 0, stock: 0, foreign: 0, crypto: 0 };
      }

      const isLoss = t.description.includes('زیان');
      const val = isLoss ? -t.amount : t.amount;

      // Classify based on description keywords
      if (t.description.includes('طلا') || t.description.includes('سکه')) {
        monthly[month].gold += val;
      } else if (t.description.includes('بورس') || t.description.includes('سهام') && !t.description.includes('خارجی')) {
        monthly[month].stock += val;
      } else if (t.description.includes('خارجی') || t.description.includes('اپل') || t.description.includes('تسلا')) {
        monthly[month].foreign += val;
      } else if (t.description.includes('ارز') || t.description.includes('دیجیتال') || t.description.includes('بیت')) {
        monthly[month].crypto += val;
      }
    });

    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  return (
    <div dir="ltr" className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            tick={{fontSize: 9, fontFamily: 'Tahoma', fontWeight: 'bold', fill: '#94a3b8'}} 
            stroke="transparent" 
          />
          <YAxis 
            tickFormatter={(val) => `${(val / 1000).toFixed(0)}K`} 
            tick={{fontSize: 9, fontFamily: 'Tahoma', fontWeight: 'bold', fill: '#94a3b8'}} 
            stroke="transparent"
            width={30}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.02)'}} />
          <Legend 
            wrapperStyle={{ fontFamily: 'Tahoma', fontWeight: 'bold', fontSize: '10px' }} 
            align="right"
            verticalAlign="top"
            iconType="circle"
          />
          <Bar dataKey="gold" name="طلا" fill="#F59E0B" radius={[4, 4, 4, 4]} maxBarSize={12} />
          <Bar dataKey="stock" name="بورس" fill="#10B981" radius={[4, 4, 4, 4]} maxBarSize={12} />
          <Bar dataKey="foreign" name="سهام خارجی" fill="#06b6d4" radius={[4, 4, 4, 4]} maxBarSize={12} />
          <Bar dataKey="crypto" name="ارز دیجیتال" fill="#8B5CF6" radius={[4, 4, 4, 4]} maxBarSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Asset Comparison ---
export const AssetComparisonChart: React.FC<{ assets: Assets; transactions: Transaction[] }> = ({ assets, transactions }) => {
  const data = ['gold', 'stock', 'foreignStock', 'crypto'].map(key => {
      const asset = assets[key];
      // handle case where asset might not exist yet in old state
      if (!asset) return null;

      // Calculate total liquidated amount for this asset based on transactions
      const liquidated = transactions
        .filter(t => t.description.includes('نقد کردن') && t.description.includes(asset.name))
        .reduce((sum, t) => sum + t.amount, 0);

      return {
          name: asset.name,
          initial: asset.initialValue || 0,
          liquidated: liquidated,
          current: asset.value || 0,
          diff: (asset.value || 0) - (asset.initialValue || 0)
      };
  }).filter(Boolean);

  return (
    <div dir="ltr" className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            tick={{fontSize: 10, fontFamily: 'Tahoma', fontWeight: 'bold', fill: '#94a3b8'}} 
            stroke="transparent" 
          />
          <YAxis 
            tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} 
            tick={{fontSize: 9, fontFamily: 'Tahoma', fontWeight: 'bold', fill: '#94a3b8'}} 
            stroke="transparent"
            width={30}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.02)'}} />
          <Legend 
            wrapperStyle={{ fontFamily: 'Tahoma', fontWeight: 'bold', fontSize: '10px' }} 
            align="right"
            verticalAlign="top"
            iconType="circle"
          />
          <Bar dataKey="initial" name="سرمایه اولیه" fill="#94a3b8" radius={[4, 4, 4, 4]} maxBarSize={12} />
          <Bar dataKey="liquidated" name="نقد شده" fill="#F97316" radius={[4, 4, 4, 4]} maxBarSize={12} />
          <Bar dataKey="diff" name="سود/زیان" radius={[4, 4, 4, 4]} maxBarSize={12}>
              {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.diff >= 0 ? '#10B981' : '#F43F5E'} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};