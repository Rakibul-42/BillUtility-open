import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import * as insightController from "../controllers/insightController.js";

test("insight controller exposes the route handler expected by the frontend", () => {
  assert.equal(typeof insightController.generateInsight, "function");
});

test("server mounts the insights API route", async () => {
  const source = await readFile(new URL("../server.js", import.meta.url), "utf8");

  assert.match(source, /app\.use\(["']\/api\/insights["'],\s*insightRoutes\)/);
});

test("budget controller imports the analyzer it calls", async () => {
  const source = await readFile(
    new URL("../controllers/budgetController.js", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /import\s*\{\s*analyzeBudgetList\s*\}\s*from\s*["']\.\.\/utils\/gemini\.js["']/,
  );
});

test("Gemini client accepts the API key name used by the backend environment", async () => {
  const source = await readFile(
    new URL("../utils/gemini.js", import.meta.url),
    "utf8",
  );

  assert.match(source, /process\.env\.GOOGLE_API_KEY/);
});
