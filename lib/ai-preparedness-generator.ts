import OpenAI from 'openai';
import { PreparednessAssessment } from '@/mocks/ai-preparedness-questions';

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
    if (!openai && process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openai;
}

export interface PreparednessReport {
    executiveSummary: string;
    currentState: string;
    knowledgeGaps: string;
    recommendedLearningPath: string;
    videoCurriculum: string;
    coachingRecommendations: string;
    consultingRecommendations: string;
    implementationRoadmap: string;
    nextSteps: string;
}

// Fallback content for when AI generation fails or API key is missing
export function getFallbackReport(): PreparednessReport {
    return {
        executiveSummary: 'Based on your assessment, we\'ve identified key areas for AI preparedness improvement. This report provides personalized recommendations for upskilling, coaching, and implementation support.',
        currentState: 'Your current AI knowledge and experience level has been assessed. We\'ll provide targeted recommendations to help you advance.',
        knowledgeGaps: 'Key knowledge gaps have been identified based on your role, industry, and learning goals. Focus areas include strategic AI understanding, practical tool skills, and implementation expertise.',
        recommendedLearningPath: 'A structured learning path has been designed based on your time commitment, learning style preferences, and urgency. This includes video courses, hands-on projects, and case studies.',
        videoCurriculum: 'A curated video curriculum will be provided covering AI fundamentals, strategic applications, tool mastery, and industry-specific use cases tailored to your needs.',
        coachingRecommendations: 'Executive coaching sessions are recommended to provide personalized guidance, strategic planning, and hands-on support for your AI initiatives.',
        consultingRecommendations: 'AI implementation consulting can help you identify opportunities, assess risks, select vendors, and develop a comprehensive AI strategy for your organization.',
        implementationRoadmap: 'A phased implementation roadmap will guide you through AI adoption, from initial pilot projects to organization-wide transformation.',
        nextSteps: 'Schedule a consultation to discuss your personalized recommendations and begin your AI preparedness journey.'
    };
}

