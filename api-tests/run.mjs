// Phase 4 API tests. Run:  node run.mjs        (needs Node 18+, no installs)
// Options:  --expect-ai-failed   (use after breaking GEMINI_API_KEY on purpose)
//           --skip-ai-wait       (don't wait for the AI to finish)
import { readFileSync } from "node:fs";

const cfg = JSON.parse(readFileSync(new URL("./config.json", import.meta.url), "utf8"));
const BASE = (cfg.baseUrl ?? "http://localhost:5000").replace(/\/$/, "");
const EXPECT_AI_FAILED = process.argv.includes("--expect-ai-failed");
const SKIP_AI_WAIT = process.argv.includes("--skip-ai-wait");
const FAKE_ID = "64f0aa11bb22cc33dd44ee55"; // looks like an id, but nothing has it
const CATEGORIES = ["garbage", "water", "electricity", "streetlight", "other"]; // same as your ALLOWED_CATEGORIES

let pass = 0, fail = 0, warn = 0;
const created = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const section = (t) => console.log(`\n── ${t}`);
const ok = (n) => { pass++; console.log(`  ✅ ${n}`); };
const bad = (n, d) => { fail++; console.log(`  ❌ ${n}\n       ${d}`); };
const warning = (n, d) => { warn++; console.log(`  ⚠️  ${n}\n       ${d}`); };
const show = (r) => `${r.status} ${JSON.stringify(r.data)?.slice(0, 160)}`;

function status(name, res, ...allowed) {
  allowed.includes(res.status) ? ok(`${name} → ${res.status}`) : bad(name, `expected ${allowed.join(" or ")}, got ${show(res)}`);
}
function check(name, cond, detail = "") { cond ? ok(name) : bad(name, detail); }

async function call(method, path, token, body) {
  const t0 = Date.now();
  try {
    const res = await fetch(BASE + path, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, data: await res.json().catch(() => null), ms: Date.now() - t0 };
  } catch (e) {
    return { status: 0, data: { message: e.message }, ms: Date.now() - t0 };
  }
}

async function login(label) {
  const acc = cfg.accounts?.[label];
  if (!acc) return null;
  const r = await call("POST", "/api/auth/login", null, { email: acc.email, password: acc.password });
  if (r.status === 0) { console.log(`\nCan't reach the backend at ${BASE}. Is it running?\n`); process.exit(2); }
  if (r.status !== 200) { bad(`login as ${label}`, show(r)); return null; }
  return { label, token: r.data.token, id: String(r.data.user?.id ?? r.data.user?._id), role: r.data.user?.role };
}

async function createComplaint(user, text) {
  const r = await call("POST", "/api/complaints", user.token, { description: `[API TEST] ${text}`, location: "Test Street" });
  if (r.status === 201) created.push(r.data.complaint._id);
  return r;
}

const officerGet = async (officer, id) => (await call("GET", `/api/officer/complaints/${id}`, officer.token)).data?.complaint;

async function waitForAI(officer, id, maxMs = 30000) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    const c = await officerGet(officer, id);
    if (c && !["pending", "processing"].includes(c.aiStatus)) return c;
    await sleep(1500);
  }
  return officerGet(officer, id);
}

// ───────────────────────── setup ─────────────────────────
console.log(`Testing ${BASE}`);
section("Setup: logging in");
const citizen = await login("citizen"), citizen2 = await login("citizen2");
const officer = await login("officer"), worker = await login("worker"), worker2 = await login("worker2");
if (!citizen || !officer || !worker) { console.log("\nNeed at least citizen, officer and worker accounts in config.json.\n"); process.exit(2); }
check("citizen account has role 'citizen'", citizen.role === "citizen", `role is "${citizen.role}"`);
check("officer account has role 'complaint_officer'", officer.role === "complaint_officer", `role is "${officer.role}". Fix it in Atlas, then log in again`);
check("worker account has role 'field_worker'", worker.role === "field_worker", `role is "${worker.role}". Fix it in Atlas, then log in again`);
if (!worker2) console.log("  (no worker2 in config: the 'another worker' tests will be skipped)");
if (!citizen2) console.log("  (no citizen2 in config: the 'other citizen' tests will be skipped)");

