# Dominion College Website — Product and Interface Design

**Status:** Design handoff proposal; not an approved brand guide or implementation  
**Scope:** MVP public website and protected administration dashboard  
**Authority:** Product behavior and acceptance criteria are governed by [`../prd.md`](../prd.md). System boundaries are governed by [`architecture.md`](./architecture.md); private-data handling by [`security-specification.md`](./security-specification.md) and [`data-architecture.md`](./data-architecture.md); the proposed browser/server contract is [`api-specification.md`](./api-specification.md). Technology and vendor ADRs remain proposed.

> The repository contains no implemented frontend, component library, CSS/theme tokens, or approved visual identity guide. The only supplied visual asset is [`../images/dominion_logo.jpg`](../images/dominion_logo.jpg). This document defines interaction and layout direction, not official brand colors, fonts, or production copy. Numeric scales below are implementation starting points for review, not approved identity decisions.

## 1. Product and experience goals

The experience has two separate surfaces:

1. **Public information and admissions:** help visitors understand verified school information, locate admissions/contact options, and submit a minimal enquiry.
2. **Protected administration:** allow authorized staff to manage approved content and private enquiries without exposing unpublished material or personal data.

Design priorities, in order:

- Make Admissions and Contact straightforward to find, especially on a phone.
- Keep school facts, contact details, and photographs authentic and school-approved.
- Make public content readable, navigable, accessible, and discoverable.
- Make admin tasks direct and predictable, with safe publishing and destructive-action boundaries.
- Communicate submission and persistence outcomes accurately; never imply success when the server has not confirmed it.
- Keep private records, drafts, and unapproved media out of public views, URLs, caches, and public search.
- Avoid decorative complexity, fabricated social proof, intrusive pop-ups, and unnecessary motion.

## 2. Users, journeys, and interaction patterns

| User group | Goals | Main journey | Design implications |
|---|---|---|---|
| Prospective parent or guardian | Understand the school's verified identity and offering; find admissions requirements/contact options; ask a question. | Search/shared link → Home → About or Academics → Admissions → enquiry form or visitor-initiated WhatsApp. | Admissions CTA is prominent and repeated contextually; short pages and clear headings; mobile-first forms; only confirmed entry-level options and facts. |
| Existing school community member (parents, students, staff, others) | Find official announcements, school-life photographs, and contact information. | Home or direct search result → News/article or Gallery → Contact. | News and gallery are easy to scan; public content is clearly dated and keyboard-operable; no community login or student portal is implied. |
| Authorized administrator/content manager | Publish or correct public content; manage images; review enquiries; update approved settings. | Sign in → Overview → relevant work area → edit/preview → publish or update → sign out. | Clear task navigation, unsaved-change handling, empty states that guide the next action, server-confirmed feedback, and destructive-action confirmation. |
| School management/content approver | Ensure public claims, contact details, policies, and student media are approved. | Review source material and approve it through a school-defined process; publish only when the required approval exists. | The interface must not imply that a CMS status proves school approval. The approver role, evidence, and workflow need school decisions. |
| Admissions representative | Review a private enquiry, follow up through an approved channel, and update its status. | Authorized enquiry list → record detail → contact/follow-up outside the site → status update. | Restrict enquiry access by server-side permission; do not expose personal data in dashboards beyond operational need; status values follow the approved lifecycle. |

### Journey summaries

**Prospective parent**

```text
Search / shared link
  → Home (school identity, clear Admissions action)
  → About / Academics / Gallery / News as needed
  → Admissions (verified process + entry levels + privacy notice)
  → Submit enquiry ──→ confirmation only after save is confirmed
       or WhatsApp ──→ visitor leaves site; delivery is not confirmed
```

**Administrator**

```text
Admin sign-in (selected identity flow)
  → Overview
  → News / Gallery / Enquiries / Website content / Settings
  → edit → validate → preview where applicable → publish/update
  → explicit success or actionable failure
  → sign out / session expires
```

**Admissions enquiry**

```text
Visitor fills minimum fields → client feedback → server validation + abuse controls
  → committed record → success confirmation
  → authorized staff review → follow-up → status update

Validation / rate limit / dependency failure → explain safely; no false success
```

## 3. Information architecture and navigation

### Sitemap and content relationships

```text
Public website
├── Home
├── About
│   ├── Overview
│   └── Mission / vision / values / leadership (only where supplied and approved)
├── Academics
│   ├── Junior secondary (only if confirmed)
│   └── Senior secondary (only if confirmed)
├── Admissions
│   └── Enquiry form
├── News & Updates
│   └── Published article (stable slug; optional related published articles)
├── Gallery
│   └── Optional album / accessible image viewer
├── Contact Us
├── Privacy Notice
└── Not found (P1 custom 404)

Administration (protected; not indexed)
├── Sign in / session controls
├── Overview
├── News
│   ├── List by status
│   ├── Create / edit
│   └── Preview
├── Gallery
│   ├── Images / optional albums
│   └── Upload / edit metadata / publish / remove
├── Admissions enquiries
│   ├── Filtered list
│   └── Enquiry detail / status update
├── Website content (About, Academics and other approved editable areas)
├── Website settings (approved public contact and SEO fields)
└── Account / session controls
```

