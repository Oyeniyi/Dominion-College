# Dominion College Website — Actionable Backlog

**Status:** Proposed backlog; no implementation task is Done  
**Scope:** MVP described in [`../prd.md`](../prd.md)  
**Authority:** Requirements and acceptance criteria: [`../prd.md`](../prd.md), subject to [`../AGENTS.md`](../AGENTS.md). Stage sequence: [`implementation-plan.md`](./implementation-plan.md). Test expectations: [`testing-strategy.md`](./testing-strategy.md). Target architecture and invariants: [`architecture.md`](./architecture.md), [`architecture-essential.md`](./architecture-essential.md); proposed data/API/security/design: [`database-schema.md`](./database-schema.md), [`api-specification.md`](./api-specification.md), [`security-specification.md`](./security-specification.md), [`design.md`](./design.md).

> **Baseline:** The workspace contains planning documents and a raster logo, but no implemented website, application dependency manifests, migrations, tests, CI, or deployment environment. ADR-001–004 remain Proposed. [`definition-of-done.md`](./definition-of-done.md) exists as a proposed completion checklist; its presence does not establish approval. No task below approves a provider, API, schema, privacy policy, public school claim, or feature expansion.

## Status definitions

- **Planned:** scoped but not currently ready to start because a prerequisite remains open.
- **Ready:** may be started; dependencies are satisfied or none exist.
- **In Progress:** implementation has begun and is actively being worked.
- **Blocked:** cannot proceed until the named decision, input, or dependency is resolved.
- **In Review:** implementation is complete and awaiting review/verification.
- **Done:** implementation and all required acceptance/verification evidence are complete.

No task may be marked Done based on planning, prototype-only evidence, a successful build alone, or a proposed specification.

## Backlog conventions

- `TASK-*` identifiers are created for this backlog; they are not historical tracker IDs. Preserve them once imported to a tracker.
- Dependencies are strict unless a task explicitly says otherwise. Do not start a blocked task by inventing missing product, security, privacy, or provider decisions.
- Requirements refer to PRD goal IDs (`G1`–`G6`), functional requirements (`FR-*`), non-functional requirements (`NFR-*`), and architecture/security IDs as applicable.
- Expected paths/components are indicative because no source tree or stack has been selected.
- **Verification commands:** no product commands currently exist. Commands are marked “TBD after stack/tooling approval” rather than guessed. When TASK-008/TASK-009 establish scripts, update affected entries with exact commands.
- Dates, estimates, assignees, and release promises are intentionally omitted because capacity and lead times are unknown.

## Phase 0 — Governance, decisions, and approved inputs

### TASK-001 — Reconcile specification authority and stale security references

- **Objective:** make the decision status and authority of current specifications internally consistent.
- **Description:** review the current documents, resolve that `security-specification.md` exists despite stale statements in architecture/API/schema documents, and correct other directly related stale status claims. The Principal designated the security specification reference-only pending formal approval; record that decision without implying approval of its controls. Record remaining contradictions as explicit decision items without silently choosing an interpretation.
- **Requirement IDs:** G6; NFR-04, NFR-07; AE-05, AE-15.
- **Relevant specification sections:** AGENTS.md “Document Authority and Conflicts”; architecture.md §§1, 8, 14; architecture-essential.md status/header; api-specification.md header and §§7, 10; database-schema.md header and §§11–12; data-architecture.md header and §1; security-specification.md §§1, 8–10.
- **Prerequisites/dependencies:** None. The Principal is designated as the technical/document decision owner for this reconciliation.
- **Expected files/components:** `docs/architecture.md`, `docs/architecture-essential.md`, `docs/api-specification.md`, `docs/database-schema.md`, `docs/data-architecture.md`, `docs/design.md`, `docs/testing-strategy.md`, `docs/implementation-plan.md`, `docs/definition-of-done.md`, `docs/requirements-traceability.md`, `docs/specification-validation-report.md`, `docs/implementation-readiness-report.md`, and this backlog.
- **Acceptance criteria:** (1) Every relevant document accurately states that the security specification exists, is Proposed, and is reference-only pending formal approval. (2) The Principal's authority decision and the remaining formal-approval blocker are recorded; no document presents the proposed specification as governing. (3) All stale non-existence statements in the affected current specifications are corrected. (4) No proposed ADR/API/schema is relabeled accepted without explicit approval.
- **Tests:** Manual cross-document consistency and link/status review.
- **Verification commands:** No repository Markdown-validation command exists. A one-off Python relative-link scan of the 13 updated documents passed; manual cross-document status review completed.
- **Risks/notes:** The Principal decided that the security specification is reference-only pending formal approval. PRD and AGENTS.md security/privacy requirements continue to govern. This task does not approve the security baseline or unblock security-sensitive implementation that depends on proposed controls.
- **Status:** Done

### TASK-002 — Approve technical baseline and complete bounded feasibility spikes

- **Objective:** select or revise the proposed implementation and deployment baseline using evidence and owner approval.
- **Description:** review ADR-001–004 and, only for approved candidates, run disposable spikes for runtime/framework support, server/client boundary, database connection/migrations/transactions, identity/session integration, private media staging/publication, cache invalidation, and hosting constraints. Record versions, commands, results, limitations, provider/data-location/budget implications, and accept/revise/defer each ADR.
- **Requirement IDs:** G6; FR-09; NFR-01, NFR-04, NFR-06, NFR-07; AE-01, AE-02, AE-06, AE-14, AE-16.
- **Relevant specification sections:** implementation-plan.md IP-01; ADR-001–004; architecture.md §§9, 11, 14; research-and-decisions.md decision register; testing-strategy.md §§2, 4.
- **Prerequisites/dependencies:** TASK-001; permission for any non-production account or external provider trial.
- **Expected files/components:** `docs/decisions/ADR-001-typescript-nextjs.md` through `ADR-004-hosting-and-media-storage.md`, `docs/research-and-decisions.md`, bounded disposable spike artifacts (location agreed before creation).
- **Acceptance criteria:** (1) Each technology decision required for implementation has an Accepted/Rejected/Deferred status and named approver. (2) Each spike report includes reproducible setup/commands and observed behavior, or explicitly says it was not run and why. (3) Runtime/provider/data location/account ownership and operational consequences are recorded. (4) Prototype resources and credentials are safely removed/rotated where applicable.
- **Tests:** Spike-specific compatibility and failure checks; no production tests.
- **Verification commands:** TBD per approved candidate; record exact commands in ADR/spike report.
- **Risks/notes:** Do not provision production resources, send sensitive data, or infer provider suitability from documentation alone. Prototype success is not production readiness.
- **Status:** Blocked — TASK-001 and candidate/provider authorization.

### TASK-003 — Approve enquiry privacy, notice, and retention policy