// ───────────────────────── 1. not logged in ─────────────────────────
section("1. Not logged in");
for (const [m, p] of [["GET", "/api/complaints"], ["POST", "/api/complaints"], ["GET", "/api/officer/complaints"], ["GET", "/api/worker/complaints"], ["PATCH", `/api/worker/complaints/${FAKE_ID}/start`]]) {
  status(`${m} ${p} with no token`, await call(m, p, null, m === "POST" ? { description: "x" } : undefined), 401);
}
status("garbage token is rejected", await call("GET", "/api/officer/complaints", "abc.def.ghi"), 401);
status("wrong password", await call("POST", "/api/auth/login", null, { email: cfg.accounts.citizen.email, password: "definitely-wrong" }), 401);

// ───────────────────────── 2. role walls ─────────────────────────
section("2. Citizen cannot use officer or worker endpoints");
const officerRoutes = [["GET", "/api/officer/complaints"], ["GET", `/api/officer/complaints/${FAKE_ID}`], ["GET", "/api/officer/departments"], ["GET", "/api/officer/workers"], ["PATCH", `/api/officer/complaints/${FAKE_ID}`], ["PATCH", `/api/officer/complaints/${FAKE_ID}/assign-worker`]];
const workerRoutes = [["GET", "/api/worker/complaints"], ["PATCH", `/api/worker/complaints/${FAKE_ID}/start`], ["PATCH", `/api/worker/complaints/${FAKE_ID}/resolve`]];
for (const [m, p] of [...officerRoutes, ...workerRoutes]) status(`citizen ${m} ${p}`, await call(m, p, citizen.token, m === "PATCH" ? {} : undefined), 403);

section("2b. Worker cannot use officer endpoints; officer cannot use worker endpoints");
for (const [m, p] of officerRoutes) status(`worker ${m} ${p}`, await call(m, p, worker.token, m === "PATCH" ? {} : undefined), 403);
for (const [m, p] of workerRoutes) status(`officer ${m} ${p}`, await call(m, p, officer.token, m === "PATCH" ? {} : undefined), 403);

// ───────────────────────── 3. bad input ─────────────────────────
section("3. Bad input");
status("empty complaint is rejected", await call("POST", "/api/complaints", citizen.token, {}), 400);
status("whitespace-only complaint is rejected", await call("POST", "/api/complaints", citizen.token, { description: "     " }), 400);
for (const [name, body] of [["number as description", { description: 123 }], ["object as description", { description: { $gt: "" } }]]) {
  const r = await call("POST", "/api/complaints", citizen.token, body);
  r.status === 400 ? ok(`${name} → 400`) : warning(`${name} → ${r.status} (should be 400)`, `Add: if (typeof description !== "string" || !description.trim()) → 400`);
}
const inj = await call("POST", "/api/auth/login", null, { email: { $gt: "" }, password: "x" });
inj.status === 400 || inj.status === 401 ? ok(`login with an object as email → ${inj.status}`) : inj.status === 200 ? bad("login with an object as email LOGGED IN", "NoSQL injection hole: check that email and password are strings before User.findOne") : warning(`login with an object as email → ${inj.status} (should be 400)`, `Add: if (typeof email !== "string" || typeof password !== "string") → 400`);

// ───────────────────────── 4. the main journey ─────────────────────────
section("4. Submit a complaint (the AI must not slow the citizen down)");
const c1 = await createComplaint(citizen, "Garbage is piled up near the market gate");
status("citizen submits a complaint", c1, 201);
if (c1.status !== 201) { console.log("\nCan't continue without a complaint.\n"); process.exit(1); }
const C = c1.data.complaint._id;
c1.ms < 3000 ? ok(`replied in ${c1.ms} ms (AI runs in the background)`) : warning(`reply took ${c1.ms} ms`, "The citizen is waiting for Gemini. Reply first, classify afterwards");
check("new complaint starts as 'submitted'", c1.data.complaint.status === "submitted", show(c1));

