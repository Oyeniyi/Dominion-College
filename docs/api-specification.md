# API Specification

**Status:** Approved MVP contract (2026-11-10)  
**Version:** Version 1.0 (2026-11-10; updated from Proposal 0)  
**Authority:** Product behavior is governed by [`../prd.md`](../prd.md); system boundaries and flows by [`architecture.md`](./architecture.md); data handling by [`data-architecture.md`](./data-architecture.md); fields and constraints by [`database-schema.md`](./database-schema.md). Technology ADRs (`ADR-001`–`ADR-004`) and [`security-specification.md`](./security-specification.md) are approved for MVP execution as of 2026-11-10.

> **Owner Decisions Recorded (2026-11-10):**
> - **Editable Institutional Content (`FIND-02`, `FR-02`, `FR-03`):** Added `public.content.read` (`GET /api/v1/public/content`), `admin.content.read` (`GET /api/v1/admin/content`), and `admin.content.update` (`PATCH /api/v1/admin/content`) for structured About, Academics, and Admissions institutional content.
> - **Enquiry Contract (`FIND-03`, `FIND-06`, `FR-04`):** `privacyAcknowledged: true` is required and persisted; allowed `entryLevel` values are `Day Care`, `KG 1`, `KG 2`, `Nursery 1`, `Nursery 2`, `Primary 1`–`Primary 5`, `JSS 1`–`JSS 3`, `SSS 1`–`SSS 3`; optional `idempotencyKey` prevents duplicate creation on retry.
> - **Media Approval & Serving (`FIND-04`, `FR-07`):** `admin.gallery.images.upload` and `admin.gallery.images.update` include `schoolApproved`, `identifiableStudents`, and `approvalReference`. Public images are served only when `status = 'published'` and `schoolApproved = true`.
> - **Admin Authentication & Session (`FIND-05`, `FR-09`):** Added `admin.session.create` (`POST /api/v1/admin/session`) with rate limiting, HttpOnly session cookie, CSRF token protection (`x-csrf-token`), and active-account verification.

## 1. Interface Style and Scope

### Recommended style

Use a versioned, resource-oriented HTTPS/JSON interface for browser-to-server operations that cross the trust boundary: public enquiry submission and protected dashboard reads/writes. This is a fit for the MVP's small set of synchronous CRUD and query operations; it does not require a separate API service. Server-rendered public pages may call the same application read services directly rather than making loopback HTTP requests.

- **REST-like HTTP/JSON:** proposed for explicit browser-facing mutations and protected data operations. Use standard HTTP methods and status codes, JSON request/response bodies, and stable operation IDs below.
- **Internal interfaces:** application services for reads/mutations, authorization, persistence, and media orchestration. Their function signatures are implementation details, not a separately published API.
- **GraphQL:** not justified by current fixed public pages and dashboard needs; no client or query-composition requirement establishes its benefit.
- **RPC:** no need for a separate RPC protocol; ordinary HTTP resource operations fit.
- **Webhooks/events:** none required. There is no approved inbound webhook, email delivery, queue, or event-bus integration.
- **WhatsApp:** a visitor-initiated click-to-chat link, not an API call made by the application server.

Proposed base path: `/api/v1`. The path is not a decision to expose a general third-party API. Do not add a public API key or allow cross-origin use by default. Routes, representations, and values below are candidates to reconcile with the final framework and privacy/security design.

### Common protocol rules

- Production transport: HTTPS only (NFR-04). Request and response JSON use UTF-8 and `application/json`, except image upload requests, which use `multipart/form-data`.
- Do not return database rows directly. Return explicit public-safe or admin-safe representations; never serialize private fields into public responses.
- Use UTC ISO-8601 timestamps in responses. The configured publication timezone and interpretation of user-entered publication dates need school approval.
- Treat all client values, IDs, files, and pagination tokens as untrusted. Validate size, type, syntax, allowed values, ownership, and authorization on the server.
- Mutations must not claim success until their authoritative write completes. Never blindly retry a write with unknown outcome.
- Unknown methods return `405 Method Not Allowed` with an `Allow` header where supported. Unsupported media types return `415`; malformed JSON returns `400`.
- Responses containing sessions, admin data, enquiries, drafts, or private media must be `Cache-Control: no-store`. Public approved content may be cached only under a defined freshness and invalidation policy.
- This proposal does not define CORS. Same-origin browser use is the default. Cross-origin access requires an approved use case and explicit allowlist.

