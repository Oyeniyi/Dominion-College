# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Dominion College, Oba-Ile, Akure — Official School Website

**Document status:** Draft for AI-assisted implementation  
**Product type:** Dynamic school website with content-management dashboard  
**Primary objective:** Increase admissions enquiries and attract prospective parents  
**Institution:** Dominion College, Oba-Ile, Akure, Ondo State, Nigeria  
**Target users:** Prospective parents and guardians, students, existing school community, and school administrators  
**Implementation environment:** AI-assisted development using Google Antigravity or a comparable coding agent  
**Version:** 1.0

---

# 1. Executive Summary

## 1.1 Product overview

Dominion College requires a professional, responsive, and easily maintainable website that establishes a credible digital presence for the school, communicates its educational identity, showcases its learning environment, and encourages prospective parents to enquire about admission.

The website will combine a public-facing school website with a secure administrative dashboard. Authorized school staff should be able to manage news, announcements, photographs, gallery content, and admissions enquiries without modifying source code.

The website should be designed around the needs of parents evaluating secondary schools for their children. Visitors should be able to understand what the school offers, explore available school information, view authentic photographs, and contact the school through WhatsApp or an admissions enquiry form.

The product must prioritize usability, mobile performance, security, search visibility, accessibility, and straightforward administration.

## 1.2 Problem statement

Prospective parents often need reliable information before deciding whether to contact a school. A poorly organized or outdated online presence can make it difficult to discover relevant information, evaluate a school's environment, or understand how to begin the admissions process.

Dominion College's website should address these challenges by:

- Presenting the school's identity and verified information in a structured format.
- Showcasing authentic school photographs and activities.
- Making admission-related information easy to locate.
- Providing clear calls to action for admissions enquiries.
- Enabling authorized staff to publish current news and updates.
- Establishing a consistent and professional online representation of the school.

These are the problems the product is intended to address; the extent to which they currently affect the school has not yet been established through formal research.

## 1.3 Product vision

To create a trusted digital gateway through which families can discover Dominion College, understand its educational offering, explore school life, and begin the admissions process with confidence.

## 1.4 Success definition

The website will be successful when it:

1. Makes accurate and useful school information readily accessible.
2. Generates measurable admissions enquiries through WhatsApp and the website.
3. Allows authorized staff to update public content independently.
4. Works reliably across mobile phones, tablets, and desktop computers.
5. Maintains appropriate protection for administrative access and personal information.

---

# 2. Product Goals and Non-Goals

## 2.1 Primary goals

### G1 — Increase admissions enquiries

Make it easy for interested parents to contact the school and request admission information.

### G2 — Establish a professional digital presence

Present the school using its approved logo, brand colours, authentic photographs, and verified institutional information.

### G3 — Improve information accessibility

Organize essential information into intuitive pages with clear navigation and readable content.

### G4 — Enable independent content management

Provide a secure dashboard for publishing news, managing galleries, editing approved website content, and reviewing admissions enquiries.

### G5 — Support discoverability

Implement search-engine-friendly page structures, descriptive metadata, accessible content, and local search information.

### G6 — Establish a maintainable foundation

Use a modular architecture that allows future features to be added without unnecessarily rebuilding the application.

## 2.2 Non-goals for the initial release

The MVP will not include the following unless separately approved:

- Full student information management system.
- Student or parent login portals.
- Online examination results.
- School fee payment processing.
- Attendance management.
- Electronic report cards.
- Timetable management.
- Learning management system.
- Online examination platform.
- Automated admission decisions.
- Native Android or iOS applications.
- Complex CRM integrations.
- AI chatbots or automated admissions agents.

These features may be considered in later releases after the initial website has been deployed and evaluated.

---

# 3. Users and Stakeholders

## 3.1 Primary user personas

### Persona A: Prospective parent or guardian

**Needs**
- Understand the school's identity and educational offering.
- View authentic school photographs.
- Find admissions information.
- Ask questions and request further information.
- Use the website easily on a mobile phone.

**Expected actions**
- Visit the homepage.
- Explore the About, Academics, Admissions, and Gallery pages.
- Initiate a WhatsApp conversation.
- Submit an admissions enquiry.

### Persona B: School administrator or designated content manager

**Needs**
- Sign in securely.
- Publish news and announcements.
- Upload, organize, and remove gallery images.
- Update approved website content.
- View and manage admissions enquiries.
- Correct outdated or inaccurate information.

**Expected actions**
- Sign in to the dashboard.
- Create and publish content.
- Review incoming enquiries.
- Update publication status.
- Sign out securely.

### Persona C: Existing member of the school community

This may include parents, students, staff, and other community members seeking school announcements, events, photographs, or official contact details.

This persona is secondary to the admissions-focused purpose of the first release.

## 3.2 Stakeholders

- School management: approves content, policies, and public claims.
- Admissions representative: handles enquiries and admission-related communication.
- Content administrator: manages news, images, and website updates.
- Website developer or AI coding agent: implements and tests the product.
- Hosting and domain administrator: manages deployment, DNS, and infrastructure.

One individual may perform multiple roles in the initial release.

---

# 4. Scope of the Minimum Viable Product

The MVP consists of two connected applications or application areas:

1. **Public website:** The pages and features available to visitors.
2. **Administration dashboard:** The authenticated interface used by authorized staff to manage website content and enquiries.

