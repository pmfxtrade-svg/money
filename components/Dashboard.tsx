import React, { useState } from 'react';
import { AppState } from '../types';
import { formatCurrency, parsePersianDate } from '../utils';
import { CapitalTrendChart, AssetDistributionChart, MonthlyPnLChart, AssetComparisonChart } from './Charts';
import { Calendar, TrendingUp, TrendingDown, Clock, ArrowUpRight, Wallet, PieChart, BarChart3, Settings2 } from 'lucide-react';

interface DashboardProps {
    state: AppState;
    onManageAsset?: (key: string) => void;
}

const HeroSection: React.FC<{ totalCapital: number }> = ({ totalCapital }) => (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-10 shadow-2xl shadow-slate-900/20 mb-8">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Wallet size={16} className="text-indigo-300" />
                    </div>
                    <span className="text-sm font-medium text-slate-300">ارزش کل دارایی‌ها</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-l from-white to-slate-300">
                    {formatCurrency(totalCapital).replace(' تومان', '')}
                    <span className="text-lg md:text-2xl text-slate-400 font-normal mr-2 font-sans">تومان</span>
                </h2>
            </div>
            
            <div className="flex gap-4">
                 <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 px-6">
                    <p className="text-xs text-slate-400 mb-1">وضعیت کلی</p>
                    <div className="flex items-center gap-2 text-emerald-400">
                        <ArrowUpRight size={20} />
                        <span className="font-bold">فعال</span>
                    </div>
                 </div>
            </div>
        </div>
    </div>
);

