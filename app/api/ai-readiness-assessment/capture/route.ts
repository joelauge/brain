import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { ReadinessAssessment, aiReadinessQuestions } from '@/mocks/ai-readiness-questions';

const resend = new Resend(process.env.RESEND_API_KEY);

function getRecommendations(stage: number) {
    const recommendations = [];
    
    if (stage === 1) {
        recommendations.push({
            title: 'Focus on Awareness',
            description: 'Your goal is to explain AI basics and address top fears like cost and privacy. Start with foundational education about AI technologies and their potential benefits.',
            priority: 'High'
        });
        recommendations.push({
            title: 'Build AI Literacy',
            description: 'Invest in training programs to help your team understand what AI is and how it can support your mission without replacing people.',
            priority: 'High'
        });
    } else if (stage === 2) {
        recommendations.push({
            title: 'Focus on Opportunities',
            description: 'Your goal is to map repetitive tasks and identify 1-3 "Quick-Win" use cases where AI can provide immediate value with minimal risk.',
            priority: 'High'
        });
        recommendations.push({
            title: 'Identify Quick Wins',
            description: 'Look for low-risk AI opportunities like automated email responses, document summarization, or data entry that can demonstrate value.',
            priority: 'High'
        });
    } else if (stage === 3) {
        recommendations.push({
            title: 'Focus on Pilots',
            description: 'Your goal is to run small experiments like automated meeting summaries or donor insight reports to prove AI value before broader adoption.',
            priority: 'High'
        });
        recommendations.push({
            title: 'Run Small Experiments',
            description: 'Launch pilot projects in 1-2 departments to test AI tools and gather data on effectiveness before scaling.',
            priority: 'Medium'
        });
    } else if (stage === 4) {
        recommendations.push({
            title: 'Workflow Integration',
            description: 'Begin integrating AI into your core workflows. Automate routine tasks and enhance existing processes with AI capabilities.',
            priority: 'High'
        });
    } else if (stage === 5) {
        recommendations.push({
            title: 'Systems Integration',
            description: 'Integrate AI across multiple systems and departments. Ensure your tech stack works together seamlessly with AI capabilities.',
            priority: 'High'
        });
    } else if (stage >= 6) {
        recommendations.push({
            title: 'Strategic AI Deployment',
            description: 'You\'re ready for strategic, organization-wide AI initiatives. Focus on optimizing existing implementations and exploring advanced use cases.',
            priority: 'High'
        });
    }

    // Add universal recommendations
    recommendations.push({
        title: 'Complete AI Policy Builder',
        description: 'Use our AI Policy Builder tool to create a comprehensive governance framework that addresses privacy, ethics, and compliance requirements.',
        priority: 'Medium'
    });

    recommendations.push({
        title: 'Schedule a Consultation',
        description: 'Book a session with BRAIN Consulting to discuss your specific needs and develop a customized AI adoption roadmap.',
        priority: 'Medium'
    });

    return recommendations;
}

