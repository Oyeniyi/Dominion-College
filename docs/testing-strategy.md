# Dominion College Website — Testing Strategy

**Status:** Proposed strategy; no application code or test tooling is implemented  
**Scope:** MVP public website, protected administration, enquiry handling, content/media flows, and deployment quality gates  
**Authority:** Product requirements and launch acceptance criteria are in [`../prd.md`](../prd.md). Target boundaries and data flows are in [`architecture.md`](./architecture.md) and its mandatory invariants in [`architecture-essential.md`](./architecture-essential.md). The candidate schema is [`database-schema.md`](./database-schema.md); proposed API behavior is in [`api-specification.md`](./api-specification.md); security requirements are in [`security-specification.md`](./security-specification.md). These specifications contain unresolved decisions; this strategy does not approve an implementation stack, API, database provider, identity provider, or vendor.

> **Repository evidence boundary:** At review, the workspace had no product source, dependency manifest, test runner configuration, application tests, CI workflow, database, migrations, deployed environment, or accepted ADRs. Test files under `.agents/skills/` test agent tooling, not the Dominion College website, and are not evidence of product test coverage. No runtime AI is in MVP and no AI evaluation specification was found. All tools and automation below are recommendations pending approval and implementation.

## 1. Quality objectives and test principles

Testing must produce evidence that the implementation satisfies approved requirements and architecture/security invariants—not merely that pages render or a build completes.

1. **Test from the trust boundary inward.** Client validation supports usability; server validation and authorization are authoritative.
2. **Protect private data and publication state.** Anonymous and unauthorized callers must not retrieve enquiries, drafts, unpublished media, or private metadata, including through guessed IDs/URLs or cache behavior.
3. **Prove persistence before success.** A visitor receives enquiry confirmation only after the authoritative write succeeds. Dependency failure or uncertain outcomes must not produce success-shaped fallbacks.
4. **Prefer deterministic, isolated tests.** Use synthetic fixtures, controlled clocks/IDs, seeded disposable services, and explicit cleanup. Avoid relying on live identity, storage, WhatsApp, network access, or mutable shared environments for routine CI.
5. **Test behavior through public contracts.** Validate safe response shapes, status codes, authorization, accessibility, and user-visible outcomes; avoid over-coupling tests to internal implementation details.
6. **Keep tests privacy-safe.** Never use real parent/guardian enquiries, identifiable student photos, production logs, credentials, or copied production database snapshots unless specifically authorized with approved safeguards.
7. **Fail visibly.** A test failure is not a reason to weaken validation/security or convert errors to empty/success responses. Capture enough non-sensitive diagnostics to reproduce and investigate.
8. **Separate proposal from evidence.** A planned test, tool recommendation, or passing local test is not CI coverage, a security certification, accessibility conformance, or production performance evidence.

### Test model

```text
Fast feedback (many, isolated)
  Unit → Component/UI behavior
  ↓
Confidence at boundaries
  Integration → API contract → Database/migrations
  ↓
Critical user outcomes
  End-to-end → Accessibility → Security
  ↓
Operational suitability
  Performance → Reliability/recovery → Release evidence
```

Use the smallest level that proves a behavior, then add boundary coverage where defects would cross components, expose data, or affect persistence. Do not prescribe a numerical coverage percentage before a baseline and meaningful coverage policy are approved.

## 2. Current state and tool selection

### Existing

- Product application source and application-specific tests: **none found**.
- Dependency manifests, test runner/configuration, migrations, database, CI workflow, and deployment environment: **none found**.
- The `.agents/skills/` tree includes tests for those agent utilities only; these do not verify product behavior.
- `architecture.md` and `architecture-essential.md` identify automated checks as candidates and state they are not implemented.

### Candidate tools (not approved or installed)

The project has no accepted stack. Once a stack ADR is approved, select maintained versions that work together and record them in the project manifest/lockfile and CI image.

