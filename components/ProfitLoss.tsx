import React, { useState } from 'react';
import { AppState, Asset } from '../types';
import { NumberInput } from './NumberInput';
import { formatCurrency, parseInputNumber, formatForDisplay } from '../utils';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface ProfitLossProps {
    state: AppState;
    onRecordPnL: (assetKey: string, amount: number) => void;
    onNavigate: (page: any) => void;
}

const PnLCard: React.FC<{ 
    assetKey: string; 
    asset: Asset; 
    onRecord: (amount: number) => void 
}> = ({ assetKey, asset, onRecord }) => {
    const [val, setVal] = useState<number | string>('');
    const [mode, setMode] = useState<'percent' | 'amount'>('percent');

    const calculatedAmount = () => {
        const num = parseInputNumber(val);
        if (mode === 'percent') {
            return (asset.value * num) / 100;
        }
        return num;
    };

    const amount = calculatedAmount();
    const isProfit = amount >= 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
            <div className={`h-2 w-full ${
                assetKey === 'gold' ? 'bg-yellow-400' : 
                assetKey === 'stock' ? 'bg-green-500' : 
                assetKey === 'foreignStock' ? 'bg-cyan-500' : 'bg-purple-500'
            }`}></div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{asset.name}</h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">ارزش فعلی: {formatCurrency(asset.value)}</p>
                    </div>
                    <div className={`p-2 rounded-full bg-gray-50`}>
                        {isProfit ? <TrendingUp size={20} className="text-green-500" /> : <TrendingDown size={20} className="text-red-500" />}
                    </div>
                </div>

                <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                    <button 
                        onClick={() => setMode('percent')} 
                        className={`flex-1 py-1.5 text-sm rounded-md transition-all ${mode === 'percent' ? 'bg-white shadow-sm text-gray-800 font-bold' : 'text-gray-500'}`}
                    >
                        درصد (%)
                    </button>
                    <button 
                        onClick={() => setMode('amount')} 
                        className={`flex-1 py-1.5 text-sm rounded-md transition-all ${mode === 'amount' ? 'bg-white shadow-sm text-gray-800 font-bold' : 'text-gray-500'}`}
                    >
                        مبلغ (تومان)
                    </button>
                </div>

                <div className="relative mb-4">
                    <NumberInput
                        value={val}
                        onCommit={(v) => setVal(v)}
                        placeholder={mode === 'percent' ? "مثال: ۵" : "مثال: ۵۰۰,۰۰۰"}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-center font-mono text-lg outline-none transition-colors ${
                            val && amount < 0 ? 'border-red-100 focus:border-red-500 text-red-600' : 
                            val ? 'border-green-100 focus:border-green-500 text-green-600' : 'border-gray-100 focus:border-gray-400'
                        }`}
                    />
                     {val !== '' && (
                        <div className={`mt-2 text-center text-sm font-medium ${amount >= 0 ? 'text-green-600' : 'text-red-600'} bg-gray-50 py-2 rounded-lg`}>
                            {amount >= 0 ? 'سود پیش‌بینی شده: ' : 'زیان پیش‌بینی شده: '}
                            <span className="font-bold font-mono dir-ltr inline-block">{formatCurrency(Math.abs(amount))}</span>
                        </div>
                    )}
                </div>

                <button
                    disabled={!val || amount === 0}
                    onClick={() => {
                        onRecord(amount);
                        setVal('');
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                        amount >= 0 
                        ? 'bg-green-500 hover:bg-green-600 shadow-green-200' 
                        : 'bg-red-500 hover:bg-red-600 shadow-red-200'
                    } disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed`}
                >
                    ثبت {amount >= 0 ? 'سود' : 'زیان'}
                </button>
            </div>
        </div>
    );
};

export const ProfitLossPage: React.FC<ProfitLossProps> = ({ state, onRecordPnL, onNavigate }) => {
    return (
        <main className="container mx-auto p-4 md:p-6 pb-20 max-w-[120rem]">
             <div className="flex items-center gap-2 mb-8">
                 <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowRight size={20} className="text-gray-600" />
                 </button>
                <h2 className="text-2xl font-bold text-gray-800">ثبت سود و زیان دوره</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.keys(state.assets)
                    .filter(key => key !== 'cash')
                    .map(key => (
                        <PnLCard 
                            key={key} 
                            assetKey={key} 
                            asset={state.assets[key]} 
                            onRecord={(amt) => onRecordPnL(key, amt)} 
                        />
                    ))
                }
            </div>
        </main>
    );
};