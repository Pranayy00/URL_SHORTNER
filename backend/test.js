/**
 * Simple smoke test for the URL Shortener API.
 * Run this with the server already running (npm start) in another terminal:
 *
 *   node test.js
 *
 * It walks through the full flow: health check -> create short URL ->
 * follow redirect -> check analytics, and prints PASS/FAIL for each step.
 * Requires Node 18+ (uses the built-in fetch).
 */

const BASE_URL = "http://localhost:8001";

let passed = 0;
let failed = 0;

function check(label, condition, extra = "") {
  if (condition) {
    console.log(`✅ PASS - ${label}`);
    passed++;
  } else {
    console.log(`❌ FAIL - ${label} ${extra}`);
    failed++;
  }
}

async function run() {
  console.log(`Running smoke tests against ${BASE_URL}\n`);

  // 1. Health check
  let health;
  try {
    const res = await fetch(`${BASE_URL}/health`);
    health = await res.json();
    check("Server is reachable (/health returns 200)", res.status === 200);
    check(
      "Database is connected (dbState === 1)",
      health.dbState === 1,
      `(got dbState=${health?.dbState}. 0=disconnected, 2=connecting, 3=disconnecting. Check your MONGO_URI in .env)`
    );
  } catch (err) {
    check("Server is reachable (/health returns 200)", false, `(${err.message}. Is the server running? Try: npm start)`);
    console.log("\nStopping early - server not reachable.");
    printSummary();
    return;
  }

  if (health.dbState !== 1) {
    console.log("\nStopping early - database not connected. Fix MONGO_URI and re-run.");
    printSummary();
    return;
  }

  // 2. Missing url -> 400
  {
    const res = await fetch(`${BASE_URL}/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    check("POST /url with no url returns 400", res.status === 400);
  }

  // 3. Invalid url -> 400
  {
    const res = await fetch(`${BASE_URL}/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "not-a-url" }),
    });
    check("POST /url with invalid url returns 400", res.status === 400);
  }

  // 4. Valid url -> 201 + shortId
  let shortId;
  {
    const res = await fetch(`${BASE_URL}/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/some/test/path" }),
    });
    const data = await res.json();
    shortId = data?.data?.shortId;
    check("POST /url with valid url returns 201", res.status === 201);
    check("Response includes a shortId", !!shortId, `(got: ${JSON.stringify(data)})`);
  }

  if (!shortId) {
    console.log("\nStopping early - no shortId returned, can't test redirect/analytics.");
    printSummary();
    return;
  }

  // 5. Redirect works
  {
    const res = await fetch(`${BASE_URL}/${shortId}`, { redirect: "manual" });
    check(
      "GET /:shortId redirects (302/301) to original URL",
      res.status === 302 || res.status === 301,
      `(got status ${res.status})`
    );
  }

  // 6. Unknown shortId -> 404 (regression check for the null-check fix)
  {
    const res = await fetch(`${BASE_URL}/doesNotExist123`, { redirect: "manual" });
    check("GET /:shortId with unknown id returns 404 (not a crash)", res.status === 404);
  }

  // 7. Analytics reflect the visit
  {
    const res = await fetch(`${BASE_URL}/url/analytics/${shortId}`);
    const data = await res.json();
    check("GET /url/analytics/:shortId returns 200", res.status === 200);
    check("totalClicks is at least 1", data.totalClicks >= 1, `(got: ${data.totalClicks})`);
  }

  printSummary();
}

function printSummary() {
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test script crashed:", err);
  process.exit(1);
});
