# ADR-004: Managed Hosting and Media Storage

- **Status:** Accepted (Local private staging + approved public rendition storage adapter approved for local MVP execution; managed object storage for production)
- **Date:** 2026-11-10 (originally proposed 2026-10-27)
- **Decision owners:** Project Owner (approved 2026-11-10), Hosting/Domain Owner, and Technical Owner

## Context

The PRD recommends managed hosting, managed PostgreSQL, and managed object storage, but states hosting/domain are undecided. The application must keep private admin data protected, serve approved images, support publication without redeploy, and provide HTTPS, backups, restore procedures, and rollback documentation. The school has not approved providers, budget, region, data-processing terms, or operational owners.

## Drivers

- Support the selected framework and trusted server-side operations.
- Avoid losing uploaded media on application redeploy or instance replacement.
- Protect unpublished assets and personal/student-related data.
- Provide practical backup, restore, rollback, monitoring, and access management.
- Meet approved data-location, budget, and account-ownership requirements.

## Options

1. **Managed web runtime + managed database + object storage:** Lower infrastructure burden, with multiple vendor boundaries and plan/region/egress constraints.
2. **Self-hosted application, database, and media infrastructure:** Greater operational control but requires qualified ongoing operations, patching, backup, monitoring, network security, and recovery.
3. **Integrated managed platform:** Fewer service integrations but potentially more platform coupling and provider-specific API/security configuration.

## Proposed Decision

Prefer managed runtime, managed relational database, and managed object storage if the school approves provider terms, region, budget, account ownership, and operational support. Keep the app's privileged data operations server-side. Treat media as private until school authorization and publication status explicitly permit public delivery. Do not select a vendor or provision an account through this ADR.

Before production, require separate environment configuration, secret handling, TLS, reviewed migration and rollback procedure, backup/restore evidence, alert ownership, and a support/escalation path. Define which image renditions can be public and how revocation/removal affects cached copies.

## Consequences

- Reduces the amount of infrastructure the school must operate, subject to the selected service's limits.
- Creates vendor dependencies and potentially separate bills for compute, database, media, bandwidth, backups, and monitoring.
- Region, data transfer, provider terms, and service availability must be reviewed before choosing.
- Private storage and public image delivery need explicit access policies and tests.
- Service-specific runtime support and current pricing need revalidation at procurement.

## Risks and Uncertainties

- No budget, traffic, media volume, target region/data location, RTO/RPO, support hours, or domain owner is known.
- No provider's terms, prices, security advisories, feature limits, or data-processing arrangements have been approved.
- Public student images may be cached or redistributed; system removal cannot guarantee retrieval of external copies.
- Exact framework/runtime compatibility must be checked against the selected service at implementation time.

## Related Requirements

PRD §9.1–9.4, §12, §15, §17–18, §20; FR-07, FR-09; NFR-01, NFR-04–NFR-06. Audit findings AUD-06, AUD-08, AUD-11–AUD-12, AUD-17.

## References

Research performed 2026-10-27:

- [Vercel Function Runtimes](https://vercel.com/docs/functions/runtimes) (provider-specific runtime documentation; does not establish suitability)
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) (provider-specific RLS-based object access controls)
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod) (provider-specific security, performance, and availability checks)
- [Next.js Installation and System Requirements](https://nextjs.org/docs/app/getting-started/installation)
- [`docs/research-and-decisions.md`](../research-and-decisions.md)
