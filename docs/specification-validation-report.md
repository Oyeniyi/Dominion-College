# Dominion College Website — Specification Validation Report

**Audit date:** 2026-11-10  
**Role:** Principal Software Architect and Independent Specification Auditor  
**Scope:** Specification consistency, completeness, feasibility, traceability, testability, and implementation readiness for the MVP  
**Disposition:** **Not ready for feature implementation or production data.** Governance and clarification work may proceed. No application code was changed or evaluated.

> **Post-audit update (2026-11-10):** The Principal designated `security-specification.md` reference-only pending formal approval. TASK-001 recorded that decision and reconciled the documents without approving the proposed controls. FIND-01 and the directly related stale task-ID/Definition-of-Done assertions in FIND-08 are closed after cross-document and link verification. This does not resolve the substantive security-baseline approval or other implementation blockers.

## 1. Executive summary

The documentation describes a coherent high-level MVP: a public school website, protected content-management dashboard, admissions enquiry flow, and WhatsApp click-to-chat. The PRD identifies the central privacy and child-protection constraints. Architecture and implementation planning generally preserve the intended server-side authorization boundary, published/private separation, synthetic test-data practice, and no-runtime-AI scope. The 34-task backlog has valid dependency references and no dependency cycles.

The project is **not implementation-ready**. All four ADRs remain Proposed; core privacy, identity, media-approval, data-contract, provider, and operational decisions remain open. Cross-document contradictions and gaps prevent treating the proposed API/schema/security rules as an approved build baseline. The repository has no product source, dependencies, migrations, tests, CI, deployment configuration, or runtime environment. No product behavior or compatibility claim has therefore been verified.

### Severity breakdown

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 6 |
| Medium | 5 |
| Low | 0 |

Severity describes the specification or readiness impact, not an exploitable defect in unbuilt software.

### Decision summary

- **Confirmed contradictions / drift:** security-specification existence/status and stale task-ID/Definition-of-Done assertions were recorded at audit time and reconciled under TASK-001 (FIND-01/FIND-08); incomplete security-task mapping remains.
- **Confirmed design omissions:** editable About/Academics content contract/storage; conditional privacy acknowledgement persistence; evidence-backed student-media approval workflow; administrator permission model.
- **Known unresolved failure behavior:** enquiry timeout/retry/idempotency and cross-service media recovery require decisions before acceptance can be tested.
- **Unverified assumptions:** exact framework/runtime/dependency compatibility and developer-AI tool data governance.
- **AI runtime/evaluation:** consistent exclusion from MVP. No runtime AI or AI evaluation specification is present or required for current MVP.

## 2. Documents and repository evidence reviewed

### Governing product and workflow

- [`../prd.md`](../prd.md): product scope/non-goals, goals G1–G6, FR-01–FR-10, NFR-01–NFR-08, business/data policies, acceptance criteria, future releases, and assumptions.
- [`../AGENTS.md`](../AGENTS.md): document authority, privacy/security rules, change control, testing evidence, and completion reporting.
- [`specification-audit.md`](./specification-audit.md): prior PRD design-readiness audit and open findings AUD-01–AUD-20. Its 2026-10-27 repository baseline is historical; it predates the additional specifications now in the workspace.
- [`research-and-decisions.md`](./research-and-decisions.md): technical research and proposed choices, including explicit non-approval and open owner decisions.

### Architecture, data, API, security, and design

- [`architecture.md`](./architecture.md) and [`architecture-essential.md`](./architecture-essential.md).
- [`data-architecture.md`](./data-architecture.md), [`database-schema.md`](./database-schema.md), and [`api-specification.md`](./api-specification.md).
- [`security-specification.md`](./security-specification.md).
- [`design.md`](./design.md).
- [`testing-strategy.md`](./testing-strategy.md), [`implementation-plan.md`](./implementation-plan.md), [`tasks.md`](./tasks.md), [`definition-of-done.md`](./definition-of-done.md), and [`requirements-traceability.md`](./requirements-traceability.md).

### Decisions, AI/evaluation, and repository configuration

- ADR-001 through ADR-004 in [`decisions/`](./decisions/) were reviewed; all are **Proposed**, none Accepted.
- No product-specific AI specification or evaluation strategy was found. AI runtime is expressly excluded from the MVP in the PRD, architecture, security, and testing strategy.
- `.agents/skills/` contains agent/design tooling and its own tests, not Dominion College application code or product dependencies. Those tests are not product verification evidence.
- No product source tree, package/dependency manifest, lockfile, build/test configuration, database/migration, CI workflow, or deployment configuration was found.
- No accepted ADR or live application/infrastructure was available for implementation, dependency, security, migration, or deployment verification.

