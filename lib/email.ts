import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ProjectInviteData {
  email: string;
  firstName: string;
  projectName: string;
  projectDescription: string;
  quotedAmount: string;
  assignedConsultant: string;
  dashboardUrl: string;
  signupUrl: string;
}

export interface BookingReceiptData {
  email: string;
  customerName: string;
  sessionId: string;
  selectedDate: string;
  selectedTime: string;
  selectedConsultants: string;
  totalAmount: number;
  consultants: string[];
}

export function generateProjectInviteEmail(data: ProjectInviteData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Project Quote - ${data.projectName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Space Grotesk', sans-serif;
          line-height: 1.6;
          color: #ffffff;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          min-height: 100vh;
        }
        .container {
          background: #0a0a0a;
          border-radius: 16px;
          padding: 40px;
          border: 1px solid #2a2a2a;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo {
          margin-bottom: 16px;
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
        .content {
          margin-bottom: 40px;
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
        .project-details {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          padding: 32px;
          margin: 32px 0;
        }
        .project-name {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 16px;
        }
        .project-description {
          color: #a1a1aa;
          margin-bottom: 24px;
          font-size: 16px;
        }
        .amount {
          font-size: 36px;
          font-weight: 700;
          color: #6366f1;
          margin-bottom: 16px;
        }
        .consultant {
          color: #a1a1aa;
          font-size: 14px;
        }
        .cta-section {
          text-align: center;
          margin: 40px 0;
        }
        .cta-text {
          font-size: 18px;
          color: #ffffff;
          margin-bottom: 24px;
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
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4);
        }
        .features {
          margin: 32px 0;
        }
        .features-title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 16px;
        }
        .features-list {
          color: #a1a1aa;
          font-size: 16px;
        }
        .features-list li {
          margin-bottom: 8px;
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
            <img src="data:image/png;base64,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" alt="BRAIN" style="height: 60px; width: auto; max-width: 100%; display: block; margin: 0 auto;" />
          </div>
          <div class="title">Your Project Quote is Ready!</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hi ${data.firstName},</div>
          
          <div class="intro">Great news! We've prepared a detailed quote for your AI consulting project. Here are the details:</div>
          
          <div class="project-details">
            <div class="project-name">${data.projectName}</div>
            <div class="project-description">${data.projectDescription}</div>
            <div class="amount">${data.quotedAmount}</div>
            <div class="consultant">Assigned Consultant: ${data.assignedConsultant}</div>
          </div>
          
          <div class="cta-section">
            <div class="cta-text">Ready to get started? Create your account and access your project dashboard:</div>
            <a href="${data.signupUrl}" class="cta-button">Create Account & View Project</a>
          </div>
          
          <div class="features">
            <div class="features-title">Once you've created your account, you'll be able to:</div>
            <ul class="features-list">
              <li>Track your project progress in real-time</li>
              <li>Communicate directly with your consultant</li>
              <li>Upload files and provide feedback</li>
              <li>Manage payments and project milestones</li>
            </ul>
          </div>
          
          <div class="closing">If you have any questions or need to discuss the project details, please don't hesitate to reach out.</div>
          
          <div class="signature">Best regards,<br>The Brain Media Consulting Team</div>
        </div>
        
        <div class="footer">
          <p>This email was sent by Brain Media Consulting</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateProjectInviteResendEmail(data: ProjectInviteData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reminder: Your Project Quote - ${data.projectName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Space Grotesk', sans-serif;
          line-height: 1.6;
          color: #ffffff;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          min-height: 100vh;
        }
        .container {
          background: #0a0a0a;
          border-radius: 16px;
          padding: 40px;
          border: 1px solid #2a2a2a;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo {
          margin-bottom: 16px;
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
        .content {
          margin-bottom: 40px;
        }
        .greeting {
          font-size: 18px;
          color: #ffffff;
          margin-bottom: 24px;
        }
        .reminder {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 24px 0;
          color: #1a1a1a;
          font-weight: 600;
          font-size: 16px;
        }
        .intro {
          font-size: 16px;
          color: #a1a1aa;
          margin-bottom: 32px;
        }
        .project-details {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          padding: 32px;
          margin: 32px 0;
        }
        .project-name {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 16px;
        }
        .project-description {
          color: #a1a1aa;
          margin-bottom: 24px;
          font-size: 16px;
        }
        .amount {
          font-size: 36px;
          font-weight: 700;
          color: #6366f1;
          margin-bottom: 16px;
        }
        .consultant {
          color: #a1a1aa;
          font-size: 14px;
        }
        .cta-section {
          text-align: center;
          margin: 40px 0;
        }
        .cta-text {
          font-size: 18px;
          color: #ffffff;
          margin-bottom: 24px;
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
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4);
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
            <img src="data:image/png;base64,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" alt="BRAIN" style="height: 60px; width: auto; max-width: 100%; display: block; margin: 0 auto;" />
          </div>
          <div class="title">Reminder: Your Project Quote</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hi ${data.firstName},</div>
          
          <div class="reminder">
            <strong>Friendly Reminder:</strong> We sent you a project quote for "${data.projectName}" but haven't heard back from you yet.
          </div>
          
          <div class="intro">Here's a quick reminder of your project details:</div>
          
          <div class="project-details">
            <div class="project-name">${data.projectName}</div>
            <div class="project-description">${data.projectDescription}</div>
            <div class="amount">${data.quotedAmount}</div>
            <div class="consultant">Assigned Consultant: ${data.assignedConsultant}</div>
          </div>
          
          <div class="cta-section">
            <div class="cta-text">Ready to get started? Create your account and access your project dashboard:</div>
            <a href="${data.signupUrl}" class="cta-button">Create Account & View Project</a>
          </div>
          
          <div class="closing">If you have any questions or need to discuss the project details, please don't hesitate to reach out.</div>
          
          <div class="signature">Best regards,<br>The Brain Media Consulting Team</div>
        </div>
        
        <div class="footer">
          <p>This email was sent by Brain Media Consulting</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendProjectInvite(data: ProjectInviteData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Project Invite (No API Key):', {
        to: data.email,
        subject: `Your Project Quote - ${data.projectName}`,
        data
      });
      return true; // Return true for development
    }

    const result = await resend.emails.send({
      from: 'Brain Media Consulting <noreply@brainmediaconsulting.com>',
      to: [data.email],
      subject: `Your Project Quote - ${data.projectName}`,
      html: generateProjectInviteEmail(data),
    });

    console.log('📧 Project Invite Sent:', result);
    return true;
  } catch (error) {
    console.error('Error sending project invite:', error);
    return false;
  }
}