## 4.1 Public website pages

| Page | Purpose | Priority |
|---|---|---|
| Home | Communicate the school's identity and encourage admissions enquiries | P0 |
| About the School | Present approved institutional information | P0 |
| Academics | Explain verified academic offerings | P0 |
| Admissions | Explain the approved admission process and provide enquiry actions | P0 |
| News & Updates | Publish school news and announcements | P0 |
| News Article | Display individual published articles | P0 |
| Gallery | Showcase approved school photographs | P0 |
| Contact Us | Provide approved contact details and enquiry options | P0 |
| Privacy Notice | Explain collection and use of personal information | P0 |
| Custom 404 Page | Help visitors recover from invalid URLs | P1 |

P0 means essential for launch. P1 means desirable where time permits without compromising essential functionality.

## 4.2 Administration dashboard

The MVP dashboard must support:

- Secure administrator authentication.
- Dashboard overview.
- News and announcement management.
- Gallery and image management.
- Admissions enquiry management.
- Management of editable website content.
- Publication status controls.
- Basic SEO metadata management.
- Logout and session security.

A basic website settings area should allow authorized administrators to update approved contact details, the school's WhatsApp number, social media links, and other designated settings.

---

# 5. Functional Requirements

## FR-01: Homepage

**Priority:** P0

The homepage must introduce the school clearly and direct visitors toward admissions information.

### Required components

1. Header with approved school logo.
2. Primary navigation.
3. Prominent admissions call to action.
4. Hero section featuring an approved school photograph or visual asset.
5. Concise school introduction.
6. Approved educational values or institutional highlights.
7. Academic offering overview.
8. School-life or gallery preview.
9. Latest published news and announcements.
10. Admissions call-to-action section.
11. Contact information and WhatsApp link.
12. Footer with useful navigation and approved social links.

### Requirements

- The homepage must prioritize admissions-related actions.
- The primary call to action should be visually prominent.
- Visitors must be able to reach Admissions and Contact within a small number of navigation steps.
- News and gallery previews must load from the content-management system.
- Only published content may appear publicly.
- Empty sections must be handled gracefully when content has not yet been supplied.
- The homepage must not contain fabricated testimonials, awards, student results, rankings, or school statistics.

**Acceptance criteria**

- The homepage renders successfully on supported mobile and desktop viewports.
- The primary admissions action opens the admissions page or the configured enquiry channel.
- News and gallery previews display published content from the backend.
- The page remains usable if no news articles or gallery images have been published.

## FR-02: About the School

**Priority:** P0

The About page must present the school's identity and approved institutional information.

### Potential content fields

- Official school name.
- Introduction.
- School history.
- Mission.
- Vision.
- Motto.
- Educational philosophy.
- Core values.
- Leadership information, if approved.
- Approved school photographs.

Not every field is mandatory if the school has not supplied the relevant information.

**Acceptance criteria**

- Administrators can update designated About page content through the dashboard.
- The page displays only approved information.
- Missing fields are omitted or represented by clearly identified placeholders in the administration interface, not by invented public claims.

## FR-03: Academics

**Priority:** P0

The Academics page must help parents understand the school's verified educational offering.

### Potential content fields

- Junior secondary education.
- Senior secondary education.
- Subjects and subject groupings.
- Curriculum and examination arrangements.
- Teaching and learning approach.
- Educational facilities.
- Extracurricular programmes.

The existence and exact details of each offering must be confirmed by the school.

**Acceptance criteria**

- Academic information can be updated without modifying application source code.
- Subject and programme lists are structured and easy to maintain.
- The page does not promise courses, facilities, qualifications, or examination arrangements that have not been confirmed.

## FR-04: Admissions

**Priority:** P0

The Admissions page is the principal conversion page.

It must help prospective parents understand how to obtain admission information and initiate contact with the school.

### Required components

- Admissions introduction.
- Available entry levels, once verified.
- Approved admission requirements.
- Admission process and steps, once verified.
- Application availability or instructions.
- Admissions contact options.
- WhatsApp call to action.
- Online admissions enquiry form.
- Relevant privacy notice.

### Admissions enquiry form

The MVP form should collect only information needed to respond to the enquiry.

Recommended fields:

| Field | Requirement |
|---|---|
| Parent/guardian name | Required |
| Contact phone number | Required |
| Email address | Optional |
| Class or entry level of interest | Required, using school-approved options |
| Message or question | Optional |
| Privacy notice acknowledgement | Required where applicable |

The form must not request sensitive student information, identity documents, medical details, or other unnecessary personal information.

### Form behavior

- Validate required fields on the client and server.
- Normalize and validate contact information appropriately.
- Display understandable validation errors.
- Prevent accidental duplicate submissions where reasonably practical.
- Save valid submissions to the database.
- Display a clear confirmation message after successful submission.
- Display a useful error if the submission fails.
- Never report successful submission before the backend confirms it.
- Never expose database credentials or internal server errors to visitors.

### Admissions enquiry lifecycle

An enquiry should support the following statuses:

- New
- Contacted
- Resolved
- Archived

The dashboard must allow authorized staff to review an enquiry and update its status.

**Acceptance criteria**

- A valid enquiry is persisted and visible to an authorized administrator.
- Invalid submissions are rejected safely.
- Visitors receive a confirmation only after successful persistence.
- Enquiry details are never displayed publicly.
- The form remains usable on mobile devices.

