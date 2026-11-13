# Technical Research and Decision Record

**Research date:** 2026-10-27 (Owner decisions approved 2026-11-10)  
**Status:** Accepted for MVP local/staging execution (production cloud provider selection remains gated on production deployment).  
**Scope:** Technical decisions for the Dominion College website MVP described in [`../prd.md`](../prd.md), informed by [`specification-audit.md`](./specification-audit.md) and [`../AGENTS.md`](../AGENTS.md).

## Executive Summary

At the time of initial inspection for this research, the workspace contained only the draft PRD, agent instructions, and specification audit. There was no application source, dependency manifest, existing architecture, asset set, test suite, deployment configuration, or hosting constraint. Consequently, no existing runtime compatibility or application security posture could be verified.

The PRD already describes a reasonable *candidate* architecture: TypeScript, Next.js/React, PostgreSQL, server-side privileged operations, managed authentication and object storage, and a managed hosting platform. Official documentation reviewed for this record supports investigating that direction, but does not establish that it fits school budget, data-location requirements, account ownership, operational capacity, or approved privacy policy. The technical ADRs below are therefore **Proposed**, not Accepted.

**Provisional recommendation for approval:** begin architecture design around one TypeScript/Next.js application with server-side data access to a managed PostgreSQL service and object storage. Use a maintained authentication library/provider rather than implementing authentication primitives. Keep vendor selection, authorization model, ORM, and deployment contingent on the human decisions listed at the end.

No product features, code, dependencies, or providers were implemented or provisioned.

## Inputs and Research Method

- Read the draft PRD, including recommended architecture, security/privacy, testing, launch acceptance criteria, deployment phases, and open assumptions.
- Read `AGENTS.md` and the specification audit.
- Inspected all workspace files. No source, manifests, architecture docs, configuration, or tests were present.
- Reviewed official framework, runtime, database, authentication, storage-security, accessibility, and testing documentation. Research is dated because supported versions, advisories, product features, and vendor terms change.
- Cost is assessed qualitatively only. No user volume, data volume, region, account, budget, or provider plan was supplied, and no price estimate is asserted.
- “Verified” below means supported by a primary-source page accessed on the research date; it does not imply the school has approved the option or its terms.

## Decision Register

| Area | Related requirements | Proposed recommendation | Status / confidence |
|---|---|---|---|
| Language and web framework | PRD §9.1–9.4; G1–G6; FR-01–FR-10; NFR-01–NFR-08 | TypeScript + Next.js App Router / React as a single application; validate runtime and package versions at project bootstrap. | Proposed; medium-high technical confidence, low project-fit confidence |
| Database and data access | PRD §8.2–8.3, §9; FR-04, FR-06–FR-09; NFR-04–NFR-06 | PostgreSQL, accessed from trusted server-side code; select managed provider and ORM after operational constraints are clarified. | Proposed; high confidence in relational fit, low provider/ORM confidence |
| Admin authentication | PRD FR-09; NFR-04; audit AUD-04, AUD-05 | Use an established auth library or managed identity service; no custom password/session implementation. Choose provider and login/recovery policy only after access and privacy approval. | Proposed; high confidence in avoiding custom auth, low provider confidence |
| Hosting and deployment | PRD §9.1, §9.4, §17–18; NFR-01, NFR-04, NFR-06 | Managed runtime capable of supporting the selected Next.js features; no provider commitment yet. Require staging, production, secret management, backups, rollback, and ownership plan. | Deferred provider choice; low confidence until owner/budget/region known |
| Image storage | FR-07; PRD §8.2, §9.2, NFR-04–NFR-06; audit AUD-06 | Managed object storage; use explicit authorization/publishing workflow and least-privilege access. Select provider and public/private delivery model after media policy approval. | Proposed; medium technical confidence, low policy/provider confidence |
| Background processing / queues | FR-04, FR-06–FR-07; PRD §6.3, §16 | No queue in MVP absent an approved asynchronous workload. Persist an enquiry before optional notification; introduce durable asynchronous delivery only if notification becomes a requirement. | Proposed; high confidence given current scope |
| External APIs / integrations | FR-05, FR-08, FR-10; PRD §13, §20 | WhatsApp click-to-chat is the only explicit external contact integration. Do not add analytics, maps, email/SMS, or marketing APIs until selected and privacy-reviewed. | Provider/configuration unresolved |
| AI providers, models, orchestration | PRD §2.2, NFR-05 | No runtime AI feature or AI orchestration in MVP. Do not send personal/student information to AI providers. | No provider/model decision; scope explicitly excludes AI chatbot/agent |
| Monitoring and operational logging | NFR-04, NFR-05, NFR-06; audit AUD-05, AUD-08, AUD-17 | Start with provider-supported health/error telemetry and privacy-minimized logs; specify alert ownership and retention before production. No monitoring vendor selected. | Deferred; low confidence until operations owner/SLOs known |
| Testing and security verification | PRD §14–15; NFR-03–NFR-04 | Unit/integration tests for business rules and persistence; browser E2E for critical flows; manual keyboard review; define security acceptance evidence against a versioned baseline such as OWASP ASVS. | Proposed; medium-high confidence |