- **Objective:** settle the school-owned privacy decisions required before accepting real enquiries.
- **Description:** obtain school/privacy/legal review of purpose, minimum fields, privacy notice, acknowledgement requirement and wording, whether acknowledgement evidence is stored, access/correction/export handling, retention/deletion, jurisdiction, and production data location. Reconcile PRD, candidate API schema, and database schema.
- **Requirement IDs:** G1; FR-04, FR-09; NFR-04, NFR-05; SEC-08, SEC-12, SEC-20.
- **Relevant specification sections:** PRD FR-04, §§8.2(E), 12, 14, 20; api-specification.md §§2, 7–8; database-schema.md §§4.5, 8, 12; data-architecture.md §§2, 6, 12; security-specification.md §§1, 7–10.
- **Prerequisites/dependencies:** TASK-001; designated school/privacy decision owner.
- **Expected files/components:** Approved privacy notice/content; updates to `docs/api-specification.md`, `docs/database-schema.md`, `docs/data-architecture.md`, `docs/security-specification.md`, and `docs/design.md` as decisions require.
- **Acceptance criteria:** (1) Approved notice is available before collection. (2) Required/optional fields and acknowledgement policy are explicit. (3) If evidence is required, the approved schema/API defines minimum evidence and retention; otherwise acknowledgement behavior is explicitly documented as unnecessary. (4) Retention/deletion, access, correction/export, jurisdiction, and owner are documented. (5) Production enquiry collection remains blocked until applicable decisions are implemented and verified.
- **Tests:** Owner review against PRD fields and data-flow inventory; document consistency check.
- **Verification commands:** None; approval evidence/document review.
- **Risks/notes:** This is a governance decision, not a coding task. Do not present a generic privacy notice as school/legal approval.
- **Status:** Blocked — TASK-001 and school/privacy owner.

### TASK-004 — Approve admin lifecycle, role matrix, and session policy

- **Objective:** provide an authoritative authorization and identity policy for the dashboard.
- **Description:** nominate account owner and approver; define bootstrap, onboarding/offboarding, active/disabled accounts, recovery, MFA expectations, action/object permissions, enquiry access, publish/delete/media approval authority, session expiry/revocation, CSRF/session requirements, and emergency access.
- **Requirement IDs:** G4; FR-09; NFR-04, NFR-05; SEC-01–SEC-03; AE-04.
- **Relevant specification sections:** PRD FR-09, §§14.2, 20; ADR-003; api-specification.md §§4–5, 8; security-specification.md SEC-01–SEC-05, §§8–10; architecture-essential.md AE-04.
- **Prerequisites/dependencies:** TASK-001; named school account owner and approval decision maker.
- **Expected files/components:** Accepted ADR-003; permission/action matrix and account lifecycle/session policy in `docs/security-specification.md` and `docs/api-specification.md`; update `docs/design.md` if sign-in/session UX changes.
- **Acceptance criteria:** (1) Each protected operation maps to an approved permission. (2) Account bootstrap, disablement, recovery, and session revocation have named owners/procedures. (3) Session timeout and MFA decision are explicit. (4) Unknown identity/permission fails closed. (5) The policy supports a test matrix for anonymous, inactive, and unauthorized actors.
- **Tests:** Manual permission-matrix coverage review; no auth implementation exists to test.
- **Verification commands:** None; approval/document review.
- **Risks/notes:** Do not assume one broad “admin” permission covers all privacy-sensitive operations without owner approval.
- **Status:** Blocked — TASK-001 and school/account owner.

### TASK-005 — Approve brand assets and verified public content inventory

- **Objective:** establish which school information and visuals may be used publicly and in the CMS.
- **Description:** gather original logo/usage rules, approved brand colors/typography if available, approved photographs and permission status, official public copy, academic/admissions facts, address/contact/WhatsApp/social details, and designate content approvers. Mark each item approved, pending, or unavailable; do not generate missing facts.
- **Requirement IDs:** G1–G3, G5; FR-01–FR-08, FR-10; NFR-02, NFR-03, NFR-05.
- **Relevant specification sections:** PRD §§8.1, 10, 20; design.md §§4, 5, 9, 11; implementation-plan.md IP-00/IP-07/IP-10.
- **Prerequisites/dependencies:** TASK-001; school management/content approver.
- **Expected files/components:** Approved assets and content inventory in an owner-approved location; update `docs/design.md` with approved token/asset references and outstanding omissions.
- **Acceptance criteria:** (1) Each public fact/contact field and image has a source/approval status and named approver. (2) Logo asset suitability and correct usage are confirmed. (3) Missing facts remain explicitly unavailable. (4) No student-identifying image is marked publishable without TASK-006's required approval process.
- **Tests:** Content/asset checklist and school owner signoff; visual inspection of supplied assets.
- **Verification commands:** None; manual review.
- **Risks/notes:** Current workspace contains only `images/dominion_logo.jpg`; reported additional assets are not present. Public launch may be limited until approved materials arrive.
- **Status:** Blocked — school content/brand owner.

### TASK-006 — Approve student-media authorization and takedown workflow

- **Objective:** define how identifiable student imagery is approved, published, withdrawn, and removed.
- **Description:** school defines who verifies authorization, required evidence/authoritative record, scope/duration, who can approve publication, status prerequisites, withdrawal/takedown response, retention, object/cache behavior, and limitations for copies already distributed.
- **Requirement IDs:** G2, G4; FR-07, FR-09; NFR-04, NFR-05, NFR-06; SEC-09, SEC-10, SEC-16.
- **Relevant specification sections:** PRD FR-07, NFR-05, §12; database-schema.md §§4.4, 12; api-specification.md §§2, 4, 7–8; security-specification.md SEC-09/10/16, §§7–10; design.md §5 Gallery management.
- **Prerequisites/dependencies:** TASK-001; school management/content approver and privacy owner. Coordinate with TASK-003.
- **Expected files/components:** Approved media workflow/policy; updates to `docs/security-specification.md`, `docs/database-schema.md`, `docs/api-specification.md`, `docs/data-architecture.md`, and `docs/design.md`.
- **Acceptance criteria:** (1) Publication cannot be authorized by a status toggle alone where evidence is required. (2) An accountable approver and verifiable prerequisite are named. (3) Withdrawal/removal and cache/storage limitations are documented. (4) Unapproved/unknown-authorization images remain private. (5) Required schema/API fields or external authoritative process are specified.
- **Tests:** Owner walkthrough of approval, publish, unpublish, withdrawal, and failure cases; contract/schema review.
- **Verification commands:** None; approval walkthrough.
- **Risks/notes:** No identifiable student media may be published before the workflow is approved and implemented.
- **Status:** Blocked — TASK-001 and school/privacy approvers.

### TASK-007 — Approve API and data contracts for MVP workflows

- **Objective:** reconcile proposed schema, API, and UI so each MVP behavior has a concrete, testable contract.
- **Description:** finalize entities and field constraints, entry-level values, status transitions, pagination, conflict/retry/idempotency behavior, public/admin projections, media delivery, settings allowlist, cache freshness, delete/retention semantics, and API routes for editable About/Academics content currently missing from the proposal. Produce machine-readable OpenAPI only after decisions stabilize.
- **Requirement IDs:** FR-02–FR-09; NFR-01, NFR-04–NFR-08; AE-03–AE-10, AE-14, AE-15, AE-18.
- **Relevant specification sections:** database-schema.md §§1–12; api-specification.md §§1–10; architecture.md §§5–10, 14; design.md §§5, 8, 11; testing-strategy.md §§3.4–3.5.
- **Prerequisites/dependencies:** TASK-001, TASK-002, TASK-003, TASK-004, TASK-005, TASK-006.
- **Expected files/components:** Approved `docs/database-schema.md`, `docs/api-specification.md`, `docs/data-architecture.md`; OpenAPI contract if approved; corresponding updates to `docs/design.md` and `docs/testing-strategy.md`.
- **Acceptance criteria:** (1) Every MVP form/list/edit/publish operation has an approved request, response, permission, error, and persistence contract. (2) About/Academics edit operations are defined or explicitly deferred by an approved requirements change. (3) No unresolved field/status/media/privacy contract is silently assumed. (4) Public/admin response projections and cache policy are explicit. (5) Contract examples use synthetic data.
- **Tests:** Contract/schema validation once machine-readable artifacts exist; cross-document review.
- **Verification commands:** TBD after contract tooling is selected; no OpenAPI file/tool exists.
- **Risks/notes:** This task must not increase MVP scope; additions require owner approval.
- **Status:** Blocked — listed approval tasks.