| Need | Candidate, subject to stack decision |
|---|---|
| TypeScript unit/integration runner | Vitest or Jest; choose one after framework/runtime selection. |
| UI component behavior | Testing Library with the selected framework's supported test environment. |
| Browser end-to-end | Playwright or an equivalent maintained browser automation tool; pin browser/runtime versions in CI. |
| Accessibility automation | axe-core integration suitable for the selected component/browser test runner; manual keyboard and assistive-technology testing remains required. |
| API contract | Approved OpenAPI document plus a compatible schema/contract validator. The API spec recommends OpenAPI only after contract decisions; no machine-readable contract currently exists. |
| Database/migration verification | The selected PostgreSQL-compatible disposable service and migration runner if ADR-002 is accepted; otherwise an equivalent service faithful to the selected database. |
| Static/security/dependency checks | Framework-supported lint/type checks, secret scanning, dependency advisory scanning, and targeted static analysis. Select tools and thresholds with the stack and operational owner. |
| Performance/reliability | Browser performance tooling, load/fault tools, and provider-native backup/restore facilities chosen after hosting/runtime selection. Use synthetic data and controlled environments. |

Do not install or add dependencies solely to fulfill this proposal. Avoid multiple overlapping test frameworks unless a concrete coverage gap justifies them.

## 3. Testing levels

Each level below states its purpose, scope, candidate tools, dependencies/data, execution/evidence, and failure handling. Candidate frameworks are options, not implementation decisions.

### 3.1 Unit tests — applicable; proposed

- **Purpose/scope:** verify domain and application rules in isolation: enquiry validation/normalization, approved entry-level allowlist, article slug/state transitions, publication eligibility, permission policy decisions, settings validation, safe URL construction, error mapping, and pagination parsing.
- **Tools:** the selected language's unit runner (for TypeScript, Vitest or Jest); pure functions wherever practical.
- **Dependencies/data:** no network/database; synthetic values, fixed clock, deterministic IDs, and explicit fakes for repository/identity/storage interfaces.
- **Execution/evidence:** every change to a rule adds focused positive, boundary, and negative cases; run in local fast suite and CI. Evidence is the exact command, pass/fail summary, and changed test names or report.
- **Failure handling:** fail at the rule under test; do not mock away the behavior under test or assert only implementation call counts when observable results are available.

### 3.2 Component/UI behavior tests — applicable; proposed

- **Purpose/scope:** verify semantic controls, visible state changes, labels, validation feedback, disabled/loading behavior, menu/dialog focus behavior, and responsive state logic without a full backend.
- **Tools:** framework component runner and Testing Library; axe-core where integration is stable.
- **Dependencies/data:** isolated component environment; synthetic content and API responses. No production-like PII.
- **Execution/evidence:** exercise controls by role/name and user actions, not component internals; assert accessible names/states and visible feedback. Run on changed UI plus shared components.
- **Failure handling:** report missing roles/names/state or unexpected focus; correct implementation rather than suppressing accessibility checks. Keep component tests deterministic and avoid arbitrary sleeps.

### 3.3 Integration tests — applicable; proposed

- **Purpose/scope:** verify application services together with adapters, authorization, validation, transaction/error mapping, publication filtering, media workflow, and error behavior at meaningful component boundaries.
- **Tools:** selected unit runner plus explicit database/storage/identity adapters; in-process HTTP handler tests where relevant.
- **Dependencies/data:** disposable database or test adapter, isolated private test bucket/fake media service, deterministic identity/authorization fixtures, and synthetic records. Use a fake for external systems unless provider-specific behavior is the test subject.
- **Execution/evidence:** test successful enquiry persistence, rollback on failure, public/admin projection separation, denied direct operations, safe error responses, and media remaining private after partial failure. Seed and clean per test or per isolated run.
- **Failure handling:** fail when boundary behavior differs from contract. A mock may simulate a provider outage, but a separate realistic provider test is required before production for selected provider semantics.

### 3.4 API contract tests — applicable when API is approved; proposed

