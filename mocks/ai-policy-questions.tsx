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

export const aiPolicyQuestions: Question[] = [
    {
        id: 'org-stance',
        category: 'Organizational Stance',
        question: 'What is your organization\'s current stance on AI use?',
        description: 'This helps us understand your starting point and concerns.',
        type: 'single',
        options: [
            {
                value: 'strict-prohibition',
                label: 'Strict Prohibition',
                description: 'We want to strictly forbid AI use in our environment for clear security, compliance, or ethical reasons.'
            },
            {
                value: 'highly-restricted',
                label: 'Highly Restricted',
                description: 'AI use is allowed only in very limited, controlled scenarios with extensive oversight.'
            },
            {
                value: 'cautious-exploration',
                label: 'Cautious Exploration',
                description: 'We\'re exploring AI cautiously, with strict guidelines and approval processes.'
            },
            {
                value: 'moderate-adoption',
                label: 'Moderate Adoption',
                description: 'We\'re adopting AI in specific departments with defined policies and training.'
            },
            {
                value: 'strategic-embrace',
                label: 'Strategic Embrace',
                description: 'We\'re strategically embracing AI across the organization with comprehensive policies.'
            },
            {
                value: 'full-embrace',
                label: 'Full Embrace',
                description: 'We want everyone to become fully versed in AI and use it daily to improve the organization.'
            }
        ],
        required: true
    },
    {
        id: 'ai-acumen',
        category: 'AI Acumen',
        question: 'How would you rate your organization\'s overall understanding of AI technologies?',
        type: 'single',
        options: [
            { value: '1', label: 'Very Limited - We have minimal understanding' },
            { value: '2', label: 'Limited - Basic understanding of AI concepts' },
            { value: '3', label: 'Moderate - Good understanding of AI capabilities' },
            { value: '4', label: 'Advanced - Strong understanding of AI and its applications' },
            { value: '5', label: 'Expert - Deep expertise in AI technologies and strategies' }
        ],
        required: true
    },
    {
        id: 'primary-concerns',
        category: 'Ethical Boundaries',
        question: 'What are your primary concerns about AI use? (Select all that apply)',
        type: 'multiple',
        options: [
            { value: 'data-privacy', label: 'Data Privacy & Security' },
            { value: 'bias-discrimination', label: 'Bias & Discrimination' },
            { value: 'transparency', label: 'Lack of Transparency' },
            { value: 'job-displacement', label: 'Job Displacement' },
            { value: 'compliance', label: 'Regulatory Compliance' },
            { value: 'intellectual-property', label: 'Intellectual Property' },
            { value: 'reliability', label: 'Reliability & Accuracy' },
            { value: 'cost', label: 'Cost & ROI' },
            { value: 'vendor-lockin', label: 'Vendor Lock-in' },
            { value: 'none', label: 'No major concerns' }
        ],
        required: true
    },
    {
        id: 'use-cases',
        category: 'Use Cases',
        question: 'Which departments or functions are considering or using AI? (Select all that apply)',
        type: 'multiple',
        options: [
            { value: 'executive', label: 'Executive Leadership' },
            { value: 'operations', label: 'Operations' },
            { value: 'customer-service', label: 'Customer Service' },
            { value: 'sales', label: 'Sales & Marketing' },
            { value: 'hr', label: 'Human Resources' },
            { value: 'finance', label: 'Finance & Accounting' },
            { value: 'it', label: 'IT & Engineering' },
            { value: 'legal', label: 'Legal & Compliance' },
            { value: 'product', label: 'Product Development' },
            { value: 'none', label: 'None currently' }
        ],
        required: true
    },
    {
        id: 'risk-tolerance',
        category: 'Risk Tolerance',
        question: 'What is your organization\'s risk tolerance for AI implementation?',
        type: 'single',
        options: [
            {
                value: 'very-low',
                label: 'Very Low',
                description: 'We prioritize safety and compliance above all else.'
            },
            {
                value: 'low',
                label: 'Low',
                description: 'We prefer proven, low-risk AI applications.'
            },
            {
                value: 'moderate',
                label: 'Moderate',
                description: 'We\'re willing to take calculated risks with proper safeguards.'
            },
            {
                value: 'high',
                label: 'High',
                description: 'We\'re willing to experiment and innovate with AI.'
            }
        ],
        required: true
    },
    {
        id: 'compliance-requirements',
        category: 'Compliance',
        question: 'Which compliance requirements must your AI policy address? (Select all that apply)',
        type: 'multiple',
        options: [
            { value: 'gdpr', label: 'GDPR (EU Data Protection)' },
            { value: 'ccpa', label: 'CCPA (California Privacy)' },
            { value: 'hipaa', label: 'HIPAA (Healthcare)' },
            { value: 'sox', label: 'SOX (Financial Reporting)' },
            { value: 'pci-dss', label: 'PCI-DSS (Payment Card)' },
            { value: 'industry-specific', label: 'Industry-Specific Regulations' },
            { value: 'internal-policies', label: 'Internal Corporate Policies' },
            { value: 'none', label: 'No specific requirements' }
        ],
        required: true
    },
    {
        id: 'training-needs',
        category: 'Training & Change Management',
        question: 'What level of training and support do you need?',
        type: 'single',
        options: [
            {
                value: 'policy-only',
                label: 'Policy Documentation Only',
                description: 'We just need clear policy documents and guidelines.'
            },
            {
                value: 'leadership-training',
                label: 'Leadership Training',
                description: 'We need training for executives and managers.'
            },
            {
                value: 'team-training',
                label: 'Team Training',
                description: 'We need comprehensive training for all employees.'
            },
            {
                value: 'ongoing-support',
                label: 'Ongoing Support & Resources',
                description: 'We need continuous training, resources, and support.'
            }
        ],
        required: true
    },
    {
        id: 'governance-structure',
        category: 'Governance',
        question: 'What governance structure do you prefer for AI oversight?',
        type: 'single',
        options: [
            {
                value: 'centralized',
                label: 'Centralized',
                description: 'Single committee or department oversees all AI use.'
            },
            {
                value: 'decentralized',
                label: 'Decentralized',
                description: 'Each department manages its own AI use with guidelines.'
            },
            {
                value: 'hybrid',
                label: 'Hybrid',
                description: 'Central oversight with departmental autonomy.'
            },
            {
                value: 'none',
                label: 'Not Yet Determined',
                description: 'We need help determining the best structure.'
            }
        ],
        required: true
    },
    {
        id: 'specific-concerns',
        category: 'Additional Context',
        question: 'Are there any specific concerns, requirements, or goals you\'d like to address in your AI policy?',
        type: 'text',
        required: false
    }
];

export interface PolicyAssessment {
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    stance: string;
    acumen: string;
    concerns: string[];
    useCases: string[];
    riskTolerance: string;
    compliance: string[];
    training: string;
    governance: string;
    additionalContext?: string;
}