## 3. Findings

Each finding is classified as a **Confirmed contradiction**, **Confirmed omission**, **Potential risk**, **Recommendation**, or **Unverified assumption**. Findings record the audit-time evidence and their current disposition; later documentation updates do not imply approval of proposed product or security decisions.

### FIND-01 — Security authority and existence references conflict

- **Severity:** High
- **Category:** Document authority / security consistency
- **Classification:** Confirmed contradiction
- **Affected docs:** [`architecture.md`](./architecture.md) §1; [`architecture-essential.md`](./architecture-essential.md) Authority; [`api-specification.md`](./api-specification.md) Authority and §7; [`database-schema.md`](./database-schema.md) header and §11; [`data-architecture.md`](./data-architecture.md) header and §1; [`design.md`](./design.md); [`testing-strategy.md`](./testing-strategy.md); [`security-specification.md`](./security-specification.md); [`implementation-plan.md`](./implementation-plan.md) §2; [`definition-of-done.md`](./definition-of-done.md); [`requirements-traceability.md`](./requirements-traceability.md); [`tasks.md`](./tasks.md).
- **Requirement IDs:** NFR-04, NFR-05; SEC-01–SEC-22; AE-04–AE-11, AE-13–AE-17.
- **Description:** At audit time, several documents stated that `security-specification.md` did not exist, although it was present and labeled Proposed. The Principal has since designated it reference-only pending formal approval; it is not the governing baseline.
- **Evidence:** The audit-time statements were in `architecture.md` §1; `architecture-essential.md` Authority; `api-specification.md` Authority; `database-schema.md` §11; and `data-architecture.md` §1. TASK-001 updates these and associated design, planning, testing, completion, traceability, audit, and readiness references to reflect the Principal's decision.
- **Impact:** At audit time reviewers and implementers could not reliably determine whether the security document was absent, authoritative, or approved. That documentation contradiction is corrected; the separate risk of mistaking a proposed control for accepted policy remains a blocker until formal approval.
- **Recommended correction:** Update all existence/authority statements to distinguish **present** from **approved**, record the owner's authority decision, and do not silently promote the document from Proposed to Approved.
- **Approval requirement:** The Principal's authority decision is recorded. Formal approval of the security baseline remains outstanding; no technical change is authorized by this audit.
- **Status:** Closed — TASK-001 recorded the Principal's decision and reconciled the documentation; cross-document and link checks passed. Formal security-baseline approval remains open and blocks work that depends on its proposed controls.

### FIND-02 — Required About and Academics editing lacks API and data representation

- **Severity:** High
- **Category:** Requirements coverage / API and data consistency
- **Classification:** Confirmed omission
- **Affected docs:** [`../prd.md`](../prd.md) FR-02 and FR-03; [`api-specification.md`](./api-specification.md) §4; [`database-schema.md`](./database-schema.md) §§1, 4.6, 12; [`data-architecture.md`](./data-architecture.md) §§2, 12; [`design.md`](./design.md) website-content editor; [`tasks.md`](./tasks.md) TASK-007, TASK-018, TASK-027.
- **Requirement IDs:** FR-02, FR-03, FR-09; G2, G4; NFR-07.
- **Description:** The PRD requires administrators to update designated About content and academic information without changing application source. The proposed API has no dedicated About/Academics content operations; `admin.settings.update` is the only related write and its settings shape is contact/brand/SEO configuration. The proposed `site_settings` table likewise has no fields/entity for institutional narrative, academic offerings, subject groups, or program information. The API/schema documents explicitly list the content model as an unresolved decision.
- **Evidence:** PRD FR-02 acceptance requires administrators to update About content; FR-03 says academic information can be updated without source changes. API §4 `admin.settings.update` accepts the settings object defined in §2, which contains no About/Academics fields. Database schema §4.6 defines only school identity/contact/brand/social/SEO settings; §12 item 3 asks whether a structured page model is required. TASK-018/027 propose the capability without an approved contract or schema.
- **Impact:** The feature cannot be implemented end-to-end from the current API/schema proposal without inventing fields, adding an undocumented content model, or leaving FR-02/03 unimplemented.
- **Recommended correction:** Have the school/content owner inventory editable About and Academics fields and approve their content structure, validation, publication/approval rules, and edit permissions. Then reconcile the API contract, data architecture, schema, design, and TASK-007/018/027. Avoid introducing a generic CMS absent an approved need.
- **Approval requirement:** School/content owner approval of editable content and publication rules; technical/data owners approve the resulting contract/schema.
- **Status:** Open; the affected implementation tasks should remain blocked until the content model is approved.