- **Purpose/scope:** ensure route/method, request/response shapes, status codes, stable error codes, cache controls, pagination, and authorization match the approved server contract.
- **Tools:** OpenAPI/schema validator and API-level tests. The API proposal recommends creating OpenAPI after resolving routes, limits, auth, transitions, and upload semantics.
- **Dependencies/data:** local application server and synthetic requests; no public network or production records.
- **Execution/evidence:** positive and negative contract tests for every implemented operation; reject undocumented fields and ensure response projections do not serialize database-only fields. Cover proposed `400/401/403/404/409/413/415/422/429/500/503` outcomes as the finalized contract requires.
- **Failure handling:** treat contract drift as a blocking defect; update the API specification and generated schema only through an approved contract change, not by weakening the test silently.

### 3.5 Database tests — applicable if a database is selected; proposed

- **Purpose/scope:** verify persistence mappings, constraints, transactions, indexes/queries where material, private/public query filters, and isolation from cross-test state.
- **Tools:** selected database engine in disposable CI service/container; selected migration and query tooling. PostgreSQL is only proposed by ADR-002.
- **Dependencies/data:** isolated test database created from migrations, not a local developer database or production copy; synthetic user/content/enquiry/media metadata. No real PII or secrets.
- **Execution/evidence:** apply all migrations to a clean database; exercise representative read/write and constraint failures; verify enquiry commits before acknowledgement and failed transactions leave no partial state; destroy the isolated database after the run.
- **Failure handling:** migration or data integrity failure blocks the change. Do not skip unavailable database checks while claiming database tests passed; label them not run and explain why.

### 3.6 End-to-end tests — applicable for critical journeys; proposed

- **Purpose/scope:** verify public and admin flows in a real browser against an integrated non-production application: admissions form, admin authentication, content publish/unpublish, gallery visibility, enquiry review/status update, logout/session expiry, and 404/recovery behavior.
- **Tools:** Playwright or another selected browser runner; supported browser set to be approved.
- **Dependencies/data:** deterministic local/staging-like application with seeded synthetic data; disposable database and private media store; dedicated test identity accounts. Do not run destructive tests against production.
- **Execution/evidence:** cover the highest-risk journeys and acceptance criteria; assert both user-visible result and backend state where feasible. Test mobile and desktop viewport bands, direct URL/API attempts, and private cache/access behavior.
- **Failure handling:** preserve trace, screenshot, browser console, and sanitized server logs for failed CI runs; scrub tokens, enquiry data, and private URLs. Retry once only to diagnose suspected flakiness; a retry pass does not erase the first failure.

### 3.7 UI and responsive verification — applicable; proposed

- **Purpose/scope:** verify layout, navigation, text reflow, touch/keyboard reachability, image behavior, and absence of accidental horizontal overflow.
- **Tools:** browser automation screenshots/viewport assertions plus manual browser review; visual-diff tooling only if baselines can be governed and deterministically produced.
- **Dependencies/data:** stable approved visual assets or neutral synthetic fixtures; supported browser/device matrix chosen after stack selection.
- **Execution/evidence:** test at PRD representative widths **360, 390, 768, 1024, and 1440 CSS px**, plus relevant intermediate widths and zoom/reflow. Check navigation, forms, images, typography, spacing, tables, dialogs, and error states. Screenshots are evidence, not a substitute for functional/accessibility checks.
- **Failure handling:** investigate layout regression at the smallest failing viewport; do not hide overflow by clipping important content or disable zoom. Record browser/viewport and before/after evidence for visual defects.

### 3.8 Accessibility tests — applicable; proposed

- **Purpose/scope:** assess WCAG 2.2 AA target requirements: semantic structure, keyboard operation, visible/unobscured focus, labels/errors, contrast, status announcements, reduced motion, dialogs/lightboxes, and alternative text.
- **Tools:** axe-core or equivalent automated checks; manual keyboard review; selected screen reader/browser combinations documented at implementation. Automated checks cannot certify conformance.
- **Dependencies/data:** rendered application and synthetic content; actual approved brand colors and real layout required for contrast and visual review.
- **Execution/evidence:** run automated checks on representative screens and states in CI where stable; manually traverse every critical public/admin journey, including validation, empty/error, menu, dialog/lightbox, and session expiry. Record tool/version, route/state, browser/AT, result, and approved exception.
- **Failure handling:** treat critical/serious findings and blocked keyboard journeys as release blockers pending correction or formally approved exception. Re-test affected flows manually after fixes. Never claim WCAG conformance based only on automated scans.

