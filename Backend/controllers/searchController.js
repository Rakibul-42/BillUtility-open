import pool from "../db.js";

export const normalizeSearchQuery = (value) => {
  if (typeof value !== "string") return "";
  const query = value.trim();
  return query.length >= 2 ? query.slice(0, 100) : "";
};

export const globalSearch = async (req, res) => {
  const query = normalizeSearchQuery(req.query.q);

  if (!query) {
    return res.status(400).json({
      message: "Search query must contain at least 2 characters",
    });
  }

  const pattern = `%${query}%`;

  try {
    const [transactions, categories, budgets] = await Promise.all([
      pool.query(
        `SELECT
           t.id,
           COALESCE(NULLIF(t.description, ''), c.name, 'Transaction') AS title,
           CONCAT(
             INITCAP(t.type),
             ' - ',
             t.amount,
             ' - ',
             TO_CHAR(t.transaction_date, 'Mon DD, YYYY')
           ) AS subtitle
         FROM transactions t
         LEFT JOIN categories c ON c.id = t.category_id
         WHERE t.user_id = $1
           AND (
             COALESCE(t.description, '') ILIKE $2
             OR COALESCE(t.notes, '') ILIKE $2
             OR COALESCE(c.name, '') ILIKE $2
           )
         ORDER BY t.transaction_date DESC, t.id DESC
         LIMIT 5`,
        [req.userId, pattern],
      ),
      pool.query(
        `SELECT id, name AS title, INITCAP(type) AS subtitle
         FROM categories
         WHERE user_id = $1 AND name ILIKE $2
         ORDER BY name
         LIMIT 5`,
        [req.userId, pattern],
      ),
      pool.query(
        `SELECT
           b.id,
           c.name AS title,
           CONCAT(INITCAP(b.period), ' budget - ', b.amount) AS subtitle
         FROM budgets b
         JOIN categories c ON c.id = b.category_id
         WHERE b.user_id = $1
           AND (c.name ILIKE $2 OR b.period ILIKE $2)
         ORDER BY c.name
         LIMIT 5`,
        [req.userId, pattern],
      ),
    ]);

    res.json({
      transactions: transactions.rows.map((row) => ({
        ...row,
        kind: "transaction",
        path: `/transactions?search=${encodeURIComponent(row.title)}`,
      })),
      categories: categories.rows.map((row) => ({
        ...row,
        kind: "category",
        path: "/categories",
      })),
      budgets: budgets.rows.map((row) => ({
        ...row,
        kind: "budget",
        path: "/budgets",
      })),
    });
  } catch (error) {
    console.error("GlobalSearch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
