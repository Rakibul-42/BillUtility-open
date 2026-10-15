import pool from "../db.js";

export const getBudgetSeverity = (percentUsed) => {
  if (percentUsed >= 100) return "critical";
  if (percentUsed >= 80) return "warning";
  return null;
};

export const createNotificationSignature = (notifications) =>
  notifications
    .map((notification) => notification.id)
    .sort()
    .join(",");

const insightLabels = {
  monthly_summary: "Monthly summary ready",
  savings_tips: "New savings tips",
  budget_alert: "AI budget alert",
};

export const getNotifications = async (req, res) => {
  try {
    const [budgetResult, insightResult] = await Promise.all([
      pool.query(
        `SELECT
           b.id,
           b.amount,
           b.period,
           b.created_at,
           c.name AS category_name,
           COALESCE(SUM(t.amount), 0) AS spent
         FROM budgets b
         JOIN categories c ON c.id = b.category_id
         LEFT JOIN transactions t
           ON t.category_id = b.category_id
           AND t.user_id = b.user_id
           AND t.type = 'expense'
           AND (
             (b.period = 'monthly' AND t.transaction_date >= date_trunc('month', CURRENT_DATE))
             OR (b.period = 'weekly' AND t.transaction_date >= date_trunc('week', CURRENT_DATE))
           )
         WHERE b.user_id = $1
         GROUP BY b.id, c.name
         ORDER BY b.created_at DESC`,
        [req.userId],
      ),
      pool.query(
        `SELECT id, insight_type, created_at
         FROM ai_insights
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [req.userId],
      ),
    ]);

    const budgetNotifications = budgetResult.rows.flatMap((budget) => {
      const amount = Number(budget.amount);
      const spent = Number(budget.spent);
      const percentUsed = amount > 0 ? (spent / amount) * 100 : 0;
      const severity = getBudgetSeverity(percentUsed);

      if (!severity) return [];

      return [{
        id: `budget:${budget.id}:${Math.floor(percentUsed)}`,
        type: "budget",
        severity,
        title:
          severity === "critical"
            ? `${budget.category_name} budget exceeded`
            : `${budget.category_name} budget is nearly used`,
        message: `${percentUsed.toFixed(0)}% of the ${budget.period} budget has been spent.`,
        path: "/budgets",
        createdAt: budget.created_at,
      }];
    });

    const insightNotifications = insightResult.rows.map((insight) => ({
      id: `insight:${insight.id}`,
      type: "insight",
      severity: "info",
      title: insightLabels[insight.insight_type] || "New AI insight",
      message: "Open AI Insights to review your latest financial analysis.",
      path: "/insights",
      createdAt: insight.created_at,
    }));

    const notifications = [...budgetNotifications, ...insightNotifications]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 10);

    res.json({
      notifications,
      signature: createNotificationSignature(notifications),
    });
  } catch (error) {
    console.error("GetNotifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
