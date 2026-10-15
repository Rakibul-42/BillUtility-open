import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/format.js';

const TransactionTrendChart = ({ data, currency, interval = 3 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-sm text-slate-500">
                No data yet
            </div>
        );
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FDBB14" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#FDBB14" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A94812" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#A94812" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 213, 181, 0.14)" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: '#936E4D', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        interval={interval}
                    />
                    <YAxis
                        tick={{ fill: '#936E4D', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={48}
                    />
                    <Tooltip
                        cursor={{ stroke: '#936E4D', strokeDasharray: '3 3' }}
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
                    <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                        iconType="circle"
                        payload={[
                            { value: 'income', type: 'circle', color: '#FDBB14' },
                            { value: 'expense', type: 'circle', color: '#A94812' },
                        ]}
                    />
                    <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#FDBB14"
                        strokeWidth={2.5}
                        fill="url(#incomeArea)"
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#A94812"
                        strokeWidth={2.5}
                        fill="url(#expenseArea)"
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TransactionTrendChart;