## Research and Comparisons

### 1. Language and web framework

**Question:** Which application language/framework should anchor public pages, the protected CMS, and server-side operations?

**Related requirements:** PRD §4–5 (public pages and dashboard), §9 (proposed architecture), FR-01–FR-10, NFR-01–NFR-08.

**Options considered**

| Option | Fit and trade-offs |
|---|---|
| TypeScript + Next.js App Router / React | Closely matches PRD recommendation. One web application can combine public rendering and server-side application logic. TypeScript adds static checking; Next.js offers framework conventions and server features. It has a larger framework surface and requires careful understanding of caching, server/client boundaries, and framework-specific security updates. |
| TypeScript + another React framework (e.g. a client-rendered SPA plus separate API) | Familiar component model and can separate backend deployment, but introduces at least one additional service boundary and separate routing, auth, caching, and deployment decisions. No need for that separation is established. |
| Server-rendered framework in another language (e.g. Django or Rails) | Mature full-stack alternatives may provide integrated administration and server-side workflows, but would depart from the PRD's TypeScript/Next recommendation and require a team/hosting preference not supplied. No repository code indicates an existing language. |

**Verified facts:** Next.js installation documentation lists Node.js 20.9 as the minimum and supports Windows, macOS, and Linux. Its current App Router setup defaults include TypeScript and App Router; the same documentation notes App Router uses React canary releases containing stable React 19 changes. Next.js's authentication guide recommends an authentication library for increased security and simplicity rather than treating its educational custom-auth examples as a production recipe. Node.js recommends production use of Active LTS or Maintenance LTS releases. [S1–S4]

**Recommendation (proposed):** TypeScript + Next.js App Router / React as a single application, because it matches the PRD candidate and supports the public plus protected server-backed use case without evidence for multiple independently deployed services. Use a Node.js release that is both within the chosen Next.js version's supported range and in an appropriate LTS state. Pin exact supported dependency versions and review framework security advisories before each release; the minimum runtime version is not a production-version recommendation.

**Trade-offs / costs / maintenance:** The core frameworks have open-source licenses (Next.js MIT verified; check licenses for every selected transitive dependency). Managed hosting, build minutes, bandwidth, and database costs are provider- and usage-dependent; no prices can be estimated without traffic, region, media, and budget assumptions. Framework updates and cache/security semantics require ongoing maintenance. [S1, S3, S5]

**Compatibility / uncertainty:** No source or manifest exists, so there is no compatibility test against the current app. Node minimums and framework support evolve. The framework's React release mode is a deliberate compatibility consideration; validate the supported stable/dependency matrix at scaffold time. Current security advisory status for a specific package version was not assessed because no version is selected.

**Confidence:** Medium-high that this is a technically coherent candidate; low that it is the best organizational/vendor fit until the team, budget, and hosting constraints are known.

**ADR:** [`decisions/ADR-001-typescript-nextjs.md`](./decisions/ADR-001-typescript-nextjs.md).

### 2. Database and data-access layer

**Question:** What persistent store and access pattern should support articles, images metadata, settings, admin identities/roles, and private enquiries?

