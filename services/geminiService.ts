import { GoogleGenAI, Type } from "@google/genai";
import type { ReportData, Citation, GroundingChunk, LeadGenerationResult, EmailData, RFPAnalysisResult, MarketTrend, MarketPulseSummary, RFPRequirement, UserPersona, TalkingPointsResult, SavedReportData } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export interface AnsweredQuestion {
  question: string;
  answer: string;
  status: 'ANSWERED' | 'NOT_FOUND';
}

export interface AnsweredQuestionCategory {
  category: string;
  questions: AnsweredQuestion[];
}


const processCitations = (groundingChunks: GroundingChunk[] | undefined): Citation[] => {
    if (!groundingChunks) return [];
    
    const citations: Citation[] = groundingChunks
        .filter(chunk => chunk.web && chunk.web.uri && chunk.web.title)
        .map(chunk => ({
            uri: chunk.web.uri,
            title: chunk.web.title,
        }));

    // De-duplicate citations
    const uniqueCitations = Array.from(new Map(citations.map(item => [item.uri, item])).values());
    
    return uniqueCitations;
};

const cleanJsonString = (text: string): string => {
    // First, remove markdown fences if they exist.
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
    }

    // Find the first occurrence of '{' or '['
    const firstCurly = jsonStr.indexOf('{');
    const firstBracket = jsonStr.indexOf('[');
    let startIndex = -1;

    if (firstCurly > -1 && firstBracket > -1) {
        startIndex = Math.min(firstCurly, firstBracket);
    } else if (firstCurly > -1) {
        startIndex = firstCurly;
    } else {
        startIndex = firstBracket;
    }

    if (startIndex === -1) {
        return jsonStr; // No JSON structure found, return original for parser to handle.
    }

    // Find the last occurrence of '}' or ']'
    const lastCurly = jsonStr.lastIndexOf('}');
    const lastBracket = jsonStr.lastIndexOf(']');
    const endIndex = Math.max(lastCurly, lastBracket);

    if (endIndex === -1 || endIndex < startIndex) {
        return jsonStr; // Invalid or incomplete JSON structure
    }
    
    return jsonStr.substring(startIndex, endIndex + 1);
};

export const normalizeProspectName = async (userInput: string): Promise<string> => {
    const prompt = `Given the user input "${userInput}", what is the full, formal, and official name of this organization? Return ONLY the official name and absolutely nothing else. For example, if the input is "BCBSM", the output should be "Blue Cross Blue Shield of Michigan".`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                // Disable thinking for this simple, fast task.
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        const normalizedName = response.text.trim();
        if (!normalizedName) {
            // If the AI returns nothing, fall back to the user's input to avoid breaking the flow.
            return userInput;
        }
        return normalizedName;
    } catch (error) {
        console.error("Error in normalizeProspectName:", error);
        // Fallback to original input on error to prevent breaking the user flow
        return userInput;
    }
};


export const generateContentWithCitations = async (prompt: string, title: string): Promise<ReportData> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const content = response.text;
        if (!content) {
            throw new Error('Received an empty response from the AI.');
        }

        const citations = processCitations(response.candidates?.[0]?.groundingMetadata?.groundingChunks);

        return { title, content, citations };
    } catch (error) {
        console.error("Error in generateContentWithCitations:", error);
        throw new Error('Failed to generate content from Gemini API.');
    }
};


