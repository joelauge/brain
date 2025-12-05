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

        // Parse credentials
        const credentials = JSON.parse(process.env.GOOGLE_CALENDAR_CREDENTIALS);
        
        // Initialize Google Calendar API with service account (no impersonation needed for simple events)
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/calendar']
        });

        const calendar = google.calendar({ version: 'v3', auth });

        // Create event details (simplified - no attendees to avoid domain delegation)
        const startDateTime = new Date(`${date}T${time}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

        const event = {
            summary: `AI Consultation - ${consultants.join(' & ')}`,
            description: `Consultation session with ${customerName}\n\nSession ID: ${sessionId}\nCustomer Email: ${customerEmail}\n\nThis is a booked consultation session.\n\nNote: Calendar invites will be sent via email separately.`,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'America/New_York',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'America/New_York',
            },
            // No attendees to avoid domain delegation issues
            // attendees: [],
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
            requestBody: event
        });

        console.log('📅 Calendar Event Created:', response.data.htmlLink);
        
        return NextResponse.json({ 
            success: true, 
            eventId: response.data.id,
            eventLink: response.data.htmlLink,
            message: 'Calendar event created successfully (no attendees added)'
        });

    } catch (error: any) {
        console.error('Error creating calendar event:', error);
        
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to create calendar event',
            details: error.message || 'Unknown error occurred',
            solution: 'Check the Google Calendar API documentation for troubleshooting steps.'
        }, { status: 500 });
    }
}