## Phase 1 — Repository and delivery foundation

### TASK-008 — Bootstrap the approved application skeleton

- **Objective:** create a clean, reproducible application foundation using the accepted stack.
- **Description:** initialize application structure, supported runtime, lockfile, environment-variable validation, server/client module boundaries, and minimal public health/build route. Add no database, identity provider, or optional integrations until their tasks authorize them.
- **Requirement IDs:** G6; NFR-07; AE-01, AE-02, AE-07, AE-12, AE-16.
- **Relevant specification sections:** ADR-001; architecture.md §§5, 9, 11; implementation-plan.md IP-02; testing-strategy.md §§2, 8.
- **Prerequisites/dependencies:** TASK-002 (accepted stack/runtime), TASK-001.
- **Expected files/components:** application source/config, lockfile, README setup instructions, secret-free `.env.example`.
- **Acceptance criteria:** (1) Clean checkout install and production build complete. (2) Missing critical configuration fails explicitly. (3) No privileged credentials or data-access code are included in browser bundles. (4) Source boundaries follow approved architecture.
- **Tests:** Clean-install/build, config validation, browser-bundle secret check.
- **Verification commands:** TBD after approved toolchain; record exact commands in repository README.
- **Risks/notes:** No framework or package versions are approved currently.
- **Status:** Blocked — TASK-002.

### TASK-009 — Establish product CI quality gates

- **Objective:** run repeatable baseline checks for every code change.
- **Description:** add CI for install, formatting/lint, typecheck/compile, unit/component tests as introduced, build, and secret/dependency checks. Add only checks supported by selected stack and lockfile. Do not copy agent-skill tests as product tests.
- **Requirement IDs:** G6; NFR-04, NFR-07; AE-07, AE-12, AE-16.
- **Relevant specification sections:** implementation-plan.md IP-02; testing-strategy.md §§2, 8–10; PRD §§14–15.
- **Prerequisites/dependencies:** TASK-008.
- **Expected files/components:** CI workflow/config, project scripts, test skeleton and documentation.
- **Acceptance criteria:** (1) A clean pull-request revision runs each required configured check. (2) A deliberately failing check blocks success. (3) Secret scan detects a synthetic seeded secret without including real credentials. (4) CI artifacts/logs do not contain sensitive data.
- **Tests:** CI run on a non-production change; validate failure behavior using a reversible test fixture/branch.
- **Verification commands:** exact CI commands are established by TASK-008; no commands exist before then.
- **Risks/notes:** CI provider is not selected; do not add third-party workflow services without approval.
- **Status:** Blocked — TASK-008.

### TASK-010 — Provision and verify isolated non-production environments

- **Objective:** provide test/staging infrastructure with isolated data and controlled credentials.
- **Description:** configure approved local/test/staging environments, service accounts, protected secrets, database/storage namespaces, HTTPS where applicable, privacy-minimized logs, rate-control infrastructure, backup and recovery ownership. Production provisioning is not included in this task.
- **Requirement IDs:** NFR-01, NFR-04–NFR-07; AE-07, AE-10, AE-13, AE-15–AE-17.
- **Relevant specification sections:** ADR-002–004; architecture.md §§8–10, 14; security-specification.md §§3–8; testing-strategy.md §§4–5.
- **Prerequisites/dependencies:** TASK-002; TASK-003 applicable privacy/data-location decisions; TASK-008. Provider account use requires owner authorization.
- **Expected files/components:** approved infrastructure configuration, environment documentation, secret names/config validation, staging deployment settings, operations/runbook drafts.
- **Acceptance criteria:** (1) Local/test/staging are isolated from production. (2) Each service identity follows least privilege. (3) No production data is present. (4) Logs exclude protected fields. (5) Synthetic backup restore is exercised or explicitly blocked with an owner and date before launch.
- **Tests:** Access/region review; staging deploy; secret check; synthetic backup/restore check.
- **Verification commands:** Provider-specific commands TBD after ADR approval; exact evidence recorded in environment docs.
- **Risks/notes:** Do not provision production or use real personal data under this task.
- **Status:** Blocked — TASK-002, TASK-003, TASK-008.

## Phase 2 — Data, identity, and server-side boundaries

### TASK-011 — Implement approved schema and versioned migrations

- **Objective:** make the approved data model reproducible and integrity-protected.
- **Description:** implement the TASK-007 schema as reviewed migrations, repositories/data adapters, justified indexes/constraints, and synthetic seed/reset fixtures. Do not run candidate DDL directly or introduce unapproved tables such as audit/consent tables.
- **Requirement IDs:** FR-04, FR-06–FR-09; NFR-04–NFR-07; AE-06, AE-09, AE-15.
- **Relevant specification sections:** database-schema.md §§2–10, 12; architecture.md §§5–7; testing-strategy.md §§3.5, 3.12; implementation-plan.md IP-05.
- **Prerequisites/dependencies:** TASK-002, TASK-007, TASK-008, TASK-009, TASK-010.
- **Expected files/components:** versioned migrations, server-only repository/data adapters, test fixtures and migration documentation.
- **Acceptance criteria:** (1) Empty disposable DB reaches current schema through migrations. (2) Supported prior schema upgrades without unexpected loss. (3) Constraints reject invalid statuses/references/required fields. (4) Transaction tests prove required all-or-nothing behavior. (5) Fixtures are synthetic and resettable.
- **Tests:** Database integration, migration clean-install/upgrade, constraints and transaction tests.
- **Verification commands:** TBD after database and migration tooling are approved; record clean/upgrade commands in README.
- **Risks/notes:** Never use production DB for migration tests. Destructive migrations require separate approval and recovery review.
- **Status:** Blocked — listed dependencies.

### TASK-012 — Integrate approved identity and server-side authorization

- **Objective:** protect all dashboard data and actions independently of frontend visibility.
- **Description:** integrate selected authentication/session mechanism; implement active-account check, permission policy, session expiration/logout/revocation, CSRF protections where applicable, and explicit deny-by-default guards on protected service boundaries.
- **Requirement IDs:** FR-09; NFR-04–NFR-05; SEC-01–SEC-05; AE-02, AE-04.
- **Relevant specification sections:** ADR-003; PRD §§14.2, 15; api-specification.md §§4–5; security-specification.md SEC-01–SEC-05; architecture-essential.md AE-04.
- **Prerequisites/dependencies:** TASK-002, TASK-004, TASK-007, TASK-008, TASK-009, TASK-010.
- **Expected files/components:** identity/session adapter, authorization policy, protected request/service guards, integration tests, account setup documentation.
- **Acceptance criteria:** (1) Anonymous, invalid, expired, inactive, and unauthorized actors are denied on direct operations. (2) Logout/session revocation prevents subsequent protected access. (3) Cookie settings and CSRF controls match the approved session design. (4) Identity outage fails closed. (5) No tokens or provider secrets appear in URLs, logs, or client bundles.
- **Tests:** Unit policy matrix; API/integration authorization tests; selected provider test tenant verification.
- **Verification commands:** TBD after stack/auth selection; include exact local and non-production provider test procedure.
- **Risks/notes:** Do not implement bespoke password/session primitives or assume the provider flow.
- **Status:** Blocked — listed dependencies.

