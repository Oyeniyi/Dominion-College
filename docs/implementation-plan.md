# Dominion College Website — Implementation Plan

**Status:** Proposed stage plan; no implementation tasks are started or approved by this document  
**Scope:** MVP public website, protected administration, admissions enquiry handling, and production readiness  
**Authority:** Product scope and acceptance are governed by [`../prd.md`](../prd.md) and [`../AGENTS.md`](../AGENTS.md). Target boundaries and invariants are in [`architecture.md`](./architecture.md) and [`architecture-essential.md`](./architecture-essential.md). Data/API/security and interface/testing proposals are [`database-schema.md`](./database-schema.md), [`api-specification.md`](./api-specification.md), [`security-specification.md`](./security-specification.md), [`design.md`](./design.md), and [`testing-strategy.md`](./testing-strategy.md). Proposed technical ADRs are linked below.

> **Decision status:** No ADR is Accepted; ADR-001 through ADR-004 remain Proposed. There is no application source, dependency manifest, test suite, CI, database, migration, hosting account, or production environment. This plan is a sequencing proposal, not approval of a stack, provider, API, schema, privacy policy, or public content. Do not collect production enquiries or publish identifiable student media until applicable decisions and safeguards are approved.

## 1. Planning assumptions and rules

1. Implement only the MVP described in PRD §4–5. Student/parent portals, payments, SIS/CRM, automated admissions decisions, analytics/marketing, optional email/SMS/maps, WhatsApp Business API, and runtime AI remain out of scope unless separately approved.
2. Do not begin substantial code against proposed ADRs or contracts as though accepted. The owner and technical decision owner must accept/revise architecture decisions and record the result in the authoritative documents.
3. Use small end-to-end increments: each vertical slice should have a user-visible outcome, server-side enforcement, persistence where required, and automated/manual verification before the next risky slice.
4. No unapproved facts, contact details, public copy, admission requirements, school photography, permissions, brand colors, or visual identity are to be invented. No temporary placeholder may leak to production.
5. Use synthetic data for development, CI, demonstrations, and verification. Production data/media must not be copied into test environments or AI tools without specific approval and safeguards.
6. This plan's `IP-*` identifiers are planning-stage IDs requested for traceability; they are not previously approved tracker IDs and do not imply authorization, assignment, estimates, or completion. Create individual tracker items only after owner review if a tracker is selected.
7. Do not assign dates, effort, cost, throughput, or delivery estimates without team capacity, vendor, scope, and dependency evidence. All timing is therefore **TBD**.
8. Each stage has a **strict entry dependency** unless explicitly marked parallelizable. A dependent stage may not bypass an unresolved security/privacy or governance gate for convenience.

## 2. Current baseline and decision gates

### Confirmed repository state

- Requirements and target specifications exist; their proposals and open decisions are not evidence of implementation.
- There is one supplied raster logo, [`../images/dominion_logo.jpg`](../images/dominion_logo.jpg); no complete approved brand kit or school photo set was found.
- No product frontend/backend, manifest, migrations, tests, CI, deployment configuration, or live infrastructure was found.
- No runtime AI or AI evaluation requirement/specification exists.
- There are no accepted ADRs. Proposed:
  - [ADR-001 — TypeScript and Next.js](./decisions/ADR-001-typescript-nextjs.md)
  - [ADR-002 — PostgreSQL data platform](./decisions/ADR-002-postgresql-data-platform.md)
  - [ADR-003 — administrator authentication](./decisions/ADR-003-administrator-authentication.md)
  - [ADR-004 — hosting and media storage](./decisions/ADR-004-hosting-and-media-storage.md)

### Decisions that must be resolved before related work

