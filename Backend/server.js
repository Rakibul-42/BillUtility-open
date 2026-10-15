import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import pool from "./db.js";


import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import insightRoutes from "./routes/insightRoute.js";
import searchRoutes from "./routes/searchRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { generalLimiter } from "./middleware/rateLimiter.js";


const app = express();
dotenv.config();
const PORT = process.env.PORT || 6900;


app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(generalLimiter);


app.get("/", (req, res) => {
    res.json({ message: "Bill Utility AI API is running" });
});


app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/user", userRoutes);


const ensureSchema = async () => {
    try {
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_updated_at TIMESTAMPTZ;
            ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS description TEXT;
            ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes TEXT;
            ALTER TABLE transactions ALTER COLUMN category_id DROP NOT NULL;
            UPDATE transactions
            SET description = note
            WHERE description IS NULL AND note IS NOT NULL;
        `);
    } catch (error) {
        console.error("Schema update error:", error);
    }
};

ensureSchema().finally(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
