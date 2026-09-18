import type { TimelineEntry, TimelineMilestone } from "../types.js";

/**
 * The date this knowledge base reflects. Update when the law/timeline changes.
 *
 * Note what this is NOT used for any more: working out whether a milestone has
 * happened. That used to be a hardcoded `status` on each entry, and it rotted —
 * "High-risk (Annex III) … 2026-08-02: upcoming" was still being shown seven
 * weeks after that date had passed, and after the Digital Omnibus had moved it.
 * Status is now derived from the date at the moment of assessment; see
 * `timelineAsOf`.
 */
export const AS_OF = "2026-09-18";

/** When stand-alone Annex III high-risk obligations apply (Reg. (EU) 2026/1744). */
export const ANNEX_III_APPLIES = "2027-12-02";

/** When high-risk obligations apply to AI in Annex I regulated products (Reg. (EU) 2026/1744). */
export const ANNEX_I_APPLIES = "2028-08-02";

/**
 * The milestones, in date order.
 *
 * Regulation (EU) 2024/1689 as amended by Regulation (EU) 2026/1744 — the
 * "Digital Omnibus on AI" — published in the Official Journal on 24 July 2026
 * and in force since 27 July 2026. It moved the two high-risk dates, gave the
 * Article 50(2) marking duty a grace period for systems already on the market,
 * and added two prohibitions to Article 5 that apply on their own later date.
 */
export const MILESTONES: TimelineMilestone[] = [
  { milestone: "AI Act enters into force", date: "2024-08-01" },
  { milestone: "Prohibited practices (Art 5(1)(a)–(h)) & AI-literacy duties (Art 4) apply", date: "2025-02-02" },
  { milestone: "GPAI model obligations, governance bodies & penalties apply", date: "2025-08-02" },
  {
    milestone: "Digital Omnibus on AI — Regulation (EU) 2026/1744 — enters into force",
    date: "2026-07-27",
    note: "Published in the Official Journal on 24 July 2026. Defers the high-risk regime (below) and adds two prohibitions to Article 5.",
  },
  {
    milestone: "Transparency duties (Art 50) & remaining general provisions apply",
    date: "2026-08-02",
    note: "Not deferred by the Digital Omnibus.",
  },
  {
    milestone: "New prohibitions apply: non-consensual intimate imagery & CSAM (Art 5(1)(ba)–(bb))",
    date: "2026-12-02",
    note: "Inserted by Regulation (EU) 2026/1744, which sets their own application date rather than applying them on entry into force.",
  },
  {
    milestone: "Grace period ends for marking AI-generated content (Art 50(2))",
    date: "2026-12-02",
    note: "Only for generative systems already placed on the Union market before 2 August 2026. A system placed on the market on or after that date must mark its output from day one.",
  },
  {
    milestone: "High-risk obligations apply to stand-alone Annex III systems",
    date: ANNEX_III_APPLIES,
    note: "Deferred from 2 August 2026 by Regulation (EU) 2026/1744.",
  },
  {
    milestone: "High-risk obligations apply to AI in Annex I regulated products",
    date: ANNEX_I_APPLIES,
    note: "Deferred from 2 August 2027 by Regulation (EU) 2026/1744.",
  },
];

/** Today as `YYYY-MM-DD` in UTC — the form every milestone date is written in. */
function isoDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/**
 * The timeline as it stands on a given day.
 *
 * A milestone on or before `now` is "in force"; one after it is "upcoming"; one
 * that is only proposed stays "proposed change" whatever its date, because a
 * proposal does not become law by its date arriving. Sorted by date, so the
 * first "upcoming" entry is genuinely the next deadline rather than whichever
 * happened to be written first.
 *
 * Compared as ISO date strings rather than parsed into Dates: they sort
 * lexicographically, and parsing a bare date would reintroduce the time-zone
 * question a date without a time exists to avoid.
 */
export function timelineAsOf(now: Date = new Date()): TimelineEntry[] {
  const today = isoDay(now);
  return [...MILESTONES]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      ...m,
      status: m.proposed ? "proposed change" : m.date <= today ? "in force" : "upcoming",
    }));
}

/**
 * The timeline as of when this module was loaded.
 *
 * Kept for the existing public API. Prefer `timelineAsOf(now)`: a long-running
 * process that imported this module months ago would otherwise be reading the
 * statuses of the day it started, which is the same rot in a smaller form.
 * `assess()` uses `timelineAsOf` with its own timestamp.
 */
export const TIMELINE: TimelineEntry[] = timelineAsOf();

export interface Penalty {
  violation: string;
  max: string;
  article: string;
}

export const PENALTIES: Penalty[] = [
  { violation: "Prohibited AI practices (Art 5)", max: "€35,000,000 or 7% of worldwide annual turnover", article: "Art 99" },
  { violation: "Breach of other obligations (incl. high-risk & transparency)", max: "€15,000,000 or 3% of worldwide annual turnover", article: "Art 99" },
  { violation: "Supplying incorrect, incomplete or misleading information", max: "€7,500,000 or 1% of worldwide annual turnover", article: "Art 99" },
  { violation: "GPAI provider obligations", max: "€15,000,000 or 3% of worldwide annual turnover", article: "Art 101" },
];
