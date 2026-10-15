import {
    Wallet,
    TrendingUp,
    Sparkles,
    Utensils,
    ShoppingBag,
    Coffee,
    Plane,
    Calendar,
    Receipt,
} from 'lucide-react';

const BalanceCard = () => (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-linear-to-br from-violet-500/25 via-slate-900 to-slate-950 p-5 text-slate-100 shadow-xl shadow-black/30">
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
        <div className="relative mb-4 flex items-center justify-between">
            <div className="text-xs font-medium text-slate-400">Total Balance</div>
            <Wallet size={16} className="text-violet-300" />
        </div>
        <div className="relative text-3xl font-bold tracking-tight">$12,547.30</div>
        <div className="relative mt-2 flex items-center gap-1.5 text-xs text-emerald-300">
            <TrendingUp size={11} />
            <span className="font-semibold">+8.2%</span>
            <span className="text-slate-400">this month</span>
        </div>
    </div>
);

const AIInsightCard = () => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 shadow-lg shadow-black/20">
        <div className="flex items-start gap-2.5">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-linear-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
            </div>
            <div className="min-w-0">
                <div className="mb-0.5 text-[10px] uppercase tracking-wider font-bold text-violet-300">
                    AI Insight
                </div>
                <div className="mb-0.5 text-xs font-semibold text-slate-100">Coffee budget alert</div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                    Cut 2 cups/week - save $32/mo
                </p>
            </div>
        </div>
    </div>
);

const BudgetProgressCard = () => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 shadow-md shadow-black/20">
        <div className="mb-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Utensils size={14} className="text-amber-300" />
            </div>
            <div>
                <div className="text-xs font-semibold text-slate-100">Food & Dining</div>
                <div className="text-[10px] text-slate-400">May 2026</div>
            </div>
        </div>
        <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-base font-bold text-slate-100">$320</span>
            <span className="text-[10px] text-slate-400">of $400</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-amber-400" style={{ width: '80%' }} />
        </div>
        <div className="mt-1.5 text-[10px] font-medium text-amber-300">80% used</div>
    </div>
);

const SubscriptionsCard = () => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 shadow-md shadow-black/20">
        <div className="mb-3 text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Subscriptions
        </div>
        <div className="space-y-2.5">
            {[
                { name: 'Netflix', cost: '$15.99', initial: 'N', color: 'bg-rose-500' },
                { name: 'Spotify', cost: '$10.99', initial: 'S', color: 'bg-emerald-500' },
                { name: 'iCloud+', cost: '$2.99', initial: 'i', color: 'bg-blue-500' },
            ].map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`h-7 w-7 rounded-lg ${s.color} flex items-center justify-center text-white text-[11px] font-bold`}>
                            {s.initial}
                        </div>
                        <span className="text-[11px] font-medium text-slate-100">{s.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300">{s.cost}</span>
                </div>
            ))}
        </div>
    </div>
);

const IncomeExpenseCard = () => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 shadow-md shadow-black/20">
        <div className="mb-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Income vs Expense
        </div>
        <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
                <div className="text-[10px] text-slate-400">Income</div>
                <div className="text-base font-bold text-violet-300">$6.3k</div>
            </div>
            <div>
                <div className="text-[10px] text-slate-400">Expense</div>
                <div className="text-base font-bold text-orange-300">$2.4k</div>
            </div>
        </div>
        <div className="flex h-10 items-end gap-1">
            {[55, 70, 45, 80, 65, 75].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                    <div className="rounded-sm bg-violet-400" style={{ height: `${h}%`, minHeight: '4px' }} />
                    <div className="rounded-sm bg-orange-400" style={{ height: `${h * 0.45}%`, minHeight: '2px' }} />
                </div>
            ))}
        </div>
    </div>
);

const MonthlySummaryCard = () => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 shadow-md shadow-black/20">
        <div className="mb-3 flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">May 2026</div>
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Healthy
            </span>
        </div>
        <div className="mb-1 text-2xl font-bold tracking-tight text-slate-100">$3,936</div>
        <div className="text-[10px] text-slate-400">Net this month</div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-linear-to-r from-violet-500 to-cyan-500" style={{ width: '62%' }} />
        </div>
        <div className="mt-1.5 text-[10px] text-slate-400">62% savings rate</div>
    </div>
);