## 2. Shared Schemas

These are logical JSON shapes. Field length limits, rich-text representation, exact enum transitions, and exact school-approved entry-level values must be decided before implementation. All unknown properties should be rejected or ignored consistently; recommendation: reject them on mutations to detect client/schema drift.

### `EnquiryCreate`

```json
{
  "parentName": "string",
  "phone": "string",
  "email": "string|null",
  "entryLevel": "school-approved value",
  "message": "string|null",
  "privacyAcknowledged": true
}
```

- `parentName`, `phone`, and `entryLevel` are required; `email` and `message` are optional, subject to the final privacy notice/form design (PRD FR-04).
- `privacyAcknowledged` is required only if school-approved privacy/consent policy requires an acknowledgement. Its wording, legal meaning, recording, and retention are unresolved. The candidate database schema does not currently define an acknowledgement field; align it before implementation if evidence must be stored.
- Do not accept student name, identity documents, medical data, or other unnecessary sensitive information.

### `NewsArticleInput` and `NewsArticle`

Mutation input fields: `title` (required), `slug` (required), `excerpt` (optional), `body` (required), `featuredImageId` (optional UUID/null), `status` (candidate `draft|published|unpublished|archived`), `publishedAt` (optional timestamp), `seoTitle` and `seoDescription` (optional).

Admin representation adds `id`, `authorId`, `createdAt`, and `updatedAt`. Public representation is limited to `title`, `slug`, `excerpt`, sanitized/render-safe `body`, approved `featuredImage` projection, `publishedAt`, and approved SEO fields. It omits drafts, internal IDs where not needed, author/private metadata, and internal storage keys.

### `GalleryAlbumInput`, `GalleryImageInput`, and public media

- Album input: `title` (required), `slug` (required only if album routes are approved), `description` (optional), and candidate status.
- Image upload: multipart image file plus `altText` (required), optional `caption`, optional `albumId`, and optional non-negative `displayOrder`.
- Admin image representation may include internal `id`, `albumId`, `status`, `displayOrder`, `uploadedBy`, and timestamps. Do not expose `storageKey` or private object URLs.
- Public image projection includes an approved retrievable rendition URL or application media route, `altText`, and optional `caption`. The serving method and URL lifetime depend on the selected storage/delivery provider.
- Approved formats are limited to school-approved image formats (PRD examples: JPEG, PNG, WebP); actual byte limit, dimensions, processing, and malware/content checks must be decided and enforced server-side.

### `EnquiryAdmin`, `EnquiryStatusUpdate`, and `SiteSettings`

- `EnquiryAdmin`: `id`, `parentName`, `phone`, optional `email`, `entryLevel`, optional `message`, `status` (`new|contacted|resolved|archived`), optional `assignedTo`, `createdAt`, `updatedAt`. Admin-only.
- Status update: `{ "status": "contacted" }`; optional assignment update must be specified after role and lifecycle decisions. Assignment uses an admin UUID and must reject inactive/unavailable assignees.
- Settings mutation accepts only approved public school content: official name, logo reference, brand colors, telephone, email, WhatsApp number, address, office hours, social links, and default SEO fields. The precise editable-field allowlist and validation are school decisions. Never accept infrastructure secrets.

### Lists and pagination

List responses use `{ "items": [...], "nextCursor": "opaque|null" }`. Cursor contents are opaque, validated, and must not contain personal data. Order is deterministic, with a unique tie-breaker; public news sorts by `publishedAt DESC`, enquiries by `createdAt DESC`, gallery by configured display order then stable ID.

