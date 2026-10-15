import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const ai = new GoogleGenAI({ apiKey });

if (!apiKey) {
    console.error('WARNING: GEMINI_API_KEY or GOOGLE_API_KEY is not set. AI features will not work.');
}

/**
 * Safely strips markdown/code fences from AI output
 */
const stripMarkdown = (text = '') => {
    let cleaned = text.trim();

    cleaned = cleaned
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/g, '')
        .trim();

    return cleaned;
};

/**
 * Safely extracts text from Gemini response (handles SDK variations)
 */
const getResponseText = (response) => {
    return (
        response?.text ||
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        ''
    );
};

/**
 * Safe JSON parse helper
 */
const safeParseJSON = (text, context = 'AI response') => {
    try {
        return JSON.parse(text);
    } catch (err) {
        console.error(`❌ JSON parse error in ${context}:`, text);
        throw new Error(`Failed to parse AI response (${context})`);
    }
};

export const generateMonthlyInsight = async ({
    totalIncome,
    totalExpenses,
    savingsRate,
    expenseBreakdown,
    previousMonths,
    currency = 'USD',
}) => {
    const breakdownText =
        expenseBreakdown.length > 0
            ? expenseBreakdown
                  .map(
                      (c) =>
                          `- ${c.category}: ${currency} ${c.amount.toFixed(2)}`
                  )
                  .join('\n')
            : '- No expenses recorded yet';

    const trendText =
        previousMonths.length > 0
            ? previousMonths
                  .map(
                      (m) =>
                          `- ${m.month}: Income ${currency} ${m.income.toFixed(
                              2
                          )}, Expenses ${currency} ${m.expenses.toFixed(2)}`
                  )
                  .join('\n')
            : '- No previous month data available';

    const prompt = `Analyze this user's monthly financial data and generate actionable insights.

Currency: ${currency}
Total Income (this month): ${currency} ${totalIncome.toFixed(2)}
Total Expenses (this month): ${currency} ${totalExpenses.toFixed(2)}
Savings Rate: ${savingsRate.toFixed(1)}%

Expense breakdown by category (this month):
${breakdownText}

Previous months trend:
${trendText}

Return ONLY valid JSON (no markdown, no commentary) in this exact structure:
{
  "summary": "2-3 sentence summary of the user's financial health this month",
  "highlights": ["Positive observation 1", "Positive observation 2"],
  "concerns": ["Concern 1", "Concern 2"],
  "recommendations": [
    {"title": "Short title", "detail": "Actionable suggestion (1-2 sentences)"}
  ],
  "topSpendingCategory": "Category name or null",
  "estimatedMonthlySavings": number,
  "healthScore": number
}

Constraints:
- "healthScore" must be an integer between 0 and 100.
- Provide 3 recommendations.
- Reference actual numbers from the data. Tone: friendly but honest.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = stripMarkdown(getResponseText(response));
        return safeParseJSON(text, 'monthly insight');
    } catch (error) {
        console.error('Gemini API error (monthly insight):', error);
        throw new Error('Failed to generate monthly insight. Please try again.');
    }
};

export const generateBudgetAlert = async ({
    categoryName,
    budgetAmount,
    spentAmount,
    daysIntoPeriod,
    totalPeriodDays,
    currency = 'USD',
}) => {
    const percentUsed =
        budgetAmount > 0
            ? ((spentAmount / budgetAmount) * 100).toFixed(1)
            : '0.0';

    const daysLeft = totalPeriodDays - daysIntoPeriod;

    const prompt = `A user is tracking a budget. Generate a helpful alert.

Category: ${categoryName}
Budget: ${currency} ${budgetAmount.toFixed(2)}
Spent so far: ${currency} ${spentAmount.toFixed(2)} (${percentUsed}% used)
Days into period: ${daysIntoPeriod} of ${totalPeriodDays} (${daysLeft} days remaining)

Return ONLY valid JSON (no markdown):
{
  "severity": "info|warning|critical",
  "title": "Short alert title",
  "message": "1-2 sentence empathetic message referencing actual numbers",
  "suggestions": ["Specific action 1", "Specific action 2", "Specific action 3"]
}

Severity guide:
- info: under 70% spent
- warning: 70-100% spent
- critical: over 100% spent`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = stripMarkdown(getResponseText(response));
        return safeParseJSON(text, 'budget alert');
    } catch (error) {
        console.error('Gemini API error (budget alert):', error);
        throw new Error('Failed to generate budget alert.');
    }
};

export const generateSavingsTips = async ({
    topCategories,
    monthlyIncome,
    currency = 'USD',
}) => {
    const categoryText =
        topCategories.length > 0
            ? topCategories
                  .map(
                      (c) =>
                          `- ${c.category}: ${currency} ${c.amount.toFixed(
                              2
                          )} across ${c.transactionCount} transactions`
                  )
                  .join('\n')
            : '- No spending data available';

    const prompt = `Generate personalized savings tips for a user.

Monthly Income (last 30 days): ${currency} ${monthlyIncome.toFixed(2)}
Top spending categories (last 30 days):
${categoryText}

Return ONLY valid JSON (no markdown):
{
  "overallTip": "Top-level 1-sentence advice",
  "tips": [
    {
      "category": "Category this targets",
      "title": "Short tip title",
      "detail": "2-3 sentence actionable suggestion",
      "estimatedSavings": number
    }
  ]
}

Provide exactly 4 tips. Each tip should reference an actual category from the data and include a realistic monthly savings estimate.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = stripMarkdown(getResponseText(response));
        return safeParseJSON(text, 'savings tips');
    } catch (error) {
        console.error('Gemini API error (savings tips):', error);
        throw new Error('Failed to generate savings tips.');
    }
};