function generateUserConfirmationEmail(assessment: ReadinessAssessment): string {
    const fullName = [assessment.firstName, assessment.lastName].filter(Boolean).join(' ') || 'there';
    const overallScore = assessment.overallScore || 0;
    const roadmapStage = assessment.roadmapStage || 1;
    const roadmapStageName = assessment.roadmapStageName || 'Awareness & Literacy';
    const recommendations = getRecommendations(roadmapStage);
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your AI Readiness Assessment Results</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Space Grotesk', sans-serif;
          line-height: 1.6;
          color: #ffffff;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          min-height: 100vh;
        }
        .container {
          max-width: 700px;
          width: 100%;
          margin: 0 auto;
          background: #0a0a0a;
          border-radius: 16px;
          padding: 40px;
          border: 1px solid #2a2a2a;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo {
          margin-bottom: 24px;
        }
        .logo img {
          height: 60px;
          width: auto;
          max-width: 100%;
          display: block;
          margin: 0 auto;
        }
        .title {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 24px;
          line-height: 1.2;
        }
        .greeting {
          font-size: 18px;
          color: #ffffff;
          margin-bottom: 24px;
        }
        .intro {
          font-size: 16px;
          color: #a1a1aa;
          margin-bottom: 32px;
        }
        .results-box {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          padding: 32px;
          margin: 32px 0;
          text-align: center;
        }
        .score {
          font-size: 48px;
          font-weight: 700;
          color: #6366f1;
          margin-bottom: 8px;
        }
        .stage-title {
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
        }
        .stage-description {
          color: #a1a1aa;
          font-size: 14px;
          margin-top: 12px;
        }
        .roadmap-section {
          margin: 32px 0;
        }
        .roadmap-stage {
          margin-bottom: 16px;
          padding: 16px;
          border-left: 3px solid #2a2a2a;
          background: #1a1a1a;
          border-radius: 4px;
        }
        .roadmap-stage.current {
          border-left-color: #6366f1;
          background: #1e1b2e;
          border-left-width: 4px;
        }
        .roadmap-stage-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 6px;
        }
        .roadmap-stage.current .roadmap-stage-title {
          color: #6366f1;
        }
        .roadmap-stage-description {
          color: #a1a1aa;
          font-size: 14px;
        }
        .roadmap-stage.current .roadmap-stage-description {
          color: #cac6dd;
        }
        .roadmap-current-badge {
          display: inline-block;
          background: #6366f1;
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          margin-left: 8px;
        }
        .cta-section {
          text-align: center;
          margin: 40px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff;
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        }
        .recommendations {
          margin: 32px 0;
        }
        .recommendations-title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 16px;
        }
        .recommendation-item {
          background: #1a1a1a;
          border-left: 3px solid #6366f1;
          padding: 16px;
          margin-bottom: 12px;
          border-radius: 4px;
        }
        .recommendation-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
        }
        .recommendation-description {
          color: #a1a1aa;
          font-size: 14px;
        }
        .closing {
          color: #a1a1aa;
          margin: 32px 0;
          font-size: 16px;
        }
        .signature {
          color: #ffffff;
          font-weight: 600;
          margin-top: 24px;
        }
        .section {
          margin-bottom: 32px;
          padding-bottom: 32px;
          border-bottom: 1px solid #2a2a2a;
        }
        .section:last-child {
          border-bottom: none;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 16px;
        }
        .pillar-scores-grid {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 12px;
        }
        .pillar-score-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #2a2a2a;
          background: #1a1a1a;
          border-radius: 4px;
        }
        .pillar-name {
          color: #a1a1aa;
          font-size: 14px;
        }
        .pillar-score {
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
        }
        .next-step-item {
          margin-bottom: 20px;
          padding-left: 40px;
          position: relative;
        }
        .next-step-number {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          background: #6366f1;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          line-height: 1;
        }
        .next-step-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 6px;
        }
        .next-step-description {
          color: #a1a1aa;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          font-size: 12px;
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #2a2a2a;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="https://www.brainmediaconsulting.com/_next/image?url=%2Fimages%2Fbrain__white_official_logo.png&w=128&q=75" alt="BRAIN" />
          </div>
          <div class="title">Your AI Readiness Assessment Results</div>
        </div>
        
        <div class="greeting">Hi ${fullName},</div>
        
        <div class="intro">
          Thank you for completing our AI Readiness Assessment! We've analyzed your responses and prepared personalized results and recommendations for your organization.
        </div>
        
        <div class="results-box">
          <div class="score">${overallScore}/100</div>
          <div class="stage-title">Stage ${roadmapStage}: ${roadmapStageName}</div>
          <div class="stage-description">
            ${roadmapStage === 1 ? 'Focus on Awareness. Your goal is to explain AI basics and address top fears like cost and privacy.' :
              roadmapStage === 2 ? 'Focus on Opportunities. Your goal is to map repetitive tasks and identify 1-3 "Quick-Win" use cases.' :
              roadmapStage === 3 ? 'Focus on Pilots. Your goal is to run small experiments like automated meeting summaries or donor insight reports.' :
              roadmapStage === 4 ? 'Focus on Workflow Integration. Begin integrating AI into your core operational processes.' :
              roadmapStage === 5 ? 'Focus on Systems Integration. Integrate AI capabilities across your entire technology infrastructure.' :
              roadmapStage === 6 ? 'Focus on Strategic AI Deployment. You\'re ready for organization-wide strategic AI initiatives.' :
              roadmapStage === 7 ? 'Fully Integrated. You have achieved a fully integrated, AI-driven organization.' :
              'Focus on Awareness. Your goal is to explain AI basics and address top fears like cost and privacy.'}
          </div>
        </div>
        
        <div class="roadmap-section">
          <div class="section-title">AI Readiness Roadmap</div>
          <div style="color: #a1a1aa; font-size: 14px; margin-bottom: 20px;">
            Your organization is currently at Stage ${roadmapStage}. Below is the complete roadmap showing all stages of AI readiness:
          </div>
          ${[
            { stage: 1, name: 'Awareness & Literacy', description: 'Focus on Awareness. Your goal is to explain AI basics and address top fears like cost and privacy.' },
            { stage: 2, name: 'Opportunity Identification', description: 'Focus on Opportunities. Your goal is to map repetitive tasks and identify 1-3 "Quick-Win" use cases.' },
            { stage: 3, name: 'Pilot Projects', description: 'Focus on Pilots. Your goal is to run small experiments like automated meeting summaries or donor insight reports.' },
            { stage: 4, name: 'Workflow Integration', description: 'Focus on Workflow Integration. Begin integrating AI into your core operational processes.' },
            { stage: 5, name: 'Systems Integration', description: 'Focus on Systems Integration. Integrate AI capabilities across your entire technology infrastructure.' },
            { stage: 6, name: 'Strategic AI Deployment', description: 'Focus on Strategic AI Deployment. You\'re ready for organization-wide strategic AI initiatives.' },
            { stage: 7, name: 'Fully Integrated, AI-Driven Organization', description: 'Fully Integrated. You have achieved a fully integrated, AI-driven organization.' },
          ].map((stageInfo) => {
            const isCurrent = stageInfo.stage === roadmapStage;
            return `
              <div class="roadmap-stage ${isCurrent ? 'current' : ''}">
                <div class="roadmap-stage-title">
                  Stage ${stageInfo.stage}: ${stageInfo.name}
                  ${isCurrent ? '<span class="roadmap-current-badge">You are here</span>' : ''}
                </div>
                <div class="roadmap-stage-description">${stageInfo.description}</div>
              </div>
            `;
          }).join('')}
        </div>
        
        ${Object.keys(assessment.categoryScores || {}).length > 0 ? `
        <div class="section">
          <div class="section-title">Pillar Scores (0-5 Scale)</div>
          <table class="pillar-scores-grid" cellpadding="0" cellspacing="12" style="width: 100%; border-collapse: separate;">
            ${(() => {
              const entries = Object.entries(assessment.categoryScores || {});
              const pillarNames: Record<string, string> = {
                'mission-alignment': 'Mission Alignment',
                'culture-change': 'Culture & Change Readiness',
                'skills-capacity': 'People, Skills & Capacity',
                'process-maturity': 'Process Maturity',
                'data-quality': 'Data Quality & Accessibility',
                'tech-stack': 'Tech Stack & Integration',
                'governance': 'Governance, Privacy & Ethics',
                'security': 'Security Posture',
                'budget': 'Budget & Financial Readiness',
                'vendor-readiness': 'Vendor & Tool Readiness'
              };
              
              let html = '';
              for (let i = 0; i < entries.length; i += 2) {
                html += '<tr>';
                
                // First column
                const [category1, score1] = entries[i];
                const pillarName1 = pillarNames[category1] || category1.replace(/-/g, ' ');
                html += `
                  <td style="width: 50%; vertical-align: top; padding: 0;">
                    <div class="pillar-score-item">
                      <div class="pillar-name">${pillarName1}</div>
                      <div class="pillar-score">${score1}/5</div>
                    </div>
                  </td>
                `;
                
                // Second column (if exists)
                if (i + 1 < entries.length) {
                  const [category2, score2] = entries[i + 1];
                  const pillarName2 = pillarNames[category2] || category2.replace(/-/g, ' ');
                  html += `
                    <td style="width: 50%; vertical-align: top; padding: 0;">
                      <div class="pillar-score-item">
                        <div class="pillar-name">${pillarName2}</div>
                        <div class="pillar-score">${score2}/5</div>
                      </div>
                    </td>
                  `;
                } else {
                  // Empty cell if odd number of items
                  html += '<td style="width: 50%;"></td>';
                }
                
                html += '</tr>';
              }
              return html;
            })()}
          </table>
        </div>
        ` : ''}
        
        ${recommendations.length > 0 ? `
        <div class="recommendations">
          <div class="recommendations-title">Key Recommendations</div>
          ${recommendations.slice(0, 3).map((rec: any) => {
            let titleHTML = rec.title;
            if (rec.title === 'Complete AI Policy Builder') {
              titleHTML = `<a href="http://www.brainmediaconsulting.com/ai-policy-builder" style="color: #ffffff; text-decoration: none;">${rec.title}</a>`;
            } else if (rec.title === 'Schedule a Consultation') {
              titleHTML = `<a href="http://www.brainmediaconsulting.com/booking" style="color: #ffffff; text-decoration: none;">${rec.title}</a>`;
            }
            return `
            <div class="recommendation-item">
              <div class="recommendation-title">${titleHTML}</div>
              <div class="recommendation-description">${rec.description}</div>
            </div>
          `;
          }).join('')}
        </div>
        ` : ''}
        
        <div class="section">
          
          <div class="section-title">Next Steps</div>
          <div class="next-step-item">
            <div class="next-step-number">1</div>
            <div>
              <div class="next-step-title"><a href="http://www.brainmediaconsulting.com/booking" style="color: #ffffff; text-decoration: underline;">Schedule a Consultation</a></div>
              <div class="next-step-description">Book a session with our AI readiness experts to discuss your results and develop a customized AI adoption roadmap.</div>
            </div>
          </div>
          <div class="next-step-item">
            <div class="next-step-number">2</div>
            <div>
              <div class="next-step-title">Review Your Detailed Report</div>
              <div class="next-step-description">Download your comprehensive PDF report with detailed analysis, recommendations, and actionable next steps.</div>
            </div>
          </div>
          <div class="next-step-item">
            <div class="next-step-number">3</div>
            <div>
              <div class="next-step-title">Start Your AI Journey</div>
              <div class="next-step-description">Begin implementing the recommendations and tracking your progress as you advance your AI readiness.</div>
            </div>
          </div>
        </div>
        
        <div class="closing">
          Ready to take the next step? <a href="http://www.brainmediaconsulting.com/booking" style="color: #ffffff; text-decoration: underline;">Schedule a consultation</a> with our AI readiness experts to discuss your results and develop a customized AI adoption roadmap tailored to your organization.
        </div>
        
        <div class="signature">Best regards,<br>The BRAIN Media Consulting Team</div>
        
        <div class="footer">
          <p>This email was sent by Brain Media Consulting</p>
          <p>You received this email because you completed the AI Readiness Assessment.</p>
        </div>
      </div>
    </body>
    </html>
    `;
}

function generateAssessmentEmail(assessment: ReadinessAssessment): string {
    const fullName = [assessment.firstName, assessment.lastName].filter(Boolean).join(' ') || 'Executive';
    const company = assessment.company || 'Your Organization';
    const organizationInfo = assessment.answers?.['organization-info'] || 'Not provided';
    const overallScore = assessment.overallScore || 0;
    const roadmapStage = assessment.roadmapStage || 1;
    const roadmapStageName = assessment.roadmapStageName || 'Awareness & Literacy';
    
    // Generate recommendations HTML
    const recommendations = getRecommendations(roadmapStage);
    const recommendationsHTML = recommendations.map((rec: any) => {
      let titleHTML = rec.title;
      if (rec.title === 'Complete AI Policy Builder') {
        titleHTML = `<a href="http://www.brainmediaconsulting.com/ai-policy-builder" style="color: #333; text-decoration: none;">${rec.title}</a>`;
      } else if (rec.title === 'Schedule a Consultation') {
        titleHTML = `<a href="http://www.brainmediaconsulting.com/booking" style="color: #333; text-decoration: none;">${rec.title}</a>`;
      }
      return `
            <div class="recommendation-item">
              <div class="recommendation-title">${titleHTML}</div>
              <div class="recommendation-description">${rec.description}</div>
              <span class="recommendation-priority priority-${rec.priority.toLowerCase()}">${rec.priority} Priority</span>
            </div>
          `;
    }).join('');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New AI Readiness Assessment</title>
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
        .score-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #6366f1;
          color: white;
          border-radius: 12px;
          font-weight: 600;
        }
        .recommendation-item {
          margin-bottom: 20px;
          padding: 15px;
          background: #f9f9f9;
          border-left: 4px solid #6366f1;
          border-radius: 4px;
        }
        .recommendation-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }
        .recommendation-description {
          color: #666;
          margin-bottom: 8px;
        }
        .recommendation-priority {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 4px;
        }
        .priority-high {
          background: #fee2e2;
          color: #991b1b;
        }
        .priority-medium {
          background: #dbeafe;
          color: #1e40af;
        }
        .next-step-item {
          margin-bottom: 15px;
          padding-left: 30px;
          position: relative;
        }
        .next-step-number {
          position: absolute;
          left: 0;
          top: 0;
          width: 24px;
          height: 24px;
          background: #6366f1;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
        }
        .next-step-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }
        .next-step-description {
          color: #666;
          font-size: 14px;
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
          <h1>New AI Readiness Assessment</h1>
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
          <div class="section-title">Organization Information</div>
          <div class="info-row">
            <div class="info-label" style="width: 100%; margin-bottom: 8px;">About Your Organization & Goals:</div>
          </div>
          <div class="info-value" style="padding: 15px; background: #f9f9f9; border-radius: 4px; white-space: pre-wrap; color: #333; margin-bottom: 16px;">
            ${organizationInfo}
          </div>
          <div class="info-row">
            <div class="info-label">Primary Sector:</div>
            <div class="info-value">${(() => {
              const sectorAnswer = assessment.answers?.['primary-sector'];
              if (!sectorAnswer) return 'Not provided';
              const sectorQuestion = aiReadinessQuestions.find(q => q.id === 'primary-sector');
              const option = sectorQuestion?.options?.find(opt => opt.value === sectorAnswer);
              return option?.label || sectorAnswer;
            })()}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Annual Operating Budget:</div>
            <div class="info-value">${(() => {
              const budgetAnswer = assessment.answers?.['annual-budget'];
              if (!budgetAnswer) return 'Not provided';
              const budgetQuestion = aiReadinessQuestions.find(q => q.id === 'annual-budget');
              const option = budgetQuestion?.options?.find(opt => opt.value === budgetAnswer);
              return option?.label || budgetAnswer;
            })()}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Assessment Results</div>
          <div class="info-row">
            <div class="info-label">Overall Score:</div>
            <div class="info-value">
              <span class="score-badge">${overallScore}/100</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-label">Roadmap Stage:</div>
            <div class="info-value">Stage ${roadmapStage}: ${roadmapStageName}</div>
          </div>
          <div class="info-row" style="margin-top: 12px;">
            <div class="info-value" style="font-style: italic; color: #555;">
              ${roadmapStage === 1 ? 'Focus on Awareness. Your goal is to explain AI basics and address top fears like cost and privacy.' :
                roadmapStage === 2 ? 'Focus on Opportunities. Your goal is to map repetitive tasks and identify 1-3 "Quick-Win" use cases.' :
                roadmapStage === 3 ? 'Focus on Pilots. Your goal is to run small experiments like automated meeting summaries or donor insight reports.' :
                roadmapStage === 4 ? 'Focus on Workflow Integration. Begin integrating AI into your core operational processes.' :
                roadmapStage === 5 ? 'Focus on Systems Integration. Integrate AI capabilities across your entire technology infrastructure.' :
                roadmapStage === 6 ? 'Focus on Strategic AI Deployment. You\'re ready for organization-wide strategic AI initiatives.' :
                roadmapStage === 7 ? 'Fully Integrated. You have achieved a fully integrated, AI-driven organization.' :
                'Focus on Awareness. Your goal is to explain AI basics and address top fears like cost and privacy.'}
            </div>
          </div>
        </div>
        
        ${Object.keys(assessment.categoryScores || {}).length > 0 ? `
        <div class="section">
          <div class="section-title">Pillar Responses & Scores (0-5 Scale)</div>
          ${Object.entries(assessment.categoryScores || {}).map(([category, score]: [string, any]) => {
            // Get the pillar name and answer text from the questions array
            const pillarNames: Record<string, string> = {
              'mission-alignment': 'Mission Alignment',
              'culture-change': 'Culture & Change Readiness',
              'skills-capacity': 'People, Skills & Capacity',
              'process-maturity': 'Process Maturity',
              'data-quality': 'Data Quality & Accessibility',
              'tech-stack': 'Tech Stack & Integration',
              'governance': 'Governance, Privacy & Ethics',
              'security': 'Security Posture',
              'budget': 'Budget & Financial Readiness',
              'vendor-readiness': 'Vendor & Tool Readiness'
            };
            const pillarName = pillarNames[category] || category.replace(/-/g, ' ');
            
            // Get the actual answer text
            const question = aiReadinessQuestions.find(q => q.id === category);
            const answerValue = assessment.answers?.[category];
            let answerText = 'Not answered';
            if (answerValue !== undefined && answerValue !== null && answerValue !== '') {
              if (question?.type === 'text') {
                answerText = answerValue;
              } else if (question?.options) {
                const selectedOption = question.options.find(opt => opt.value === answerValue);
                answerText = selectedOption?.label || answerValue;
              }
            }
            
            return `
            <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e0e0e0;">
              <div class="info-row" style="margin-bottom: 6px;">
                <div class="info-label" style="font-weight: 700; color: #6366f1;">${pillarName}:</div>
                <div class="info-value" style="font-weight: 600; color: #333;">
                  <span class="score-badge">${score}/5</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-label" style="font-size: 13px; color: #888;">Question:</div>
                <div class="info-value" style="font-size: 13px; color: #555; font-style: italic;">${question?.question || 'N/A'}</div>
              </div>
              <div class="info-row" style="margin-top: 8px;">
                <div class="info-label" style="font-size: 13px; color: #888;">Answer:</div>
                <div class="info-value" style="font-size: 13px; color: #333; font-weight: 500;">${answerText}</div>
              </div>
            </div>
          `;
          }).join('')}
        </div>
        ` : ''}
        
        <div class="section">
          <div class="section-title">Recommendations</div>
          ${recommendationsHTML}
        </div>
        
        <div class="section">
          <div class="section-title">Next Steps</div>
          <div class="next-step-item">
            <div class="next-step-number">1</div>
            <div>
              <div class="next-step-title"><a href="http://www.brainmediaconsulting.com/booking" style="color: #333; text-decoration: none;">Schedule a Consultation</a></div>
              <div class="next-step-description">Book a session with our AI readiness experts to discuss your results and develop a customized AI adoption roadmap.</div>
            </div>
          </div>
          <div class="next-step-item">
            <div class="next-step-number">2</div>
            <div>
              <div class="next-step-title">Review Your Detailed Report</div>
              <div class="next-step-description">Download your comprehensive PDF report with detailed analysis, recommendations, and actionable next steps.</div>
            </div>
          </div>
          <div class="next-step-item">
            <div class="next-step-number">3</div>
            <div>
              <div class="next-step-title">Start Your AI Journey</div>
              <div class="next-step-description">Begin implementing the recommendations and tracking your progress as you advance your AI readiness.</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>This assessment was completed through the AI Readiness Assessment tool.</p>
          <p>View the assessment at: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ai-readiness-assessment">AI Readiness Assessment</a></p>
        </div>
      </div>
    </body>
    </html>
    `;
}