### TASK-013 — Implement shared request validation and safe error mapping

- **Objective:** make server-boundary input handling and errors consistent with the approved contract.
- **Description:** validate request shape, size, syntax, allowed fields, and business constraints; normalize values where approved; map expected validation/auth/not-found/conflict/limit/dependency failures to safe contract responses and correlation IDs. Do not swallow unexpected exceptions.
- **Requirement IDs:** FR-04, FR-06–FR-09; NFR-04; AE-05, AE-08, AE-18.
- **Relevant specification sections:** api-specification.md §§1–3, 5; security-specification.md SEC-06/18, §7; architecture.md §§5, 10; testing-strategy.md §§3.1, 3.3–3.4, 6.
- **Prerequisites/dependencies:** TASK-007, TASK-008, TASK-009, TASK-011, TASK-012.
- **Expected files/components:** shared request schemas/validators, error mapper, safe logging/correlation adapter and tests.
- **Acceptance criteria:** (1) Invalid/unexpected inputs receive documented safe errors. (2) Responses contain no stack trace, SQL/provider internals, secrets, or submitted enquiry content. (3) Unexpected errors remain diagnosable without exposing sensitive data. (4) Missing dependency never yields success-shaped fallback.
- **Tests:** Boundary/property tests as appropriate; malformed/oversized input; safe error shape; sentinel-based log redaction; fault injection.
- **Verification commands:** TBD after test scripts exist.
- **Risks/notes:** Final lengths, limits, and localized copy must follow TASK-007, not be guessed here.
- **Status:** Blocked — listed dependencies.

## Phase 3 — Server workflows and persistence

### TASK-014 — Implement public approved-content read services

- **Objective:** serve explicit public-safe projections for settings, published news, and published gallery items.
- **Description:** implement public settings/news/gallery reads with server-side publication and approval filters, stable ordering, bounded pagination, and approved cache behavior. Keep unpublished content inaccessible through guessed slugs/IDs/objects.
- **Requirement IDs:** FR-01–FR-03, FR-05–FR-08, FR-10; NFR-01, NFR-05, NFR-08; AE-03, AE-05, AE-14.
- **Relevant specification sections:** api-specification.md §§2–4, 7–8; architecture.md §§5–7; database-schema.md §§4.2–4.6; security-specification.md SEC-05/07/16; testing-strategy.md §§3.3–3.5, 6.
- **Prerequisites/dependencies:** TASK-007, TASK-011, TASK-013; approved content settings from TASK-005.
- **Expected files/components:** public read/query services and handlers; allowlisted response projections; cache policy implementation.
- **Acceptance criteria:** (1) Public result contains only approved public fields. (2) Draft/unpublished/unapproved content returns no public data. (3) Invalid and inaccessible slugs follow approved not-found contract. (4) Pagination is bounded and deterministic. (5) Cache behavior honors approved freshness and private-data exclusion.
- **Tests:** Public projection contract; anonymous access matrix; guessed-resource tests; pagination validation; cache-header/invalidation tests.
- **Verification commands:** TBD after API/test tooling is established.
- **Risks/notes:** API contract/media delivery/cache freshness are open until TASK-007.
- **Status:** Blocked — listed dependencies.

### TASK-015 — Implement admissions enquiry create and admin services

- **Objective:** persist a minimal enquiry and allow only authorized staff to review/update it.
- **Description:** implement server validation/abuse controls and create operation; persist before returning success; implement authorized list/detail/status update, bounded pagination, `no-store`, privacy-safe errors/logs, and approved retry/idempotency semantics.
- **Requirement IDs:** G1, G4; FR-04, FR-09; NFR-04–NFR-06; SEC-02, SEC-05, SEC-06, SEC-08, SEC-10, SEC-18; AE-04, AE-05, AE-08–AE-10.
- **Relevant specification sections:** PRD FR-04, §6.3, §§8.2(E), 14–15; api-specification.md §§2–5, 7–8; database-schema.md §4.5; security-specification.md §§6–10; testing-strategy.md §§3.3–3.5, 6.
- **Prerequisites/dependencies:** TASK-003, TASK-004, TASK-007, TASK-011, TASK-012, TASK-013.
- **Expected files/components:** enquiry application service, server handlers, protected query/update operations, synthetic integration fixtures.
- **Acceptance criteria:** (1) Valid approved fields persist and produce success only after commit. (2) Invalid and rate-limited requests are rejected safely. (3) Anonymous/unauthorized direct reads and updates are denied. (4) PII does not appear in public response, URL, log, or error. (5) Unknown database outcome does not produce false success or blind mutation retry.
- **Tests:** Unit validation/status tests; DB transaction tests; direct API authorization and response projection tests; storage/dependency fault simulation; sentinel log-redaction test.
- **Verification commands:** TBD after test runner/API commands are created.
- **Risks/notes:** Real enquiry collection remains blocked until privacy, account, retention, provider, and production approvals pass.
- **Status:** Blocked — listed dependencies.

### TASK-016 — Implement news management services and publication rules

- **Objective:** support approved news lifecycle and expose only published articles publicly.
- **Description:** implement admin list/create/update/preview/publish/unpublish/archive/delete only as authorized by contract; enforce slug uniqueness, status transitions, safe rich-text handling, eligible featured media, and public cache invalidation.
- **Requirement IDs:** G2, G4, G5; FR-06, FR-09, FR-10; NFR-01, NFR-04, NFR-08; AE-03–AE-05, AE-09, AE-14, AE-18.
- **Relevant specification sections:** PRD FR-06, FR-09–FR-10; api-specification.md §§2–5, 7–8; database-schema.md §4.2; security-specification.md SEC-05–SEC-07, SEC-16; testing-strategy.md §§3.1, 3.3–3.5, 6.
- **Prerequisites/dependencies:** TASK-004, TASK-006 (where featured media is identifiable), TASK-007, TASK-011, TASK-012, TASK-013.
- **Expected files/components:** news service/repository operations, preview and publication handlers, sanitizer/render-safe content boundary.
- **Acceptance criteria:** (1) Draft save does not expose content publicly. (2) Authorized publish makes approved content available at list and stable slug; unpublish makes it unavailable under approved freshness target. (3) Preview is authorized and non-cacheable. (4) Duplicate slugs/invalid transitions return documented conflict/validation errors. (5) Rich text is safely rendered.
- **Tests:** Lifecycle state tests; public leakage/guessed slug tests; XSS payload tests; role matrix; cache invalidation and conflict tests.
- **Verification commands:** TBD after approved application/test tooling.
- **Risks/notes:** Deletion/retention, approver separation, timezone, and cache freshness must be settled in TASK-007.
- **Status:** Blocked — listed dependencies.

### TASK-017 — Implement private media storage and gallery services