**Related requirements:** PRD §8.2–8.3, §9.2–9.3; FR-04, FR-06–FR-09; NFR-04–NFR-06.

**Options considered**

| Option | Fit and trade-offs |
|---|---|
| Managed PostgreSQL with server-only access | Matches the PRD's relational recommendation and supports entity relationships, uniqueness, constraints, and migrations. Requires selecting a managed service, connection model/pooling, backups, and access controls. |
| SQLite/local file database | Fewer services and simple local operation; production suitability, concurrent writes, backup/restore, and hosting persistence must be established. Current PRD expects a managed database and backup operations, so SQLite would require a deliberate architecture change. |
| Managed database platform combining PostgreSQL and APIs/auth/storage | Can reduce integration work but increases platform coupling and can expose database APIs if policies are misconfigured. It requires explicit policy and server/client access design. |

**Verified facts:** PostgreSQL's support policy states major versions receive five years of support and recommends current minor releases. Its license is a permissive open-source license similar to BSD/MIT. Supabase's official connection guide differentiates connection methods by workload: serverless/edge workloads may need a pooler, persistent backends may use direct connections in supported network conditions, and frontend Data API usage requires RLS. These are provider-specific connection facts, not proof that Supabase is the selected provider. [S6–S8]

**Recommendation (proposed):** Use PostgreSQL as the production relational database and restrict privileged database operations to trusted server code. Choose a currently supported major/minor accepted by the selected managed provider; do not hardcode a major version in this research decision. Define and test backup/restore and migration procedures. Select ORM versus typed SQL only after runtime, deployment pooling, team skill, and migration requirements are confirmed.

**Data-access options:** Prisma or an equivalent ORM (PRD proposal), a lighter typed query builder, or parameterized SQL with a maintained driver. An ORM may improve modeled relations and migration workflow but adds generated-client/deployment and provider-compatibility considerations. A query builder/raw SQL can reduce abstraction but makes schema/type consistency more dependent on tooling and review. No primary-source comparison was completed for a specific ORM or version; no ORM recommendation is made here.

**Security / maintenance:** Never expose a database URL or privileged credential in browser code. Use least privilege, server-side validation, parameterized access, TLS, backups, migration review, and explicit protection for enquiry data. If adopting a provider's client-facing APIs, require tested RLS policies and service-key handling; RLS is not a substitute for application authorization. PostgreSQL majors require planned upgrades, and old unsupported versions should not be chosen. [S6–S8]

**Cost / licensing:** PostgreSQL licensing has no software license fee; managed hosting, backups, storage, compute, egress, and support may incur provider charges. No price estimate is supportable without region/usage/plan. [S7]

**Confidence:** High for relational PostgreSQL fit given the data entities and PRD; low for provider and ORM pending operational constraints.

**ADR:** [`decisions/ADR-002-postgresql-data-platform.md`](./decisions/ADR-002-postgresql-data-platform.md).

### 3. Administrator authentication and authorization

**Question:** How should staff authenticate and how should access to the dashboard, content operations, settings, and enquiry records be enforced?

**Related requirements:** FR-09, PRD NFR-04–NFR-05, §12; audit AUD-04, AUD-05, AUD-07.

**Options considered**

| Option | Fit and trade-offs |
|---|---|
| Implement password, session, recovery, and authorization mechanisms in application code | Maximum control and no identity vendor dependency; substantial security and operational burden. Not recommended for this MVP. |
| Authentication library integrated into the application | Can fit the selected framework and allow a controlled identity/session design; the project must configure secure sessions, recovery, MFA expectations, and account lifecycle correctly. Library support and adapters need version checks. |
| Managed identity provider | Outsources identity lifecycle and may provide stronger operational features; introduces vendor, cost, data processing, account ownership, and availability dependencies. Must still enforce authorization in application/server logic. |

**Verified facts:** Next.js's current authentication guidance separates authentication, session management, and authorization and recommends an authentication library for security/simplicity. It identifies MFA and role-based access control as possible library capabilities. Its examples are educational and do not by themselves settle production authorization. [S2]