if (citizen2) {
  section("4b. Another citizen cannot see it");
  status("citizen2 opens citizen's complaint by id", await call("GET", `/api/complaints/${C}`, citizen2.token), 404);
  const list2 = await call("GET", "/api/complaints", citizen2.token);
  check("citizen2's list does not contain it", !list2.data?.complaints?.some((x) => x._id === C), "Another citizen's complaint leaked into the list");
}
const list1 = await call("GET", "/api/complaints", citizen.token);
check("citizen's own list contains it", list1.data?.complaints?.some((x) => x._id === C));

section("5. AI result");
if (SKIP_AI_WAIT) console.log("  (skipped)");
else {
  const c = await waitForAI(officer, C);
  if (!c || ["pending", "processing"].includes(c.aiStatus)) bad("AI finished within 30 seconds", `aiStatus is still "${c?.aiStatus}". A lost job? (the officer page flags these after 5 minutes)`);
  else if (EXPECT_AI_FAILED) check("AI failure is recorded as 'failed' and the complaint still exists", c.aiStatus === "failed", `aiStatus is "${c.aiStatus}"`);
  else if (c.aiStatus === "failed") warning("AI failed", "Check the backend terminal for the Gemini error (key or quota)");
  else {
    ok("AI completed");
    check("AI category is one of the allowed categories", CATEGORIES.includes(c.aiSuggestedCategory), `got "${c.aiSuggestedCategory}"`);
    check("AI confidence is a number from 0 to 1", typeof c.aiConfidence === "number" && c.aiConfidence >= 0 && c.aiConfidence <= 1, `got ${c.aiConfidence}`);
  }
}

// ───────────────────────── 6. officer review ─────────────────────────
section("6. Officer review");
const depts = await call("GET", "/api/officer/departments", officer.token);
const dept = depts.data?.departments?.[0];
if (!dept) { bad("at least one active department exists", show(depts)); process.exit(1); }
const review = (id, body) => call("PATCH", `/api/officer/complaints/${id}`, officer.token, body);
status("invalid category is rejected", await review(C, { category: "banana", departmentId: dept._id }), 400);
status("malformed department id is rejected", await review(C, { category: "garbage", departmentId: "123" }), 400);
status("department that doesn't exist is rejected", await review(C, { category: "garbage", departmentId: FAKE_ID }), 400);
status("unknown complaint id", await review(FAKE_ID, { category: "garbage", departmentId: dept._id }), 404);
const rv = await review(C, { category: "garbage", departmentId: dept._id });
status("valid review", rv, 200);
check("status becomes 'under_review' and the category is saved", rv.data?.complaint?.status === "under_review" && rv.data?.complaint?.category === "garbage", show(rv));

// ───────────────────────── 7. assigning ─────────────────────────
section("7. Assigning a worker");
const assign = (id, workerId, token = officer.token) => call("PATCH", `/api/officer/complaints/${id}/assign-worker`, token, { workerId });
const c2 = await createComplaint(citizen, "Streetlight not working (never reviewed)");
status("cannot assign a complaint that was never reviewed", await assign(c2.data.complaint._id, worker.id), 409);
status("malformed worker id is rejected", await assign(C, "nope"), 400);
status("worker that doesn't exist", await assign(C, FAKE_ID), 404);
status("a citizen's id is not accepted as a worker", await assign(C, citizen.id), 404);
const as1 = await assign(C, worker.id);
status("valid assignment", as1, 200);
check("status becomes 'assigned' to the right worker", as1.data?.complaint?.status === "assigned" && String(as1.data?.complaint?.assignedWorkerId) === worker.id, show(as1));
status("assigning again is rejected (duplicate action)", await assign(C, worker.id), 409);
status("reviewing after assignment is rejected", await review(C, { category: "water", departmentId: dept._id }), 409);

