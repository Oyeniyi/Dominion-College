# Dominion College Website — Definition of Done

**Status:** Proposed completion and release criteria; not evidence of implementation or approval  
**Scope:** Individual tasks, user-facing features, and production releases for the MVP  
**Authority:** Product acceptance is governed by [`../prd.md`](../prd.md). Development workflow and reporting requirements are in [`../AGENTS.md`](../AGENTS.md). Applicable architecture rules are in [`architecture-essential.md`](./architecture-essential.md); test evidence is governed by [`testing-strategy.md`](./testing-strategy.md); the proposed [`security-specification.md`](./security-specification.md) is reference-only pending formal approval, while PRD and AGENTS.md security/privacy requirements remain governing; delivery sequencing and release gates are in [`implementation-plan.md`](./implementation-plan.md).

> **Current-state boundary:** At the time this document was prepared, no product source, product tests, dependency manifest, CI workflow, deployment configuration, production environment, or runtime AI evaluation specification was found. Criteria below define what must be verified when applicable; they do not mean a check exists or has passed. ADRs and several specifications remain proposed. The security specification is present and Proposed; per the Principal's decision it is reference-only pending formal approval, not the governing security baseline.

## 1. How to apply this checklist

Use the smallest completion level that matches the change:

- **Task completion** applies to every tracked implementation, test, documentation, or operational task.
- **Feature completion** applies when a task delivers or changes behavior across a user-visible or system boundary. It supplements, rather than replaces, task completion.
- **Release readiness** applies to a release candidate, production deployment, or material production infrastructure/data change. It supplements both lower levels.

For each criterion, record **Met**, **Not met**, **Not run**, **Blocked**, or **Not applicable**, with a short reason and evidence reference. “Not applicable” requires a scope-based reason; it is not a substitute for an unrun check. Mandatory criteria must be met at the relevant completion level. Conditional criteria become mandatory when their stated condition applies.

This checklist does not establish a technology stack, approve a proposed API/schema/provider, create school policy, or authorize an exception to security, privacy, child-protection, or product-scope requirements. If governing documents conflict or an unresolved decision affects those areas, stop the affected work and obtain the required owner decision.

## 2. Completion statuses and evidence rules

### 2.1 Test and check outcome labels

Apply these labels to each relevant test suite, manual review, scan, migration rehearsal, or operational exercise:

| Outcome | Meaning | Required record |
|---|---|---|
| **Passed** | The identified check ran to completion against the stated scope/environment and met its expected result. | Exact command or procedure, tool/version where known, environment/build, date, summary, and report/artifact link or location. |
| **Failed** | The check ran and one or more assertions, gates, or expected outcomes were not met. | Failing case/check, sanitized diagnostic, severity/impact, owner, disposition, and linked fix/retest or accepted issue. |
| **Not run** | The check was omitted, skipped, quarantined, or not applicable to the current execution for a reason other than a confirmed environment blocker. | Reason, affected scope, residual risk, owner, and due point or explicit not-applicable rationale. |
| **Blocked** | The check could not be completed because a named prerequisite or environment/service was unavailable or invalid. | Blocker, attempted procedure if any, affected scope, owner, resolution path, and whether the gate remains release-blocking. |

Do not report a suite as passing if a required check is failed, not run, or blocked. A retry that passes does not erase the first failure: retain both outcomes, investigate the cause, and treat intermittent behavior as a flake until resolved or formally dispositioned under the testing strategy. Build success alone is not evidence that behavior, security, accessibility, migration, or deployment is correct.

### 2.2 Evidence quality

- Evidence must identify what was checked, against which change/build and environment, and by whom or which automated job.
- Use CI records, test reports, sanitized logs, review records, screenshots/traces, accessibility reports, migration output, approval records, and operational exercise results as relevant.
- Do not include secrets, raw enquiries, identifiable student information/media, or unnecessary personal data in evidence. Restrict and retain evidence according to approved policy.
- Distinguish local, CI, staging, and production verification. A mock/fake proves behavior at that boundary, not the real provider's operation.
- State limitations and outstanding risks plainly. Never imply a security review, accessibility conformance, performance target, restore, or deployment was verified without evidence from that activity.

## 3. Task completion

Every task must satisfy all applicable mandatory criteria below before it is marked **Done**.