### 3.9 Security and privacy tests — applicable; release-critical; proposed

- **Purpose/scope:** verify SEC requirements and architecture boundaries: authentication/session, action/object authorization, CSRF where cookie auth applies, input validation/injection resistance, XSS-safe rich text, upload safety, privacy projections, cache isolation, secret handling, rate controls, safe errors/logging, and dependency hygiene.
- **Tools:** targeted unit/integration/E2E negative tests; dependency/advisory and secret scanners; static analysis; independent security review before launch. OWASP ASVS is a candidate checklist; no level is approved or certification claimed.
- **Dependencies/data:** synthetic accounts/enquiries and non-identifying images; isolated test environment; no production credentials/data. Attack tests must be authorized and non-destructive.
- **Execution/evidence:** test anonymous/inactive/wrong-role/guessed-ID requests; direct backend operations bypassing UI; draft/unpublished/private media access; response allowlists and `no-store`; malformed/oversized input; unsafe HTML/URL schemes; CSRF for cookie-authenticated mutations; rate limit outcomes; log redaction; secrets absent from browser bundles and repository; no unauthorized external data transfer.
- **Failure handling:** any confirmed private-data leak, authorization bypass, secret exposure, unsafe publication path, or critical/high security issue blocks release. Do not “fix” findings by weakening access controls or deleting regression tests. Record unresolved risk and owner decision.

### 3.10 Performance tests — applicable; targets partly specified; proposed

- **Purpose/scope:** measure public rendering, image delivery, navigation responsiveness, database query/list behavior, and Core Web Vitals under realistic but approved load.
- **Tools:** browser performance tooling and a selected load generator; production-like monitoring only after privacy/provider approval.
- **Dependencies/data:** staging-like hosting and synthetic data volume based on approved traffic/media assumptions; no personal records.
- **Execution/evidence:** measure LCP, INP, CLS using the PRD's recommended good thresholds (**LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at p75 when sufficient real-user data exists**); before that, report lab measurements with browser/device/network and sample count. Test bounded/paginated lists and representative optimized images. Agree workload/concurrency targets before load claims.
- **Failure handling:** distinguish regression from environment noise; capture trace, build, workload, and environment. Do not claim a p75 field metric from a small synthetic run or extrapolate beyond measured load.

### 3.11 Reliability and recovery tests — applicable before production; proposed

- **Purpose/scope:** prove graceful behavior for database, identity, and storage outage/timeout; uncertain write outcomes; partial media workflows; cache freshness; backup restoration; and rollback/forward recovery.
- **Tools:** injected adapter failures in integration tests; approved staging fault exercises; selected provider backup/restore and deployment rollback procedures.
- **Dependencies/data:** isolated staging/test environment with synthetic records/files; approved recovery owner and objectives (RTO/RPO currently unresolved).
- **Execution/evidence:** verify failure does not produce false success, unauthorized fallback, public partial media, or private cache leakage; restore a backup and validate representative records/media consistency; exercise deployment rollback using approved procedure.
- **Failure handling:** stop the exercise if it risks production data or external users. Record actual restore duration, integrity checks, RTO/RPO target and measured outcome; failed restore or missing owner blocks production readiness.

### 3.12 Migration tests — applicable once migrations exist; proposed

- **Purpose/scope:** validate clean install, sequential upgrade, constraints, data-preserving changes, compatibility/rollback or forward-fix behavior, and schema drift.
- **Tools:** selected database migration tool and disposable database; schema comparison if supported by chosen tool.
- **Dependencies/data:** blank database plus synthetic prior-version fixtures; never test experimental migration paths on production data.
- **Execution/evidence:** apply every migration from empty state in CI; test supported upgrade path from the previous release schema; validate constraints/data and application compatibility. Destructive or irreversible migration requires explicit review, backup/restore plan, and approval.
- **Failure handling:** block release on failed/repeatable migration, unexpected data loss, or undocumented manual SQL. Do not run destructive migrations against any shared/production database as a test.

