export interface Question {
    id: string;
    category: string;
    question: string;
    description?: string;
    type: 'single' | 'multiple' | 'scale' | 'text';
    options?: {
        value: string;
        label: string;
        description?: string;
        score?: number; // Score value for this option (for calculations)
    }[];
    required: boolean;
}

// Pillar weights for scoring calculation
export const PILLAR_WEIGHTS: Record<string, number> = {
    'mission-alignment': 0.10,
    'culture-change': 0.15,
    'skills-capacity': 0.10,
    'process-maturity': 0.10,
    'data-quality': 0.15,
    'tech-stack': 0.10,
    'governance': 0.10,
    'security': 0.05,
    'budget': 0.05,
    'vendor-readiness': 0.10,
};

export const aiReadinessQuestions: Question[] = [
    // Lead Gen & Context Questions
    {
        id: 'organization-info',
        category: 'Organization Profile',
        question: 'Tell us about your organization and what you\'re hoping to accomplish',
        type: 'text',
        required: true
    },
    {
        id: 'primary-sector',
        category: 'Organization Profile',
        question: 'What is your primary sector?',
        type: 'single',
        options: [
            { value: 'nonprofit-civic', label: 'Non-Profit and Civic Organizations' },
            { value: 'retail-trade', label: 'Retail Trade' },
            { value: 'manufacturing', label: 'Manufacturing' },
            { value: 'healthcare-social', label: 'Healthcare and Social Assistance' },
            { value: 'education', label: 'Education Services' },
            { value: 'professional-technical', label: 'Professional, Scientific, and Technical Services (e.g., consulting, legal, accounting)' },
            { value: 'information-technology', label: 'Information Technology' },
            { value: 'finance-insurance', label: 'Finance and Insurance' },
            { value: 'hospitality', label: 'Hospitality (Accommodation and Food Services)' },
            { value: 'other', label: 'Other (e.g., agriculture, construction, government, energy, etc.)' }
        ],
        required: true
    },
    {
        id: 'annual-budget',
        category: 'Organization Profile',
        question: 'What is your annual operating budget?',
        type: 'single',
        options: [
            { value: 'under-500k', label: 'Under $500k' },
            { value: '500k-2m', label: '$500k – $2M' },
            { value: '2m-10m', label: '$2M – $10M' },
            { value: '10m-plus', label: '$10M+' }
        ],
        required: true
    },
    // The 10 Scoring Pillars
    {
        id: 'mission-alignment',
        category: 'Mission Alignment',
        question: 'How clearly does AI fit into your current strategic plan?',
        description: 'Weight: 10%',
        type: 'single',
        options: [
            { value: '0', label: 'We haven\'t discussed AI in relation to our mission.', score: 0 },
            { value: '1', label: 'We see it as a trend but have no specific use cases.', score: 1 },
            { value: '3', label: 'We have identified specific goals (e.g., fundraising growth) AI could support.', score: 3 },
            { value: '5', label: 'AI is a core transformational opportunity in our 3-year strategy.', score: 5 }
        ],
        required: true
    },
    {
        id: 'culture-change',
        category: 'Culture & Change Readiness',
        question: 'How does your staff feel about adopting AI tools?',
        description: 'Weight: 15%',
        type: 'single',
        options: [
            { value: '0', label: 'Significant fear of displacement or "robots taking over."', score: 0 },
            { value: '1', label: 'Hesitant; history of struggling with new technology.', score: 1 },
            { value: '3', label: 'Mixed; some staff are excited and experimenting personally.', score: 3 },
            { value: '5', label: 'Highly innovative; failure is tolerated in pursuit of new tech.', score: 5 }
        ],
        required: true
    },
    {
        id: 'skills-capacity',
        category: 'People, Skills & Capacity',
        question: 'Do you have the internal personnel to manage an AI rollout?',
        description: 'Weight: 10%',
        type: 'single',
        options: [
            { value: '0', label: 'No technical staff and very low digital literacy.', score: 0 },
            { value: '2', label: 'We have a general IT person/vendor but no data expertise.', score: 2 },
            { value: '4', label: 'We have internal data analytics or technical project managers.', score: 4 },
            { value: '5', label: 'We have dedicated staff for AI pilots and data oversight.', score: 5 }
        ],
        required: true
    },
    {
        id: 'process-maturity',
        category: 'Process Maturity',
        question: 'Are your core workflows (fundraising, donor stewardship) documented?',
        description: 'Weight: 10%',
        type: 'single',
        options: [
            { value: '0', label: 'Workflows are ad-hoc and vary by individual.', score: 0 },
            { value: '2', label: 'Some processes are documented but rely heavily on manual entry/Excel.', score: 2 },
            { value: '4', label: 'Most workflows are standardized SOPs (Standard Operating Procedures).', score: 4 },
            { value: '5', label: 'Processes are optimized, stable, and ready for automation.', score: 5 }
        ],
        required: true
    },
    {
        id: 'data-quality',
        category: 'Data Quality & Accessibility',
        question: 'How would you describe the state of your donor or client data?',
        description: 'Weight: 15%',
        type: 'single',
        options: [
            { value: '0', label: 'Data is siloed, incomplete, and full of duplicates.', score: 0 },
            { value: '1', label: 'We mostly use disconnected spreadsheets.', score: 1 },
            { value: '3', label: 'Centralized CRM exists, but definitions for data stages are weak.', score: 3 },
            { value: '5', label: 'Clean, accurate, deduplicated data with strong governance in place.', score: 5 }
        ],
        required: true
    },
    {
        id: 'tech-stack',
        category: 'Tech Stack & Integration',
        question: 'Can your current systems talk to each other via APIs?',
        description: 'Weight: 10%',
        type: 'single',
        options: [
            { value: '0', label: 'We use outdated on-premise software.', score: 0 },
            { value: '2', label: 'We use cloud systems (CRM/Email) but they aren\'t integrated.', score: 2 },
            { value: '4', label: 'We already use automation tools like Zapier or Power Automate.', score: 4 },
            { value: '5', label: 'Modern tech stack with open APIs and native AI modules.', score: 5 }
        ],
        required: true
    },
    {
        id: 'governance',
        category: 'Governance, Privacy & Ethics',
        question: 'Do you have policies regarding AI and sensitive data?',
        description: 'Weight: 10%',
        type: 'single',
        options: [
            { value: '0', label: 'No AI policy or general data privacy policy.', score: 0 },
            { value: '2', label: 'We have a privacy policy, but it doesn\'t mention AI or PII.', score: 2 },
            { value: '4', label: 'Draft rules exist for using Generative AI with donor/client stories.', score: 4 },
            { value: '5', label: 'Comprehensive AI governance framework that meets PIPEDA/CRA standards.', score: 5 }
        ],
        required: true
    },
    {
        id: 'security',
        category: 'Security Posture',
        question: 'What security controls are currently in place for your staff?',
        description: 'Weight: 5%',
        type: 'single',
        options: [
            { value: '0', label: 'No standard security practices.', score: 0 },
            { value: '3', label: 'Multifactor Authentication (MFA) is enforced on core systems.', score: 3 },
            { value: '5', label: 'Strict controls for limiting sensitive data in AI prompts/models.', score: 5 }
        ],
        required: true
    },
    {
        id: 'budget',
        category: 'Budget & Financial Readiness',
        question: 'Is there funding available for AI experimentation or new tools?',
        description: 'Weight: 5%',
        type: 'single',
        options: [
            { value: '0', label: 'No technology budget available.', score: 0 },
            { value: '3', label: 'We have a small discretionary budget for innovation/software.', score: 3 },
            { value: '5', label: 'Significant multi-year budget for AI infrastructure and training.', score: 5 }
        ],
        required: true
    },
    {
        id: 'vendor-readiness',
        category: 'Vendor & Tool Readiness',
        question: 'Are your current software vendors providing AI capabilities?',
        description: 'Weight: 10%',
        type: 'single',
        options: [
            { value: '0', label: 'Our vendors have no AI roadmap.', score: 0 },
            { value: '3', label: 'Some of our tools (e.g., ChatGPT, Canva) have AI, but they are siloed.', score: 3 },
            { value: '5', label: 'Core vendors (CRM/Email) offer fully integrated AI-native features.', score: 5 }
        ],
        required: true
    }
];