| ID | Criterion and condition | Verification | Evidence | Applicability |
|---|---|---|---|---|
| T-01 | The task's approved objective and measurable acceptance criteria are met; intended behavior is within authorized scope. | Compare the delivered result with the task acceptance criteria and applicable PRD/specification requirements; exercise the changed behavior where applicable. | Task record with requirement references, acceptance results, and links to relevant implementation or documentation. | **Mandatory** |
| T-02 | The change is reviewed for correctness, maintainability, regressions, and relevant architecture invariants. | Peer/reviewer inspection or an equivalent documented review appropriate to the change; check applicable `AE-*` rules and resolved decisions. | Review record, identified comments/resolutions, and any required ADR/decision link. | **Mandatory** |
| T-03 | Relevant tests/checks are implemented or updated and executed; pre-existing or introduced failures are investigated. | Run the smallest relevant test set and any required broader checks; use the outcome labels in §2.1. Investigate flakes rather than rerunning until green. | Exact commands/procedures, outcomes, failing-case details and resolutions, or an explicit not-run/blocked record. | **Mandatory**; check types are conditional on change |
| T-04 | Validation and errors are truthful and explicit; the change does not convert an invalid or failed operation into apparent success. | Review negative paths and failure handling; execute relevant invalid-input, unavailable-dependency, and persistence-failure tests where the changed behavior crosses those boundaries. | Test results and review evidence; documented residual behavior if an external boundary is mocked. | **Mandatory** when handling input, state changes, or dependencies; otherwise **Not applicable** with reason |
| T-05 | Documentation, contracts, configuration examples, and operational instructions affected by the change are updated. | Identify changed setup, API, schema, security, privacy, user-facing, and operational behavior and inspect corresponding authoritative docs for consistency. | Links to updated docs or a scope-based explanation for no documentation change. | **Mandatory** when behavior or instructions change; otherwise **Not applicable** |
| T-06 | The change introduces no unauthorized scope, architecture, data, privacy, security, public-claim, or external-dependency change. Material decisions and blockers are surfaced rather than silently assumed. | Compare implementation to approved requirements/decisions; confirm approvals for any governed change and check that unresolved decisions are recorded. | Scope/review record, approved decision/ADR where needed, or named blocker and owner. | **Mandatory** |
| T-07 | Test data and artifacts are safe for their environment and do not expose credentials, real enquiries, private records, or unapproved identifiable student media. | Inspect fixtures and generated artifacts; verify synthetic data is used unless explicit safeguards and authorization apply. | Data-source statement and sanitized artifact/secret-scan evidence when available. | **Mandatory** for changes producing or handling test data/artifacts; otherwise **Not applicable** |
| T-08 | The task is independently reviewable and its disposition is explicit; incomplete work is not marked Done. | Confirm acceptance checklist and evidence are attached to the task; identify remaining work as open, blocked, or a separately tracked follow-up. | Updated task status and links to evidence/follow-up items. | **Mandatory** |

### Task-level test selection

Tests are selected by changed behavior, not by a fixed checklist imposed on every task. For example, a documentation-only correction does not require an application test run; a protected endpoint change normally requires relevant unit/integration/authorization tests; a schema change requires migration and data-integrity verification; and a visible UI change requires relevant state, responsive, and accessibility verification. Record the checks not run and why.

## 4. Feature completion

Apply these criteria to a complete feature or vertical slice, in addition to §3. Every applicable mandatory criterion must be met before describing the feature as complete.