**Recommendation (proposed):** Use an established authentication library or managed identity provider; do not implement password hashing/session primitives from scratch. Make access decisions server-side for every protected action and record access controls in tests. Provider selection depends on whether staff need MFA, password reset, email delivery, SSO, account provisioning, and whether an external identity processor is approved.

**Security and privacy conditions:** Establish a named account owner and process for bootstrap, recovery, MFA, disablement, and access review. Keep service secrets server-side. Separate admin identity from public enquiry data; never expose private enquiries through public routes or analytics. If third-party identity processing is chosen, review data location, subprocessors, retention, recovery controls, and contractual terms first.

**Cost/licensing:** Authentication libraries may be open source; managed provider features and usage may be chargeable. Specific license and plan cost remain unresearched until a candidate/version/usage is selected. No vendor has been approved.

**Confidence:** High that custom authentication is unjustified; low on whether hosted or library-based identity best satisfies school policy.

**ADR:** [`decisions/ADR-003-administrator-authentication.md`](./decisions/ADR-003-administrator-authentication.md).

### 4. Hosting, image storage, and deployment

**Question:** Where should the app, database, and school media run, and how should private/non-published assets be isolated?

**Related requirements:** PRD §9.1–9.4, §17–18; FR-07, FR-09; NFR-01, NFR-04–NFR-06; audit AUD-06, AUD-11, AUD-12, AUD-17.

**Options considered**

| Option | Fit and trade-offs |
|---|---|
| Managed Next.js-capable application platform + managed PostgreSQL + object storage | Less infrastructure operation for a small school team and aligns with PRD direction. Splits data across vendors unless an integrated platform is selected; vendor limits, region, data processing, and egress costs require review. |
| Self-hosted Node.js application and separately operated database/storage | Greater infrastructure control and portability potential; requires patching, TLS, monitoring, backups, scaling, deployment, and incident operations. No operations capacity has been demonstrated. |
| Integrated application/data platform | Fewer separate services and potentially simpler provisioning; platform coupling, API/RLS configuration, data export/egress, runtime fit, and plan constraints need assessment. |

**Recommendation (proposed):** Prefer managed services for the initial launch *if* they meet approved privacy, location, budget, and ownership needs. Keep the application server-side and use managed object storage rather than treating the app filesystem as durable media storage. Require separate staging/production configuration, private secrets, TLS, reviewed migrations/rollback, verified backups and restoration, and a documented owner. Do not choose a vendor based solely on a framework quickstart.

**Media controls:** Establish storage policy after the school decides whether a photo is approved and public. Keep originals or unpublished uploads private; expose only deliberately published renditions. Signed access or public object URLs should follow the chosen content/publication policy; do not place personally identifying records or private enquiry exports in public storage. Supabase documents RLS-based Storage access policies and denies uploads by default without applicable policies; this is a provider-specific example and requires correct policy design if selected. [S9]

**Compatibility and operations:** Vercel documentation describes its supported Function runtimes, but the inspected page alone does not establish that its current limits, geographic availability, plan, or data-processing terms satisfy this school's requirements. Next.js minimum Node version is not the same as a platform support commitment. Verify current framework/runtime support and region availability at procurement/implementation time. [S1, S10]

**Cost/licensing:** Framework code may be open source; hosting, image transformation/delivery, bandwidth, database backup, support, and custom domain costs depend on current provider plan and usage. No prices or performance claims are made. Self-hosting has infrastructure and operator time costs. Obtain current written estimates after traffic, image volume, geography, and retention are approved.

**Confidence:** Medium that managed deployment/storage is operationally appropriate; low on provider and compliance fit.

**ADR:** [`decisions/ADR-004-hosting-and-media-storage.md`](./decisions/ADR-004-hosting-and-media-storage.md).

### 5. Background processing, notifications, and external APIs

**Question:** Does MVP need a queue or asynchronous worker, and which outside services are mandatory?

**Related requirements:** FR-04–FR-05, FR-07–FR-08; PRD §6.3, §13, §16, §20; NFR-05–NFR-06.

**Assessment:** Current MVP has an enquiry form, dashboard review, and WhatsApp click-to-chat. Email notification is optional and explicitly must not erase a successfully stored enquiry. There is no defined scheduled job, long-running workload, expected throughput, or service-level target that justifies an independent queue/worker.

