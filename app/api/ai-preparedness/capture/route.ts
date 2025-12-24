import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PreparednessAssessment } from '@/mocks/ai-preparedness-questions';

export async function POST(request: NextRequest) {
    try {
        const assessment: PreparednessAssessment = await request.json();

        // @ts-ignore - Prisma Client generation issue on Vercel
        await prisma.aIPreparednessAssessment.create({
            data: {
                email: assessment.email,
                firstName: assessment.firstName,
                lastName: assessment.lastName,
                company: assessment.company,
                currentRole: assessment.currentRole,
                industry: assessment.industry,
                aiKnowledge: assessment.aiKnowledge,
                aiExperience: JSON.stringify(assessment.aiExperience),
                learningGoals: JSON.stringify(assessment.learningGoals),
                timeCommitment: assessment.timeCommitment,
                learningStyle: JSON.stringify(assessment.learningStyle),
                urgency: assessment.urgency,
                challenges: JSON.stringify(assessment.challenges),
                supportNeeds: JSON.stringify(assessment.supportNeeds),
                additionalContext: assessment.additionalContext,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error capturing AI Preparedness Assessment:', error);
        return NextResponse.json(
            { error: 'Failed to capture assessment', details: error.message },
            { status: 500 }
        );
    }
}

