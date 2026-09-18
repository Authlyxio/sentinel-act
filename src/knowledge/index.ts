/** Knowledge-base version. Bump when rules/citations/timeline change. */
export const KB_VERSION = "0.2.0 — EU AI Act, Regulation (EU) 2024/1689 as amended by Regulation (EU) 2026/1744 (as of 2026-09-18)";

export { PROHIBITED_PRACTICES } from "./prohibited.js";
export type { ProhibitedPractice } from "./prohibited.js";
export { ANNEX_III_DOMAINS } from "./high-risk.js";
export type { HighRiskDomain } from "./high-risk.js";
export { TRANSPARENCY_TRIGGERS } from "./transparency.js";
export type { TransparencyTrigger } from "./transparency.js";
export {
  HIGH_RISK_PROVIDER,
  HIGH_RISK_DEPLOYER,
  GPAI_OBLIGATIONS,
  GPAI_SYSTEMIC,
  LIMITED_RISK_NOTE,
  MINIMAL_RISK_NOTE,
} from "./obligations.js";
export { TIMELINE, MILESTONES, PENALTIES, AS_OF, timelineAsOf, ANNEX_III_APPLIES, ANNEX_I_APPLIES } from "./timeline.js";
export type { Penalty } from "./timeline.js";
