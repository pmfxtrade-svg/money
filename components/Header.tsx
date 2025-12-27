import React, { useRef } from 'react';
import { LayoutDashboard, Wallet, TrendingUp, Settings, Save, Upload, Trash2, PlusCircle, Calculator, Menu, History } from 'lucide-react';

interface HeaderProps {
    totalCapital: number;
    currentPage: string;
    onNavigate: (page: any) => void;
    onAction: (action: string) => void;
    onSave: () => void;
    onLoad: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    currentPage, 
    onNavigate, 
    onAction, 
    onSave, 
    onLoad 
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onLoad(file);
        }
        event.target.value = '';
    };

    const navItems = [
        { key: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard size={20} /> },
        { key: 'trades', label: 'معاملات', icon: <History size={20} /> },
        { key: 'profit-loss', label: 'سود و زیان', icon: <TrendingUp size={20} /> },
        { key: 'settings', label: 'تنظیمات', icon: <Settings size={20} /> },
    ];

    const actionButtons = [
        { key: 'add-capital', label: 'افزایش', icon: <PlusCircle size={18} />, color: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200' },
        { key: 'manage-assets', label: 'نقد کردن', icon: <Wallet size={18} />, color: 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200' },
        { key: 'adjust-value', label: 'تنظیم', icon: <Calculator size={18} />, color: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="container mx-auto max-w-[120rem] px-4 md:px-6 h-16 flex items-center justify-between">
                {/* Logo / Title */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <TrendingUp size={20} strokeWidth={3} />
                    </div>
                    <h1 className="text-lg font-black text-slate-800 tracking-tight hidden md:block">مدیریت سرمایه</h1>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl">
                    {navItems.map(item => (
                        <button
                            key={item.key}
                            onClick={() => onNavigate(item.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                currentPage === item.key 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Actions & Tools */}
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center gap-2 mr-2 border-l border-gray-200 pl-4 ml-2">
                         {actionButtons.map(btn => (
                            <button
                                key={btn.key}
                                onClick={() => onAction(btn.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-opacity-20 hover:-translate-y-0.5 ${btn.color}`}
                            >
                                {btn.icon}
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1">
                        <button onClick={onSave} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="ذخیره">
                            <Save size={20} />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="بارگذاری">
                            <Upload size={20} />
                        </button>
                        <button onClick={() => onAction('reset')} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="پاک کردن">
                            <Trash2 size={20} />
                        </button>
                    </div>

                     {/* Mobile Menu Button */}
                     <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 p-4 shadow-lg absolute w-full left-0 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {navItems.map(item => (
                            <button
                                key={item.key}
                                onClick={() => { onNavigate(item.key); setIsMenuOpen(false); }}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium border ${
                                    currentPage === item.key ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-100 text-gray-600'
                                }`}
                            >
                                {item.icon} {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 mb-2">عملیات سریع</p>
                        {actionButtons.map(btn => (
                            <button
                                key={btn.key}
                                onClick={() => { onAction(btn.key); setIsMenuOpen(false); }}
                                className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold text-white ${btn.color.split(' ')[0]}`}
                            >
                                {btn.icon} {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />
        </header>
    );
};