import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
    try {
        const bookingData = await request.json();
        const { date, time, customerName, customerEmail, consultants, sessionId } = bookingData;

        // Skip creating calendar events in development if no credentials
        if (!process.env.GOOGLE_CALENDAR_CREDENTIALS) {
            console.log('📅 [DEV] Calendar Event (not created):', {
                customer: customerName,
                date: date,
                time: time,
                consultants: consultants,
                sessionId: sessionId
            });
            return NextResponse.json({ 
                success: true, 
                message: 'Calendar event creation skipped in development',
                eventId: 'dev-mock-event'
            });
        }

        // Parse credentials (should be OAuth2 credentials, not service account)
        const credentials = JSON.parse(process.env.GOOGLE_CALENDAR_CREDENTIALS);
        
        // Initialize Google Calendar API with OAuth2
        const auth = new google.auth.OAuth2(
            credentials.client_id,
            credentials.client_secret,
            credentials.redirect_uris?.[0] || 'http://localhost:3000'
        );

        // Set credentials with refresh token
        auth.setCredentials({
            refresh_token: credentials.refresh_token,
            access_token: credentials.access_token
        });

        const calendar = google.calendar({ version: 'v3', auth });

        // Create event details
        const startDateTime = new Date(`${date}T${time}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

        const event = {
            summary: `AI Consultation - ${consultants.join(' & ')}`,
            description: `Consultation session with ${customerName}\n\nSession ID: ${sessionId}\nCustomer Email: ${customerEmail}\n\nThis is a booked consultation session.`,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'America/New_York',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'America/New_York',
            },
            attendees: [
                { email: customerEmail, displayName: customerName },
                // Add consultant emails based on their names
                ...consultants.map((consultant: string) => {
                    const email = consultant === 'Joel Auge' ? 'joel@brainmediaconsulting.com' : 'david@brainmediaconsulting.com';
                    return { email, displayName: consultant };
                })
            ],
            conferenceData: {
                createRequest: {
                    requestId: sessionId,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet'
                    }
                }
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 24 hours before
                    { method: 'popup', minutes: 30 }, // 30 minutes before
                ],
            },
        };

        // Create the event
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all' // Send invitations to attendees
        });

        console.log('📅 Calendar Event Created:', response.data.htmlLink);
        
        return NextResponse.json({ 
            success: true, 
            eventId: response.data.id,
            eventLink: response.data.htmlLink,
            message: 'Calendar event created successfully'
        });

    } catch (error: any) {
        console.error('Error creating calendar event:', error);
        
        // Provide specific error messages for common issues
        if (error.message?.includes('invalid_grant')) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid refresh token. Please re-authenticate.',
                details: 'The refresh token may have expired or been revoked.',
                solution: 'Generate a new refresh token using the OAuth2 flow.'
            }, { status: 401 });
        }
        
        if (error.message?.includes('insufficient authentication')) {
            return NextResponse.json({ 
                success: false, 
                error: 'Authentication failed. Please check OAuth2 credentials.',
                details: 'The OAuth2 credentials may not have the required calendar permissions.',
                solution: 'Ensure the OAuth2 app has Calendar API access and proper scopes.'
            }, { status: 401 });
        }
        
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create calendar event',
            details: error.message || 'Unknown error occurred',
            solution: 'Check the Google Calendar API documentation for troubleshooting steps.'
        }, { status: 500 });
    }
}