export const generateLeads = async (criteria: {
  vertical: string;
  location: string;
  keywords: string;
}): Promise<LeadGenerationResult> => {
  const { vertical, location, keywords } = criteria;
  
  // Enhance the vertical description if it's "Medical Devices"
  let finalVertical = vertical;
  if (vertical === "Medical Devices") {
      finalVertical = "Medical Devices, including Durable Medical Equipment (DME) and related vendors";
  }

  // Build the criteria part of the prompt dynamically
  const criteriaParts = [`- Industry Vertical: ${finalVertical}`];
  if (location.trim()) {
    criteriaParts.push(`- Location: ${location}`);
  }
  if (keywords.trim()) {
    criteriaParts.push(`- Keywords/Pain Points: ${keywords}`);
  }

  const prompt = `Act as an expert market research analyst for the healthcare data industry. Your task is to identify potential sales leads.
The ideal customer profile is:
${criteriaParts.join('\n')}

Use Google Search to find 5 to 10 companies that match this profile. For each company, provide a brief, compelling one-sentence reason why they are a good fit as a prospect${keywords.trim() ? ', tailored to the keywords' : ''}. Do not list more than 10 companies.

Your final response MUST be a single, valid JSON object with a single key "leads". The value of "leads" should be an array of objects, where each object has two keys: "companyName" (string) and "reason" (string).
Do not include any text, explanations, or markdown formatting before or after the JSON object.
Example format:
{
  "leads": [
    {
      "companyName": "Example Health System",
      "reason": "They recently announced an initiative to improve patient outcomes."
    }
  ]
}`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) {
        console.warn('Gemini API returned an empty response for lead generation.');
        return { leads: [], citations: [] };
    }

    const jsonStr = cleanJsonString(text);
    const parsed = JSON.parse(jsonStr);
    const citations = processCitations(response.candidates?.[0]?.groundingMetadata?.groundingChunks);

    return {
      leads: parsed.leads || [],
      citations,
    };
  } catch (error) {
    console.error("Error in generateLeads:", error);
    throw new Error('Failed to generate leads from Gemini API.');
  }
};

export const generateSWOTAnalysis = async (companyName: string): Promise<ReportData> => {
    const prompt = `
        Conduct a comprehensive SWOT analysis for the company "${companyName}". Use Google Search to gather up-to-date information.
        The analysis should be detailed and specific. For each of the four sections (Strengths, Weaknesses, Opportunities, Threats), provide at least 3-5 distinct bullet points with brief explanations.

        The final output should be a markdown-formatted text. The structure must be:
        **Strengths**
        - Point 1
        - Point 2
        
        **Weaknesses**
        - Point 1
        - Point 2

        **Opportunities**
        - Point 1
        - Point 2

        **Threats**
        - Point 1
        - Point 2
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const content = response.text;
        if (!content) {
            throw new Error('Received an empty response from the AI.');
        }
        
        const citations = processCitations(response.candidates?.[0]?.groundingMetadata?.groundingChunks);
        
        return {
            title: `SWOT Analysis: ${companyName}`,
            content,
            citations,
        };
    } catch (error) {
        console.error(`Error generating SWOT for ${companyName}:`, error);
        throw new Error('Failed to generate SWOT analysis from Gemini API.');
    }
};

export const generateInternalKnowledge = async (query: string): Promise<ReportData> => {
    const prompt = `You are an internal knowledge base assistant. A user has asked the following question: "${query}". Based on a hypothetical library of internal documents (case studies, project reports, security documents), provide a comprehensive answer. Structure your answer clearly using markdown. If you cannot find a definitive answer, state that the information is not available in the knowledge base.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const content = response.text;
         if (!content) {
            throw new Error('Received an empty response from the AI.');
        }

        return {
            title: `Internal Knowledge Search: "${query}"`,
            content,
            citations: [],
        };
    } catch (error) {
        console.error("Error in generateInternalKnowledge:", error);
        throw new Error('Failed to generate content from Gemini API.');
    }
};

export const generateMeetingBriefing = async (
    prospectName: string,
    reportContent: string,
    attendees: string,
    objective: string
): Promise<string> => {
    const prompt = `
        You are a sales strategy assistant. Your task is to prepare a pre-meeting briefing note for a sales representative.
        
        **Prospect:** ${prospectName}
        **Meeting Attendees:** ${attendees}
        **Meeting Objective:** ${objective}

        **Background Intelligence Report:**
        ---
        ${reportContent}
        ---

        Based on all the information above, generate a concise briefing document that includes:
        1.  **Key Talking Points:** 3-4 bullet points tailored to the attendees and objective, referencing specific details from the report.
        2.  **Anticipated Questions:** Predict 2-3 questions the prospect might ask.
        3.  **Strategic Goals:** What is the primary and secondary goal for this meeting?

        Format the output using markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const briefing = response.text;
        if (!briefing) {
            throw new Error('Received an empty response from the AI.');
        }
        return briefing;
    } catch (error) {
        console.error("Error in generateMeetingBriefing:", error);
        throw new Error('Failed to generate briefing from Gemini API.');
    }
};

export const generateOutreachEmail = async (
    prospectName: string,
    reportContent: string,
    persona: string,
    tone: string
): Promise<EmailData> => {
    const prompt = `
        You are an expert sales copywriter specializing in the healthcare industry. Your task is to draft a personalized outreach email.

        **Prospect:** ${prospectName}
        **Target Persona:** ${persona}
        **Desired Tone:** ${tone}

        **Background Intelligence Report:**
        ---
        ${reportContent}
        ---

        Based on the report, write a compelling and concise email. The email must:
        - Have a strong, attention-grabbing subject line.
        - Reference a specific, relevant detail from the report (e.g., a recent initiative, a challenge, a new hire) to show you've done your research.
        - Clearly articulate a value proposition that addresses a likely pain point for the target persona.
        - End with a clear, low-friction call-to-action.

        Return the response as a single, valid JSON object with two keys: "subject" (string) and "body" (string).
        Do not include any text, explanations, or markdown formatting before or after the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING }
                    },
                    required: ["subject", "body"],
                }
            }
        });
        
        const text = response.text;
        if (!text) {
             throw new Error('Received an empty response from the AI.');
        }
        
        const jsonStr = cleanJsonString(text);
        const parsed: EmailData = JSON.parse(jsonStr);
        return parsed;

    } catch (error) {
        console.error("Error in generateOutreachEmail:", error);
        throw new Error('Failed to generate email from Gemini API.');
    }
};