### Important scope distinction

The MVP is an **admissions enquiry system**, not a complete online admission application or admission-processing platform. Any future application process involving documents, fees, student records, or admission decisions requires a separate specification.

## FR-05: WhatsApp Integration

**Priority:** P0

The website must make it easy for parents to contact the school using WhatsApp.

### Requirements

- A configurable school WhatsApp number.
- WhatsApp actions in appropriate locations, including the header or mobile navigation, Admissions page, Contact page, and footer.
- A contextual prefilled message where supported.
- Mobile and desktop compatibility.
- Accessible labels for icon-only controls.

### Message example

"Hello Dominion College. I would like to enquire about admission and receive more information about the school."

The actual message may be adapted before launch.

### Technical requirements

- Use a valid WhatsApp click-to-chat URL constructed from the configured phone number.
- Store the number in a validated configuration setting.
- Format the phone number according to WhatsApp's international-number requirements.
- Do not hardcode a guessed telephone number.
- Do not claim that WhatsApp messages have been delivered or read.

**Acceptance criteria**

- Every WhatsApp button opens a conversation with the configured school number.
- Prefilled messages are encoded correctly.
- Missing or invalid WhatsApp configuration is handled safely.
- WhatsApp is an optional contact channel; the website enquiry form must remain available.

## FR-06: News and Announcements

**Priority:** P0

The website must provide a dynamic news section.

### Public functionality

- Display published news articles.
- Display article title, publication date, featured image where available, and summary.
- Open an individual article page.
- Provide a useful empty state when no articles have been published.
- Include relevant related articles where appropriate.

### Administration functionality

Administrators must be able to:

- Create articles.
- Edit existing articles.
- Save drafts.
- Preview articles before publication.
- Publish and unpublish articles.
- Archive or delete articles according to permissions and retention rules.
- Upload a featured image.
- Set an article title, slug, summary, body, publication date, and SEO metadata.

### Article publication rules

- Draft articles must not appear publicly.
- Unpublished articles must not be accessible through public article pages.
- Public article URLs must use stable, readable slugs.
- Publication dates must use a consistent configured timezone.
- Rich-text content must be sanitized before rendering.

**Acceptance criteria**

- Publishing an article makes it available on the public news listing and its individual page.
- Saving a draft does not expose the article publicly.
- Editing an article updates its public content correctly.
- Invalid or missing article slugs produce a proper not-found response.

## FR-07: Gallery

**Priority:** P0

The website must provide a dynamic photo gallery using approved school photographs.

### Public functionality

- Responsive image grid.
- Optimized thumbnails.
- Full-size image viewing or an accessible lightbox.
- Image captions where available.
- Optional grouping by event or category.
- Graceful handling of empty galleries and unavailable images.

### Administration functionality

Administrators must be able to:

- Upload images.
- Add captions and alternative text.
- Organize images into albums or categories.
- Publish or unpublish gallery content.
- Remove images from the public gallery.
- Replace an image where necessary.

### Image requirements

- Validate file type and size.
- Allow only approved image formats, such as JPEG, PNG, and WebP.
- Generate optimized image variants where practical.
- Avoid unnecessarily large original files in public page layouts.
- Use descriptive alternative text where appropriate.
- Avoid exposing sensitive metadata unnecessarily.
- Require school approval before publishing identifiable photographs of students.

**Acceptance criteria**

- Newly published gallery content appears without a code deployment.
- Unpublished images are not publicly displayed.
- Invalid uploads are rejected.
- Gallery images preserve sensible aspect ratios and do not break the page layout.
- Image controls are usable with a keyboard and assistive technology.

## FR-08: Contact Page

**Priority:** P0

The Contact page must provide approved ways to reach the school.

### Potential fields

- School address.
- Telephone number.
- Email address.
- WhatsApp contact.
- Office hours.
- Map or directions link.
- Approved social media links.

Only information confirmed by the school may be published.

**Acceptance criteria**

- Contact information is editable by authorized administrators.
- Telephone and email links work where applicable.
- The WhatsApp link uses the configured number.
- A map or directions feature is shown only when the location has been verified.

## FR-09: Content Management Dashboard

**Priority:** P0

The dashboard is a protected administrative interface, not a public page.

### Dashboard overview

The initial dashboard should show:

- Total published news articles.
- Draft article count.
- Gallery image or album count.
- New admissions enquiries.
- Recent enquiries.
- Quick actions for adding content.

These figures must be calculated from actual stored records, not hardcoded sample values.

### Content management

The dashboard must provide clear navigation to:

- Overview.
- News.
- Gallery.
- Admissions enquiries.
- Website content.
- Website settings.
- Account or session controls.

### Content editor

Editors should support the fields relevant to the content type, with:

- Required-field validation.
- Save draft.
- Preview.
- Publish or unpublish.
- Useful success and error feedback.
- Confirmation before destructive actions.

### User permissions

For the MVP, a single administrator role may be sufficient if only one authorized staff member will operate the dashboard.

The architecture should support additional roles later, such as content editor and admissions officer, without requiring a complete redesign.

The application must enforce authorization on the server, not merely hide dashboard buttons from unauthorized users.

**Acceptance criteria**

- Anonymous visitors cannot access protected dashboard data.
- Authorized administrators can perform permitted management actions.
- Changes are reflected on the public website after successful publication.
- Unauthorized requests are rejected even when submitted directly to the backend.
- Empty dashboard states provide useful instructions.

