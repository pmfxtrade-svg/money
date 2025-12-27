import React, { useState } from 'react';
import { Plus, Trash, LayoutDashboard, Check, X } from 'lucide-react';
import { AppState } from '../types';
import { NumberInput } from './NumberInput';
import { formatCurrency } from '../utils';

interface SettingsProps {
    state: AppState;
    onSetInitialCapital: (amount: number) => void;
    onUpdatePercentage: (key: string, pct: number) => void;
    onAddSubItem: (key: string, name: string) => void;
    onRemoveSubItem: (key: string, index: number) => void;
    onNavigate: (page: any) => void;
}

export const SettingsPage: React.FC<SettingsProps> = ({
    state,
    onSetInitialCapital,
    onUpdatePercentage,
    onAddSubItem,
    onRemoveSubItem,
    onNavigate
}) => {
    const [initCap, setInitCap] = useState<number>(0);
    const [addingToKey, setAddingToKey] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState('');

    const handleStartAdd = (key: string) => {
        setAddingToKey(key);
        setNewItemName('');
    };

    const handleCancelAdd = () => {
        setAddingToKey(null);
        setNewItemName('');
    };

    const handleConfirmAdd = (key: string) => {
        if (newItemName.trim()) {
            onAddSubItem(key, newItemName.trim());
            setAddingToKey(null);
            setNewItemName('');
        }
    };

    // MODE 1: ONBOARDING / WELCOME SCREEN
    if (!state.isInitialized) {
        return (
            <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 animate-in fade-in duration-500">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 overflow-hidden w-full max-w-xl border border-indigo-50">
                    <div className="bg-indigo-600 p-8 md:p-10 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                        
                        <h2 className="text-3xl font-black text-white mb-3 relative z-10">خوش آمدید 👋</h2>
                        <p className="text-indigo-100 relative z-10 text-sm md:text-base">برای شروع مدیریت هوشمند دارایی‌های خود، لطفا سرمایه اولیه را وارد کنید.</p>
                    </div>
                    <div className="p-8 md:p-10">
                        <label className="block text-sm font-bold text-slate-500 mb-3 text-center">سرمایه کل به تومان</label>
                        <div className="relative max-w-sm mx-auto mb-8">
                            <NumberInput
                                value={initCap}
                                onCommit={setInitCap}
                                className="w-full px-6 py-4 border-2 border-indigo-100 rounded-2xl text-center text-2xl font-black font-mono focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 placeholder:text-slate-300"
                                placeholder="۰"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={() => onSetInitialCapital(initCap)}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:translate-y-0"
                        >
                            شروع کنید
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    // MODE 2: SETTINGS SCREEN
    return (
        <main className="container mx-auto p-4 md:p-6 pb-20 max-w-[120rem] animate-in slide-in-from-bottom-4 duration-500">
            {/* Asset Configuration */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">پیکربندی پورتفو</h2>
                        <p className="text-sm text-slate-500 mt-1">درصد هدف هر دارایی و زیرمجموعه‌های آن را مدیریت کنید</p>
                    </div>
                    {state.isInitialized && (
                         <button 
                            onClick={() => onNavigate('dashboard')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold transition-colors"
                        >
                            <LayoutDashboard size={18} />
                            داشبورد
                        </button>
                    )}
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {Object.keys(state.assets).map(key => {
                        const asset = state.assets[key];
                        const isCash = key === 'cash';

                        return (
                            <div key={key} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                {/* Decorative colored bar */}
                                <div className={`absolute top-0 right-0 w-1.5 h-full ${
                                    key === 'gold' ? 'bg-amber-400' : 
                                    key === 'stock' ? 'bg-emerald-500' : 
                                    key === 'foreignStock' ? 'bg-cyan-500' :
                                    key === 'crypto' ? 'bg-violet-500' : 'bg-blue-500'
                                }`}></div>

                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Left: Percent Control */}
                                    <div className="lg:w-1/3 flex flex-col justify-center border-b lg:border-b-0 lg:border-l border-slate-100 pb-6 lg:pb-0 lg:pl-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <h3 className="text-xl font-black text-slate-800">{asset.name}</h3>
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                                key === 'gold' ? 'bg-amber-100 text-amber-700' : 
                                                key === 'stock' ? 'bg-emerald-100 text-emerald-700' : 
                                                key === 'foreignStock' ? 'bg-cyan-100 text-cyan-700' :
                                                key === 'crypto' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {asset.percentage}%
                                            </span>
                                        </div>
                                        
                                        <div className="relative pt-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={asset.percentage}
                                                onChange={(e) => onUpdatePercentage(key, parseInt(e.target.value))}
                                                disabled={isCash}
                                                className={`w-full h-3 rounded-full appearance-none cursor-pointer ${
                                                    isCash ? 'bg-slate-100' : 'bg-slate-100'
                                                } [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110`}
                                            />
                                            {isCash && <p className="text-xs text-slate-400 mt-2 text-center">درصد نقدینگی به صورت خودکار محاسبه می‌شود</p>}
                                        </div>
                                    </div>

                                    {/* Right: Subitems */}
                                    {!isCash && (
                                        <div className="lg:w-2/3">
                                            <div className="flex justify-between items-center mb-4 min-h-[40px]">
                                                <h4 className="text-sm font-bold text-slate-500">زیرمجموعه‌های دارایی</h4>
                                                
                                                {addingToKey === key ? (
                                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                                        <input 
                                                            autoFocus
                                                            type="text" 
                                                            placeholder="نام دارایی جدید..."
                                                            className="px-3 py-1.5 border border-indigo-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100 w-48"
                                                            value={newItemName}
                                                            onChange={(e) => setNewItemName(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmAdd(key)}
                                                        />
                                                        <button 
                                                            onClick={() => handleConfirmAdd(key)}
                                                            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={handleCancelAdd}
                                                            className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleStartAdd(key)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                        افزودن جدید
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {asset.subItems.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {asset.subItems.map((sub, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 px-4 rounded-xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                                                            <span className="font-bold text-slate-700 text-sm">{sub.name}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-slate-400 text-xs font-mono">{formatCurrency(sub.value)}</span>
                                                                <button 
                                                                    onClick={() => onRemoveSubItem(key, idx)}
                                                                    className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                                                >
                                                                    <Trash size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                    <p className="text-sm text-slate-400">هنوز زیرمجموعه‌ای تعریف نشده است</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                     {isCash && (
                                        <div className="lg:w-2/3 flex items-center justify-center">
                                            <p className="text-slate-400 text-sm italic">مدیریت نقدینگی و حساب‌های بانکی</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
};