export const analyzeRFP = async (rfpText: string): Promise<RFPAnalysisResult> => {
    const prompt = `
        You are an AI assistant for analyzing RFPs, RFIs, and security questionnaires for a healthcare data company.
        Your internal knowledge base contains information about your company's products, services, security protocols, and case studies.

        Analyze the following document text. For each distinct requirement you identify, do the following:
        1.  **Extract the Requirement:** State the requirement clearly and concisely.
        2.  **Suggest an Answer:** Based on your internal knowledge, provide a suggested answer or the next step to get an answer (e.g., "Consult the security team regarding our SOC 2 Type II report.").
        3.  **Identify Status:** Classify the status as either 'ANSWERED' if you can provide a direct answer, or 'GAP' if the requirement seems to be outside your company's current capabilities or requires specialist input.

        Return the response as a single, valid JSON object with a key "analysis". The value of "analysis" should be an array of objects, where each object has three keys: "requirement" (string), "suggestedAnswer" (string), and "status" (string, either 'ANSWERED' or 'GAP').
        Do not include any text, explanations, or markdown formatting before or after the JSON object.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt + "\n\n---\nDOCUMENT TEXT:\n" + rfpText,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    requirement: { type: Type.STRING },
                                    suggestedAnswer: { type: Type.STRING },
                                    status: { type: Type.STRING },
                                },
                                required: ["requirement", "suggestedAnswer", "status"]
                            }
                        }
                    },
                    required: ["analysis"],
                }
            }
        });

        const text = response.text;
        if (!text) {
             throw new Error('Received an empty response from the AI.');
        }
        
        const jsonStr = cleanJsonString(text);
        const parsed: RFPAnalysisResult = JSON.parse(jsonStr);
        return parsed;

    } catch (error) {
        console.error("Error in analyzeRFP:", error);
        throw new Error('Failed to analyze RFP with Gemini API.');
    }
};

export const fetchMarketTrends = async (vertical: string): Promise<MarketTrend[]> => {
  const prompt = `Using Google Search, identify the top 3-5 most important and recent market trends for the "${vertical}" sector in the healthcare industry. For each trend, provide a concise title, a brief summary, and a source URI.
  
  Your response MUST be a single, valid JSON object with a single key "trends". The value of "trends" should be an array of objects, where each object has three keys: "title" (string), "summary" (string), and "uri" (string).
  Do not include any text, explanations, or markdown formatting before or after the JSON object.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
    });

    const text = response.text;
    if (!text) {
        console.warn(`Gemini API returned an empty response for market trends on "${vertical}".`);
        return [];
    }

    const jsonStr = cleanJsonString(text);
    const parsed = JSON.parse(jsonStr);
    
    const trends = parsed.trends || [];
    const citations = processCitations(response.candidates?.[0]?.groundingMetadata?.groundingChunks);

    // If a trend is missing a URI, try to fill it from citations.
    return trends.map((trend: MarketTrend, index: number) => {
        if (!trend.uri && citations[index]) {
            return { ...trend, uri: citations[index].uri };
        }
        return trend;
    });

  } catch (error) {
    console.error(`Error fetching market trends for ${vertical}:`, error);
    throw new Error('Failed to fetch market trends from Gemini API.');
  }
};