## FR-10: Search Engine Optimization

**Priority:** P0

The website must support discoverability for searches related to the school's name, location, academics, and admissions.

### Requirements

- Unique page titles.
- Descriptive meta descriptions.
- Canonical URLs where appropriate.
- Semantic heading structure.
- Human-readable URLs.
- XML sitemap.
- `robots.txt`.
- Social sharing metadata.
- Image alternative text.
- Appropriate internal linking.
- Structured data only where the organization type and claims are accurate.
- Search-engine indexing of approved public pages.
- Exclusion of dashboard pages, private enquiry records, and draft content from public indexing.

Do not add fabricated reviews, ratings, awards, rankings, or structured data claiming facts that have not been verified.

Search visibility cannot be guaranteed, but the technical foundations should be implemented correctly.

---

# 6. User Journeys

## 6.1 Prospective parent journey

1. Parent discovers the school through a search engine, social media, or a shared link.
2. Parent visits the homepage.
3. Parent reviews the school's introduction and academic information.
4. Parent explores school photographs and recent activities.
5. Parent visits the Admissions page.
6. Parent chooses WhatsApp or submits an enquiry form.
7. The parent receives a clear indication of the next step.
8. The school's designated representative follows up through the appropriate contact channel.

## 6.2 Administrator journey

1. Administrator opens the dashboard login page.
2. Administrator authenticates.
3. Dashboard overview displays current content and enquiry information.
4. Administrator creates or updates an article, gallery item, or page.
5. Administrator previews the changes.
6. Administrator publishes the content.
7. The public website reflects the published changes.
8. Administrator signs out.

## 6.3 Admissions enquiry journey

1. Visitor completes the enquiry form.
2. Client-side validation identifies obvious errors.
3. Server validates the submission and applies abuse protection.
4. Server stores the enquiry.
5. Website displays a success message.
6. Administrator reviews the enquiry in the dashboard.
7. Administrator updates its status after follow-up.

If an email notification is introduced, notification failure must not erase a successfully stored enquiry.

---

# 7. Information Architecture and Navigation

## 7.1 Proposed sitemap

```text
Dominion College Website
│
├── Home
│
├── About
│   ├── School Overview
│   ├── Mission and Vision
│   └── Values and Leadership (if approved)
│
├── Academics
│   ├── Junior Secondary (if confirmed)
│   └── Senior Secondary (if confirmed)
│
├── Admissions
│   └── Admissions Enquiry
│
├── News & Updates
│   └── Individual News Article
│
├── Gallery
│
├── Contact Us
│
├── Privacy Notice
│
└── Administration
    ├── Login
    ├── Dashboard
    ├── News Management
    ├── Gallery Management
    ├── Admissions Enquiries
    ├── Website Content
    └── Website Settings
```

The final sitemap may be simplified after the actual school content is reviewed. The initial navigation should remain clear and concise.

---

# 8. Content and Data Requirements

## 8.1 Content ownership

School management must approve institutional information before publication.

The implementation agent must not invent missing information to make the design appear complete.

Content should be marked internally as one of the following:

- **Verified:** supplied or explicitly approved by the school.
- **Pending approval:** awaiting school confirmation.
- **Placeholder:** temporary content that must be replaced before launch.
- **Optional:** a proposed content section that may be omitted.

Placeholder content must not accidentally appear in the production website.

## 8.2 Recommended data entities

### A. AdminUser

- `id`
- `name`
- `email`
- `password_hash` or an external authentication identifier
- `role`
- `is_active`
- `created_at`
- `updated_at`
- `last_login_at`, if implemented

Plain-text passwords must never be stored.

### B. NewsArticle

- `id`
- `title`
- `slug`
- `excerpt`
- `body`
- `featured_image_id`, nullable
- `status`
- `published_at`, nullable
- `author_id`
- `seo_title`, nullable
- `seo_description`, nullable
- `created_at`
- `updated_at`

### C. GalleryAlbum

- `id`
- `title`
- `slug`
- `description`, nullable
- `status`
- `created_at`
- `updated_at`

### D. GalleryImage

- `id`
- `album_id`, nullable
- `storage_key`
- `alt_text`
- `caption`, nullable
- `display_order`
- `status`
- `uploaded_by`
- `created_at`

### E. AdmissionsEnquiry

- `id`
- `parent_name`
- `phone`
- `email`, nullable
- `entry_level`
- `message`, nullable
- `status`
- `created_at`
- `updated_at`
- `assigned_to`, nullable if assignment is supported

Enquiry records contain personal information and must only be accessible to authorized users.

### F. SiteSettings

A controlled collection of settings for:

- Official school name.
- Approved logo reference.
- Brand colours.
- Contact details.
- WhatsApp number.
- Social media links.
- Approved address.
- Default SEO metadata.
- Other approved public website settings.

Sensitive infrastructure credentials must not be stored in publicly accessible website settings.

## 8.3 Data integrity

- Use database constraints for required fields and unique slugs.
- Use appropriate indexes for frequently queried records.
- Validate data on the server.
- Apply sensible deletion and retention rules.
- Use migrations to manage schema changes.
- Preserve referential integrity between articles, users, images, and albums.
- Avoid collecting personal information not needed for the stated purpose.

---

