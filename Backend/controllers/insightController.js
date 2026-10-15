import pool from '../db.js';
import {
    generateMonthlyInsight,
    generateBudgetAlert,
    generateSavingsTips,
} from '../utils/gemini.js';

const getUserCurrency = async (userId) => {
    const result = await pool.query('SELECT currency FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.currency || 'USD';
};


export const getInsights = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM ai_insights WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [req.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('GetInsights error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const buildMonthlyInsight = async (userId) => {
    const data = await pool.query(
        `WITH current_month AS (
            SELECT
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
            FROM transactions
            WHERE user_id = $1
                AND transaction_date >= date_trunc('month', CURRENT_DATE)
        ),
        breakdown AS (
            SELECT c.name AS category, SUM(t.amount) AS amount
            FROM transactions t
            JOIN categories c ON c.id = t.category_id
            WHERE t.user_id = $1
                AND t.type = 'expense'
                AND t.transaction_date >= date_trunc('month', CURRENT_DATE)
            GROUP BY c.name
            ORDER BY amount DESC
        ),
        trend AS (
            SELECT
                to_char(date_trunc('month', transaction_date), 'YYYY-MM') AS month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses
            FROM transactions
            WHERE user_id = $1
                AND transaction_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '3 months'
                AND transaction_date < date_trunc('month', CURRENT_DATE)
            GROUP BY 1
            ORDER BY 1
        )
        SELECT
            (SELECT income FROM current_month) AS income,
            (SELECT expense FROM current_month) AS expense,
            (SELECT json_agg(breakdown) FROM breakdown) AS breakdown,
            (SELECT json_agg(trend) FROM trend) AS trend`,
        [userId]
    );

    const row = data.rows[0];
    const totalIncome = parseFloat(row.income || 0);
    const totalExpenses = parseFloat(row.expense || 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const currency = await getUserCurrency(userId);

    const content = await generateMonthlyInsight({
        totalIncome,
        totalExpenses,
        savingsRate,
        expenseBreakdown: (row.breakdown || []).map(b => ({
            category: b.category,
            amount: parseFloat(b.amount),
        })),
        previousMonths: (row.trend || []).map(t => ({
            month: t.month,
            income: parseFloat(t.income),
            expenses: parseFloat(t.expenses),
        })),
        currency,
    });

    const now = new Date();
    const periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const periodEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return { content, periodStart, periodEnd };
};

const buildSavingsTips = async (userId) => {
    const [incomeResult, categoryResult, currency] = await Promise.all([
        pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS income
             FROM transactions
             WHERE user_id = $1
               AND type = 'income'
               AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'`,
            [userId]
        ),
        pool.query(
            `SELECT
                COALESCE(c.name, 'Uncategorized') AS category,
                SUM(t.amount) AS amount,
                COUNT(*) AS transaction_count
             FROM transactions t
             LEFT JOIN categories c ON c.id = t.category_id
             WHERE t.user_id = $1
               AND t.type = 'expense'
               AND t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
             GROUP BY COALESCE(c.name, 'Uncategorized')
             ORDER BY amount DESC
             LIMIT 5`,
            [userId]
        ),
        getUserCurrency(userId),
    ]);

    const content = await generateSavingsTips({
        monthlyIncome: parseFloat(incomeResult.rows[0]?.income || 0),
        topCategories: categoryResult.rows.map((row) => ({
            category: row.category,
            amount: parseFloat(row.amount),
            transactionCount: Number(row.transaction_count),
        })),
        currency,
    });

    const now = new Date();
    const periodEnd = now.toISOString().split('T')[0];
    const periodStartDate = new Date(now);
    periodStartDate.setDate(periodStartDate.getDate() - 30);

    return {
        content,
        periodStart: periodStartDate.toISOString().split('T')[0],
        periodEnd,
    };
};

// Dispatches the two insight types exposed by the frontend through one endpoint.
export const generateInsight = async (req, res) => {
    const { type } = req.body;

    if (!['monthly_summary', 'savings_tips'].includes(type)) {
        return res.status(400).json({
            message: 'type must be monthly_summary or savings_tips',
        });
    }

    try {
        const { content, periodStart, periodEnd } =
            type === 'monthly_summary'
                ? await buildMonthlyInsight(req.userId)
                : await buildSavingsTips(req.userId);

        const result = await pool.query(
            `INSERT INTO ai_insights
                (user_id, insight_type, period_start, period_end, content_json)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [req.userId, type, periodStart, periodEnd, content]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('GenerateInsight error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

export const generateAndSaveMonthlyInsight = async (req, res) => {
    try {
        const { content, periodStart, periodEnd } = await buildMonthlyInsight(req.userId);

        const result = await pool.query(
            `INSERT INTO ai_insights (user_id, type, period_start, period_end, content)
             VALUES ($1, 'monthly_insight', $2, $3, $4)
             RETURNING *`,
            [req.userId, periodStart, periodEnd, JSON.stringify(content)]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('GenerateAndSaveMonthlyInsight error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getLatestMonthlyInsight = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM ai_insights
             WHERE user_id = $1 AND type = 'monthly_insight'
             ORDER BY period_end DESC, created_at DESC
             LIMIT 1`,
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No monthly insight found.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('GetLatestMonthlyInsight error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const generateAndSaveBudgetAlerts = async (req, res) => {
    try {
        const budgets = await pool.query(
            `SELECT b.*, c.name AS category_name
             FROM budgets b
             JOIN categories c ON c.id = b.category_id
             WHERE b.user_id = $1`,
            [req.userId]
        );

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const totalPeriodDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysIntoPeriod = Math.ceil((now - startOfMonth) / (1000 * 60 * 60 * 24));
        const currency = await getUserCurrency(req.userId);

        const alertsGenerated = [];

        for (const b of budgets.rows) {
            const transactions = await pool.query(
                `SELECT SUM(amount) AS spent
                 FROM transactions
                 WHERE user_id = $1
                   AND category_id = $2
                   AND type = 'expense'
                   AND transaction_date >= $3`,
                [req.userId, b.category_id, startOfMonth]
            );

            const spentAmount = parseFloat(transactions.rows[0]?.spent || 0);
            const budgetAmount = parseFloat(b.amount);

            const alertContent = await generateBudgetAlert({
                categoryName: b.category_name,
                budgetAmount,
                spentAmount,
                daysIntoPeriod,
                totalPeriodDays,
                currency,
            });

            const savedAlert = await pool.query(
                `INSERT INTO ai_insights (user_id, type, period_start, period_end, content)
                 VALUES ($1, 'budget_alert', $2, $3, $4)
                 RETURNING *`,
                [
                    req.userId,
                    startOfMonth.toISOString().split('T')[0],
                    now.toISOString().split('T')[0],
                    JSON.stringify(alertContent),
                ]
            );

            alertsGenerated.push(savedAlert.rows[0]);
        }

        res.status(201).json({
            message: `Processed ${budgets.rows.length} budgets.`,
            alerts: alertsGenerated,
        });
    } catch (error) {
        console.error('GenerateAndSaveBudgetAlerts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
