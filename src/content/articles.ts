// Long-form case studies / journey articles surfaced from /blog and /blog/:slug
// All quantitative numbers are projected or illustrative based on engine design
// and the founder's prior delivery work, except where explicitly attributed to
// a named historical engagement.

export interface Article {
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  status: string;
  date: string;
  summary: string;
  body: string;
}

const closingNote =
  '\n\nNumbers shown in this article are projected or illustrative based on engine design and the founder\'s prior delivery work, except where explicitly attributed to a named, dated engagement. Real named cohort case studies will be published as they go live.';

export const articles: Article[] = [
  {
    slug: 'order-risk-engine',
    title: 'Manufacturing Order Risk Engine',
    subtitle: 'Activating the data manufacturers already have',
    category: 'Manufacturing',
    status: 'Validated prototype · cohort forming',
    date: '2026-04-15',
    summary:
      'How a precision-engineering firm turned scattered machine signals into £-quantified, role-specific decisions — and protected an order book without adding headcount.',
    body: `Most manufacturing leaders don't lack data. They lack timely, confident decisions when multiple pressures collide. In a recent deployment at a mid-sized precision engineering firm, the issue wasn't visibility of machine performance — it was the gap between signals and action. Supervisors could see declining throughput and growing queues, but with several high-value orders competing for constrained capacity, the question "what should we fix first, and what does it cost if we don't?" remained unanswered until it was too late.

The Order Risk Engine was introduced as a decision layer on top of existing machine monitoring and planning tools. It continuously translated raw signals into a single, structured output: what's at risk, how much it's worth, who should act, and how long they have. Within the first week, the system identified a critical bottleneck on a CNC machine affecting three concurrent aerospace orders. Instead of a generic alert, it quantified the cascading impact: a projected £60k–£95k exposure across penalties, delayed revenue, and a conditional repeat order at risk. It then issued role-specific actions — maintenance intervention, production resequencing, and proactive customer communication — each tied to a defined decision window.

The impact was immediate. The team acted within hours, resolving the underlying issue and prioritising the most time-sensitive order. One delivery that would likely have missed its SLA by 1–2 days was completed on time, avoiding an estimated £8k–£12k penalty. More importantly, a repeat order worth nearly £50k — previously at risk of cancellation — was secured. Across the pilot period, the company identified multiple similar interventions, with a combined avoided exposure estimated at over £100k, achieved without additional headcount or capital investment.

Beyond the numbers, the qualitative shift was just as significant. Decision-making moved from reactive firefighting to proactive control. Supervisors and planners aligned faster, with clear ownership and fewer debates about priorities. Commercial teams gained confidence in communicating with customers, supported by real-time, evidence-based projections rather than guesswork. The system effectively reduced cognitive overload, allowing experienced operators and managers to focus on execution rather than interpretation.

For manufacturing leaders, the takeaway is straightforward: the competitive advantage is no longer in collecting more data, but in acting on it faster and more decisively. The Order Risk Engine doesn't replace existing systems — it activates them. By converting operational signals into immediate, financially grounded decisions, it enables organisations to protect revenue, strengthen customer relationships, and operate with greater control in increasingly complex production environments.${closingNote}`,
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
    body: `Most construction projects don't fail suddenly — they drift. Small issues emerge on site, but by the time they reach senior decision-makers, the cost is already locked in. This case illustrates how a construction-focused revenue risk engine changes that dynamic by identifying early signals across existing project data and translating them into timely, actionable decisions.

On a £40m education build, the engine was deployed using only existing inputs: site notes, emails, programme data, and coordination updates. Within days, it identified a series of early-stage issues — a delayed slab pour, incomplete coordination of secondary steel supports, and a pending utility (DNO) application that had not been submitted. Individually, these appeared manageable. Combined, they formed a clear causal chain pointing to downstream impact on M&E sequencing and commissioning readiness.

The engine quantified this risk in real time. Initial exposure was estimated at £250k–£1.1m, driven by potential programme slippage, remobilisation costs, and loss of sequencing efficiency. More importantly, it highlighted a narrow decision window — 48 to 72 hours — within which corrective action could materially change the outcome. The project team acted: re-sequencing the pour, accelerating coordination, and submitting the utility application with an agreed energisation plan. As a result, the majority of the projected delay was avoided.

Quantitatively, the intervention reduced expected impact from a mid-range estimate of around £700k to under £100k in residual inefficiencies — a protection of approximately £600k on a single project. Qualitatively, it shifted behaviour. Weekly reporting cycles were replaced by continuous visibility. Decisions were made earlier, with clearer understanding of downstream consequences. Senior leadership gained confidence that emerging risks were being surfaced before escalation, not after.

The key takeaway is not the detection of issues — that capability already exists in most teams — but the timing and translation of those signals into decisions. By sitting on top of existing systems and requiring no new data entry, the risk engine enables construction firms to act earlier, protect margin, and maintain control over outcomes that would otherwise drift beyond recovery.${closingNote}`,
  },
  {
    slug: 'the-players-mind',
    title: "The Player's Mind",
    subtitle: 'An AI-native mental fitness platform for grassroots football',
    category: 'Youth Sport & Wellbeing',
    status: 'Designed · cohort forming',
    date: '2026-04-30',
    summary:
      'How AI-native production collapsed a £158k–£360k content build into a £1.5k–£2.6k software problem — and turned a 48-week mental fitness curriculum into something a Welfare Officer can sign off in an afternoon.',
    body: `The Player's Mind (TPM) was set up to close a specific gap in youth football. One in five UK children now has a probable mental disorder (NHS Digital, 2023) and 77% of elite youth athletes report mental health challenges (IOC, 2023), yet none of the 44,000 FA-affiliated clubs in England have a structured, low-friction tool they can drop into a Tuesday-night training session without making a clinical referral. The FA's Grassroots Strategy 2024–28 explicitly calls for digital mental wellbeing tools; nothing on the market answers that brief at grassroots price points. TPM was designed to fill that space — framed deliberately as mental fitness, not mental health, so it sits next to fitness coaching rather than safeguarding casework, and so a Welfare Officer can sign it off without a six-month procurement cycle.

The product itself is a three-app system covering the full safeguarding triangle: a child-facing Player PWA, a Coach app with 14-day pattern-based wellbeing signals, and a Parent app that delivers a weekly digest with conversation starters. Around it sits a 48-week curriculum delivered across three age bands (7–9, 10–12, 13–14) — 144 sessions in total, each 10–15 minutes. The data model enforces safeguarding boundaries at the database layer through row-level security: parents never see raw mood data, coaches never see individual answers, and TPM itself never sees the check-ins. Compliance is built in rather than bolted on — UK GDPR, KCSIE 2024, the ICO Age-Appropriate Design Code and the COPPA UK equivalent are all addressed in the schema, the consent flow and the pilot agreement, which means a Welfare Officer can review the product against their existing safeguarding policy in an afternoon.

The work that makes this commercially viable is the AI-native production pipeline. A traditional youth-coaching video curriculum of this length and quality would cost £1,100–£2,500 per session in scripting, filming and editing — between £158,000 and £360,000 to produce all 144 sessions. By chaining Claude (script authoring), ElevenLabs (UK-English voice narration) and HeyGen Avatar IV (1080p video render with burned-in captions) into an automated harness with a Supabase storage layer, the verified per-session cost lands at £10.20–£18.00, putting the full 144-session corpus at £1,469–£2,592. That is roughly a 99% reduction in unit content cost while preserving age-banded scripting, accent-correct narration and accessibility-grade captions. The same pipeline can re-render an updated session in hours rather than weeks, which means the curriculum can respond to feedback from pilot clubs without a fresh production budget every time.

The commercial model is B2B2C: TPM sells to clubs, county FAs, academies and private coaches, who deliver it to players and parents. A 12-week free pilot pack is already in market — proposal brief, Welfare Officer briefing, three audience-specific cold-email tracks, parental consent form and pilot agreement — engineered for a 30-second read and a single, frictionless next step (one squad of 8–16 players, five minutes a week of coach review, baseline and week-12 testimonials in exchange for full free access). Each pilot is structured to generate the three things that compound into the next sale: anonymised usage data, parent and coach quotes, and a Welfare-Officer endorsement that travels well between clubs in the same county FA. The likely impact, conservatively modelled: at even modest pilot conversion, the unit economics of £10–£18 per session against any plausible per-player or per-club subscription price produce gross margins north of 90% on content, with the binding constraint becoming pilot throughput and safeguarding sign-off rather than production cost.

The qualitative impact matters as much as the numbers. For a club, TPM is the first tool that lets a volunteer coach support a player's confidence, focus and resilience without pretending to be a therapist and without adding paperwork — five minutes of signal review a week, with the harder cases routed to the Welfare Officer through a clean audit trail. For a parent, the weekly digest replaces the unanswerable "how was training?" with a specific, evidence-backed conversation starter (open questions outperform generic ones threefold; Harwood & Knight, 2009). For a county FA, it is a digital wellbeing offering they can put in front of every grassroots club in their patch, with the safeguarding work already done. TPM has translated a children's mental fitness curriculum from a six-figure content problem into a four-figure software problem — and built the distribution, consent and compliance scaffolding around it so that the next conversation is "which squad starts on Tuesday?" rather than "how do we get this through legal?"${closingNote}`,
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
    body: `Most hospitality operators and consumer brands struggle with the same constraint: they deliver good experiences, but fail to convert those moments into lasting emotional memory or shareable content. Traditional approaches such as emails, discounts, or generic gifts rarely move the needle. Songita was introduced to solve this gap by turning real customer experiences into personalised, emotionally resonant music and video assets — produced on demand and at scale.

Songita operates as a full-stack personalised music production and distribution engine. Users make a small number of structured inputs — occasion, mood, genre, language, and key personal details — while the system generates tailored lyrics, produces two high-quality song versions, and optionally creates a synchronised video. The video layer aligns lyrics with relevant images, captions, and timing, removing the need for manual editing. This reduces production time and cost by an estimated 50–90%, while maintaining a level of quality that feels intentional rather than automated.

In consumer use cases, Songita has been deployed for birthdays, anniversaries, and milestone events, consistently producing strong emotional responses and high satisfaction scores. In business environments — particularly short-term rentals such as Airbnb — Songita has been used to deliver personalised welcome and departure experiences. Guests receive a property-themed song on arrival and a tailored "thank you" song after their stay, often based on their own reported highlights. Early implementations indicate a 25–40% uplift in review conversion rates, alongside more detailed and emotionally expressive feedback. Repeat booking intent has also shown early increases in the range of 10–15%.

The qualitative impact is more significant than the quantitative gains alone suggest. Songita outputs are frequently shared across private and public channels, effectively turning each customer into a distribution point. The product transforms passive satisfaction into active advocacy, without requiring additional effort from the customer or the business. It also opens up new use cases across weddings, events, and internal business recognition — where teams can generate personalised appreciation or achievement-based content at scale.

For decision makers, the value is straightforward. Songita is not a creative novelty; it is an operational layer that converts customer data into emotionally compelling, shareable assets. It reduces production friction, increases engagement, and creates a direct link between experience delivery and measurable commercial outcomes such as reviews, referrals, and repeat revenue.${closingNote}`,
  },
  {
    slug: 'calarossa-pool-pass',
    title: 'Calarossa Pool Pass',
    subtitle: 'From honesty-box pool to operator-grade booking system',
    category: 'Leisure & Resort Operations',
    status: 'Live for summer 2026',
    date: '2026-04-25',
    summary:
      'A multi-tenant booking and redemption platform delivered to a Sardinian sporting resort under a zero-cash barter — turning an informal amenity into a defensible, documented operation.',
    body: `Client: La Prima Isola S.r.l., trading as Calarossa Sporting (Sardinia, Italy)
Delivered by: Teamsmiths (Buildze Ltd, UK co. no. 12857101)
Season: Live for summer 2026 — term to 31 October 2026

Calarossa is a residential resort in northern Sardinia where the upper pool, Piscina Alta, sits at the heart of the guest experience. Until this project the pool was run on goodwill: keys, paper lists, and the manager's memory. With third-party tenants joining owners and family guests each summer, that approach was leaking revenue, exposing the operator to insurance and GDPR risk, and giving staff no defensible record of who was on the deck on any given day. Calarossa Sporting needed a system that could sell, verify, and audit access without slowing the guest down or burdening the team with a complex back office.

Teamsmiths designed and built the Calarossa Pool Pass — a multi-tenant booking and redemption platform on a modern Vite/React frontend with a Supabase backend, Stripe payments, and four serverless edge functions handling tenant checkout, owner subscriptions, upgrades, and webhook reconciliation. The data model covers twelve tables spanning apartments, owners, tenants, passes, payments and an immutable audit log. On the operational side, the staff-scan flow enforces pass validity dates server-side, includes a two-step ID-verification gate before wristband handover, supports walk-up issuance for guests who arrive without a booking, and offers a lost-wristband recovery path — all in Italian and English, behind a GDPR-compliant cookie banner and full privacy stack.

Commercially, the engagement is structured as a zero-cash barter arrangement under English law: roughly seventeen and a half hours of build time, anchored at a £1,750 internal value, exchanged for marketing rights (case study, reference call, written testimonial) and a residency-grounded courtesy letter granting season access to the developer's family and weekly access for his apartment's tenants. A nine-document pack (executive summary, covering memo, services and barter agreement, company overview, governance and project plan, GDPR/Garante review, project workbook, courtesy letter, and Italian terms of sale) wraps the build with the legal hygiene the operator would otherwise have had to commission separately. A GDPR Article 28 Data Processing Agreement is committed for signature pre-go-live, and provider liability is capped at the greater of pass-through costs reimbursed or £500.

The quantitative impact lands in three places. First, revenue: the operator now has a paid channel for tenant access where previously there was none, with Stripe in the client's own name and reconciliation automated end-to-end. Second, cost avoidance: the legal, privacy and governance pack alone would typically run several thousand pounds at standard professional rates, and is delivered as part of the barter at zero cash outlay. Third, productivity: staff time per redemption drops from a manual lookup to a single QR scan with a server-validated verdict, and the audit log gives the operator a per-day, per-pass record for insurance and tax purposes. The system is built to scale to the wider Calarossa estate without rework.

Qualitatively, the project upgrades Piscina Alta from an informal amenity into a defensible, documented operation. Guests get a frictionless digital pass; owners get visibility of who is using their pool; staff get a clear, two-tap workflow they can run on a phone; and the operator gets a tax-clean structure that separates the B2B services agreement from the personal pool-access benefit, neutralising both UK benefit-in-kind risk and Italian substance-over-form exposure. For a business decision maker, the headline is straightforward: a venue that was previously running on trust now runs on data, with payments, compliance and accountability built in from day one.${closingNote}`,
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
    body: `England has approximately 24 million domestic properties, each banded against the statutory valuation date of 1 April 1991. The body responsible for those bands — until 31 March 2026 the Valuation Office Agency, and from that date the HMRC Valuation Office, following its absorption into HM Revenue and Customs — has acknowledged that a challenge to a band can take up to 12 months to resolve. The founder of this initiative has waited several years on a personal challenge. The market that has filled that void is dominated by claim-management firms charging 20–50% of the first year's saving as a success fee, deterring exactly the households most likely to be over-banded. The public queue then fills with weakly-evidenced or invalid proposals, and valid challenges wait behind them.

The Council Tax Deputee platform (counciltax.deputee.ai) is two products built on a single statutory rules engine: a Consumer App that prepares property-owner challenges to the standard the Valuation Office actually applies, and a Workbench offered free to the HMRC Valuation Office to triage incoming cases. The engine codifies the Local Government Finance Act 1992, the Council Tax (Alteration of Lists and Appeals) Regulations 2009 (SI 2009/2270), and the operational tests in the gov.uk Council Tax Manual. As of week three of build, more than 90 automated tests cover route classification (formal proposal versus informal band review), Regulation 4 eligibility, statutory time limits, an eight-point invalidity scorecard derived from Alexander VO categories, and a seven-dimension comparables scoring rubric.

Quantitatively, the platform addresses three measurable cost lines. First, cycle time: where a challenge is valid and well-evidenced, internal modelling targets a reduction from the 6–12 month status quo toward an 8–12 week pathway, on the basis that invalidity is screened at intake and property facts are pre-reconciled against publicly held data (Land Registry Price Paid Data and OS Open UPRN). Second, consumer cost: the £0 Guided tier and the £29 Review-and-Prepare pack displace the £80–£600 in cumulative success-fee deductions a typical claims firm would extract over a three-year saving cycle on a single Band E-to-D reduction (annual saving roughly £350–£500 against a council tax 2025–26 average). Third, public-sector workload: each rejected invalid proposal can consume hours of assessor and reviewer time, so pre-screening at the front door is the single intervention that compresses the queue without changing the law.

Qualitatively, the platform refuses three things its competitors routinely do. It does not present the assistant as a human lawyer, does not publish unmeasured win-rate claims, and does not encourage challenges that are likely to push the band upward — all of which would be in tension with the Legal Services Act 2007, the Consumer Protection from Unfair Trading Regulations 2008, the Digital Markets, Competition and Consumers Act 2024, and the 2024 ASA and CMA guidance on AI personas. Free, full access is reserved for households on Council Tax Reduction or means-tested benefits and for users referred by Citizens Advice, Shelter, and the Law Centres Network — populations most likely to be over-banded yet least likely to challenge. For HMRC, the qualitative gain is straightforward: fewer invalid proposals, fewer requests for missing facts, and a structured evidence pack on every case that reaches an officer.

The consumer build is on Week 3 (Next.js 15 front-end, England-only v1, with route-check, property-facts, and a statutory disclosure banner shipped). The Workbench is being built demo-ready in parallel; HMRC introductions are sourced directly by the founder. For a business decision maker evaluating partnership, procurement, or investment, three points matter. The legal substrate is statute-anchored rather than scraped from forum threads. The commercial model lets the most vulnerable users pay nothing while the engine pays for itself on the £29 Review-and-Prepare and £99 Concierge tiers. And the platform's design principle — that it must survive challenge from both the homeowner and the Valuation Office — is the same standard a partner, regulator, or investor would want it measured against.

Sources: gov.uk Council Tax Manual; Local Government Finance Act 1992 (legislation.gov.uk); Council Tax (Alteration of Lists and Appeals) Regulations 2009 (SI 2009/2270); VOA Rating Manual (workflow inspiration only); HMRC Valuation Office (post-31 March 2026 successor to the Valuation Office Agency).${closingNote}`,
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
    body: `The Meeting Intelligence Engine — known internally as Deputee — is the build that the rest of the Teamsmiths engine portfolio sits on. It was created not as a planned product but as a response to a real client problem the founder was contracted into, as an independent consultant: a global healthcare organisation, mid-demerger, that needed to scale agile delivery from five teams to ten with no additional resources, no additional headcount, and no additional compensation. The engine was built in the founder's own time, against fully anonymised data, and quietly carried the workload that made the doubled scope possible.

This article tells the story across two phases — the pre-merger transformation that proved the playbook, and the post-merger expansion that produced Deputee — and then explains what the same pattern now does in every Teamsmiths engagement.

## Phase 1 — Pre-merger: 40% velocity uplift across five teams

The starting context: a global healthcare organisation preparing for a demerger and listing on the London market under tight deadlines. Five of its key teams — a mix of business and technology professionals, including the developers behind a mission-critical consumer healthcare app, backend engineers and office infrastructure product experts — were running behind. Their agile maturity was low and the deadline was non-negotiable.

The brief was to lift performance using a structured, predictable approach. The intervention combined Scrum (rolled out across all five teams over three months in an adapted form), team resizing and restructuring (focused on specific products to reduce dependencies), an MVP approach for the consumer app, and targeted maturity interventions to take the teams from low to high on the agile maturity scale.

The outcomes were:

- Predictability: increased from about 80% to over 94%
- Velocity: rose by an average of 40%
- Cost reduction: 8% via process revisions
- Performance improvement: equivalent to adding five team members
- Deadline: all business outcomes met ahead of schedule

By the end of this phase the playbook was working. The framework was right. The discipline was sticking. What changed next was not the playbook — it was the load.

## Phase 2 — Post-merger: doubled scope, zero extra resources, the birth of Deputee

After the demerger, the same client expanded scope: ten teams, varying agile maturity from low to average, covering both business and technology, served by the same single coach. The brief was explicit — same coach, double the teams, no additional headcount, no additional compensation. The teams needed consistency, the organisation wanted higher predictability without increasing the workload on people, and the coach was expected to do twice the work in the same hours.

That pressure produced Deputee. Built in the founder's own time, against fully anonymised data, the engine took the repeatable parts of the coaching cycle — meeting transcription, classification against the chosen framework (Scrum, BANT, MEDIC, Tuckman team-development model, or a custom viewpoint loaded by the user), translation of decisions into role-specific actions with deadlines, automated nudges, and structured updates into Jira and the CRM — and ran them at the speed of the meeting rather than the speed of the next 1:1. PI planning sessions ran quarterly on SAFe lines for strategic alignment. Risks and dependencies were surfaced early. The senior coach's time was reserved for the cases that genuinely needed a human.

The post-merger outcomes:

- Predictability: consistently over 98% across all ten teams
- Velocity: an additional 45% growth on top of the prior gains
- Cost reduction: a further 15%, building on the previous 8%
- Performance improvement: equivalent to adding eight team members
- Coverage: a single coach effectively running ten teams, with productivity boosted by approximately 50%

The numbers travelled — they are now part of the founder's published track record, and the testimonials from senior leaders at the client speak for themselves. What did not travel, until now, was the engine that produced them.

## What Deputee became

The pattern Deputee proved at the doubled-scope client is the same pattern that now sits at the centre of every Teamsmiths engine. Transcribe the signal. Classify against a chosen framework or viewpoint (BANT, MEDIC, Scrum, Tuckman, or trusted external coaches such as Jeff Sutherland on Scrum or David Tracey on sales). Translate into role-specific actions with deadlines. Issue them as nudges, dashboard updates, or automated entries in the systems people already use. Reserve human attention for the cases that genuinely need it.

Open-sourced as a reference foundation at github.com/segunosu/Deputee, this is the connective tissue across the Teamsmiths Engine portfolio. The Construction Revenue Risk Engine and the Manufacturing Order Risk Engine apply that logic to project and production data. The Player's Mind applies it to youth-athlete check-ins. The Calarossa Pool Pass applies it to access control. Council Tax Deputee applies it to statutory rules and evidence packs.

## The structural takeaway

Coaching, performance and decision-making at scale used to require headcount. With this pattern, the framework is the headcount — and the framework runs at the speed of the meeting, not at the speed of the next 1:1. That is the lever that compresses cost, lifts predictability, and lets one senior person cover work that previously required ten.

The numbers above are from delivered engagements where the founder was contracted as an independent consultant, with the work and outcomes attributed to that role. Deputee itself was built in the founder's own time, against fully anonymised client data, and is now codified as the foundation pattern of every Teamsmiths build.`,
  },
];

export const getArticleBySlug = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);