| Decision / conflict | Owner action needed | Work blocked until resolution |
|---|---|---|
| Accept or revise ADR-001 through ADR-004; confirm budget, ownership, runtime, region, providers, operations capacity | School/project owner and technical owner | Stack bootstrap, provider provisioning, production-oriented service integration |
| [`security-specification.md`](./security-specification.md) exists as a Proposed reference only; the Principal designated it reference-only pending formal approval | Stale existence statements have been reconciled under TASK-001. Obtain formal approval before treating its proposed controls as the governing security baseline. | Security-sensitive work that depends on controls not established by PRD/AGENTS.md; final approval of the security baseline |
| Admin lifecycle, permissions, account owner, recovery/MFA expectations, session expiry, and role/action matrix unresolved | School/project owner / nominated account owner | Authentication configuration, protected UI permissions, authorization test oracle |
| Privacy notice, jurisdiction/legal review, acknowledgement evidence, enquiry access/retention/deletion/correction/export unresolved; API acknowledgement and schema are not aligned | School/project owner and privacy/legal owner | Production enquiry collection and final enquiry schema/UI behavior |
| Approval evidence, approver, withdrawal/takedown, and public delivery for identifiable student images unresolved | School management/content approver | Publishing identifiable student media or declaring media lifecycle complete |
| API, schema, and design gaps: About/Academics edit API not specified; field limits, entry-level values, status transitions, pagination, media serving, cache freshness and retry/idempotency open | Technical owner and product/content owners | Final API contract, production data model, UI integration and release acceptance |
| Official content, entry levels, contact/WhatsApp, logo/brand usage, photos and other school facts not all verified | School management | Public launch and final visual/content acceptance |
| Traffic/media assumptions, rate limits, RTO/RPO, retention, alert owner, restore and incident responsibilities unknown | School/project owner / operations owner | Capacity claims, production reliability signoff and operational release |

These are not implementation defaults. When a decision affects scope, security, privacy, student protection, data handling, or public claims, pause the affected work and obtain a decision; do not silently choose the easiest interpretation.

## 3. Stage plan

### IP-00 — Governance, specification reconciliation, and scope baseline

- **Objective:** establish which requirements and proposed decisions govern implementation and resolve contradictions before code choices become implicit.
- **Scope:** confirm MVP boundaries; review PRD acceptance; reconcile stale security-spec references; reconcile design, database, API, security, testing, and architecture documents; record approvals/revisions and open decisions; assign school content/privacy/identity/operations owners.
- **Prerequisites:** none; this is the first gate.
- **Outputs:** decision log/accepted or revised ADRs; consistent specifications with status/authority; approved MVP scope and unresolved-decision register; nominated decision owners.
- **Strict dependencies:** gates IP-01 through IP-12 where their decisions apply.
- **Parallelizable:** school content inventory, approval contact nomination, and brand/photo collection may proceed alongside specification review, but no unverified content is published.
- **Requirement IDs:** G1–G6; FR-01–FR-10; NFR-01–NFR-08; PRD §14–15, §17–21.
- **Validation:** owner review of requirement scope, approval status, document links, authority conflicts, privacy/security release blockers, and traceability.
- **Risks:** treating proposals as approved; contradictory source documents; absent decision owners; silently expanding the MVP.
- **Exit criteria:** owner confirms scope and decision authority; relevant conflicts are resolved or assigned as explicit blockers; each workstream has a documented approval path. No code is required for exit.

### IP-01 — Technical fit and risk-reduction spikes

- **Objective:** test high-risk implementation assumptions cheaply before committing to dependencies, data structures, or service topology.
- **Scope:** after owner decisions authorize candidates, build disposable prototypes for: selected framework/runtime compatibility and server/client boundary; identity/session callback and authorization integration; database connection/migration/transaction behavior; private media staging/publication and removal; server-side render/cache invalidation; deploy/runtime constraints. Use synthetic values and no production services/data.
- **Prerequisites:** IP-00 approves which candidate(s) may be evaluated and permits any necessary non-production trial accounts. No provider account is provisioned without approval.
- **Outputs:** short spike reports with prototype boundary, tested versions/provider plans, commands, observed results, limitations, and recommendation; accepted/revised ADRs before production integration.
- **Strict dependencies:** IP-02 (toolchain/architecture selection), IP-03 (infrastructure provider), IP-04 (schema/API implementation).
- **Parallelizable:** independent framework/runtime, database/migration, and design/asset research spikes may run in parallel where they use isolated non-production resources. Identity/media spikes may proceed only with explicit privacy/provider approval.
- **Requirement IDs:** G6; FR-09; NFR-01, NFR-04, NFR-06, NFR-07; AE-01–AE-18; ADR-001–004.
- **Validation:** reproduce from a clean workspace; evaluate security boundaries, failure behavior, maintained versions, provider constraints, operational ownership, and teardown. No benchmark or capability is claimed beyond measured conditions.
- **Risks:** prototype hardening being mistaken for production readiness; provider lock-in; undocumented test credentials/data; running on a candidate stack before approval.
- **Exit criteria:** high-risk assumptions have evidence-based recommendations and explicit outcomes; accepted ADRs exist for choices required by the next stage, or affected work remains blocked.

