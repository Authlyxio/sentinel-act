# Sentinel Act ⚖️

[![npm](https://img.shields.io/npm/v/sentinel-act.svg)](https://www.npmjs.com/package/sentinel-act)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![Part of Sentinel Stack](https://img.shields.io/badge/part%20of-Sentinel%20Stack-8957e5.svg)](https://github.com/aadityaparab/sentinel-stack)

**EU AI Act readiness in your terminal.** Classify an AI system's risk tier, get the exact obligations that apply, generate a conformity checklist, and scaffold the starter documents — in about a minute, without a €50k/yr GRC platform.

> ⚠️ **Not legal advice.** Sentinel Act is an informational self-assessment aid based on Regulation (EU) 2024/1689. The Act is complex and evolving — confirm any conclusion with qualified counsel.

```bash
npx sentinel-act classify        # interactive
npx sentinel-act assess my-system.json
```

```
sentinel-act  0.2.1 — EU AI Act, Regulation (EU) 2024/1689 as amended by Regulation (EU) 2026/1744 (as of 2026-09-18)
system: AI Hiring Screener  ·  role: provider

risk tier:   HIGH RISK
  - Employment & worker management (Annex III(4))

obligations that apply (14):
  [Art 9]  Risk management system
  [Art 10] Data & data governance
  [Art 11 / Annex IV] Technical documentation
  [Art 14] Human oversight
  [Art 43] Conformity assessment
  [Art 47] EU declaration of conformity
  [Art 49] Registration in the EU database
  ... 
next milestone:  2026-12-02 — Art 50(2) marking deadline for pre-existing generative AI
your high-risk deadline:  2027-12-02 — High-risk (Annex III) obligations apply
max penalty:  €15,000,000 or 3% of worldwide annual turnover, whichever is higher (Art 99)
```

---

## The four risk tiers

| Tier | Meaning | What Sentinel Act gives you |
| --- | --- | --- |
| **Unacceptable** | Prohibited practices (Art 5) — social scoring, manipulative techniques, untargeted facial scraping, and (from 2 Dec 2026) AI-generated NCII and CSAM. | A clear "must not ship" verdict with the Article 5 citation. |
| **High** | Annex III domains (employment, credit, biometrics…) or Annex I product safety components. | The full obligation set (Art 9–15, 26–27, 43–49, 72–73) + a checklist + starter docs. |
| **Limited** | Transparency triggers (Art 50) — chatbots, deepfakes, synthetic content. **In force since 2 Aug 2026.** | The applicable Art 50 disclosures + a ready-to-adapt transparency notice. |
| **Minimal** | Everything else. | Confirmation and voluntary-code pointers. |

General-purpose AI (GPAI) models carry their own obligations (Art 53, and Art 55 for systemic risk) that **co-apply on top of** the tier.

---

## Commands

```
act classify              Interactive questionnaire, then classify (no file needed)
act assess <profile>      Full assessment (pretty by default; --format json|report|evidence)
act obligations <profile> List the obligations that apply
act checklist <profile>   Emit a working checklist
act report <profile>      Markdown readiness report
act evidence <profile>    Machine-readable classification record (JSON, hashed)
act docs <profile> --out ./out   Generate starter documents
```

A **profile** is a small JSON file describing your system (see [`examples/`](./examples)):

```json
{
  "name": "AI Hiring Screener",
  "role": "provider",
  "annexIII": { "employment": true },
  "involvesProfiling": true
}
```

## Starter documents

For a high-risk system, `act docs` scaffolds the paperwork you'll actually need, pre-filled with your system name and `[TODO]` markers:

- **Annex IV** technical documentation
- **EU Declaration of Conformity** (Art 47)
- **Risk-management summary** (Art 9)
- **Fundamental Rights Impact Assessment** (Art 27, for relevant deployers)
- **Transparency notice** (Art 50, when triggered)

## Compliance evidence as a byproduct

Every assessment can emit a hashed **classification record** (`act evidence`) — a JSON artifact mapping the decision to the Act, suitable for a governance register or audit trail. Same thesis as the rest of [Sentinel Stack](https://github.com/aadityaparab/sentinel-stack): governance falls out of the workflow.

## Use as a library

```ts
import { assess, toReport, generateDocs } from "sentinel-act";

const a = assess({ name: "Support Chatbot", role: "both", transparency: { directInteraction: true } });
console.log(a.tier);              // "limited"
console.log(a.obligations);       // applicable obligations
const md = toReport(a);           // markdown readiness report
const docs = generateDocs(a);     // starter documents
```

## How classification works

Precedence: **Unacceptable → High → Limited → Minimal**. An Annex III system can drop out of "high" via the Article 6(3) "no significant risk" exemption — but not if it profiles people, and the exemption must be registered. Transparency (Art 50) and GPAI obligations are captured separately because they co-apply to any tier.

## Accuracy & sources

Built from Regulation (EU) 2024/1689 and its Annexes, **as amended by Regulation (EU) 2026/1744, the Digital Omnibus on AI** (published in the OJ 24 Jul 2026, in force **27 Jul 2026**). Primary references: the [EU Artificial Intelligence Act text](https://artificialintelligenceact.eu/the-act/) and [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/1689/oj).

**What the Omnibus changed:**

| | Original | Now |
| --- | --- | --- |
| High-risk, Annex III | 2 Aug 2026 | **2 Dec 2027** |
| High-risk, Annex I products | 2 Aug 2027 | **2 Aug 2028** |
| Art 50 transparency | 2 Aug 2026 | **unchanged — in force** |
| Art 4 AI literacy | 2 Feb 2025 | unchanged |
| Art 5 prohibitions | 2 Feb 2025 | + NCII/CSAM ban from **2 Dec 2026** |

**Article 50 in practice.** Its duties bind **providers and deployers** — importers and distributors are within the Act's scope (Art 2) but are not Art 50 duty-bearers. One narrow transitional carve-out applies: generative AI systems already on the market before 2 Aug 2026 have until **2 Dec 2026** to meet the Art 50(2) machine-readable marking duty. It does not extend to systems placed on the market on or after 2 Aug 2026, nor to the Art 50(4) deployer duties (deepfake labelling, public-interest text), which applied from 2 Aug 2026.

**Staying current.** Milestone status is derived from the current date rather than stored, so a deadline cannot keep reporting as "upcoming" after it passes. The knowledge base separately carries an `AS_OF` date recording when the *law itself* was last verified — re-check that before relying on it. The two prohibitions the Omnibus added are cited by their points, Art 5(1)(ba) (non-consensual intimate imagery) and Art 5(1)(bb) (child sexual abuse material); both apply from 2 Dec 2026.

## Roadmap

- [x] Hosted web classifier (GitHub Pages) for non-technical users — see `web/index.html`, deployed from `docs/`
- [ ] Deeper Annex III sub-category questions & Art 6(3) guidance
- [ ] ISO/IEC 42001 & NIST AI RMF control cross-mapping
- [ ] PDF export of the readiness report

## Part of Sentinel Stack

Sibling to [**Sentinel Warden**](https://github.com/aadityaparab/sentinel-warden) (agent supply-chain firewall). See the [Sentinel Stack](https://github.com/aadityaparab/sentinel-stack) family.

## License

MIT © 2026 Aaditya Parab. Informational only — **not legal advice**.