Public pages relate through approved settings, published news, and published gallery media. A news article may reference a featured image; a gallery image may optionally belong to an album. Admissions enquiries are separate private records and must not appear in public content relationships.

### Navigation rules

**Public header**

- Show the supplied school logo without changing its proportions or artwork.
- Use concise links: Home, About, Academics, Admissions, News, Gallery, Contact.
- Visually distinguish the primary Admissions action without relying on color alone.
- If WhatsApp is configured and valid, show a labeled contact action; keep the enquiry form as an available alternative.
- On narrow screens, use a menu button with an accessible name and expanded state. The menu opens/closes by keyboard and touch, closes on Escape, and returns focus to the trigger when dismissed.

**Public footer**

- Repeat high-value links, approved contact routes, privacy notice, and approved social links.
- Omit unset or unapproved data rather than rendering guessed values or broken links.

**Admin navigation**

- Use a distinct, task-oriented navigation shell with Overview, News, Gallery, Enquiries, Website content, Settings, and Account/session controls.
- Mark the current location semantically and visually; do not rely on color alone.
- A single administrator role may be sufficient for the MVP, but the menu is not an authorization mechanism. The server must authorize every request. Future role-specific navigation reflects approved permissions only.
- Never show enquiry contents, draft details, or private counts on a public screen.

**Location and recovery**

- Use page titles and a clear current-section indicator; use breadcrumbs on nested article/image/enquiry editing views where useful.
- Unknown public paths show the custom 404 when available and provide links to Home, Admissions, and Contact.
- Unknown or inaccessible private records use the approved safe not-found behavior; do not reveal record existence.

## 4. Visual system and reusable components

### Brand and asset constraints

- **Approved Brand Asset & Motto (2026-11-10):** [`../images/dominion_logo.jpg`](../images/dominion_logo.jpg) is the approved school crest. Per Project Owner decision (2026-11-10), the official motto displayed in brand lockups is `"THE SECERET OF WISDOM IS GOD"` (matching the supplied crest artwork), and the color branding is derived from the crest:
  - `color.brand.primary`: `#5B1A69` (Dominion Royal Purple)
  - `color.brand.primary-dark`: `#3B0F47` (Deep Plum)
  - `color.brand.secondary`: `#7A288C` (Orchid Purple)
  - `color.brand.accent`: `#D97706` (Torch Flame Gold / Amber)
  - `color.brand.accent-light`: `#FEF3C7` (Warm Gold Tint)
  - `color.brand.on-primary`: `#FFFFFF`
- **Placeholder Image Policy (2026-11-10):** Per Project Owner instruction, non-identifying SVG/visual placeholder images are approved where school photography is not yet supplied, and must be tagged internally with `contentStatus: "placeholder"` (`prd.md` §8.1) so administrators can replace them before public production cutover.
- Do not use fabricated school facts, results, awards, testimonials, statistics, or unapproved identifiable student imagery.

### Token model

Use semantic tokens so approved brand values can be mapped once and reused. Values marked **TBD** require brand-owner approval; do not substitute guessed hex values.

| Token family | Semantic tokens / purpose | Value status |
|---|---|---|
| Brand | `color.brand.primary`, `color.brand.secondary`, `color.brand.accent`, `color.brand.on-primary` | TBD from approved brand guide/assets; contrast-test each pairing. |
| Neutrals | `color.canvas`, `color.surface`, `color.surface-muted`, `color.text-primary`, `color.text-secondary`, `color.border`, `color.focus` | Select neutral values during visual review; maintain readable contrast. |
| Status | `color.success`, `color.warning`, `color.error`, `color.info`, and corresponding `on-*` values | Semantic colors must be distinguishable in text/icon/border as well as color. |
| Typography | `font.body`, `font.heading`, `font.mono` (only when useful) | Family and licensing TBD; choose after brand review. Use robust system fallbacks until then. |
| Type scale | `type.caption`, `type.body-sm`, `type.body`, `type.body-lg`, `type.h4`, `type.h3`, `type.h2`, `type.h1`, `type.display` | Proposed sizes: 12, 14, 16, 18, 20, 24, 32, 40, 48 CSS px respectively; test actual font metrics and responsive wrapping. |
| Spacing | `space.1` through `space.16` on a 4px base | Proposed scale: 4, 8, 12, 16, 24, 32, 40, 48, 64px; use consistently, not as a requirement to use every step. |
| Shape / elevation | `radius.control`, `radius.card`, `radius.dialog`, `shadow.card`, `shadow.overlay` | Keep restrained and consistent; exact values to be set in component design. |
| Motion | `motion.fast`, `motion.standard`, `motion.reduced` | Subtle feedback only; honor `prefers-reduced-motion`. Do not animate layout or essential information. |

**Color rules:** body text contrast target is at least 4.5:1; large text and meaningful non-text controls at least 3:1 against adjacent colors. Disabled text still needs to remain understandable. Never use color as the only indication of status, selection, or error.

### Layout and responsive behavior

Proposed CSS viewport bands (review with implementation; they are not framework or brand decisions):