export const generateMarketPulseSummary = async (vertical: string): Promise<MarketPulseSummary> => {
    const prompt = `Provide a high-level, executive summary of the key news and market insights for the "${vertical}" healthcare vertical.
    Use Google Search to find the most relevant information.
    Structure your response into five distinct categories:
    - This Year: 2-3 key developments or trends that have defined the year so far.
    - Last Quarter: 2-3 significant events, reports, or shifts from the previous quarter.
    - Last Month: 2-3 notable news items or updates from the last 30 days.
    - Last Week: 1-2 of the most recent, impactful news items.
    - Looking Ahead: 2-3 predictions or anticipated trends for the next 6-12 months.

    Return the response as a single, valid JSON object with keys: "thisYear", "lastQuarter", "lastMonth", "lastWeek", and "lookingAhead".
    Each key should have a value that is an array of strings, where each string is a concise bullet point.
    Do not include any text, explanations, or markdown formatting before or after the JSON object.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}]
            },
        });

        const text = response.text;
        if (!text) {
             throw new Error('Received an empty response from the AI for the market summary.');
        }

        const jsonStr = cleanJsonString(text);
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error(`Error generating market pulse summary for ${vertical}:`, error);
        throw new Error('Failed to generate market pulse summary from Gemini API.');
    }
};

export const generatePersonalizedInsights = async (summary: MarketPulseSummary, persona: UserPersona): Promise<string> => {
    const summaryJson = JSON.stringify(summary, null, 2);

    let personaInstruction = '';
    switch (persona) {
        case 'Sales Development Rep':
            personaInstruction = 'Focus on immediate outreach opportunities. Provide 3-4 bullet points including potential conversation starters, timely pain points to mention in cold calls or emails, and specific sub-sectors or company types showing momentum that are ripe for prospecting.';
            break;
        case 'Account Executive':
            personaInstruction = 'Focus on strategic conversation points for discovery calls and demos. Provide 3-4 bullet points covering key market shifts to align solutions with, potential long-term client needs based on "Looking Ahead" trends, and competitive angles to be aware of.';
            break;
        case 'Sales Leadership':
            personaInstruction = 'Focus on high-level strategy and team direction. Provide 3-4 bullet points summarizing major market headwinds or tailwinds, potential new market segments or territories to explore, and competitive threats that the team needs to be prepared for.';
            break;
        case 'Market Analyst':
            personaInstruction = 'Focus on areas for deeper investigation. Provide 3-4 bullet points highlighting surprising or contradictory trends, emerging technologies or regulations that require a full report, and key data points that should be tracked moving forward.';
            break;
    }

    const prompt = `
        You are an expert sales and market intelligence strategist.
        The user's role is: **${persona}**.
        
        Based on the following market pulse summary data for a specific healthcare vertical, generate a concise "What You Need to Know" briefing tailored specifically for this role.
        
        **Persona-specific Instructions:** ${personaInstruction}

        The output should be clear, actionable, and formatted as markdown. Do not include a title or any introductory text like "Here's what you need to know:". Just provide the bullet points.

        **Market Pulse Summary Data:**
        \`\`\`json
        ${summaryJson}
        \`\`\`
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const insights = response.text;
        if (!insights) {
            throw new Error('Received an empty response from the AI for personalized insights.');
        }
        return insights;
    } catch (error) {
        console.error(`Error generating personalized insights for ${persona}:`, error);
        throw new Error('Failed to generate personalized insights from Gemini API.');
    }
};

export const generateTalkingPointsForChallenge = async (
    challengeOrInitiative: string,
    prospectName: string,
    prospectContext: string
): Promise<TalkingPointsResult> => {
    const prompt = `
        You are an expert product marketing and sales strategist for Helios, a B2B healthcare data and analytics company.
        Your hypothetical product suite includes:
        - **Helios Data Platform:** A foundational product for data integration and management.
        - **Helios Analytics Suite:** A tool for advanced analytics, predictive modeling, and data visualization.
        - **Helios Compliance Engine:** A solution for regulatory reporting and compliance monitoring (e.g., HEDIS, Stars).

        A sales representative is analyzing the prospect "${prospectName}".
        The overall intelligence report on them is as follows:
        ---
        ${prospectContext}
        ---

        The specific challenge or initiative to address is: "${challengeOrInitiative}"

        Your task is to analyze this specific point and generate a strategic response.
        1.  **Analyze Fit:** Determine if Helios's current product suite can address this point.
        2.  **Generate Talking Points:** Create 2-3 concise, actionable talking points for a sales representative to use in a conversation. These points should directly connect a Helios product to the prospect's stated need.
        3.  **Identify Gaps:** If no current Helios product is a good fit, explicitly state that this is a "product gap".
        4.  **Suggest New Solutions:** If you identify a gap, brainstorm a high-level concept for a new product or feature that *could* solve this problem.

        Return your response as a single, valid JSON object with the following schema. Do not include any text, explanations, or markdown formatting before or after the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isGap: {
                            type: Type.BOOLEAN,
                            description: "True if no current product is a good fit, otherwise false."
                        },
                        talkingPoints: {
                            type: Type.STRING,
                            description: "2-3 markdown bullet points for sales to use. This should always be provided, even if it's a gap (e.g., positioning our expertise)."
                        },
                        gapAnalysis: {
                            type: Type.STRING,
                            description: "A one-sentence analysis explaining why it is or is not a gap. e.g., 'Our Helios Analytics Suite directly addresses this by...' or 'Our current suite lacks the real-time capabilities to solve this.'"
                        },
                        newSolutionIdea: {
                            type: Type.STRING,
                            description: "An optional high-level description of a new product or feature idea if isGap is true."
                        }
                    },
                    required: ["isGap", "talkingPoints", "gapAnalysis"]
                }
            }
        });

        const text = response.text;
        if (!text) {
             throw new Error('Received an empty response from the AI for talking points.');
        }

        const jsonStr = cleanJsonString(text);
        const parsed: TalkingPointsResult = JSON.parse(jsonStr);
        return parsed;

    } catch (error) {
        console.error("Error in generateTalkingPointsForChallenge:", error);
        throw new Error('Failed to generate talking points from Gemini API.');
    }
};