// ───────────────────────── 8. worker transitions ─────────────────────────
section("8. Worker status changes");
const act = (user, id, action) => call("PATCH", `/api/worker/complaints/${id}/${action}`, user.token);
if (worker2) {
  status("another worker cannot start it", await act(worker2, C, "start"), 404);
  status("another worker cannot resolve it", await act(worker2, C, "resolve"), 404);
}
status("cannot resolve before starting", await act(worker, C, "resolve"), 409);
status("malformed id", await act(worker, "abc", "start"), 400);
const st = await act(worker, C, "start");
status("start work", st, 200);
check("status becomes 'in_progress'", st.data?.complaint?.status === "in_progress", show(st));
status("starting twice is rejected", await act(worker, C, "start"), 409);
if (worker2) status("another worker cannot resolve it while in progress", await act(worker2, C, "resolve"), 404);
const rs = await act(worker, C, "resolve");
status("resolve", rs, 200);
check("status becomes 'resolved'", rs.data?.complaint?.status === "resolved", show(rs));
status("resolving twice is rejected", await act(worker, C, "resolve"), 409);
status("starting a resolved complaint is rejected", await act(worker, C, "start"), 409);

const wl = await call("GET", "/api/worker/complaints", worker.token);
check("worker's list shows it as resolved", wl.data?.complaints?.find((x) => x._id === C)?.status === "resolved", show(wl));
if (worker2) {
  const wl2 = await call("GET", "/api/worker/complaints", worker2.token);
  check("the other worker's list does NOT contain it", !wl2.data?.complaints?.some((x) => x._id === C), "Another worker can see this complaint");
}

// ───────────────────────── 9. persistence ─────────────────────────
section("9. Everything is still there in a brand-new session");
const [cit, off, wrk] = await Promise.all([login("citizen"), login("officer"), login("worker")]);
const seen = await call("GET", `/api/complaints/${C}`, cit.token);
check("citizen sees 'resolved'", seen.data?.complaint?.status === "resolved", show(seen));
const seenO = await officerGet(off, C);
check("officer sees 'resolved', right category, right worker", seenO?.status === "resolved" && seenO?.category === "garbage" && String(seenO?.assignedWorkerId) === worker.id, JSON.stringify(seenO)?.slice(0, 200));
if (seenO) {
  check("resolvedAt / startedAt / assignedAt are saved", !!(seenO.resolvedAt && seenO.startedAt && seenO.assignedAt), `resolvedAt=${seenO.resolvedAt} startedAt=${seenO.startedAt} assignedAt=${seenO.assignedAt} (add the 3 date fields if missing)`);
}
const wl3 = await call("GET", "/api/worker/complaints", wrk.token);
check("worker sees it as 'resolved'", wl3.data?.complaints?.find((x) => x._id === C)?.status === "resolved");

// ───────────────────────── 10. two things at once ─────────────────────────
section("10. Double clicks and races");
const c4 = await createComplaint(citizen, "Race test: two Start Work clicks");
await review(c4.data.complaint._id, { category: "garbage", departmentId: dept._id });
await assign(c4.data.complaint._id, worker.id);
const starts = await Promise.all([act(worker, c4.data.complaint._id, "start"), act(worker, c4.data.complaint._id, "start")]);
const s200 = starts.filter((r) => r.status === 200).length, s409 = starts.filter((r) => r.status === 409).length;
check("two simultaneous Start Work → exactly one succeeds", s200 === 1 && s409 === 1, `got ${starts.map((r) => r.status).join(" and ")}`);

if (worker2) {
  const c3 = await createComplaint(citizen, "Race test: two officers assign at the same moment");
  await review(c3.data.complaint._id, { category: "garbage", departmentId: dept._id });
  const both = await Promise.all([assign(c3.data.complaint._id, worker.id), assign(c3.data.complaint._id, worker2.id)]);
  const ok200 = both.filter((r) => r.status === 200).length;
  ok200 === 1 ? ok("two simultaneous assignments → exactly one succeeds") : warning(`two simultaneous assignments → ${both.map((r) => r.status).join(" and ")}`, "Both succeeded; the last one silently wins. Make assignWorker one atomic findOneAndUpdate (see README)");
}

// ───────────────────────── summary ─────────────────────────
console.log(`\n${"─".repeat(48)}\n${pass} passed, ${fail} failed, ${warn} warnings`);
console.log(`\nTest complaints were created. Delete the ones whose description starts with "[API TEST]":\n  ${created.length} complaints`);
process.exit(fail ? 1 : 0);