### FIND-03 — Privacy acknowledgement shape and persistence policy are unresolved

- **Severity:** High
- **Category:** Privacy / API-data consistency
- **Classification:** Confirmed omission and conditional cross-spec inconsistency
- **Affected docs:** [`../prd.md`](../prd.md) FR-04/NFR-05/§12; [`api-specification.md`](./api-specification.md) §2 `EnquiryCreate`; [`database-schema.md`](./database-schema.md) §4.5/§12; [`data-architecture.md`](./data-architecture.md) §6; [`security-specification.md`](./security-specification.md) SEC-08/SEC-20; [`tasks.md`](./tasks.md) TASK-003, TASK-007, TASK-015.
- **Requirement IDs:** FR-04; NFR-05; SEC-08, SEC-12, SEC-20; AE-05, AE-15.
- **Description:** The PRD says acknowledgement is required “where applicable” and school approval is needed for privacy/consent arrangements. The API example includes `privacyAcknowledged: true`, but its prose makes the field conditional and says evidence/retention are unresolved. The enquiry table has no acknowledgement/evidence field. Thus the wire shape and persistence decision are not settled.
- **Evidence:** API §2 `EnquiryCreate` includes `privacyAcknowledged`; the accompanying prose explicitly says the schema does not define an acknowledgement field and must be aligned if evidence is required. Database schema §4.5 lists enquiry fields without acknowledgement evidence. TASK-003 identifies notice/acknowledgement and retention as owner decisions; the implementation plan identifies the API/schema misalignment as a blocker.
- **Impact:** If school policy or legal review requires recorded acknowledgement, the proposed API cannot guarantee that evidence is stored and retained. If acknowledgement is not required, the request shape may collect an unnecessary value or imply an unapproved consent model.
- **Recommended correction:** Obtain qualified privacy/legal and school-owner decisions about notice, purpose, legal/consent basis, acknowledgement wording, and whether evidence must be stored. Only then align form behavior, API contract, data model, retention, and tests. Do not decide the legal meaning or add a consent table through implementation convenience.
- **Approval requirement:** School/privacy owner and qualified legal review where appropriate; data/API owners approve resulting schema and contract.
- **Status:** Open; production enquiry collection is blocked until resolved.

### FIND-04 — Student-media approval is required but cannot be evidenced by the proposed model

- **Severity:** High
- **Category:** Child protection / data and publication integrity
- **Classification:** Confirmed omission; acknowledged unresolved policy
- **Affected docs:** [`../prd.md`](../prd.md) FR-07/NFR-05/§12/§15; [`security-specification.md`](./security-specification.md) SEC-09/SEC-16; [`database-schema.md`](./database-schema.md) §§1, 4.4, 8, 12; [`api-specification.md`](./api-specification.md) §4 media operations; [`data-architecture.md`](./data-architecture.md) §§2, 6; [`design.md`](./design.md) gallery workflow; [`tasks.md`](./tasks.md) TASK-006/007/017/026/031.
- **Requirement IDs:** FR-07; NFR-04, NFR-05; SEC-09, SEC-16; AE-03, AE-04.
- **Description:** The product requires school authorization before identifiable student photographs are published. The API says image upload/publication must verify the approval state, but no approved evidence format, responsible approver, scope/expiry, revocation path, or record is defined. The schema deliberately contains no approval evidence and explicitly says publication status is not proof of permission.
- **Evidence:** PRD FR-07 image requirements and §15 require school approval. Security spec SEC-09/SEC-16 requires authorization/approval evidence and calls publication a blocker until resolved. Database schema §4.4 and §12 say approval evidence is undefined and no table is proposed. API §4 upload/update expects approval verification without defining how to verify it. TASK-006 is blocked pending school policy.
- **Impact:** A `published` status alone could be mistaken for permission, or staff could publish without verifiable authorization. Public disclosure of minors' images may be difficult or impossible to reverse after download, caching, or sharing.
- **Recommended correction:** Obtain a school-approved media authorization and takedown policy: who approves, which images/uses it covers, what evidence is retained, expiry/withdrawal handling, and how removal propagates. Define the minimum data model/workflow only after that decision. Keep identifiable media private/unpublished until the workflow is approved and verifiable.
- **Approval requirement:** School management/privacy approver; technical/data owner approves the minimum implementation after policy approval.
- **Status:** Open; identifiable student-media publication is a production blocker.