| Band | Viewport | Layout guidance |
|---|---:|---|
| Small mobile | `< 640px` | Single column, compact header/menu, full-width primary actions and form controls where appropriate, no hover dependency, avoid dense tables. |
| Large mobile / small tablet | `640–767px` | Keep one-column reading flow unless a short form/content pair remains readable; allow cards to form a two-column grid only when content fits. |
| Tablet | `768–1023px` | Adapt navigation and admin shell to available width; use two-column content only where hierarchy remains clear; tables may scroll within a labeled region. |
| Desktop | `1024–1279px` | Full public navigation; admin side navigation and main work area where useful; use bounded content widths. |
| Wide desktop | `≥ 1280px` | Center content within a proposed maximum width of 1200px; do not stretch long text across the full viewport. |

- Proposed page gutters: 16px small mobile, 24px tablet, 32px desktop; verify against actual logo/header and form widths.
- Keep long-form copy around 60–75 characters per line where feasible; article body may use a narrower measure than galleries or admin tables.
- Reflow content at zoom and narrow widths without horizontal page scrolling. Data tables may have a contained horizontal-scroll fallback with an accessible label.
- Avoid fixed/sticky UI that obscures page content, keyboard focus, browser zoom, or form errors.
- Prefer fluid images with intrinsic aspect ratio and reserved space to reduce layout shift.
- Breakpoints and measures are proposals; responsive acceptance is behavior-based, not device-model-specific.

### Component inventory and behavior

| Component | Recommended behavior and states |
|---|---|
| Buttons / links | Distinguish navigation links from actions. Provide default, hover, active, focus-visible, disabled, and loading states. Keep a single clear primary action per form/section. Do not shift layout on hover/press. |
| Public and admin navigation | Semantic `<nav>` with a meaningful label; expose current page; mobile menu exposes expanded/collapsed state and supports Escape/focus return. |
| Cards | Use for news, gallery previews, and dashboard summaries only where they improve scanning. Avoid nested card containers. Whole-card links need a clear accessible name. |
| Forms | Persistent visible labels, required/optional indicators, concise hints, inline errors linked to fields, and a linked error summary on failed multi-field submit. Native input semantics and autocomplete where appropriate. |
| Tables / lists | Use semantic tables for genuinely tabular data, with header cells and row context; use responsive card/list presentation only when labels remain clear. Provide bounded pagination and explicit empty results. |
| Filters / search | Label each control; distinguish active filters; provide a clear/reset action; preserve filters while paging. No internal search feature is required unless separately approved. |
| Dialogs | Use only for consequential decisions or focused media viewing. Provide a title, clear cancel/confirm actions, initial focus, focus containment, Escape behavior where safe, and focus return. Never use a dialog as the sole way to disclose critical privacy information. |
| Notifications | Inline confirmation/error adjacent to the task is authoritative. Toasts may supplement transient non-critical success, but not replace field errors or a persistent result state. Announce appropriate updates without stealing focus. |
| Loading | Use skeletons for stable content regions when helpful; use labeled progress indicators for mutations. Keep layout stable and announce long-running actions. Do not expose stale private data during loading. |
| Empty states | Explain what is absent and the next permitted action. Public empty states remain polished and do not display admin actions. Never use fake/sample records to fill them. |
| Confirmation / destructive action | Identify the target and consequence. Require explicit confirmation for delete, archive where irreversible, publish/unpublish changes affecting public visibility, and session-ending action only where necessary. Prefer reversible unpublish/archive when policy permits. |
| Gallery viewer | Accessible dialog or dedicated page, named close/previous/next controls, keyboard support, caption/alt text, focus management, and no swipe-only interaction. Respect reduced motion. |

## 5. Screen specifications

### Shared state conventions

All screens use these conventions unless the screen below defines additional behavior:

- **Loading:** show a non-deceptive loading state; prevent duplicate submits while a mutation is in progress; do not display invented data.
- **Empty:** explain the empty condition and next step. Public pages omit missing facts/content rather than inventing it. Admin empty states may offer an authorized creation action.
- **Error:** distinguish validation, access/session, not-found, conflict, rate-limit, and dependency failures. Provide safe, actionable copy and a retry path only when retry is safe. Never expose stack traces, provider/database details, or enquiry content in error messages.
- **Success:** confirm only after the operation is persisted/confirmed. Keep an inline result for meaningful actions; a transient notification alone is insufficient for enquiry submission or publish state.
- **Permissions:** enforce server-side on every protected read/write/media operation. Hiding a link or disabling a control does not grant security.
- **Responsive:** adapt navigation, grids, controls, and tabular data to reflow at the viewport bands in §4. Do not require hover.

### Public screens

#### Home

- **Purpose / user:** introduce the school and quickly direct prospective parents to Admissions; also provide community routes to news and gallery.
- **Content:** approved logo and hero image, short verified introduction, approved institutional/academic highlights, published news and gallery previews, admissions CTA, approved contact links and footer navigation.
- **Actions:** navigate to core pages; open a published news article/gallery image; open configured WhatsApp link; proceed to Admissions.
- **Inputs / validation:** none. All linked content and settings must be approved and public-safe.
- **Permissions:** anonymous access to published/approved content only.
- **States:** no news/gallery means omit or show a concise designed empty module; unavailable module must not break the rest of the page. Loading/failure affects only the dependent region where possible. Do not use fabricated statistics/testimonials.
- **Responsive:** admissions CTA and key introduction visible early; hero crop preserves meaningful subject; previews reflow to one column on small screens; avoid large hero imagery that pushes all useful navigation below the fold.

