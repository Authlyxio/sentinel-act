import type { Assessment, RiskTier, TimelineEntry } from "../types.js";
import { PENALTIES, ANNEX_III_APPLIES, ANNEX_I_APPLIES } from "../knowledge/timeline.js";
import { PROHIBITED_PRACTICES } from "../knowledge/prohibited.js";

const C: Record<string, string> = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[90m",
  red: "\x1b[31m",
  redbg: "\x1b[41m\x1b[97m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
};

const TIER_STYLE: Record<RiskTier, string> = {
  unacceptable: C.redbg,
  high: C.red,
  limited: C.yellow,
  minimal: C.green,
};

const TIER_LABEL: Record<RiskTier, string> = {
  unacceptable: "UNACCEPTABLE — PROHIBITED",
  high: "HIGH RISK",
  limited: "LIMITED RISK",
  minimal: "MINIMAL RISK",
};

export function pretty(a: Assessment, color = true): string {
  const p = (s: string, code: string) => (color ? code + s + C.reset : s);
  const out: string[] = [];

  out.push(p("sentinel-act", C.bold) + p(`  ${a.kbVersion}`, C.dim));
  out.push(p(`system: ${a.system.name}  ·  role: ${a.system.role}`, C.dim));
  out.push("");
  out.push("risk tier:  " + p(` ${TIER_LABEL[a.tier]} `, TIER_STYLE[a.tier]));
  for (const r of a.rationale) out.push(`  - ${r.reason} ${p(`(${r.citation.article})`, C.dim)}`);
  if (a.gpai.isGpai) {
    out.push(p(`  - General-purpose AI model: GPAI obligations apply${a.gpai.systemicRisk ? " (systemic risk)" : ""}`, C.dim));
  }
  out.push("");

  if (a.tier === "unacceptable") {
    out.push(p("This practice is prohibited under Article 5 — it must not be placed on the market or put into service.", C.red));
  } else {
    out.push(p(`obligations that apply (${a.obligations.length}):`, C.bold));
    for (const o of a.obligations) out.push(`  ${p(`[${o.article}]`, C.dim)} ${o.title}`);
  }

  if (a.transparencyObligations.length > 0) {
    out.push("");
    out.push(p("transparency duties (Art 50, co-apply):", C.bold));
    for (const o of a.transparencyObligations) out.push(`  ${p(`[${o.article}]`, C.dim)} ${o.title}`);
  }

  out.push("");
  const key = keyDateFor(a);
  if (key) out.push(p(`key date:  ${key.date} — ${key.milestone}`, C.dim));
  const pen = a.tier === "unacceptable" ? PENALTIES[0] : a.tier === "minimal" ? null : PENALTIES[1];
  if (pen) out.push(p(`max penalty:  ${pen.max} (${pen.article})`, C.dim));

  out.push("");
  out.push(p("! " + a.disclaimer, C.yellow));
  return out.join("\n");
}

/**
 * The date that matters for THIS system, not simply the next date on the list.
 *
 * "The next upcoming milestone" used to be the answer, and it happened to be
 * right while the next milestone was the high-risk date. Once the Digital
 * Omnibus moved that date and added two prohibitions on an earlier one, the
 * next milestone for an employment screener became "non-consensual intimate
 * imagery is prohibited" — true, dated, and irrelevant to the reader.
 *
 * So: a high-risk system gets its own high-risk date (Annex I products later
 * than stand-alone Annex III); a system caught by a prohibition that has its
 * own later date gets that date; anything else gets the next upcoming one.
 */
export function keyDateFor(a: Assessment): TimelineEntry | undefined {
  const at = (date: string) => a.timeline.find((t) => t.date === date);
  if (a.tier === "high") {
    const annexI = a.rationale.some((r) => r.citation.article.includes("Annex I /"));
    return at(annexI ? ANNEX_I_APPLIES : ANNEX_III_APPLIES);
  }
  if (a.tier === "unacceptable") {
    const later = PROHIBITED_PRACTICES
      .filter((pr) => pr.appliesFrom && a.rationale.some((r) => r.citation.article === pr.article))
      .map((pr) => pr.appliesFrom as string)
      .sort()[0];
    if (later) {
      const dated = a.timeline.find((t) => t.date === later && t.milestone.includes("prohibitions"));
      if (dated && dated.status === "upcoming") return dated;
    }
  }
  return a.timeline.find((t) => t.status === "upcoming");
}
