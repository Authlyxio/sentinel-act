import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { assess, toEvidence } from "../dist/index.js";

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

// ─── Regulation (EU) 2026/1744 — the Digital Omnibus on AI ──────────────────
//
// Published in the OJ on 24 July 2026, in force 27 July 2026. It deferred the
// high-risk regime, gave the Art 50(2) marking duty a grace period for systems
// already on the market, and added two Art 5 prohibitions with their own date.
// Before this, the knowledge base still called the deferral "provisional" and
// showed "2026-08-02: upcoming" seven weeks after that date had passed.

import { timelineAsOf, MILESTONES, keyDateFor, classify, PROHIBITED_PRACTICES, KB_VERSION } from "../dist/index.js";

const at = (d) => new Date(`${d}T12:00:00Z`);

test("timeline status is derived from the date, not stored", () => {
  // The bug this replaces: a stored status is right on the day it is written
  // and wrong from the day its date passes.
  for (const m of MILESTONES) assert.equal("status" in m, false, `${m.milestone} must not carry a stored status`);
  const before = timelineAsOf(at("2027-12-01")).find((t) => t.date === "2027-12-02");
  const on = timelineAsOf(at("2027-12-02")).find((t) => t.date === "2027-12-02");
  assert.equal(before.status, "upcoming");
  assert.equal(on.status, "in force", "a milestone binds on its own day, not the day after");
});

test("timeline is sorted, so the first upcoming entry is the next deadline", () => {
  const dates = timelineAsOf(at("2026-09-18")).map((t) => t.date);
  assert.deepEqual(dates, [...dates].sort());
});

test("high-risk dates are the Digital Omnibus dates", () => {
  const t = timelineAsOf(at("2026-09-18"));
  assert.ok(t.some((e) => e.date === "2027-12-02" && e.milestone.includes("Annex III")), "Annex III: 2 Dec 2027");
  assert.ok(t.some((e) => e.date === "2028-08-02" && e.milestone.includes("Annex I")), "Annex I: 2 Aug 2028");
  // The superseded dates must not survive as high-risk milestones.
  assert.ok(!t.some((e) => e.date === "2026-08-02" && e.milestone.includes("High-risk")), "no high-risk milestone on 2 Aug 2026");
  assert.ok(!t.some((e) => e.date === "2027-08-02"), "no milestone on the superseded 2 Aug 2027 date");
  // And nothing is still described as provisional.
  assert.ok(!t.some((e) => e.status === "proposed change"), "the Omnibus is law, not a proposal");
  assert.ok(!t.some((e) => /provisional|pending formal adoption/i.test(`${e.milestone} ${e.note ?? ""}`)));
});

test("the Art 50(2) grace period is scoped to systems already on the market", () => {
  const grace = MILESTONES.find((m) => m.milestone.includes("Art 50(2)"));
  assert.equal(grace.date, "2026-12-02");
  assert.match(grace.note, /before 2 August 2026/);
  assert.match(grace.note, /from day one/);
});

test("the two new Art 5 prohibitions apply from 2 December 2026", () => {
  const added = PROHIBITED_PRACTICES.filter((p) => p.article === "Art 5(1)(ba)" || p.article === "Art 5(1)(bb)");
  assert.equal(added.length, 2);
  for (const p of added) assert.equal(p.appliesFrom, "2026-12-02");
  // The original eight carry no date of their own: they apply with Art 5.
  assert.equal(PROHIBITED_PRACTICES.filter((p) => !p.appliesFrom).length, 8);
});

test("a system generating non-consensual intimate imagery is unacceptable, and says from when", () => {
  const c = classify({ name: "Nudifier", role: "provider", prohibited: { nonConsensualIntimateImagery: true } });
  assert.equal(c.tier, "unacceptable");
  const r = c.rationale.find((x) => x.citation.article === "Art 5(1)(ba)");
  assert.ok(r, "cites Art 5(1)(ba)");
  assert.match(r.reason, /prohibited from 2026-12-02/);
});

test("an original prohibition carries no date in its reason", () => {
  const c = classify({ name: "Scorer", role: "provider", prohibited: { socialScoring: true } });
  assert.doesNotMatch(c.rationale[0].reason, /prohibited from/);
});

test("the key date is the one that matters for this system", () => {
  // Before: "the next upcoming milestone", which for an employment screener
  // would now be the December 2026 NCII prohibition — dated, true, irrelevant.
  const hiring = assess(ex("hiring-screener.json"));
  assert.equal(keyDateFor(hiring).date, "2027-12-02");
  const nudifier = assess({ name: "Nudifier", role: "provider", prohibited: { nonConsensualIntimateImagery: true } });
  const key = keyDateFor(nudifier);
  // Upcoming until 2 Dec 2026; after that the next generally upcoming date.
  if (new Date().toISOString().slice(0, 10) < "2026-12-02") assert.equal(key.date, "2026-12-02");
});

test("the knowledge base names the amending regulation", () => {
  assert.match(KB_VERSION, /2026\/1744/);
});