#### About

- **Purpose / user:** provide approved identity and institutional information for parents and community members.
- **Content:** verified official name, introduction, history, mission, vision, motto, values, leadership, and approved photographs only where supplied.
- **Actions:** navigate to Academics, Admissions, Contact, and related public information.
- **Inputs / validation:** none. Missing optional fields are omitted publicly and flagged for authorized editors in the CMS.
- **Permissions:** public sees approved published fields; editing is admin-only.
- **States:** no blank section headings; unavailable optional sections are omitted. No public placeholder text or invented claims.
- **Responsive:** long-form reading measure, logical heading hierarchy, images with meaningful alternatives where needed.

#### Academics

- **Purpose / user:** explain the school's verified educational offering.
- **Content:** confirmed levels, subjects/groupings, curriculum/examinations, approach, facilities, extracurricular programmes, and associated approved images.
- **Actions:** follow relevant approved internal links and proceed to Admissions.
- **Inputs / validation:** none. The school must confirm every offering before publication.
- **Permissions:** only approved content publicly visible; authorized staff may edit designated content.
- **States:** omit unconfirmed fields and empty categories. Never imply a programme/facility exists solely because it appears in a proposed schema.
- **Responsive:** subject/programme groupings scan on narrow screens; use clear section labels, not dense multi-column text.

#### Admissions and enquiry form

- **Purpose / user:** primary conversion screen for prospective parents/guardians.
- **Content:** approved introduction, entry-level options, requirements/process/application instructions when confirmed, Admissions contact options, privacy notice link, and enquiry form.
- **Actions:** submit an enquiry; open verified WhatsApp link; call/email if approved and available; read privacy notice.
- **Inputs:** parent/guardian name (required), phone (required), school-approved entry level (required), email (optional), message (optional), privacy acknowledgement only if school policy requires it.
- **Validation:** client and server both validate required fields and contact formats; normalize phone appropriately; validate entry level against approved options; enforce server-side size limits; do not request student identity, medical details, documents, or unnecessary personal data. Exact field limits and acknowledgement wording/storage are unresolved.
- **Submit interaction:** show pending state and prevent repeat activation while request is in flight. Submission uses the proposed `admissions.enquiry.create` contract; show confirmation only on confirmed persistence. Do not return or display a private enquiry identifier.
- **States:** inline field errors and a focused linked error summary after invalid submission; retain safe entered values after validation or transient failure; rate-limit state explains when to retry without exposing abuse controls; database/dependency failure clearly states the enquiry was not confirmed and offers the approved alternative contact channel. If outcome is uncertain, do not claim success or blindly resubmit.
- **Permissions:** public submission; stored data available only to explicitly authorized admin users. No data in analytics, URLs, or logs.
- **Responsive:** one-column form on phones; appropriately typed/autocomplete fields; comfortable controls; keyboard and screen-reader operation; avoid sticky bars obscuring errors or submit action.

#### News listing

- **Purpose / user:** let visitors scan published announcements.
- **Content:** published article title, date, summary, optional featured image, and link; optional related/public content.
- **Actions:** open article; move between bounded result pages.
- **Inputs / validation:** optional cursor/limit controlled by the contract, not arbitrary client values; no required search/filter in MVP.
- **Permissions:** anonymous, published items only. Exclude drafts/unpublished items in the public query itself.
- **States:** clear no-articles empty state; loading; safe dependency error with retry when safe; end-of-list/pagination state. Draft or missing slugs must resolve as not found.
- **Responsive:** cards/list reflow without title truncation; dates remain understandable; images retain aspect ratio.

#### News article

- **Purpose / user:** present one published announcement in a readable, shareable page.
- **Content:** title, publication date, summary/body, optional approved featured image and related published articles, metadata.
- **Actions:** navigate back to news, follow valid internal links, share via browser affordance if available.
- **Inputs / validation:** URL slug is validated server-side; rich text is sanitized before render and links use safe schemes.
- **Permissions:** public only when article is approved and published; draft/unpublished and inaccessible slugs return the same not-found experience.
- **States:** loading, not found, and safe dependency failure; never expose a draft preview from a public URL.
- **Responsive:** readable article measure, semantic headings/lists, image alternatives and captions, no horizontal overflow.

#### Gallery

- **Purpose / user:** show approved school-life photographs to prospective parents and the community.
- **Content:** published and school-authorized images, meaningful alt text, optional caption/album, optimized rendition.
- **Actions:** open an image in a keyboard-accessible viewer; navigate gallery items; optionally filter by approved album if album UX is confirmed.
- **Inputs / validation:** album filter and pagination only if supported by the final contract; validate query state.
- **Permissions:** anonymous access only to approved, published media; original/private keys and unpublished images are inaccessible.
- **States:** designed empty gallery; per-image unavailable fallback; loading; safe dependency failure. Publication state alone is not proof of permission for identifiable minors.
- **Responsive:** fluid image grid with stable aspect ratio; meaningful source order; viewer controls work by keyboard, touch, and assistive technology; no gesture-only action.

#### Contact

