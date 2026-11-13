# ADR-001: TypeScript and Next.js Application Baseline

- **Status:** Accepted (for MVP local/staging execution; re-verify at production hosting cutover)
- **Date:** 2026-11-10 (originally proposed 2026-10-27)
- **Decision owners:** Project Owner (approved 2026-11-10) and Technical Owner

## Context

The PRD describes one public school website and a protected content-management dashboard with server-side operations. It recommends TypeScript, Next.js, and React, but explicitly allows another stack when repository, budget, hosting, or school constraints justify it. The repository currently has no application source, dependencies, or platform constraints.

## Drivers

- Support search-visible public pages and authenticated administrative workflows.
- Keep privileged database operations on a trusted server.
- Keep the application maintainable with minimal unnecessary services.
- Choose maintained versions with an operationally supported runtime.
- Avoid treating the PRD's candidate stack as already approved.

## Options

1. **TypeScript + Next.js App Router / React:** Aligns with PRD recommendation and a single application boundary; requires framework-specific knowledge of server/client execution, caching, and updates.
2. **TypeScript + client-rendered React plus separate API:** Clear service split but increases deployment and contract complexity without a demonstrated requirement.
3. **Another full-stack framework/language:** Could be preferable for team or hosting fit, but no current-code, skill, or vendor evidence supports a specific alternative.

## Proposed Decision

Use TypeScript with Next.js App Router / React as the provisional single-application baseline, subject to owner approval and validation against hosting/runtime/privacy constraints. Use a Node.js version that is both supported by the selected Next.js release and in an appropriate LTS lifecycle state. Pin tested dependency versions and review security advisories before releases. Do not select an exact version from this ADR.

## Consequences

- A single app can own public rendering, dashboard UI, and trusted server-side business operations.
- Team must understand and test route, cache, server/client, and authorization boundaries.
- Exact package versions and runtime must be selected later; compatibility is not verified against code because no code exists.
- Managed hosting and framework-specific features may influence portability; deployment remains a separate decision.

## Risks and Uncertainties

- Budget, developer capability, data-location constraints, account ownership, and hosting preference are unknown.
- Framework defaults and supported runtime versions change; revalidate before implementation.
- No version-specific security advisory review has been performed.
- Current Next.js documentation notes that App Router uses React canary releases containing stable React 19 changes; verify package compatibility and lockfile behavior at project bootstrap.

## Related Requirements

PRD §4–5, §9.1–9.4, §17–18; G1–G6; FR-01–FR-10; NFR-01–NFR-08. Specification-audit findings AUD-12, AUD-16, AUD-17.

## References

Research performed 2026-10-27:

- [Next.js Installation and System Requirements](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [Node.js Release Schedule](https://nodejs.org/en/about/previous-releases)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Next.js License](https://github.com/vercel/next.js/blob/canary/license.md)
- [`docs/research-and-decisions.md`](../research-and-decisions.md)