### 3.13 AI behavior/evaluation tests — not applicable to MVP runtime

- **Current scope:** PRD excludes AI chatbots/automated admissions agents; architecture/security documents state no runtime model, embedding, retrieval, or AI-driven admissions decision. No AI evaluation specification or runtime AI integration was found. Therefore there is no product AI behavior suite to implement or claim.
- **Development-tool boundary:** do not submit real enquiries, identifiable student photographs, production logs, credentials, or private school records to AI tools without explicit school/platform approval. Use synthetic or public/non-sensitive inputs.
- **Future gate:** any proposed runtime AI is a scope and architecture change requiring school approval, privacy/security review, a separate evaluation specification, and documented provider/model/version/data flows. Only then define deterministic and model-based evaluations, safety/privacy test sets, injection/unauthorized tool tests, human review gates, regression thresholds, latency/cost limits, and documented residual risk. Do not introduce AI tests or dependencies merely because this section exists.

## 4. Integration boundaries, fakes, and real-system tests

| Boundary | Routine test approach | Realistic verification required before production |
|---|---|---|
| Identity/session | Fake verified identities for unit/integration policy tests; local test identity adapter for end-to-end authorization cases. Never fake the authorization decision under test. | Verify selected provider's real callback/session/logout, account disablement/revocation, expiry, CSRF/cookie settings, recovery, and failure modes in a non-production tenant. Do not test with personal staff accounts. |
| Database | Use the selected engine in disposable integration/migration CI; repository fakes only for pure service unit tests. | Verify provider connection, transaction, backup/restore, access roles, and operational limits in approved staging. |
| Object storage/image processing | Fake storage for deterministic service failure/timeout tests; use controlled synthetic images. | Verify selected provider's private staging/public delivery, access policy, size/type behavior, deletion/cache propagation, and recovery in staging. Provider capabilities are not yet selected. |
| API | In-process handlers/contract tests for normal CI; no external API calls. | Verify deployed HTTPS, safe headers, routing, rate controls, and monitoring in staging after contract approval. |
| WhatsApp | Unit-test URL construction/encoding using a test number and approved sample message; UI tests assert link exists only when valid configuration is supplied. | Manually verify external click-to-chat behavior using an approved non-personal test number and current official URL format. Do not automate message send or claim delivery/read status. |
| Optional email, analytics, maps, SMS, marketing | Not applicable; use no integration and no mocks that imply an approved product feature. | Requires an approved data flow, provider, privacy/security review, and explicit contract before integration testing. |

Fakes should model documented behavior and failure categories, not silently return success for missing dependencies. For non-idempotent mutations, do not add generic retry middleware; test retry behavior only after idempotency/duplicate handling is explicitly defined.

## 5. Test data, privacy, and environments

### Data classes and handling

- **Synthetic:** generated names, phones, emails, messages, IDs, articles, and image fixtures that cannot be mistaken for real records. Preferred for unit, component, integration, API, E2E, performance, and security tests.
- **Public approved:** published content/assets explicitly approved for test reuse. Keep use within its approved scope; public visibility does not automatically authorize third-party AI/tool transfer.
- **Sensitive/production:** real parent/guardian enquiries, identifiable student images, credentials, security logs, exports, or backups. Prohibited in routine local/CI tests and AI tool prompts. Use only with explicit authorization, approved purpose, least privilege, secure isolation, retention/deletion controls, and documented access; prefer synthetic alternatives.

### Data lifecycle

1. Fixtures are deterministic where possible; use fixed clocks/IDs or seeded generators.
2. Each run gets an isolated database/schema/bucket/namespace and test account. Avoid parallel tests sharing mutable records.
3. Seed only fields necessary for the behavior under test. Use obviously synthetic labels only in non-public fixtures and ensure they cannot reach production rendering.
4. Never log fixture payloads containing PII-like data; use safe IDs/error classes. Add sentinel strings in dedicated tests to verify redaction.
5. Clean up after each test or destroy the entire isolated environment. If cleanup fails, fail the run and record what isolated resource remains for safe cleanup.
6. Staging data is synthetic or approved public data; never copy production enquiry/student data into development or CI by default.
7. Test backups/restores with synthetic records/media. Treat backup copies as sensitive and restrict access as production-level data.