**Options:** (a) no queue; persist synchronously and show success only after confirmed storage; (b) provider-managed queue/background function for approved notification or media tasks; (c) database outbox plus worker for durable retries if notifications become operationally required.

**Recommendation (proposed):** Do not add a queue to MVP. Persist enquiry first; optional notification failure must be observable and must not undo the record. If email notification becomes a launch requirement, define retry/idempotency and operator visibility, then choose a provider-native queue or outbox based on hosting/database support. Do not use WhatsApp API sending; the PRD specifies click-to-chat, not automated delivery.

**Compatibility, security, operations, cost/licensing, and maintenance:** Direct persistence aligns with the required synchronous success response and avoids a new runtime/service dependency. A provider-managed queue or database outbox adds retry and delivery-state complexity but may be needed for durable notifications; either must be compatible with the selected hosting/runtime. No queue provider or queue license/cost is selected or researched. No asynchronous feature presently justifies that operational burden. A future notification must not include excess enquiry data in queue payloads or logs.

**Confidence:** High for no queue under current requirements; revisit if the school approves notification guarantees or asynchronous media processing.

### 6. AI, external APIs, and telemetry

**Question:** Is a model provider, AI orchestration layer, analytics vendor, maps API, or email/SMS API required?

**Related requirements:** PRD §2.2 (AI chatbots/automated agents are non-goals), NFR-05, FR-05, FR-08, FR-10, §13, §20.

**Options:** Use only the required WhatsApp click-to-chat link and no other API; add individually approved provider integrations (email/SMS, analytics, maps); or add runtime AI. The last is explicitly outside current MVP scope. The first is the smallest integration surface; each additional service can add personal-data processing, consent, availability, account, and cost dependencies.

**Assessment and recommendation (proposed):**

- **AI runtime/provider/orchestration:** None. No model selection or agent orchestration is justified for current MVP. Do not send student or enquiry information to third-party AI services (PRD NFR-05).
- **WhatsApp:** Implement only the approved click-to-chat link and verified/configured number (FR-05). No WhatsApp Business API, delivery status, or automated messaging is specified.
- **Maps, social, analytics, email/SMS:** Optional/unconfirmed. Do not add third-party scripts or APIs until use, data flow, consent/privacy implications, account ownership, cost, and failure handling are approved.
- **Monitoring:** Use privacy-minimized logs and health/error reporting, but select no provider until operational ownership, retention, alert route, budget, and data-processing constraints are known.

**Security, compatibility, cost/licensing, and maintenance:** Any third party must be reviewed for data transferred, region, account ownership, access control, terms, retention, and failure behavior before connection. Exact API compatibility and pricing cannot be assessed without choosing vendors and expected traffic. There is no model, orchestration, analytics, maps, email, or SMS license/provider decision in this record.

**Confidence:** High that no AI or additional integration provider should be selected now; selection of optional integrations remains an owner decision. No vendor-specific research was undertaken for optional services because the business need and allowed data flows are not confirmed.

### 7. Monitoring and operational telemetry

**Question:** What production signals, logs, alerts, and retention are needed, and which telemetry service may receive application data?

**Related requirements:** NFR-04–NFR-06; PRD §14–15, §17–18; audit AUD-05, AUD-08, AUD-17.

**Options:** (a) hosting-provider health/error telemetry; (b) separately managed monitoring/APM; (c) self-hosted monitoring; (d) no monitoring beyond manual checks. Provider telemetry may be simplest but adds a processor/vendor boundary; self-hosting adds operations; no monitoring impairs incident detection.

**Recommendation (proposed):** Require production health/error visibility and an owner for alerts, but defer the product/vendor choice until service targets, data handling, provider, and support ownership are approved. Logs should exclude passwords, tokens, full enquiry bodies, and unnecessary student/personal details; set retention and access controls before launch.

**Compatibility, operations, cost/licensing, and maintenance:** Selected monitoring must support the deployed runtime and environment. Costs and licenses vary materially by provider, ingestion, retention, and team size; none can be compared responsibly without candidates and usage assumptions. No monitoring API/vendor or extra dependency is recommended now.

