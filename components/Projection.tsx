import React, { useState, useMemo, useEffect } from 'react';
import { AppState, ProjectionSettings } from '../types';
import { NumberInput } from './NumberInput';
import { formatCurrency, numberToText } from '../utils';
import { ArrowRight, TrendingUp, PiggyBank, Target, Table, Save, Info } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ProjectionProps {
    state: AppState;
    onNavigate: (page: any) => void;
    onSave: (settings: ProjectionSettings) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800/90 backdrop-blur-md p-4 border border-slate-700 shadow-2xl rounded-2xl text-sm z-50 text-right min-w-[150px]" dir="rtl">
                <p className="font-bold text-slate-200 mb-2 border-b border-slate-600 pb-2">سال {label}</p>
                <div className="flex justify-between items-center gap-4 my-1">
                    <span className="text-emerald-400 font-medium text-xs">ارزش کل:</span>
                    <span className="font-mono text-white text-xs dir-ltr">{formatCurrency(payload[0].value)}</span>
                </div>
                <div className="flex justify-between items-center gap-4 my-1">
                    <span className="text-slate-400 font-medium text-xs">مجموع آورده:</span>
                    <span className="font-mono text-slate-300 text-xs dir-ltr">{formatCurrency(payload[1].value)}</span>
                </div>
            </div>
        );
    }
    return null;
};

