import React from 'react';
import { AppState } from '../types';
import { ArrowRight } from 'lucide-react';

interface TradesPageProps {
    state: AppState;
    onNavigate: (page: any) => void;
    onUpdateCurrentPrice: (assetKey: string, subIndex: number, price: number) => void;
}

export const TradesPage: React.FC<TradesPageProps> = ({ onNavigate }) => {
    return (
        <main className="w-full px-4 py-8 animate-in slide-in-from-bottom-4">
             <div className="flex items-center gap-3 mb-6">
                 <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowRight size={20} className="text-gray-600" />
                 </button>
                 <h2 className="text-xl font-black text-slate-800">مدیریت پوزیشن‌ها</h2>
            </div>
            
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 min-h-[300px]">
                <p className="text-slate-400 font-bold text-lg">این صفحه پاک شده است</p>
            </div>
        </main>
    );
};