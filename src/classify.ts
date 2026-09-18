import type { SystemProfile, RiskTier, Rationale } from "./types.js";
import { PROHIBITED_PRACTICES } from "./knowledge/prohibited.js";
import { ANNEX_III_DOMAINS } from "./knowledge/high-risk.js";
import { TRANSPARENCY_TRIGGERS } from "./knowledge/transparency.js";
import { todayIso } from "./knowledge/timeline.js";

export interface Classification {
  tier: RiskTier;
  rationale: Rationale[];
  /** Article 50 duties that co-apply regardless of tier. */
  transparency: Rationale[];
}

/**
 * Classify a system into the highest applicable EU AI Act risk tier.
 * Order of precedence: Unacceptable → High → Limited → Minimal.
 * Transparency (Art 50) is captured separately because it co-applies to any tier.
 */
export function classify(p: SystemProfile): Classification {
  const rationale: Rationale[] = [];

  // 1. Unacceptable risk (Article 5)
  const today = todayIso();
  const prohibitedHits = PROHIBITED_PRACTICES.filter((pr) => p.prohibited?.[pr.key]);
  for (const pr of prohibitedHits) {
    // A ban added after the original Art 5 set may not have started to apply yet.
    // Say so rather than assert a prohibition that is not live.
    const pending = pr.appliesFrom !== undefined && pr.appliesFrom > today;
    rationale.push({
      tier: "unacceptable",
      reason: pending ? `${pr.title} — prohibited from ${pr.appliesFrom}` : pr.title,
      citation: { article: pr.article, label: pr.title },
    });
  }

  // 2. High risk (Annex I products, or Annex III domains subject to the Art 6(3) exemption)
  let high = false;
  if (p.annexIProduct) {
    high = true;
    rationale.push({
      tier: "high",
      reason: "AI is a safety component of a product covered by EU harmonisation legislation (Annex I).",
      citation: { article: "Annex I / Art 6(1)", label: "Annex I product" },
    });
  }

  const annexHits = ANNEX_III_DOMAINS.filter((d) => p.annexIII?.[d.key]);
  if (annexHits.length > 0) {
    const list = annexHits.map((d) => d.title).join(", ");
    if (p.significantRiskException && !p.involvesProfiling) {
      rationale.push({
        tier: "limited",
        reason: `Falls in Annex III area(s) [${list}], but the 'no significant risk' exemption is claimed. The exemption must be documented and registered.`,
        citation: { article: "Art 6(3)", label: "High-risk exemption" },
      });
    } else {
      high = true;
      for (const d of annexHits) {
        rationale.push({ tier: "high", reason: d.title, citation: { article: d.annex, label: d.title } });
      }
      if (p.significantRiskException && p.involvesProfiling) {
        rationale.push({
          tier: "high",
          reason: "The Art 6(3) exemption is not available because the system performs profiling of natural persons.",
          citation: { article: "Art 6(3)", label: "Profiling — exemption void" },
        });
      }
    }
  }

  // 3. Transparency (Article 50) — co-applies on top of the tier
  const transparency: Rationale[] = TRANSPARENCY_TRIGGERS.filter((t) => p.transparency?.[t.key]).map((t) => ({
    tier: "limited" as RiskTier,
    reason: `${t.title}: ${t.duty}`,
    citation: { article: t.article, label: t.title },
  }));

  // 4. Resolve the headline tier
  let tier: RiskTier;
  if (prohibitedHits.length > 0) tier = "unacceptable";
  else if (high) tier = "high";
  else if (transparency.length > 0) tier = "limited";
  else tier = "minimal";

  if (tier === "minimal") {
    rationale.push({
      tier: "minimal",
      reason: "No prohibited, high-risk, or transparency triggers were identified from the profile.",
      citation: { article: "Art 95", label: "Minimal risk" },
    });
  }

  return { tier, rationale, transparency };
}
