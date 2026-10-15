import { useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Check,
    AlertCircle,
    Lightbulb,
    TrendingUp,
    AlertTriangle,
    Sparkles,
    ArrowRight,
} from 'lucide-react';
import { timeAgo } from '../utils/format.js';

const labelMap = {
    monthly_summary: 'Monthly Summary',
    budget_alert: 'Budget Alert',
    savings_tips: 'Savings Tips',
};

const typeStyles = {
    monthly_summary: { gradient: 'from-violet-500 to-cyan-500', Icon: TrendingUp },
    budget_alert: { gradient: 'from-rose-500 to-orange-500', Icon: AlertTriangle },
    savings_tips: { gradient: 'from-blue-500 to-violet-500', Icon: Lightbulb },
};

const HealthScoreGauge = ({ score = 0 }) => {
    const safe = Math.max(0, Math.min(100, Number(score) || 0));
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (safe / 100) * circumference;
    const color = safe >= 70 ? '#34d399' : safe >= 40 ? '#fbbf24' : '#fb7185';
    const label = safe >= 70 ? 'Healthy' : safe >= 40 ? 'Watch' : 'Risky';

    return (
        <div className="relative h-36 w-36 shrink-0">
            <svg className="-rotate-90 h-full w-full" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} stroke="#4A3A2B" strokeWidth="10" fill="none" />
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke={color}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold tracking-tight text-slate-100">{safe}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
                    {label}
                </div>
            </div>
        </div>
    );
};

const Stat = ({ label, value, accent = 'slate' }) => {
    const accents = {
        emerald: 'text-emerald-300',
        rose: 'text-rose-300',
        violet: 'text-violet-300',
        amber: 'text-amber-300',
        slate: 'text-slate-100',
    };
    return (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
            <div className="mb-1 text-xs font-medium text-slate-400">{label}</div>
            <div className={`text-xl font-bold tracking-tight ${accents[accent]}`}><span className="value-hover">{value}</span></div>
        </div>
    );
};