### FIND-05 — Administrator permissions and lifecycle have no approved authorization oracle

- **Severity:** High
- **Category:** Security / architecture readiness
- **Classification:** Confirmed omission
- **Affected docs:** [`../prd.md`](../prd.md) FR-09/§12/§14.2; [`architecture.md`](./architecture.md) §§2, 5, 8, 14; [`architecture-essential.md`](./architecture-essential.md) AE-04; [`security-specification.md`](./security-specification.md) SEC-01–SEC-03; [`api-specification.md`](./api-specification.md) §§2, 4–5; [`database-schema.md`](./database-schema.md) §4.1; [`tasks.md`](./tasks.md) TASK-004, TASK-012, TASK-031.
- **Requirement IDs:** FR-09; NFR-04, NFR-05; SEC-01–SEC-04; AE-04, AE-05.
- **Description:** The architecture/API specify per-operation permissions and fail-closed authorization, while the schema proposes a single candidate `administrator` role. No approved role/action matrix maps users to those permissions. Administrator ownership, bootstrap, recovery/MFA, deactivation, offboarding, and access review are also unresolved. A single role may meet MVP needs, but its exact authority is not decided.
- **Evidence:** PRD FR-09 says a single admin role “may be sufficient” and requires server-side authorization; it does not define a permission matrix. API §4 refers to permissions such as content-read, enquiry-read, and settings-update; API §5 defers provider/session design. Database schema §4.1 uses candidate `role_code` and leaves role values to approval. Security spec SEC-01/02 requires lifecycle ownership and a role/action matrix. TASK-004 remains blocked.
- **Impact:** Implementers cannot reliably determine which direct requests should be allowed or produce a complete authorization test matrix. Over-granting enquiry/media/settings access or blocking legitimate work are both plausible.
- **Recommended correction:** School/account owner approves an MVP role/action matrix (a single role may map to all approved capabilities if justified), account lifecycle, recovery, MFA expectations, and session policy. Then reconcile ADR-003, API permission names, schema role representation, design navigation, and test fixtures.
- **Approval requirement:** School/project owner and nominated account owner; technical/security owner documents enforcement.
- **Status:** Open; identity and protected operations remain blocked.

### FIND-06 — Enquiry timeout, duplicate, and media partial-failure outcomes are not fully specified

- **Severity:** High
- **Category:** Failure handling / reliability / data integrity
- **Classification:** Confirmed omission in acceptance behavior; unresolved risk
- **Affected docs:** [`../prd.md`](../prd.md) FR-04/FR-07/NFR-06/§14; [`architecture.md`](./architecture.md) §§6–7; [`data-architecture.md`](./data-architecture.md) §§3, 5, 7; [`api-specification.md`](./api-specification.md) §§1, 3–5; [`database-schema.md`](./database-schema.md) §§4.5, 6; [`testing-strategy.md`](./testing-strategy.md) §§3.3–3.6, 6; [`tasks.md`](./tasks.md) TASK-015/017/032.
- **Requirement IDs:** FR-04, FR-07; NFR-04, NFR-06; SEC-09/10; AE-08/09.
- **Description:** The documents correctly prohibit success before persistence and blind retries, but a client timeout after a database commit leaves the parent uncertain whether an enquiry exists. Duplicate semantics and idempotency are explicitly open. Media storage and database writes cannot be atomic; orphan cleanup/reconciliation and retry semantics are not fully operationalized. These behaviors therefore lack a final, testable outcome contract.
- **Evidence:** PRD FR-04 asks to prevent duplicates “where reasonably practical” without policy. API §4 public enquiry row leaves duplicate/idempotency open; API §3 disallows false success. Database schema §4.5 has no unique/deduplication constraint and says duplicate semantics are unresolved. API §4 upload/delete describes partial failure but delegates cleanup/reconciliation to a future design. Data architecture §§3/7 explains commit uncertainty and non-atomic object storage.
- **Impact:** Users may submit duplicate enquiries after ambiguous responses, or be unsure whether to retry. Media failures could leave inaccessible or orphaned objects or references. The system must not claim either exactly-once submission or complete deletion without evidence.
- **Recommended correction:** Decide an observable retry/idempotency/reconciliation policy for enquiry creation and media upload/removal, including timeout outcomes, safe user guidance, operator visibility, cleanup, and test oracles. Keep the mechanism proportionate; do not add queues/outbox unless an approved requirement justifies them. Add deterministic fault/timeout tests and recovery procedures.
- **Approval requirement:** Product/admissions owner approves user-visible duplicate behavior; technical/data/operations owners approve reliability mechanism. No policy should be inferred.
- **Status:** Open; implementation and reliability acceptance are blocked for these flows.