# 9. Recommended Technical Architecture

The following is a proposed implementation baseline, not a confirmed requirement from the school.

## 9.1 Architecture recommendation

For a maintainable, database-backed website, use a single coherent application with public pages, a protected admin interface, server-side business logic, and a relational database.

Recommended baseline:

| Layer | Recommendation |
|---|---|
| Language | TypeScript |
| Web framework | Next.js |
| UI | React |
| Styling | Tailwind CSS with reusable components |
| Database | PostgreSQL |
| Database access | Prisma ORM or an equivalent maintained ORM |
| Authentication | Established authentication library or managed identity provider |
| Image storage | Managed object storage with access controls |
| Hosting | A managed platform supporting the chosen framework and server-side routes |
| Database hosting | Managed PostgreSQL with automated backups |
| Version control | Git |
| Deployment | Automated build, test, and deployment pipeline where practical |

The coding agent may propose a different stack if the existing project, budget, hosting constraints, or school requirements justify it. Any change should be documented before implementation.

## 9.2 Application architecture

```text
Visitor / Administrator
          |
          v
    Web Application
          |
          v
 Public Pages / Admin UI
          |
          v
 Server-side Application Logic
          |
      +---+---+
      |       |
      v       v
 PostgreSQL  Image Storage
      |
      v
 Content, Settings, Enquiries
```

All privileged database operations must execute through trusted server-side logic or an appropriately secured backend.

The browser must never receive database credentials, private storage credentials, or privileged authentication secrets.

## 9.3 Architectural requirements

- Separate public presentation from privileged management operations.
- Reuse shared layout, navigation, form, and content components.
- Separate data access from UI components.
- Use environment variables for secrets and environment-specific settings.
- Validate incoming requests at the server boundary.
- Implement appropriate error handling and logging.
- Use database migrations.
- Provide loading, empty, success, and error states.
- Avoid unnecessary dependencies and overengineering.
- Document the deployment and maintenance process.

## 9.4 Rendering and caching

Use server rendering or static generation where appropriate for public content and search visibility.

Dynamic dashboard views and private enquiry data must be protected against accidental public caching.

When administrators publish or update content, the public website should reflect the change promptly without requiring a full application redeployment.

---

# 10. Visual Design and Brand Requirements

## 10.1 Design objective

Create a professional, welcoming, credible school website that appeals to parents and guardians while remaining appropriate for an educational institution.

The visual language should communicate:

- Trust.
- Educational quality.
- Care for students.
- Discipline and character development, where consistent with the school's approved identity.
- Growth and learning.
- A modern approach to education.

These are design directions, not claims about formally established school policies.

## 10.2 Brand assets

The project owner has indicated that the following assets are available:

- School logo.
- Brand colours.
- School photographs.
- Official school information.

The coding agent must request or inspect the actual files before implementing the final visual design.

It must not invent a replacement logo or independently guess the school's official colour palette.

## 10.3 Design requirements

- Mobile-first responsive layouts.
- Clear typography and readable line lengths.
- Consistent spacing and visual hierarchy.
- High-quality image presentation.
- Clear admissions calls to action.
- Accessible colour contrast.
- Visible keyboard focus.
- Consistent form styling.
- Professional navigation and footer.
- Minimal unnecessary animation.
- No intrusive pop-ups that obstruct admissions information.
- No fabricated testimonials, badges, awards, or statistics.
- No generic dashboard template that conflicts with the public website's brand.

## 10.4 Required UI states

All interactive components must have appropriate states, including:

- Default.
- Hover.
- Keyboard focus.
- Disabled.
- Loading.
- Validation error.
- Success.
- Empty content.
- Network or server failure.

## 10.5 Design deliverables

Before implementing the full website, the coding agent should establish:

1. Design tokens based on the supplied brand assets.
2. Typography scale.
3. Spacing system.
4. Button and form styles.
5. Navigation and footer patterns.
6. Reusable content cards.
7. Gallery and article layouts.
8. Dashboard layout and navigation.
9. Responsive behavior.
10. Accessibility conventions.

The implementation should use reusable components rather than duplicating page-specific styling unnecessarily.

---

# 11. Non-Functional Requirements

## NFR-01: Performance

- Optimize images and serve appropriately sized variants.
- Avoid unnecessary JavaScript and large dependencies.
- Minimize layout shifts.
- Use caching appropriately for public content.
- Paginate or limit long news and enquiry lists.
- Optimize database queries.
- Target good Core Web Vitals under realistic production conditions.

Performance targets should be measured on the deployed website. A recommended objective is to achieve Google's "good" thresholds for Core Web Vitals, including an LCP of no more than 2.5 seconds, INP of no more than 200 milliseconds, and CLS of no more than 0.1 at the 75th percentile when sufficient real-user data is available.

## NFR-02: Responsiveness

The website must work on:

- Small mobile phones.
- Larger mobile phones.
- Tablets.
- Laptop screens.
- Desktop screens.

The design must not depend on hover interactions that are unavailable on touchscreens.

## NFR-03: Accessibility

Target WCAG 2.2 Level AA as the accessibility standard.

Requirements include:

- Semantic HTML.
- Keyboard navigation.
- Visible focus indicators.
- Accessible labels for forms.
- Meaningful alternative text.
- Sufficient colour contrast.
- Accessible validation messages.
- Reduced-motion support where applicable.
- Accessible lightbox and menu controls.