const MonthlySummaryView = ({ c }) => (
    <div className="space-y-6">
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-800 bg-linear-to-br from-violet-500/15 via-slate-900 to-slate-950 p-6 md:flex-row">
            <HealthScoreGauge score={c.healthScore} />
            <div className="min-w-0 flex-1">
                <div className="mb-2 text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    AI Summary
                </div>
                <p className="leading-relaxed text-slate-300">{c.summary}</p>
                {c.topSpendingCategory && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300">
                        <span className="text-slate-500">Top category</span>
                        <span className="font-semibold text-slate-100">{c.topSpendingCategory}</span>
                    </div>
                )}
            </div>
        </div>

        {typeof c.estimatedMonthlySavings === 'number' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Stat label="Health Score" value={`${c.healthScore ?? 0}/100`} accent="violet" />
                <Stat
                    label="Estimated Savings"
                    value={`$${Number(c.estimatedMonthlySavings).toLocaleString()}/mo`}
                    accent="emerald"
                />
                <Stat
                    label="Recommendations"
                    value={c.recommendations?.length || 0}
                    accent="slate"
                />
            </div>
        )}

        {c.highlights?.length > 0 && (
            <div>
                <div className="mb-3 flex items-center gap-2">
                    <Check size={14} className="text-emerald-300" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300" style={{ color: '#7ee87e' }}>
                        What is going well
                    </h4>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {c.highlights.map((h, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4"
                        >
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                                <Check size={12} className="text-white" strokeWidth={3} />
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: '#d4f5d4' }}>{h}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {c.concerns?.length > 0 && (
            <div>
                <div className="mb-3 flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-300" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300" style={{ color: '#f87171' }}>
                        Areas to watch
                    </h4>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {c.concerns.map((concern, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4"
                        >
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500">
                                <AlertCircle size={12} className="text-white" strokeWidth={3} />
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: '#f5d4d4' }}>{concern}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {c.recommendations?.length > 0 && (
            <div>
                <div className="mb-3 flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-300" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Recommendations
                    </h4>
                </div>
                <div className="space-y-2">
                    {c.recommendations.map((r, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-violet-500/30"
                        >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-cyan-500 text-xs font-bold text-white">
                                {i + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-0.5 text-sm font-semibold text-slate-100">{r.title}</div>
                                <p className="text-sm leading-relaxed text-slate-400">{r.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const SavingsTipsView = ({ c }) => {
    const totalSavings = (c.tips || []).reduce((sum, t) => sum + (Number(t.estimatedSavings) || 0), 0);

    return (
        <div className="space-y-5">
            {c.overallTip && (
                <div className="relative overflow-hidden rounded-2xl border border-violet-500/25 bg-linear-to-br from-violet-500/20 to-cyan-500/10 p-5 text-slate-100">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
                    <div className="relative flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                            <Lightbulb size={18} className="text-violet-200" />
                        </div>
                        <div>
                            <div className="mb-1 text-[11px] uppercase tracking-wider font-semibold text-violet-200/70">
                                Top tip
                            </div>
                            <p className="text-sm leading-relaxed font-medium text-slate-200">{c.overallTip}</p>
                        </div>
                    </div>
                </div>
            )}

            {totalSavings > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    <Stat label="Total potential" value={`$${totalSavings.toFixed(0)}/mo`} accent="emerald" />
                    <Stat label="Tips" value={c.tips?.length || 0} accent="violet" />
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {c.tips?.map((t, i) => {
                    const savings = Number(t.estimatedSavings) || 0;
                    return (
                        <div
                            key={i}
                            className="group relative rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-violet-500/30"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                {t.category && (
                                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        {t.category}
                                    </span>
                                )}
                                {savings > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-300">
                                        <TrendingUp size={11} />~${savings}/mo
                                    </span>
                                )}
                            </div>
                            <h5 className="mb-1.5 text-base font-bold text-slate-100">{t.title}</h5>
                            <p className="text-sm leading-relaxed text-slate-400">{t.detail}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const BudgetAlertView = ({ c }) => {
    const severity = c.severity || 'info';
    const sev = {
        info: { bg: 'from-blue-500/15 to-cyan-500/10', border: 'border-blue-500/20', icon: 'bg-blue-500', text: 'text-blue-100', accent: 'text-blue-300' },
        warning: { bg: 'from-amber-500/15 to-orange-500/10', border: 'border-amber-500/20', icon: 'bg-amber-500', text: 'text-amber-100', accent: 'text-amber-300' },
        critical: { bg: 'from-rose-500/15 to-red-500/10', border: 'border-rose-500/20', icon: 'bg-rose-500', text: 'text-rose-100', accent: 'text-rose-300' },
    }[severity];

    return (
        <div className="space-y-5">
            <div className={`rounded-2xl border bg-linear-to-br ${sev.bg} ${sev.border} p-5`}>
                <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${sev.icon}`}>
                        <AlertTriangle size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                            <span className={`rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sev.accent}`}>
                                {severity}
                            </span>
                        </div>
                        {c.title && <h4 className={`mb-1 text-base font-bold ${sev.text}`}>{c.title}</h4>}
                        <p className={`text-sm leading-relaxed ${sev.text} opacity-90`}>{c.message}</p>
                    </div>
                </div>
            </div>

            {c.suggestions?.length > 0 && (
                <div>
                    <div className="mb-3 flex items-center gap-2">
                        <ArrowRight size={14} className="text-violet-300" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                            Suggested actions
                        </h4>
                    </div>
                    <div className="space-y-2">
                        {c.suggestions.map((sug, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-violet-500/30"
                            >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-300">
                                    {i + 1}
                                </div>
                                <p className="text-sm leading-relaxed text-slate-300">{sug}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const previewText = (insight) => {
    const c = insight.content_json;
    if (insight.insight_type === 'monthly_summary') return c.summary || '';
    if (insight.insight_type === 'budget_alert') return c.message || c.title || '';
    if (insight.insight_type === 'savings_tips') return c.overallTip || '';
    return '';
};

const headerChip = (insight) => {
    const c = insight.content_json;
    if (insight.insight_type === 'monthly_summary' && typeof c.healthScore === 'number') {
        const score = c.healthScore;
        const tone = score >= 70 ? 'bg-emerald-500/15 text-emerald-300' : score >= 40 ? 'bg-amber-500/15 text-amber-300' : 'bg-rose-500/15 text-rose-300';
        return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}>Score {score}</span>;
    }
    if (insight.insight_type === 'budget_alert' && c.severity) {
        const tone = c.severity === 'critical' ? 'bg-rose-500/15 text-rose-300' : c.severity === 'warning' ? 'bg-amber-500/15 text-amber-300' : 'bg-blue-500/15 text-blue-300';
        return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}>{c.severity}</span>;
    }
    if (insight.insight_type === 'savings_tips') {
        const total = (c.tips || []).reduce((s, t) => s + (Number(t.estimatedSavings) || 0), 0);
        if (total > 0) {
            return <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">~${total}/mo</span>;
        }
    }
    return null;
};

const InsightCard = ({ insight, defaultExpanded = false }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const c = insight.content_json;
    const t = typeStyles[insight.insight_type] || typeStyles.monthly_summary;
    const TypeIcon = t.Icon;

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 transition hover:border-slate-700 card-shadow card-shadow-hover">
            <button
                onClick={() => setExpanded((v) => !v)}
                className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-slate-800/50"
            >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${t.gradient}`}>
                    <TypeIcon size={22} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-100">{labelMap[insight.insight_type]}</h3>
                        {headerChip(insight)}
                        <span className="text-xs text-slate-500">{timeAgo(insight.created_at)}</span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">{previewText(insight)}</p>
                </div>
                {expanded ? (
                    <ChevronUp size={18} className="mt-1 shrink-0 text-slate-500" />
                ) : (
                    <ChevronDown size={18} className="mt-1 shrink-0 text-slate-500" />
                )}
            </button>
            {expanded && (
                <div className="border-t border-slate-800 px-5 pb-6 pt-5">
                    {insight.insight_type === 'monthly_summary' && <MonthlySummaryView c={c} />}
                    {insight.insight_type === 'budget_alert' && <BudgetAlertView c={c} />}
                    {insight.insight_type === 'savings_tips' && <SavingsTipsView c={c} />}
                </div>
            )}
        </div>
    );
};

export default InsightCard;
