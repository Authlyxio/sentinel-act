import type { TransparencyKey, Role } from "../types.js";

export interface TransparencyTrigger {
  key: TransparencyKey;
  title: string;
  article: string;
  duty: string;
  responsible: Role;
  /** Timing or scope caveats that qualify the duty. */
  note?: string;
}

/**
 * Article 50 — transparency obligations. These co-apply on top of the risk tier.
 *
 * In force since 2 August 2026 and untouched by the Digital Omnibus, which
 * deferred the high-risk regimes but left Art 50 on its original schedule.
 * Duty-bearers are providers and deployers; importers and distributors fall
 * within the Act's scope (Art 2) but carry no Art 50 duties of their own.
 */
export const TRANSPARENCY_TRIGGERS: TransparencyTrigger[] = [
  {
    key: "directInteraction",
    title: "Direct interaction with people (chatbots)",
    article: "Art 50(1)",
    duty: "Inform natural persons that they are interacting with an AI system, unless it is obvious from the context.",
    responsible: "provider",
  },
  {
    key: "syntheticContent",
    title: "AI-generated audio, image, video or text",
    article: "Art 50(2)",
    duty: "Mark outputs in a machine-readable format and make them detectable as artificially generated or manipulated.",
    responsible: "provider",
    note:
      "Generative AI systems already on the market before 2 Aug 2026 have until 2 Dec 2026 to meet this marking duty. The grace period is narrow: it does not cover systems placed on the market on or after 2 Aug 2026, and it does not affect the Art 50(4) deployer duties, which applied from 2 Aug 2026.",
  },
  {
    key: "deepfake",
    title: "Deepfakes",
    article: "Art 50(4)",
    duty: "Disclose that the image, audio or video content has been artificially generated or manipulated.",
    responsible: "deployer",
  },
  {
    key: "emotionRecognition",
    title: "Emotion recognition system",
    article: "Art 50(3)",
    duty: "Inform the natural persons exposed to it that the system is operating (where the use is not prohibited).",
    responsible: "deployer",
  },
  {
    key: "biometricCategorization",
    title: "Biometric categorisation system",
    article: "Art 50(3)",
    duty: "Inform the natural persons exposed to it that the system is operating (where the use is not prohibited).",
    responsible: "deployer",
  },
  {
    key: "publicInterestText",
    title: "AI-generated text on matters of public interest",
    article: "Art 50(4)",
    duty: "Disclose that the text was artificially generated or manipulated when published to inform the public on matters of public interest.",
    responsible: "deployer",
  },
];
