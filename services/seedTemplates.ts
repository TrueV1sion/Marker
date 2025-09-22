import { ReportTemplate } from "../types";

// Using a function to generate IDs ensures they are unique each time
// even though in practice they are seeded only once.
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const SEED_TEMPLATES: Omit<ReportTemplate, 'id' | 'createdAt'>[] = [
    {
        name: "The 'Why You, Why Now?' Brief",
        prompt: `Act as a senior sales intelligence analyst. Your goal is to determine if "{{prospectName}}" is a timely and valuable prospect *right now*.

Analyze all available public data, including recent news, financial reports, and strategic announcements.

1.  **Identify the single most compelling trigger event** from the last 6 months. This could be a new executive hire (CEO, CIO, CISO), a major funding round, a new strategic initiative announcement, a challenging financial quarter, or a significant product launch.
2.  **Write a one-paragraph hypothesis** directly connecting that trigger event to a core business challenge that our healthcare data and analytics solutions can address.
3.  **Conclude with a 'Timeliness Score' from 1 (not timely) to 10 (highly timely)** and a brief justification for the score.

Format the entire output using clear markdown headings.`,
        isDefault: true,
        job: "Quickly qualify a prospect based on recent, actionable trigger events.",
        icon: "TargetIcon"
    },
    {
        name: "Ideal Customer Profile (ICP) Fit Scorecard",
        prompt: `Act as a meticulous market research analyst. Your task is to evaluate "{{prospectName}}" against a defined Ideal Customer Profile (ICP).

Use Google Search to find definitive evidence for each criterion.

**ICP Criteria:**
---
{{userCriteria}}
---

For each criterion provided above, perform the following:
1.  State the criterion.
2.  Confirm if the prospect is a "Match" or "No Match".
3.  Provide a brief justification and the source URL for your finding.

**Conclusion:**
Provide an overall ICP Fit Score (e.g., "4/5 criteria met") and a one-paragraph summary explaining why "{{prospectName}}" is a strong or weak fit based on the analysis.

Format the output as a markdown document with clear headings.`,
        isDefault: true,
        job: "Systematically qualify a prospect against your specific ICP criteria.",
        icon: "ChecklistIcon"
    },
    {
        name: "Multi-Channel Outreach Sequence",
        prompt: `Act as an expert sales copywriter specializing in engaging busy healthcare executives.

Your task is to generate a 3-touch, multi-channel outreach sequence targeting a key persona at "{{prospectName}}".

**Persona:** [Specify Persona, e.g., Chief Information Officer, VP of Analytics]

Based on publicly available information about "{{prospectName}}", create the following assets:

**Touch 1: LinkedIn Connection Request (Day 1)**
- A personalized, 300-character max message that references a specific and recent company announcement, blog post, or interview.

**Touch 2: Value-Focused Email (Day 1, after connection)**
- A concise, compelling email (under 150 words).
- The email must lead with a hypothesis about a challenge they are likely facing, based on their strategic initiatives.
- It must pose a provocative, insightful question related to that challenge.
- It must end with a soft, interest-gauging call-to-action (e.g., "Worth a brief chat?").

**Touch 3: Follow-Up Email (Day 3)**
- A brief follow-up email that offers a relevant, non-gated resource (e.g., link to a case study, whitepaper, or insightful article) that ties back to the initial hypothesis.

Format the output clearly with markdown headings for each touchpoint.`,
        isDefault: true,
        job: "Generate a ready-to-use, multi-step outreach campaign for a specific persona.",
        icon: "EmailIcon"
    },
    {
        name: "Pain Point Hypothesis",
        prompt: `Act as a sales consultant and strategist. Your goal is to prepare a sales representative for an initial discovery call with "{{prospectName}}".

Based on your analysis of "{{prospectName}}"'s business model, recent news, and their position in the healthcare market, identify their **top 3 most likely business challenges** related to data, analytics, or regulatory compliance.

For each challenge:
1.  **Formulate a clear "Pain Hypothesis"**. (e.g., "Hypothesis: The recent merger has created significant data integration challenges, slowing down their reporting.")
2.  **Develop two insightful, open-ended "Validation Questions"** a sales rep could ask to validate this pain point without sounding like a vendor. (e.g., "How has the recent merger impacted your team's ability to consolidate and report on key metrics?").

Format the output as a markdown list.`,
        isDefault: true,
        job: "Equip sales reps with insightful questions for consultative discovery calls.",
        icon: "ChatBubbleIcon"
    },
    {
        name: "Competitive Landmine Map",
        prompt: `Act as a competitive intelligence strategist.

Assume the primary competitor in a deal with "{{prospectName}}" is [Competitor Name].

Your task is to create a "Competitive Landmine Map". Based on public information (e.g., G2 reviews, news articles, customer forums), identify 3 known strategic weaknesses of the specified competitor.

For each weakness:
1.  **Clearly state the competitor's weakness.** (e.g., "Weakness: Lack of real-time data integration capabilities.")
2.  **Create a "Landmine Question."** This is a specific, feature-agnostic discovery question to ask "{{prospectName}}" that highlights this weakness without naming the competitor directly. The question should make the prospect recognize the importance of an area where we are strong and the competitor is weak. (e.g., "As you think about your data strategy, how critical is it for your team to have access to real-time analytics versus relying on daily or weekly data refreshes?")

Format the output using clear markdown headings for each landmine.`,
        isDefault: true,
        job: "Strategically de-position a key competitor during the sales cycle.",
        icon: "BombIcon"
    },
    {
        name: "Champion Enablement Kit",
        prompt: `Act as a senior product marketing manager. Your task is to create an internal business case to help our champion at "{{prospectName}}" sell our solution internally.

The document should be written from the perspective of their [Director of Analytics] making a proposal to their [VP of IT or CFO].

Based on your understanding of "{{prospectName}}", generate a concise, one-page document in markdown that includes:
1.  **Executive Summary:** A brief paragraph defining the problem and the proposed solution's impact.
2.  **The Problem:** 2-3 bullet points detailing the current challenges and their business implications (e.g., "Manual reporting for HEDIS consumes over 200 analyst hours per cycle.").
3.  **Proposed Solution:** A clear, jargon-free summary of our solution and how it addresses the stated problems.
4.  **Expected Business Outcomes:** 3-4 quantifiable or qualitative outcomes (e.g., "Reduce reporting time by 80%", "Improve data accuracy for risk adjustment scores", "Enable proactive member outreach").
5.  **Required Investment:** (Use a placeholder, e.g., "[Insert Proposed Cost]").

This document should be clear, persuasive, and easy for our champion to copy, paste, and adapt.`,
        isDefault: true,
        job: "Create a ready-to-share internal business case for your champion.",
        icon: "UsersIcon"
    }
];