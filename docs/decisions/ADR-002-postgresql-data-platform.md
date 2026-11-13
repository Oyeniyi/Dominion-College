# ADR-002: PostgreSQL Data Platform (with SQLite/PostgreSQL-Compatible Local Execution)

- **Status:** Accepted (PostgreSQL logical schema with SQLite `node:sqlite` / Prisma-compatible local execution adapter approved for MVP; managed PostgreSQL for production)
- **Date:** 2026-11-10 (originally proposed 2026-10-27)
- **Decision owners:** Project Owner (approved 2026-11-10) and Technical Owner

## Context

The PRD models administrator accounts, news, albums, images, enquiries, and site settings, and recommends PostgreSQL with a maintained ORM or equivalent. It requires constraints, migrations, privacy controls, and backups. No implementation or expected usage/hosting profile exists.

## Drivers

- Relational integrity for content, authors, media metadata, settings, and enquiry records.
- Server-side validation and least-privilege operations.
- Supported database versions, manageable migrations, backups, and recovery.
- Provider fit for approved region, budget, operational ownership, and runtime connection behavior.

## Options

1. **Managed PostgreSQL:** Strong relational fit and aligns with the PRD. Provider, region, networking, pooling, backups, and cost need selection.
2. **SQLite/local file database:** Simpler operational setup but production persistence/concurrency/recovery must be demonstrated; differs from the PRD baseline.
3. **Managed integrated database platform with client APIs:** Can bundle features, but API exposure requires carefully reviewed RLS and increases platform-specific design.

## Proposed Decision

Use PostgreSQL as the provisional relational data store. Privileged access must be server-side. Choose a currently supported major and current minor release accepted by the selected managed provider. Select the provider and data-access layer only after data-location, connection/pooling, operations, budget, and team requirements are confirmed.

No ORM is selected by this ADR. Compare a maintained ORM, typed query builder, and parameterized SQL/driver against migration workflow, runtime connection pooling, type safety, generated-client needs, team familiarity, and provider support before adding a dependency.

## Consequences

- Database constraints and migrations can support the PRD's data-integrity requirements.
- A production service, credentials, backups, and upgrade procedure must be operated.
- PostgreSQL itself has a permissive license; managed database service costs are separate and plan/usage-dependent.
- Provider-specific connection strategies may differ between persistent and serverless runtimes.
- If direct client APIs are introduced, policies and RLS become a mandatory security design and verification concern.

## Risks and Uncertainties

- Data residency, privacy obligations, expected volume, retention, backup retention, RTO/RPO, and budget are unknown.
- Provider support for the latest database major and chosen runtime is unverified.
- No specific ORM/version or vulnerability advisory check has been selected.
- Database backups do not alone prove recovery; restoration must be tested.

## Related Requirements

PRD §8.2–8.3, §9.1–9.3, §14–15, §17–18; FR-04, FR-06–FR-09; NFR-04–NFR-06. Audit findings AUD-05, AUD-07–AUD-09, AUD-12, AUD-16–AUD-17.

## References

Research performed 2026-10-27:

- [PostgreSQL Versioning Policy](https://www.postgresql.org/support/versioning/)
- [PostgreSQL License](https://www.postgresql.org/about/licence/)
- [Supabase: Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres) (provider-specific connection guidance)
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod) (provider-specific security/operations checklist)
- [`docs/research-and-decisions.md`](../research-and-decisions.md)