### IP-02 — Repository bootstrap and developer toolchain

- **Objective:** establish a reproducible, minimal foundation that can be built and tested locally and in CI.
- **Scope:** initialize the approved framework/runtime; source structure; formatter/linter/type checks as applicable; one test runner; production build; environment variable validation and secret-free example config; dependency lockfile; basic CI; architecture import-direction/cycle checks if justified; setup documentation.
- **Prerequisites:** IP-00 scope and IP-01/ADR-001 approval of stack and supported versions.
- **Outputs:** clean install/build; runnable skeleton; test/lint/type/build commands; CI checks; `.env.example` with names only; updated README and architecture decisions.
- **Strict dependencies:** IP-01 for accepted stack; IP-00 for requirements. IP-03 infra can proceed in parallel after provider/secret constraints approved.
- **Parallelizable:** content approval, visual asset procurement, detailed API/schema decisions, and deployment account review.
- **Requirement IDs:** G6; NFR-07; AE-01, AE-02, AE-07, AE-12, AE-16.
- **Validation:** clean checkout/install; run declared checks; verify secrets are absent from source and browser bundle; prove critical configuration fails explicitly when missing.
- **Risks:** unnecessary dependencies, mismatched runtime support, leaking secrets, using an unapproved framework, false confidence from a build-only check.
- **Exit criteria:** a new developer can reproduce documented local checks from a clean clone; CI runs baseline checks; no privileged data access is implemented in client code.

### IP-03 — Environment, infrastructure, and operational foundations

- **Objective:** prepare isolated local/test/staging/production environments using approved providers and accountable owners.
- **Scope:** provider/account ownership and region; test/staging/prod separation; HTTPS/domain plan; least-privilege app/database/storage identities; secret handling; logging/monitoring with minimized data; rate-control approach; backup/restore and incident ownership; deployment/rollback approach.
- **Prerequisites:** IP-00 provider/data-location/privacy decisions; accepted ADR-004 and applicable ADR-002/003; IP-02 for deployable app artifact. Local-only development services may be prepared without production provisioning.
- **Outputs:** environment map; documented infrastructure configuration; secrets/rotation approach; operations contacts and runbooks; staging deployment; backup/restore plan and measurable approved RTO/RPO; no real records.
- **Strict dependencies:** production provisioning waits for explicit school approvals. IP-12 production release depends on completed operations and restore evidence.
- **Parallelizable:** repository CI work (IP-02), schema/API design (IP-04), and approved content/brand preparation may continue.
- **Requirement IDs:** NFR-01, NFR-04–NFR-07; PRD §9, §12, §15; AE-07, AE-10, AE-13, AE-15–AE-17.
- **Validation:** access and region review; HTTPS and secret checks; deploy to staging; verify least privilege; restore synthetic backup and record duration/integrity; inspect logs for sensitive fields.
- **Risks:** provider terms/data residency mismatch, unowned accounts, production/test crossover, rollback incompatibility, no alert/restore owner.
- **Exit criteria:** approved owners and regions exist; staging is isolated and observable; secrets are protected; restore and rollback procedures are exercised or blockers are formally recorded. No production PII is permitted merely because infrastructure exists.

### IP-04 — Approved data model, API contracts, and content policy

- **Objective:** turn proposed data/API/UI shapes into consistent, testable contracts before database migrations and client integration.
- **Scope:** finalize entities/constraints/status transitions; entry-level values and input lengths; acknowledgement evidence; admin role/action matrix; settings/content allowlists; About/Academics operations; media upload/approval/public-serving model; pagination; error shapes; idempotency/retry/conflict behavior; cache freshness/invalidation; retention/deletion; SEO/public projection fields.
- **Prerequisites:** IP-00 owners and decisions; IP-01 candidate database/provider constraints where needed. Relevant privacy, security, publication, and data-location decisions must be approved.
- **Outputs:** approved schema/specification, API contract (OpenAPI only once stable), state-transition diagrams, permission matrix, migration compatibility expectations, test acceptance examples, updated design/API/security/data docs.
- **Strict dependencies:** IP-05 database/auth foundations and IP-06 API services cannot implement an unapproved schema/contract. Production data collection remains blocked until privacy gates.
- **Parallelizable:** IP-02 tooling and non-final design exploration can proceed. Public copy and photography approvals proceed under school control.
- **Requirement IDs:** FR-02–FR-09; NFR-04–NFR-06, NFR-08; AE-03–AE-10, AE-14–AE-15, AE-18.
- **Validation:** cross-document consistency review; schema/API example validation; threat/privacy review; owner approval of school-specific values and transitions.
- **Risks:** incompatible PRD/API/schema; undocumented privacy evidence; overengineering; mistaken assumptions about providers or approval state.
- **Exit criteria:** every implemented operation and persisted field has an approved owner/meaning/validation; privacy and authorization policy is explicit; security/publication gates are testable. Unresolved items stay blocked, not defaulted.

