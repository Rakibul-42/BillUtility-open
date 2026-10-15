import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/format.js';

const GRADIENTS = [
    { id: 'cat-gold', from: '#FDBB14', to: '#E58A14', solid: '#FDBB14' },
    { id: 'cat-orange', from: '#E58A14', to: '#A94812', solid: '#E58A14' },
    { id: 'cat-rust', from: '#A94812', to: '#7F330E', solid: '#A94812' },
    { id: 'cat-muted', from: '#B49473', to: '#936E4D', solid: '#936E4D' },
    { id: 'cat-cream', from: '#E8D5B5', to: '#936E4D', solid: '#E8D5B5' },
];

const CategoryBreakdownChart = ({ data, currency }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-sm text-slate-500">
                No expenses yet
            </div>
        );
    }

    const top = data.slice(0, 5);
    const formatted = top.map((d, i) => {
        const g = GRADIENTS[i % GRADIENTS.length];
        return {
            name: d.category_name,
            value: parseFloat(d.total),
            gradientId: g.id,
            solid: g.solid,
        };
    });

    return (
        <div>
            <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <defs>
                            {GRADIENTS.map((g) => (
                                <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={g.from} />
                                    <stop offset="100%" stopColor={g.to} />
                                </linearGradient>
                            ))}
                        </defs>
                        <Pie
                            data={formatted}
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {formatted.map((entry) => (
                                <Cell key={entry.name} fill={`url(#${entry.gradientId})`} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: 12,
                                border: '1px solid rgba(232, 213, 181, 0.14)',
                                background: '#241A12',
                                color: '#E8D5B5',
                                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)',
                                fontSize: 12,
                            }}
                            formatter={(v) => formatCurrency(v, currency)}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-2">
                {formatted.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.solid }} />
                            <span className="text-xs text-slate-300 truncate">{c.name}</span>
                        </div>
                        <span className="text-xs font-medium text-slate-100 shrink-0 ml-2">
                            {formatCurrency(c.value, currency)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBreakdownChart;
