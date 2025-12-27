import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { DashboardPage } from './components/Dashboard';
import { SettingsPage } from './components/Settings';
import { ProfitLossPage } from './components/ProfitLoss';
import { TradesPage } from './components/Trades';
import { ProjectionPage } from './components/Projection';
import { AddCapitalModal, AdjustValueModal, ManageAssetModal, SubItemManagerModal, SqlCodeModal } from './components/Modals';
import { AppState, Assets, TradeRecord, ProjectionSettings } from './types';
import { getTodayDate, formatCurrency } from './utils';
import { LogOut } from 'lucide-react';

const initialAppState: AppState = {
    isInitialized: false,
    currentPage: 'settings',
    totalCapital: 0,
    assets: {
        gold: { 
            name: 'طلا', 
            percentage: 20, 
            value: 0, 
            initialValue: 0,
            profitLoss: 0,
            subItems: [
                { name: 'سکه امامی', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 },
                { name: 'طلای آب‌شده', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 },
                { name: 'شمش طلا', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 },
                { name: 'نیم سکه', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 }
            ] 
        },
        stock: { 
            name: 'بورس ایران', 
            percentage: 20, 
            value: 0, 
            initialValue: 0,
            profitLoss: 0,
            subItems: [
                { name: 'فملی', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 },
                { name: 'فولاد', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 },
                { name: 'شپنا', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 },
                { name: 'وبصادر', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 }
            ] 
        },
        foreignStock: {
            name: 'سهام شرکت خارجی',
            percentage: 20, 
            value: 0, 
            initialValue: 0,
            profitLoss: 0,
            subItems: [
                { name: 'اپل (Apple)', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 },
                { name: 'تسلا (Tesla)', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 },
                { name: 'آمازون', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 },
                { name: 'مایکروسافت', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 }
            ]
        },
        crypto: { 
            name: 'ارز دیجیتال', 
            percentage: 20, 
            value: 0, 
            initialValue: 0,
            profitLoss: 0,
            subItems: [
                { name: 'بیت‌کوین', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 },
                { name: 'اتریوم', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 },
                { name: 'تتر', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 },
                { name: 'سولانا', value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 }
            ] 
        },
        cash: { 
            name: 'نقدینگی', 
            percentage: 20, 
            value: 0, 
            initialValue: 0,
            profitLoss: 0,
            subItems: []
        },
    },
    transactions: [],
    tradeHistory: [],
    projectionSettings: {
        baseCapital: 0,
        years: 5,
        monthlyContribution: 0,
        annualIncrease: 20,
        expectedReturns: {
            gold: 35,
            stock: 30,
            foreignStock: 25,
            crypto: 50,
            cash: 15
        }
    }
};

