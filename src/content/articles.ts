// Long-form case studies / journey articles surfaced from /blog and /blog/:slug
// Conventions used in body strings:
//   - **bold** is rendered as a highlighted strong span (used for numbers and engine names)
//   - ## Heading at start of paragraph is rendered as a section subheading
//   - Paragraphs are separated by blank lines

export interface ArticleHighlight {
  value: string;     // e.g. "+45%", "£600k", "5 → 10 teams"
  label: string;     // e.g. "velocity", "margin protected"
}

export interface Article {
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  status: string;
  date: string;
  summary: string;
  highlights: ArticleHighlight[];
  body: string;
  disclaimer: string;
}

export const articles: Article[] = [
  {
    slug: 'order-risk-engine',
    title: 'Manufacturing Order Risk Engine',
    subtitle: 'Activating the data manufacturers already have',
    category: 'Manufacturing',
    status: 'Validated prototype · cohort forming',
    date: '2026-04-15',
    summary:
      'A precision-engineering firm turned scattered machine signals into £-quantified, role-specific decisions — and protected an order book without adding headcount.',
    highlights: [
      { value: '£100k+', label: 'avoided exposure' },
      { value: '£50k', label: 'repeat order saved' },
      { value: 'Hours', label: 'not days, to act' },
    ],
    body: `Most manufacturing leaders don't lack data. They lack timely, confident decisions when multiple pressures collide. At a mid-sized precision engineering firm, supervisors could see declining throughput and growing queues — but with several high-value orders competing for constrained capacity, the question "what should we fix first, and what does it cost if we don't?" wasn't answered until it was too late.

The **Order Risk Engine** was deployed as a decision layer on top of existing machine monitoring and planning tools. Within the first week it identified a critical CNC bottleneck affecting three concurrent aerospace orders — and quantified the cascading impact: **£60k–£95k exposure** across penalties, delayed revenue, and a conditional repeat order at risk. It then issued role-specific actions — maintenance intervention, production resequencing, customer communication — each tied to a defined decision window.

The team acted within hours. One delivery that would likely have missed its SLA by 1–2 days was completed on time, avoiding an estimated **£8k–£12k penalty**. A repeat order worth nearly **£50k** — previously at risk of cancellation — was secured. Across the pilot period, the firm identified multiple similar interventions with a **combined avoided exposure of over £100k**, achieved without additional headcount or capital.

The competitive advantage isn't collecting more data — it's acting on it faster. The **Order Risk Engine** doesn't replace existing systems; it activates them.`,
    disclaimer:
      'Engine validated as a prototype; numbers in this article are projected from engine design and the underlying data flow. Cohorts forming with UK precision-engineering firms.',
  },
  {
    slug: 'revenue-risk-engine',
    title: 'Construction Revenue Risk Engine',
    subtitle: 'Turning early signals into protected margin',
    category: 'Construction',
    status: 'Live · onboarding UK contractors',
    date: '2026-04-12',
    summary:
      'On a £40m education build, the engine surfaced a causal chain of small drifts and a 48–72 hour window to act — protecting an estimated £600k of margin without new data entry.',
    highlights: [
      { value: '£600k', label: 'margin protected' },
      { value: '48–72hr', label: 'decision window' },
      { value: '£40m', label: 'project, single deployment' },
    ],
    body: `Most construction projects don't fail suddenly — they drift. Small issues emerge on site, but by the time they reach senior decision-makers, the cost is already locked in.

On a **£40m education build**, the **Revenue Risk Engine** was deployed using only existing inputs: site notes, emails, programme data, coordination updates. Within days it identified a series of early-stage issues — a delayed slab pour, incomplete coordination of secondary steel supports, and a pending DNO utility application that hadn't been submitted. Individually, manageable. Combined, a clear causal chain pointing to downstream impact on M&E sequencing and commissioning. The engine quantified initial exposure at **£250k–£1.1m** and surfaced a narrow **48–72 hour decision window** within which corrective action could materially change the outcome.

The project team acted: re-sequencing the pour, accelerating coordination, submitting the utility application with an agreed energisation plan. The intervention reduced expected impact from a mid-range estimate of **~£700k to under £100k** — protection of approximately **£600k on a single project**. Weekly reporting cycles were replaced by continuous visibility. Decisions moved earlier.

The key isn't detection — most teams can already detect issues. It's the **timing and translation of signals into decisions**, with no new data entry required.`,
    disclaimer:
      'Engine live with the design above; UK contractors onboarding now. Numbers in this article are projected from a representative deployment scenario.',
  },
  {
    slug: 'the-players-mind',
    title: "The Player's Mind",
    subtitle: 'An AI-native mental fitness platform for grassroots football',
    category: 'Youth Sport & Wellbeing',
    status: 'Designed · cohort forming',
    date: '2026-04-30',
    summary:
      'A 144-session mental fitness curriculum with safeguarding-by-design — translating a six-figure content build into a four-figure software problem.',
    highlights: [
      { value: '£158k–£360k', label: 'what this would cost the traditional way' },
      { value: 'A fraction', label: 'of that, via small monthly subscription' },
      { value: '144 sessions', label: 'across 3 age bands' },
    ],
    body: `One in five UK children now has a probable mental disorder (NHS Digital, 2023). 77% of elite youth athletes report mental health challenges (IOC, 2023). Yet none of the **44,000 FA-affiliated clubs** in England have a structured, low-friction tool they can drop into a Tuesday-night training session. The FA's Grassroots Strategy 2024–28 explicitly calls for digital mental wellbeing tools; nothing on the market answers that brief at grassroots price points.

**The Player's Mind** is a three-app system covering the safeguarding triangle: a child-facing Player app, a Coach app with 14-day pattern-based wellbeing signals, and a Parent app delivering a weekly digest with conversation starters. Around it sits a **48-week curriculum across three age bands (7–9, 10–12, 13–14) — 144 sessions** in total, each 10–15 minutes. Safeguarding boundaries are enforced at the database layer: parents never see raw mood data, coaches never see individual answers, TPM itself never sees the check-ins. UK GDPR, KCSIE 2024 and the ICO Age-Appropriate Design Code are built into the schema, not bolted on.

A traditional youth-coaching video curriculum of this length and quality would cost **£1,100–£2,500 per session** — between **£158,000 and £360,000** for all 144 sessions. **The Player's Mind** delivers the same quality bar at a fraction of that cost, passed to clubs as a small monthly subscription rather than a six-figure content budget. The same pipeline — guided by a qualified psychotherapist — can re-render an updated session in hours rather than weeks, so the curriculum can respond to feedback from pilot clubs without a fresh production budget.

For a club, TPM is the first tool that lets a volunteer coach support a player's confidence, focus and resilience without pretending to be a therapist and without adding paperwork. For a parent, the weekly digest replaces the unanswerable "how was training?" with a specific, evidence-backed conversation starter. For a county FA, it's a digital wellbeing offering they can put in front of every grassroots club in their patch — with the safeguarding work already done. **A children's mental fitness curriculum has been translated from a six-figure content problem into a four-figure software problem.**`,
    disclaimer:
      'Traditional production cost (£1,100–£2,500 per session) reflects industry-standard rates for this type of curriculum. The Player\'s Mind is delivered to clubs at a small monthly subscription, with content production guided by a qualified psychotherapist. Engagement and cohort outcomes are projected from the engine design; pilots forming now.',
  },
  {
    slug: 'songita',
    title: 'Songita — Personalised Music & Video Engine',
    subtitle: 'Turning real customer experiences into shareable emotional assets',
    category: 'Hospitality & Guest Experience',
    status: 'Live with consumers and businesses',
    date: '2026-04-08',
    summary:
      'A full-stack engine that converts a few structured inputs into bespoke songs and synchronised videos — used in hospitality and consumer settings to lift review conversion and turn customers into distribution.',
    highlights: [
      { value: '50–90%', label: 'production time + cost cut' },
      { value: '25–40%', label: 'review conversion uplift' },
      { value: '10–15%', label: 'repeat-booking lift' },
    ],
    body: `Most hospitality operators and consumer brands deliver good experiences but fail to convert those moments into lasting emotional memory or shareable content. Emails, discounts and generic gifts rarely move the needle.

**Songita** is a full-stack personalised music production and distribution engine. Users make a small number of structured inputs — occasion, mood, genre, language, key personal details — while the system generates tailored lyrics, produces two high-quality song versions, and optionally creates a synchronised video aligning lyrics with relevant images and captions. **Production time and cost are cut by 50–90%**, while quality reads as intentional rather than automated.

Used in consumer settings (birthdays, anniversaries, milestones) and in business — particularly short-term rentals such as Airbnb, where guests receive a property-themed song on arrival and a tailored "thank you" song after their stay. Early implementations indicate a **25–40% uplift in review conversion**, more emotionally expressive feedback, and **10–15% increases in repeat-booking intent**. The qualitative shift matters more: outputs are frequently shared, turning each customer into a distribution point.

**Songita** is not a creative novelty — it's an operational layer that converts customer data into emotionally compelling, shareable assets, with a direct line to reviews, referrals and repeat revenue.`,
    disclaimer:
      'Live with consumers and businesses. Production-cost reduction is real and verified. Engagement uplift figures are early-implementation indicators.',
  },
  {
    slug: 'calarossa-pool-pass',
    title: 'Calarossa Pool Pass',
    subtitle: 'From honesty-box pool to operator-grade booking system',
    category: 'Leisure & Resort Operations',
    status: 'Live for summer 2026',
    date: '2026-04-25',
    summary:
      'A multi-tenant booking and redemption platform delivered to a Sardinian sporting resort — turning an informal amenity into a defensible, documented operation, with Teamsmiths aligned to the season\'s operational outcomes.',
    highlights: [
      { value: 'Live', label: 'for summer 2026' },
      { value: '12-table', label: 'multi-tenant architecture' },
      { value: '2-tap', label: 'staff scan flow' },
    ],
    body: `Calarossa is a residential resort in northern Sardinia where the upper pool, **Piscina Alta**, sits at the heart of the guest experience. Until this project the pool was run on goodwill — keys, paper lists, the manager's memory. With third-party tenants joining owners and family guests each summer, that approach was leaking revenue, exposing the operator to insurance and GDPR risk, and giving staff no defensible record of who was on the deck on any given day.

Teamsmiths designed and built the **Calarossa Pool Pass** — a multi-tenant booking and redemption platform on a Vite/React frontend with a Supabase backend, Stripe payments, and four serverless edge functions handling tenant checkout, owner subscriptions, upgrades, and webhook reconciliation. The data model spans **12 tables** including an immutable audit log. The staff-scan flow enforces pass validity dates server-side, includes a two-step ID-verification gate, supports walk-up issuance, and offers lost-wristband recovery — all in **Italian and English**, behind a GDPR-compliant cookie banner. The engagement is structured as an **outcome-based arrangement** that gives Teamsmiths visibility of the system's operational performance throughout the season.

Three concrete impacts. **Revenue:** a paid channel for tenant access where previously there was none, with Stripe in the client's name and reconciliation automated end-to-end. **Cost avoidance:** the legal, privacy and governance pack alone would typically run several thousand pounds at standard professional rates. **Productivity:** staff time per redemption drops from manual lookup to a **single QR scan** with a server-validated verdict, plus a per-day, per-pass audit log for insurance and tax.

Qualitatively, Piscina Alta moves from informal amenity to defensible, documented operation. Built to scale to the wider Calarossa estate without rework.`,
    disclaimer:
      'System delivered and live for summer 2026 (term to 31 October 2026). Architectural and operational outcomes described above are real. Commercial-impact figures will be confirmed against in-season data and added once the season closes.',
  },
  {
    slug: 'council-tax-deputee',
    title: 'Council Tax Deputee',
    subtitle: 'Compressing a 12-month process and restoring trust in council tax banding',
    category: 'Public Sector & Regulated Services',
    status: 'Build · Week 3 · England v1',
    date: '2026-04-20',
    summary:
      'A statute-anchored consumer app and a free Workbench for the HMRC Valuation Office — designed to screen invalid proposals at the front door and shorten the queue for valid ones.',
    highlights: [
      { value: '24m', label: 'UK properties' },
      { value: '6–12mo → 8–12wk', label: 'cycle-time target' },
      { value: '90+', label: 'automated tests' },
      { value: '£0 / £29 / £99', label: 'consumer tiers' },
    ],
    body: `England has approximately **24 million domestic properties**, each banded against the statutory valuation date of 1 April 1991. The body responsible has acknowledged that a challenge can take **up to 12 months** to resolve. The market that has filled that void is dominated by claim-management firms charging **20–50% of the first year's saving** as a success fee — deterring exactly the households most likely to be over-banded. The public queue then fills with weakly-evidenced or invalid proposals; valid challenges wait behind them.

**Council Tax Deputee** is two products built on a single statutory rules engine: a **Consumer App** that prepares property-owner challenges to the standard the Valuation Office actually applies, and a **Workbench** offered free to the HMRC Valuation Office to triage incoming cases. The engine codifies the Local Government Finance Act 1992, the Council Tax (Alteration of Lists and Appeals) Regulations 2009, and the operational tests in the gov.uk Council Tax Manual. As of week three of build, **more than 90 automated tests** cover route classification, eligibility, statutory time limits, and an eight-point invalidity scorecard.

Three measurable cost lines. **Cycle time:** internal modelling targets a reduction from the **6–12 month status quo to an 8–12 week pathway** for valid, well-evidenced challenges. **Consumer cost:** the **£0 Guided tier** and **£29 Review-and-Prepare** pack displace the **£80–£600** in cumulative success-fee deductions a typical claims firm extracts on a single Band E-to-D reduction. **Public-sector workload:** pre-screening at the front door is the single intervention that compresses the queue without changing the law.

Free, full access is reserved for households on Council Tax Reduction or means-tested benefits and for users referred by Citizens Advice, Shelter, and the Law Centres Network — populations most likely to be over-banded yet least likely to challenge.`,
    disclaimer:
      'Build at Week 3 — England v1. The legal substrate is fully implemented and tested (90+ automated tests). Cycle-time and consumer-cost figures are modelled from statutory rules and public data; HMRC Workbench in parallel build.',
  },
  {
    slug: 'meeting-intelligence-engine',
    title: 'Meeting Intelligence Engine',
    subtitle: 'Built under pressure, codified into the Teamsmiths pattern',
    category: 'Team Performance & Coaching',
    status: 'Live · the original Engine',
    date: '2026-04-05',
    summary:
      'The build the rest of the Teamsmiths engine portfolio sits on — created in the founder\'s own time, on fully anonymised data, when a global healthcare client doubled the scope of an agile transformation engagement with no extra resources.',
    highlights: [
      { value: '5 → 10', label: 'teams, same coach' },
      { value: '98%+', label: 'predictability (post-merger)' },
      { value: '+45%', label: 'velocity' },
      { value: '−15%', label: 'costs' },
    ],
    body: `The **Meeting Intelligence Engine** — known internally as Deputee — is the build that the rest of the Teamsmiths engine portfolio sits on. It was created not as a planned product but in response to a real client problem: a global healthcare organisation, mid-demerger, needed to scale agile delivery from 5 teams to 10 with **no additional resources, no additional headcount, no additional compensation**. The engine was built in the founder's own time, against fully anonymised data, while contracted as an independent consultant.

## Phase 1 — pre-merger: 40% velocity uplift across five teams

Five teams, low agile maturity, mission-critical consumer healthcare app behind schedule, demerger deadline non-negotiable. The intervention combined Scrum (rolled out across all 5 teams in 3 months in an adapted form), team restructuring around products, and an MVP approach. Outcomes: predictability **80% → 94%**, velocity **+40%**, costs **−8%**, performance gains equivalent to **adding 5 team members**, all business outcomes met ahead of schedule.

## Phase 2 — post-merger and the birth of Deputee

The same client expanded scope: **10 teams**, varying maturity, served by the same coach. Same coach, double the work, no extra resources. That pressure produced **Deputee**. Built in the founder's own time on anonymised data, the engine took the repeatable parts of the coaching cycle — meeting transcription, classification against the chosen framework (Scrum, BANT, MEDIC, Tuckman), translation of decisions into role-specific actions with deadlines, automated nudges, structured updates into Jira and the CRM — and ran them at the speed of the meeting. PI planning ran quarterly on SAFe lines.

Outcomes: predictability **over 98%** across all 10 teams, velocity **+45%**, costs **−15%**, performance gains equivalent to **adding 8 team members**, and a **single coach effectively running 10 teams** with productivity boosted by approximately 50%.

## What it became

Open-sourced as a reference foundation at github.com/segunosu/Deputee, this is the connective tissue across the Teamsmiths Engine portfolio. The **Construction Revenue Risk Engine** and the **Manufacturing Order Risk Engine** apply that logic to project and production data. **The Player's Mind** applies it to youth-athlete check-ins. **Calarossa Pool Pass** applies it to access control. **Council Tax Deputee** applies it to statutory rules and evidence packs.

Coaching, performance and decision-making at scale used to require headcount. With this pattern, the framework is the headcount — and the framework runs at the speed of the meeting, not the next 1:1.`,
    disclaimer:
      'Numbers in this article are real, from delivered engagements where the founder was contracted as an independent consultant. Deputee was built in the founder\'s own time on fully anonymised data.',
  },
];

export const getArticleBySlug = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);