function formatAssessmentForPrompt(assessment: PreparednessAssessment): string {
    const roleLabels: Record<string, string> = {
        'ceo': 'CEO / Founder',
        'c-suite': 'C-Suite Executive (CFO, CTO, CMO, etc.)',
        'vp': 'VP / Senior Vice President',
        'director': 'Director',
        'senior-manager': 'Senior Manager',
        'other-executive': 'Other Executive Role'
    };

    const knowledgeLabels: Record<string, string> = {
        '1': 'Beginner - Very little knowledge',
        '2': 'Novice - Basic understanding',
        '3': 'Intermediate - Can discuss applications',
        '4': 'Advanced - Understands strategy and implementation',
        '5': 'Expert - Deep expertise'
    };

    const timeLabels: Record<string, string> = {
        '1-2': '1-2 hours per week',
        '3-5': '3-5 hours per week',
        '6-10': '6-10 hours per week',
        '10-plus': '10+ hours per week',
        'intensive': 'Intensive program (full-time focus)'
    };

    const urgencyLabels: Record<string, string> = {
        'immediate': 'Immediate - Need to start within weeks',
        'short-term': 'Short-term - Within 1-3 months',
        'medium-term': 'Medium-term - 3-6 months',
        'long-term': 'Long-term - 6+ months'
    };

    const experience = Array.isArray(assessment.aiExperience) ? assessment.aiExperience : [];
    const learningGoals = Array.isArray(assessment.learningGoals) ? assessment.learningGoals : [];
    const learningStyle = Array.isArray(assessment.learningStyle) ? assessment.learningStyle : [];
    const challenges = Array.isArray(assessment.challenges) ? assessment.challenges : [];
    const supportNeeds = Array.isArray(assessment.supportNeeds) ? assessment.supportNeeds : [];

    return `
EXECUTIVE PROFILE:
- Role: ${roleLabels[assessment.currentRole] || assessment.currentRole}
- Industry: ${assessment.industry}
- Company: ${assessment.company || 'Not specified'}

CURRENT AI KNOWLEDGE:
- Knowledge Level: ${knowledgeLabels[assessment.aiKnowledge] || assessment.aiKnowledge}/5
- Hands-on Experience: ${experience.length > 0 ? experience.map(e => e.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ') : 'None yet'}

LEARNING GOALS:
${learningGoals.length > 0 ? learningGoals.map(g => `- ${g.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`).join('\n') : '- Not specified'}

AVAILABILITY & PREFERENCES:
- Time Commitment: ${timeLabels[assessment.timeCommitment] || assessment.timeCommitment}
- Learning Style: ${learningStyle.length > 0 ? learningStyle.map(s => s.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ') : 'Not specified'}
- Urgency: ${urgencyLabels[assessment.urgency] || assessment.urgency}

CURRENT CHALLENGES:
${challenges.length > 0 ? challenges.map(c => `- ${c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`).join('\n') : '- None specified'}

SUPPORT NEEDS:
${supportNeeds.length > 0 ? supportNeeds.map(s => `- ${s.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`).join('\n') : '- Not specified'}

ADDITIONAL CONTEXT:
${assessment.additionalContext || 'None provided'}
`.trim();
}

export async function generatePreparednessReport(assessment: PreparednessAssessment): Promise<PreparednessReport> {
    if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API key not found, returning fallback report');
        return getFallbackReport();
    }

    const assessmentContext = formatAssessmentForPrompt(assessment);
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const maxTokens = 3000;

    const prompt = `You are an expert AI consultant and executive coach specializing in helping C-suite executives and senior leaders improve their AI preparedness and strategic AI capabilities.

Based on the following executive assessment, create a comprehensive, personalized AI preparedness report. The report should be:

1. Executive-focused and strategic
2. Actionable with specific recommendations
3. Tailored to their role, industry, and learning goals
4. Include video curriculum suggestions, coaching recommendations, and consulting options
5. Address their specific challenges and support needs

EXECUTIVE ASSESSMENT:
${assessmentContext}

Generate a comprehensive AI preparedness report with the following sections. Each section should be detailed, personalized, and actionable:

1. EXECUTIVE SUMMARY (2-3 paragraphs): High-level overview of their current AI preparedness, key strengths, and primary areas for improvement
2. CURRENT STATE (2-3 paragraphs): Detailed assessment of their current AI knowledge, experience, and capabilities based on their responses
3. KNOWLEDGE GAPS (2-3 paragraphs): Specific knowledge gaps identified and why addressing them is important for their role and goals
4. RECOMMENDED LEARNING PATH (3-4 paragraphs): Structured learning path based on their time commitment, learning style, and urgency. Include specific topics, sequence, and timeline
5. VIDEO CURRICULUM (3-4 paragraphs): Detailed video curriculum recommendations covering:
   - AI fundamentals and strategic concepts
   - Practical tool training
   - Industry-specific applications
   - Case studies and real-world examples
   - Advanced topics based on their goals
6. COACHING RECOMMENDATIONS (2-3 paragraphs): Personalized coaching recommendations including:
   - Number and frequency of sessions
   - Focus areas for coaching
   - Expected outcomes
   - How coaching addresses their specific challenges
7. CONSULTING RECOMMENDATIONS (2-3 paragraphs): AI implementation consulting recommendations including:
   - Types of consulting support needed
   - Strategic planning support
   - Vendor selection assistance
   - Risk assessment and compliance
   - Implementation support
8. IMPLEMENTATION ROADMAP (3-4 paragraphs): Phased roadmap for AI adoption including:
   - Immediate actions (next 30 days)
   - Short-term goals (1-3 months)
   - Medium-term objectives (3-6 months)
   - Long-term vision (6+ months)
9. NEXT STEPS (1-2 paragraphs): Clear, actionable next steps to begin their AI preparedness journey

Format your response as a JSON object with these exact keys:
{
  "executiveSummary": "...",
  "currentState": "...",
  "knowledgeGaps": "...",
  "recommendedLearningPath": "...",
  "videoCurriculum": "...",
  "coachingRecommendations": "...",
  "consultingRecommendations": "...",
  "implementationRoadmap": "...",
  "nextSteps": "..."
}

Each section should be comprehensive (2-4 paragraphs for major sections, 1-2 for shorter ones) and written in a professional, executive-appropriate tone. Be specific and actionable, referencing their role, industry, and stated goals.`;

    try {
        const client = getOpenAIClient();
        if (!client) {
            throw new Error('OpenAI client not available');
        }

        const completion = await client.chat.completions.create({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: maxTokens,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error('AI did not return content.');
        }

        const parsed = JSON.parse(content);
        return parsed as PreparednessReport;
    } catch (error) {
        console.error('Error calling OpenAI:', error);
        // Return fallback on error
        return getFallbackReport();
    }
}