### IP-05 — Persistence, migration, and authorization foundation

- **Objective:** implement the minimal trusted server/data foundation with repeatable migrations and deny-by-default authorization.
- **Scope:** approved database connection/repositories; first reviewed migrations; constraints/indexes justified by queries; transaction boundaries; identity adapter; local admin authorization profile and active status; permission checks on every protected operation; environment validation; synthetic seed/reset tooling.
- **Prerequisites:** IP-00 approved ADR-002/003 and security baseline; IP-02; IP-04 approved schema and role matrix; IP-03 non-production database access if provider is selected.
- **Outputs:** versioned migrations; server-only data access; auth/session integration; shared authorization policy; disposable DB test setup; documented access and migration procedures.
- **Strict dependencies:** IP-06 and IP-07 protected data operations. Migration sequence must be applied and tested before dependent application release.
- **Parallelizable:** public static page shell/assets may be built in IP-07 after IP-00 brand/content decisions; API contract tests can be prepared from approved contract.
- **Requirement IDs:** FR-09; NFR-04–NFR-07; AE-02, AE-04, AE-06–AE-10, AE-15–AE-18.
- **Validation:** clean migrate and upgrade tests; constraint/transaction tests; anonymous/inactive/wrong-permission direct-operation tests; secret/static checks; no production data.
- **Risks:** privilege escalation, migration data loss, identity/provider outage behavior, test credentials escaping, role policy defaulting to overly broad access.
- **Exit criteria:** migrations succeed from blank and supported prior schema in disposable DB; protected operations fail closed; auth lifecycle and permissions are demonstrably enforced server-side; rollback/forward-recovery constraints are documented.

### IP-06 — API and application service vertical slices

- **Objective:** implement approved server operations with safe validation, error semantics, and public/private projections.
- **Scope:** public settings/news/gallery reads; enquiry creation; session/dashboard; admin enquiry/news/gallery/settings/content operations as defined by approved contract; shared services, validation, safe errors, request limits, pagination, no-store behavior, and abuse controls.
- **Prerequisites:** IP-04 contract; IP-05 data/auth foundation; IP-03 isolated integration environment as required.
- **Outputs:** server operations/services; API contract and integration tests; response projection allowlists; fault behavior; operation documentation.
- **Strict dependencies:** UI wiring and complete E2E behavior in IP-07/IP-08; public release in IP-12.
- **Parallelizable:** independent public read operations, CMS operations, and enquiry operations may be implemented by separate workstreams after shared conventions and permission boundaries are established. Keep database and service ownership explicit; no duplicated policy logic.
- **Requirement IDs:** FR-02–FR-10; NFR-01, NFR-04–NFR-08; AE-02–AE-10, AE-13–AE-15, AE-18.
- **Validation:** unit, integration, API contract, database, fault-injection, and negative security tests per [`testing-strategy.md`](./testing-strategy.md). Verify unknown writes, errors, safe logs, cache headers, and no success without persistence.
- **Risks:** API/schema drift; public data leakage; unbounded requests; unsafe retries; media storage partial-failure inconsistency; unapproved optional integrations.
- **Exit criteria:** each approved operation passes positive and negative contract tests; public projections exclude private fields; protected endpoints authorize directly; writes/failures are truthful; no unapproved external calls.

### IP-07 — Public website experience