Cursor pagination is a recommendation, not an approved requirement. A proposed default page size is 20 and maximum 100; confirm these against expected use, performance targets, and implementation before shipping. Reject invalid cursors/page sizes with `400`. Do not include totals unless the relevant authorized query can calculate them safely and consistently.

## 3. Error Contract

Use a stable JSON error envelope for application errors:

```json
{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 422,
  "code": "VALIDATION_FAILED",
  "detail": "One or more fields need attention.",
  "fieldErrors": [
    { "field": "phone", "code": "INVALID_FORMAT", "message": "Enter a valid phone number." }
  ],
  "requestId": "non-sensitive-correlation-id"
}
```

`detail`, field messages, and `requestId` must not disclose stack traces, SQL, provider responses, credentials, or enquiry content. Omit `fieldErrors` when not applicable. Exact error strings are localized UI copy, not stable machine identifiers; clients should branch on HTTP status and `code`.

| HTTP | Stable code | Meaning |
|---|---|---|
| `400` | `INVALID_REQUEST` | Malformed JSON, invalid query/path syntax, or malformed cursor. |
| `401` | `UNAUTHENTICATED` | No valid authenticated session for a protected operation. |
| `403` | `FORBIDDEN` | Authenticated identity lacks permission or is inactive. |
| `404` | `NOT_FOUND` | Resource absent or intentionally concealed from caller. Do not reveal private resource existence. |
| `405` | `METHOD_NOT_ALLOWED` | Method is unsupported for the route. |
| `409` | `CONFLICT` | Slug uniqueness, invalid state transition, or conflicting update. |
| `413` | `PAYLOAD_TOO_LARGE` | Body/file exceeds approved limit. |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | Request content type or uploaded file format is not allowed. |
| `422` | `VALIDATION_FAILED` | Well-formed request violates field or business validation. |
| `429` | `RATE_LIMITED` | Abuse/rate control applied; include `Retry-After` when meaningful. |
| `500` | `INTERNAL_ERROR` | Unexpected internal error; disclose no internals. |
| `503` | `DEPENDENCY_UNAVAILABLE` | Required database, identity, or storage dependency is temporarily unavailable. |

Use `201 Created` for successful resource creation, `200 OK` for reads/updates returning a representation, `204 No Content` only for successful deletion/logout with no body, and `202 Accepted` only if a future approved asynchronous operation actually accepts work for later processing. Do not use success-shaped fallbacks on dependency failures.

## 4. Operations

All routes below are proposals. “Admin” means authenticated and authorized on every request by server-side policy; hiding a UI control is not authorization. Authentication provider, role model, and precise permissions remain unapproved. Unless stated otherwise, successful responses are JSON and failures use §3.

### Public reads and enquiry creation