- **Objective:** securely validate, store, publish, and remove approved gallery images.
- **Description:** implement authorized upload to private staging, file-content validation and approved limits, metadata/alt text, optional album/order, publication preconditions, optimized rendition delivery, unpublish/removal, partial failure cleanup/reconciliation, and cache/takedown behavior.
- **Requirement IDs:** G2, G4; FR-06–FR-07, FR-09; NFR-01, NFR-03–NFR-06; SEC-05, SEC-09, SEC-10, SEC-16; AE-03, AE-04, AE-09, AE-14.
- **Relevant specification sections:** PRD FR-06–FR-07, §§8.2(C-D); api-specification.md §§2, 4–8; database-schema.md §§4.3–4.4; security-specification.md SEC-05/09/10/16/17; testing-strategy.md §§3.3, 3.5, 3.9, 3.11.
- **Prerequisites/dependencies:** TASK-002, TASK-006, TASK-007, TASK-010, TASK-011, TASK-012, TASK-013.
- **Expected files/components:** media service/storage adapter, private staging workflow, image metadata and public rendition handler or approved delivery integration, cleanup/reconciliation procedure.
- **Acceptance criteria:** (1) Upload is authenticated/authorized and private until all checks/approval pass. (2) Unsupported/spoofed/oversized content fails per approved contract. (3) Partial DB/storage failure never exposes a public object/reference. (4) Only approved published rendition is public. (5) Removal and cache limits are accurately reported; no false erasure claim.
- **Tests:** Synthetic image type/size tests; guessed object access; unauthenticated upload; publication authorization; DB/storage failure injection; orphan cleanup and cache/takedown verification.
- **Verification commands:** TBD after selected storage/provider and test tooling.
- **Risks/notes:** Do not publish identifiable student media until required approval evidence exists. Storage provider and delivery approach are not selected.
- **Status:** Blocked — listed dependencies.

### TASK-018 — Implement editable school content and settings services

- **Objective:** support authorized editing of approved About/Academics content and designated public settings.
- **Description:** after contract approval, implement content read/update and settings allowlist operations, server-side validation, safe URL handling, publication/approval rules, and public projections. Never accept infrastructure secrets.
- **Requirement IDs:** G2, G4; FR-02, FR-03, FR-08–FR-10; NFR-04, NFR-05, NFR-07, NFR-08; AE-02–AE-05, AE-07, AE-15.
- **Relevant specification sections:** PRD FR-02, FR-03, FR-08–FR-10; api-specification.md §§2, 4, 7–8 (About/Academics routes currently absent); database-schema.md §§4.6, 12; security-specification.md SEC-05–SEC-08, SEC-11; design.md §§5, 8.
- **Prerequisites/dependencies:** TASK-005, TASK-007, TASK-011, TASK-012, TASK-013.
- **Expected files/components:** application services/repositories and handlers for approved page content/settings; safe public/admin projections.
- **Acceptance criteria:** (1) Every editable field is on an approved allowlist. (2) Missing/unapproved public fields are omitted. (3) Invalid URLs/contact values are rejected. (4) Server rejects secrets and unknown mutation fields. (5) Successful edit is reflected publicly only after authorized persisted update.
- **Tests:** Contract/validation tests, public projection tests, unauthorized update tests, safe URL scheme tests, settings secret-field rejection.
- **Verification commands:** TBD after contract and test tooling exist.
- **Risks/notes:** PRD requires editable About/Academics but current API proposal omits those operations; TASK-007 must resolve this gap.
- **Status:** Blocked — listed dependencies.

## Phase 4 — Public and administration interfaces

### TASK-019 — Establish approved design tokens and shared interface shell

- **Objective:** create reusable public/admin presentation foundations based on approved visual inputs.
- **Description:** apply school-approved brand assets and colors; define semantic tokens, typography, spacing, focus/status styles, public and admin shells, header/footer, responsive navigation, and shared input/button/card/dialog/loading components.
- **Requirement IDs:** G2, G3, G6; FR-01, FR-09; NFR-02, NFR-03, NFR-07.
- **Relevant specification sections:** PRD §10; design.md §§3–4, 7, 9; implementation-plan.md IP-07; testing-strategy.md §§3.2, 3.7–3.8.
- **Prerequisites/dependencies:** TASK-002, TASK-005, TASK-008.
- **Expected files/components:** design token styles/config, shared UI components, public/admin layouts and component tests.
- **Acceptance criteria:** (1) Token values derive from approved brand input; no guessed official palette. (2) Logo preserves supplied proportions. (3) Focus, disabled, loading, error, and success states are defined. (4) Navigation works by keyboard and touch, exposes state, and reflows without page overflow at PRD widths. (5) Component tests verify labels/roles/states.
- **Tests:** Component behavior; automated accessibility checks on shell; manual keyboard and viewport review.
- **Verification commands:** TBD after UI runner/linter scripts are set up.
- **Risks/notes:** Current design document's numeric tokens are provisional; do not treat them as school-approved brand guidelines.
- **Status:** Blocked — TASK-002, TASK-005, TASK-008.

### TASK-020 — Implement public Home, About, Academics, Contact, and Privacy pages

- **Objective:** deliver core school information pages with approved content and graceful missing-content handling.
- **Description:** build responsive public routes using shared shell and approved content services; omit unavailable optional facts; link admissions/contact appropriately; render school-approved privacy notice.
- **Requirement IDs:** G1–G3, G5; FR-01–FR-03, FR-08, FR-10; NFR-01–NFR-03, NFR-05, NFR-08.
- **Relevant specification sections:** PRD FR-01–FR-03, FR-08, FR-10; design.md §§3, 5; api-specification.md public reads; testing-strategy.md §§3.2, 3.6–3.8.
- **Prerequisites/dependencies:** TASK-005, TASK-014, TASK-018, TASK-019; privacy text from TASK-003.
- **Expected files/components:** public routes/pages and content presentation components.
- **Acceptance criteria:** (1) Routes display only approved content. (2) Empty optional sections do not create blank headings or fabricated copy. (3) Home links prominently to Admissions and exposes approved contact routes. (4) Contact data is consistent with approved settings. (5) Privacy notice is available before enquiry submission.
- **Tests:** Component/E2E route checks, content audit, accessibility and responsive tests, link checks.
- **Verification commands:** TBD after application scripts are established.
- **Risks/notes:** If approved copy or contact fields are missing, render safely and block launch for required content rather than inventing it.
- **Status:** Blocked — listed dependencies.

### TASK-021 — Implement Admissions page and enquiry form

- **Objective:** deliver the public admissions journey with truthful submission and validation states.
- **Description:** build approved admissions content, minimal form, client feedback, server submission integration, privacy notice link/acknowledgement as approved, safe failure/retry guidance, and verified contact alternatives.
- **Requirement IDs:** G1, G3; FR-04, FR-05; NFR-02–NFR-05.
- **Relevant specification sections:** PRD FR-04–FR-05, §6.1/6.3; design.md §5 Admissions; api-specification.md §4 public enquiry; testing-strategy.md §§3.2, 3.6–3.9, 6.
- **Prerequisites/dependencies:** TASK-003, TASK-005, TASK-007, TASK-015, TASK-019, TASK-020.
- **Expected files/components:** Admissions route/form, validation and status components, safe contact links.
- **Acceptance criteria:** (1) Form collects only approved fields. (2) Client and server errors are associated with fields; multi-error submit exposes a linked summary. (3) Values are retained after validation/service failure where safe. (4) Success appears only after confirmed persistence. (5) Mobile and keyboard use are supported. (6) WhatsApp option is omitted when configuration is invalid and form remains available.
- **Tests:** Valid/invalid form UI tests; API failure/timeout cases; persistence-confirmed E2E; PII absence in URL/log/response; keyboard/mobile checks.
- **Verification commands:** TBD after app scripts; exact E2E/test commands recorded in README.
- **Risks/notes:** Do not enable production submission before privacy/retention approvals and production gate.
- **Status:** Blocked — listed dependencies.

### TASK-022 — Implement public News and Gallery experiences