Automated accessibility checks must be supplemented by manual keyboard testing.

## NFR-04: Security

- Use HTTPS in production.
- Enforce server-side authorization.
- Hash passwords using an established secure password-hashing mechanism when local passwords are used.
- Protect authentication and enquiry endpoints against abuse.
- Validate and sanitize input.
- Protect against SQL injection, cross-site scripting, cross-site request forgery where applicable, and insecure direct object references.
- Use secure session cookies and appropriate session expiration.
- Apply rate limiting to login and public enquiry endpoints.
- Protect file uploads against malicious content and unauthorized access.
- Keep secrets out of source control.
- Avoid exposing private records in logs or error messages.
- Keep dependencies maintained and scan for known vulnerabilities.
- Use least-privilege database and storage permissions.

The agent must not implement authentication by checking a hardcoded password in frontend JavaScript.

## NFR-05: Privacy and child protection

The school may publish images or information involving minors. The system must therefore support responsible content handling.

- Obtain appropriate authorization for identifiable student photographs before publication.
- Collect only information necessary for admissions enquiries.
- Explain why personal information is collected.
- Restrict access to enquiry records.
- Avoid exposing student details in public URLs or analytics events.
- Establish an approved retention and deletion policy for enquiries.
- Provide an appropriate privacy notice.
- Do not upload sensitive student information to third-party AI services.
- Do not add advertising trackers or third-party marketing scripts without appropriate approval and privacy review.

The school must approve the privacy notice, data retention practices, and applicable consent arrangements before launch.

## NFR-06: Reliability and backup

- Use managed database backups where available.
- Document restoration procedures.
- Log important server errors.
- Handle temporary database and storage failures gracefully.
- Preserve successfully stored enquiries if optional notifications fail.
- Test restoration before relying on backups for production recovery.

## NFR-07: Maintainability

- Use clear file and folder organization.
- Use consistent naming conventions.
- Include TypeScript types where applicable.
- Provide a sample environment configuration without secrets.
- Include setup and deployment instructions.
- Include database migrations.
- Add tests for critical functionality.
- Avoid embedding editable school content directly in source code.

## NFR-08: Search visibility

Public pages must have appropriate metadata, semantic content, indexable URLs, and a sitemap.

Administrative pages and private data must not be indexed or exposed through public content endpoints.

---

# 12. Privacy, Consent, and Operational Policies

Before launch, school management must approve:

1. The official school contact details.
2. The person or team responsible for responding to admissions enquiries.
3. The privacy notice.
4. The permitted use of school photographs.
5. The retention period for enquiry records.
6. Who may access the administration dashboard.
7. Who may publish news and institutional statements.
8. The process for correcting inaccurate or outdated content.

The implementation should support these policies technically, but it must not invent the school's legal position or claim compliance without an appropriate review.

---

# 13. Analytics and Success Metrics

## 13.1 Recommended measurement

The MVP should support measuring:

- Admissions page visits.
- Admissions enquiry form submissions.
- WhatsApp contact clicks.
- Contact page visits.
- News article views.
- Gallery engagement.
- Traffic sources where consent and privacy requirements permit.

## 13.2 Suggested success indicators

| Metric | Purpose |
|---|---|
| Number of admissions enquiries | Measures lead generation |
| Form completion rate | Identifies friction in the enquiry journey |
| WhatsApp click-through rate | Measures interest in direct contact |
| Admissions page engagement | Evaluates admissions information usefulness |
| Mobile performance | Measures the experience on mobile devices |
| Content update frequency | Indicates whether staff can maintain the website |
| Enquiry follow-up rate | Helps evaluate the admissions response process |

Numerical targets should be set after establishing a baseline. The website must not claim that it increases admissions by a particular percentage without evidence.

Analytics integration is optional for the first deployment if it introduces disproportionate complexity. Basic, privacy-conscious event measurement can be added once the core enquiry flow works reliably.

---

# 14. Testing and Quality Assurance

## 14.1 Functional testing

Test all public pages, links, navigation items, forms, gallery interactions, and WhatsApp actions.

Verify that:

- Published news appears correctly.
- Draft news is not publicly accessible.
- Gallery changes are reflected on the public site.
- Valid enquiries are stored.
- Invalid enquiries are rejected.
- Administrators can update enquiry statuses.
- Public visitors cannot access private records.
- Editable settings update the appropriate public content.

## 14.2 Authentication and authorization testing

Test:

- Login with valid credentials.
- Login failure with invalid credentials.
- Access to the dashboard while logged out.
- Direct requests to protected backend endpoints.
- Logout and session invalidation.
- Disabled administrator accounts.
- Unauthorized file access.
- Attempts to change records outside the user's permissions.

## 14.3 Responsive testing

Test at representative viewport widths, including:

- 360 px mobile.
- 390 px mobile.
- 768 px tablet.
- 1024 px laptop or small desktop.
- 1440 px desktop.

Check navigation, forms, images, typography, spacing, and horizontal overflow.

## 14.4 Content testing

Verify:

- No fabricated institutional facts.
- No broken or placeholder production links.
- Correct logo and approved colours.
- Proper image captions and alternative text.
- Consistent contact details.
- Appropriate metadata.
- Correct spelling of the school name and location.
- No accidental exposure of unpublished content.

## 14.5 Automated tests

The implementation should include:

- Unit tests for validation and business rules.
- Integration tests for database-backed functionality.
- End-to-end tests for critical user journeys.
- Accessibility checks.
- Production build verification.
- Dependency and security checks appropriate to the stack.

Critical journeys should be automated where practical, particularly administrator login, content publication, enquiry submission, and protected-record access.

---

# 15. Acceptance Criteria for Project Completion

The MVP will be considered ready for launch when all mandatory criteria below are satisfied.

### Public website

- [ ] All required public pages are implemented.
- [ ] The website uses approved school branding and photographs.
- [ ] Navigation works on mobile and desktop.
- [ ] Admissions information is easy to locate.
- [ ] WhatsApp integration uses the approved school number.
- [ ] The admissions form validates and stores enquiries.
- [ ] News and gallery content are dynamically managed.
- [ ] Draft and unpublished content remain private.
- [ ] Contact information is verified.
- [ ] SEO fundamentals are implemented.
- [ ] Privacy information is accessible.
- [ ] Error, loading, and empty states are handled.

### Administration dashboard

- [ ] Authentication works securely.
- [ ] Protected routes and server-side authorization are implemented.
- [ ] Administrators can create, edit, publish, and unpublish news.
- [ ] Administrators can manage gallery content.
- [ ] Administrators can review and update enquiry statuses.
- [ ] Approved website content can be updated without editing source code.
- [ ] Invalid and unauthorized actions are rejected.
- [ ] Dashboard figures reflect actual database records.

### Technical quality

- [ ] Production build completes successfully.
- [ ] Database migrations are documented.
- [ ] Critical tests pass.
- [ ] Responsive and accessibility checks are completed.
- [ ] Secrets are not committed to version control.
- [ ] Production environment variables are documented.
- [ ] Backups and restoration procedures are established.
- [ ] Domain, HTTPS, deployment, and rollback procedures are documented.
- [ ] No critical security issues remain unresolved.

### Content approval

- [ ] School management has approved public-facing copy.
- [ ] The school has approved all published student photographs.
- [ ] Admissions procedures and requirements are verified.
- [ ] Contact and WhatsApp details are verified.
- [ ] All temporary placeholders have been removed from public pages.

---

# 16. MVP Versus Future Releases

## Release 1 — MVP

Must include:

- Public school website.
- Responsive homepage.
- About page.
- Academics page.
- Admissions page.
- Admissions enquiry form.
- WhatsApp integration.
- Dynamic news and announcements.
- Dynamic photo gallery.
- Contact page.
- Privacy notice.
- Secure admin authentication.
- Dashboard overview.
- News and gallery management.
- Admissions enquiry management.
- Editable website settings.
- Basic SEO and accessibility.
- Production deployment and documentation.

## Release 1.1 — Improvements

Potential enhancements after launch:

- Email notifications for new admissions enquiries.
- Additional administrator roles.
- Improved news categorization.
- More advanced content preview.
- Search across published news.
- Privacy-conscious analytics.
- Enhanced media organization.
- Search-engine optimization refinements.

## Release 2 — Admissions platform

Subject to school approval:

- Multi-step online application forms.
- Application reference numbers.
- Document uploads with protected storage.
- Application status tracking.
- Admissions staff workflows.
- Email or SMS notifications.
- More comprehensive audit logs.

## Release 3 — School management integration

Potential future modules:

- Student and parent accounts.
- Results and report cards.
- Attendance records.
- Fee management and payment integration.
- Timetables.
- Parent communication tools.
- Learning management integration.

These are not included in the MVP and should not be implemented pre-emptively.

---

# 17. Implementation Plan for the AI Coding Agent

The coding agent should work incrementally, validate its assumptions, and avoid implementing the entire product in one unreviewed pass.

## Phase 1: Project discovery and asset inspection

1. Inspect the existing repository and available project files.
2. Identify the supplied logo, brand colours, photographs, and official school information.
3. Determine whether a codebase already exists.
4. Identify any existing hosting, domain, database, or authentication constraints.
5. List missing information and assumptions.
6. Produce a proposed implementation plan.

**Exit condition:** The agent has a clear understanding of available assets, project constraints, and outstanding decisions.

## Phase 2: Design system and user interface

1. Establish the brand tokens.
2. Design the public layout and navigation.
3. Design the homepage and admissions conversion journey.
4. Design news and gallery layouts.
5. Design dashboard navigation and core management screens.
6. Implement responsive components and UI states.
7. Validate the design using the actual school assets.

**Exit condition:** The public and administrative interfaces are consistent, responsive, and ready for functional integration.

## Phase 3: Data architecture and authentication

1. Configure the database.
2. Implement schema and migrations.
3. Configure authentication.
4. Implement authorization rules.
5. Configure image storage.
6. Implement protected server-side operations.
7. Add environment variable validation.

**Exit condition:** The application has a secure, tested foundation for managing content and enquiries.

## Phase 4: CMS and public content

1. Implement news management.
2. Implement gallery management.
3. Implement editable website content and settings.
4. Connect public pages to stored content.
5. Implement publication rules.
6. Add server-side validation and safe content rendering.

**Exit condition:** Authorized staff can manage content and the public website displays the correct published data.

## Phase 5: Admissions and WhatsApp

