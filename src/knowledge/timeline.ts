import type { TimelineEntry } from "../types.js";

/**
 * The date the legal content of this knowledge base was last verified against
 * primary sources. Milestone status is derived from the *current* date (see
 * `timelineAsOf`), so a date that passes does not silently go stale; AS_OF
 * records how recently the underlying law itself was re-checked.
 */
export const AS_OF = "2026-09-18";

/**
 * A dated milestone in the Act's application schedule.
 *
 * `status` is deliberately not stored: it is derived from the date, so a
 * milestone cannot report as "upcoming" after it has already passed. Set
 * `status` only to flag a change that is not yet law.
 */
export interface TimelineFact {
  milestone: string;
  date: string;
  status?: "proposed change";
  note?: string;
  /** Marks milestones that gate the high-risk regime specifically. */
  track?: "high";
}

/**
 * Application dates under Regulation (EU) 2024/1689, as amended by
 * Regulation (EU) 2026/1744, the "Digital Omnibus on AI" (in force 27 July
 * 2026), which deferred both high-risk regimes, added two Article 5
 * prohibitions (points (ba) and (bb)), and left the Article 50 transparency
 * duties and Article 4 AI-literacy duty untouched.
 */
export const TIMELINE_FACTS: TimelineFact[] = [
  { milestone: "AI Act enters into force", date: "2024-08-01" },
  { milestone: "Prohibited practices (Art 5) & AI-literacy duties apply", date: "2025-02-02" },
  { milestone: "GPAI model obligations, governance bodies & penalties apply", date: "2025-08-02" },
  {
    milestone: "Digital Omnibus on AI (Regulation (EU) 2026/1744) enters into force, amending the AI Act",
    date: "2026-07-27",
    note:
      "Published in the Official Journal 24 Jul 2026. Defers the high-risk regimes (Annex III to 2 Dec 2027, Annex I to 2 Aug 2028) and adds two Art 5 prohibitions, points (ba) and (bb). Article 50 transparency and the Art 4 AI-literacy duty are unchanged.",
  },
  {
    milestone: "Art 50 transparency duties & remaining general provisions apply",
    date: "2026-08-02",
    note:
      "Not deferred by the Digital Omnibus. Enforceable by national market surveillance authorities from this date. Art 50 binds providers and deployers; importers and distributors are within the Act's scope (Art 2) but are not duty-bearers under Art 50.",
  },
  {
    milestone: "Art 50(2) marking deadline for pre-existing generative AI; new Art 5(1)(ba)–(bb) prohibitions apply",
    date: "2026-12-02",
    note:
      "Two duties land together. (1) Providers of generative AI systems already on the market before 2 Aug 2026 must by now mark outputs in a machine-readable format — this grace period does not extend to systems placed on the market on or after 2 Aug 2026, nor to the Art 50(4) deployer duties, which applied from 2 Aug 2026. (2) The new prohibitions on AI-generated non-consensual intimate imagery (Art 5(1)(ba)) and child sexual abuse material (Art 5(1)(bb)) start to apply.",
  },
  {
    milestone: "High-risk (Annex III) obligations apply",
    date: "2027-12-02",
    note: "Deferred from 2 Aug 2026 by the Digital Omnibus, now in force. This is the binding date.",
    track: "high",
  },
  {
    milestone: "High-risk safety components of regulated products (Annex I) apply",
    date: "2028-08-02",
    note: "Deferred from 2 Aug 2027 by the Digital Omnibus, now in force.",
    track: "high",
  },
];

/** Today as YYYY-MM-DD (UTC) — the basis for deriving milestone status. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The timeline as it stands on a given date, sorted chronologically.
 * A milestone dated on or before `asOf` is "in force"; later ones are
 * "upcoming", unless explicitly flagged as a change that is not yet law.
 */
export function timelineAsOf(asOf: string = todayIso()): TimelineEntry[] {
  return [...TIMELINE_FACTS]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((f) => ({
      milestone: f.milestone,
      date: f.date,
      status: f.status ?? (f.date <= asOf ? ("in force" as const) : ("upcoming" as const)),
      ...(f.note ? { note: f.note } : {}),
      ...(f.track ? { track: f.track } : {}),
    }));
}

/** The timeline as of now. */
export const TIMELINE: TimelineEntry[] = timelineAsOf();

export interface Penalty {
  violation: string;
  max: string;
  article: string;
  note?: string;
}

const SME_CAVEAT =
  "For SMEs and start-ups the cap is the lower of the two figures, not the higher (Art 99(6)).";

export const PENALTIES: Penalty[] = [
  {
    violation: "Prohibited AI practices (Art 5)",
    max: "€35,000,000 or 7% of worldwide annual turnover, whichever is higher",
    article: "Art 99",
    note: SME_CAVEAT,
  },
  {
    violation: "Breach of other obligations (incl. high-risk & Art 50 transparency)",
    max: "€15,000,000 or 3% of worldwide annual turnover, whichever is higher",
    article: "Art 99",
    note: SME_CAVEAT,
  },
  {
    violation: "Supplying incorrect, incomplete or misleading information",
    max: "€7,500,000 or 1% of worldwide annual turnover, whichever is higher",
    article: "Art 99",
    note: SME_CAVEAT,
  },
  {
    violation: "GPAI provider obligations",
    max: "€15,000,000 or 3% of worldwide annual turnover, whichever is higher",
    article: "Art 101",
  },
  {
    violation: "EU institutions, bodies, offices & agencies",
    max: "€750,000",
    article: "Art 100",
    note: "A separate, lower tier applying to Union bodies rather than private operators.",
  },
];