| ID | Criterion and condition | Verification | Evidence | Applicability |
|---|---|---|---|---|
| F-01 | The end-to-end user or system outcome works for the approved feature scope, including the intended persisted result where applicable. | Exercise the critical success journey across the actual implemented boundaries; confirm the authoritative state/result, not just a UI message. | Integration/E2E result or documented manual test with environment, data type, and observed outcome. | **Mandatory** |
| F-02 | API, data, and state-transition behavior satisfies the approved contract and schema; response fields and public/private projections are appropriate. | Contract/integration tests; migration/schema checks for data changes; verify success only follows confirmed persistence and failures map to safe outcomes. | Contract/test reports, schema/migration result, and approved contract reference. | **Mandatory** when the feature uses APIs or persistent data; otherwise **Not applicable** |
| F-03 | Authentication and authorization are enforced at the server/trusted boundary for every protected operation; public users cannot access private, draft, unpublished, or unapproved data. | Test anonymous, authenticated, inactive/unauthorized, and relevant object-level access cases directly against the service/API; verify publication boundaries and cache behavior where relevant. | Authorization matrix results, direct-request tests, sanitized response/cache evidence, and permission-policy approval. | **Mandatory** for protected data/actions or publication-state changes; otherwise **Not applicable** |
| F-04 | Relevant failure and negative paths are handled without data loss, leakage, or misleading success. | Test invalid input, validation boundaries, unavailable dependencies, duplicate/retry behavior, partial failure, and recovery paths that apply to the feature. | Negative/integration test outcomes and any documented retry/idempotency or residual limitation. | **Mandatory** for each applicable failure mode |
| F-05 | User-facing screens provide the applicable loading, empty, validation, error, success, and destructive-action states and remain usable at supported layouts. | Component/E2E review of relevant states, responsive checks, keyboard interaction, semantic structure, and visible focus; omit only states that cannot occur for the feature and document why. | State/viewport test results, screenshots or traces where useful, and accessibility review evidence. | **Mandatory** for UI features; otherwise **Not applicable** |
| F-06 | Privacy, retention, logging, caching, media approval/takedown, and external data transfers follow approved policies for the data handled. | Review data flows and logs; test redaction, access, cache isolation, deletion/takedown, or retention behavior where applicable. Verify approvals for sensitive media and external processors. | Data-flow/privacy review, relevant test results, approval evidence, and documented exceptions/limitations. | **Mandatory** when the feature handles personal data, media, logs, caches, or external services; otherwise **Not applicable** |
| F-07 | Relevant regression coverage passes and no unresolved failure is concealed by retries, disabled assertions, or undocumented quarantine. | Run focused regressions plus critical related journeys; investigate failures under the testing strategy. | Exact suite results and disposition for every failure, flake, quarantine, or blocked test. | **Mandatory** |
| F-08 | AI behavior meets approved evaluation criteria and security/privacy boundaries. | If runtime AI is approved, run its specified deterministic and adversarial evaluations against approved synthetic data, with model/version and thresholds recorded. | Approved evaluation specification, model/config version, evaluation report, failures, and human-approval evidence where required. | **Conditional**; not applicable to the current MVP, which excludes runtime AI and has no evaluation specification |

For a public admissions enquiry feature, for example, feature completion includes server-side validation, authorization for staff-only enquiry access, confirmed persistence before visitor success, safe handling of unavailable storage, and tests proving anonymous visitors cannot retrieve enquiry records. Do not treat a form rendering or mock-only demo as a complete feature.

## 5. Release readiness

Release readiness is a go/no-go decision for a specific artifact and target environment. The release owner records the decision only after reviewing all applicable criteria. A test/build for a different commit, configuration, or environment does not automatically qualify the candidate.