### FIND-07 — Security task trace omits release controls SEC-21 and SEC-22

- **Severity:** Medium
- **Category:** Requirement/task traceability
- **Classification:** Confirmed traceability omission
- **Affected docs:** [`security-specification.md`](./security-specification.md) SEC-21/SEC-22; [`tasks.md`](./tasks.md) TASK-031 and TASK-033/034; [`requirements-traceability.md`](./requirements-traceability.md) §§6, 9.2.
- **Requirement IDs:** SEC-21, SEC-22; NFR-04, NFR-06, NFR-07.
- **Description:** TASK-031 explicitly maps SEC-01–SEC-20, while the security specification defines SEC-21 secure deployment/configuration and SEC-22 security testing/change control. TASK-033/034 cover related deployment work, but TASK-031's security-release review does not name those two controls. The traceability report already identifies the gap; the backlog has not yet been reconciled.
- **Evidence:** `tasks.md` TASK-031 “Requirement IDs” and “Relevant specification sections” list SEC-01–SEC-20. `security-specification.md` §6 defines SEC-21/22. TASK-033/034 cover deployment and smoke checks but do not replace an explicit security-control review.
- **Impact:** Security release evidence may omit configuration/deployment controls or review/change-control coverage, and a task-based release checklist may appear complete without those controls being assessed.
- **Recommended correction:** Update task traceability and acceptance criteria to cover SEC-21/22 through TASK-031, TASK-033/034, or explicitly scoped additional work. Ensure release evidence maps each control to its actual owner/check.
- **Approval requirement:** Technical/security owner approves the task mapping; no product-scope change is needed.
- **Status:** Open; the task traceability omission remains unresolved.

### FIND-08 — Specification and backlog existence/task-ID statements are stale

- **Severity:** Medium
- **Category:** Documentation consistency / change control
- **Classification:** Confirmed contradiction
- **Affected docs:** [`api-specification.md`](./api-specification.md) §10; [`testing-strategy.md`](./testing-strategy.md); [`tasks.md`](./tasks.md) baseline and “First task recommendation”; [`definition-of-done.md`](./definition-of-done.md); [`requirements-traceability.md`](./requirements-traceability.md).
- **Requirement IDs:** G6; NFR-07; project documentation/traceability obligations in PRD §§17–18 and AGENTS.md.
- **Description:** At audit time, the API specification said “No task IDs are defined in the current project materials,” although `tasks.md` defines TASK-001–TASK-034. The backlog also said no `definition-of-done.md` existed, although that file was present.
- **Evidence:** The assertions were in API spec §10; tasks.md opening baseline and backlog maintenance sections; and requirements-traceability.md §9.5. TASK-001 corrected the API, testing strategy, backlog, and traceability references.
- **Impact:** Readers may miss the authoritative backlog or apply outdated completion criteria. Stale assertions reduce confidence in status and review evidence, although they do not themselves alter product behavior.
- **Recommended correction:** Update the stale statements to distinguish historical context from current repository state. Treat TASK IDs as proposed backlog IDs (not necessarily an approved external tracker) and Definition of Done as proposed until its authority is approved.
- **Approval requirement:** Documentation owner; project owner approval only if authority/status is changed.
- **Status:** Closed — TASK-001 corrected the stale statements and cross-document/link checks passed. TASK IDs remain proposed backlog identifiers; Definition of Done remains proposed.

### FIND-09 — Some acceptance criteria remain qualitative or lack launch evidence thresholds

