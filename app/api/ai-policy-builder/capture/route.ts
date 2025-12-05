import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { PolicyAssessment } from '@/mocks/ai-policy-questions';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateAssessmentEmail(assessment: PolicyAssessment): string {
    const fullName = [assessment.firstName, assessment.lastName].filter(Boolean).join(' ') || 'Executive';
    const company = assessment.company || 'Your Organization';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New AI Policy Builder Assessment</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #ffffff;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid #e0e0e0;
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          margin: -30px -30px 30px -30px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .section {
          margin-bottom: 25px;
          padding-bottom: 25px;
          border-bottom: 1px solid #e0e0e0;
        }
        .section:last-child {
          border-bottom: none;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #6366f1;
          margin-bottom: 10px;
        }
        .info-row {
          display: flex;
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: 600;
          width: 200px;
          color: #666;
        }
        .info-value {
          flex: 1;
          color: #333;
        }
        .list {
          list-style: none;
          padding: 0;
          margin: 10px 0;
        }
        .list li {
          padding: 5px 0;
          padding-left: 20px;
          position: relative;
        }
        .list li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #6366f1;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          color: #666;
          font-size: 14px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New AI Policy Builder Assessment</h1>
        </div>
        
        <div class="section">
          <div class="section-title">Contact Information</div>
          <div class="info-row">
            <div class="info-label">Name:</div>
            <div class="info-value">${fullName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Email:</div>
            <div class="info-value">${assessment.email}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Company:</div>
            <div class="info-value">${company}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Assessment Results</div>
          <div class="info-row">
            <div class="info-label">Organizational Stance:</div>
            <div class="info-value">${assessment.stance}</div>
          </div>
          <div class="info-row">
            <div class="info-label">AI Acumen Level:</div>
            <div class="info-value">${assessment.acumen}/5</div>
          </div>
          <div class="info-row">
            <div class="info-label">Risk Tolerance:</div>
            <div class="info-value">${assessment.riskTolerance}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Primary Concerns</div>
          <ul class="list">
            ${assessment.concerns.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>
        
        <div class="section">
          <div class="section-title">Use Cases</div>
          <ul class="list">
            ${assessment.useCases.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>
        
        <div class="section">
          <div class="section-title">Compliance Requirements</div>
          <ul class="list">
            ${assessment.compliance.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>
        
        <div class="section">
          <div class="section-title">Training Needs</div>
          <div class="info-value">${assessment.training}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Governance Structure</div>
          <div class="info-value">${assessment.governance}</div>
        </div>
        
        ${assessment.additionalContext ? `
        <div class="section">
          <div class="section-title">Additional Context</div>
          <div class="info-value">${assessment.additionalContext}</div>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>This assessment was completed through the AI Policy Builder tool.</p>
          <p>View the assessment at: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ai-policy-builder">AI Policy Builder</a></p>
        </div>
      </div>
    </body>
    </html>
    `;
}

export async function POST(request: NextRequest) {
    try {
        const assessment: PolicyAssessment = await request.json();

        if (!assessment.email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Add contact to Resend audience (if audience ID is configured)
        if (process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
            try {
                await resend.contacts.create({
                    email: assessment.email,
                    audienceId: process.env.RESEND_AUDIENCE_ID,
                    firstName: assessment.firstName || undefined,
                    lastName: assessment.lastName || undefined,
                    unsubscribed: false,
                });
                console.log('✅ Contact added to Resend audience:', assessment.email);
            } catch (error: any) {
                // If contact already exists, that's okay
                if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
                    console.log('ℹ️ Contact already exists in Resend audience:', assessment.email);
                } else {
                    console.error('Error adding contact to Resend:', error);
                }
            }
        } else if (process.env.RESEND_API_KEY) {
            console.log('ℹ️ RESEND_AUDIENCE_ID not configured, skipping contact addition');
        }

        // Save assessment to database for follow-up email
        try {
            // @ts-ignore - Prisma Client generated type
            await prisma.aIPolicyAssessment.create({
                data: {
                    email: assessment.email,
                    firstName: assessment.firstName,
                    lastName: assessment.lastName,
                    company: assessment.company,
                    stance: assessment.stance,
                    acumen: assessment.acumen,
                    concerns: JSON.stringify(assessment.concerns),
                    useCases: JSON.stringify(assessment.useCases),
                    riskTolerance: assessment.riskTolerance,
                    compliance: JSON.stringify(assessment.compliance),
                    training: assessment.training,
                    governance: assessment.governance,
                    additionalContext: assessment.additionalContext,
                },
            });
            console.log('✅ Assessment saved to database');
        } catch (error) {
            console.error('Error saving assessment to database:', error);
            // Continue even if database save fails
        }

        // Send notification emails to David and Joel
        const notificationEmails = [
            'david@brainmediaconsulting.com',
            'joel@brainmediaconsulting.com'
        ];

        if (process.env.RESEND_API_KEY) {
            const emailPromises = notificationEmails.map(email =>
                resend.emails.send({
                    from: 'Brain Media Consulting <noreply@brainmediaconsulting.com>',
                    to: [email],
                    subject: `New AI Policy Builder Assessment - ${assessment.company || 'New Lead'}`,
                    html: generateAssessmentEmail(assessment),
                })
            );

            await Promise.all(emailPromises);
            console.log('✅ Notification emails sent to David and Joel');
        } else {
            console.log('📧 [DEV] Notification emails (not sent - no API key):', {
                to: notificationEmails,
                assessment: assessment.email
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Assessment captured successfully'
        });
    } catch (error) {
        console.error('Error capturing AI Policy Builder assessment:', error);
        return NextResponse.json(
            { error: 'Failed to capture assessment' },
            { status: 500 }
        );
    }
}

