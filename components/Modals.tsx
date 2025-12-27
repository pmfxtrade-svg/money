import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Calculator, Save, ChevronDown, ChevronUp, Copy, Check, Database } from 'lucide-react';
import { Assets, Asset, TradeRecord } from '../types';
import { NumberInput } from './NumberInput';
import { formatCurrency, getTodayDate } from '../utils';

// --- Base Modal ---
const BaseModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode 
}> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all scale-100 animate-in zoom-in-95 duration-200 custom-scrollbar">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-black text-slate-800">{title}</h2>
                    <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 hover:text-gray-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Add Capital Modal ---
export const AddCapitalModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCommit: (amount: number) => void;
}> = ({ isOpen, onClose, onCommit }) => {
    const [amount, setAmount] = useState<number>(0);

    const handleSubmit = () => {
        if (amount > 0) {
            onCommit(amount);
            setAmount(0);
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="افزایش سرمایه">
            <div className="mb-6 bg-indigo-50 p-4 rounded-2xl text-indigo-800 text-sm">
                مبلغ جدید را وارد کنید. سیستم به صورت خودکار ۲۰٪ را به نقدینگی و مابقی را طبق الگوریتم پورتفو تقسیم می‌کند.
            </div>
            <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">مبلغ به تومان</label>
            <NumberInput
                value={amount === 0 ? '' : amount}
                onCommit={setAmount}
                className="w-full px-4 py-4 border-2 border-indigo-100 rounded-2xl mb-8 text-center text-xl font-mono font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                placeholder="مثال: ۵,۰۰۰,۰۰۰"
                autoFocus
            />
            <button onClick={handleSubmit} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                افزودن سرمایه
                <ArrowRight size={18} />
            </button>
        </BaseModal>
    );
};

// --- Adjust Value Modal ---
export const AdjustValueModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCommit: (assetKey: string, newValue: number) => void;
    assets: Assets;
}> = ({ isOpen, onClose, onCommit, assets }) => {
    const [selectedAsset, setSelectedAsset] = useState<string>('');
    const [newValue, setNewValue] = useState<number>(0);

    useEffect(() => {
        if (isOpen) {
            setSelectedAsset('');
            setNewValue(0);
        }
    }, [isOpen]);

    const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const key = e.target.value;
        setSelectedAsset(key);
        if (key && assets[key]) {
            setNewValue(assets[key].value);
        }
    };

    const handleCommit = () => {
        if (selectedAsset && newValue >= 0) {
            onCommit(selectedAsset, newValue);
            onClose();
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="تنظیم ارزش دارایی">
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">انتخاب دارایی</label>
                    <div className="relative">
                        <select
                            value={selectedAsset}
                            onChange={handleAssetChange}
                            className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl appearance-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                        >
                            <option value="" disabled>انتخاب کنید...</option>
                            {Object.keys(assets).map(key => (
                                <option key={key} value={key}>{assets[key].name}</option>
                            ))}
                        </select>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                </div>
                
                {selectedAsset && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between mb-2 px-2">
                             <label className="text-xs font-bold text-slate-400">ارزش جدید (تومان)</label>
                             <span className="text-xs text-indigo-500 font-mono">فعلی: {formatCurrency(assets[selectedAsset].value)}</span>
                        </div>
                       
                        <NumberInput
                            value={newValue}
                            onCommit={setNewValue}
                            className="w-full px-4 py-4 border-2 border-slate-200 rounded-2xl text-center text-xl font-mono font-bold focus:border-indigo-500 outline-none transition-all"
                            placeholder="مقدار جدید"
                        />
                    </div>
                )}

                <button 
                    onClick={handleCommit} 
                    disabled={!selectedAsset}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    ثبت تغییرات
                </button>
            </div>
        </BaseModal>
    );
};

// --- Manage/Liquidate Modal ---
export const ManageAssetModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCommit: (assetKey: string, percentage: number) => void;
    assets: Assets;
}> = ({ isOpen, onClose, onCommit, assets }) => {
    const [selectedAsset, setSelectedAsset] = useState<string>('');
    const [percent, setPercent] = useState<number>(10);

    const assetOptions = Object.keys(assets).filter(k => k !== 'cash');

    const handleCommit = () => {
        if (selectedAsset) {
            onCommit(selectedAsset, percent);
            onClose();
        }
    };

    const calculateLiquidationAmount = () => {
        if(!selectedAsset) return 0;
        return (assets[selectedAsset].value * percent) / 100;
    }

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="نقد کردن دارایی">
            <div className="space-y-6">
                <div>
                     <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">دارایی جهت فروش</label>
                    <div className="relative">
                        <select
                            value={selectedAsset}
                            onChange={(e) => setSelectedAsset(e.target.value)}
                            className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl appearance-none focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700"
                        >
                            <option value="" disabled>انتخاب کنید...</option>
                            {assetOptions.map(key => (
                                <option key={key} value={key}>{assets[key].name}</option>
                            ))}
                        </select>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                    <div className="flex justify-between mb-4">
                        <span className="text-sm font-bold text-slate-700">درصد فروش</span>
                        <span className="text-xl font-black text-orange-600 font-mono">{percent}%</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={percent}
                        onChange={(e) => setPercent(parseInt(e.target.value))}
                        className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    {selectedAsset && (
                         <div className="mt-6 pt-4 border-t border-orange-200 flex justify-between items-center animate-in fade-in">
                            <span className="text-xs text-orange-800 font-bold">مبلغ دریافتی:</span>
                            <span className="font-mono font-bold text-lg text-orange-700">{formatCurrency(calculateLiquidationAmount())}</span>
                         </div>
                    )}
                </div>

                <button 
                    onClick={handleCommit} 
                    disabled={!selectedAsset}
                    className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 shadow-xl shadow-orange-200 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    تایید و فروش
                </button>
            </div>
        </BaseModal>
    );
};

