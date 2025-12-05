# Google Calendar OAuth2 Setup Guide

This guide will help you set up OAuth2 authentication for Google Calendar API to enable automatic attendee invitations.

## Prerequisites
- Google Cloud Console access
- Your project: `onfinance-464417`

## Step 1: Create OAuth2 Credentials

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `onfinance-464417`

### 1.2 Navigate to Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in required fields (App name, User support email, Developer contact)
   - Add your email to test users

### 1.3 Create OAuth2 Client
1. Choose **Web application**
2. Add **Authorized redirect URIs**:
   - `http://localhost:3000/auth/google/callback`
   - `https://yourdomain.com/auth/google/callback` (replace with your production domain)
3. Click **Create**
4. Download the JSON file

### 1.4 Enable Calendar API
1. Go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**

## Step 2: Generate Refresh Token

### 2.1 Update the Token Generator Script
1. Open `scripts/generate-google-token.js`
2. Replace the placeholder values with your OAuth2 credentials:
   ```javascript
   const CLIENT_ID = 'your-client-id-from-json-file';
   const CLIENT_SECRET = 'your-client-secret-from-json-file';
   ```

### 2.2 Run the Token Generator
```bash
cd /Users/jauge/Development/brainwave-landing
node scripts/generate-google-token.js
```

### 2.3 Follow the Authorization Flow
1. The script will display a URL
2. Open the URL in your browser
3. Sign in with your Google account
4. Grant permissions for Calendar access
5. Copy the authorization code from the redirect URL
6. Paste it into the terminal
7. The script will output your tokens

### 2.4 Update Environment Variables
Add the OAuth2 credentials to your `.env` file:
```bash
GOOGLE_OAUTH2_CREDENTIALS={"client_id":"your-client-id","client_secret":"your-client-secret","redirect_uris":["http://localhost:3000/auth/google/callback"],"refresh_token":"your-refresh-token","access_token":"your-access-token"}
```

## Step 3: Update Booking API

### 3.1 Switch to OAuth2 Calendar API
Update `app/api/booking/complete/route.ts` to use the OAuth2 endpoint:
```typescript
const calendarResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/calendar/create-event-oauth2`, {
```

## Step 4: Test the Integration

### 4.1 Test Calendar API Directly
```bash
curl -X POST http://localhost:3000/api/calendar/create-event-oauth2 \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-23","time":"14:00","customerName":"Test User","customerEmail":"test@example.com","consultants":["Joel Auge"],"sessionId":"test-session-123"}'
```

### 4.2 Test Complete Booking Flow
1. Go to `/booking`
2. Fill out the booking form
3. Complete payment
4. Check that:
   - Email receipt is sent
   - Calendar event is created
   - Attendees receive invitations

## Troubleshooting

### Common Issues

#### "Invalid refresh token"
- The refresh token has expired
- Run the token generator script again

#### "Insufficient authentication"
- OAuth2 app doesn't have Calendar API access
- Enable Google Calendar API in Google Cloud Console

#### "No access, refresh token"
- OAuth2 credentials not properly configured
- Check that `GOOGLE_OAUTH2_CREDENTIALS` is set correctly

### Token Refresh
Refresh tokens can expire. If you get authentication errors:
1. Run the token generator script again
2. Update the `GOOGLE_OAUTH2_CREDENTIALS` environment variable
3. Restart your development server

## Security Notes

- Keep your OAuth2 credentials secure
- Never commit them to version control
- Use environment variables for all sensitive data
- Consider using a secrets management service for production

## Production Deployment

For production:
1. Update redirect URIs to include your production domain
2. Update the OAuth consent screen with production URLs
3. Use a secure method to store credentials (e.g., Vercel environment variables)
4. Test the complete flow in production

## Benefits of OAuth2 Approach

✅ **No Google Workspace required**
✅ **Automatic attendee invitations**
✅ **Works with personal Google accounts**
✅ **Full calendar event management**
✅ **Meet links automatically generated**
✅ **Email reminders sent to attendees**