| Operation ID | Purpose and proposed operation | Authentication / authorization | Request, response, and validation | Success / errors | Limits, pagination, logging | Requirements |
|---|---|---|---|---|---|---|
| `public.settings.read` | `GET /api/v1/public/settings` — approved public contact/brand/SEO settings. | None; return public allowlisted fields only. | No body. `200 SiteSettingsPublic`. Exclude unset/unapproved values and all secrets. | `200`; `500`, `503`. | Cache only approved public values under approved freshness policy. Log route/result class, not settings containing personal contact details unless necessary. | FR-02, FR-03, FR-05, FR-08, FR-10 |
| `public.news.list` | `GET /api/v1/public/news` — published article listing. | None; query must enforce `published` state. | Optional `cursor`, `limit`; `200 List<NewsArticlePublic>`. Validate cursor and proposed limit bounds. | `200`; `400`, `500`, `503`. | Bounded cursor pagination. Public cache only with unpublish invalidation/freshness rules. Do not log full response/body. | FR-06, FR-10, NFR-01, NFR-08 |
| `public.news.get` | `GET /api/v1/public/news/{slug}` — published article detail. | None; only published item may resolve. | Path `slug`; `200 NewsArticlePublic`. Validate canonical slug; absent, draft, or unpublished slug returns indistinguishable `404 NOT_FOUND`. | `200`; `404`, `400`, `500`, `503`. | Cache only public approved content with invalidation behavior. Do not log article bodies. | FR-06, FR-10 |
| `public.gallery.list` | `GET /api/v1/public/gallery` — published approved gallery images, optionally album-filtered. | None; query enforces image publication and applicable album visibility. | Optional `album`, `cursor`, `limit`; `200 List<GalleryImagePublic>`. Validate album and cursor; never return private keys/metadata. | `200`; `400`, `500`, `503`. | Bounded pagination. Do not log private image locations or identifying metadata. | FR-07, NFR-01, NFR-05 |
| `admissions.enquiry.create` | `POST /api/v1/admissions-enquiries` — persist public enquiry. | None; public abuse controls required. | `EnquiryCreate`; validate required fields, configured school-approved entry levels, contact formats, payload size, and privacy acknowledgement policy. `201` `{ "message": "Enquiry received." }`; do not return a record or private identifier. | `201`; `400`, `413`, `422`, `429`, `500`, `503`. Never report success before committed persistence. | Apply approved rate limit and abuse controls; exact threshold, duplicate handling, and idempotency policy are open. Do not log request body, phone, email, or message. | FR-04, §6.3, FR-09, NFR-04–NFR-06 |

### Session and dashboard

| Operation ID | Purpose and proposed operation | Authentication / authorization | Request, response, and validation | Success / errors | Limits, pagination, logging | Requirements |
|---|---|---|---|---|---|---|
| `admin.session.get` | `GET /api/v1/admin/session` — obtain current session's minimal identity/permission view. | Valid session; check local active state and role on server. | No body. `200 { "user": { "id", "displayName", "permissions" } }`; never expose identity tokens/subjects. | `200`; `401`, `403`, `500`, `503`. | `no-store`; log safe auth outcome only. | FR-09, NFR-04 |
| `admin.session.end` | `DELETE /api/v1/admin/session` — terminate current application session. | Valid session; CSRF protections if cookie-based. | No body. Invalidate server-side session where applicable and clear cookie. | `204`; `401`, `500`, `503`. | Rate-limit if needed to protect auth dependency; never log cookie/token. | FR-09, NFR-04 |
| `admin.dashboard.read` | `GET /api/v1/admin/dashboard` — overview counts and recent-enquiry summary. | Admin permission for dashboard; enforce authorization server-side. | Optional bounded `recentLimit`; `200` with actual persisted counts and admin-safe recent enquiries. No hardcoded/sample values. | `200`; `401`, `403`, `400`, `500`, `503`. | `no-store`; bounded recent list; do not log enquiry fields. | FR-09, NFR-01, NFR-04–NFR-05 |
| `admin.enquiries.list` | `GET /api/v1/admin/enquiries` — authorized enquiry review. | Explicit enquiry-read permission; do not assume all future admin roles can read these records. | Optional `status`, `cursor`, `limit`; `200 List<EnquiryAdmin>`. Validate allowed status/filter and pagination. | `200`; `401`, `403`, `400`, `500`, `503`. | `no-store`; bounded cursor pagination. Audit/log access only with minimized metadata; never log returned fields. | FR-04, FR-09, NFR-04–NFR-05 |
| `admin.enquiries.get` | `GET /api/v1/admin/enquiries/{id}` — retrieve one private enquiry. | Explicit enquiry-read permission. | UUID path; `200 EnquiryAdmin`. Validate identifier; absent and inaccessible records may share `404`. | `200`; `401`, `403`, `404`, `400`, `500`, `503`. | `no-store`; no PII in URL beyond opaque UUID; never log response. | FR-04, FR-09, NFR-04–NFR-05 |
| `admin.enquiries.update` | `PATCH /api/v1/admin/enquiries/{id}` — update permitted status (and assignment only if approved). | Explicit enquiry-update permission; revalidate assignee active/authorized if assignment is adopted. | `EnquiryStatusUpdate`; validate candidate status and approved transition. Atomic update of status/assignment and `updatedAt`. | `200 EnquiryAdmin`; `400`, `401`, `403`, `404`, `409`, `422`, `500`, `503`. | `no-store`; no idempotency guarantee until retry policy is decided; log safe change category only. | FR-04, FR-09, NFR-04–NFR-05 |