1. Implement the enquiry form.
2. Persist enquiries in the database.
3. Implement dashboard enquiry management.
4. Configure the approved WhatsApp number.
5. Test validation, error handling, and successful submissions.
6. Verify that private enquiry information is never exposed publicly.

**Exit condition:** The admissions journey works end to end.

## Phase 6: Testing and deployment

1. Run automated tests.
2. Test mobile and desktop layouts.
3. Review accessibility and SEO.
4. Review authentication and authorization.
5. Configure production hosting and the database.
6. Configure the domain and HTTPS.
7. Establish backups.
8. Run production smoke tests.
9. Prepare operational documentation.

**Exit condition:** The deployed MVP meets the acceptance criteria and is approved for public launch.

---

# 18. Required Project Documentation

The coding agent should maintain the following project artifacts:

| File | Purpose |
|---|---|
| `PRD.md` | Product requirements and acceptance criteria |
| `design.md` | Brand system, layouts, components, and responsive behavior |
| `architecture.md` | Application architecture and major technical decisions |
| `database-schema.md` | Data entities, relationships, constraints, and indexes |
| `security-specification.md` | Authentication, authorization, privacy, and threat controls |
| `implementation-plan.md` | Development phases and task breakdown |
| `testing-strategy.md` | Test levels, coverage priorities, and acceptance tests |
| `deployment.md` | Environment setup, hosting, migrations, and release procedures |
| `README.md` | Project overview and local development instructions |
| `.env.example` | Required environment variables without real secrets |

The documents should agree with the actual implementation. If a major architectural decision changes, the relevant documentation must be updated.

---

# 19. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Missing or inaccurate school information | Use explicit placeholders and obtain management approval |
| Outdated news and gallery content | Provide a simple CMS and assign a content owner |
| Low admissions enquiry conversion | Make admissions actions visible and test the enquiry journey |
| Unresponsive school contact channel | Assign an admissions contact owner and publish verified alternatives |
| Unauthorized dashboard access | Enforce server-side authentication and authorization |
| Exposure of student information | Minimize data collection, restrict access, and approve images before publication |
| Poor mobile performance | Optimize images and test on representative mobile devices |
| Loss of enquiries | Use reliable database persistence and backups |
| Excessive MVP scope | Defer portals, payments, and school management features |
| Vendor or hosting dependency | Document deployment, exports, backups, and migration options |

---

# 20. Assumptions and Items Requiring Confirmation

The coding agent must maintain an explicit list of assumptions rather than silently treating them as facts.

| Item | Current position | Required action |
|---|---|---|
| Official school name | Dominion College, Oba-Ile, Akure | Confirm preferred official presentation |
| Location | Oba-Ile, Akure, Ondo State, Nigeria | Confirm the official postal or visitor address |
| Educational levels | Public information suggests junior and senior secondary education | Confirm with management |
| Logo and brand colours | Reported available | Inspect actual files |
| School photographs | Reported available | Inspect files and confirm publication permissions |
| Official history and mission | Not established in this PRD | Obtain approved text |
| Academic offering | Not fully verified | Confirm curriculum, subjects, and programmes |
| Admission requirements | Not established | Obtain approved procedures and requirements |
| Telephone and WhatsApp | Not supplied in this PRD | Obtain the correct school contact |
| Domain and hosting | Undecided | Check availability, ownership, budget, and technical fit |
| CMS administrator | Not yet assigned | Nominate an authorized account owner |
| Enquiry notification method | Dashboard is required; email notifications are optional | Confirm operational preference |
| Content retention policy | Not established | Obtain school approval |
| Analytics | Optional | Decide whether to implement in the MVP |

**Implementation rule:** No unverified school-specific fact may be presented as confirmed information on the public website.

Where a missing detail affects functionality, the agent should document the dependency and either use a safe configurable placeholder or request clarification. It must not fabricate telephone numbers, addresses, policies, achievements, or admission requirements.

---

# 21. Final Instructions to the AI Coding Agent

Treat this PRD as the baseline product specification.

Before writing substantial application code:

1. Inspect the existing project and available assets.
2. Identify conflicts between the PRD and the repository.
3. Record unresolved decisions.
4. Propose the final architecture and implementation sequence.
5. Identify security and privacy implications.
6. Establish the design system using the actual school branding.
7. Define the data model and acceptance tests.

During implementation:

- Build in small, testable increments.
- Prefer complete, functional features over decorative mockups.
- Connect public pages to real backend data.
- Never hardcode fake enquiries, dashboard statistics, or institutional claims as production data.
- Never implement fake authentication or frontend-only access controls.
- Keep secrets out of the repository.
- Test critical workflows before declaring them complete.
- Update documentation when implementation decisions change.
- Report incomplete functionality and unresolved dependencies honestly.

At completion, provide:

1. A working public website.
2. A functioning administrative dashboard.
3. A database schema and migration history.
4. A secure administrator setup procedure.
5. A sample environment configuration.
6. Automated tests and their results.
7. Local development instructions.
8. Production deployment instructions.
9. A list of remaining school-supplied content and launch dependencies.
10. A final acceptance checklist identifying any outstanding issues.

## Definition of done

The project is complete when Dominion College can present its approved identity online, publish and manage its own news and photographs, receive and manage admissions enquiries, connect prospective parents through WhatsApp, and maintain the website without routine code changes.

The final product must be secure, responsive, accessible, maintainable, and ready for deployment, with all school-specific information verified before public launch.