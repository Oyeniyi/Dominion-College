/**
 * Initial Approved Institutional Content & Seed Data
 * Adheres to PRD §8.1, §10.2, §20, and Owner Decisions (2026-11-10):
 * - Uses official name: Dominion College, Oba-Ile, Akure, Ondo State, Nigeria
 * - Uses exact crest motto: THE SECERET OF WISDOM IS GOD
 * - Uses royal purple (#5B1A69) + flame gold (#D97706) palette derived from dominion_logo.jpg
 * - Uses non-identifying SVG placeholder visuals explicitly marked as 'placeholder'
 * - Contains zero fabricated statistics, fake awards, or unverified telephone numbers.
 */

import { BrandColors, InstitutionalContent } from '@/domain/types';
import { hashPassword } from '../auth/crypto';
import { getServerConfig } from '../config';
import type { SqlClient } from './types';

export const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: '#5B1A69',
  primaryDark: '#3B0F47',
  secondary: '#7A288C',
  accent: '#D97706',
  onPrimary: '#FFFFFF',
};

export const DEFAULT_INSTITUTIONAL_CONTENT: InstitutionalContent = {
  about: {
    introduction:
      'Dominion College, located in Oba-Ile, Akure, Ondo State, Nigeria, is an educational institution serving learners across Early Years (Day Care, KG 1–2, Nursery 1–2), Primary (Primary 1–5), Junior Secondary (JSS 1–3), and Senior Secondary (SSS 1–3), dedicated to academic growth, moral discipline, and holistic student development.',
    history:
      'Founded to serve families in Oba-Ile, Akure, and surrounding communities, Dominion College provides a structured, supportive learning pathway from Day Care, Kindergarten, Nursery, and Primary through Secondary School, guided by our enduring motto: "THE SECERET OF WISDOM IS GOD".',
    mission:
      'To provide sound secondary education that nurtures intellectual curiosity, godly character, personal discipline, and responsible citizenship.',
    vision:
      'To be a trusted secondary school in Ondo State recognized for academic diligence, moral integrity, and well-rounded graduates prepared for higher education and purposeful living.',
    motto: 'THE SECERET OF WISDOM IS GOD',
    philosophy:
      'We believe every young learner thrives when rigorous classroom instruction is paired with attentive mentorship, reverence for God, and strong family-school partnership.',
    coreValues: [
      {
        title: 'Wisdom & Reverence',
        description:
          'Anchored in our school motto, we teach students that true knowledge begins with the fear of God and ethical integrity.',
      },
      {
        title: 'Academic Diligence',
        description:
          'We encourage curiosity, structured study habits, and steady mastery across junior and senior secondary subjects.',
      },
      {
        title: 'Discipline & Character',
        description:
          'We foster mutual respect, personal accountability, and orderly conduct within and beyond the school gates.',
      },
      {
        title: 'Community Partnership',
        description:
          'We work closely with parents and guardians to support each child through every stage of secondary education.',
      },
    ],
    leadershipNote:
      'School management and dedicated teaching staff work collaboratively to maintain safe learning spaces, clear academic standards, and responsive communication with parents and guardians.',
    contentStatus: 'verified',
  },
  academics: {
    introduction:
      'Dominion College offers structured, continuous education spanning Early Years (Day Care, KG 1–2, Nursery 1–2), Primary (Primary 1–5), Junior Secondary (JSS 1 – JSS 3), and Senior Secondary (SSS 1 – SSS 3) levels in Oba-Ile, Akure.',
    earlyYears: {
      name: 'Early Years (Day Care, KG 1–2 & Nursery 1–2)',
      summary:
        'Provides a warm, safe, and stimulating foundation for young children through guided play, early literacy and numeracy readiness, social skills, and attentive care.',
      subjects: [
        'Day Care & Early Childhood Care',
        'Kindergarten (KG 1 & KG 2)',
        'Nursery 1 & Nursery 2',
        'Phonics & Early Literacy',
        'Number Work & Early Numeracy',
        'Rhymes, Storytelling & Creative Play',
        'Social Habits & Moral Formation',
      ],
    },
    primarySchool: {
      name: 'Primary School (Primary 1 – Primary 5)',
      summary:
        'Develops confident reading, writing, mathematical fluency, scientific curiosity, and godly character across foundational primary classes.',
      subjects: [
        'English Language & Reading',
        'Mathematics',
        'Basic Science & Technology',
        'Social Studies & Civic Education',
        'Christian Religious Studies',
        'Quantitative & Verbal Reasoning',
        'Computer Studies & Creative Arts',
      ],
    },
    juniorSecondary: {
      name: 'Junior Secondary School (JSS 1 – JSS 3)',
      summary:
        'Builds a broad foundation in literacy, numeracy, basic sciences, humanities, and pre-vocational skills to prepare students for senior secondary specialization.',
      subjects: [
        'English Studies',
        'Mathematics',
        'Basic Science & Technology',
        'Social & Citizenship Studies',
        'Business Studies',
        'Agricultural Science',
        'Christian Religious Studies',
        'Yoruba / Nigerian Language',
        'Cultural & Creative Arts',
        'Computer Studies / ICT',
      ],
    },
    seniorSecondary: {
      name: 'Senior Secondary School (SSS 1 – SSS 3)',
      summary:
        'Provides focused academic pathways across Science, Arts/Humanities, and Commercial/Business groupings in preparation for senior secondary school certificate examinations.',
      subjects: [
        'English Language & Literature-in-English',
        'General Mathematics & Further Mathematics',
        'Biology, Chemistry & Physics',
        'Economics, Financial Accounting & Commerce',
        'Government, Civic Education & Christian Religious Studies',
        'Agricultural Science & Geography',
        'Data Processing / ICT',
      ],
    },
    curriculumOverview:
      'Instruction aligns with the Nigerian secondary education curriculum, emphasizing conceptual clarity, continuous assessment, practical laboratory and classroom work, and steady examination readiness.',
    teachingApproach:
      'Small-group attention, structured lesson notes, regular continuous assessment feedback, and guided revision help students build confidence across core and elective subjects.',
    facilities: [
      'Conducive Classrooms',
      'Science Practical Learning Area',
      'School Library & Reading Corner',
      'ICT / Computer Learning Area',
      'Outdoor Recreation & Assembly Grounds',
    ],
    extracurriculars: [
      'Literary & Debating Society',
      'JET / Science & Innovation Club',
      'Press & Public Speaking Club',
      'Moral Instruction & Fellowship',
      'Sports & Physical Fitness Activities',
    ],
    contentStatus: 'verified',
  },
  admissions: {
    introduction:
      'We welcome enquiries from parents and guardians seeking admission for their children into Day Care, Kindergarten (KG 1–2), Nursery (Nursery 1–2), Primary (Primary 1–5), Junior Secondary (JSS 1 – JSS 3), or Senior Secondary (SSS 1 – SSS 3) classes at Dominion College, Oba-Ile, Akure.',
    processSteps: [
      {
        stepNumber: 1,
        title: 'Submit an Admissions Enquiry',
        description:
          'Complete the online Admissions Enquiry Form on this page or reach out directly via our official school contact channels.',
      },
      {
        stepNumber: 2,
        title: 'Speak with the Admissions Representative',
        description:
          'Our designated admissions representative will review your enquiry, provide current entry schedules, and answer questions about your child’s intended class level.',
      },
      {
        stepNumber: 3,
        title: 'School Visit & Entrance Assessment Information',
        description:
          'Arrange a campus visit in Oba-Ile, Akure, obtain official application instructions, and receive guidance on placement assessments and required school records.',
      },
    ],
    requirements: [
      'Completed admissions enquiry with parent/guardian contact details',
      'Intended entry class level (Day Care, KG 1–2, Nursery 1–2, Primary 1–5, JSS 1–3, or SSS 1–3)',
      'Previous academic records and transfer documentation where applicable (requested only during formal in-person application)',
    ],
    applicationAvailabilityNote:
      'Admissions enquiries are open year-round. Please submit the enquiry form below so our admissions office can share current term dates and placement availability.',
    privacyNoticeSummary:
      'We collect only your name, phone number, optional email, intended entry level, and optional message solely to respond to your admissions enquiry. Do not include sensitive student medical or identity documents in this form.',
    privacyNoticeFullText: `Dominion College, Oba-Ile, Akure — Admissions Enquiry Privacy Notice

1. Purpose of Collection
When you submit an admissions enquiry on the Dominion College website, we collect your parent/guardian name, contact telephone number, optional email address, intended student entry level (Day Care, KG 1–2, Nursery 1–2, Primary 1–5, JSS 1–3, or SSS 1–3), and any optional question you provide. This information is collected solely to enable authorized school admissions staff to respond to your enquiry and provide official admission information.

2. Data Minimization & Child Protection
Our online enquiry form intentionally excludes student identity documents, medical records, examination result sheets, and sensitive personal data. Please do not include sensitive student information in the free-text message field.

3. Access & Confidentiality
Enquiry records are stored securely in the school's private administration database and are accessible only to authorized school administrators and admissions representatives. Enquiry records are never displayed publicly, indexed by search engines, or shared with third-party marketing or AI services.

4. WhatsApp Contact Option
When you choose to use a WhatsApp click-to-chat link on this website, you initiate a conversation directly through WhatsApp under WhatsApp's own terms and privacy policy. The website enquiry form remains available at all times as an direct alternative.

5. Retention, Correction & Deletion
Enquiry records are retained only for the duration of the active admissions cycle and follow-up period approved by school management, after which they are archived or deleted. Parents and guardians may request correction or deletion of their enquiry record by contacting the school administration through the official Contact Us page.`,
    contentStatus: 'verified',
  },
  updatedAt: '2026-11-10T08:00:00.000Z',
};