- **Purpose / user:** give visitors verified means to reach the school.
- **Content:** only approved address, telephone, email, WhatsApp, office hours, social links, and map/directions link when verified.
- **Actions:** `tel:`/`mailto:` links when valid; configured WhatsApp click-to-chat; optional verified directions link; Admissions route.
- **Inputs / validation:** none. Contact settings are validated by the server/admin editor.
- **Permissions:** public approved fields only.
- **States:** omit missing/unverified values; if WhatsApp is absent or invalid, retain the website enquiry route and do not substitute a guessed number.
- **Responsive:** simple vertical contact list on small screens; map is not embedded by default because maps are not approved integration; external destinations are clearly identified.

#### Privacy Notice

- **Purpose / user:** explain enquiry data collection and use before a parent submits.
- **Content:** school-approved notice, purpose, data handling, retention/contact process, and any required acknowledgement wording.
- **Actions:** return to Admissions; follow approved privacy contact route if provided.
- **Inputs / validation:** none.
- **Permissions:** publicly available; only approved text is published.
- **States:** launch is blocked until the school approves the notice and any applicable acknowledgement policy. Do not show boilerplate as if it were legal approval.
- **Responsive:** readable long-form page with a contents/navigation aid only if the final length warrants it.

#### Not found (P1)

- **Purpose / user:** recover from an invalid public URL or unavailable article.
- **Content:** brief not-found message and real links to Home, Admissions, News, and Contact.
- **Actions:** navigate to a valid page.
- **Inputs / validation:** none; unknown route returns proper not-found behavior.
- **Permissions:** public; private resource absence must not be distinguishable from inaccessible state.
- **States:** include no technical detail or private identifier.
- **Responsive:** same public shell and visible recovery actions on mobile.

### Administration screens

Admin screen descriptions are subject to approval of identity provider, role/action matrix, publication workflow, and account lifecycle. The interface must fail closed if session or authorization cannot be verified.

#### Sign in and session controls

- **Purpose / user:** let an approved administrator authenticate and end their session.
- **Content:** school identity, sign-in action provided by the selected auth design, safe account-support route only if approved.
- **Actions:** begin selected sign-in; sign out; reauthenticate after session expiry.
- **Inputs / validation:** provider-specific only after ADR-003 and account lifecycle approval. Do not assume password login, password reset, MFA, SSO, or a particular provider.
- **States:** generic authentication failure that does not reveal whether an account exists; loading; identity dependency unavailable; expired/revoked/disabled account denied. Do not expose raw provider errors.
- **Permissions:** no dashboard data before valid active identity and server-side authorization.
- **Responsive:** single-column, keyboard-first sign-in; browser password managers/paste must work if password auth is selected.

#### Dashboard overview

- **Purpose / user:** orient an authorized administrator to actual content and enquiry workload.
- **Content:** persisted counts for published/draft news, gallery items, new enquiries, and recent authorized enquiries; quick actions.
- **Actions:** open a work area or permitted create flow.
- **Inputs / validation:** optional bounded recent-item limit only if accepted API contract supports it.
- **Permissions:** dashboard permission; enquiry summaries require explicit enquiry-read permission and should be omitted if not granted.
- **States:** zero-value metrics are legitimate; show useful empty instructions; loading and dependency failure must not be replaced by hardcoded sample values.
- **Responsive:** summary cards stack or reflow; recent-enquiry detail is minimized; do not expose unnecessary personal data in cards.

#### News management list

- **Purpose / user:** find and manage articles in authorized states.
- **Content:** title, status, publication date, updated date, and only the metadata needed to manage the item.
- **Actions:** create, edit, preview, publish/unpublish, archive/delete only where permitted; filter by status and paginate.
- **Inputs / validation:** allowlisted status filter and opaque cursor/approved page size; preserve filter while paging.
- **Permissions:** content-read/create/update and publication/delete permissions are separate policy capabilities even if one MVP admin role holds them.
- **States:** empty collection offers create action; no filter match offers clear-filter action; conflict/stale edit asks the user to reload/reconcile; loading/error states follow shared conventions.
- **Responsive:** semantic table on wide screens; narrow-screen list exposes field labels and actions without horizontal page overflow.

#### News editor and preview

- **Purpose / user:** create, revise, preview, and manage an article without accidentally publishing it.
- **Content / inputs:** title, slug, optional excerpt, body, optional featured image, status, publication date/time, SEO title/description. Exact rich-text model, limits, and timezone require approval.
- **Actions:** save draft, preview, publish/unpublish, return to list. Editing and publishing are distinct where permissions require it.
- **Validation:** required title/slug/body; unique slug; status/date consistency; image must be eligible for use; sanitize rich text at the trusted boundary. Show field errors and summary.
- **Permissions:** create/update/preview and publish rights enforced per operation. Preview is authenticated, non-cacheable, and must not be publicly addressable.
- **States:** unsaved changes prompt on navigation; save/publish success only after persistence; conflict on duplicate slug or invalid transition; do not discard content silently on session expiry. Do not put article drafts in persistent browser storage without an approved security design.
- **Responsive:** editor controls stack on mobile; preview remains readable; editing a long article does not require side-by-side panes.

#### Gallery management and upload