- **Severity:** Medium
- **Category:** Testability / acceptance criteria
- **Classification:** Confirmed omission
- **Affected docs:** [`../prd.md`](../prd.md) FR-01/FR-04/FR-06/FR-07/FR-09, NFR-01/NFR-03, §§14–15; [`specification-audit.md`](./specification-audit.md) AUD-07, AUD-12–AUD-15; [`testing-strategy.md`](./testing-strategy.md) §§7–8; [`definition-of-done.md`](./definition-of-done.md).
- **Requirement IDs:** G1, G3–G6; FR-01, FR-04, FR-06–FR-09; NFR-01–NFR-03.
- **Description:** The PRD has a useful launch checklist and the testing strategy defines evidence types, but several outcomes remain subjective or conditional without approved thresholds: “small number” of navigation steps, “where reasonably practical” duplicate prevention, “gracefully/useful” states, “promptly” refreshed content, “good” performance without launch lab conditions, and “critical tests pass” without a named blocking suite. WCAG 2.2 AA is a target, but content/interface scope and exception approval are not fully assigned.
- **Evidence:** PRD FR-01, FR-04, FR-06–FR-09, NFR-01/NFR-03, §§14–15; prior audit AUD-07, AUD-12–AUD-15. Testing Strategy §7 maps requirement categories to methods and §8 defines proposed CI gates, not exact test cases, performance workloads, or release thresholds.
- **Impact:** Two reviewers could reach different completion or launch decisions while both claim the written criteria were met. Tests cannot establish targets that have not been approved.
- **Recommended correction:** For the launch-critical flows, approve observable thresholds and named blocking checks: navigation path/step count, duplicate/retry behavior, publication/cache freshness, performance workload and measurement method, accessibility route/state coverage and exception authority, and exact release-gating suite. Keep recommended Core Web Vitals distinct from measured field p75 and do not invent targets.
- **Approval requirement:** Product owner approves product thresholds; accessibility, operations, and school owners approve criteria in their areas.
- **Status:** Open; must be resolved or explicitly accepted with bounded rationale before final release gates.

### FIND-10 — Stack and dependency compatibility have not been demonstrated

- **Severity:** Medium
- **Category:** Feasibility / version compatibility
- **Classification:** Unverified assumption
- **Affected docs:** [`research-and-decisions.md`](./research-and-decisions.md) §§1–3/8; [`decisions/ADR-001-typescript-nextjs.md`](./decisions/ADR-001-typescript-nextjs.md); ADR-002–004; [`implementation-plan.md`](./implementation-plan.md) IP-01/IP-02; [`tasks.md`](./tasks.md) TASK-002/TASK-008.
- **Requirement IDs:** G6; NFR-01, NFR-04, NFR-07; AE-01, AE-06, AE-16.
- **Description:** The stack is deliberately provisional. ADR-001 does not select exact Next.js, React, TypeScript, or Node versions; it flags framework-specific React canary compatibility and says to validate at bootstrap. No package manifest/lockfile, runtime, hosting plan, or dependency scan exists. Thus compatibility is neither established nor disproven.
- **Evidence:** ADR-001 Proposed Decision/Risks; research record's framework facts and version caveats; repository inventory has no product manifest/configuration. TASK-002 plans feasibility spikes and TASK-008 is blocked on it.
- **Impact:** Framework/runtime behavior, server/client boundary, caching, identity, and hosting compatibility may require rework if assumptions are treated as proven. No current package conflict or vulnerability can be asserted.
- **Recommended correction:** After owner approval of candidate architecture/provider, run the bounded TASK-002 compatibility spike and record exact versions, lockfile, supported runtime/hosting behavior, reproducible build/test commands, and any framework-specific constraints. Recheck current support/advisories at adoption; do not pin speculative versions in this report.
- **Approval requirement:** School/project owner and technical owner approve baseline/provider; exact dependency selection follows that approval.
- **Status:** Open; expected prerequisite to application bootstrap.

### FIND-11 — Development AI-tool data governance remains an open decision

