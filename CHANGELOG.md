# Changelog

All notable changes are documented here. Format based on Keep a Changelog; versioning follows SemVer.

## [0.2.1] - Unreleased

### Changed
- **The Omnibus prohibitions are cited by their points.** Regulation (EU) 2026/1744 (OJ 24 Jul 2026) inserts them into Art 5(1) as points **(ba)**, AI-generated non-consensual intimate imagery, and **(bb)**, AI-generated child sexual abuse material; both apply from **2 Dec 2026** under the amended Art 113. 0.2.0 cited them together as "Art 5 (as amended by the Digital Omnibus)" while the numbering was unconfirmed. They are now two entries, so a system can be flagged for one without the other; `ProhibitedKey` gains `childSexualAbuseMaterial`.
- The Digital Omnibus is named by its regulation number throughout. `AS_OF` → 2026-09-18; knowledge base version → `0.2.1`.

### Fixed
- **A test that would have started failing on 3 Dec 2026.** The NCII test asserted "prohibited from 2026-12-02" unconditionally, but from that date the ban applies and the reason rightly drops the phrase. It now expects whichever reason is correct on the day it runs.

## [0.2.0] - 2026-08-12

Legal-currency release. The knowledge base was dated 2026-07-16, which predated
the Digital Omnibus on AI entering into force on 27 July 2026. Every date below
is re-verified against primary sources.

### Fixed
- **The timeline reported milestones that had already passed as "upcoming."** Status is now derived from the current date instead of being stored as a literal, so a deadline cannot silently go stale again. `AS_OF` is retained, but now means "when the law was last verified" rather than doubling as the clock.
- **High-risk deadlines were wrong in both directions.** Annex III moves 2 Aug 2026 → **2 Dec 2027**, and Annex I products 2 Aug 2027 → **2 Aug 2028**, per the Digital Omnibus. The Omnibus deferral is no longer labelled "proposed"; it is in force.
- **The 2026-08-02 milestone bundled two things that have since diverged.** It now covers Art 50 transparency and the remaining general provisions only; the high-risk regimes are separate, later entries.
- A high-risk assessment no longer presents the globally-next milestone as if it were its own deadline. `key date` is now `next milestone`, with the Annex III/Annex I dates surfaced separately for high-risk systems.

### Added
- New Art 5 prohibition on AI-generated non-consensual intimate imagery and CSAM, applying from **2 Dec 2026**. Prohibitions carry an optional `appliesFrom`, so a ban that has not yet started is reported as "prohibited from <date>" rather than asserted as live. Cited as "Art 5 (as amended by the Digital Omnibus)" — the sub-paragraph numbering in the published text is not yet settled.
- The Art 50(2) transitional period: generative AI systems already on the market before 2 Aug 2026 have until **2 Dec 2026** to meet the machine-readable marking duty, with the limits of that carve-out recorded alongside it.
- Timeline entry for the Digital Omnibus entering into force (27 Jul 2026).
- Penalties now state "whichever is higher", note the Art 99(6) inversion for SMEs and start-ups, and include the separate €750,000 tier for EU institutions and bodies (Art 100).
- `timelineAsOf(date)` and `AS_OF` are exported for deterministic, point-in-time queries.

### Changed
- Knowledge base version → `0.2.0`, `AS_OF` → 2026-08-12.
- The hosted web classifier mirrors all of the above, including date-derived status.

## [0.1.0] - 2026-07-16

### Added
- Initial public release. Informational EU AI Act readiness toolkit (not legal advice).
- Risk-tier classifier (Unacceptable / High / Limited / Minimal) with Article-level citations and the Article 6(3) exemption logic.
- Article 5 prohibited practices, Annex III high-risk domains, and Article 50 transparency triggers encoded as a versioned knowledge base.
- Obligation mapping for high-risk providers (Art 9–15, 17, 43–49, 72–73), high-risk deployers (Art 26–27, 86), and GPAI providers (Art 53, and Art 55 for systemic risk).
- Reporters: human-readable, JSON, Markdown readiness report, and a hashed compliance-evidence record.
- Starter document generator: Annex IV technical documentation, EU Declaration of Conformity, risk-management summary, FRIA, and transparency notice.
- Interactive `classify` questionnaire plus file-driven `assess / obligations / checklist / report / evidence / docs` commands.
- Timeline and penalties, including the provisional Digital Omnibus deferral, with an `AS_OF` date.
- Zero runtime dependencies; ships as ESM with type declarations.