- **Purpose / user:** manage image metadata and publication with explicit protection for student media.
- **Content / inputs:** file, required meaningful alt text, optional caption, optional album, order/status; school-approval state/evidence only as defined by approved workflow.
- **Actions:** upload privately, edit metadata, organize, preview, publish/unpublish, replace, remove; confirm removal and publication changes.
- **Validation:** server verifies actual file format, approved format/size/dimensions, metadata, permission prerequisites, and ownership. Exact limits, inspection, and evidence fields are unresolved. Never rely on filename or browser MIME alone.
- **Permissions:** upload, edit, publish, and delete may be distinct actions; approval is not inferred from a toggle alone. Private staging precedes public delivery.
- **States:** progress and cancel where safe; invalid upload identifies allowed requirements; partial storage failure leaves media private and reports failure; successful upload confirms only after workflow completion; deletion does not claim complete byte/cache erasure until verified.
- **Responsive:** drop zone has a standard file-picker/button alternative; thumbnail grid reflows; metadata fields remain keyboard accessible.

#### Admissions enquiry list and detail

- **Purpose / user:** let explicitly authorized staff review and update private enquiries.
- **Content:** list shows only necessary fields (for example received date, entry level, status, and parent name where operationally needed); detail contains the approved record fields.
- **Actions:** filter by status, paginate, open detail, update status to New/Contacted/Resolved/Archived under approved transition rules; assignment only if approved.
- **Inputs / validation:** allowlisted status/cursor/page size; status update validates allowed transitions; assignment validates active authorized user if implemented.
- **Permissions:** explicit enquiry-read and enquiry-update permissions at server boundary. Unauthorized and nonexistent records may share a safe not-found response.
- **States:** empty inbox includes next steps; empty filter offers reset; failed update keeps current state visible and does not show success; stale/conflicting updates invite refresh; no enquiry export is exposed unless separately approved.
- **Responsive:** compact row summaries become labeled cards on small screens; detail has clear field labels; no bulk destructive action on narrow layouts without strong confirmation.

#### Website content editor

- **Purpose / user:** update approved About, Academics, and other designated public content without code changes.
- **Content / inputs:** only school-approved editable fields and structured lists decided by the content contract.
- **Actions:** edit, preview, save, and publish where authorized.
- **Validation:** required fields, structured list constraints, safe URLs/rich text, and content approval requirements checked server-side.
- **Permissions:** content read/update and publication rights; public version changes only after authorized successful publish.
- **States:** fields not yet supplied are shown as missing/pending inside admin, never as public placeholder content; save failure preserves unsaved input; published state confirms the exact saved version.
- **Responsive:** avoid dense side-by-side editing; use fieldsets/legends and clear section anchors for long forms.

#### Website settings

- **Purpose / user:** maintain designated, approved public identity/contact/social/SEO settings.
- **Content / inputs:** allowlisted official name, logo reference, approved brand colors, telephone, email, WhatsApp number, address, office hours, social links, and default SEO fields only where approved.
- **Actions:** edit, validate, save, preview public rendering if available.
- **Validation:** typed contact values, normalized WhatsApp international number, safe URL schemes, approved field allowlist. Infrastructure credentials must never be accepted here.
- **Permissions:** explicit settings-read/update permissions. Changes to public facts/contact data require school approval as defined by policy.
- **States:** unset values stay unset; invalid WhatsApp never creates a link; successful settings change only after persisted write; server failures do not imply the old/new value was saved.
- **Responsive:** grouped sections, persistent labels, no wide settings table on phones.

## 6. Cross-cutting interaction rules

### Forms and validation

- Use a visible label for every control; hints and errors are programmatically associated with their fields.
- Mark required/optional status in text, not with color alone. Do not ask for data outside the approved purpose.
- Validate on blur/submit where it helps; avoid interrupting while the user is still typing. Server validation is authoritative.
- After failed multi-field submit, focus a linked error summary and preserve field values where safe; each summary item links to its field.
- Use stable error categories, not brittle localized-message matching. The proposed API envelope has field errors for validation; exact copy can be localized separately.
- Disable duplicate activation during in-flight mutations, but do not claim this is a substitute for server idempotency/duplicate handling.

### Search, filters, and pagination

- Public news/gallery are bounded/paginated where needed. Admin news and enquiries are bounded and filterable as specified by their proposed operations.
- Preserve selected filters when paging; expose current filter and a clear/reset action. Empty-filter results differ from an empty collection.
- No general website search or admin free-text search is required by the MVP; adding one needs a product and privacy decision.
- Cursor format is opaque. Do not display or construct cursors in the UI.

### Confirmations and destructive actions

- Confirm delete/removal and any irreversible action, stating the affected content and consequence. Prefer archive/unpublish when it meets the school's retention needs.
- Publishing/unpublishing an article or image changes public visibility; confirm when the effect is consequential and clearly show resulting state.
- Do not make hard deletion the default. Retention, deletion, reference handling, object cleanup, cache behavior, and permissions require approval.
- After cancellation, return focus to the initiating control. Keep dialogs keyboard-operable and screen-reader announced.

### Notifications and network failures

