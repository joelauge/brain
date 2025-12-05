import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAIPolicyFollowUp } from '@/lib/email';

export async function GET(request: NextRequest) {
    // Verify this is called by Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Calculate date 2 days ago
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        twoDaysAgo.setHours(0, 0, 0, 0); // Start of day

        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of day

        // Find assessments from exactly 2 days ago that haven't had follow-up sent
        const assessments = await prisma.aIPolicyAssessment.findMany({
            where: {
                createdAt: {
                    gte: twoDaysAgo,
                    lte: today,
                },
                followUpSent: false,
            },
        });

        console.log(`Found ${assessments.length} assessments for follow-up`);

        const results = [];
        for (const assessment of assessments) {
            try {
                const success = await sendAIPolicyFollowUp({
                    email: assessment.email,
                    firstName: assessment.firstName || undefined,
                    lastName: assessment.lastName || undefined,
                    company: assessment.company || undefined,
                });

                if (success) {
                    // Mark as sent
                    await prisma.aIPolicyAssessment.update({
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
        console.error('Error processing AI Policy follow-ups:', error);
        return NextResponse.json(
            { error: 'Failed to process follow-ups' },
            { status: 500 }
        );
    }
}