const AssetCard: React.FC<{ 
    name: string; 
    value: number; 
    percentage: number; 
    theme: 'gold' | 'stock' | 'crypto' | 'cash' | 'foreign';
    subItems: any[];
    onClick?: () => void;
}> = ({ name, value, percentage, theme, subItems, onClick }) => {
    
    const themes = {
        gold: {
            bg: 'bg-gradient-to-br from-amber-400 to-yellow-600',
            shadow: 'shadow-amber-500/20',
            icon: '🥇',
            subColor: 'text-amber-50',
            subMuted: 'text-amber-200'
        },
        stock: {
            bg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
            shadow: 'shadow-emerald-500/20',
            icon: '📈',
            subColor: 'text-emerald-50',
            subMuted: 'text-emerald-200'
        },
        foreign: {
            bg: 'bg-gradient-to-br from-cyan-500 to-blue-700',
            shadow: 'shadow-cyan-500/20',
            icon: '🌍',
            subColor: 'text-cyan-50',
            subMuted: 'text-cyan-200'
        },
        crypto: {
            bg: 'bg-gradient-to-br from-violet-500 to-purple-700',
            shadow: 'shadow-violet-500/20',
            icon: '₿',
            subColor: 'text-violet-50',
            subMuted: 'text-violet-200'
        },
        cash: {
            bg: 'bg-gradient-to-br from-blue-500 to-indigo-700',
            shadow: 'shadow-blue-500/20',
            icon: '💵',
            subColor: 'text-blue-50',
            subMuted: 'text-blue-200'
        }
    };

    const t = themes[theme];

    return (
        <div 
            onClick={onClick}
            className={`relative overflow-hidden p-6 rounded-[2rem] shadow-xl ${t.shadow} ${t.bg} text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group cursor-pointer`}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                        <span className="text-2xl">{t.icon}</span>
                    </div>
                    <div className="flex flex-col items-end">
                         {/* Edit Icon on Hover */}
                        <div className="absolute top-0 left-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Settings2 size={20} className="text-white/80" />
                        </div>
                        <span className="text-3xl font-black font-mono tracking-tight">{percentage}%</span>
                        <span className="text-[10px] opacity-80 uppercase tracking-wider">Allocation</span>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold opacity-80 mb-1">{name}</h3>
                    <p className="text-2xl font-bold font-mono truncate" dir="ltr">{formatCurrency(value)}</p>
                </div>

                {subItems.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/20">
                        <div className="flex flex-col gap-3">
                            {/* Showing up to 4 items */}
                            {subItems.slice(0, 4).map((sub, i) => (
                                <div key={i} className={`flex justify-between items-center ${t.subColor}`}>
                                    <div className="flex flex-col">
                                        <span className="opacity-100 font-bold text-base">{sub.name}</span>
                                        {sub.averageBuyPrice > 0 && (
                                            <span className={`text-xs ${t.subMuted} font-mono mt-1 opacity-90`}>
                                                 میانگین: {formatCurrency(sub.averageBuyPrice).replace(' تومان', '')}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-mono opacity-100 font-bold text-sm">{formatCurrency(sub.value)}</span>
                                </div>
                            ))}
                            {subItems.length > 4 && (
                                <span className="text-xs opacity-80 text-center mt-2 font-medium">+{subItems.length - 4} مورد دیگر</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const DashboardPage: React.FC<DashboardProps> = ({ state, onManageAsset }) => {
    const [dateFilter, setDateFilter] = useState('all');

    const filterTransactions = () => {
        if (dateFilter === 'all') return state.transactions;
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return state.transactions.filter(t => {
            const tDate = parsePersianDate(t.date);
            if (dateFilter === 'week') return tDate >= oneWeekAgo;
            if (dateFilter === 'month') return tDate >= oneMonthAgo;
            return true;
        });
    };

    const filteredTransactions = filterTransactions();

    return (
        <main className="container mx-auto p-4 md:p-6 pb-20 max-w-[120rem] animate-in fade-in duration-500">
            <HeroSection totalCapital={state.totalCapital} />

            {/* Asset Cards Grid */}
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <PieChart size={24} className="text-indigo-600" />
                سبد دارایی‌ها
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                <AssetCard 
                    name="طلا و سکه" 
                    value={state.assets.gold.value} 
                    percentage={state.assets.gold.percentage} 
                    theme="gold"
                    subItems={state.assets.gold.subItems}
                    onClick={() => onManageAsset && onManageAsset('gold')}
                />
                <AssetCard 
                    name="بورس ایران" 
                    value={state.assets.stock.value} 
                    percentage={state.assets.stock.percentage} 
                    theme="stock"
                    subItems={state.assets.stock.subItems}
                    onClick={() => onManageAsset && onManageAsset('stock')}
                />
                <AssetCard 
                    name="سهام خارجی" 
                    value={state.assets.foreignStock?.value || 0} 
                    percentage={state.assets.foreignStock?.percentage || 0} 
                    theme="foreign"
                    subItems={state.assets.foreignStock?.subItems || []}
                    onClick={() => onManageAsset && onManageAsset('foreignStock')}
                />
                <AssetCard 
                    name="ارزهای دیجیتال" 
                    value={state.assets.crypto.value} 
                    percentage={state.assets.crypto.percentage} 
                    theme="crypto"
                    subItems={state.assets.crypto.subItems}
                    onClick={() => onManageAsset && onManageAsset('crypto')}
                />
                <AssetCard 
                    name="نقدینگی و بانک" 
                    value={state.assets.cash.value} 
                    percentage={state.assets.cash.percentage} 
                    theme="cash"
                    subItems={state.assets.cash.subItems}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">روند رشد سرمایه</h3>
                            <p className="text-sm text-slate-400 mt-1">نمودار تغییرات ارزش کل دارایی در طول زمان</p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <CapitalTrendChart transactions={state.transactions} />
                </div>

                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 flex flex-col">
                     <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">توزیع دارایی</h3>
                            <p className="text-sm text-slate-400 mt-1">نسبت وزنی هر دارایی</p>
                        </div>
                         <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <PieChart size={24} />
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <AssetDistributionChart assets={state.assets} />
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Secondary Charts Column */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-slate-100 border border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 size={20} className="text-slate-400" />
                            <h3 className="text-base font-bold text-slate-700">سود و زیان ماهانه</h3>
                        </div>
                        <div className="h-[300px]">
                             <MonthlyPnLChart transactions={state.transactions} />
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-slate-100 border border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 size={20} className="text-slate-400" />
                            <h3 className="text-base font-bold text-slate-700">عملکرد دارایی‌ها</h3>
                        </div>
                        <div className="h-[300px]">
                             <AssetComparisonChart assets={state.assets} transactions={state.transactions} />
                        </div>
                    </div>
                </div>

                {/* Transactions Feed */}
                <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 min-h-[400px] h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Clock size={20} className="text-indigo-500" />
                            گردش حساب
                        </h3>
                        <select 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="text-xs font-medium border-none bg-slate-100 text-slate-600 rounded-lg py-1 px-3 cursor-pointer hover:bg-slate-200 transition-colors focus:ring-0"
                        >
                            <option value="all">همه زمان‌ها</option>
                            <option value="week">هفته اخیر</option>
                            <option value="month">ماه اخیر</option>
                        </select>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 pr-2 space-y-4 custom-scrollbar">
                        {filteredTransactions.slice(0, 15).map((t, i) => {
                            const isProfit = t.description.includes('سود') || t.description.includes('افزایش');
                            const isLoss = t.description.includes('زیان') || t.description.includes('برداشت');
                            const isInitial = t.description.includes('اولیه');

                            return (
                                <div key={i} className="group flex justify-between items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                            isInitial ? 'bg-blue-100 text-blue-600' :
                                            isProfit ? 'bg-emerald-100 text-emerald-600' :
                                            isLoss ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {isInitial ? '🏁' : isProfit ? '↗' : isLoss ? '↘' : '•'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm line-clamp-1">{t.description}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{t.date}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-black font-mono ${
                                        isLoss ? 'text-rose-500' : 'text-emerald-600'
                                    }`}>
                                        {isLoss ? '-' : '+'}{formatCurrency(t.amount).replace(' تومان', '')}
                                    </span>
                                </div>
                            );
                        })}
                        
                        {filteredTransactions.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Clock size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-medium">تراکنشی یافت نشد</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};