### Content, media, and settings administration

| Operation ID | Purpose and proposed operation | Authentication / authorization | Request, response, and validation | Success / errors | Limits, pagination, logging | Requirements |
|---|---|---|---|---|---|---|
| `admin.news.list` | `GET /api/v1/admin/news` — list drafts and all authorized article states. | Content-read permission. | Optional `status`, `cursor`, `limit`; `200 List<NewsArticleAdmin>`. Validate filters/cursor. | `200`; `400`, `401`, `403`, `500`, `503`. | Bounded pagination; `no-store`; do not log bodies/drafts. | FR-06, FR-09 |
| `admin.news.create` | `POST /api/v1/admin/news` — create draft/article. | Content-create permission. | `NewsArticleInput`; validate fields, slug uniqueness, allowed state; server sets author and timestamps. Do not allow direct creation as published unless explicit publish permission and approval rule are met. | `201 NewsArticleAdmin`; `400`, `401`, `403`, `409`, `413`, `422`, `500`, `503`. | No blind retries; idempotency key semantics require decision. Do not log content. | FR-06, FR-09, NFR-04 |
| `admin.news.update` | `PATCH /api/v1/admin/news/{id}` — edit article. | Content-update permission; publishing may require separate approval permission. | Partial `NewsArticleInput`; validate path/body, slug uniqueness, transitions, featured image eligibility; atomic write. | `200 NewsArticleAdmin`; `400`, `401`, `403`, `404`, `409`, `413`, `422`, `500`, `503`. | `no-store`; add ETag/conditional writes only if concurrency policy is approved. Do not log body. | FR-06, FR-09, NFR-04 |
| `admin.news.preview` | `POST /api/v1/admin/news/preview` — preview submitted article without publishing it. | Content-read/preview permission. | Unsaved `NewsArticleInput`; validate and apply the same safe rich-text rendering pipeline. Response is non-cacheable preview representation. Must not persist or be publicly addressable. | `200`; `400`, `401`, `403`, `413`, `422`, `500`, `503`. | `no-store`; do not log article body. Preview URL/token behavior is intentionally not proposed. | FR-06, FR-09, NFR-04 |
| `admin.news.delete` | `DELETE /api/v1/admin/news/{id}` — optional hard delete only if retention/permissions permit. | Explicit delete permission; must check references and policy. Archive/unpublish is preferred where sufficient. | UUID path; no body. Do not cascade-delete referenced images. | `204`; `401`, `403`, `404`, `409`, `500`, `503`. | No blind retry needed only if deletion semantics are idempotent and confirmed. Log safe resource/action metadata. | FR-06, FR-09, NFR-05 |
| `admin.albums.list` | `GET /api/v1/admin/gallery/albums` — manage albums. | Gallery-read permission. | Optional `status`, `cursor`, `limit`; `200 List<GalleryAlbumAdmin>`. | `200`; `400`, `401`, `403`, `500`, `503`. | Bounded pagination; `no-store`. | FR-07, FR-09 |
| `admin.albums.create` | `POST /api/v1/admin/gallery/albums` — create album. | Gallery-create permission. | `GalleryAlbumInput`; validate title, optional approved slug semantics, and candidate status. | `201 GalleryAlbumAdmin`; `400`, `401`, `403`, `409`, `422`, `500`, `503`. | Do not assume retry deduplication; no sensitive logs. | FR-07, FR-09 |
| `admin.albums.update` | `PATCH /api/v1/admin/gallery/albums/{id}` — edit album metadata/status. | Gallery-update permission; publication permission as separately approved. | Partial `GalleryAlbumInput`; validate status and its effects on child visibility. | `200 GalleryAlbumAdmin`; `400`, `401`, `403`, `404`, `409`, `422`, `500`, `503`. | `no-store`; audit policy unresolved. | FR-07, FR-09 |
| `admin.albums.delete` | `DELETE /api/v1/admin/gallery/albums/{id}` — remove grouping if policy permits. | Gallery-delete permission. | UUID path. Must not cascade-delete image metadata or object bytes; follow approved `SET NULL`/restrict behavior. | `204`; `401`, `403`, `404`, `409`, `500`, `503`. | No automatic object deletion. Log safe action metadata only. | FR-07, FR-09, NFR-05 |
| `admin.gallery.images.list` | `GET /api/v1/admin/gallery/images` — list all authorized image states. | Gallery-read permission. | Optional `albumId`, `status`, `cursor`, `limit`; `200 List<GalleryImageAdmin>`. | `200`; `400`, `401`, `403`, `500`, `503`. | Bounded pagination; `no-store`; no private object URLs in logs. | FR-07, FR-09 |
| `admin.gallery.images.upload` | `POST /api/v1/admin/gallery/images` — upload a private image and create metadata. | Gallery-upload permission; CSRF protections for cookie sessions. | Multipart file and `GalleryImageInput` metadata. Verify actual content, allowed format/size, metadata, and school-approval state; create non-public record/object first. Return admin metadata only after complete workflow. | `201 GalleryImageAdmin`; `400`, `401`, `403`, `413`, `415`, `422`, `500`, `503`. On partial failure, keep asset private and clean or reconcile orphan state. | Limit size and upload rate using approved thresholds; no file contents, student metadata, or object credentials in logs. Idempotency and upload retry protocol need provider/design decision. | FR-07, FR-09, NFR-04–NFR-05 |
| `admin.gallery.images.update` | `PATCH /api/v1/admin/gallery/images/{id}` — change caption, alt text, album, order, or status. | Gallery-update permission; publish permission plus verified school authorization for identifiable images. | Partial `GalleryImageInput`; validate parent, status, non-negative order, and approval precondition. Cannot update storage key via client. | `200 GalleryImageAdmin`; `400`, `401`, `403`, `404`, `409`, `422`, `500`, `503`. | `no-store`; no private media URL/body in logs. | FR-07, FR-09, NFR-04–NFR-05 |
| `admin.gallery.images.delete` | `DELETE /api/v1/admin/gallery/images/{id}` — remove or delete image. | Explicit delete permission; check article references and retention/permission rules. | UUID path. If referenced, return conflict until references are cleared. Database and object deletion cannot be atomic; use a reviewed private-first removal/cleanup workflow. | `204`; `401`, `403`, `404`, `409`, `500`, `503`. | Do not claim byte erasure until storage deletion and cache handling are confirmed. Log safe action metadata only. | FR-07, FR-09, NFR-05–NFR-06 |
| `admin.settings.read` | `GET /api/v1/admin/settings` — read editable approved public settings. | Settings-read permission. | No body; `200 SiteSettingsAdmin`, excluding secrets. | `200`; `401`, `403`, `500`, `503`. | `no-store`; do not log field values. | FR-08, FR-09 |
| `admin.settings.update` | `PATCH /api/v1/admin/settings` — update allowlisted settings. | Settings-update permission; approved values only. | Partial settings object; validate phone/email/URL schemes, structured colors/social links, and bounds; update atomically. | `200 SiteSettingsAdmin`; `400`, `401`, `403`, `422`, `500`, `503`. | `no-store`; no secrets or settings values in logs. Cache invalidation for public settings must be defined. | FR-02, FR-03, FR-05, FR-08–FR-09, NFR-04 |

