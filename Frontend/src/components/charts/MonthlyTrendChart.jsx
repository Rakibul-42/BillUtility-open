import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { formatMonth, formatCurrency } from '../../utils/format.js';

const MonthlyTrendChart = ({ data, currency }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-sm text-slate-500">
                No data yet
            </div>
        );
    }

    const formatted = data.map((d) => ({
        month: formatMonth(d.month),
        income: parseFloat(d.income),
        expense: parseFloat(d.expense),
    }));

    return (
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatted} barCategoryGap="35%" barGap={6}>
                    <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FDBB14" />
                            <stop offset="100%" stopColor="#E58A14" />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#E58A14" />
                            <stop offset="100%" stopColor="#A94812" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 213, 181, 0.14)" vertical={false} />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: '#936E4D', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#936E4D', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={48}
                    />
                    <Tooltip
                        cursor={false}
                        contentStyle={{
                            borderRadius: 12,
                            border: '1px solid rgba(232, 213, 181, 0.14)',
                            background: '#241A12',
                            color: '#E8D5B5',
                            boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)',
                            fontSize: 12,
                        }}
                        formatter={(value) => formatCurrency(value, currency)}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                        iconType="circle"
                        payload={[
                            { value: 'income', type: 'circle', color: '#FDBB14' },
                            { value: 'expense', type: 'circle', color: '#A94812' },
                        ]}
                    />
                    <Bar
                        dataKey="income"
                        fill="url(#incomeGradient)"
                        radius={[10, 10, 10, 10]}
                        background={{ fill: '#241A12', radius: 10 }}
                    />
                    <Bar
                        dataKey="expense"
                        fill="url(#expenseGradient)"
                        radius={[10, 10, 10, 10]}
                        background={{ fill: '#241A12', radius: 10 }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyTrendChart;
