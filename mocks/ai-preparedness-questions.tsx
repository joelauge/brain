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
    }[];
    required: boolean;
}

export const aiPreparednessQuestions: Question[] = [
    {
        id: 'current-role',
        category: 'Role & Context',
        question: 'What is your current role?',
        description: 'This helps us tailor recommendations to your leadership level.',
        type: 'single',
        options: [
            { value: 'ceo', label: 'CEO / Founder' },
            { value: 'c-suite', label: 'C-Suite Executive (CFO, CTO, CMO, etc.)' },
            { value: 'vp', label: 'VP / Senior Vice President' },
            { value: 'director', label: 'Director' },
            { value: 'senior-manager', label: 'Senior Manager' },
            { value: 'other-executive', label: 'Other Executive Role' }
        ],
        required: true
    },
    {
        id: 'industry',
        category: 'Industry',
        question: 'What industry are you in?',
        type: 'single',
        options: [
            { value: 'technology', label: 'Technology' },
            { value: 'finance', label: 'Finance & Banking' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'retail', label: 'Retail & E-commerce' },
            { value: 'manufacturing', label: 'Manufacturing' },
            { value: 'consulting', label: 'Consulting & Professional Services' },
            { value: 'education', label: 'Education' },
            { value: 'government', label: 'Government & Public Sector' },
            { value: 'other', label: 'Other' }
        ],
        required: true
    },
    {
        id: 'ai-knowledge',
        category: 'Current Knowledge',
        question: 'How would you rate your current understanding of AI technologies?',
        description: 'Be honest - this helps us create the right learning path for you.',
        type: 'single',
        options: [
            { value: '1', label: 'Beginner - I know very little about AI' },
            { value: '2', label: 'Novice - I understand basic concepts' },
            { value: '3', label: 'Intermediate - I can discuss AI applications' },
            { value: '4', label: 'Advanced - I understand AI strategy and implementation' },
            { value: '5', label: 'Expert - I have deep AI expertise' }
        ],
        required: true
    },
    {
        id: 'ai-experience',
        category: 'Practical Experience',
        question: 'What is your hands-on experience with AI tools? (Select all that apply)',
        type: 'multiple',
        options: [
            { value: 'chatgpt', label: 'ChatGPT or similar chatbots' },
            { value: 'copilot', label: 'GitHub Copilot or coding assistants' },
            { value: 'image-gen', label: 'Image generation (DALL-E, Midjourney)' },
            { value: 'analytics', label: 'AI-powered analytics tools' },
            { value: 'automation', label: 'AI automation tools' },
            { value: 'custom-ai', label: 'Custom AI solutions in my organization' },
            { value: 'none', label: 'No hands-on experience yet' }
        ],
        required: true
    },
    {
        id: 'learning-goals',
        category: 'Learning Goals',
        question: 'What are your primary learning goals? (Select all that apply)',
        type: 'multiple',
        options: [
            { value: 'strategic-understanding', label: 'Strategic understanding of AI for business' },
            { value: 'practical-skills', label: 'Practical AI tool skills' },
            { value: 'implementation', label: 'AI implementation and deployment' },
            { value: 'team-leadership', label: 'Leading AI initiatives in my team' },
            { value: 'risk-management', label: 'AI risk management and governance' },
            { value: 'competitive-advantage', label: 'Using AI for competitive advantage' },
            { value: 'innovation', label: 'AI-driven innovation and transformation' }
        ],
        required: true
    },
    {
        id: 'time-commitment',
        category: 'Availability',
        question: 'How much time can you commit to AI learning per week?',
        type: 'single',
        options: [
            { value: '1-2', label: '1-2 hours per week' },
            { value: '3-5', label: '3-5 hours per week' },
            { value: '6-10', label: '6-10 hours per week' },
            { value: '10-plus', label: '10+ hours per week' },
            { value: 'intensive', label: 'Intensive program (full-time focus)' }
        ],
        required: true
    },
    {
        id: 'learning-style',
        category: 'Learning Preferences',
        question: 'What learning format do you prefer? (Select all that apply)',
        type: 'multiple',
        options: [
            { value: 'video', label: 'Video courses and tutorials' },
            { value: 'coaching', label: 'One-on-one coaching sessions' },
            { value: 'workshops', label: 'Interactive workshops' },
            { value: 'case-studies', label: 'Case studies and real-world examples' },
            { value: 'hands-on', label: 'Hands-on projects and labs' },
            { value: 'reading', label: 'Reading materials and documentation' },
            { value: 'peer-learning', label: 'Peer learning and networking' }
        ],
        required: true
    },
    {
        id: 'urgency',
        category: 'Timeline',
        question: 'How urgent is your need to improve your AI preparedness?',
        type: 'single',
        options: [
            {
                value: 'immediate',
                label: 'Immediate - Need to start within weeks',
                description: 'You have an urgent AI initiative or decision coming up.'
            },
            {
                value: 'short-term',
                label: 'Short-term - Within 1-3 months',
                description: 'You have AI projects or decisions planned soon.'
            },
            {
                value: 'medium-term',
                label: 'Medium-term - 3-6 months',
                description: 'You\'re planning AI initiatives for the near future.'
            },
            {
                value: 'long-term',
                label: 'Long-term - 6+ months',
                description: 'You want to build AI capabilities over time.'
            }
        ],
        required: true
    },
    {
        id: 'challenges',
        category: 'Current Challenges',
        question: 'What are your biggest challenges with AI? (Select all that apply)',
        type: 'multiple',
        options: [
            { value: 'understanding', label: 'Understanding where AI can add value' },
            { value: 'implementation', label: 'Knowing how to implement AI solutions' },
            { value: 'team-readiness', label: 'Getting my team ready for AI' },
            { value: 'risk-assessment', label: 'Assessing AI risks and compliance' },
            { value: 'vendor-selection', label: 'Choosing the right AI tools and vendors' },
            { value: 'roi-measurement', label: 'Measuring AI ROI and success' },
            { value: 'change-management', label: 'Managing organizational change' },
            { value: 'staying-current', label: 'Staying current with AI developments' }
        ],
        required: true
    },
    {
        id: 'support-needs',
        category: 'Support Needs',
        question: 'What type of support would be most valuable? (Select all that apply)',
        type: 'multiple',
        options: [
            { value: 'curriculum', label: 'Structured curriculum and learning path' },
            { value: 'coaching', label: 'Executive coaching sessions' },
            { value: 'consulting', label: 'AI implementation consulting' },
            { value: 'workshops', label: 'Team workshops and training' },
            { value: 'resources', label: 'Access to learning resources and tools' },
            { value: 'community', label: 'Access to executive AI community' },
            { value: 'certification', label: 'Certification or credentials' }
        ],
        required: true
    },
    {
        id: 'additional-context',
        category: 'Additional Context',
        question: 'Is there anything specific you\'d like to learn or any particular challenges you\'re facing?',
        type: 'text',
        required: false
    }
];

export interface PreparednessAssessment {
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    currentRole: string;
    industry: string;
    aiKnowledge: string;
    aiExperience: string[];
    learningGoals: string[];
    timeCommitment: string;
    learningStyle: string[];
    urgency: string;
    challenges: string[];
    supportNeeds: string[];
    additionalContext?: string;
}