### Environment separation

Maintain separate local, test/CI, staging, and production configuration and data. Secrets must be injected through a protected test/CI secret facility, never committed to fixtures, logs, screenshots, artifacts, or `.env.example`. Production secrets/accounts must not be used by routine automated tests. Block release tests from accidentally targeting production endpoints or databases.

## 6. Negative, abuse, and security scenarios

The following are minimum candidate regression scenarios. Exact payload limits, rate thresholds, role names, status transitions, and retention behavior must use approved values rather than invented test constants.

### Public and enquiry flow

- Missing, malformed, oversized, unexpected, or invalid fields are rejected server-side; client-only validation bypass does not persist invalid data.
- Invalid phone/email and unapproved entry-level values fail with field-level errors that disclose no internal details.
- Attempted duplicate/retry behavior matches the approved policy; unknown write outcome never yields a false success.
- Abuse/rate-limited requests return safe `429` behavior; forwarded client-IP headers are not trusted unless the selected proxy contract validates them.
- Public responses, URLs, analytics/log output, and error payloads do not contain enquiry records, phone/email/message, or private identifiers.
- Database failure/timeout returns no confirmation unless commit is known; committed enquiry remains successful if an optional future notification fails.

### Authentication, authorization, and sessions

- Anonymous, invalid, expired, revoked, inactive, and wrong-permission identities cannot access protected routes/data.
- Direct request/guessed ID/object operations are tested independently of hidden UI controls.
- Access is denied when identity/policy dependency is unavailable; no default-admin or fail-open behavior.
- Cookie flags, expiry, logout invalidation, session rotation, CSRF and origin protections are tested when cookie-based auth is selected.
- Error responses do not disclose whether an account or concealed private record exists.

### Content, media, and API

- Draft/unpublished news and private/unapproved images are inaccessible by public listing, slug/ID, alternate route, guessed object key, direct API request, sitemap, and shared cache.
- Publication rejects ineligible/unauthorized media; approval evidence is verified according to the future school-approved workflow.
- Rich text and reflected values cannot execute script; URL fields reject unsafe schemes.
- Upload rejects unsupported, spoofed, malformed, oversized, or otherwise prohibited files according to approved rules. Partial database/storage failure leaves no public object/reference.
- Unknown methods, invalid cursors/filters, unsupported media types, conflicting slugs/transitions, and missing resources map to safe documented outcomes.
- Private responses have `no-store`; public cache invalidation/unpublish behavior meets an approved measurable freshness target.

### Operations and privacy

- Logs and telemetry exclude passwords, tokens, credentials, full enquiries/contact data, private media URLs, and student-identifying metadata.
- Secret scans detect seeded test secrets without embedding real credentials.
- Failure injection verifies explicit errors; no catch-all empty success, swallowed exception, raw stack trace, or blind mutation retry.
- Optional external APIs are absent unless approved and allowlisted.

## 7. Requirement-to-verification mapping

