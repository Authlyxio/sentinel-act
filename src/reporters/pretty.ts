import type { Assessment, RiskTier } from "../types.js";
import { PENALTIES } from "../knowledge/timeline.js";

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
  // The globally next milestone is not necessarily *this* system's deadline, so
  // label it plainly and call out the high-risk dates separately when they apply.
  const next = a.timeline.find((t) => t.status === "upcoming");
  if (next) out.push(p(`next milestone:  ${next.date} — ${next.milestone}`, C.dim));
  if (a.tier === "high") {
    for (const hr of a.timeline.filter((t) => t.status === "upcoming" && t.track === "high")) {
      out.push(p(`your high-risk deadline:  ${hr.date} — ${hr.milestone}`, C.dim));
    }
  }
  const pen = a.tier === "unacceptable" ? PENALTIES[0] : a.tier === "minimal" ? null : PENALTIES[1];
  if (pen) out.push(p(`max penalty:  ${pen.max} (${pen.article})`, C.dim));

  out.push("");
  out.push(p("! " + a.disclaimer, C.yellow));
  return out.join("\n");
}
