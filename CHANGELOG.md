# Changelog

All notable changes are documented here. Format based on Keep a Changelog; versioning follows SemVer.

## [Unreleased]

### Changed
- **Knowledge base updated for Regulation (EU) 2026/1744** (the Digital Omnibus on AI), published in the Official Journal on 24 July 2026 and in force since 27 July 2026. 0.1.0 described the Omnibus as a provisional agreement and told readers to treat 2 August 2026 as the binding high-risk date; it was adopted, and that date no longer binds.
- High-risk obligations: stand-alone Annex III systems from **2 December 2027** (was 2 August 2026); AI in Annex I regulated products from **2 August 2028** (was 2 August 2027).
- Timeline status is now **derived from the date** at the moment of assessment (`timelineAsOf(now)`) instead of being stored on each entry. The stored status is what let "2026-08-02: upcoming" outlive its own date. `TIMELINE` is kept for compatibility and is computed at import; prefer `timelineAsOf`.
- The CLI's "key date" is now the date that matters for the system assessed (`keyDateFor`) — its own high-risk date, or a prohibition's own later date — rather than simply the next milestone on the list.
- `KB_VERSION` is 0.2.0.

### Added
- Article 5(1)(ba) and (bb): generating non-consensual intimate imagery, and child sexual abuse material. Both apply from **2 December 2026**, which the classifier states in its reason; the original eight prohibitions carry no date of their own.
- The Article 50(2) marking grace period to 2 December 2026, scoped to generative systems already placed on the market before 2 August 2026.
- `MILESTONES`, `timelineAsOf`, `keyDateFor`, `AS_OF`, `ANNEX_III_APPLIES` and `ANNEX_I_APPLIES` exports.

### Fixed
- The hosted web classifier (`web/`, `docs/`) carried its own hardcoded copy of the prohibitions and the timeline with the same superseded law. Both copies are updated and now derive status from the date too.

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