export const generateStrategicContent = async (context: string, fieldLabel: string): Promise<string> => {
    const prompt = `
        You are a senior sales strategist and copywriter. Based on the provided context about a sales deal,
        your task is to write a concise and compelling entry for the following field: **${fieldLabel}**.

        **Deal Context:**
        ---
        ${context}
        ---

        Generate a well-written paragraph for the "${fieldLabel}" field. Your response should be plain text, not markdown or JSON.
        It should be directly usable in a sales playbook document.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const content = response.text;
        if (!content) {
            throw new Error('Received an empty response from the AI.');
        }

        return content;
    } catch (error) {
        console.error(`Error generating content for ${fieldLabel}:`, error);
        throw new Error('Failed to generate strategic content from Gemini API.');
    }
};

export type IntelligenceDomain = 'Quality' | 'Risk' | 'Care Models' | 'Pharmacy' | 'Hospital Networks' | 'Employer Groups';

export const generateDomainIntelligence = async (prospectName: string, domain: IntelligenceDomain, context: string): Promise<string> => {
    let prompt;

    const basePrompt = `
        Act as a sales intelligence expert for a healthcare data analytics company selling to payers.
        The prospect is the healthcare organization "${prospectName}".
        A general intelligence report has been provided as context below.
        Use Google Search to find specific, up-to-date information.
    `;
    
    const contextSection = `
        ---
        CONTEXT:
        ${context}
        ---
    `;

    switch (domain) {
        case 'Quality':
            prompt = `
                ${basePrompt}
                Your task is to generate a "Quality Intelligence Briefing".
                Focus on their latest CMS Star Ratings (if applicable), HEDIS performance, any public-facing quality improvement initiatives, and their readiness for digital quality measures (dQMs) as pushed by NCQA.

                Structure the output in markdown with these exact section headers: **Current Performance**, **Inferred Pain Points**, and **Strategic Opportunities**.
                ${contextSection}
            `;
            break;
        case 'Risk':
            prompt = `
                ${basePrompt}
                Your task is to generate a "Risk Intelligence Briefing".
                Focus on the lines of business they operate in (Medicare Advantage, ACA, Managed Medicaid), any news related to their risk adjustment practices, common challenges in those markets, and any mention of RADV audits.

                Structure the output in markdown with these exact section headers: **Risk Program Footprint**, **Inferred Pain Points**, and **Strategic Opportunities**.
                ${contextSection}
            `;
            break;
        case 'Care Models':
             prompt = `
                ${basePrompt}
                Your task is to generate a "Care Models Intelligence Briefing".
                Focus on their involvement in Accountable Care Organizations (ACOs), Patient-Centered Medical Homes (PCMH), Value-Based Care (VBC) arrangements, and special programs for chronic conditions (e.g., diabetes, COPD). Also, investigate their telehealth and population health strategies.

                Structure the output in markdown with these exact section headers: **Key Care Delivery Programs**, **Inferred Pain Points**, and **Strategic Opportunities**.
                ${contextSection}
            `;
            break;
        case 'Pharmacy':
             prompt = `
                ${basePrompt}
                Your task is to generate a "Pharmacy Intelligence Briefing".
                Focus on their Pharmacy Benefit Manager (PBM), their drug formulary design, specialty pharmacy strategy, and any initiatives related to managing high-cost drugs or improving medication adherence.

                Structure the output in markdown with these exact section headers: **Pharmacy Strategy Overview**, **Inferred Pain Points**, and **Strategic Opportunities**.
                ${contextSection}
            `;
            break;
        case 'Hospital Networks':
             prompt = `
                ${basePrompt}
                Your task is to generate a "Hospital & Provider Network Intelligence Briefing".
                Focus on the network's composition (size, key hospital system partnerships), adequacy, and overall strategy (e.g., broad PPO vs. narrow/high-performance networks). Note any recent news about network expansions or provider disputes.

                Structure the output in markdown with these exact section headers: **Provider Network Overview**, **Inferred Pain Points**, and **Strategic Opportunities**.
                ${contextSection}
            `;
            break;
        case 'Employer Groups':
             prompt = `
                ${basePrompt}
                Your task is to generate an "Employer Groups Intelligence Briefing", focusing on their commercial line of business.
                Focus on the types of plans they offer to employers (e.g., fully-insured, self-funded/ASO), wellness programs, and any digital health tools they provide to employee populations.

                Structure the output in markdown with these exact section headers: **Commercial Offerings**, **Inferred Pain Points**, and **Strategic Opportunities**.
                ${contextSection}
            `;
            break;
        default:
             throw new Error(`Unsupported domain: ${domain}`);
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const intelligence = response.text;
        if (!intelligence) {
            throw new Error(`Received an empty response from the AI for ${domain} intelligence.`);
        }
        return intelligence;
    } catch (error) {
        console.error(`Error generating domain intelligence for ${domain}:`, error);
        throw new Error(`Failed to generate ${domain} intelligence from Gemini API.`);
    }
};

export const generateWeeklyBriefing = async (reports: SavedReportData[]): Promise<string> => {
    const reportSummaries = reports.map(r => ({
        title: r.title,
        module: r.moduleType,
        savedAt: r.savedAt,
        summary: r.executiveSummary || r.content.substring(0, 200) + '...'
    }));

    const prompt = `
        You are a senior sales intelligence analyst. Your task is to provide a high-level weekly briefing for a user based on the reports they generated in the Helios application over the past 7 days.

        Below is a JSON object containing summaries of the reports generated.
        Analyze these reports and generate a concise, actionable summary that highlights:
        1.  **Key Themes:** What were the dominant topics or companies researched this week?
        2.  **Major Findings:** What are the 1-2 most important takeaways from the reports (e.g., a major competitor weakness, a significant prospect initiative)?
        3.  **Suggested Next Steps:** Based on the findings, recommend 1-2 concrete actions the user should take next week (e.g., "Follow up with Prospect X regarding their digital transformation initiative," or "Focus prospecting on payers struggling with Risk Adjustment.").

        The final output should be a well-structured markdown text. Use headings and bullet points. Do not refer to the user in the second person (e.g., "You researched..."). Instead, use phrases like "The focus this week was on...".

        **Report Data:**
        ---
        ${JSON.stringify(reportSummaries, null, 2)}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const briefing = response.text;
        if (!briefing) {
            throw new Error('Received an empty response from the AI for the weekly briefing.');
        }
        return briefing;
    } catch (error) {
        console.error("Error in generateWeeklyBriefing:", error);
        throw new Error('Failed to generate weekly briefing from Gemini API.');
    }
};

