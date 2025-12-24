import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAIPreparednessFollowUp } from '@/lib/email';

/**
 * Calculate next business day (skip weekends)
 * Returns date 2 business days from now at 10am
 */
function getNextBusinessDay(date: Date, days: number): Date {
    let currentDate = new Date(date);
    let addedDays = 0;
    
    while (addedDays < days) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            addedDays++;
        }
    }
    
    // Set to 10am
    currentDate.setHours(10, 0, 0, 0);
    return currentDate;
}

export async function GET(request: NextRequest) {
    // Verify this is called by Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();
        const twoBusinessDaysAgo = getNextBusinessDay(now, -2);
        twoBusinessDaysAgo.setHours(0, 0, 0, 0);
        
        const twoBusinessDaysAgoEnd = new Date(twoBusinessDaysAgo);
        twoBusinessDaysAgoEnd.setHours(23, 59, 59, 999);

        // Find assessments from exactly 2 business days ago that haven't had follow-up sent
        // @ts-ignore - Prisma Client generated type
        const assessments = await prisma.aIPreparednessAssessment.findMany({
            where: {
                createdAt: {
                    gte: twoBusinessDaysAgo,
                    lte: twoBusinessDaysAgoEnd,
                },
                followUpSent: false,
            },
        });

        console.log(`Found ${assessments.length} AI Preparedness assessments for follow-up`);

        const results = [];
        for (const assessment of assessments) {
            try {
                const learningGoals = assessment.learningGoals ? JSON.parse(assessment.learningGoals) : [];
                const challenges = assessment.challenges ? JSON.parse(assessment.challenges) : [];
                const supportNeeds = assessment.supportNeeds ? JSON.parse(assessment.supportNeeds) : [];

                const success = await sendAIPreparednessFollowUp({
                    email: assessment.email,
                    firstName: assessment.firstName || undefined,
                    lastName: assessment.lastName || undefined,
                    company: assessment.company || undefined,
                    currentRole: assessment.currentRole,
                    industry: assessment.industry,
                    aiKnowledge: assessment.aiKnowledge,
                    learningGoals: learningGoals,
                    challenges: challenges,
                    supportNeeds: supportNeeds,
                    urgency: assessment.urgency,
                });

                if (success) {
                    // Mark as sent
                    // @ts-ignore - Prisma Client generated type
                    await prisma.aIPreparednessAssessment.update({
                        where: { id: assessment.id },
                        data: {
                            followUpSent: true,
                            followUpSentAt: new Date(),
                        },
                    });
                    results.push({ email: assessment.email, status: 'sent' });
                } else {
                    results.push({ email: assessment.email, status: 'failed' });
                }
            } catch (error) {
                console.error(`Error sending follow-up to ${assessment.email}:`, error);
                results.push({ email: assessment.email, status: 'error' });
            }
        }

        return NextResponse.json({
            success: true,
            processed: assessments.length,
            results,
        });
    } catch (error) {
        console.error('Error processing AI Preparedness follow-ups:', error);
        return NextResponse.json(
            { error: 'Failed to process follow-ups' },
            { status: 500 }
        );
    }
}