const App: React.FC = () => {
    const [session, setSession] = useState<any>(null);
    const [state, setState] = useState<AppState>(initialAppState);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Auth Session Management
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load Data from Supabase when Session Exists
    useEffect(() => {
        const loadData = async () => {
            if (!session?.user) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('user_portfolios')
                    .select('content')
                    .eq('id', session.user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error loading data:', error);
                }

                if (data && data.content) {
                    const parsed = data.content;
                    // Ensure migration safety similar to before
                    if (parsed && parsed.assets) {
                        if (!parsed.assets.foreignStock) {
                            parsed.assets.foreignStock = initialAppState.assets.foreignStock;
                            parsed.assets.foreignStock.percentage = 0; 
                        }
                        if (!parsed.tradeHistory) {
                            parsed.tradeHistory = [];
                        }
                        if (!parsed.projectionSettings) {
                            parsed.projectionSettings = initialAppState.projectionSettings;
                        }
                        setState(parsed);
                    }
                }
            } catch (e) {
                console.error("Exception loading data", e);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [session]);

    // Save Data to Supabase (Debounced)
    useEffect(() => {
        if (!session?.user || isLoading) return;

        const saveData = async () => {
            setIsSaving(true);
            try {
                const { error } = await supabase
                    .from('user_portfolios')
                    .upsert({
                        id: session.user.id,
                        content: state,
                        updated_at: new Date().toISOString()
                    });
                
                if (error) throw error;
            } catch (e) {
                console.error("Failed to save to Supabase", e);
            } finally {
                setIsSaving(false);
            }
        };

        const timeoutId = setTimeout(saveData, 2000); // 2-second debounce
        return () => clearTimeout(timeoutId);
    }, [state, session, isLoading]);


    // --- Actions ---

    const recalculatePercentages = (assets: Assets): Assets => {
        const totalValue = Object.values(assets).reduce((sum, asset) => sum + asset.value, 0);
        if (totalValue === 0) return assets;
        
        Object.keys(assets).forEach(key => {
            assets[key].percentage = Math.round((assets[key].value / totalValue) * 100);
        });
        
        const totalPct = Object.values(assets).reduce((sum, a) => sum + a.percentage, 0);
        if (totalPct !== 100) {
            assets.cash.percentage += (100 - totalPct);
        }
        return assets;
    };

    const distributeToSubItems = (asset: any) => {
        if (asset.subItems.length === 0) return;
        const equalShare = asset.value / asset.subItems.length;
        asset.subItems.forEach((sub: any) => sub.value = equalShare);
    };

    const handleSetInitialCapital = (amount: number) => {
        const newAssets = JSON.parse(JSON.stringify(state.assets));
        Object.keys(newAssets).forEach(key => {
            const val = (amount * newAssets[key].percentage) / 100;
            newAssets[key].value = val;
            newAssets[key].initialValue = val;
            distributeToSubItems(newAssets[key]);
        });

        setState(prev => ({
            ...prev,
            isInitialized: true,
            totalCapital: amount,
            currentPage: 'dashboard',
            assets: newAssets,
            transactions: [{ date: getTodayDate(), description: 'سرمایه اولیه', amount }]
        }));
    };

    const handleAddCapital = (amount: number) => {
        const newAssets = JSON.parse(JSON.stringify(state.assets));
        const investable = amount * 0.8;
        const cashPart = amount * 0.2;

        newAssets.cash.value += cashPart;
        newAssets.cash.initialValue += cashPart;

        const totalInvestablePct = 100 - newAssets.cash.percentage;
        Object.keys(newAssets).forEach(key => {
            if (key !== 'cash') {
                const share = (investable * newAssets[key].percentage) / totalInvestablePct;
                newAssets[key].value += share;
                newAssets[key].initialValue += share;
                distributeToSubItems(newAssets[key]);
            }
        });

        const newTotal = Object.values(newAssets).reduce((sum: number, a: any) => sum + a.value, 0);

        setState(prev => ({
            ...prev,
            totalCapital: newTotal as number,
            assets: newAssets,
            transactions: [...prev.transactions, { date: getTodayDate(), description: 'افزایش سرمایه', amount }]
        }));
        setActiveModal(null);
    };

    const handleUpdatePercentage = (key: string, newPct: number) => {
        if (key === 'cash') return;
        const currentAsset = state.assets[key];
        const diff = newPct - currentAsset.percentage;
        if (diff === 0) return;

        const newAssets = JSON.parse(JSON.stringify(state.assets));
        const valueChange = (state.totalCapital * diff) / 100;

        newAssets[key].percentage = newPct;
        newAssets[key].value += valueChange;
        newAssets[key].initialValue += valueChange;
        distributeToSubItems(newAssets[key]);

        newAssets.cash.percentage -= diff;
        newAssets.cash.value -= valueChange;
        newAssets.cash.initialValue -= valueChange;

        setState(prev => ({ ...prev, assets: newAssets }));
    };

    const handleAdjustValue = (key: string, newVal: number) => {
        const newAssets = JSON.parse(JSON.stringify(state.assets));
        const oldVal = newAssets[key].value;
        const diff = newVal - oldVal;

        newAssets[key].value = newVal;
        newAssets[key].profitLoss += diff;
        newAssets.cash.value -= diff; 

        const updated = recalculatePercentages(newAssets);
        if (updated[key].subItems.length > 0) distributeToSubItems(updated[key]);

        const newTotal = Object.values(updated).reduce((sum: number, a: any) => sum + a.value, 0);

        setState(prev => ({
            ...prev,
            totalCapital: newTotal as number,
            assets: updated,
            transactions: [...prev.transactions, { date: getTodayDate(), description: `تنظیم دستی ${state.assets[key].name}`, amount: Math.abs(diff) }]
        }));
    };

    const handleLiquidate = (key: string, pct: number) => {
        const newAssets = JSON.parse(JSON.stringify(state.assets));
        const valToLiquidate = (newAssets[key].value * pct) / 100;

        newAssets[key].value -= valToLiquidate;
        newAssets.cash.value += valToLiquidate;
        
        if (newAssets[key].subItems.length > 0) {
            distributeToSubItems(newAssets[key]);
        }
        
        const updated = recalculatePercentages(newAssets);
        const newTotal = Object.values(updated).reduce((sum: number, a: any) => sum + a.value, 0);

        setState(prev => ({
            ...prev,
            totalCapital: newTotal as number,
            assets: updated,
            transactions: [...prev.transactions, { date: getTodayDate(), description: `نقد کردن ${pct}% از ${state.assets[key].name}`, amount: valToLiquidate }]
        }));
    };

    const handleRecordPnL = (key: string, amount: number) => {
        const newAssets = JSON.parse(JSON.stringify(state.assets));
        newAssets[key].value += amount;
        newAssets[key].profitLoss += amount;
        
        const updated = recalculatePercentages(newAssets);
        const newTotal = Object.values(updated).reduce((sum: number, a: any) => sum + a.value, 0);

        setState(prev => ({
            ...prev,
            totalCapital: newTotal as number,
            assets: updated,
            transactions: [...prev.transactions, { 
                date: getTodayDate(), 
                description: `${amount >= 0 ? 'سود' : 'زیان'} ${state.assets[key].name}`, 
                amount: Math.abs(amount) 
            }]
        }));
    };

    const handleUpdateSubItemStats = (assetKey: string, subItemIndex: number, newAvgPrice: number, newQty: number) => {
        const newAssets = JSON.parse(JSON.stringify(state.assets));
        const currentItem = newAssets[assetKey].subItems[subItemIndex];
        
        if (!currentItem.currentPrice || currentItem.currentPrice === 0) {
            currentItem.currentPrice = newAvgPrice;
        }

        currentItem.averageBuyPrice = newAvgPrice;
        currentItem.quantity = newQty;
        setState(prev => ({ ...prev, assets: newAssets }));
    };

    const handleUpdateCurrentPrice = (assetKey: string, subItemIndex: number, price: number) => {
        const newAssets = JSON.parse(JSON.stringify(state.assets));
        newAssets[assetKey].subItems[subItemIndex].currentPrice = price;
        setState(prev => ({ ...prev, assets: newAssets }));
    };

    const handleRecordTrade = (record: TradeRecord) => {
        setState(prev => ({
            ...prev,
            tradeHistory: [...prev.tradeHistory, record]
        }));
    };

    const handleAddSubItem = (key: string, name: string) => {
        // Replaced prompt with direct argument passed from SettingsPage
        if(!name) return;
        const newAssets = JSON.parse(JSON.stringify(state.assets));
        newAssets[key].subItems.push({ name, value: 0, quantity: 0, averageBuyPrice: 0, currentPrice: 0 });
        if(newAssets[key].value > 0) distributeToSubItems(newAssets[key]);
        setState(prev => ({ ...prev, assets: newAssets }));
    };

    const handleRemoveSubItem = (key: string, idx: number) => {
        const newAssets = JSON.parse(JSON.stringify(state.assets));
        newAssets[key].subItems.splice(idx, 1);
        if(newAssets[key].subItems.length > 0) distributeToSubItems(newAssets[key]);
        setState(prev => ({ ...prev, assets: newAssets }));
    };

    const handleSaveProjection = (settings: ProjectionSettings) => {
        setState(prev => ({
            ...prev,
            projectionSettings: settings
        }));
    };

    // Manual Save/Load for backup (optional now, but kept for utility)
    const handleSave = () => {
        const dataStr = JSON.stringify(state, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-${getTodayDate().replace(/\//g, '-')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLoad = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loaded = JSON.parse(e.target?.result as string);
                if (loaded.assets && loaded.transactions) {
                    setState(loaded);
                    alert("اطلاعات با موفقیت بارگذاری شد (ذخیره خودکار در دیتابیس انجام خواهد شد)");
                }
            } catch (err) {
                alert("فایل معتبر نیست");
            }
        };
        reader.readAsText(file);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setState(initialAppState);
    };

    // --- Render ---

    if (!session) {
        return <Auth />;
    }

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">در حال دریافت اطلاعات از سرور...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen font-sans bg-gray-50 text-gray-800 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Sync Indicator */}
            <div className="fixed top-20 right-4 z-40">
                 {isSaving ? (
                     <div className="bg-white/80 backdrop-blur text-xs px-2 py-1 rounded-lg border border-indigo-100 text-indigo-500 flex items-center gap-1 shadow-sm">
                         <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                         در حال ذخیره...
                     </div>
                 ) : (
                     <div className="bg-white/50 backdrop-blur text-[10px] px-2 py-1 rounded-lg border border-emerald-100 text-emerald-600 flex items-center gap-1 shadow-sm opacity-50 hover:opacity-100 transition-opacity">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                         آنلاین
                     </div>
                 )}
            </div>

            <Header 
                totalCapital={state.totalCapital}
                currentPage={state.currentPage}
                onNavigate={(page) => setState(prev => ({ ...prev, currentPage: page }))}
                onAction={(action) => {
                    if (action === 'reset') {
                         if (confirm('آیا مطمئن هستید؟ همه اطلاعات پاک خواهد شد.')) {
                            // Reset state to initialAppState (which has isInitialized: false)
                            // This ensures the welcome/onboarding screen is shown
                             setState(initialAppState);
                        }
                    } else {
                        setActiveModal(action);
                    }
                }}
                onSave={handleSave}
                onLoad={handleLoad}
            />

            {/* Logout Button in Bottom Left or Top Left */}
            <div className="fixed bottom-4 left-4 z-40 md:top-20 md:left-4 md:bottom-auto">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100 text-rose-500 text-xs font-bold hover:bg-rose-50 transition-colors"
                >
                    <LogOut size={14} />
                    خروج از حساب
                </button>
            </div>

            {state.currentPage === 'dashboard' && state.isInitialized ? (
                <DashboardPage 
                    state={state} 
                    onManageAsset={(key) => {
                        setSelectedAssetForDetails(key);
                        setActiveModal('manage-subitems');
                    }}
                />
            ) : state.currentPage === 'trades' ? (
                <TradesPage 
                    state={state}
                    onNavigate={(p) => setState(prev => ({ ...prev, currentPage: p }))}
                    onUpdateCurrentPrice={handleUpdateCurrentPrice}
                />
            ) : state.currentPage === 'profit-loss' ? (
                <ProfitLossPage state={state} onRecordPnL={handleRecordPnL} onNavigate={(p) => setState(prev => ({ ...prev, currentPage: p }))} />
            ) : state.currentPage === 'projection' ? (
                <ProjectionPage 
                    state={state}
                    onNavigate={(p) => setState(prev => ({ ...prev, currentPage: p }))}
                    onSave={handleSaveProjection}
                />
            ) : (
                <SettingsPage 
                    state={state}
                    onSetInitialCapital={handleSetInitialCapital}
                    onUpdatePercentage={handleUpdatePercentage}
                    onAddSubItem={handleAddSubItem}
                    onRemoveSubItem={handleRemoveSubItem}
                    onNavigate={(p) => setState(prev => ({ ...prev, currentPage: p }))}
                />
            )}

            <AddCapitalModal 
                isOpen={activeModal === 'add-capital'} 
                onClose={() => setActiveModal(null)} 
                onCommit={handleAddCapital} 
            />
            <ManageAssetModal 
                isOpen={activeModal === 'manage-assets'} 
                onClose={() => setActiveModal(null)} 
                onCommit={handleLiquidate} 
                assets={state.assets} 
            />
            <AdjustValueModal 
                isOpen={activeModal === 'adjust-value'} 
                onClose={() => setActiveModal(null)} 
                onCommit={handleAdjustValue} 
                assets={state.assets} 
            />
            {selectedAssetForDetails && (
                <SubItemManagerModal
                    isOpen={activeModal === 'manage-subitems'}
                    onClose={() => {
                        setActiveModal(null);
                        setSelectedAssetForDetails(null);
                    }}
                    assetKey={selectedAssetForDetails}
                    asset={state.assets[selectedAssetForDetails]}
                    onUpdateSubItem={handleUpdateSubItemStats}
                    onRecordTrade={handleRecordTrade}
                />
            )}
            <SqlCodeModal 
                isOpen={activeModal === 'show-sql'}
                onClose={() => setActiveModal(null)}
            />
        </div>
    );
};

export default App;