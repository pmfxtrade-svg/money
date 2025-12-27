import React, { useState, useMemo } from 'react';
import { AppState, TradeRecord, SubItem, Asset } from '../types';
import { formatCurrency, parsePersianDate, getTodayDate } from '../utils';
import { History, ArrowRight, TrendingUp, TrendingDown, Clock, Activity, Coins, Search, Calendar, BarChart3, DollarSign, Calculator } from 'lucide-react';
import { NumberInput } from './NumberInput';

interface TradesPageProps {
    state: AppState;
    onNavigate: (page: any) => void;
    onUpdateCurrentPrice: (assetKey: string, subIndex: number, price: number) => void;
}

const calculateDaysOpen = (trades: TradeRecord[]) => {
    if (trades.length === 0) return 0;
    const sorted = [...trades].sort((a, b) => {
        return parsePersianDate(a.date).getTime() - parsePersianDate(b.date).getTime();
    });
    const firstDate = parsePersianDate(sorted[0].date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - firstDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

// --- Asset Summary PnL Card ---
const AssetSummaryCard: React.FC<{
    title: string;
    icon: string;
    theme: 'gold' | 'stock' | 'foreign' | 'crypto';
    asset: Asset;
    tetherPrice?: number;
}> = ({ title, icon, theme, asset, tetherPrice = 0 }) => {
    
    // Calculate aggregate PnL for this asset category
    const stats = useMemo(() => {
        let totalCurrentValue = 0;
        let totalCostBasis = 0;
        let activePositions = 0;

        const isUsdtBased = theme === 'crypto' || theme === 'foreign';
        const conversionRate = isUsdtBased && tetherPrice > 0 ? tetherPrice : 1;

        asset.subItems.forEach(item => {
            const qty = item.quantity || 0;
            if (qty > 0) {
                const cost = qty * (item.averageBuyPrice || 0);
                
                // Determine Current Price in Tomans
                let currentPriceInTomans = 0;
                
                if (item.currentPrice && item.currentPrice > 0) {
                     // If user entered a price, convert it if needed
                     currentPriceInTomans = item.currentPrice * conversionRate;
                } else {
                    // Fallback to avg price if no current price set (to avoid showing massive loss)
                    currentPriceInTomans = item.averageBuyPrice || 0;
                }

                const val = qty * currentPriceInTomans;

                totalCostBasis += cost;
                totalCurrentValue += val;
                activePositions++;
            }
        });

        const pnl = totalCurrentValue - totalCostBasis;
        const pnlPercent = totalCostBasis > 0 ? (pnl / totalCostBasis) * 100 : 0;

        return { pnl, pnlPercent, activePositions };
    }, [asset, tetherPrice, theme]);

    const themes = {
        gold: {
            bg: 'bg-gradient-to-br from-amber-400 to-yellow-600',
            shadow: 'shadow-amber-500/20',
            iconBg: 'bg-white/20',
        },
        stock: {
            bg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
            shadow: 'shadow-emerald-500/20',
            iconBg: 'bg-white/20',
        },
        foreign: {
            bg: 'bg-gradient-to-br from-cyan-500 to-blue-700',
            shadow: 'shadow-cyan-500/20',
            iconBg: 'bg-white/20',
        },
        crypto: {
            bg: 'bg-gradient-to-br from-violet-500 to-purple-700',
            shadow: 'shadow-violet-500/20',
            iconBg: 'bg-white/20',
        },
    };
    const t = themes[theme];

    return (
        <div className={`p-5 rounded-[2rem] shadow-xl ${t.shadow} ${t.bg} text-white flex flex-col justify-between h-full relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
             {/* Decorative Circle */}
             <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-8 -mt-8 blur-xl group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative z-10 flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${t.iconBg} backdrop-blur-md text-xl shadow-inner`}>{icon}</div>
                    <div>
                        <h4 className="text-base font-black text-white">{title}</h4>
                        <span className="text-[10px] text-white/80 font-bold block mt-0.5">{stats.activePositions} پوزیشن فعال</span>
                    </div>
                </div>
            </div>
            
            <div className="relative z-10 mt-auto">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] text-white/90 font-bold mb-1 opacity-90">سود/زیان کل</span>
                    <div className="text-right">
                         <span className="text-xl font-black font-mono dir-ltr text-white block leading-none">
                            {stats.pnl > 0 ? '+' : ''}{formatCurrency(stats.pnl).replace(' تومان', '')}
                        </span>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                        className={`h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000`} 
                        style={{ width: `${Math.min(Math.abs(stats.pnlPercent), 100)}%` }}
                    ></div>
                </div>
                 <div className="flex justify-end mt-1.5 gap-1 items-center">
                    <span className="text-[10px] opacity-80">بازدهی:</span>
                    <span className="text-xs font-bold dir-ltr text-white font-mono">
                        {stats.pnlPercent.toFixed(2)}%
                    </span>
                    {stats.pnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                </div>
            </div>
        </div>
    );
};

const PositionCard: React.FC<{
    subItem: SubItem;
    trades: TradeRecord[];
    assetKey: string;
    subIndex: number;
    tetherPrice: number;
    onUpdateCurrentPrice: (assetKey: string, subIndex: number, price: number) => void;
}> = ({ subItem, trades, assetKey, subIndex, tetherPrice, onUpdateCurrentPrice }) => {
    const [searchDate, setSearchDate] = useState('');

    const isUsdtBased = assetKey === 'crypto' || assetKey === 'foreignStock';

    const qty = subItem.quantity || 0;
    const avgPrice = subItem.averageBuyPrice || 0; // In Tomans
    const totalCost = qty * avgPrice;
    
    // Logic for Price: 
    // If USDT based, currentPrice is in USDT. We need to convert to Toman for value calc.
    // If Toman based, currentPrice is in Tomans.
    const rawCurrentPrice = subItem.currentPrice || 0;
    const hasPrice = subItem.currentPrice !== undefined && subItem.currentPrice > 0;
    
    let currentPriceInTomans = 0;
    if (isUsdtBased) {
        currentPriceInTomans = rawCurrentPrice * (tetherPrice > 0 ? tetherPrice : 0);
    } else {
        currentPriceInTomans = rawCurrentPrice;
    }
    
    // If user hasn't set tether price yet but we have a USDT price, currentValue will be 0, which is correct (waiting for input)
    // UNLESS we want to show raw USDT value? No, let's show Toman value but maybe warn if Tether price is missing.
    
    const currentValue = qty * currentPriceInTomans;
    const pnl = (hasPrice && (!isUsdtBased || tetherPrice > 0)) ? currentValue - totalCost : 0;
    const pnlPercent = (hasPrice && totalCost > 0 && (!isUsdtBased || tetherPrice > 0)) ? (pnl / totalCost) * 100 : 0;
    const daysOpen = calculateDaysOpen(trades);

    // Filter trades based on search
    const filteredTrades = useMemo(() => {
        if (!searchDate) return trades;
        return trades.filter(t => t.date.includes(searchDate));
    }, [trades, searchDate]);

    return (
        <div className="bg-white rounded-[1.5rem] shadow-lg shadow-slate-100 border border-slate-100 overflow-hidden mb-4 last:mb-0 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-start gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg shadow-sm shrink-0">
                        <Activity size={16} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-800 leading-tight truncate">{subItem.name}</h3>
                        <div className="flex flex-col mt-1">
                            <span className="text-[9px] text-slate-400 font-mono">تعداد: <span className="text-slate-600 font-bold">{qty}</span></span>
                        </div>
                    </div>
                </div>
                {daysOpen > 0 && (
                     <div className="flex items-center gap-1 text-slate-500 font-bold text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-full shadow-sm shrink-0">
                        <Clock size={10} />
                        {daysOpen} روز
                    </div>
                )}
            </div>

            {/* Live PnL Section */}
            <div className="p-4 flex flex-col gap-3 bg-gradient-to-b from-white to-slate-50/50">
                
                {/* Current Price Input */}
                <div className={`bg-white p-2 rounded-xl border shadow-sm relative group focus-within:ring-2 transition-all ${isUsdtBased ? 'border-violet-200 focus-within:ring-violet-100' : 'border-indigo-100 focus-within:ring-indigo-100'}`}>
                     <label className={`text-[8px] font-bold absolute -top-2 right-2 bg-white px-1 ${isUsdtBased ? 'text-violet-500' : 'text-slate-400'}`}>
                        {isUsdtBased ? 'قیمت به تتر (USDT)' : 'قیمت لحظه‌ای (تومان)'}
                     </label>
                     <div className="flex items-center gap-2">
                        {isUsdtBased ? (
                            <DollarSign size={14} className="text-violet-500" />
                        ) : (
                            <Coins size={14} className="text-indigo-400" />
                        )}
                        <NumberInput
                            value={rawCurrentPrice}
                            onCommit={(val) => onUpdateCurrentPrice(assetKey, subIndex, val)}
                            className="w-full text-sm font-black font-mono text-slate-700 outline-none bg-transparent placeholder:text-slate-200"
                            placeholder="وارد کنید..."
                        />
                     </div>
                </div>
                
                {isUsdtBased && hasPrice && tetherPrice === 0 && (
                    <div className="text-[9px] text-rose-500 font-bold text-center bg-rose-50 rounded px-1">
                        * قیمت تتر را در بالا وارد کنید
                    </div>
                )}

                <div className="flex justify-between items-end border-b border-dashed border-slate-100 pb-2">
                     <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold mb-0.5">میانگین خرید (تومان)</span>
                        <span className="text-xs font-mono font-bold text-slate-600">{formatCurrency(avgPrice).replace(' تومان', '')}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-slate-400 font-bold mb-0.5">ارزش فعلی (تومان)</span>
                        <span className={`text-sm font-mono font-black tracking-tight ${!hasPrice || (isUsdtBased && tetherPrice === 0) ? 'text-slate-300' : 'text-slate-800'}`}>
                            {!hasPrice || (isUsdtBased && tetherPrice === 0) ? '---' : formatCurrency(currentValue).replace(' تومان', '')}
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold mb-0.5">سود / زیان</span>
                        <span className={`text-sm font-mono font-black tracking-tight ${
                             (!hasPrice || (isUsdtBased && tetherPrice === 0)) ? 'text-slate-300' : pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                            {!hasPrice || (isUsdtBased && tetherPrice === 0) ? '---' : (pnl > 0 ? '+' : '') + formatCurrency(pnl).replace(' تومان', '')}
                        </span>
                    </div>

                     {(!hasPrice || (isUsdtBased && tetherPrice === 0)) ? (
                        <div className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-400">
                             محاسبه...
                        </div>
                     ) : (
                         <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold font-mono shadow-sm ${
                             pnlPercent >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                         }`}>
                             {pnlPercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                             {Math.abs(pnlPercent).toFixed(1)}%
                         </div>
                     )}
                </div>
            </div>

            {/* Transaction History with Search */}
            {trades.length > 0 && (
                <div className="border-t border-slate-100 mt-auto">
                     <div className="px-4 py-2 bg-slate-50/30 flex items-center justify-between gap-1">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <History size={10} />
                            معاملات
                        </div>
                        {/* Date Search Input */}
                        <div className="relative flex items-center bg-white rounded-lg px-2 py-0.5 border border-slate-200 focus-within:border-indigo-300 w-24">
                            <Search size={10} className="text-slate-400 ml-1" />
                            <input 
                                type="text" 
                                className="w-full text-[9px] font-mono border-none outline-none bg-transparent text-slate-600 placeholder:text-slate-300"
                                placeholder="جستجو تاریخ..."
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                            />
                        </div>
                     </div>
                     
                     {/* Scrollable Table - Limited height for approx 4 rows */}
                     <div className="max-h-[140px] overflow-y-auto custom-scrollbar">
                        {filteredTrades.length > 0 ? (
                            <table className="w-full text-right">
                                <tbody className="divide-y divide-slate-50">
                                    {filteredTrades.slice().reverse().map((trade) => (
                                        <tr key={trade.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-2 text-[9px] font-bold text-emerald-600 w-8 whitespace-nowrap">
                                                {trade.type === 'buy' ? 'خرید' : 'فروش'}
                                            </td>
                                            <td className="px-2 py-2 text-[9px] font-mono text-slate-500 whitespace-nowrap">{trade.date}</td>
                                            <td className="px-4 py-2 text-[9px] font-mono font-bold text-slate-700 text-left">
                                                {formatCurrency(trade.totalCost).replace(' تومان', '')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-4 text-[9px] text-slate-400">موردی یافت نشد</div>
                        )}
                     </div>
                </div>
            )}
        </div>
    );
};

export const TradesPage: React.FC<TradesPageProps> = ({ state, onNavigate, onUpdateCurrentPrice }) => {
    
    // State for Tether Price
    const [tetherPrice, setTetherPrice] = useState<number>(0);

    // Group Assets Key -> Asset
    const assetsEntries = Object.entries(state.assets).filter(([key]) => key !== 'cash') as [string, Asset][];

    return (
        <main className="w-full px-4 pb-20 animate-in slide-in-from-bottom-4 duration-500">
             
             {/* Header Section with Navigation and Tether Input */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-4">
                 <div className="flex items-center gap-3">
                     <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowRight size={20} className="text-gray-600" />
                     </button>
                     <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">مدیریت پوزیشن‌ها</h2>
                        </div>
                     </div>
                 </div>

                 {/* Tether Price Input Card */}
                 <div className="bg-white p-2 pr-4 rounded-xl border border-violet-100 shadow-sm flex items-center gap-4 self-start md:self-auto min-w-[200px]">
                    <div className="flex items-center gap-2 text-violet-600">
                        <div className="p-1.5 bg-violet-50 rounded-lg">
                            <DollarSign size={18} />
                        </div>
                        <span className="text-xs font-bold whitespace-nowrap">قیمت تتر (تومان)</span>
                    </div>
                    <div className="h-6 w-px bg-slate-100"></div>
                    <NumberInput
                        value={tetherPrice}
                        onCommit={setTetherPrice}
                        className="w-full text-lg font-black font-mono text-violet-700 outline-none bg-transparent placeholder:text-violet-200 text-left"
                        placeholder="60,000"
                    />
                 </div>
            </div>

            {/* Summary Grid (4 Cards Top) */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                 <AssetSummaryCard title="طلا و سکه" icon="🥇" theme="gold" asset={state.assets.gold} tetherPrice={0} />
                 <AssetSummaryCard title="بورس ایران" icon="📈" theme="stock" asset={state.assets.stock} tetherPrice={0} />
                 <AssetSummaryCard title="سهام خارجی" icon="🌍" theme="foreign" asset={state.assets.foreignStock || { subItems: [] } as any} tetherPrice={tetherPrice} />
                 <AssetSummaryCard title="ارز دیجیتال" icon="₿" theme="crypto" asset={state.assets.crypto} tetherPrice={tetherPrice} />
            </div>

            {/* Main Assets Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start pb-10">
                {assetsEntries.map(([key, asset]) => {
                    const activeSubItems = asset.subItems.map((item, idx) => ({ item, idx }));
                    
                    if (activeSubItems.length === 0) return null;

                    const themeColor = 
                        key === 'gold' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                        key === 'stock' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                        key === 'foreignStock' ? 'text-cyan-700 bg-cyan-50 border-cyan-200' :
                        'text-violet-700 bg-violet-50 border-violet-200';

                    const icon = 
                        key === 'gold' ? '🥇' :
                        key === 'stock' ? '📈' :
                        key === 'foreignStock' ? '🌍' : '₿';

                    return (
                        <section key={key} className="w-full">
                            <div className={`flex items-center justify-between px-4 py-2 rounded-xl border mb-4 shadow-sm ${themeColor}`}>
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <span className="text-lg">{icon}</span>
                                    {asset.name}
                                </div>
                                <div className="text-[10px] opacity-70 font-mono bg-white/50 px-2 py-0.5 rounded-lg">
                                    {activeSubItems.length}
                                </div>
                            </div>
                            
                            <div className="flex flex-col">
                                {activeSubItems.map(({ item, idx }) => {
                                    // Find relevant trades for this subitem
                                    const itemTrades = state.tradeHistory.filter(t => 
                                        t.subItemName === item.name && 
                                        (t.assetName === asset.name || t.assetName.includes(asset.name))
                                    );

                                    return (
                                        <PositionCard 
                                            key={`${key}-${idx}`}
                                            subItem={item}
                                            trades={itemTrades}
                                            assetKey={key}
                                            subIndex={idx}
                                            tetherPrice={tetherPrice}
                                            onUpdateCurrentPrice={onUpdateCurrentPrice}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>
        </main>
    );
};