export const ProjectionPage: React.FC<ProjectionProps> = ({ state, onNavigate, onSave }) => {
    // Load from saved settings or defaults
    const saved = state.projectionSettings;

    // Inputs
    const [baseCapital, setBaseCapital] = useState<number>(saved?.baseCapital || state.totalCapital);
    const [years, setYears] = useState<number>(saved?.years || 5);
    const [monthlyContribution, setMonthlyContribution] = useState<number>(saved?.monthlyContribution || 0);
    const [annualContributionIncrease, setAnnualContributionIncrease] = useState<number>(saved?.annualIncrease || 20); 
    
    // Asset expected returns (Annual)
    const [expectedReturns, setExpectedReturns] = useState<Record<string, number>>(saved?.expectedReturns || {
        gold: 35,
        stock: 30,
        foreignStock: 25,
        crypto: 50,
        cash: 15
    });

    // Update base capital if state loads later AND no explicit saved capital (or 0) was present
    useEffect(() => {
        if ((!saved || saved.baseCapital === 0) && state.totalCapital > 0 && baseCapital === 0) {
            setBaseCapital(state.totalCapital);
        }
    }, [state.totalCapital, saved]);

    const handleReturnChange = (key: string, val: number) => {
        setExpectedReturns(prev => ({ ...prev, [key]: val }));
    };

    const handleSaveSettings = () => {
        onSave({
            baseCapital,
            years,
            monthlyContribution,
            annualIncrease: annualContributionIncrease,
            expectedReturns
        });
        alert('تنظیمات آینده‌نگری با موفقیت ذخیره شد.');
    };

    // Calculation Logic
    const projectionData = useMemo(() => {
        const data = [];
        let currentCapital: number = baseCapital;
        let totalInvested: number = baseCapital;
        let currentMonthly: number = monthlyContribution;

        // Calculate weighted average annual return based on CURRENT portfolio allocation
        let weightedReturnRate: number = 0;
        const totalValue = state.totalCapital || 1; 

        if (state.totalCapital > 0) {
            Object.keys(state.assets).forEach(key => {
                const asset = state.assets[key];
                const weight = asset.value / totalValue;
                const rate = expectedReturns[key] || 0;
                weightedReturnRate += weight * rate;
            });
        } else {
             const rates: number[] = Object.values(expectedReturns);
             if (rates.length > 0) {
                 weightedReturnRate = rates.reduce((a, b) => a + b, 0) / rates.length;
             }
        }

        // Precise Monthly Rate Calculation (Geometric Mean / Effective Rate)
        // Formula: (1 + AnnualRate)^(1/12) - 1
        // This ensures that 30% annual return results in exactly 30% growth after 12 months (excluding contributions).
        const monthlyRate = Math.pow(1 + (weightedReturnRate / 100), 1 / 12) - 1;

        // Loop through years
        for (let year = 1; year <= years; year++) {
            // Compound monthly
            for (let month = 0; month < 12; month++) {
                // We assume contribution happens at the START of the month (standard investment advice)
                currentCapital += currentMonthly;
                totalInvested += currentMonthly;
                
                // Apply monthly interest
                currentCapital += currentCapital * monthlyRate;
            }

            data.push({
                year: year,
                totalValue: Math.round(currentCapital),
                totalInvested: Math.round(totalInvested),
                profit: Math.round(currentCapital - totalInvested),
                monthlyContribution: Math.round(currentMonthly)
            });

            // Increase monthly contribution for next year
            currentMonthly += currentMonthly * (annualContributionIncrease / 100);
        }

        return data;
    }, [baseCapital, state.totalCapital, state.assets, years, monthlyContribution, annualContributionIncrease, expectedReturns]);

    const finalResult = projectionData[projectionData.length - 1] || { totalValue: 0, totalInvested: 0, profit: 0 };

    return (
        <main className="container mx-auto p-4 md:p-6 pb-20 max-w-[120rem] animate-in slide-in-from-bottom-4">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowRight size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">ماشین حساب آینده‌نگری</h2>
                        <p className="text-sm text-slate-500">شبیه‌سازی رشد سرمایه با سود مرکب (Effective Rate)</p>
                    </div>
                 </div>
                 
                 <button 
                    onClick={handleSaveSettings}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                 >
                    <Save size={18} />
                    <span className="hidden md:inline">ذخیره تنظیمات</span>
                 </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Inputs Section - Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100">
                        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <Target size={20} className="text-indigo-500" />
                            پارامترهای ورودی
                        </h3>

                        <div className="space-y-6">
                            {/* Initial Capital Override */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-2">سرمایه اولیه شروع</label>
                                <NumberInput 
                                    value={baseCapital} 
                                    onCommit={setBaseCapital}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-center font-mono font-bold focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white"
                                    placeholder="مثال: ۱۰۰,۰۰۰,۰۰۰"
                                />
                            </div>

                             {/* Duration */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-slate-500">مدت زمان (سال)</label>
                                    <span className="text-xs font-black text-indigo-600">{years} سال</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    step="1"
                                    value={years}
                                    onChange={(e) => setYears(parseInt(e.target.value))}
                                    className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            {/* Monthly Contribution */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-2">واریزی ماهیانه (شروع)</label>
                                <NumberInput 
                                    value={monthlyContribution} 
                                    onCommit={setMonthlyContribution}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-center font-mono font-bold focus:border-indigo-500 outline-none"
                                    placeholder="مثال: ۵,۰۰۰,۰۰۰"
                                />
                            </div>

                             {/* Annual Increase */}
                            <div>
                                <div className="flex justify-between mb-2 items-center">
                                    <label className="text-xs font-bold text-slate-500">درصد افزایش سالانه واریزی</label>
                                    <div className="relative w-20">
                                         <NumberInput 
                                            value={annualContributionIncrease}
                                            onCommit={setAnnualContributionIncrease}
                                            className="w-full p-1 text-center font-black text-emerald-600 border-b-2 border-emerald-100 focus:border-emerald-500 outline-none bg-transparent"
                                        />
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] text-emerald-300 pointer-events-none">%</span>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={annualContributionIncrease}
                                    onChange={(e) => setAnnualContributionIncrease(parseInt(e.target.value))}
                                    className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">واریزی هر سال نسبت به سال قبل {annualContributionIncrease}٪ بیشتر می‌شود.</p>
                            </div>
                        </div>
                    </div>

                    {/* Returns Config */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100">
                        <h3 className="font-bold text-slate-700 mb-4 text-sm flex items-center gap-2">
                             <TrendingUp size={16} className="text-indigo-500" />
                             پیش‌بینی بازدهی سالانه هر بازار (%)
                        </h3>
                        <div className="space-y-4">
                            {Object.keys(expectedReturns).map(key => {
                                const assetName = state.assets[key]?.name || key;
                                const value = expectedReturns[key as keyof typeof expectedReturns];
                                
                                let colorClass = "accent-indigo-500";
                                let trackClass = "bg-indigo-100";
                                if (key === 'gold') { colorClass = "accent-amber-500"; trackClass = "bg-amber-100"; }
                                else if (key === 'stock') { colorClass = "accent-emerald-500"; trackClass = "bg-emerald-100"; }
                                else if (key === 'foreignStock') { colorClass = "accent-cyan-500"; trackClass = "bg-cyan-100"; }
                                else if (key === 'crypto') { colorClass = "accent-violet-500"; trackClass = "bg-violet-100"; }

                                return (
                                    <div key={key} className="">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[11px] font-bold text-slate-500">{assetName}</label>
                                            <div className="relative w-12">
                                                <NumberInput 
                                                    value={value}
                                                    onCommit={(val) => handleReturnChange(key, val)}
                                                    className="w-full p-0 text-left font-mono text-xs font-bold bg-transparent outline-none focus:text-indigo-600 border-b border-transparent focus:border-indigo-200 transition-colors"
                                                />
                                                <span className="absolute -left-3 top-0 text-[10px] text-slate-400 pointer-events-none">%</span>
                                            </div>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="100" 
                                            step="1"
                                            value={value}
                                            onChange={(e) => handleReturnChange(key, parseFloat(e.target.value))}
                                            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${trackClass} ${colorClass}`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Results Section - Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* 3 Summary Cards - Enlarged */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Invested */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between min-h-[120px]">
                                <div className="flex items-center gap-2 mb-2 opacity-90">
                                    <div className="p-1.5 bg-white/20 rounded-lg">
                                        <PiggyBank size={20} />
                                    </div>
                                    <span className="text-sm font-bold">مجموع آورده</span>
                                </div>
                                <div>
                                    <h3 className="text-xl lg:text-2xl font-black font-mono tracking-tight dir-ltr text-right mb-1">{formatCurrency(finalResult.totalInvested).replace(' تومان', '')}</h3>
                                    <p className="text-xs font-medium text-blue-100 text-right opacity-90">{numberToText(finalResult.totalInvested)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Profit */}
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between min-h-[120px]">
                                <div className="flex items-center gap-2 mb-2 opacity-90">
                                    <div className="p-1.5 bg-white/20 rounded-lg">
                                        <TrendingUp size={20} />
                                    </div>
                                    <span className="text-sm font-bold">سود خالص</span>
                                </div>
                                <div>
                                    <h3 className="text-xl lg:text-2xl font-black font-mono tracking-tight dir-ltr text-right mb-1">{formatCurrency(finalResult.profit).replace(' تومان', '')}</h3>
                                    <p className="text-xs font-medium text-emerald-100 text-right opacity-90">{numberToText(finalResult.profit)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Final Value */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-slate-300 relative overflow-hidden border border-slate-700 group hover:scale-[1.02] transition-transform duration-300">
                             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500 opacity-20 rounded-full blur-3xl animate-pulse"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between min-h-[120px]">
                                <div className="flex items-center gap-2 mb-2 opacity-90 text-indigo-300">
                                    <div className="p-1.5 bg-white/10 rounded-lg">
                                        <Target size={20} />
                                    </div>
                                    <span className="text-sm font-bold">ارزش نهایی</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl lg:text-3xl font-black font-mono tracking-tight dir-ltr text-right text-transparent bg-clip-text bg-gradient-to-l from-white to-slate-400 mb-1">
                                        {formatCurrency(finalResult.totalValue).replace(' تومان', '')}
                                    </h3>
                                    <p className="text-xs font-medium text-slate-400 text-right">{numberToText(finalResult.totalValue)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 h-[450px]">
                        <h3 className="font-bold text-slate-800 mb-6 text-lg">نمودار رشد سرمایه</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="year" 
                                    tickFormatter={(val) => `سال ${val}`}
                                    tick={{fontSize: 12, fontFamily: 'Tahoma', fill: '#94a3b8', fontWeight: 'bold'}} 
                                    stroke="transparent"
                                />
                                <YAxis 
                                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} 
                                    tick={{fontSize: 12, fontFamily: 'Tahoma', fill: '#94a3b8', fontWeight: 'bold'}} 
                                    stroke="transparent"
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="totalValue" 
                                    name="ارزش کل"
                                    stroke="#10B981" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorTotal)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="totalInvested" 
                                    name="آورده"
                                    stroke="#3B82F6" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorInvested)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Detailed List (Table) */}
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                            <Table size={20} className="text-indigo-600" />
                            <h3 className="font-bold text-slate-800 text-lg">جزئیات سالانه</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-4">سال</th>
                                        <th className="px-6 py-4">واریزی ماهانه (پایان سال)</th>
                                        <th className="px-6 py-4">کل سرمایه گذاری</th>
                                        <th className="px-6 py-4">سود انباشته</th>
                                        <th className="px-6 py-4 text-left">ارزش نهایی</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {projectionData.map((row) => (
                                        <tr key={row.year} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-slate-700">سال {row.year}</td>
                                            <td className="px-6 py-4 font-mono text-slate-600 text-sm dir-ltr text-right">{formatCurrency(row.monthlyContribution)}</td>
                                            <td className="px-6 py-4 font-mono text-blue-600 font-bold text-sm dir-ltr text-right">{formatCurrency(row.totalInvested)}</td>
                                            <td className="px-6 py-4 font-mono text-emerald-600 font-bold text-sm dir-ltr text-right">+{formatCurrency(row.profit)}</td>
                                            <td className="px-6 py-4 text-left group-hover:text-indigo-700">
                                                <div className="font-mono font-black text-base dir-ltr">{formatCurrency(row.totalValue)}</div>
                                                <div className="text-[10px] text-slate-400 font-normal mt-1">{numberToText(row.totalValue)}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3 text-indigo-900 leading-relaxed">
                        <Info size={20} className="shrink-0 mt-0.5 text-indigo-600" />
                        <div className="text-xs">
                             <strong className="block mb-1 text-sm">نحوه محاسبه استاندارد:</strong>
                             محاسبات بر اساس فرمول سود مرکب موثر (Effective Annual Rate) انجام می‌شود.
                             <br/>
                             این یعنی اگر سود سالانه را ۳۰٪ وارد کنید، دقیقا در پایان سال ۳۰٪ رشد (بدون در نظر گرفتن واریزی جدید) خواهید داشت.
                             واریزی‌های ماهانه در ابتدای هر ماه به سرمایه اضافه شده و مشمول سود می‌شوند. این محاسبات اثر تورم را در نظر نمی‌گیرد و فرض بر بازدهی ثابت سالانه است.
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};