No separate image-fetch endpoint is specified: public media serving depends on whether the selected object store supports safe public renditions or the application must proxy them. Do not return a provider URL or assume a presigned-URL capability until ADR-004 is accepted and provider behavior is verified.

## 5. Authentication, Authorization, and Abuse Controls

- Authentication provider and session implementation are undecided (ADR-003 is Proposed). Do not implement local password handling, OAuth/OIDC flows, token formats, or login endpoints by assumption.
- A selected provider's browser redirect/callback and logout requirements must be documented as part of the accepted identity design. Any callback must validate protocol state/nonce and exact redirect destinations as appropriate to the chosen protocol.
- For cookie-backed sessions, require secure, HttpOnly, SameSite-appropriate cookies, expiration and invalidation, CSRF defenses on state-changing requests, and origin checks where appropriate. Final cookie attributes and CSRF mechanism depend on the accepted framework/security design.
- Authentication does not imply authorization. Check active local admin state and permission for every route, object, operation, and media access; fail closed if identity or policy cannot be verified.
- Public enquiry and sign-in surfaces must have abuse controls/rate limiting per NFR-04. Thresholds, shared limiter backend, trusted proxy/IP interpretation, retention, and user-facing retry behavior are not defined; approve and test them before launch. Do not trust arbitrary forwarded-IP headers.
- Use generic authentication errors that do not disclose whether an account exists. Never log credentials, cookies, tokens, full enquiry data, student identifiers, raw provider payloads, or private media URLs.
- No unauthenticated upload, public listing of private resources, wildcard CORS, or client-held privileged credentials.