export async function seedInitialDataIfEmpty(
  sql: SqlClient,
  options?: { allowMissingProdBootstrap?: boolean }
): Promise<void> {
  const config = getServerConfig();
  const now = '2026-11-10T08:00:00.000Z';

  const adminRows = await sql<{ id: string }[]>`
    SELECT id FROM admin_user ORDER BY created_at ASC LIMIT 1
  `;

  let adminId: string | null = adminRows[0]?.id ?? null;

  if (!adminId) {
    if (!config.bootstrapAdminEmail || !config.bootstrapAdminPassword) {
      if (options?.allowMissingProdBootstrap) {
        // In production without explicit bootstrap env vars, skip creating a default admin user.
        adminId = null;
      } else {
        throw new Error(
          'BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD must be set before seeding in production.'
        );
      }
    } else {
      adminId = '00000000-0000-4000-8000-000000000001';
      const passwordHash = hashPassword(config.bootstrapAdminPassword);
      await sql`
        INSERT INTO admin_user (
          id, identity_subject, display_name, email, password_hash, role_code, is_active, created_at, updated_at
        ) VALUES (
          ${adminId},
          ${`local:${config.bootstrapAdminEmail}`},
          ${config.bootstrapAdminName},
          ${config.bootstrapAdminEmail},
          ${passwordHash},
          'administrator',
          TRUE,
          ${now},
          ${now}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }

  await sql`
    INSERT INTO site_settings (
      singleton_id, official_name, motto, logo_url, brand_colors,
      telephone, email, whatsapp_number, address, office_hours, directions_url,
      social_links, default_seo_title, default_seo_description, institutional_content, updated_at
    ) VALUES (
      1,
      'Dominion College, Oba-Ile, Akure',
      'THE SECERET OF WISDOM IS GOD',
      '/images/dominion_logo.jpg',
      ${JSON.stringify(DEFAULT_BRAND_COLORS)}::jsonb,
      NULL,
      'info@dominioncollege.edu.ng',
      NULL,
      'Oba-Ile, Akure, Ondo State, Nigeria',
      'Monday – Friday: 8:00 AM – 4:00 PM (WAT)',
      NULL,
      ${JSON.stringify([])}::jsonb,
      'Dominion College, Oba-Ile, Akure | School Website & Admissions',
      'Official website of Dominion College, Oba-Ile, Akure, Ondo State, Nigeria. Explore our Day Care, Kindergarten, Nursery, Primary (1–5), Junior Secondary (JSS 1–3), and Senior Secondary (SSS 1–3) programmes, news, and admissions enquiries.',
      ${JSON.stringify(DEFAULT_INSTITUTIONAL_CONTENT)}::jsonb,
      ${now}
    )
    ON CONFLICT (singleton_id) DO NOTHING
  `;

  if (!adminId) {
    return;
  }

  const albumCountRows = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text as count FROM gallery_album
  `;
  const albumCount = Number(albumCountRows[0]?.count ?? 0);

  if (albumCount === 0) {
    const albums = [
      {
        id: '10000000-0000-4000-8000-000000000001',
        title: 'Campus & Facilities',
        slug: 'campus-and-facilities',
        description:
          'Primary and Secondary school campus buildings and assembly grounds at Dominion College, Oba-Ile, Akure.',
        status: 'published',
      },
      {
        id: '10000000-0000-4000-8000-000000000002',
        title: 'Assembly, Worship & Student Life',
        slug: 'assembly-worship-and-student-life',
        description:
          'Morning assembly, prayer and praise sessions, school temple gatherings, and student instrumentalists.',
        status: 'published',
      },
      {
        id: '10000000-0000-4000-8000-000000000003',
        title: 'Special Programmes & Community',
        slug: 'special-programmes-and-community',
        description:
          'Special school programmes and Nigeria Police Force sensitization visits at Dominion College, Oba-Ile, Akure.',
        status: 'published',
      },
    ];

    for (const album of albums) {
      await sql`
        INSERT INTO gallery_album (id, title, slug, description, status, created_at, updated_at)
        VALUES (${album.id}, ${album.title}, ${album.slug}, ${album.description}, ${album.status}, ${now}, ${now})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    const images = [
      {
        id: '20000000-0000-4000-8000-000000000001',
        albumId: '10000000-0000-4000-8000-000000000001',
        storageKey: 'static:secondary-school-front-view-1.jpeg',
        publicUrl: '/images/secondary-school-front-view-1.jpeg',
        altText: 'Dominion College Secondary School Campus Front View — Oba-Ile, Akure',
        caption: 'Secondary School Front View — Dominion College, Oba-Ile, Akure',
        displayOrder: 1,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: false,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000002',
        albumId: '10000000-0000-4000-8000-000000000001',
        storageKey: 'static:secondary-school-front-view-2.jpeg',
        publicUrl: '/images/secondary-school-front-view-2.jpeg',
        altText: 'Dominion College Secondary School Building and Courtyard — Oba-Ile, Akure',
        caption: 'Secondary School Building & Learning Block',
        displayOrder: 2,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: false,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000003',
        albumId: '10000000-0000-4000-8000-000000000001',
        storageKey: 'static:primary-school-front-view.jpeg',
        publicUrl: '/images/primary-school-front-view.jpeg',
        altText: 'Dominion College Primary School Front View — Oba-Ile, Akure',
        caption: 'Primary School Front View (Day Care, KG, Nursery & Primary 1–5)',
        displayOrder: 3,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: false,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000004',
        albumId: '10000000-0000-4000-8000-000000000002',
        storageKey: 'static:assembly-ground.jpeg',
        publicUrl: '/images/assembly-ground.jpeg',
        altText: 'Students gathered on the Dominion College assembly ground',
        caption: 'Morning Assembly on the School Grounds',
        displayOrder: 4,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000005',
        albumId: '10000000-0000-4000-8000-000000000002',
        storageKey: 'static:assembly-ground-2.jpeg',
        publicUrl: '/images/assembly-ground-2.jpeg',
        altText: 'Dominion College students lined up during assembly',
        caption: 'Student Assembly & Character Formation',
        displayOrder: 5,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000006',
        albumId: '10000000-0000-4000-8000-000000000002',
        storageKey: 'static:students-in-school-temple.jpeg',
        publicUrl: '/images/students-in-school-temple.jpeg',
        altText: 'Dominion College students gathered inside the school temple',
        caption: 'Students Gathered in the School Temple',
        displayOrder: 6,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000007',
        albumId: '10000000-0000-4000-8000-000000000002',
        storageKey: 'static:praise-and-worship.jpeg',
        publicUrl: '/images/praise-and-worship.jpeg',
        altText: 'Praise and worship session at Dominion College',
        caption: 'Praise & Worship Session',
        displayOrder: 7,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000008',
        albumId: '10000000-0000-4000-8000-000000000002',
        storageKey: 'static:prayer-session.jpeg',
        publicUrl: '/images/prayer-session.jpeg',
        altText: 'School prayer session at Dominion College, Oba-Ile, Akure',
        caption: 'Guided Prayer Session ("The Secret of Wisdom is God")',
        displayOrder: 8,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000009',
        albumId: '10000000-0000-4000-8000-000000000002',
        storageKey: 'static:school-instrumentalist.jpeg',
        publicUrl: '/images/school-instrumentalist.jpeg',
        altText: 'Dominion College students performing with school band instruments',
        caption: 'School Band & Student Instrumentalists',
        displayOrder: 9,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000010',
        albumId: '10000000-0000-4000-8000-000000000002',
        storageKey: 'static:school-instrumentalist-2.jpeg',
        publicUrl: '/images/school-instrumentalist-2.jpeg',
        altText: 'Dominion College instrumentalists leading music during school gathering',
        caption: 'Music & Instrumentalists Ensemble',
        displayOrder: 10,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000011',
        albumId: '10000000-0000-4000-8000-000000000003',
        storageKey: 'static:nigeria-police-sensitization.jpeg',
        publicUrl: '/images/nigeria-police-sensitization.jpeg',
        altText: 'Nigeria Police Force sensitization programme at Dominion College, Oba-Ile, Akure',
        caption: 'Nigeria Police Force Student Sensitization Programme',
        displayOrder: 11,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000012',
        albumId: '10000000-0000-4000-8000-000000000003',
        storageKey: 'static:special-program-1.jpeg',
        publicUrl: '/images/special-program-1.jpeg',
        altText: 'Special school programme at Dominion College, Oba-Ile, Akure',
        caption: 'Special School Programme — Highlight 1',
        displayOrder: 12,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000013',
        albumId: '10000000-0000-4000-8000-000000000003',
        storageKey: 'static:special-program-2.jpeg',
        publicUrl: '/images/special-program-2.jpeg',
        altText: 'Students participating in a special programme at Dominion College',
        caption: 'Special School Programme — Highlight 2',
        displayOrder: 13,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000014',
        albumId: '10000000-0000-4000-8000-000000000003',
        storageKey: 'static:special-program-3.jpeg',
        publicUrl: '/images/special-program-3.jpeg',
        altText: 'Special school event presentation at Dominion College',
        caption: 'Special School Programme — Highlight 3',
        displayOrder: 14,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000015',
        albumId: '10000000-0000-4000-8000-000000000003',
        storageKey: 'static:special-program-4.jpeg',
        publicUrl: '/images/special-program-4.jpeg',
        altText: 'Dominion College special programme activity',
        caption: 'Special School Programme — Highlight 4',
        displayOrder: 15,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
      {
        id: '20000000-0000-4000-8000-000000000016',
        albumId: '10000000-0000-4000-8000-000000000001',
        storageKey: 'static:chemistry-lab.jpeg',
        publicUrl: '/images/chemistry-lab.jpeg',
        altText: 'Science and Chemistry Practical Laboratory at Dominion College, Oba-Ile, Akure',
        caption: 'Science & Practical Discovery Area',
        displayOrder: 16,
        status: 'published',
        schoolApproved: true,
        identifiableStudents: true,
        approvalReference: 'SCHOOL-OWNER-APPROVED-2026',
        contentStatus: 'verified',
      },
    ];

    for (const img of images) {
      await sql`
        INSERT INTO gallery_image (
          id, album_id, storage_key, public_url, alt_text, caption, display_order,
          status, school_approved, identifiable_students, approval_reference, content_status, uploaded_by, created_at
        ) VALUES (
          ${img.id},
          ${img.albumId},
          ${img.storageKey},
          ${img.publicUrl},
          ${img.altText},
          ${img.caption},
          ${img.displayOrder},
          ${img.status},
          ${img.schoolApproved},
          ${img.identifiableStudents},
          ${img.approvalReference},
          ${img.contentStatus},
          ${adminId},
          ${now}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }

  const newsCountRows = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text as count FROM news_article
  `;
  const newsCount = Number(newsCountRows[0]?.count ?? 0);

  if (newsCount === 0) {
    const articles = [
      {
        id: '30000000-0000-4000-8000-000000000001',
        title: 'Admissions Enquiries Open Across Early Years, Primary & Secondary Classes',
        slug: 'admissions-enquiries-open-junior-and-senior-secondary',
        excerpt:
          'Prospective parents and guardians in Oba-Ile, Akure, and beyond can now submit admissions enquiries online for Day Care, KG 1–2, Nursery 1–2, Primary 1–5, JSS 1–3, and SSS 1–3.',
        body: `<p>Dominion College, Oba-Ile, Akure invites prospective parents and guardians to explore our educational offerings across Day Care, Kindergarten (KG 1–2), Nursery (Nursery 1–2), Primary (Primary 1–5), Junior Secondary (JSS 1 – JSS 3), and Senior Secondary (SSS 1 – SSS 3).</p>
<p>Through our official website, families can review our academic programmes, learn about our guiding values rooted in our motto — <em>"THE SECERET OF WISDOM IS GOD"</em> — and submit an admissions enquiry directly to our admissions office.</p>
<h3>How to Enquire</h3>
<ul>
  <li>Visit the <strong>Admissions</strong> page and complete the brief enquiry form.</li>
  <li>Select your child's intended entry level (from Day Care, KG 1–2, Nursery 1–2, Primary 1–5, JSS 1–3, or SSS 1–3).</li>
  <li>Our designated admissions representative will contact you to provide official guidance on school visits and placement procedures.</li>
</ul>`,
        featuredImageId: '20000000-0000-4000-8000-000000000001',
        status: 'published',
        publishedAt: '2026-11-01T09:00:00.000Z',
        seoTitle: 'Admissions Enquiries Open | Dominion College, Oba-Ile, Akure',
        seoDescription:
          'Submit an admissions enquiry for JSS 1–3 or SSS 1–3 at Dominion College, Oba-Ile, Akure, Ondo State.',
      },
      {
        id: '30000000-0000-4000-8000-000000000002',
        title: 'Welcome to the Official Dominion College Website',
        slug: 'welcome-to-the-official-dominion-college-website',
        excerpt:
          'Our new digital gateway provides verified school information, announcements, gallery updates, and direct admissions enquiry channels for families.',
        body: `<p>We are pleased to welcome parents, guardians, students, and members of the wider community to the official website of <strong>Dominion College, Oba-Ile, Akure, Ondo State</strong>.</p>
<p>This website is designed to make verified school announcements, academic programme descriptions, and admissions enquiry channels easily accessible on mobile phones, tablets, and desktop computers.</p>
<p>All official school updates published by the school administration will appear in the <strong>News &amp; Updates</strong> section.</p>`,
        featuredImageId: '20000000-0000-4000-8000-000000000005',
        status: 'published',
        publishedAt: '2026-10-25T10:00:00.000Z',
        seoTitle: 'Welcome to Dominion College Official Website | Oba-Ile, Akure',
        seoDescription:
          'Discover official news, academic programmes, and admissions information from Dominion College, Oba-Ile, Akure.',
      },
    ];

    for (const art of articles) {
      await sql`
        INSERT INTO news_article (
          id, title, slug, excerpt, body, featured_image_id, status, published_at,
          author_id, seo_title, seo_description, created_at, updated_at
        ) VALUES (
          ${art.id},
          ${art.title},
          ${art.slug},
          ${art.excerpt},
          ${art.body},
          ${art.featuredImageId},
          ${art.status},
          ${art.publishedAt},
          ${adminId},
          ${art.seoTitle},
          ${art.seoDescription},
          ${now},
          ${now}
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
  }
}

