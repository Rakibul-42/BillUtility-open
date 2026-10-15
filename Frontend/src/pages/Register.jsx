import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Wallet, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthHero from '../components/AuthHero.jsx';
import Spinner from '../components/Spinner.jsx';

const CURRENCIES = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
];

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        currency: 'USD',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            toast.success('Account created!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-950 text-slate-100">
            <div className="relative flex-1 flex flex-col px-6 sm:px-10 lg:px-14 py-8 order-1 overflow-hidden">
                <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-16 right-8 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="flex justify-start items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-linear-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                        <Wallet size={18} className="text-slate-950" />
                    </div>
                    <span className="font-bold text-xl text-slate-100">BillUtilityAi</span>
                </div>

                <div className="relative flex-1 flex items-center justify-center py-10">
                    <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl shadow-black/30 backdrop-blur">
                        <h2 className="text-4xl font-bold text-slate-100 tracking-tight mb-2">Sign Up</h2>
                        <p className="text-slate-400 mb-10">Create your account in seconds</p>

                        <form onSubmit={onSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Name</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full rounded-2xl border-2 border-slate-800 bg-slate-900/80 px-5 py-4 text-sm text-slate-100 placeholder:text-slate-500 transition hover:bg-slate-900 focus:border-violet-500 focus:outline-none"
                                    placeholder="Alex"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full rounded-2xl border-2 border-slate-800 bg-slate-900/80 px-5 py-4 text-sm text-slate-100 placeholder:text-slate-500 transition hover:bg-slate-900 focus:border-violet-500 focus:outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="w-full rounded-2xl border-2 border-slate-800 bg-slate-900/80 px-5 py-4 pr-12 text-sm text-slate-100 placeholder:text-slate-500 transition hover:bg-slate-900 focus:border-violet-500 focus:outline-none"
                                        placeholder="At least 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Currency</label>
                                <div className="relative">
                                    <select
                                        value={form.currency}
                                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                        className="w-full appearance-none rounded-2xl border-2 border-slate-800 bg-slate-900/80 px-5 py-4 pr-12 text-sm text-slate-100 transition hover:bg-slate-900 focus:border-violet-500 focus:outline-none cursor-pointer"
                                    >
                                        {CURRENCIES.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={18}
                                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-violet-400 to-violet-600 py-4 font-semibold text-slate-950 shadow-lg shadow-violet-500/30 transition hover:brightness-110 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-violet-300 transition hover:text-violet-200">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="flex justify-start gap-6 text-xs text-slate-500">
                    <a className="cursor-pointer transition hover:text-slate-100">Privacy Policy</a>
                    <a className="cursor-pointer transition hover:text-slate-100">Terms</a>
                    <a className="cursor-pointer transition hover:text-slate-100">FAQ</a>
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] order-2">
                <AuthHero headline="Begin" subheadline="your financial journey" />
            </div>
        </div>
    );
};

export default Register;