| Requirement / invariant | Primary verification | Supporting evidence |
|---|---|---|
| G1; FR-04, FR-05 — admissions contact and enquiry | E2E enquiry and WhatsApp-link tests; unit/server validation; database persistence assertion | Mobile viewport results; confirmed save/error states; WhatsApp remains visitor-initiated |
| G2–G3; FR-01–FR-03, FR-08 — credible, accessible approved school information | Content review; component/UI tests; responsive and accessibility checks | School approval record, copy/asset checklist, route/state evidence |
| G4; FR-06–FR-09 — content administration and dashboard | Integration/API/E2E tests for CRUD, publication, status updates, actual counts, and server-side authorization | Synthetic database state, role matrix coverage, publish/unpublish evidence |
| G5; FR-10; NFR-08 — discoverability | Metadata/sitemap/robots assertions; public page rendering; private exclusion tests | Crawl/indexing review and checks that admin, drafts, enquiries are absent |
| G6; NFR-07 — maintainability | Unit suite, type/lint/build checks, dependency direction/cycle check if configured | Reproducible CI command logs, migration/run instructions |
| NFR-01 — performance | Lab/browser and approved staging load tests; image/query checks | Environment, workload, sample count, LCP/INP/CLS measurements; p75 only with adequate real-user sample |
| NFR-02 — responsiveness | Browser/device viewport tests at PRD widths and manual review | Viewport/browser matrix, screenshots, overflow findings |
| NFR-03 — accessibility | Automated scan plus manual keyboard/AT evaluation | Tool/version and route/state report; documented exceptions |
| NFR-04; SEC-01–SEC-10 — security | Negative auth/authz, input, session/CSRF, upload, error, rate, secret and dependency tests; independent review | Security test report; no critical/high unresolved findings for launch |
| NFR-05; SEC-05/08/10/16/19 — privacy and child protection | Data projection, log redaction, media approval/takedown, retention and AI-boundary review | Synthetic test data inventory, approval evidence, school policy decisions |
| NFR-06; AE-08–AE-10 — reliability | Fault injection, transaction/partial failure tests, backup restore and rollback exercises | Restore integrity and duration, failure outcomes, runbook/operator evidence |
| AE-01/02/12/18 — architecture boundaries | Static dependency/cycle rules if configured; unit/integration tests of shared domain logic; code review | Dependency rule output and boundary review notes |
| AE-03/04/05/14 — publication, authorization, contracts, cache | Public/private direct access matrix, contract assertions, `no-store`, cross-user/cache tests | Route/state matrix and safe response captures |
| AE-06/07/15 — DB, secrets, ownership | Migration tests, secret scan, data-flow/schema review | Migration logs, scan report, approved schema/data ownership |
| AI runtime behavior | Not applicable: runtime AI excluded and no eval spec exists | Record absence; re-open only with approved scope/security/privacy change |

PRD §14–15 and the requirements above govern release acceptance. The proposed project backlog defines TASK-001–TASK-034 in [`tasks.md`](./tasks.md).

## 8. Proposed automation and CI gates

No CI or automated checks currently exist for the product. The following is a staged proposal; add only after stack/hosting decisions and choose exact commands in the repository's scripts.

### Pull request / change gate

1. Formatting/lint and static checks.
2. Type checking or equivalent compile-time validation.
3. Unit tests.
4. Component tests for changed UI and shared controls.
5. Dependency and secret scans; fail on exposed secrets and agreed severity thresholds.
6. Architecture import-direction/cycle checks once module boundaries exist.
7. Build/production compilation.
8. Integration/API contract tests for changed services/routes, with disposable services as needed.
9. Migration application from clean state for schema changes.
10. Accessibility automation for changed/critical screens, with manual checks tracked for changes to keyboard/focus flows.

### Main branch / release candidate gate

- Full deterministic unit, component, integration, API, migration, and critical E2E suites.
- Browser responsive checks for critical public/admin journeys.
- Security regression suite for access control, publication privacy, sessions, uploads, error/log redaction, and cache isolation.
- Dependency/advisory review and production build.
- Deployment smoke test in staging; no production PII.
- Required manual accessibility/keyboard review and content/brand/privacy approvals.
- Before first production launch and material infrastructure changes: independent security review, backup/restore test, rollback test, and provider/data-location approval.
- Performance test against approved workload and targets; no numeric capacity claim until workload is agreed and measured.

### Gate semantics

- A failed required check blocks merge/release unless an authorized owner explicitly accepts a documented, bounded exception that does not weaken mandatory security/privacy controls.
- A skipped, quarantined, or infrastructure-unavailable test is marked **not run**, with cause, scope, owner, and deadline; do not report the suite as passing.
- Non-blocking warnings must still be recorded with severity and disposition. Security/privacy/accessibility release blockers cannot be waived by changing severity in CI.
- Store CI artifacts with least privilege and retention controls. Exclude secrets, production records, raw enquiry payloads, and private media.

