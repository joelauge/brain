# Email Service Setup Guide

## Overview
I've installed and configured a basic email service using Resend for sending project invites and notifications.

## What's Been Set Up

### 1. Email Service Library (`lib/email.ts`)
- ✅ Installed Resend package
- ✅ Created email templates for project invites and resend notifications
- ✅ Added proper error handling and fallback for development

### 2. Updated API Routes
- ✅ `/api/notifications/resend-invite` - Now uses proper email service
- ✅ `/api/notifications/send-project` - Now uses proper email service

### 3. Email Templates
- ✅ Professional HTML email templates
- ✅ Responsive design
- ✅ Branded with BRAIN logo and colors
- ✅ Clear call-to-action buttons

## Setup Instructions

### 1. Get Resend API Key
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key
5. Copy the API key

### 2. Add Environment Variable
Add this to your `.env.local` file:
```bash
RESEND_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Verify Domain (Optional)
For production, you'll want to verify your domain in Resend to avoid spam filters.

## How It Works

### Development Mode
- If no `RESEND_API_KEY` is provided, emails are logged to console
- No actual emails are sent
- Perfect for testing and development

### Production Mode
- When `RESEND_API_KEY` is provided, emails are sent via Resend
- Professional HTML emails with proper formatting
- Automatic error handling and fallbacks

## Email Types

### 1. Project Invite Email
- Sent when creating a new project for a client
- Includes project details, quote amount, and consultant info
- Call-to-action to create account and view project

### 2. Resend Invite Email
- Sent when admin clicks "Resend Invite" 
- Reminder-style email with project details
- Same call-to-action as invite email

## Testing

### Test in Development
1. Try resending an invite from the admin dashboard
2. Check the console logs for email content
3. Verify the email template looks correct

### Test in Production
1. Add your Resend API key
2. Try resending an invite
3. Check your email inbox
4. Verify the email formatting and links work

## Troubleshooting

### Common Issues
1. **"Failed to resend invite" error**: Check if `RESEND_API_KEY` is set correctly
2. **Emails not received**: Check spam folder, verify domain in Resend
3. **API errors**: Check Resend dashboard for error logs

### Debug Mode
The service logs all email attempts to the console, making it easy to debug issues.

## Next Steps

1. **Get Resend API Key**: Sign up at resend.com and get your API key
2. **Add to Environment**: Add the key to your `.env.local` file
3. **Test**: Try resending an invite from the admin dashboard
4. **Verify**: Check that emails are being sent successfully

The email service is now ready to use! 🎉