- **Objective:** deliver an accessible, responsive public information experience using only approved identity, copy, and media.
- **Scope:** public shell/navigation/footer; Home, About, Academics, Admissions, News listing/article, Gallery/lightbox, Contact, Privacy Notice and P1 404; semantic structure, SEO metadata, approved contact/WhatsApp links, empty/loading/error states, responsive images.
- **Prerequisites:** IP-00 approved public scope and content/brand owners; IP-02 runnable UI foundation. Final data integration depends on IP-06; approved contracts/test fixtures may support parallel UI work.
- **Outputs:** public routes/components; content rendering from approved public sources; accessible form and browsing interactions; content approval checklist.
- **Strict dependencies:** public claims, contact links, photos, and launch copy cannot go live without school approval. Enquiry submission integration depends on IP-08/IP-06.
- **Parallelizable:** design/asset preparation may precede code; after IP-04/IP-05, public UI and independent admin shell can be built in parallel with API operations using synthetic contract fixtures.
- **Requirement IDs:** G1–G3, G5; FR-01–FR-08, FR-10; NFR-01–NFR-03, NFR-05, NFR-08.
- **Validation:** component/UI, E2E, SEO, accessibility, content, and responsive checks at 360, 390, 768, 1024, and 1440 CSS px plus intermediate widths; manual keyboard review. Do not use fake public content.
- **Risks:** missing approved assets/copy; invented facts; poor mobile readability; inaccessible menu/lightbox/forms; unapproved third-party map/analytics.
- **Exit criteria:** public pages work across viewports; only approved/public content renders; core links and states work; all public copy/assets are approved; accessibility findings are resolved or formally accepted without weakening mandatory requirements.

### IP-08 — Admissions enquiry and contact vertical slice

- **Objective:** complete the highest-priority admissions path from minimal public form through authorized staff review.
- **Scope:** form/client feedback; server validation and abuse controls; confirmed persistence; success/failure/unknown-outcome behavior; private dashboard list/detail; approved status updates; configured WhatsApp click-to-chat; privacy notice and acknowledgement only as approved.
- **Prerequisites:** IP-04 approved fields, privacy/retention/acknowledgement, status and duplicate/retry rules; IP-05 persistence/auth; IP-06 operations; IP-07 public form shell; verified school contact/WhatsApp settings.
- **Outputs:** end-to-end enquiry flow, protected enquiry UI, functional status update, synthetic fixtures, operational escalation path for unavailable service.
- **Strict dependencies:** no production collection until privacy notice, access, retention, account, and provider gates have passed. Do not infer consent requirements.
- **Parallelizable:** after IP-05/06 and contract approval, enquiry API/UI can be a vertical slice in parallel with news/gallery CMS work (part of IP-09), with independent test data.
- **Requirement IDs:** G1, G3–G4; FR-04, FR-05, FR-09; NFR-04–NFR-06.
- **Validation:** E2E valid/invalid submissions; persisted record visible to authorized staff only; direct unauthorized/anonymous requests denied; no PII in public responses/logs/URLs; failure injection, rate controls, mobile/accessibility testing.
- **Risks:** unclear acknowledgement legal meaning, excessive fields, failed write shown as success, duplicate submissions, unauthorized enquiry access, unresponsive follow-up owner.
- **Exit criteria:** valid synthetic enquiry persists and is visible only to authorized staff; invalid/abusive requests fail safely; status update is authorized; the visitor is never told the record was received without confirmed persistence; approved privacy/contact content is present.

### IP-09 — CMS content and media workflows

- **Objective:** allow authorized staff to manage news, gallery, approved institutional content, and settings without code deployment.
- **Scope:** news list/editor/draft/preview/publish/unpublish/archive; gallery upload/metadata/albums/approval/publication/removal; About/Academics editable content; settings allowlist; safe rich-text rendering; image optimization and public/private media access.
- **Prerequisites:** IP-04 approved content API/schema/state machine/approver/media policy; IP-05 database/auth; IP-06 service operations; IP-03 selected storage; IP-00 approved fields/assets.
- **Outputs:** CMS admin screens and operations; private staging/publication workflow; public content updates; migration/test fixtures; operator guidance for content removal.
- **Strict dependencies:** identifiable student media remains blocked until approval evidence and takedown rules are implemented and verified. Do not expose unauthenticated previews.
- **Parallelizable:** news, gallery, and page/settings management sub-slices may proceed in parallel after shared permissions, component conventions, and API definitions; coordinate shared image and publication services.
- **Requirement IDs:** G2–G4; FR-02, FR-03, FR-06–FR-10; NFR-01–NFR-05, NFR-07–NFR-08.
- **Validation:** API/database/UI/E2E tests for lifecycle; anonymous draft/unpublished/guessed-resource/cache tests; upload validation and partial-failure injection; rich-text XSS/URL safety; published media approval; owner content review.
- **Risks:** draft exposure, unauthorized publication, child-image permission failure, orphaned object, stale cache, unsafe rich text, absent editable content API.
- **Exit criteria:** authorized users can manage approved content; publish updates intended public views; unpublish/removal prevents public access within approved freshness target; failed uploads remain private; no unapproved content/media publishes.