- **Objective:** let visitors browse only published, approved announcements and images.
- **Description:** build listing/article routes, stable slug not-found behavior, published gallery grid and accessible viewer, captions/alt text, pagination/empty/error states, and optimized responsive images.
- **Requirement IDs:** G2, G3, G5; FR-01, FR-06–FR-07, FR-10; NFR-01–NFR-03, NFR-05, NFR-08.
- **Relevant specification sections:** PRD FR-06–FR-07, FR-10; design.md §5 News/Gallery; api-specification.md public news/gallery operations; testing-strategy.md §§3.2, 3.6–3.8.
- **Prerequisites/dependencies:** TASK-014, TASK-016, TASK-017, TASK-019.
- **Expected files/components:** news listing/article routes, gallery route/viewer, image/card components.
- **Acceptance criteria:** (1) Draft/unpublished items never render publicly. (2) Invalid/inaccessible article slug shows not-found. (3) Empty/unavailable content is handled without broken layout. (4) Gallery controls work with keyboard and assistive technology; no swipe-only interaction. (5) Images preserve aspect ratio and use approved alt/caption data.
- **Tests:** Public/private state matrix, route/slug tests, viewer keyboard/focus tests, responsive and accessibility checks, image failure case.
- **Verification commands:** TBD after application scripts are established.
- **Risks/notes:** No student image is public without TASK-006 prerequisite and verified authorization.
- **Status:** Blocked — listed dependencies.

### TASK-023 — Implement protected admin shell and dashboard overview

- **Objective:** provide an authorized, navigable dashboard with truthful status and persisted metrics.
- **Description:** create protected admin layout/navigation, session state, sign out, permission-aware navigation, overview metrics and empty/error/loading states. Server remains the authority for all data access.
- **Requirement IDs:** G4, G6; FR-09; NFR-03–NFR-04, NFR-07.
- **Relevant specification sections:** PRD FR-09, §6.2, §§14.2/15; design.md §5 Admin screens; api-specification.md session/dashboard operations; security-specification.md SEC-01–SEC-05; testing-strategy.md §§3.2, 3.6, 3.8–3.9.
- **Prerequisites/dependencies:** TASK-004, TASK-007, TASK-012, TASK-013, TASK-019.
- **Expected files/components:** protected admin layout, nav, overview screen, session-expiry handling.
- **Acceptance criteria:** (1) Anonymous/inactive users cannot render protected data through direct route or request. (2) Counts derive from persisted records, never hardcoded samples. (3) Enquiry summaries are shown only with explicit permission. (4) Session expiry clears private view and requires reauthentication without blind mutation retry. (5) Logout invalidates session.
- **Tests:** E2E direct-route/auth matrix; session expiry/logout; persisted metrics; responsive and keyboard navigation.
- **Verification commands:** TBD after application scripts are established.
- **Risks/notes:** No UI menu hiding is accepted as an authorization control.
- **Status:** Blocked — listed dependencies.

### TASK-024 — Implement admin enquiry review and status UI

- **Objective:** enable explicitly authorized staff to review and update enquiries.
- **Description:** implement bounded/filterable list and detail, status update, empty/loading/error/conflict feedback, privacy-minimized list rows, and unsaved/request state handling.
- **Requirement IDs:** G1, G4; FR-04, FR-09; NFR-03–NFR-05.
- **Relevant specification sections:** PRD FR-04, FR-09; design.md §5 Enquiry list/detail; api-specification.md admin enquiry operations; security-specification.md SEC-02/05/08/18; testing-strategy.md §§3.2–3.6, 6.
- **Prerequisites/dependencies:** TASK-004, TASK-015, TASK-023.
- **Expected files/components:** protected enquiry list/detail/filter/status components.
- **Acceptance criteria:** (1) Only authorized users can access list/detail/update. (2) Filters and pagination preserve valid state and provide clear/reset action. (3) Status success appears only after persisted update. (4) Failed/conflicting update keeps state honest and offers safe recovery. (5) No export or broad search is added without approval.
- **Tests:** E2E authorized/unauthorized cases; list filter/pagination; status transitions; error/conflict; no-store/private response and PII logging checks.
- **Verification commands:** TBD after application scripts are established.
- **Risks/notes:** Status transitions and display fields require TASK-007 approval.
- **Status:** Blocked — listed dependencies.

### TASK-025 — Implement admin News CMS UI

- **Objective:** provide article authoring and publication controls consistent with approved content lifecycle.
- **Description:** build news list, status filters, create/edit form, save draft, authorized preview, publish/unpublish/archive and delete only when policy permits; show validation, slug conflict, unsaved edits, and success/failure states.
- **Requirement IDs:** G2, G4, G5; FR-06, FR-09–FR-10; NFR-03–NFR-04, NFR-07.
- **Relevant specification sections:** PRD FR-06/FR-09; design.md §5 News list/editor; api-specification.md admin.news operations; testing-strategy.md §§3.2, 3.6–3.9.
- **Prerequisites/dependencies:** TASK-004, TASK-013, TASK-016, TASK-019, TASK-023; media eligibility from TASK-017 if featured image UI is included.
- **Expected files/components:** protected news list/editor/preview screens and form tests.
- **Acceptance criteria:** (1) Draft save does not publish; preview is authenticated/non-cacheable. (2) Publish controls are permission-gated server-side. (3) Required fields/slug errors are accessible and actionable. (4) Unsaved changes are not silently discarded. (5) Destructive actions require approved confirmation/policy.
- **Tests:** Draft/publish/unpublish E2E; form validation; unauthorized action direct request; preview privacy; keyboard/responsive checks.
- **Verification commands:** TBD after app scripts.
- **Risks/notes:** Editor rich-text format and content approval must be decided before UI implementation.
- **Status:** Blocked — listed dependencies.

### TASK-026 — Implement admin Gallery/media management UI

- **Objective:** provide controlled image upload and publication management.
- **Description:** build image list/grid, file-picker upload, alt-text/caption/album/order editing, private preview, publish/unpublish/remove/replace actions, and progress/failure handling.
- **Requirement IDs:** G2, G4; FR-07, FR-09; NFR-03–NFR-06.
- **Relevant specification sections:** PRD FR-07; design.md §5 Gallery management; api-specification.md gallery operations; security-specification.md SEC-09/10/16; testing-strategy.md §§3.2, 3.6–3.9.
- **Prerequisites/dependencies:** TASK-006, TASK-013, TASK-017, TASK-019, TASK-023.
- **Expected files/components:** protected media management/upload form/gallery admin components.
- **Acceptance criteria:** (1) UI has an accessible file picker alternative to drag/drop. (2) It displays approved validation limits and per-file outcomes. (3) Upload is not reported successful until server workflow completes. (4) Publication requires the approved school-authorization precondition. (5) Removal does not claim complete erasure absent provider verification.
- **Tests:** UI upload states; invalid file and partial failure; publication permission; direct unauthorized API; keyboard/AT.
- **Verification commands:** TBD after application scripts.
- **Risks/notes:** Keep identifiable student images private until approval evidence and takedown path work.
- **Status:** Blocked — listed dependencies.

### TASK-027 — Implement admin page-content and settings editor