- **Severity:** Medium
- **Category:** AI permissions / privacy / external data processing
- **Classification:** Potential risk
- **Affected docs:** [`../AGENTS.md`](../AGENTS.md) Security and Change Management; [`security-specification.md`](./security-specification.md) §5/SEC-19; [`architecture-essential.md`](./architecture-essential.md) AE-11; [`research-and-decisions.md`](./research-and-decisions.md) §6/open decisions; [`testing-strategy.md`](./testing-strategy.md) §§1, 2, 6, 11.
- **Requirement IDs:** NFR-05; SEC-19; AE-11.
- **Description:** Runtime AI is consistently out of MVP and no model/evaluation is specified. The security specification correctly treats workspace AI development tools as external processors unless approved, and prohibits using real enquiries, identifiable student photos, credentials, production logs, or private school records without approval. The development platform's retention, data-sharing, tool permissions, and project data classification have not been approved.
- **Evidence:** Security spec §5; research record §6 item 6; AGENTS.md Security and Change Management; no AI/evaluation spec in the repository. This is not a finding of an AI runtime feature or unauthorized data transfer.
- **Impact:** Future AI-assisted development using sensitive project material could cross an unreviewed processor/tool boundary. Current synthetic-data-only instruction is a useful safeguard, but does not establish platform suitability.
- **Recommended correction:** Before any sensitive project data is provided to workspace AI tools, approve the tool/data classification, retention/training terms, access/tool permissions, and allowed data categories. Continue using synthetic/non-identifying data. Do not add runtime AI or AI evaluations without a separately approved scope and evaluation specification.
- **Approval requirement:** School/project owner and responsible platform/privacy owner.
- **Status:** Open as a conditional governance decision; no runtime-AI blocker for the current MVP.

## 4. Coverage gaps and consistency assessment

### Requirements coverage

- **Broadly covered at planning level:** all PRD goals G1–G6 and FR-01–FR-10 map to design and/or backlog tasks. NFR-01–NFR-08 have proposed verification approaches.
- **Not covered by implementation:** none; there is no product implementation. “Covered” above means documented/planned only.
- **Important requirements with incomplete design/contract coverage:** FR-02/03 editable page content; FR-04 acknowledgement evidence and ambiguous retry behavior; FR-07 verifiable image-approval evidence; FR-09 approved permissions and administrator lifecycle; performance/recovery targets; SEC-21/22 task mapping.
- **Deferred scope:** portals, payments, SIS/CRM, analytics and runtime AI remain non-goals/optional or future-release candidates, not approved implementation work. Do not add them without a change decision.

### Architectural consistency

- The target logical architecture is generally consistent with PRD boundaries: trusted server-side access, server authorization, explicit public projections, no direct database credentials in browsers, and minimal external services.
- Technology/provider ADRs are proposed only; target architecture is not evidence that these controls have been implemented.
- Security-spec existence claims in `architecture.md`, `architecture-essential.md`, and related data/API/schema documents were corrected under TASK-001 (FIND-01); formal security-baseline approval remains open.
- No product code exists to validate dependency direction, runtime boundaries, caching, or framework compatibility.

### Data/API/business-rule consistency

- Enquiry, news, gallery, admin, and settings entities broadly match PRD concepts, with key open decisions recorded rather than silently chosen.
- About/Academics editing does not have a corresponding page-content representation or write contract (FIND-02).
- API acknowledgement and persistence policy do not yet align (FIND-03).
- Media approval is required at the business boundary, but approval evidence and revocation workflow are not defined or represented (FIND-04).
- Role permissions, status transitions, duplicate behavior, slug/timezone policy, retention/deletion, and storage-delivery/cache behavior remain unresolved in the specifications. These are blockers where they affect the corresponding feature or production data.

### Security and access consistency

- Proposed architecture/API/security rules agree on server-side authorization, deny-by-default behavior, privacy-protected reads, safe errors, and explicit publication boundaries.
- The permission vocabulary in API operations has no approved role/action matrix or owner lifecycle (FIND-05).
- Security-spec authority is now consistently documented as reference-only pending formal approval; the backlog release review still omits two security requirements (FIND-07).
- No product security implementation, scan, independent review, or penetration test exists. No exploitable vulnerability is asserted by this audit.

### AI consistency

- PRD, architecture, security, research, testing, implementation planning, and traceability consistently exclude runtime AI from MVP.
- No AI evaluation specification is present; this is appropriate while runtime AI is excluded. No AI test pass or evaluation criterion is claimed.
- Developer AI tooling is a separate data-processing/tool-permission concern and remains subject to approval before sensitive inputs are used (FIND-11).

### Design and user journeys

- `design.md` covers major public/admin screens, expected form/list/media states, responsive behavior, accessibility patterns, and API integration points as a proposed handoff.
- The design avoids inventing school brand values or facts and identifies required approval inputs.
- Design completion depends on contracts and decisions still open, particularly page-content editing, auth/permissions, privacy acknowledgement, media approval, search/pagination semantics, and failure/retry behavior (FIND-02–FIND-06).
- There is no implemented UI to compare with the design or verify its journeys.

### Plan, task dependencies, testability, and scope