### IP-10 — Integration, SEO, and content migration/population

- **Objective:** connect complete workflows and prepare reviewed public content while keeping external transfers and claims controlled.
- **Scope:** approved configured WhatsApp link and encoding; internal navigation; metadata/canonical URLs/sitemap/robots/social metadata; verified public copy/content population; public image rendition/caching behavior; no unapproved analytics/email/maps/marketing/API integration.
- **Prerequisites:** IP-04 contracts; IP-06–IP-09 relevant operations and screens; approved content/contacts/media from school; accepted public cache/delivery model.
- **Outputs:** integrated public/admin journeys; approved initial content set; SEO implementation; content migration/import procedure if needed; external integration inventory.
- **Strict dependencies:** content migration to production only after production owner, data policy, backup, rollback, and approvals. No source/production split-brain for authoritative content.
- **Parallelizable:** SEO metadata work and approved content preparation can proceed alongside CMS work; production population waits for release gate.
- **Requirement IDs:** G1–G5; FR-01–FR-10; NFR-01–NFR-03, NFR-05, NFR-08; AE-03, AE-13–AE-15.
- **Validation:** link/metadata/sitemap checks; no admin/private/draft data indexed; WhatsApp click-to-chat manual verification with approved test target; verify no hidden external calls; approved copy/contact/content audit.
- **Risks:** stale or contradictory school facts; invalid WhatsApp number; accidental indexing; unapproved external data transfer; slug changes without redirect policy.
- **Exit criteria:** integrated visitor journeys work; SEO surfaces expose approved public pages only; all launch content and contact details are verified; optional integrations remain absent unless separately approved.

### IP-11 — Hardening, quality, security, and operational verification

- **Objective:** close required defects and produce release evidence across functionality, privacy, accessibility, security, performance, and recovery.
- **Scope:** full planned tests; independent security review; dependency/advisory/secret checks; accessibility review; responsive and performance evaluation; migration/restore/rollback exercises; operational monitoring/incident runbooks; privacy and child-protection verification.
- **Prerequisites:** integrated candidate IP-10; approved security/privacy/content policy; staging and test data isolation; assigned operations and incident owners.
- **Outputs:** test reports and artifacts; vulnerability/remediation register; accessibility findings/exceptions; performance results with conditions; restore/rollback evidence; runbooks and release decision.
- **Strict dependencies:** IP-12 launch. Unresolved critical/high security issue, privacy blocker, data-loss risk, or unapproved student media blocks release.
- **Parallelizable:** accessibility, performance, security, migration, and runbook reviews can proceed independently on a stable release candidate, coordinating fixes through regression tests.
- **Requirement IDs:** all G1–G6, FR-01–FR-10, NFR-01–NFR-08; PRD §14–15; AE-01–AE-18; SEC-01–SEC-20.
- **Validation:** follow [`testing-strategy.md`](./testing-strategy.md). Distinguish automated from manual checks and lab from field performance; verify all release gates using synthetic data and approved staging.
- **Risks:** false readiness claims; untested provider failures; flaky tests; open issues hidden by retries; unmeasured RTO/RPO/capacity; unreviewed content or dependency advisories.
- **Exit criteria:** mandatory PRD acceptance criteria are evidenced; critical tests pass; no unresolved critical/high security issues; accessibility is manually reviewed; performance/recovery evidence and limitations are documented; content, privacy, identity, and operations owners sign off.

### IP-12 — Production deployment, smoke testing, and handover

- **Objective:** release the approved MVP safely and hand operational control to named owners.
- **Scope:** approved production infrastructure/config; backup snapshot/check; release artifact; reviewed migration and compatibility sequence; HTTPS/domain; smoke checks; monitoring/alerting; incident/recovery and rollback readiness; handover and launch approval.
- **Prerequisites:** IP-03 production environment/provider approval; IP-11 release evidence and signed approvals; production content/privacy/identity gates; migration plan and tested recovery.
- **Outputs:** production release; deployment/version record; smoke-test evidence; account/access inventory; backup/restore and rollback runbooks; named owner handover; known limitations list.
- **Strict dependencies:** explicit launch approval from school/project owner. No production data before privacy/security and operational gates.
- **Parallelizable:** none for production-impacting steps; documentation/handover preparation may proceed earlier, but production migration and cutover are a controlled sequence.
- **Requirement IDs:** all launch acceptance criteria PRD §15; NFR-01, NFR-04–NFR-08; AE-06–AE-10, AE-14–AE-17.
- **Validation:** preflight environment/secret/access review; migration checks; HTTPS and health checks; public flow smoke tests; authorized admin checks with non-sensitive test account; private response/cache verification; monitoring alerts and backup status.
- **Risks:** irreversible migrations; incompatible rollback; configuration drift; DNS/HTTPS failure; exposure of real enquiries/media; insufficient operational support.
- **Exit criteria:** school explicitly approves launch; all smoke tests pass; app/data versions are compatible; backup/recovery and support owners are known; no critical release blocker remains; operational handover is acknowledged.