| ID | Criterion and condition | Verification | Evidence | Applicability |
|---|---|---|---|---|
| R-01 | All mandatory PRD launch acceptance criteria and approved feature scope are satisfied; known limitations and unresolved blockers are reviewed. | Trace release criteria to acceptance evidence; review open defects, requirements, and implementation-plan exit gates. | Release checklist/traceability, issue list with severity/disposition, and named release decision. | **Mandatory** |
| R-02 | Required automated checks pass on the release candidate, including relevant unit, component, integration/contract, migration, E2E, build, static, secret, and dependency checks. | Review CI for the exact release commit and configuration; verify each required job and artifact. The exact gates must be defined once stack and CI are approved. | CI run/build identifier, job results, reports, and explicit status for not-run/blocked checks. | **Mandatory** for checks defined as release gates; unavailable/undefined checks must be recorded and cannot be claimed as passed |
| R-03 | Required manual checks pass, including relevant accessibility/keyboard review, approved public content/media review, and critical workflow smoke tests. | Perform the checks on the candidate in the target-like environment; verify school facts, contact details, public copy, and image approvals with authorized owners. | Dated review checklist, route/state results, accessibility findings, and content/media approvals. | **Mandatory** when applicable to the release; school content approval is mandatory before public launch |
| R-04 | No unresolved critical/high security or privacy blocker, data-loss risk, or unapproved identifiable student-media publication remains. | Review security test/review findings, dependency advisories, access matrix, data flows, media approvals, and remediation/exception register. | Security/privacy review report, finding disposition, media approval evidence, and owner sign-off. | **Mandatory** for production; material release-specific risk must be reviewed for all releases |
| R-05 | Configuration is documented and environment-specific; secrets are stored in approved protected configuration and are not committed, logged, or exposed to clients. Required values fail explicitly when absent. | Inspect configuration and deployment settings; run secret/client-bundle scans; verify least privilege and required-config behavior. | Configuration/runbook, scan results, access review, and sanitized preflight output. | **Mandatory** for deployable releases; no secret values in evidence |
| R-06 | Database migrations are ordered, repeatable, compatible with the deployment sequence, and preserve integrity; rollback limitations and forward-recovery path are understood. | Apply migrations from a clean disposable baseline and rehearse upgrade against representative synthetic data; test rollback or documented forward recovery; review backup and compatibility plan before production. | Migration output, schema/data-integrity assertions, rehearsal record, and approved sequence/rollback notes. | **Conditional** on database/schema changes; production release requires an applicable migration and recovery plan |
| R-07 | Deployment, smoke testing, recovery, and rollback/forward-fix procedures are documented and operationally viable for the chosen hosting/runtime. | Rehearse in staging or an isolated equivalent; verify health, HTTPS/domain as applicable, critical public and admin flows, rollback/recovery, and named operator access. | Versioned deployment/runbook, staging exercise results, recovery evidence, and operator acknowledgment. | **Mandatory** before production; a non-production release records relevant deployment limitations |
| R-08 | Monitoring and alerting are sufficient for the approved service and data risk, with named owners and escalation/incident procedures. | Verify operational signals and alerts for relevant failures, privacy/security events, availability, backup status, and resource exhaustion; trigger a safe test alert. | Monitoring/alert configuration review, test alert record, owner/on-call and incident contacts. | **Mandatory** before production; specific metrics/tools depend on approved architecture and operational needs |
| R-09 | Backup/restore and recovery objectives are approved and demonstrated where persistent production data is at risk. | Verify backup protection/retention and restore a backup in an isolated environment; record achieved recovery time/data point and limitations against approved objectives. Never test destructive recovery against production. | Restore log, integrity checks, measured recovery results, and approved RTO/RPO or documented owner decision. | **Mandatory** before production when persistent data exists; otherwise **Not applicable** with rationale |
| R-10 | Performance, reliability, and capacity evidence is appropriate to agreed workload and targets; no unsupported performance or availability claims are made. | Run approved staging/lab tests with representative synthetic workload; assess failure/recovery behavior and report sample size and environment. | Test conditions, tool/version, measurements, thresholds, result, and limitations. | **Conditional** on approved targets/workload and required by PRD before production claims; do not invent thresholds |
| R-11 | Required owner approvals are obtained for content, privacy, identity/access, security, operations, data/provider location, and launch, as applicable. | Confirm decisions with authorized owners and verify that approvals cover the artifact, environment, and outstanding risks. | Dated approval record with approver role, scope, decision, and any conditions. | **Mandatory** for each applicable governance gate; launch approval is mandatory for production |
| R-12 | Release artifacts and verification evidence are retained and shared with least privilege; no sensitive data is included unnecessarily. | Inspect artifact access/retention and sanitized reports; ensure release/version and evidence references are reproducible. | Release record, artifact locations/access policy, and retention disposition. | **Mandatory** |

### Release decision

- **Go:** every applicable mandatory criterion is Met; no unresolved release blocker remains; conditional criteria are either met or documented Not applicable with rationale; the authorized release owner and required school owners approve.
- **No-go:** any mandatory criterion is Not met, or a material criterion is Not run/Blocked without an approved disposition and safe release decision. Security, privacy, child-protection, and data-integrity requirements cannot be waived by relabeling them non-blocking.
- **Exception:** record the precise criterion, evidence, impact, compensating control, owner, expiry/review date, and approval authority. An exception cannot override law, school policy, mandatory security/privacy controls, or required school approval. If there is no authorized exception path, the criterion remains a blocker.

## 6. Traceability to governing requirements

This document operationalizes, but does not replace, project acceptance requirements:

- **PRD §14–15 and §21:** feature/project completion, quality, and coding-agent reporting.
- **PRD goals G1–G6; FR-01–FR-10; NFR-01–NFR-08:** determine feature-specific acceptance and test selection.
- **Architecture Essentials AE-01–AE-18:** apply relevant boundaries and invariants; verify rather than assume enforcement.
- **Security Specification SEC-01–SEC-21:** apply controls based on feature and release exposure; it remains a proposed baseline until approved.
- **Testing Strategy §§7–10:** requirement-to-verification mapping, CI gate semantics, flake handling, and evidence expectations.
- **Implementation Plan IP-11/IP-12:** hardening, release evidence, deployment smoke testing, recovery, approval, and handover.
- **AI evaluation:** no current runtime AI or evaluation specification is in scope. Reassess this criterion only after explicit approval of AI scope and an evaluation strategy.

No commands are prescribed here because the repository has no product manifest, test runner, CI, or release configuration. Once approved, maintainers must put exact reproducible commands in the repository's scripts and testing/release documentation, then update this checklist if the actual gates materially differ.