export interface ReadinessAssessment {
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    // Assessment results
    overallScore?: number;
    categoryScores?: Record<string, number>;
    roadmapStage?: number; // 1-7 based on score
    roadmapStageName?: string;
    // Store all answers
    answers: Record<string, any>;
}

// Scoring calculation function based on requirements document
export function calculateReadinessScore(assessment: ReadinessAssessment): {
    overallScore: number;
    categoryScores: Record<string, number>;
    roadmapStage: number;
    roadmapStageName: string;
} {
    const categoryScores: Record<string, number> = {};
    let weightedSum = 0;

    // Calculate score for each pillar
    const pillarIds = Object.keys(PILLAR_WEIGHTS);
    
    for (const pillarId of pillarIds) {
        const answer = assessment.answers[pillarId];
        if (answer === undefined || answer === null || answer === '') {
            // Skip if not answered
            categoryScores[pillarId] = 0;
            continue;
        }

        // Find the selected option to get its score
        const question = aiReadinessQuestions.find(q => q.id === pillarId);
        if (!question || !question.options) {
            categoryScores[pillarId] = 0;
            continue;
        }

        const selectedOption = question.options.find(opt => opt.value === answer);
        if (!selectedOption || selectedOption.score === undefined) {
            categoryScores[pillarId] = 0;
            continue;
        }

        const score = selectedOption.score; // This is 0-5
        const normalizedScore = score / 5; // Normalize to 0-1
        const weight = PILLAR_WEIGHTS[pillarId];
        const weightedScore = normalizedScore * weight;
        
        weightedSum += weightedScore;
        
        // Store category score as raw 0-5 value for display
        categoryScores[pillarId] = score;
    }

    // Multiply by 100 and round to nearest integer
    const overallScore = Math.round(weightedSum * 100);

    // Determine roadmap stage based on score
    let roadmapStage: number;
    let roadmapStageName: string;
    
    if (overallScore >= 96) {
        roadmapStage = 7;
        roadmapStageName = 'Fully Integrated, AI-Driven Organization';
    } else if (overallScore >= 90) {
        roadmapStage = 6;
        roadmapStageName = 'Strategic AI Deployment';
    } else if (overallScore >= 80) {
        roadmapStage = 5;
        roadmapStageName = 'Systems Integration';
    } else if (overallScore >= 70) {
        roadmapStage = 4;
        roadmapStageName = 'Workflow Integration';
    } else if (overallScore >= 50) {
        roadmapStage = 3;
        roadmapStageName = 'Pilot Projects';
    } else if (overallScore >= 30) {
        roadmapStage = 2;
        roadmapStageName = 'Opportunity Identification';
    } else {
        roadmapStage = 1;
        roadmapStageName = 'Awareness & Literacy';
    }

    return {
        overallScore,
        categoryScores,
        roadmapStage,
        roadmapStageName
    };
}
