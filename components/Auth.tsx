import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Copy, Check, Database, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ text: 'ثبت‌نام موفقیت‌آمیز بود! لطفا وارد شوید.', type: 'success' });
        setIsLogin(true);
      }
    } catch (error: any) {
      setMessage({ text: error.message || 'خطایی رخ داده است', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const sqlCode = `
-- جدول ذخیره اطلاعات پرتفوی کاربران
create table user_portfolios (
  id uuid references auth.users not null primary key,
  content jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- فعال‌سازی امنیت سطح ردیف (RLS)
alter table user_portfolios enable row level security;

-- سیاست برای خواندن اطلاعات خود کاربر
create policy "Users can read own portfolio" 
  on user_portfolios for select 
  using (auth.uid() = id);

-- سیاست برای ایجاد/آپدیت اطلاعات خود کاربر
create policy "Users can insert/update own portfolio" 
  on user_portfolios for insert 
  with check (auth.uid() = id);

create policy "Users can update own portfolio" 
  on user_portfolios for update
  using (auth.uid() = id);
  `.trim();

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-in fade-in">
      
      {/* SQL Header Section */}
      <div className="w-full max-w-3xl mb-8 bg-slate-800 text-slate-200 rounded-2xl overflow-hidden shadow-xl border border-slate-700">
        <div 
            className="p-4 flex items-center justify-between cursor-pointer bg-slate-900 hover:bg-slate-950 transition-colors"
            onClick={() => setShowSql(!showSql)}
        >
            <div className="flex items-center gap-2">
                <Database size={20} className="text-indigo-400" />
                <span className="font-bold text-sm">کد SQL مورد نیاز دیتابیس (برای راه‌اندازی اولیه)</span>
            </div>
            <span className="text-xs text-slate-400">{showSql ? 'بستن ▲' : 'مشاهده ▼'}</span>
        </div>
        
        {showSql && (
            <div className="p-4 bg-slate-800 relative">
                <pre className="text-[10px] md:text-xs font-mono text-emerald-400 overflow-x-auto p-4 bg-slate-900 rounded-xl border border-slate-700 dir-ltr text-left">
                    {sqlCode}
                </pre>
                <button 
                    onClick={copySql}
                    className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg"
                >
                    {sqlCopied ? <Check size={14} /> : <Copy size={14} />}
                    {sqlCopied ? 'کپی شد' : 'کپی SQL'}
                </button>
                <p className="mt-2 text-[10px] text-slate-400 text-right">
                    * این کد را در بخش SQL Editor داشبورد سوپابیس اجرا کنید تا جدول ذخیره‌سازی ساخته شود.
                </p>
            </div>
        )}
      </div>

      {/* Auth Card */}
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-indigo-50">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 mx-auto mb-4">
                <LogIn size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800">مدیریت سرمایه</h1>
            <p className="text-slate-500 mt-2 text-sm">لطفا برای دسترسی به اطلاعات خود وارد شوید</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-2 text-sm font-bold ${message.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">ایمیل</label>
            <input
              type="email"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700 font-bold text-center dir-ltr"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 mr-2">رمز عبور</label>
            <input
              type="password"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700 font-bold text-center dir-ltr"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'در حال پردازش...' : isLogin ? 'ورود به حساب' : 'ثبت نام'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
                setIsLogin(!isLogin);
                setMessage(null);
            }}
            className="text-indigo-500 font-bold text-sm hover:text-indigo-700 transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            {isLogin ? (
                <>
                    حساب کاربری ندارید؟ ثبت نام <UserPlus size={16} />
                </>
            ) : (
                <>
                    حساب دارید؟ ورود <LogIn size={16} />
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};