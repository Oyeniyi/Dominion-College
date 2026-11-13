# ADR-003: Administrator Authentication

- **Status:** Accepted (Established cryptographic session & scrypt/PBKDF2 password hashing via Node.js `node:crypto` + server-side RBAC/active-account enforcement approved for MVP)
- **Date:** 2026-11-10 (originally proposed 2026-10-27)
- **Decision owners:** Project Owner (approved 2026-11-10) and Technical Owner

## Context

The PRD requires secure admin authentication, server-side authorization, secure sessions, account disablement checks, and protected access to enquiry records. It allows a single administrator for MVP but does not define account provisioning, recovery, MFA, role permissions, or account ownership. The audit identifies these as unresolved high-severity design issues.

## Drivers

- Protect private enquiry records and content-management operations.
- Avoid frontend-only security or custom authentication primitives.
- Support an approved administrator lifecycle and least-privilege access.
- Avoid sending personal data to an unapproved identity provider.

## Options

1. **Custom password/session implementation:** Maximum control, but requires implementing and maintaining sensitive authentication, session, recovery, and abuse controls. Not recommended.
2. **Authentication library integrated with the app:** Supports application-controlled identity/session design; project remains responsible for secure configuration and lifecycle.
3. **Managed identity provider:** May reduce identity operations and offer additional controls, but creates vendor, cost, data-processing, availability, and account-ownership dependencies.

## Proposed Decision

Use an established authentication library or managed identity provider; do not implement password hashing, session primitives, or recovery flows from scratch. Require server-side authorization at every protected data/action boundary regardless of provider. Defer provider selection until the school approves the administrator lifecycle, role matrix, MFA/recovery expectations, privacy/data-processing review, region, budget, and provider ownership.

## Consequences

- Authentication, session management, and authorization must be designed and tested as separate concerns.
- A provider/library does not automatically secure application routes or data access.
- A named owner and procedures for bootstrap, recovery, access review, and deactivation are required.
- Managed provider costs and terms, or library maintenance burden, must be assessed once candidates are known.

## Risks and Uncertainties

- No admin account owner, role model, staff onboarding/offboarding, or recovery contact has been nominated.
- Email delivery, MFA, SSO, password-only login, and support expectations are not specified.
- Any managed identity service requires privacy, location, subprocessor, and contractual review.
- Version-specific support and advisories must be checked after selecting the framework/library/provider.

## Related Requirements

PRD FR-09; NFR-04–NFR-05; PRD §12, §14–15, §20. Audit findings AUD-04, AUD-05, AUD-07.

## References

Research performed 2026-10-27:

- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) (recommends an auth library and distinguishes authentication, sessions, and authorization)
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod) (provider-specific examples of MFA, auth configuration, and security review)
- [`docs/research-and-decisions.md`](../research-and-decisions.md)
