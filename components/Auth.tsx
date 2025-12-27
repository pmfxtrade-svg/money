import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-in fade-in">
      
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