## 6. External Integrations and Dependencies

There are no approved API vendors or external server integrations. The following are integration boundaries, not claims that a provider or capability has been selected.

| Integration | Purpose and interface | Authentication/data | Timeout, retry, limits, and failure behavior | Version/dependency risk |
|---|---|---|---|---|
| Identity provider or auth library | Admin authentication and session verification; provider flow is not selected. | Provider-specific secrets remain server-side. Transmit only the minimum identity claims needed; local authorization/active status remains enforced. | Provider-dependent timeouts and retry semantics must be documented after selection. Fail protected requests closed when identity cannot be verified; do not retry mutations blindly. | Provider, supported protocol/library versions, deprecations, and advisories must be researched before ADR acceptance. |
| Relational database | Persist enquiries, content, settings, and identity references. | Server-only least-privilege connection; no database access from browser. | Public/admin operations have bounded request timeouts to be chosen with hosting. Reads may fail safely; writes report failure/unknown outcome honestly. Do not add automatic write retries without idempotency rules. | PostgreSQL is only proposed (ADR-002); provider/version/driver/ORM and compatibility unverified. |
| Object/image storage | Store uploaded image bytes and serve approved renditions. | Server-managed credentials; uploads private pending validation/approval. Browser-direct upload, public ACLs, signed URLs, transformation, and deletion guarantees are not assumed. | File/body limits, operation timeouts, retry/cleanup, malware checks, rendition availability, and failure reconciliation depend on selected service. Any failure must leave image unavailable publicly. | Provider and version are not selected (ADR-004); verify access-control, lifecycle, regional, and deletion behavior before approval. |
| WhatsApp click-to-chat | Allow visitor-initiated navigation to contact the school. | Construct link from verified configured number; visitor may send their own message directly to WhatsApp. No server API credentials or message-body transfer from server are needed. | No application timeout/retry or delivery acknowledgement. If number/configuration is absent or invalid, omit/disable the link safely and retain the website enquiry option. | External URL format and behavior may change; verify against current official WhatsApp documentation at implementation/release. Never claim delivery or read status. |
| Optional email, analytics, maps, SMS, marketing | None in MVP. | No data transfer authorized. | Do not call or configure these services unless purpose, fields, access, failure, retention, and consent/privacy impact are approved. | Adding any requires an updated data flow, security/privacy review, dependency research, and governance approval. |

