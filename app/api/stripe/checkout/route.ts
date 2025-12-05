import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { selectedDate, selectedTime, selectedPrice, selectedConsultants, customerName, customerEmail } = body;

        const checkoutUrl = await createCheckoutSession({
            selectedDate,
            selectedTime,
            selectedPrice,
            selectedConsultants,
            customerName,
            customerEmail
        });

        return NextResponse.json({ checkoutUrl });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }
}
