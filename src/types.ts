/** The four EU AI Act risk tiers, plus the roles the Act assigns duties to. */
export type RiskTier = "unacceptable" | "high" | "limited" | "minimal";
export type Role = "provider" | "deployer" | "both";

export type ProhibitedKey =
  | "subliminalManipulation"
  | "exploitVulnerabilities"
  | "socialScoring"
  | "predictivePolicingProfiling"
  | "facialScraping"
  | "emotionRecognitionWorkEducation"
  | "biometricCategorizationSensitive"
  | "realtimeRemoteBiometricIdPublic"
  // Art 5(1)(ba) and (bb), inserted by Regulation (EU) 2026/1744. Both apply
  // from 2 December 2026 — see `appliesFrom` on each practice.
  | "nonConsensualIntimateImagery"
  | "childSexualAbuseMaterial";

export type AnnexIIIKey =
  | "biometrics"
  | "criticalInfrastructure"
  | "educationVocational"
  | "employment"
  | "essentialServices"
  | "creditScoring"
  | "insurance"
  | "lawEnforcement"
  | "migrationBorder"
  | "justiceDemocracy";

export type TransparencyKey =
  | "directInteraction"
  | "syntheticContent"
  | "deepfake"
  | "emotionRecognition"
  | "biometricCategorization"
  | "publicInterestText";

/** The input: a plain description of the AI system under assessment. */
export interface SystemProfile {
  name: string;
  description?: string;
  /** Are you the provider (build/put on market), the deployer (use it), or both? */
  role: Role;
  /** Do you provide a general-purpose AI model? (separate obligation track) */
  gpai?: boolean;
  /** GPAI with systemic risk (>10^25 FLOPs or designated). */
  gpaiSystemicRisk?: boolean;
  /** Article 5 — any true ⇒ Unacceptable (banned). */
  prohibited?: Partial<Record<ProhibitedKey, boolean>>;
  /** Annex I — AI is a safety component of a regulated product. */
  annexIProduct?: boolean;
  /** Annex III — standalone high-risk domains. Any true ⇒ High (unless exempt). */
  annexIII?: Partial<Record<AnnexIIIKey, boolean>>;
  /** Article 6(3) — claim the "no significant risk" exemption (void if profiling). */
  significantRiskException?: boolean;
  /** Does the system profile natural persons? (blocks the Art 6(3) exemption) */
  involvesProfiling?: boolean;
  /** Article 50 — transparency triggers that co-apply regardless of tier. */
  transparency?: Partial<Record<TransparencyKey, boolean>>;
}

export interface Citation {
  article: string;
  label: string;
}

export interface Rationale {
  tier: RiskTier;
  reason: string;
  citation: Citation;
}

export interface Obligation {
  id: string;
  title: string;
  article: string;
  summary: string;
  appliesTo: Role | "all";
  tier: RiskTier | "gpai";
}

export interface ChecklistItem {
  id: string;
  obligation: string;
  article: string;
  status: "todo";
}

/** A dated milestone as the knowledge base records it. */
export interface TimelineMilestone {
  milestone: string;
  /** `YYYY-MM-DD`. */
  date: string;
  note?: string;
  /**
   * True for a change that is proposed but not law. Its status stays
   * "proposed change" whatever its date, because a proposal does not become
   * law by its date arriving.
   */
  proposed?: boolean;
}

/**
 * A milestone with its status on the day of assessment.
 *
 * The status is DERIVED from the date by `timelineAsOf`, never stored: a
 * stored status is correct on the day it is written and wrong from the day
 * the date passes, which is how "2026-08-02: upcoming" outlived its own date.
 */
export interface TimelineEntry extends TimelineMilestone {
  status: "in force" | "upcoming" | "proposed change";
}

export interface Assessment {
  assessedAt: string;
  kbVersion: string;
  system: { name: string; role: Role };
  /** Highest applicable tier. */
  tier: RiskTier;
  gpai: { isGpai: boolean; systemicRisk: boolean };
  rationale: Rationale[];
  /** Article 50 duties, which co-apply on top of the tier. */
  transparencyObligations: Obligation[];
  obligations: Obligation[];
  timeline: TimelineEntry[];
  disclaimer: string;
}

export const TIER_ORDER: RiskTier[] = ["minimal", "limited", "high", "unacceptable"];

export const DISCLAIMER =
  "Sentinel Act is an informational self-assessment aid, not legal advice. The EU AI Act " +
  "(Regulation (EU) 2024/1689) is complex and evolving — confirm any conclusion with qualified counsel.";