export const analyzeTransactionList = async ({
    transactions,
    currency = 'USD',
}) => {
    const formatDate = (d) => {
        if (!d) return '';
        if (d instanceof Date) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }
        return String(d.split('T')[0]);
    };

    const lines = transactions
        .slice(0, 50)
        .map((t) => {
            const date = formatDate(t.transaction_date);
            const amt = parseFloat(t.amount).toFixed(2);
            const cat = t.category_name || 'uncategorized';
            const desc = t.description ? ` | ${t.description}` : '';
            return `- ${date}: ${t.type} ${currency} ${amt} | ${cat}${desc}`;
        })
        .join('\n');

    const prompt = `Analyze these ${transactions.length} transactions and provide a concise, helpful spending insight.

Transactions:
${lines}

Return ONLY valid JSON (no markdown):
{
  "insight": "2-4 sentence analysis with specific numbers from the data. Tone: friendly, helpful.",
  "highlight": "Single short phrase capturing the key takeaway"
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = stripMarkdown(getResponseText(response));
        return safeParseJSON(text, 'transaction analysis');
    } catch (error) {
        console.error('Gemini API error (analyze transactions):', error);
        throw new Error('Failed to analyze transactions.');
    }
};

export const analyzeBudgetList = async ({ budgets, currency = 'USD' }) => {
    const lines = budgets
        .map((b) => {
            const spent = parseFloat(b.spent);
            const total = parseFloat(b.amount);
            const pct =
                total > 0 ? ((spent / total) * 100).toFixed(1) : '0.0';

            return `Budget ID ${b.id} | Category: ${
                b.category_name
            } | Limit: ${currency} ${total.toFixed(
                2
            )} | Spent: ${currency} ${spent.toFixed(2)} (${pct}% used)`;
        })
        .join('\n');

    const prompt = `You're a personal finance assistant. Analyze each budget below.

Today: ${new Date().toISOString().split('T')[0]}

Budgets:
${lines}

Return ONLY valid JSON:
{
  "analyses": [
    {
      "budgetId": number,
      "status": "good|caution|concerning",
      "message": "1-sentence feedback"
    }
  ]
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = stripMarkdown(getResponseText(response));
        return safeParseJSON(text, 'budget list analysis');
    } catch (error) {
        console.error('Gemini API error (analyze budgets):', error);
        throw new Error('Failed to analyze budgets.');
    }
};

export default {
    generateMonthlyInsight,
    generateBudgetAlert,
    generateSavingsTips,
    analyzeTransactionList,
    analyzeBudgetList,
};