export async function POST(request: NextRequest) {
    try {
        const assessment: ReadinessAssessment = await request.json();

        if (!assessment.email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(assessment.email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        console.log('📝 Received assessment for email:', assessment.email);

        // Initialize Mailchimp with environment variables
        if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_AUDIENCE_ID) {
            mailchimp.setConfig({
                apiKey: process.env.MAILCHIMP_API_KEY,
                server: process.env.MAILCHIMP_SERVER_PREFIX || 'us22',
            });

            // Add contact to Mailchimp
            try {
                // Generate MD5 hash of lowercase email for MailChimp subscriber hash
                const crypto = await import('crypto');
                const subscriberHash = crypto
                    .createHash('md5')
                    .update(assessment.email.toLowerCase())
                    .digest('hex');

                // Try to add or update list member
                try {
                    await mailchimp.lists.addListMember(
                        process.env.MAILCHIMP_AUDIENCE_ID,
                        {
                            email_address: assessment.email,
                            status: 'subscribed',
                            merge_fields: {
                                FNAME: assessment.firstName || '',
                                LNAME: assessment.lastName || '',
                            },
                        }
                    );
                } catch (addError: any) {
                    // If member exists, update them
                    if (addError.status === 400 && addError.response?.body?.title === 'Member Exists') {
                        await mailchimp.lists.updateListMember(
                            process.env.MAILCHIMP_AUDIENCE_ID,
                            subscriberHash,
                            {
                                merge_fields: {
                                    FNAME: assessment.firstName || '',
                                    LNAME: assessment.lastName || '',
                                },
                            }
                        );
                    } else {
                        throw addError;
                    }
                }

                // Add the "ai-readiness-quiz" tag
                try {
                    await mailchimp.lists.updateListMemberTags(
                        process.env.MAILCHIMP_AUDIENCE_ID,
                        subscriberHash,
                        {
                            tags: [{ name: 'ai-readiness-quiz', status: 'active' }],
                        }
                    );
                    console.log('✅ Successfully added "ai-readiness-quiz" tag to MailChimp member');
                } catch (tagError) {
                    console.error('Error adding tag to MailChimp member:', tagError);
                    // Continue anyway, tag update is not critical
                }
            } catch (mailchimpError: any) {
                console.error('MailChimp error:', mailchimpError);
                // Continue even if MailChimp fails
            }
        } else {
            console.log('ℹ️ MAILCHIMP_API_KEY or MAILCHIMP_AUDIENCE_ID not configured, skipping MailChimp integration');
        }

        // Send notification emails to David and Joel
        const notificationEmails = [
            'david@brainmediaconsulting.com',
            'joel@brainmediaconsulting.com'
        ];

        if (process.env.RESEND_API_KEY) {
            // Generate email HTML first to catch any template generation errors
            let assessmentEmailHTML: string;
            try {
                assessmentEmailHTML = generateAssessmentEmail(assessment);
                console.log('✅ Assessment email HTML generated successfully');
            } catch (templateError) {
                console.error('❌ Error generating assessment email HTML:', templateError);
                assessmentEmailHTML = '<html><body><p>Error generating email template</p></body></html>';
            }

            // Send notification emails to David and Joel (don't block on failures)
            const notificationPromises = notificationEmails.map(async (email) => {
                try {
                    console.log(`📧 Attempting to send notification email to: ${email}`);
                    const result = await resend.emails.send({
                        from: 'Brain Media Consulting <noreply@brainmediaconsulting.com>',
                        to: [email],
                        subject: `New AI Readiness Assessment - ${assessment.company || 'New Lead'}`,
                        html: assessmentEmailHTML,
                    });
                    console.log(`✅ Notification email sent successfully to ${email}`, result);
                    return { email, success: true, result };
                } catch (error: any) {
                    console.error(`❌ Error sending notification email to ${email}:`, error);
                    console.error(`Error details:`, {
                        message: error?.message,
                        statusCode: error?.statusCode,
                        response: error?.response
                    });
                    return { email, success: false, error };
                }
            });

            // Send confirmation email to the user who completed the assessment
            // This should be sent regardless of notification email success
            try {
                console.log(`📧 Sending confirmation email to: ${assessment.email}`);
                const userConfirmationResult = await resend.emails.send({
                    from: 'Brain Media Consulting <noreply@brainmediaconsulting.com>',
                    to: [assessment.email],
                    subject: 'Your AI Readiness Assessment Results',
                    html: generateUserConfirmationEmail(assessment),
                });
                console.log('✅ Confirmation email sent successfully to user:', assessment.email);
                console.log('📧 Email send result:', userConfirmationResult);
            } catch (emailError: any) {
                console.error('❌ Error sending confirmation email to user:', assessment.email, emailError);
                console.error('Error details:', {
                    message: emailError?.message,
                    statusCode: emailError?.statusCode,
                    response: emailError?.response
                });
                // Log the error but don't fail the request - we still want to return success
            }

            // Wait for notification emails (but don't fail if they error)
            const notificationResults = await Promise.allSettled(notificationPromises);
            console.log('📧 Notification email results:', notificationResults);
        } else {
            console.log('📧 [DEV] Notification emails (not sent - no API key):', {
                to: notificationEmails,
                assessment: assessment.email
            });
            console.log('📧 [DEV] User confirmation email (not sent - no API key):', {
                to: assessment.email
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Assessment captured successfully'
        });
    } catch (error) {
        console.error('Error capturing AI Readiness Assessment:', error);
        return NextResponse.json(
            { error: 'Failed to capture assessment' },
            { status: 500 }
        );
    }
}