**Confidence:** High that production needs observable failures and an accountable owner; low on tool choice. No monitoring vendor sources were researched because no provider candidate or operational profile is approved.

### 8. Testing and security verification

**Question:** What test approach can demonstrate the critical public/admin journeys, responsive behavior, accessibility, and security?

**Related requirements:** PRD §14–15, NFR-03–NFR-04.

**Options:** Unit/business-rule tests only; unit + integration tests; add browser end-to-end tests for principal flows. The PRD already calls for unit, integration, end-to-end, accessibility, build, and dependency/security checks. Browser runner candidates include Playwright and a framework/provider-native runner; the existing repository defines no test tooling.

**Recommendation (proposed):** Test at multiple layers:

1. Unit-test server validation, publication rules, permissions, and status transitions.
2. Integration-test database-backed enquiry persistence, protected reads, and content publication.
3. Use a browser E2E runner for login/protected access, content publication, enquiry success/failure, and mobile layouts.
4. Perform manual keyboard testing for the primary public and admin flows; automated accessibility checks are supplementary.
5. Define a versioned security verification baseline and track dependency advisories. OWASP ASVS states it provides a basis for testing web application technical security controls; its current stable version shown on the official project site is 5.0.0. Version-pin any ASVS requirement references used as acceptance criteria. [S11]

Playwright's official documentation describes Playwright Test as an end-to-end framework for modern web apps and documents browser support for Chromium, WebKit, and Firefox across major desktop OSes. It is a candidate, not an accepted dependency; browser binary storage/runtime and CI execution costs must be considered. [S12]

**Security, compatibility, cost/licensing, and maintenance:** Test dependencies must support the chosen Node/framework versions and run in the selected CI environment. Browser tests add runtime and maintenance burden but cover browser interactions not proven by unit tests. No particular runner license or CI plan cost was verified; inspect exact licenses and current provider pricing before adoption. OWASP ASVS provides a versioned verification basis, but an appropriate verification level and applicability must be approved rather than assumed. The ASVS page reports v5.0.0 as latest stable at research time. [S11–S12]

**Confidence:** Medium-high for layered testing and versioned security criteria; medium for Playwright pending actual CI needs.

### 9. External API decision: WhatsApp integration

**Question:** Should the website send messages through an API or provide a user-initiated WhatsApp contact link?

**Related requirements:** PRD FR-05, FR-08 and the admissions journey in §6.

**Options:** (a) configurable click-to-chat link with a prefilled message; (b) WhatsApp Business API messaging; (c) no WhatsApp integration and only the web form.

**Recommendation (proposed):** Implement only the PRD's click-to-chat link after the school supplies and verifies the number. Do not send messages automatically or claim delivery/read status. Keep the web form available as the PRD requires.

**Trade-offs / security / compatibility / cost:** A user-initiated link has fewer backend credentials and less automated personal-data processing; it depends on an accurate approved number and the visitor's device/browser. Automated messaging would introduce API credentials, business account provisioning, consent, message templates/policies, delivery failure behavior, and usage/vendor costs not specified in the PRD. No API price, current policy, or integration compatibility research is claimed because automated API use is not in scope.

**Confidence:** High for the click-to-chat choice because it follows FR-05; contact number and final message remain human-approved configuration.

## Cross-Cutting Constraints and Risks

- **Privacy and jurisdiction:** The school must approve data purpose, notice, retention, media permissions, access, and providers before deployment. This technical record does not establish legal compliance.
- **Data locality and vendor terms:** Nigeria is the institution's stated location; no jurisdictional data residency, hosting region, processor, or transfer decision was supplied. This is a human/legal/operations decision, not a technical default.
- **Cost:** No budget, forecast, expected visitors, enquiry rate, media volume, retention duration, support window, or analytics decision exists. Vendor pricing estimates would be speculative.
- **Security versions:** This research did not audit a specific dependency tree (none exists) or enumerate current CVEs for chosen versions. Re-check official security advisories and lock supported patched versions immediately before scaffolding and each production release.
- **Availability and recovery:** RTO/RPO, alert owner, backup retention, restore drills, and support expectations remain undefined.
- **Accessibility:** PRD targets WCAG 2.2 AA. W3C publishes the standard, but this research does not certify any design or implementation. Acceptance evidence requires manual and automated evaluation. [S13]
- **Architecture versus implementation:** Proposed ADRs record direction only; they are not permission to provision accounts, introduce dependencies, or treat a vendor as selected.