- Inline status is the source of truth for form submit, content save, publication, upload, and enquiry status updates.
- A successful enquiry notification appears only after committed persistence (`201` per the proposed contract). Failure uses safe feedback; do not imply receipt.
- Map proposed API categories to understandable UI: `400/422` correct input; `401` reauthenticate; `403` explain access is unavailable; `404` show not found; `409` resolve conflict/reload; `413/415` correct upload; `429` wait/retry per approved guidance; `500/503` report service failure without internals.
- Do not blindly retry uncertain writes. For duplicate/unknown-outcome enquiry submits, explain that confirmation was not received and show approved contact options; retry/idempotency behavior needs an explicit contract.
- Optional future notifications must not change the confirmed result of a successfully saved enquiry.

### Session expiry

- If an admin session expires, block protected operations and clear private screen data; return through the selected identity flow.
- Tell the user that reauthentication is required. Do not silently retry a mutation using stale authorization.
- Warn before losing unsaved editor work when the session state allows it. Keep unsaved data in memory only unless a separately approved persistence/privacy design exists; never store enquiry contents or auth tokens in browser storage.
- Exact inactivity/absolute timeout, warning interval, and reauthentication flow are undecided and must follow the approved identity/session design.

### Motion and feedback

- Use brief, nonessential transitions only for menu/dialog/state feedback; no autoplay content or parallax is required.
- Respect reduced-motion settings. Essential loading and state changes remain understandable without motion.
- Focus movement follows interaction intent; do not move focus merely because a toast appears.

## 7. Accessibility requirements

Target **WCAG 2.2 Level AA** per PRD NFR-03. Automated checks supplement, but do not replace, manual review.

- Use semantic landmarks (`header`, labeled `nav`, `main`, `footer`), one clear page-level heading, ordered heading levels, lists for grouped content, and semantic tables for tabular data.
- All functionality is keyboard-operable with logical DOM/focus order. Provide visible focus that is not obscured by sticky UI, dialogs, or menus.
- Use native links/buttons and form controls. Icon-only controls have a meaningful accessible name; decorative icons are hidden from assistive technology.
- Ensure focus is managed for mobile navigation, dialogs/lightboxes, validation summaries, and session-expiry transitions. Restore focus after close.
- Provide text alternatives for meaningful images. Decorative images use empty alt text; captions do not replace image alternatives unless they convey equivalent meaning.
- Pair every field with a programmatic label; associate hint/error text; expose loading, status, expanded, selected, disabled, and invalid states.
- Announce validation summary and asynchronous status with appropriate live-region semantics without repeating every field or stealing focus.
- Meet text contrast (4.5:1 normal, 3:1 large) and non-text control contrast (3:1); validate actual approved colors rather than assuming.
- Support zoom, reflow, touch, and keyboard without hover-only content or clipped labels. Target at least 44×44 CSS px control hit areas where practical.
- Gallery lightbox/menu/dialog must have keyboard equivalents, Escape behavior when safe, clear names, and focus containment/return.
- Respect reduced motion. No critical information may depend on animation, position, color, or image alone.
- Test public and admin flows manually with keyboard and assistive technology; include error, empty, loading, and success states.

## 8. API integration and contract alignment

The API document is a **proposal**, not an approved or implemented contract. The UI should use its representations and outcome semantics only after the contract and open decisions are approved. Public server-rendered reads may use internal application read services as described by the architecture; do not force browser loopback API calls.

| User interaction | Proposed contract | UI behavior |
|---|---|---|
| Read approved public settings | `public.settings.read` — `GET /api/v1/public/settings` | Render only allowlisted public values; omit absent/unapproved values; cache only under approved freshness policy. |
| List/read news | `public.news.list` / `public.news.get` — `GET /api/v1/public/news`, `GET /api/v1/public/news/{slug}` | Show published-only projections; draft/unpublished slug is indistinguishable from missing (`404`). |
| List gallery | `public.gallery.list` — `GET /api/v1/public/gallery` | Show approved/published projection only; final media delivery route/provider is unresolved. |
| Submit admission enquiry | `admissions.enquiry.create` — `POST /api/v1/admissions-enquiries` | Send minimum approved fields; return no private record/ID; show success only after committed save (`201`). |
| Check/end session | `admin.session.get` / `admin.session.end` — `GET` / `DELETE /api/v1/admin/session` | Use selected session design; no token in browser URLs/logs; end server session on logout. |
| Read dashboard | `admin.dashboard.read` — `GET /api/v1/admin/dashboard` | Use persisted metrics; private response `no-store`; include enquiry information only with explicit permission. |
| Review/update enquiries | `admin.enquiries.list/get/update` — `/api/v1/admin/enquiries` and `/{id}` | Require per-operation server authorization; `no-store`; never log/display unauthorized private records. |
| Manage news | `admin.news.*` — list/create/update/preview/delete operations | Distinguish draft save, preview, and publish permissions; preview is authenticated and non-cacheable. |
| Manage gallery | `admin.albums.*`, `admin.gallery.images.*` | Upload to private staging; publish only after approval and validation; no client-supplied storage keys. |
| Update settings | `admin.settings.read/update` — `/api/v1/admin/settings` | Only approved settings allowlist; never accept secrets as site content. |
| Handle errors | Proposed stable error envelope and status/code table in API spec §3 | Branch on status/code; present safe localized copy; no server details. |

### Contract gaps to resolve before frontend integration

