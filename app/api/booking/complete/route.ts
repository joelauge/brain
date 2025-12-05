import { NextRequest, NextResponse } from 'next/server';
import { sendBookingReceipt } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            sessionId, 
            customerName, 
            customerEmail, 
            selectedDate, 
            selectedTime, 
            selectedConsultants, 
            totalAmount,
            consultants 
        } = body;

        // Send booking receipt email
        const emailSent = await sendBookingReceipt({
            email: customerEmail,
            customerName,
            sessionId,
            selectedDate,
            selectedTime,
            selectedConsultants,
            totalAmount,
            consultants
        });

                // Create Google Calendar event to block the time
                let calendarEventCreated = false;
                try {
                    const calendarResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/calendar/create-event-simple`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: selectedDate,
                    time: selectedTime,
                    customerName,
                    customerEmail,
                    consultants,
                    sessionId
                })
            });

            if (calendarResponse.ok) {
                const calendarResult = await calendarResponse.json();
                console.log('📅 Calendar event created:', calendarResult);
                calendarEventCreated = true;
            } else {
                console.error('Failed to create calendar event');
            }
        } catch (error) {
            console.error('Error creating calendar event:', error);
        }

        return NextResponse.json({ 
            success: true, 
            emailSent, 
            calendarEventCreated,
            message: 'Booking processed successfully' 
        });
    } catch (error) {
        console.error('Error processing booking completion:', error);
        return NextResponse.json({ 
            error: 'Failed to process booking completion' 
        }, { status: 500 });
    }
}
