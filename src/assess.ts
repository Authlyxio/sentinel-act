import type { SystemProfile, Assessment, Obligation } from "./types.js";
import { DISCLAIMER } from "./types.js";
import { classify } from "./classify.js";
import { obligationsFor } from "./obligations.js";
import { TRANSPARENCY_TRIGGERS } from "./knowledge/transparency.js";
import { TIMELINE } from "./knowledge/timeline.js";
import { KB_VERSION } from "./knowledge/index.js";

/** Full readiness assessment for a system profile. Pure — no I/O. */
export function assess(p: SystemProfile): Assessment {
  const { tier, rationale, transparency } = classify(p);

  const transparencyObligations: Obligation[] = TRANSPARENCY_TRIGGERS.filter((t) => p.transparency?.[t.key]).map((t) => ({
    id: `TR-${t.key}`,
    title: t.title,
    article: t.article,
    summary: t.note ? `${t.duty} ${t.note}` : t.duty,
    appliesTo: t.responsible,
    tier: "limited",
  }));

  return {
    assessedAt: new Date().toISOString(),
    kbVersion: KB_VERSION,
    system: { name: p.name, role: p.role },
    tier,
    gpai: { isGpai: !!p.gpai, systemicRisk: !!p.gpaiSystemicRisk },
    rationale: [...rationale, ...transparency],
    transparencyObligations,
    obligations: obligationsFor(tier, p),
    timeline: TIMELINE,
    disclaimer: DISCLAIMER,
  };
}