export async function sendProjectInviteResend(data: ProjectInviteData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Resend Project Invite (No API Key):', {
        to: data.email,
        subject: `Reminder: Your Project Quote - ${data.projectName}`,
        data
      });
      return true; // Return true for development
    }

    // Add a small delay to prevent rapid-fire sends
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await resend.emails.send({
      from: 'Brain Media Consulting <noreply@brainmediaconsulting.com>',
      to: [data.email],
      subject: `Reminder: Your Project Quote - ${data.projectName}`,
      html: generateProjectInviteResendEmail(data),
    });

    console.log('📧 Resend Project Invite Sent:', result);
    return true;
  } catch (error) {
    console.error('Error resending project invite:', error);
    return false;
  }
}

export function generateBookingReceiptEmail(data: BookingReceiptData): string {
  const formattedDate = new Date(data.selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = new Date(`2000-01-01T${data.selectedTime}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - ${data.selectedConsultants}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Space Grotesk', sans-serif;
          line-height: 1.6;
          color: #ffffff;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          min-height: 100vh;
        }
        .container {
          background: #0a0a0a;
          border-radius: 16px;
          padding: 40px;
          border: 1px solid #2a2a2a;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo {
          margin-bottom: 16px;
        }
        .logo img {
          height: 60px;
          width: auto;
        }
        .title {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 16px;
          color: #888888;
        }
        .content {
          margin-bottom: 40px;
        }
        .greeting {
          font-size: 18px;
          color: #ffffff;
          margin-bottom: 24px;
        }
        .booking-details {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #2a2a2a;
        }
        .booking-details h3 {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 16px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #2a2a2a;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 500;
          color: #cccccc;
        }
        .detail-value {
          color: #ffffff;
          font-weight: 600;
        }
        .amount {
          color: #8b5cf6;
          font-size: 18px;
        }
        .next-steps {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #2a2a2a;
        }
        .next-steps h3 {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 16px;
        }
        .next-steps ul {
          list-style: none;
          padding: 0;
        }
        .next-steps li {
          padding: 8px 0;
          color: #cccccc;
          position: relative;
          padding-left: 24px;
        }
        .next-steps li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #8b5cf6;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #2a2a2a;
        }
        .footer-text {
          color: #888888;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .contact-info {
          color: #cccccc;
          font-size: 14px;
        }
        .contact-info a {
          color: #8b5cf6;
          text-decoration: none;
        }
        .contact-info a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="data:image/png;base64,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" alt="Brain Media Consulting Logo" />
          </div>
          <h1 class="title">Booking Confirmed!</h1>
          <p class="subtitle">Your consultation session has been successfully booked</p>
        </div>

        <div class="content">
          <div class="greeting">
            Hi ${data.customerName},
          </div>

          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Session ID</span>
              <span class="detail-value">${data.sessionId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time</span>
              <span class="detail-value">${formattedTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Consultants</span>
              <span class="detail-value">${data.selectedConsultants}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Amount</span>
              <span class="detail-value amount">$${data.totalAmount}</span>
            </div>
          </div>

          <div class="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>You'll receive a calendar invite with meeting details</li>
              <li>We'll send you a preparation guide 24 hours before your session</li>
              <li>Your consultants will be in touch to discuss your specific needs</li>
              <li>Join the meeting at the scheduled time using the provided link</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p class="footer-text">
            Thank you for choosing Brain Media Consulting for your AI consultation needs.
          </p>
          <div class="contact-info">
            Questions? Contact us at <a href="mailto:hello@brainmediaconsulting.com">hello@brainmediaconsulting.com</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendBookingReceipt(data: BookingReceiptData): Promise<boolean> {
  try {
    // Skip sending in development if no API key
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('your_')) {
      console.log('📧 [DEV] Booking Receipt Email (not sent):', {
        to: data.email,
        subject: `Booking Confirmation - ${data.selectedConsultants}`,
        sessionId: data.sessionId
      });
      return true; // Return true for development
    }

    // Add a small delay to prevent rapid-fire sends
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await resend.emails.send({
      from: 'Brain Media Consulting <noreply@brainmediaconsulting.com>',
      to: [data.email],
      subject: `Booking Confirmation - ${data.selectedConsultants}`,
      html: generateBookingReceiptEmail(data),
    });

    console.log('📧 Booking Receipt Sent:', result);
    return true;
  } catch (error) {
    console.error('Error sending booking receipt:', error);
    return false;
  }
}

export interface AIPolicyFollowUpData {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

export function generateAIPolicyFollowUpEmail(data: AIPolicyFollowUpData): string {
  const firstName = data.firstName || 'there';
  const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://brainmediaconsulting.com'}/booking`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Follow-up: AI Policy Builder</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        }
        .container {
          background: #0a0a0a;
          border-radius: 16px;
          padding: 40px;
          border: 1px solid #2a2a2a;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #AC6AFF;
          margin-bottom: 20px;
        }
        .content {
          color: #ffffff;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #a1a1aa;
          margin-bottom: 30px;
          line-height: 1.8;
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
          text-align: center;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #2a2a2a;
          color: #6b7280;
          font-size: 14px;
        }
        .signature {
          color: #ffffff;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">BRAIN</div>
        </div>
        <div class="content">
          <div class="greeting">Hi ${firstName},</div>
          <div class="message">
            It's Joel from Brain Consulting. You completed our AI Policy Builder online and I'd love to follow up with you and see how we may be able to help implement some of these guidelines in your organization.
          </div>
          <div class="message">
            The easiest next step would be to book a quick follow up here on our booking page:
          </div>
          <div style="text-align: center;">
            <a href="${bookingUrl}" class="cta-button">Book a Consultation</a>
          </div>
          <div class="signature">
            Best regards,<br>
            Joel Auge<br>
            Brain Media Consulting
          </div>
        </div>
        <div class="footer">
          <p>This email was sent by Brain Media Consulting</p>
          <p>If you have any questions, please don't hesitate to reach out.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendAIPolicyFollowUp(data: AIPolicyFollowUpData): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 [DEV] AI Policy Follow-up Email (not sent):', {
        to: data.email,
        subject: 'Follow-up: AI Policy Builder',
      });
      return true;
    }

    const result = await resend.emails.send({
      from: 'Joel Auge <joel@brainmediaconsulting.com>',
      to: [data.email],
      subject: 'Follow-up: AI Policy Builder',
      html: generateAIPolicyFollowUpEmail(data),
    });

    console.log('📧 AI Policy Follow-up Sent:', result);
    return true;
  } catch (error) {
    console.error('Error sending AI Policy follow-up:', error);
    return false;
  }
}