## 9. Determinism and flaky-test policy

1. Tests should not depend on wall-clock timing, real external services, random unseeded content, machine locale/timezone, execution order, shared mutable fixtures, or fixed arbitrary sleeps.
2. Inject clocks, IDs, randomness, and service boundaries. Use a fake clock for publication dates, session expiry, and retention logic.
3. Wait for observable UI/network state with bounded timeouts. Avoid sleeps and retries that mask race conditions.
4. Isolate parallel test data and service namespaces; ensure cleanup. If a failure depends on order or concurrency, reproduce with the same seed/order and identify shared state.
5. On first intermittent failure, retain trace/screenshots/sanitized logs, reproduce locally or in isolated CI, compare environment/browser/build, and identify root cause. Do not simply rerun until green.
6. A retry may be used for diagnosis only. Report both the initial failure and retry result; retry-pass is still a flake requiring triage.
7. Quarantine only with a documented owner, issue, expiration date, impact, and substitute coverage. Quarantine cannot cover security/privacy, migration integrity, or critical user-flow tests at release.
8. Review test and dependency upgrades for changed semantics; pin supported versions in lockfiles and CI to reduce environmental drift.

## 10. Evidence required to claim “tested”

Every implementation/change report should state:

- **Scope:** changed behavior and relevant requirements/architecture invariants.
- **Exact checks:** command(s), runner/tool version where available, environment (local/CI/staging), and date/build identifier.
- **Outcome:** pass/fail/not run for each check; include failing test names and sanitized error summary.
- **Coverage level:** unit/component/integration/API/database/E2E/accessibility/security/performance/reliability/migration as actually executed. Never substitute build success for behavioral tests.
- **Data/environment:** synthetic vs approved data; service/browser versions; whether any external provider was used.
- **Evidence:** CI job/report link or artifact, test summary, relevant screenshots/traces, accessibility report, migration/restore output, or performance measurements as applicable. Artifacts must contain no secrets or sensitive records.
- **Limitations:** untested paths, skipped checks, mocked boundaries, environmental constraints, unapproved targets, and unresolved flakiness.
- **Interpretation:** distinguish passing automated checks from manual review, security assessment, WCAG conformance, production monitoring, or deployment validation.

Examples of truthful statements:

- “Unit and integration tests passed against a disposable database; browser E2E and real-provider identity tests were not run.”
- “Automated axe scan found no reported violations on the tested route/state; manual keyboard and screen-reader review remains outstanding.”
- “Lab performance results met the stated metric in this environment; this is not a field p75 result.”
- “Build passed; no application tests exist yet” is not equivalent to “the feature was tested.”

## 11. Release readiness and unresolved decisions

The following decisions block finalizing executable test commands and/or production acceptance:

- Accept the web/runtime stack, database, migration mechanism, identity/session provider, object storage, hosting, and CI/test runner.
- Approve API routes/schemas and error contract, including entry-level values, validation limits, pagination, status transitions, duplicate/idempotency behavior, and media delivery.
- Approve admin account lifecycle and role/action matrix so authorization tests have an authoritative permission oracle.
- Approve privacy notice, enquiry acknowledgement/evidence, retention/deletion, data location, and the use of any non-synthetic test data.
- Define school approval evidence and takedown behavior for identifiable student media.
- Set traffic/media workload, cache freshness, rate limits, backup retention, RTO/RPO, and operational owners for performance/reliability acceptance.
- TASK-001 reconciles stale existence statements in the architecture, API, schema, data architecture, design, plan, and completion documents. The [`security-specification.md`](./security-specification.md) exists as a proposed reference only; per the Principal's decision, it is not the governing security baseline pending formal approval. PRD and AGENTS.md security/privacy requirements remain governing.
- Add an approved AI evaluation strategy only if runtime AI is proposed; current MVP has no AI runtime and must not send sensitive data to AI services.

Until these decisions are approved, this document is a test-design proposal, not evidence that tests exist, that any security control is implemented, or that the system is ready for production.