- **Objective:** allow authorized updates to designated approved About/Academics and site settings.
- **Description:** build structured content editors and approved settings forms; include validation, preview/publish where specified, missing/pending values, safe link handling, and persisted success/error states.
- **Requirement IDs:** G2, G4, G5; FR-02–FR-03, FR-08–FR-10; NFR-03–NFR-05, NFR-07.
- **Relevant specification sections:** PRD FR-02/03/08/09; design.md §5 content/settings editor; api-specification.md settings and approved content contract; database-schema.md §4.6; testing-strategy.md §§3.2, 3.4, 3.6.
- **Prerequisites/dependencies:** TASK-005, TASK-007, TASK-013, TASK-018, TASK-019, TASK-023.
- **Expected files/components:** protected page content and settings forms.
- **Acceptance criteria:** (1) Only approved editable fields are presented and accepted by server. (2) Infrastructure secrets cannot be entered. (3) Missing content is visible only as admin guidance, not public placeholder. (4) Successful update is server-confirmed and updates public projection. (5) Invalid contact/URL data has associated field feedback.
- **Tests:** Form and contract tests; authorization matrix; public view update; unsafe URL/secret field rejection.
- **Verification commands:** TBD after application scripts.
- **Risks/notes:** Product currently lacks finalized About/Academics API contract; do not invent endpoint or schema.
- **Status:** Blocked — listed dependencies.

### TASK-028 — Implement SEO and public index boundaries

- **Objective:** provide technical discoverability for approved public pages and exclude private/admin content.
- **Description:** add unique metadata, canonical rules, social sharing metadata, sitemap, robots rules, human-readable public routes, semantic content and accurate structured data only where verified. Exclude dashboard, enquiry records, drafts, and unpublished content.
- **Requirement IDs:** G5; FR-10; NFR-08; AE-03, AE-14.
- **Relevant specification sections:** PRD FR-10, NFR-08; architecture.md §§2, 7; design.md public page sections; testing-strategy.md §§3.4, 3.6, 6.
- **Prerequisites/dependencies:** TASK-005, TASK-014, TASK-018, TASK-020, TASK-022.
- **Expected files/components:** metadata helpers, sitemap/robots routes or files, canonical/structured-data logic.
- **Acceptance criteria:** (1) Each approved public route has accurate unique title/description. (2) Sitemap contains only approved public routes/articles. (3) Admin/private/draft data is not indexed or exposed in public endpoints. (4) Structured data contains only verified facts. (5) No claim is made that search ranking is guaranteed.
- **Tests:** Metadata/sitemap/robots assertions; crawl of synthetic published/unpublished fixtures; no sensitive output test.
- **Verification commands:** TBD after application scripts.
- **Risks/notes:** School name/location and organizational claims need content approval.
- **Status:** Blocked — listed dependencies.

## Phase 5 — Integration, release assurance, and deployment

### TASK-029 — Automate critical MVP end-to-end journeys

- **Objective:** verify complete visitor and administrator journeys against an integrated application.
- **Description:** automate public navigation, admissions enquiry save/failure, WhatsApp link configuration, sign-in/session/logout, news draft/publish/unpublish, gallery visibility, authorized enquiry review/status update, and direct unauthorized access attempts using synthetic state.
- **Requirement IDs:** G1–G5; FR-01, FR-04–FR-09; NFR-02, NFR-04–NFR-06; AE-03–AE-05, AE-08–AE-09.
- **Relevant specification sections:** PRD §§6, 14–15; testing-strategy.md §§3.6, 4–6, 8–10; implementation-plan.md IP-11.
- **Prerequisites/dependencies:** TASK-009, TASK-014–TASK-027; stable synthetic test environment from TASK-010.
- **Expected files/components:** Browser E2E specs, fixtures/seed/reset utilities, sanitized failure artifacts.
- **Acceptance criteria:** (1) Critical journeys assert user-visible outcome and persisted state where applicable. (2) Private route/data access is denied to anonymous/unauthorized actors. (3) Tests are deterministic, isolated, and do not call production/external write APIs. (4) Failure artifacts contain no secrets or personal data.
- **Tests:** Playwright or approved equivalent; final browser set per stack decision.
- **Verification commands:** TBD after E2E runner selection; add exact CI command to repository documentation.
- **Risks/notes:** Do not assert only page load; do not use retries to hide flakiness.
- **Status:** Blocked — listed dependencies.

### TASK-030 — Complete responsive and accessibility verification

- **Objective:** verify critical public/admin screens meet responsive and WCAG 2.2 AA target requirements.
- **Description:** run automated accessibility checks and manual keyboard/assistive-technology review on critical routes and error/empty/loading/dialog/menu states; verify responsive behavior at PRD widths.
- **Requirement IDs:** NFR-02, NFR-03; FR-01, FR-04, FR-06–FR-09; PRD §14.3.
- **Relevant specification sections:** PRD §§10.3, 11.2–11.3, 14.3; design.md §§4–7; testing-strategy.md §§3.7–3.8, 7–10.
- **Prerequisites/dependencies:** TASK-019–TASK-028; stable candidate build.
- **Expected files/components:** Accessibility/responsive findings report; regression tests for fixed issues; documented exceptions if formally approved.
- **Acceptance criteria:** (1) Automated checks run on representative routes/states and report tool/version. (2) Manual keyboard traversal covers critical journeys and no keyboard trap/unreachable action remains. (3) Layout checked at 360, 390, 768, 1024, 1440 CSS px and relevant intermediate widths. (4) No unresolved critical/serious accessibility issue or blocked core journey remains without explicit approved exception. (5) No WCAG conformance claim is based only on automation.
- **Tests:** Automated axe or approved equivalent; manual keyboard, screen reader, zoom/reflow, contrast and focus visibility.
- **Verification commands:** TBD after tool choice; record manual test matrix and reports.
- **Risks/notes:** Actual contrast validation requires approved final palette and rendered UI.
- **Status:** Blocked — listed dependencies.

### TASK-031 — Complete security and privacy release review

- **Objective:** verify security/privacy release controls and resolve findings before production.
- **Description:** conduct authorized independent review of authentication/authorization, public/private data separation, API validation, CSRF/session, uploads, safe rich text, cache, secrets, logs, rate controls, retention, and student-media approval/takedown. Map applicable controls to the approved security baseline.
- **Requirement IDs:** NFR-04–NFR-05; SEC-01–SEC-20; AE-03–AE-11, AE-13–AE-16.
- **Relevant specification sections:** security-specification.md §§6–10; testing-strategy.md §§3.9, 6, 8; PRD §§11.4–11.5, 12, 14.2, 15.
- **Prerequisites/dependencies:** TASK-003, TASK-004, TASK-006, TASK-012–TASK-018, TASK-021–TASK-027; staging only.
- **Expected files/components:** security review report, issue/remediation record, regression tests, privacy/media approval evidence, documented residual risks.
- **Acceptance criteria:** (1) Direct auth/authz and private publication tests pass. (2) No critical/high issue remains unresolved for release. (3) Logs, artifacts, and responses contain no prohibited sensitive data. (4) Privacy, retention, external data transfer, and media approval gates have owner evidence. (5) Any exception is explicitly approved and does not weaken mandatory controls.
- **Tests:** Negative security regression suite; dependency/secret scans; independent human review with synthetic data.
- **Verification commands:** Exact scanners/tests TBD after stack and tools approval; report all commands, versions, and scope.
- **Risks/notes:** This is not a request for unauthorized penetration testing or production attack activity. No security certification is implied.
- **Status:** Blocked — listed dependencies.

### TASK-032 — Verify performance, reliability, migrations, backup, and rollback

