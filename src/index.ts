/**
 * sentinel-act — public library API.
 * Classify an AI system under the EU AI Act, map obligations, and generate
 * readiness artifacts. Informational only — not legal advice.
 */
export * from "./types.js";
export { classify } from "./classify.js";
export type { Classification } from "./classify.js";
export { assess } from "./assess.js";
export { obligationsFor } from "./obligations.js";
export { checklist } from "./checklist.js";
export { pretty } from "./reporters/pretty.js";
export { toReport } from "./reporters/report.js";
export { toEvidence } from "./reporters/evidence.js";
export { generateDocs } from "./docs/templates.js";
export type { GeneratedDoc } from "./docs/templates.js";

export { KB_VERSION } from "./knowledge/index.js";
export {
  PROHIBITED_PRACTICES,
  ANNEX_III_DOMAINS,
  TRANSPARENCY_TRIGGERS,
  TIMELINE,
  PENALTIES,
  AS_OF,
  timelineAsOf,
} from "./knowledge/index.js";
