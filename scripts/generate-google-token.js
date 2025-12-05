#!/usr/bin/env node

/**
 * Google Calendar OAuth2 Token Generator
 * 
 * This script helps you generate a refresh token for Google Calendar API
 * Run this once to get your refresh token, then use it in your app
 */

const { google } = require('googleapis');
const readline = require('readline');

// OAuth2 credentials from Google Cloud Console
// Get these from your .env file or Google Cloud Console
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
];

async function generateRefreshToken() {
    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    // Generate the URL for user consent
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Force consent screen to get refresh token
    });

    console.log('🔗 Authorize this app by visiting this URL:');
    console.log(authUrl);
    console.log('\n📋 After authorization, you\'ll be redirected to a URL like:');
    console.log('http://localhost:3000/auth/google/callback?code=AUTHORIZATION_CODE');
    console.log('\n📝 Copy the "code" parameter from the URL and paste it below:');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter the authorization code: ', async (code) => {
        try {
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);

            console.log('\n✅ Success! Here are your tokens:');
            console.log('📄 Add this to your .env file:');
            console.log('\nGOOGLE_OAUTH2_CREDENTIALS=' + JSON.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uris: [REDIRECT_URI],
                refresh_token: tokens.refresh_token,
                access_token: tokens.access_token
            }));

            console.log('\n🔑 Refresh Token:', tokens.refresh_token);
            console.log('🔑 Access Token:', tokens.access_token);
            console.log('\n💡 The refresh token is long-lived and can be used to generate new access tokens.');
            
        } catch (error) {
            console.error('❌ Error getting tokens:', error.message);
        }
        
        rl.close();
    });
}

// Credentials are now properly configured

generateRefreshToken().catch(console.error);