- **Objective:** demonstrate operational behavior and recovery limits against approved targets.
- **Description:** measure lab/staging Core Web Vitals and approved workload; test bounded lists/media; inject DB/identity/storage failures; verify migration upgrade and compatibility; restore backup and verify data/media integrity; exercise deployment rollback/forward fix and record limitations.
- **Requirement IDs:** NFR-01, NFR-04, NFR-06–NFR-07; AE-06, AE-08–AE-10, AE-14–AE-17.
- **Relevant specification sections:** PRD §§11.1, 11.6, 14–15; architecture.md §§7, 9–10, 14; database-schema.md §9; implementation-plan.md §6; testing-strategy.md §§3.5, 3.10–3.12.
- **Prerequisites/dependencies:** TASK-009–TASK-011, TASK-017, TASK-029; approved workload, cache freshness, RTO/RPO, and operations owner.
- **Expected files/components:** performance report, migration results, restore/rollback evidence, operational runbook updates.
- **Acceptance criteria:** (1) Workload and environment are stated; no unsupported capacity claim. (2) Failure tests do not produce false success, unauthorized fallback, or public partial media. (3) Clean install and supported upgrade pass on disposable DB. (4) Backup restore verifies representative synthetic records and media linkage; measured result compared to approved RTO/RPO. (5) Rollback/forward-fix limitations and authority are documented.
- **Tests:** Staging performance/load and fault injection; migration and backup/restore/rollback rehearsals.
- **Verification commands:** Provider/tool-specific commands TBD after infrastructure approval.
- **Risks/notes:** Never execute destructive migration, load, or fault tests on production.
- **Status:** Blocked — listed dependencies and operational decisions.

### TASK-033 — Prepare deployment and support documentation

- **Objective:** ensure named operators can deploy, monitor, recover, and hand over the application safely.
- **Description:** document environment setup, approved hosting/domain/HTTPS, secret configuration/rotation, migrations, release/rollback, backups/restore, monitoring/alerts, incident escalation, and support ownership. Keep sample configuration secret-free.
- **Requirement IDs:** G6; NFR-04, NFR-06–NFR-07; PRD §§15, 17–18; AE-07, AE-10, AE-16–AE-17.
- **Relevant specification sections:** implementation-plan.md IP-03/IP-12; architecture.md §§9–10, 14; security-specification.md §§7–8; testing-strategy.md §§3.11–3.12, 8, 10.
- **Prerequisites/dependencies:** TASK-002, TASK-010, TASK-032; named operations/incident owners.
- **Expected files/components:** `docs/deployment.md`, README updates, `.env.example`, recovery/incident/runbook references.
- **Acceptance criteria:** (1) A named operator can follow a clean deploy and rollback procedure in staging. (2) Required environment variables are documented without secret values. (3) Backup restore and incident owners/contacts are assigned. (4) Procedure states irreversible migration and media deletion limits. (5) Instructions match actual implementation and selected providers.
- **Tests:** Documentation walkthrough by an operator not authoring the runbook; staging deploy/rollback exercise.
- **Verification commands:** Commands are specific to selected tooling; none is currently available.
- **Risks/notes:** Do not claim backups, monitoring, HTTPS, or rollback are operational until exercised.
- **Status:** Blocked — listed dependencies.

### TASK-034 — Deploy approved MVP and verify production smoke checks

- **Objective:** release the MVP only after all technical and school approval gates pass.
- **Description:** execute approved production preflight, backup check, compatible migration sequence, release deployment, domain/HTTPS verification, public and authorized-admin smoke tests, private cache/data boundary checks, monitoring/alert verification, and owner handover.
- **Requirement IDs:** G1–G6; FR-01–FR-10; NFR-01–NFR-08; all PRD §15 acceptance criteria; AE-06–AE-10, AE-14–AE-17.
- **Relevant specification sections:** PRD §§14–15, 17–21; implementation-plan.md IP-11/IP-12 and §6; architecture.md §§9–10, 14; security-specification.md §8; testing-strategy.md §§8, 10.
- **Prerequisites/dependencies:** TASK-028–TASK-033; explicit school/project-owner launch approval; approved public content/privacy notice/contacts; identity, provider, data-location, student-media, and operations gates.
- **Expected files/components:** deployment record, migration/version record, smoke-test evidence, handover/known-limitations record.
- **Acceptance criteria:** (1) Every mandatory PRD launch acceptance item has evidence or is explicitly blocking launch. (2) Preflight and migration checks pass with a verified recovery point. (3) HTTPS and public critical routes work. (4) Authorized admin can perform smoke actions while anonymous/unauthorized requests remain denied. (5) No production enquiry or identifiable media is used in smoke tests without explicit authorization. (6) Operations owner accepts access and runbooks.
- **Tests:** Production-safe smoke tests only; no destructive test, fake public enquiry or student media publish, load test, or fault injection against production.
- **Verification commands:** Deployment/provider-specific commands TBD; record exact commands, release identifier, date, and results.
- **Risks/notes:** Rollback may be limited by schema/data changes; follow TASK-033 runbook and do not launch without explicit owner approval.
- **Status:** Blocked — all release gates and approvals.

## Dependency map

```text
TASK-001 Specification authority
  ├─→ TASK-002 Technical baseline/spikes
  ├─→ TASK-003 Privacy/enquiry policy
  ├─→ TASK-004 Identity/permissions
  ├─→ TASK-005 Approved content/brand
  └─→ TASK-006 Student-media policy
        └─→ TASK-007 Approved API/schema/content contracts

TASK-002 + TASK-007 + TASK-008/009/010 foundations
  → TASK-011 Migrations ─┐
  → TASK-012 Auth ────────┼→ TASK-013 Request boundary
                          ├→ TASK-014 Public reads
                          ├→ TASK-015 Enquiries
                          ├→ TASK-016 News
                          ├→ TASK-017 Media
                          └→ TASK-018 Page content/settings

TASK-019 Shared UI
  → TASK-020 Public info pages
  → TASK-021 Admissions
  → TASK-022 Public news/gallery
  → TASK-023 Admin shell → TASK-024 Enquiries / TASK-025 News /
                           TASK-026 Gallery / TASK-027 Content/settings
TASK-028 SEO
  → TASK-029 E2E, TASK-030 Accessibility, TASK-031 Security,
    TASK-032 Performance/recovery → TASK-033 Runbooks → TASK-034 Release
```

Independent content approval and repository bootstrap can proceed in parallel once their own inputs are approved. After shared data/API/security boundaries are accepted, public UI, enquiries, and CMS slices may be developed concurrently against isolated synthetic fixtures. Production deployment, migration, and cutover are sequential and require explicit authorization.

## First task recommendation

**TASK-001 — Reconcile specification authority and stale security references** was the recommended first task and is Done. It had no technical prerequisite and resolved a concrete conflict: multiple architecture/API/schema documents said the security specification did not exist even though it is present. The Principal designated it reference-only pending formal approval; recording this distinction prevents later code, tests, or database/API contracts from treating proposals as approved. This task does not approve the security baseline.

## Backlog maintenance

- Update a task status only with implementation evidence; do not mark planning/specification work complete because this backlog exists.
- Record newly discovered missing requirements as a blocker/proposed change with affected tasks and owner; do not silently broaden scope.
- Add acceptance criteria or dependency changes only with a documented reason and preserve traceability.
- When exact scripts are established, replace TBD command notes for relevant tasks and keep `testing-strategy.md` aligned.
- Import these task IDs into the approved tracker if one is selected; avoid creating duplicate tasks from the stage-level `IP-*` planning identifiers.