export const explainText = async (text: string): Promise<string> => {
    const prompt = `Explain the following concept from a healthcare industry report in simple, clear terms, as if for a new sales representative. Keep the explanation concise and to the point.
    
    Concept: "${text}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const explanation = response.text;
        if (!explanation) {
            throw new Error('Received an empty response from the AI.');
        }
        return explanation;
    } catch (error) {
        console.error("Error in explainText:", error);
        throw new Error('Failed to generate explanation from Gemini API.');
    }
};

export const generateTalkingPoint = async (text: string): Promise<string> => {
    const prompt = `Based on this piece of information from a prospect report: "${text}", generate a single, concise talking point that a sales representative could use in a meeting. The talking point should be actionable and directly relate to the information provided.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const talkingPoint = response.text;
        if (!talkingPoint) {
            throw new Error('Received an empty response from the AI.');
        }
        return talkingPoint;
    } catch (error) {
        console.error("Error in generateTalkingPoint:", error);
        throw new Error('Failed to generate talking point from Gemini API.');
    }
};

export const generateEmailSnippet = async (text: string): Promise<string> => {
    const prompt = `Using this information from a prospect report as a hook: "${text}", write a short, personalized snippet (1-2 sentences) for an outreach email. The snippet should sound natural, professional, and lead into a value proposition.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const snippet = response.text;
        if (!snippet) {
            throw new Error('Received an empty response from the AI.');
        }
        return snippet;
    } catch (error) {
        console.error("Error in generateEmailSnippet:", error);
        throw new Error('Failed to generate email snippet from Gemini API.');
    }
};

export const answerDiscoveryQuestions = async (
    report: ReportData,
    questionCategories: { [key: string]: string[] }
): Promise<AnsweredQuestionCategory[]> => {
    const allQuestions = Object.entries(questionCategories).flatMap(([category, questions]) =>
        questions.map(q => ({ category, question: q }))
    );

    const prompt = `
        You are an expert sales analyst. You have been provided with a detailed intelligence report on a prospect.
        Your task is to review the report and answer a list of standard discovery questions based ONLY on the information available in the report.

        For each question, determine if the report contains a direct or strongly implied answer.
        - If an answer is found, provide a concise answer and set the status to "ANSWERED".
        - If the information is not present in the report, state "Information not found in report." as the answer and set the status to "NOT_FOUND".

        **Intelligence Report on ${report.title}:**
        ---
        **Main Content:** ${report.content}
        **Executive Summary:** ${report.executiveSummary || 'N/A'}
        **Financial Summary:** ${report.financialSummary || 'N/A'}
        **Key Stats:** ${JSON.stringify(report.keyStats) || 'N/A'}
        **Challenges & Initiatives:** ${JSON.stringify(report.challengesAndInitiatives) || 'N/A'}
        **Recent News:** ${JSON.stringify(report.recentNews) || 'N/A'}
        **Technology Footprint:** ${JSON.stringify(report.technologyFootprint) || 'N/A'}
        ---

        **Discovery Questions to Answer:**
        ---
        ${JSON.stringify(allQuestions.map(q => q.question), null, 2)}
        ---

        Return your response as a single, valid JSON object with a single key "answeredQuestions".
        The value should be an array of objects, where each object represents a category and has two keys: "category" (string) and "questions" (an array of objects).
        Each object in the "questions" array must have three keys: "question" (string, the original question), "answer" (string), and "status" (string, either "ANSWERED" or "NOT_FOUND").
        Maintain the original categories from the input. Do not include any text, explanations, or markdown formatting before or after the JSON object.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            answeredQuestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    answer: { type: Type.STRING },
                                    status: { type: Type.STRING },
                                },
                                required: ["question", "answer", "status"],
                            }
                        }
                    },
                    required: ["category", "questions"],
                }
            }
        },
        required: ["answeredQuestions"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema,
            }
        });
        const jsonStr = cleanJsonString(response.text);
        const parsed = JSON.parse(jsonStr);
        return parsed.answeredQuestions || [];
    } catch (error) {
        console.error("Error in answerDiscoveryQuestions:", error);
        throw new Error('Failed to generate answers for discovery questions from Gemini API.');
    }
};