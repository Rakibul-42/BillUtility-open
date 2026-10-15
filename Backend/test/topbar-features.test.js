import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("global search normalizes valid queries and rejects short queries", async () => {
  const { normalizeSearchQuery } = await import(
    "../controllers/searchController.js"
  );

  assert.equal(normalizeSearchQuery("  groceries  "), "groceries");
  assert.equal(normalizeSearchQuery("a"), "");
  assert.equal(normalizeSearchQuery(null), "");
});

test("notification helpers classify budgets and create stable signatures", async () => {
  const { getBudgetSeverity, createNotificationSignature } = await import(
    "../controllers/notificationController.js"
  );

  assert.equal(getBudgetSeverity(79.9), null);
  assert.equal(getBudgetSeverity(80), "warning");
  assert.equal(getBudgetSeverity(100), "critical");
  assert.equal(
    createNotificationSignature([{ id: "b:2" }, { id: "a:1" }]),
    "a:1,b:2",
  );
});

test("topbar controllers export their route handlers", async () => {
  const [searchController, notificationController] = await Promise.all([
    import("../controllers/searchController.js"),
    import("../controllers/notificationController.js"),
  ]);

  assert.equal(typeof searchController.globalSearch, "function");
  assert.equal(typeof notificationController.getNotifications, "function");
});

test("topbar routes are protected and mounted", async () => {
  const [searchRoute, notificationRoute, server] = await Promise.all([
    readFile(new URL("../routes/searchRoutes.js", import.meta.url), "utf8"),
    readFile(new URL("../routes/notificationRoutes.js", import.meta.url), "utf8"),
    readFile(new URL("../server.js", import.meta.url), "utf8"),
  ]);

  assert.match(searchRoute, /router\.use\(protect\)/);
  assert.match(notificationRoute, /router\.use\(protect\)/);
  assert.match(server, /app\.use\(["']\/api\/search["'],\s*searchRoutes\)/);
  assert.match(
    server,
    /app\.use\(["']\/api\/notifications["'],\s*notificationRoutes\)/,
  );
});