const RecentTransactionsCard = () => (
    <div className="rounded-2xl border border-slate-800 bg-black/40 p-4 shadow-md shadow-black/20">
        <div className="mb-3 text-[10px] uppercase tracking-wider font-bold text-slate-400">Recent</div>
        <div className="space-y-2.5">
            {[
                { icon: ShoppingBag, color: 'bg-blue-500/15 text-blue-300', name: 'Whole Foods', amount: '-$87.00' },
                { icon: Coffee, color: 'bg-amber-500/15 text-amber-300', name: 'Starbucks', amount: '-$6.45' },
                { icon: TrendingUp, color: 'bg-emerald-500/15 text-emerald-300', name: 'Salary', amount: '+$5,500', positive: true },
            ].map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                        <div className={`h-7 w-7 shrink-0 rounded-lg ${t.color} flex items-center justify-center`}>
                            <t.icon size={12} />
                        </div>
                        <span className="truncate text-[11px] font-medium text-slate-100">{t.name}</span>
                    </div>
                    <span className={`text-[11px] font-semibold ${t.positive ? 'text-emerald-300' : 'text-slate-300'}`}>
                        {t.amount}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

const CategoryDonutCard = () => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 shadow-md shadow-black/20">
        <div className="mb-3 text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Top Categories
        </div>
        <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#4A3A2B" strokeWidth="6" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#FDBB14" strokeWidth="6" strokeDasharray="35 88" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#E58A14" strokeWidth="6" strokeDasharray="22 88" strokeDashoffset="-37" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#936E4D" strokeWidth="6" strokeDasharray="16 88" strokeDashoffset="-61" strokeLinecap="round" />
                </svg>
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
                {[
                    { name: 'Food', value: '$320', color: 'bg-violet-500' },
                    { name: 'Rent', value: '$1.8k', color: 'bg-orange-500' },
                    { name: 'Travel', value: '$240', color: 'bg-blue-500' },
                ].map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                            <div className={`h-1.5 w-1.5 rounded-full ${c.color}`} />
                            <span className="font-medium text-slate-400">{c.name}</span>
                        </div>
                        <span className="font-semibold text-slate-100">{c.value}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const SavingsGoalCard = () => (
    <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-emerald-500/15 via-slate-900 to-slate-950 p-4 shadow-md shadow-black/20">
        <div className="mb-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <Plane size={14} className="text-white" />
            </div>
            <div>
                <div className="text-xs font-semibold text-slate-100">Vacation Fund</div>
                <div className="text-[10px] text-slate-400">Goal: $5,000</div>
            </div>
        </div>
        <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-lg font-bold tracking-tight text-slate-100">$3,240</span>
            <span className="text-[10px] font-bold text-emerald-300">65%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-linear-to-r from-emerald-400 to-cyan-500" style={{ width: '65%' }} />
        </div>
    </div>
);

const UpcomingBillCard = () => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 shadow-md shadow-black/20">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-rose-500/15 flex items-center justify-center">
                <Calendar size={16} className="text-rose-300" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider font-bold text-rose-300">Due in 2 days</div>
                <div className="text-xs font-semibold text-slate-100">Rent payment</div>
            </div>
            <div className="text-sm font-bold text-slate-100">$1,800</div>
        </div>
    </div>
);

const PortfolioCard = () => (
    <div className="rounded-2xl bg-slate-950 p-4 text-slate-100 shadow-xl shadow-black/30 border border-slate-800">
        <div className="mb-3 flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Investments</div>
            <Receipt size={12} className="text-slate-500" />
        </div>
        <div className="mb-1 text-2xl font-bold tracking-tight">$8,420.55</div>
        <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-emerald-300">+$182.30</span>
            <span className="text-slate-500">today</span>
        </div>
        <div className="mt-3 h-10">
            <svg viewBox="0 0 100 30" className="h-full w-full" preserveAspectRatio="none">
                <path
                    d="M0,20 L15,18 L30,22 L45,15 L60,12 L75,8 L100,5"
                    stroke="#FDBB14"
                    strokeWidth="1.5"
                    fill="none"
                />
                <path
                    d="M0,20 L15,18 L30,22 L45,15 L60,12 L75,8 L100,5 L100,30 L0,30 Z"
                    fill="url(#sparkGradient)"
                />
                <defs>
                    <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FDBB14" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#FDBB14" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    </div>
);

const column1 = [
    <BalanceCard key="balance" />,
    <AIInsightCard key="ai" />,
    <BudgetProgressCard key="budget" />,
    <SubscriptionsCard key="subs" />,
    <IncomeExpenseCard key="incexp" />,
];

const column2 = [
    <MonthlySummaryCard key="monthly" />,
    <RecentTransactionsCard key="recent" />,
    <CategoryDonutCard key="cats" />,
    <SavingsGoalCard key="savings" />,
    <UpcomingBillCard key="bill" />,
    <PortfolioCard key="portfolio" />,
];

const scrollColumnA = [...column1, ...column2, ...column1];
const scrollColumnB = [...column2, ...column2, ...column1];
const scrollColumnC = [...column2, ...column1, ...column2];

const AuthHero = ({ headline, subheadline }) => (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(253,187,20,0.18),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(229,138,20,0.14),_transparent_24%)]" />

        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -inset-40 flex gap-4" style={{ transform: 'rotate(-7deg)' }}>
                <div className="flex-1 min-w-0">
                    <div style={{ animation: 'scrollUp 45s linear infinite' }}>
                        {scrollColumnA.map((card, i) => (
                            <div key={i} className="pb-4">
                                {card}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div style={{ animation: 'scrollDown 45s linear infinite' }}>
                        {scrollColumnB.map((card, i) => (
                            <div key={i} className="pb-4">
                                {card}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div style={{ animation: 'scrollUp 45s linear infinite' }}>
                        {scrollColumnC.map((card, i) => (
                            <div key={i} className="pb-4">
                                {card}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-64 bg-linear-to-b from-slate-950 via-slate-950/90 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-slate-950 via-slate-950/75 to-transparent pointer-events-none" />

        <div className="absolute top-10 left-10 z-30 max-w-[70%] xl:top-14 xl:left-14">
            <h1 className="mb-2 text-5xl font-normal tracking-tight text-slate-100 xl:text-6xl">
                {headline}
            </h1>
            <p className="text-base text-slate-400">{subheadline}</p>
        </div>
    </div>
);

export default AuthHero;
