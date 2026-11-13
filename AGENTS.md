# Agent Instructions

## Project Context

Dominion College's project is a planned, responsive school website with public information and admissions journeys, a content-management dashboard, and admissions enquiry handling. Its objectives include presenting school-approved information, supporting admissions enquiries, enabling authorized staff to manage content, and providing a secure, accessible, maintainable experience.

The current workspace contains the draft product requirements document at [prd.md](./prd.md). It describes the intended public website and administration dashboard, but is not evidence that either has been implemented. The PRD's architecture and implementation stack are recommendations, not confirmed decisions. Inspect the repository and supplied assets before making implementation assumptions.

## Document Authority and Conflicts

Use the document that owns each decision:

- **Product scope, requirements, priorities, and acceptance criteria:** [prd.md](./prd.md), including its G, FR, NFR, and project-completion sections.
- **Architecture and technical decisions:** `architecture.md` when established; otherwise, record material decisions and obtain approval before departing from the PRD's proposed baseline.
- **Architectural invariants and domain-specific rules:** the approved architecture and applicable requirements in `prd.md`.
- **Security and privacy:** `security-specification.md` when established, plus the security, privacy, and child-protection requirements in `prd.md`. Never weaken a control for convenience.
- **Data model and migrations:** `database-schema.md` and the approved architecture, alongside the data requirements in `prd.md`.
- **API contracts:** the approved API specification or documented server-side contract when one exists; otherwise follow the applicable product requirements and architecture, and document material contract decisions.
- **AI-agent behavior and workflow:** this `AGENTS.md`, subject to project governance and the task's explicit scope.
- **Tasks and traceability:** the approved `implementation-plan.md` or project task tracker when present. The current PRD defines phases but no task-ID scheme.
- **Testing:** `testing-strategy.md` when established, applicable acceptance criteria in `prd.md`, and the repository's actual test/build scripts.
- **Completion and release:** the acceptance criteria and definition of done in `prd.md`, plus approved deployment/release procedures when available.

The PRD lists additional documents as required project artifacts; their mention does not mean they exist. Check before relying on them. Documents govern their stated domain; if requirements conflict, a source is ambiguous or stale, or implementation constraints change scope, security, privacy, data handling, or public commitments, stop and surface the exact conflict and impact to the project owner for a decision. Do not silently choose the easiest interpretation or treat a recommendation as approval. Record the decision in the authoritative document(s).

## Development Rules

- Inspect relevant source, configuration, assets, documentation, and nearby tests before changing code. Follow established project conventions and reuse existing functionality.
- Make the smallest coherent change that fully meets the approved scope. Avoid unrelated changes, unnecessary dependencies, speculative features, and unapproved MVP expansion.
- Keep secrets in secure configuration, never source control. Validate untrusted input at trusted boundaries; enforce authorization server-side; handle errors explicitly without exposing sensitive data or internals.
- Do not invent school facts, contact details, policies, achievements, or other public claims. Use only school-approved information; keep placeholders out of production content.
- Add or update tests for behavior changed and documentation for changed setup, contracts, architecture, security, or operational behavior.

## Traceability

When applicable, identify the PRD goal (`G1`–`G6`), functional requirement (`FR-*`), non-functional requirement (`NFR-*`), and acceptance criterion addressed. Include approved task IDs from the project tracker or implementation plan when available; do not fabricate IDs. If a change has no applicable requirement or task, say so and explain its approved purpose.

## Testing and Verification

- Inspect the available scripts and tooling; run the smallest relevant checks, then any broader checks required by the change or project guidance.
- Report the exact commands run and their actual results. Separate passing checks from failed checks and checks not run, and state why anything was not run.
- Never claim a test, build, accessibility review, security check, or deployment verification without evidence. Report limitations and remaining risks.

## Security and Change Management

- Do not commit secrets, log sensitive data, expose private records, or send sensitive student information to third-party AI services.
- Do not disable security, privacy, validation, or other controls merely to pass tests. Do not introduce external network access, trackers, or third-party integrations without authorization and any required privacy review.
- Treat destructive data or file operations as requiring explicit scope, safeguards, and recoverability; confirm before proceeding if authorization or impact is unclear.
- Call out changes to product scope, architecture, database/schema or migrations, API contracts, security, privacy, AI permissions, and external dependencies. Obtain school/project-owner approval where governance, the PRD, or policy requires it; do not assume approval from implementation convenience.

## Implementation Workflow

Understand the task -> inspect applicable specifications and code -> identify acceptance criteria and unresolved decisions -> plan the smallest coherent change -> implement -> test -> review the diff and risks -> update relevant documentation -> report evidence and limitations.

## Completion Report

At completion, summarize what changed; the requirements and approved task IDs addressed; files changed; checks run and results; documentation updates; limitations and risks; and unresolved issues or decisions. Be explicit about checks not run.

## Tool Compatibility

Keep these instructions portable. Put platform-, framework-, or tool-specific commands in the relevant README, testing, or deployment documentation, and use the commands actually defined by the repository.