For each selected provider/library, record supported version, authentication, documented request limits, timeout behavior, retry safety, relevant security advisories, and source/date in the accepted ADR or integration record. This document does not invent provider capabilities or numeric service limits.

## 7. Consistency with Data and Architecture Documents

- Public news/gallery endpoints must enforce publication state and return only public-safe projections (FR-06–FR-07; data-architecture §§3, 6; database-schema §§4.2–4.4).
- Enquiry creation is synchronous and returns success only after persistence commits; admin access is private; optional notification is not part of MVP (FR-04; architecture §6; data-architecture §3; database-schema §4.5).
- Article, gallery, enquiry, and settings writes follow the candidate schema fields and relationships in `database-schema.md`; actual field lengths, entry-level values, role model, transition rules, and retention remain unsettled.
- Media database and object-store writes are not atomic together. Upload remains private until validation, approval, and publication succeed; no public reference to incomplete media.
- The candidate `site_settings` schema uses a singleton row. This contract does not create generic settings, secret storage, or a new table.
- **Known unresolved alignment:** PRD FR-04 may require privacy acknowledgement where applicable, while the candidate enquiry schema has no acknowledgement field. Decide whether to store evidence and harmonize schema/API/privacy notice before implementation.
- The proposed [`security-specification.md`](./security-specification.md) is available as a reference only and is pending formal approval. This API proposal does not replace a threat model or an approved security baseline.

## 8. Open Contract Decisions

1. Approve the API surface, base path, resource representations, route names, and whether server-rendered reads use direct internal services or HTTP.
2. Select authentication/session provider and define admin roles, permissions, account lifecycle, CSRF defenses, and login/callback behavior.
3. Approve privacy notice and acknowledgement requirements; decide whether and how acknowledgement evidence is stored and retained.
4. Approve exact enquiry fields, validation/length limits, entry-level values, duplicate handling, retry/idempotency behavior, retention, export, and deletion.
5. Define article/gallery status transitions, publication approval, school authorization evidence for identifiable student images, and unpublish/cache propagation.
6. Decide upload limits, supported formats, content inspection, image processing, public-delivery model, timeout/retry/cleanup rules, and object deletion guarantees with a selected provider.
7. Approve pagination protocol and bounds, concurrency/conflict behavior (including any ETag/versioning), and rate-limit thresholds/backing service.
8. Define settings editor allowlist and validation, album route/slug behavior, deletion permissions, API localization, and public cache freshness.
9. Select database, identity, hosting, storage, and monitoring providers/versions; verify compatibility and security advisories from primary sources before implementation.

## 9. Machine-Readable Contract

An OpenAPI 3.x companion is recommended once routes, field limits, auth schemes, status transitions, and provider-independent upload semantics are approved. Generating it now would falsely make unresolved proposals appear normative. When created, keep operation IDs exactly as listed here, validate the document in CI, and ensure the OpenAPI schemas and examples exclude real personal/school-sensitive data.

## 10. Traceability and Approval

| API concern | Traceability |
|---|---|
| Public approved content and settings | PRD FR-02, FR-03, FR-05–FR-08, FR-10 |
| Admissions form create and private review | PRD FR-04, FR-09, §6.3 |
| Dashboard and content/media/settings operations | PRD FR-06–FR-09 |
| Authentication, authorization, abuse, safe errors | PRD NFR-04 |
| Data minimization, privacy, children/media restrictions | PRD NFR-05, §12 |
| Dependency failures and persistence behavior | PRD NFR-06 |
| Pagination, performance, public discovery | PRD NFR-01, NFR-08 |
| Proposed storage and identity boundaries | ADR-002, ADR-003, ADR-004 — all Proposed |

The project backlog defines TASK-001–TASK-034 in [`tasks.md`](./tasks.md). This specification documents a proposed contract; it does not approve changes to product scope, architecture, privacy policy, or vendors. Obtain the relevant school/project-owner approvals before implementation.
