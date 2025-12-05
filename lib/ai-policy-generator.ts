import OpenAI from 'openai';
import { PolicyAssessment } from '@/mocks/ai-policy-questions';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface AIGeneratedPolicy {
    executiveSummary: string;
    policyStatement: string;
    scopeAndDefinitions: string;
    permittedUses: string;
    prohibitedUses: string;
    dataPrivacyAndSecurity: string;
    ethicalGuidelines: string;
    complianceAndGovernance: string;
    trainingAndSupport: string;
    enforcementAndConsequences: string;
    reviewAndUpdates: string;
}

function formatAssessmentForPrompt(assessment: PolicyAssessment): string {
    const concerns = Array.isArray(assessment.concerns) ? assessment.concerns : [];
    const useCases = Array.isArray(assessment.useCases) ? assessment.useCases : [];
    const compliance = Array.isArray(assessment.compliance) ? assessment.compliance : [];

    const stanceLabels: Record<string, string> = {
        'strict-prohibition': 'Strict Prohibition - AI use is strictly forbidden',
        'highly-restricted': 'Highly Restricted - AI use allowed only in very limited, controlled scenarios',
        'cautious-exploration': 'Cautious Exploration - Exploring AI cautiously with strict guidelines',
        'moderate-adoption': 'Moderate Adoption - Adopting AI in specific departments with defined policies',
        'strategic-embrace': 'Strategic Embrace - Strategically embracing AI across the organization',
        'full-embrace': 'Full Embrace - Everyone should become fully versed in AI and use it daily'
    };

    const riskLabels: Record<string, string> = {
        'very-low': 'Very Low - Prioritize safety and compliance above all',
        'low': 'Low - Prefer proven, low-risk AI applications',
        'moderate': 'Moderate - Willing to take calculated risks with proper safeguards',
        'high': 'High - Willing to experiment and innovate with AI'
    };

    const trainingLabels: Record<string, string> = {
        'policy-only': 'Policy Documentation Only',
        'leadership-training': 'Leadership Training needed',
        'team-training': 'Comprehensive training for all employees needed',
        'ongoing-support': 'Ongoing support, resources, and continuous training needed'
    };

    const governanceLabels: Record<string, string> = {
        'centralized': 'Centralized - Single committee/department oversees all AI use',
        'decentralized': 'Decentralized - Each department manages its own AI use',
        'hybrid': 'Hybrid - Central oversight with departmental autonomy',
        'none': 'Not yet determined - Need help determining best structure'
    };

    return `
ORGANIZATIONAL CONTEXT:
- Company: ${assessment.company || 'Not specified'}
- Organizational Stance: ${stanceLabels[assessment.stance] || assessment.stance}
- AI Acumen Level: ${assessment.acumen}/5
- Risk Tolerance: ${riskLabels[assessment.riskTolerance] || assessment.riskTolerance}

PRIMARY CONCERNS:
${concerns.length > 0 ? concerns.map(c => `- ${c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`).join('\n') : '- None specified'}

IDENTIFIED USE CASES:
${useCases.length > 0 ? useCases.map(u => `- ${u.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`).join('\n') : '- None currently'}

COMPLIANCE REQUIREMENTS:
${compliance.length > 0 ? compliance.map(c => `- ${c.toUpperCase()}`).join('\n') : '- No specific requirements'}

TRAINING NEEDS:
${trainingLabels[assessment.training] || assessment.training}

GOVERNANCE STRUCTURE:
${governanceLabels[assessment.governance] || assessment.governance}

ADDITIONAL CONTEXT:
${assessment.additionalContext || 'None provided'}
`.trim();
}

export async function generateAIPolicyContent(assessment: PolicyAssessment): Promise<AIGeneratedPolicy> {
    if (!process.env.OPENAI_API_KEY) {
        console.log('📝 [DEV] AI Policy Generation (No API Key) - Returning template');
        // Return a template structure if no API key
        return {
            executiveSummary: 'This is a draft AI policy document. Please configure OPENAI_API_KEY for AI-generated content.',
            policyStatement: '',
            scopeAndDefinitions: '',
            permittedUses: '',
            prohibitedUses: '',
            dataPrivacyAndSecurity: '',
            ethicalGuidelines: '',
            complianceAndGovernance: '',
            trainingAndSupport: '',
            enforcementAndConsequences: '',
            reviewAndUpdates: '',
        };
    }

    const assessmentContext = formatAssessmentForPrompt(assessment);

    const prompt = `You are an expert legal and compliance consultant specializing in AI policy development for medium to large corporations. 

Based on the following organizational assessment, create a comprehensive, professional AI policy document. The policy should be:

1. Legally sound and compliance-focused
2. Tailored to the organization's specific stance, concerns, and requirements
3. Clear, actionable, and enforceable
4. Appropriate for executive leadership and legal review
5. Comprehensive but practical

ORGANIZATIONAL ASSESSMENT:
${assessmentContext}

Generate a complete AI policy document with the following sections. Each section should be detailed, professional, and tailored to the organization's specific needs:

1. EXECUTIVE SUMMARY (2-3 paragraphs): High-level overview of the policy's purpose, scope, and key principles
2. POLICY STATEMENT (1-2 paragraphs): Clear statement of the organization's position on AI use
3. SCOPE AND DEFINITIONS (detailed): What this policy covers, who it applies to, and key definitions
4. PERMITTED USES (detailed): Specific scenarios, departments, and use cases where AI is allowed
5. PROHIBITED USES (detailed): Clear restrictions and scenarios where AI is not permitted
6. DATA PRIVACY AND SECURITY (detailed): Requirements for data handling, security measures, and privacy protection
7. ETHICAL GUIDELINES (detailed): Principles for ethical AI use, bias mitigation, and transparency
8. COMPLIANCE AND GOVERNANCE (detailed): Compliance requirements, oversight structure, and accountability
9. TRAINING AND SUPPORT (detailed): Training requirements, resources, and support mechanisms
10. ENFORCEMENT AND CONSEQUENCES (detailed): How the policy will be enforced and consequences for violations
11. REVIEW AND UPDATES (1-2 paragraphs): Process for reviewing and updating the policy

Format your response as a JSON object with these exact keys:
{
  "executiveSummary": "...",
  "policyStatement": "...",
  "scopeAndDefinitions": "...",
  "permittedUses": "...",
  "prohibitedUses": "...",
  "dataPrivacyAndSecurity": "...",
  "ethicalGuidelines": "...",
  "complianceAndGovernance": "...",
  "trainingAndSupport": "...",
  "enforcementAndConsequences": "...",
  "reviewAndUpdates": "..."
}

Each section should be comprehensive (3-5 paragraphs for major sections, 1-2 for shorter ones) and written in a professional, legal-appropriate tone.`;

    try {
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o', // Use gpt-4o for best results, or gpt-4-turbo as fallback
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert legal and compliance consultant specializing in AI policy development. You create comprehensive, legally sound, and practical AI policies for corporations.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3, // Lower temperature for more consistent, professional output
            max_tokens: 4000,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content received from OpenAI');
        }

        const parsed = JSON.parse(content) as AIGeneratedPolicy;
        return parsed;
    } catch (error) {
        console.error('Error generating AI policy content:', error);
        throw error;
    }
}

