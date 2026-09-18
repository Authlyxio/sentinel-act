import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { assess, toEvidence, timelineAsOf, TRANSPARENCY_TRIGGERS, PROHIBITED_PRACTICES } from "../dist/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const ex = (f) => JSON.parse(readFileSync(join(here, "..", "examples", f), "utf8"));

test("employment screener => HIGH risk with provider obligations", () => {
  const a = assess(ex("hiring-screener.json"));
  assert.equal(a.tier, "high");
  assert.ok(a.obligations.some((o) => o.id === "HR-P-11"), "expects Annex IV technical documentation");
  assert.ok(a.rationale.some((r) => r.citation.article.includes("Annex III(4)")), "cites employment domain");
});

test("support chatbot => LIMITED risk with Article 50 transparency", () => {
  const a = assess(ex("support-chatbot.json"));
  assert.equal(a.tier, "limited");
  assert.ok(a.transparencyObligations.some((o) => o.article.startsWith("Art 50")));
});

test("spam filter => MINIMAL risk", () => {
  const a = assess(ex("spam-filter.json"));
  assert.equal(a.tier, "minimal");
});

test("social scoring => UNACCEPTABLE (prohibited, no obligation list)", () => {
  const a = assess(ex("social-scoring.json"));
  assert.equal(a.tier, "unacceptable");
  assert.equal(a.obligations.length, 0);
  assert.ok(a.rationale.some((r) => r.citation.article === "Art 5(1)(c)"));
});

test("GPAI model => GPAI obligations apply on top of tier", () => {
  const a = assess(ex("gpai-model.json"));
  assert.equal(a.gpai.isGpai, true);
  assert.ok(a.obligations.some((o) => o.tier === "gpai"));
});

test("evidence record carries a sha256 digest", () => {
  const e = toEvidence(assess(ex("spam-filter.json")));
  assert.equal(e.integrity.algorithm, "sha256");
  assert.match(e.integrity.digest, /^[a-f0-9]{64}$/);
});

// --- Timeline currency ---------------------------------------------------
// The 0.1.0 knowledge base hardcoded `status`, so 2026-08-02 kept reporting as
// "upcoming" after it passed. Status is now derived; these guard the invariant.

test("no milestone that has already passed reports as upcoming", () => {
  const today = new Date().toISOString().slice(0, 10);
  for (const t of assess(ex("spam-filter.json")).timeline) {
    if (t.date <= today) {
      assert.notEqual(t.status, "upcoming", `${t.date} (${t.milestone}) passed but reports upcoming`);
    }
  }
});

test("timelineAsOf derives status from the date it is given", () => {
  // The day before the Digital Omnibus entered into force.
  const before = timelineAsOf("2026-07-26");
  const omnibusBefore = before.find((t) => t.date === "2026-07-27");
  assert.equal(omnibusBefore.status, "upcoming");
  assert.equal(before.find((t) => t.date === "2026-08-02").status, "upcoming");

  // Today: Omnibus and Art 50 are both live.
  const now = timelineAsOf("2026-08-12");
  assert.equal(now.find((t) => t.date === "2026-07-27").status, "in force");
  assert.equal(now.find((t) => t.date === "2026-08-02").status, "in force");
});

test("timeline is chronologically sorted so the first upcoming entry is the next one", () => {
  const dates = timelineAsOf("2026-08-12").map((t) => t.date);
  assert.deepEqual(dates, [...dates].sort(), "timeline must be date-sorted");
});

test("Digital Omnibus deferrals are encoded as binding, not proposed", () => {
  const tl = timelineAsOf("2026-08-12");
  const annexIII = tl.find((t) => t.milestone.includes("Annex III"));
  const annexI = tl.find((t) => t.milestone.includes("Annex I)"));
  assert.equal(annexIII.date, "2027-12-02");
  assert.equal(annexI.date, "2028-08-02");
  for (const t of tl) assert.notEqual(t.status, "proposed change", "the Omnibus is in force, not proposed");
});

// --- Article 50 ----------------------------------------------------------

test("Art 50(2) records the 2 Dec 2026 marking grace period for legacy systems", () => {
  const synthetic = TRANSPARENCY_TRIGGERS.find((t) => t.key === "syntheticContent");
  assert.match(synthetic.note, /2 Dec 2026/);
  assert.equal(synthetic.responsible, "provider");
});

test("Art 50 duties bind providers and deployers only", () => {
  for (const t of TRANSPARENCY_TRIGGERS) {
    assert.ok(["provider", "deployer", "both"].includes(t.responsible), `${t.key} has role ${t.responsible}`);
  }
});

// --- New Art 5 prohibition -----------------------------------------------

// Both apply from 2026-12-02. Before that date the reason must say so rather
// than assert a ban that is not live; from that date it must not. Asserting
// only the first made this test a time bomb for 3 December 2026.
const OMNIBUS_BANS_APPLY = "2026-12-02";
const bansInForce = new Date().toISOString().slice(0, 10) >= OMNIBUS_BANS_APPLY;

for (const [key, point] of [
  ["nonConsensualIntimateImagery", "Art 5(1)(ba)"],
  ["childSexualAbuseMaterial", "Art 5(1)(bb)"],
]) {
  test(`${point} => UNACCEPTABLE, with its start date until it applies`, () => {
    const a = assess({ name: "Image generator", role: "provider", prohibited: { [key]: true } });
    assert.equal(a.tier, "unacceptable");
    const r = a.rationale.find((x) => x.citation.article === point);
    assert.ok(r, `expects a rationale citing ${point}`);
    assert.equal(/prohibited from 2026-12-02/.test(r.reason), !bansInForce, r.reason);
  });
}

test("every Art 5 prohibition cites a point of Art 5(1)", () => {
  // 0.2.0 cited the Omnibus bans as "Art 5 (as amended by the Digital
  // Omnibus)"; each is now its own point, and nothing is cited without one.
  for (const pr of PROHIBITED_PRACTICES) {
    assert.match(pr.article, /^Art 5\(1\)\([a-z]{1,2}\)$/, `${pr.key}: ${pr.article}`);
  }
  const keys = PROHIBITED_PRACTICES.map((p) => p.key);
  assert.equal(new Set(keys).size, keys.length, "prohibition keys are unique");
});

test("high-risk assessment surfaces its own deadline, not just the next global one", () => {
  const a = assess(ex("hiring-screener.json"));
  const hr = a.timeline.filter((t) => t.track === "high" && t.status === "upcoming");
  assert.ok(hr.length > 0, "high-risk milestones must be tagged and upcoming");
  assert.ok(hr.some((t) => t.date === "2027-12-02"));
});