## 4. Dependency and parallelization map

### Strict dependency order

```text
IP-00 Governance/specification gate
  ├─→ IP-01 Technical spikes → IP-02 Bootstrap
  ├─→ IP-04 Approved data/API/security/content decisions
  └─→ Approved brand/content/privacy/identity/operations inputs

IP-02 + IP-04 + approved ADRs
  → IP-05 Persistence/auth foundation
  → IP-06 Server/API slices
  → IP-07 Public experience ─────┐
  → IP-08 Admissions slice ──────┼→ IP-10 Integration/SEO/content
  → IP-09 CMS/media ─────────────┘
                                  → IP-11 Hardening/release evidence
                                  → IP-12 Production/release/handover
```

The diagram is simplified: IP-07's visual shell and approved content preparation can precede IP-06 using synthetic contract fixtures; final data integration cannot. IP-08 and IP-09 may progress as parallel vertical slices only after shared authorization, schema, API, privacy, and media rules are approved. IP-12 has a serial production change window and cannot be parallelized with active migration/cutover.

### Work that can safely proceed in parallel

- Under IP-00 governance: collect/approve assets and public content; review provider/business constraints; reconcile documentation.
- After approved stack decision: set up local repo/CI while hosting account review proceeds; implement contract tests alongside service code; prepare accessibility checks alongside UI.
- After approved API/schema/security rules and base services: public presentation, enquiry workflow, and content-management sub-slices can be separate workstreams with isolated test data and shared service contracts.
- On a stable candidate: accessibility, security, performance, migration, and operations reviews can run concurrently in isolated staging/test environments.

### Work that must not be parallelized or bypassed

- Do not provision production providers, collect real enquiry data, publish identifiable student media, or use sensitive data in AI tools before their respective approvals.
- Do not run frontend against guessed API shapes while claiming integration complete.
- Do not launch public content before verification/approval or launch admin UI without server-side authorization.
- Do not apply a production migration before compatibility, backup, rollback/forward-recovery, and owner approval.
- Do not run destructive tests, migrations, load tests, or fault injection against production.

## 5. Incremental delivery milestones

Milestones are outcomes, not calendar commitments. Dates and estimates are **not assigned** because team capacity, provider lead times, budget, approvals, and execution estimates are unavailable.

| Milestone | Stages | Outcome / acceptance |
|---|---|---|
| **M0 — Approved baseline** | IP-00, IP-01 | Scope/decision owners identified; relevant ADRs and specifications accepted/revised; highest-risk assumptions investigated; open blockers explicit. |
| **M1 — Reproducible foundation** | IP-02, approved non-production portion of IP-03 | Clean checkout builds/tests; CI baseline exists; isolated development/staging approach and secret handling are documented. |
| **M2 — Secure data and service foundation** | IP-04, IP-05, first IP-06 slices | Approved contracts/schema; migrations repeatable; auth and authorization fail closed; service and contract tests cover core boundaries. |
| **M3 — Working visitor and staff workflows** | IP-07, IP-08, IP-09 | Public pages and CMS are connected through approved services; enquiry persists and is privately manageable; content/media publication rules verified. |
| **M4 — Integrated release candidate** | IP-10, IP-11 | Content/SEO reviewed; all required functional, accessibility, security, responsive, performance, migration, and recovery evidence assembled; launch blockers closed. |
| **M5 — Production launch and handover** | IP-12 | Approved production deployment, successful smoke checks, operational ownership, recovery procedures, and handover complete. |

Each milestone can be stopped safely with a working earlier increment where possible. If a decision remains unresolved, pause only the affected scope and do not present a partial system as meeting MVP launch criteria.

## 6. Migration, deployment, and rollback strategy