// --- SubItem Manager Modal ---
export const SubItemManagerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    assetKey: string;
    asset: Asset;
    onUpdateSubItem: (assetKey: string, subIndex: number, avgPrice: number, qty: number) => void;
    onRecordTrade: (record: TradeRecord) => void;
}> = ({ isOpen, onClose, assetKey, asset, onUpdateSubItem, onRecordTrade }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // Temp states for inputs
    const [buyPriceInput, setBuyPriceInput] = useState<number>(0);
    const [buyQtyInput, setBuyQtyInput] = useState<number>(0);
    const [buyTotalInput, setBuyTotalInput] = useState<number>(0);

    const toggleExpand = (index: number) => {
        if (expandedIndex === index) {
            setExpandedIndex(null);
            setBuyPriceInput(0);
            setBuyQtyInput(0);
            setBuyTotalInput(0);
        } else {
            setExpandedIndex(index);
            setBuyPriceInput(0);
            setBuyQtyInput(0);
            setBuyTotalInput(0);
        }
    };

    const handleQtyChange = (val: number) => {
        setBuyQtyInput(val);
        if (buyPriceInput > 0) {
            setBuyTotalInput(val * buyPriceInput);
        }
    };

    const handlePriceChange = (val: number) => {
        setBuyPriceInput(val);
        if (buyQtyInput > 0) {
            setBuyTotalInput(val * buyQtyInput);
        }
    };

    const handleTotalChange = (val: number) => {
        setBuyTotalInput(val);
        // Reverse calculation: Unit Price = Total / Qty
        if (buyQtyInput > 0) {
            setBuyPriceInput(val / buyQtyInput);
        }
    };

    const handleAddPurchase = (index: number, currentAvg: number, currentQty: number, itemName: string) => {
        // Validation: Needs Qty AND (Price OR Total)
        if (buyQtyInput <= 0 || (buyPriceInput <= 0 && buyTotalInput <= 0)) return;

        // Ensure consistency before saving (Use Total Input if Price is 0/derived)
        const finalTotalCost = buyTotalInput > 0 ? buyTotalInput : (buyPriceInput * buyQtyInput);
        const finalUnitPrice = buyPriceInput > 0 ? buyPriceInput : (finalTotalCost / buyQtyInput);

        const totalCurrentCost = currentAvg * currentQty;
        const totalNewCost = finalTotalCost;
        const newQty = currentQty + buyQtyInput;
        
        const newAvg = (totalCurrentCost + totalNewCost) / newQty;

        // 1. Update Sub Item Stats
        onUpdateSubItem(assetKey, index, newAvg, newQty);

        // 2. Record Trade History
        onRecordTrade({
            id: Date.now().toString(),
            date: getTodayDate(),
            assetName: asset.name,
            subItemName: itemName,
            type: 'buy',
            quantity: buyQtyInput,
            unitPrice: finalUnitPrice,
            totalCost: totalNewCost
        });

        setBuyPriceInput(0);
        setBuyQtyInput(0);
        setBuyTotalInput(0);
        alert('خرید با موفقیت ثبت شد و به لیست معاملات اضافه گردید.');
    };

    const handleDirectUpdate = (index: number, newAvg: number, newQty: number) => {
        onUpdateSubItem(assetKey, index, newAvg, newQty);
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={`مدیریت ${asset.name}`}>
            <div className="space-y-4">
                {asset.subItems.length === 0 && (
                     <div className="text-center text-slate-400 py-8">زیرمجموعه‌ای وجود ندارد. ابتدا از تنظیمات اضافه کنید.</div>
                )}
                
                {asset.subItems.map((item, idx) => {
                    const isExpanded = expandedIndex === idx;
                    const avgPrice = item.averageBuyPrice || 0;
                    const qty = item.quantity || 0;

                    return (
                        <div key={idx} className={`border rounded-2xl transition-all ${isExpanded ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                            <div 
                                onClick={() => toggleExpand(idx)}
                                className="flex justify-between items-center p-4 cursor-pointer"
                            >
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-slate-800">{item.name}</span>
                                    <div className="flex gap-3 text-[10px] text-slate-500 mt-1">
                                        <span>تعداد: <span className="font-mono text-slate-700">{qty}</span></span>
                                        <span>میانگین: <span className="font-mono text-slate-700">{formatCurrency(avgPrice)}</span></span>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp size={20} className="text-indigo-500" /> : <ChevronDown size={20} className="text-slate-400" />}
                            </div>

                            {isExpanded && (
                                <div className="p-4 pt-0 border-t border-indigo-100 animate-in slide-in-from-top-2">
                                    
                                    {/* Calculator Section */}
                                    <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm mt-3">
                                        <div className="flex items-center gap-2 mb-3 text-indigo-700 text-xs font-bold">
                                            <Calculator size={14} />
                                            افزودن خرید جدید (محاسبه خودکار میانگین)
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-bold block mb-1">تعداد خرید</label>
                                                <NumberInput 
                                                    value={buyQtyInput === 0 ? '' : buyQtyInput} 
                                                    onCommit={handleQtyChange} 
                                                    className="w-full p-2 border rounded-lg text-center font-mono text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                                                    placeholder="مثال: ۵۰"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-bold block mb-1">قیمت واحد خرید</label>
                                                <NumberInput 
                                                    value={buyPriceInput === 0 ? '' : buyPriceInput} 
                                                    onCommit={handlePriceChange} 
                                                    className="w-full p-2 border rounded-lg text-center font-mono text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                                                    placeholder="مثال: ۱۰۰۰"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] text-slate-400 font-bold block mb-1">ارزش کل خرید (تومان)</label>
                                                <NumberInput 
                                                    value={buyTotalInput === 0 ? '' : buyTotalInput} 
                                                    onCommit={handleTotalChange} 
                                                    className="w-full p-2 border rounded-lg text-center font-mono text-sm bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                                                    placeholder="مثال: ۵,۰۰۰,۰۰۰"
                                                />
                                                <p className="text-[9px] text-slate-400 mt-1 mr-1">
                                                    * با وارد کردن ارزش کل، قیمت واحد به صورت خودکار محاسبه می‌شود (مناسب برای خرید کمتر از ۱ واحد)
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleAddPurchase(idx, avgPrice, qty, item.name)}
                                            disabled={buyQtyInput <= 0 || (buyPriceInput <= 0 && buyTotalInput <= 0)}
                                            className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-100"
                                        >
                                            ثبت خرید و آپدیت میانگین
                                        </button>
                                    </div>

                                    {/* Direct Edit Section */}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                         <p className="text-[10px] text-slate-400 font-bold mb-2">ویرایش دستی مقادیر فعلی (بدون ثبت در تاریخچه)</p>
                                         <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-500 whitespace-nowrap">تعداد کل:</span>
                                                <NumberInput 
                                                    value={qty} 
                                                    onCommit={(v) => handleDirectUpdate(idx, avgPrice, v)}
                                                    className="w-full p-1.5 border border-slate-200 rounded text-center font-mono text-xs"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-500 whitespace-nowrap">میانگین:</span>
                                                <NumberInput 
                                                    value={avgPrice} 
                                                    onCommit={(v) => handleDirectUpdate(idx, v, qty)}
                                                    className="w-full p-1.5 border border-slate-200 rounded text-center font-mono text-xs"
                                                />
                                            </div>
                                         </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </BaseModal>
    );
};

// --- SQL Code Modal ---
export const SqlCodeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);

    const sqlCode = `-- جدول ذخیره پورتفوی کاربران
create table user_portfolios (
  id uuid references auth.users not null primary key,
  content jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- فعال‌سازی امنیت سطح ردیف (RLS)
alter table user_portfolios enable row level security;

-- ایجاد قوانین دسترسی (Policies)
create policy "Users can delete their own portfolio." on user_portfolios for delete using (auth.uid() = id);
create policy "Users can insert their own portfolio." on user_portfolios for insert with check (auth.uid() = id);
create policy "Users can select their own portfolio." on user_portfolios for select using (auth.uid() = id);
create policy "Users can update their own portfolio." on user_portfolios for update using (auth.uid() = id);`;

    const handleCopy = () => {
        navigator.clipboard.writeText(sqlCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="کد SQL دیتابیس">
            <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-xl text-xs text-indigo-800 leading-relaxed border border-indigo-100">
                    این کد را در بخش <span className="font-bold font-mono">SQL Editor</span> داشبورد Supabase اجرا کنید تا جداول مورد نیاز ساخته شوند.
                </div>
                
                <div className="relative group">
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[10px] font-mono overflow-x-auto text-left dir-ltr custom-scrollbar border border-slate-800">
                        {sqlCode}
                    </pre>
                    <button 
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
                        title="کپی کردن"
                    >
                        {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                </div>

                <div className="flex justify-end">
                     <button onClick={onClose} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-colors">
                        بستن
                     </button>
                </div>
            </div>
        </BaseModal>
    );
};