## Proposed Architectural Decision Records

| ADR | Topic | Status |
|---|---|---|
| [ADR-001](./decisions/ADR-001-typescript-nextjs.md) | Language and web framework | Proposed |
| [ADR-002](./decisions/ADR-002-postgresql-data-platform.md) | Relational database and access boundary | Proposed |
| [ADR-003](./decisions/ADR-003-administrator-authentication.md) | Administrator authentication | Proposed |
| [ADR-004](./decisions/ADR-004-hosting-and-media-storage.md) | Hosting and media storage | Proposed |

None is accepted. Further ADRs should be created when human decisions resolve the provider, data handling, or operational questions, rather than creating false precision now.

## Sources

All sources below are official/primary documentation pages accessed on **2026-10-27**. Product pages may change; verify again at implementation/procurement.

| ID | Source | Research note |
|---|---|---|
| S1 | [Next.js Installation and System Requirements](https://nextjs.org/docs/app/getting-started/installation) | Current docs page reported last updated 2026-10-02; minimum Node.js 20.9, OS support, starter defaults, App Router/React note. |
| S2 | [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) | Current docs page reported last updated 2026-09-16; separates authentication/session/authorization and recommends authentication libraries. |
| S3 | [Node.js Release Schedule](https://nodejs.org/en/about/previous-releases) | Production applications should use Active LTS or Maintenance LTS; release state is date-sensitive. |
| S4 | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) | Describes TypeScript as a static type checker for JavaScript. |
| S5 | [Next.js License](https://github.com/vercel/next.js/blob/canary/license.md) | MIT license text on the official repository; verify the exact release and all dependency licenses. |
| S6 | [PostgreSQL Versioning Policy](https://www.postgresql.org/support/versioning/) | Major versions receive five years of support; current minor releases recommended. |
| S7 | [PostgreSQL License](https://www.postgresql.org/about/licence/) | PostgreSQL license described as permissive and similar to BSD/MIT. |
| S8 | [Supabase: Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres) | Provider-specific connection choices for frontend, serverless, persistent backends, and migrations; frontend Data API requires RLS. |
| S9 | [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) | Provider-specific Storage policies use PostgreSQL RLS; uploads are denied absent applicable policies by default. |
| S10 | [Vercel Function Runtimes](https://vercel.com/docs/functions/runtimes) | Lists supported Vercel function runtimes; not evidence of school-specific plan, region, or data suitability. |
| S11 | [OWASP Application Security Verification Standard](https://asvs.owasp.org/) | Describes ASVS purpose; page identifies v5.0.0 as latest stable during research. |
| S12 | [Playwright Introduction](https://playwright.dev/docs/intro) | Describes Playwright Test and browser/OS support. |
| S13 | [W3C Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/) | Primary standard referenced by PRD. |

## Decisions Requiring Human Approval

1. Approve or reject the **proposed TypeScript + Next.js App Router** application baseline, including the responsible technical owner.
2. Approve PostgreSQL as the data-store direction and confirm provider, region/data location, expected usage, backup/recovery expectations, and whether the app can use server-only access.
3. Approve the admin identity approach and account lifecycle: managed provider versus library-based integration, MFA/recovery needs, initial account owner, roles, and disablement.
4. Approve hosting and object-storage procurement constraints: budget, account ownership, allowed providers, region/data processing, public/private media policy, and operational support capacity.
5. Decide whether email notifications or analytics are required at MVP launch; if yes, approve providers, data transferred, retention, failure/retry behavior, and privacy review.
6. Confirm whether any non-public school or student data may be used with AI coding tools; no runtime AI provider is proposed.
7. Approve service/recovery expectations and operational monitoring owner before production design is finalized.
8. Resolve the high-severity privacy, image authorization, access-control, and content approval questions identified by audit findings AUD-03–AUD-08 before committing to schema and policy design.

**No decisions have been accepted by this document.**