1. The API proposal does not define public read or admin mutation operations for editable About/Academics website content, although PRD FR-02/FR-03/FR-09 require those fields to be managed. Do not invent route names or data shapes; approve the content contract.
2. The API proposal leaves login/callback and provider-specific session flow undecided. Sign-in UI must wait for ADR-003.
3. Privacy acknowledgement is conditional in the API proposal, but the candidate schema has no evidence field. Approve wording, necessity, evidence, and retention before deciding form behavior.
4. Public media delivery, lightbox rendition URLs, upload limits, pagination bounds, field lengths, entry-level values, status transitions, duplicate/idempotency policy, and cache invalidation remain open.
5. Stale existence statements in [`api-specification.md`](./api-specification.md), [`architecture.md`](./architecture.md), [`architecture-essential.md`](./architecture-essential.md), [`database-schema.md`](./database-schema.md), and [`data-architecture.md`](./data-architecture.md) have been reconciled. The [`security-specification.md`](./security-specification.md) exists as a proposed reference only; per the Principal's decision, it remains pending formal approval and is not the governing security baseline. Do not treat its proposed controls as approved policy.

## 9. Visual artifacts requiring separate design/approval

These are inputs or separate artifacts, not deliverables created by this document:

1. **Approved brand sheet:** official palette with contrast-safe pairings, typography/licensing, logo clear space/minimum size, and usage rules.
2. **Production logo source:** high-resolution or vector original and confirmation of artwork/wording; the current JPEG is the only supplied visual asset and may not be sufficient for all placements.
3. **School photography set:** approved hero, school-life, academic, and gallery images with crop guidance, alt-text/content context, and documented publication permission—especially for identifiable minors.
4. **Approved public copy/content inventory:** official About, Academics, Admissions process, entry levels, contact details, privacy notice, and social links. Do not fill missing facts with generated content.
5. **Page-level visual comps:** Home, Admissions/form, public listing/article, Gallery/lightbox, and admin overview/editor/enquiry list at mobile and desktop widths.
6. **Content/media approval artifact:** school-defined approver, authorization evidence for identifiable student images, withdrawal/takedown workflow, and who can publish.
7. **Privacy/legal copy review:** approved notice and acknowledgement decision before production enquiry collection.

## 10. Traceability to PRD

| Design area | PRD goals / requirements | Acceptance coverage |
|---|---|---|
| Public navigation, landing and responsive hierarchy | G1–G3; FR-01; NFR-02; NFR-03 | Public pages work on mobile/desktop; Admissions easy to find; no hover dependency. |
| About, Academics and verified copy | G2–G3; FR-02; FR-03; NFR-05 | Only approved information is public; missing optional content is omitted; content can be managed without code changes once contract is defined. |
| Admissions conversion and enquiry form | G1; FR-04; FR-05; NFR-04; NFR-05 | Required fields validate; enquiry persists before confirmation; private data is never public; mobile form remains usable. |
| WhatsApp/contact | G1–G3; FR-05; FR-08 | Valid configured number only; contact links work; no delivery/read claim; enquiry channel remains available. |
| News and public article | G2–G5; FR-06; FR-10; NFR-01; NFR-08 | Published items render; drafts remain private; invalid slug not found; SEO and semantic metadata supported. |
| Gallery and media approval | G2–G3; FR-07; NFR-03–NFR-05 | Published approved images only; invalid uploads rejected; accessible keyboard viewer; minors' authorization respected. |
| Contact and privacy | G1–G3; FR-08; NFR-05 | Verified contact details only; privacy notice accessible before collection; no guessed map/location. |
| Admin dashboard and content tools | G4; FR-09; NFR-04; NFR-07 | Authenticated operations; server-side authorization; actual metrics; content changes reflected after successful publication. |
| SEO and public/private boundaries | G5; FR-10; NFR-08 | Public approved pages indexable; admin/private/draft data excluded from public index and public APIs. |
| Tokenization, component reuse and responsive design | G2; G6; NFR-02; NFR-03; NFR-07 | Reusable visual patterns; contrast, keyboard, reduced motion and responsive checks completed before release. |
| Loading, empty, error, success, and recovery states | FR-01, FR-04, FR-06–FR-09; NFR-04; NFR-06 | No fake data or success-shaped fallback; operational errors safely handled. |

No approved implementation task IDs are defined in the current project materials. This document addresses product design and frontend handoff requirements; it does not implement any frontend or settle the proposed technology/vendor decisions.

## 11. Open decisions and release gates

Before implementation or production data use, the school/project owner must resolve applicable items:

- Brand palette, typography, approved photography, logo source/usage, and school-approved copy.
- Identity provider/auth library, admin account owner/lifecycle, roles and action matrix, recovery/MFA expectations, session expiry, and sign-in route.
- Public content ownership, editor field allowlist, publication authority, and content API contract for About/Academics.
- Privacy notice, jurisdiction/legal review, acknowledgement evidence, enquiry access, retention/deletion, and export/correction process.
- Student-image permission evidence, approver, publication prerequisite, withdrawal/takedown, media visibility, and cache propagation.
- API contract approval: route/representation details, validation limits, pagination, status transitions, conflict/retry behavior, media delivery, and cache policy.
- Providers/regions, operational ownership, rate limits, backup/recovery, and error/support contact channels.

Until approved, this design must not be treated as authority to invent school facts, provision services, collect production enquiries, publish identifiable student media, or implement an unapproved auth/API flow.