- Backlog inventory: **34 tasks**. An automated read-only consistency check found no unknown dependency IDs and no dependency cycles.
- Tasks are proposals, not evidence that requirements are implemented. TASK-001 is Done as documentation reconciliation; the other work remains blocked or unstarted. The intended approval tasks and gated implementation order are broadly consistent with `implementation-plan.md`.
- TASK-031 omits SEC-21/22 (FIND-07); stale task-ID and Definition-of-Done statements were reconciled under TASK-001 (FIND-08).
- Testing strategy proposes appropriate test levels and evidence practices, but no executable product test IDs, runner, CI, or tests exist. The verification aliases in `requirements-traceability.md` are planning labels, not test cases.
- Several PRD completion conditions remain qualitative or lack approved measurable release thresholds (FIND-09).
- No implementation is authorized by this audit; non-goals and optional integrations remain out of scope.

## 5. Recommended correction sequence

The following is a recommendation, not an authorization to change product scope or policy.

1. **Documentation reconciliation completed** under TASK-001: the security-spec reference-only status and corrected task/DoD/API-task references were verified. This does not approve the security baseline.
2. **Obtain owner decisions** for administrator lifecycle/permissions, enquiry privacy/notice/retention/acknowledgement, student-media approval/takedown, and approved public content (TASK-003–006).
3. **Approve a coherent technical baseline and bounded compatibility evidence** (TASK-002), without provisioning production services or using real personal data.
4. **Reconcile the API and data model** (TASK-007): define editable About/Academics content; align acknowledgement policy and storage if required; define media approval evidence; finalize limits, states, pagination, retries, media delivery, and cache invalidation.
5. **Update task/security traceability** to explicitly cover SEC-21 and SEC-22 and ensure task acceptance criteria reference the approved contracts.
6. **Approve observable acceptance and release gates** for ambiguous PRD language, performance/accessibility scope, recovery targets, and critical test suites.
7. **Only then** begin the gated toolchain, CI, isolated environment, migration, identity, and feature tasks. Keep production enquiry collection and identifiable student-media publication blocked until their policies and safeguards are implemented and verified.

## 6. Blockers

### Blocking implementation baseline

- No ADR is Accepted; stack, database/provider, identity, hosting, and media storage are unselected.
- Formal approval of the proposed security baseline remains outstanding; until then it is reference-only and is not the governing baseline.
- About/Academics content editing lacks an API/schema.
- Admin role/action policy and account lifecycle are not approved.
- Enquiry privacy/acknowledgement/retention and media authorization/takedown policies are unresolved.
- Retry/idempotency, publication/cache freshness, media serving/partial failure, and operational recovery need approved testable outcomes.
- No product repository toolchain, test runner, CI, or deployment environment exists.

### Production data/release blockers

- School-approved privacy notice, data purpose/retention/deletion, jurisdiction review, and data-location/provider decisions.
- Verifiable authorization and removal process for identifiable student media.
- Approved public content/contact details and brand assets.
- Account owner, least-privilege role policy, session/recovery expectations.
- Recovery objectives/ownership, successful backup restoration, deployment and incident runbooks.
- Passing evidence for the PRD's mandatory launch criteria, security/privacy checks, accessibility review, and critical journeys.

## 7. Validation method and status

### Checks performed

- Reviewed the listed project specifications, current task backlog, ADRs, PRD acceptance criteria, AI/security statements, and available repository/configuration inventory.
- Compared requirement IDs and cross-document claims, including API/schema field and operation coverage.
- Ran a read-only dependency-reference check over `tasks.md`: **34 tasks; no unknown dependency references; no dependency cycles**.
- Confirmed all four ADRs are Proposed and no product implementation/configuration or evaluation specification is present.

### Checks not performed

- No application build, test, API-contract test, database migration, security scan, accessibility audit, performance test, recovery exercise, deployment smoke test, or runtime compatibility test was run because there is no product implementation/toolchain/environment.
- No external provider or live service was tested.
- No legal/privacy compliance determination or school approval was performed.

### Overall validation status

**Specification baseline: Partially documented, internally inconsistent, and incomplete for implementation.**  
**Implementation readiness: Blocked.**  
**Production readiness: Blocked.**  
**Application security, accessibility, performance, and reliability: Not assessed against running software.**

This report records findings and recommended corrections only. It does not amend the PRD, accept ADRs, approve vendors, define data-retention or consent policy, authorize AI use, change scope, or implement application code.