1. **Schema authority:** the candidate schema is not a migration. Finalize it at IP-04 and implement only through reviewed, version-controlled migrations at IP-05.
2. **Migration order:** create additive structures/nullable fields or compatible constraints first; deploy application code capable of reading old/new forms as needed; backfill only with approved, verified procedure and non-sensitive staging data; switch reads/writes; remove obsolete structures only in a later reviewed migration after compatibility and recovery are proven.
3. **Compatibility:** test clean database creation and prior-version upgrade in disposable CI. For production releases, specify supported app/schema combinations and preflight checks. Avoid a one-step application+schema change that makes rollback impossible.
4. **Backups:** verify an approved backup exists before a production migration; restore in isolated environment and inspect records/media consistency. Backup existence without a successful restore is not recovery evidence.
5. **Application rollback:** use immutable/reproducible release artifacts and a documented previous-version redeploy path. Rollback may be unsafe after incompatible schema changes or content writes; state those limits before release.
6. **Database rollback:** do not promise automatic reverse migration. Prefer forward-compatible migrations and a tested forward-fix plan. Destructive or irreversible changes require explicit owner approval, backup/recovery plan, and a production window.
7. **Media/object storage:** database and storage are not one transaction. Deploy private-first behavior; verify orphan cleanup and removal/cache propagation before enabling publication. Do not claim complete erasure from external copies/backups.
8. **Cutover and smoke verification:** validate config, HTTPS, health, public routes, private routes/cache boundaries, migration state, enquiry save/error behavior, and authorized admin operation. Monitor only with approved minimized telemetry.
9. **Rollback trigger and authority:** define objective abort/rollback triggers, who can invoke them, incident communication, and whether writes/data migrations can be safely reversed before launch; these owners and thresholds are unresolved until operations planning.

## 7. Requirement traceability

| Workstream | Requirement trace |
|---|---|
| Governance and owner decisions | G1–G6; FR-01–FR-10; NFR-01–NFR-08; PRD §20–21 |
| Repository, architecture, toolchain | G6; NFR-07; AE-01, AE-02, AE-07, AE-12, AE-16 |
| Infrastructure and operations | NFR-01, NFR-04, NFR-06–NFR-07; PRD §9, §15, §17–18; AE-07, AE-10, AE-13, AE-15–AE-17 |
| Schema, migrations, data protection | FR-04, FR-06–FR-09; NFR-04–NFR-07; PRD §8.2–8.3; AE-06, AE-09, AE-15 |
| Auth, sessions, authorization | FR-09; NFR-04–NFR-05; PRD §14.2; AE-04 |
| API and application services | FR-02–FR-10; NFR-01, NFR-04–NFR-08; AE-02–AE-10, AE-14, AE-18 |
| Public web experience | G1–G3, G5; FR-01–FR-08, FR-10; NFR-01–NFR-03, NFR-05, NFR-08 |
| Admissions and contact | G1, G3–G4; FR-04–FR-05, FR-08–FR-09; NFR-04–NFR-06 |
| CMS and student media | G2, G4; FR-02–FR-03, FR-06–FR-09; NFR-04–NFR-05, NFR-07 |
| Hardening/testing/release | G1–G6; FR-01–FR-10; NFR-01–NFR-08; PRD §14–15; AE-01–AE-18; SEC-01–SEC-20 |
| Runtime AI | Not applicable: excluded from MVP by PRD §2.2 and architecture; do not add without approved scope, privacy/security design, and evaluation strategy. |

PRD acceptance criteria in §15 are release gates, not optional post-launch backlog. Individual approved task IDs do not yet exist; `IP-*` are stage identifiers created by this plan only.

## 8. Stage completion and change control

Before marking a stage complete, record:

- Outputs delivered and requirement IDs addressed.
- Approved ADRs/contracts/policies on which the work depends.
- Exact validation commands and observed results; distinguish pass/fail/not run.
- Tests by level, data classification, environment, and artifacts/reports.
- Remaining defects, risks, blocked scope, and decision owner.
- Documentation and migration/deployment changes; rollback/recovery limitations.
- Approval evidence for public content, contact details, privacy, permissions, and release where relevant.

Any scope, architecture, database/schema, API, security/privacy, student-media, provider, external-integration, or runtime AI change must be reviewed by its governing owner and reflected in the authoritative document(s) before dependent work proceeds. Do not use a stage exit to imply security certification, WCAG conformance, performance capacity, or production readiness absent the required evidence.
