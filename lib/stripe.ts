import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover',
});

export interface PaymentIntent {
    id: string;
    client_secret: string;
    amount: number;
    currency: string;
}

export interface BookingData {
    selectedDate: string;
    selectedTime: string;
    selectedPrice: number;
    selectedConsultants: string;
    customerName: string;
    customerEmail: string;
}

export const createPaymentIntent = async (bookingData: BookingData): Promise<PaymentIntent> => {
    try {
        const amount = bookingData.selectedPrice * 100; // Convert to cents
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: {
                date: bookingData.selectedDate,
                time: bookingData.selectedTime,
                consultants: bookingData.selectedConsultants,
                customerName: bookingData.customerName,
                customerEmail: bookingData.customerEmail
            }
        });
        
        return {
            id: paymentIntent.id,
            client_secret: paymentIntent.client_secret!,
            amount,
            currency: 'usd'
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error('Failed to create payment intent');
    }
};

export const confirmPayment = async (paymentIntentId: string): Promise<boolean> => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent.status === 'succeeded';
    } catch (error) {
        console.error('Error confirming payment:', error);
        return false;
    }
};

export const createCheckoutSession = async (bookingData: BookingData): Promise<string> => {
    try {
        const amount = bookingData.selectedPrice * 100;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `AI Consulting Session - ${bookingData.selectedConsultants}`,
                        description: `Consultation on ${bookingData.selectedDate} at ${bookingData.selectedTime}`
                    },
                    unit_amount: amount
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}&customer_name=${encodeURIComponent(bookingData.customerName)}&customer_email=${encodeURIComponent(bookingData.customerEmail)}&selected_date=${encodeURIComponent(bookingData.selectedDate)}&selected_time=${encodeURIComponent(bookingData.selectedTime)}&selected_consultants=${encodeURIComponent(bookingData.selectedConsultants)}&total_amount=${bookingData.selectedPrice}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking`,
            metadata: {
                date: bookingData.selectedDate,
                time: bookingData.selectedTime,
                consultants: bookingData.selectedConsultants,
                customerName: bookingData.customerName,
                customerEmail: bookingData.customerEmail
            },
            customer_email: bookingData.customerEmail
        });
        
        return session.url!;
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new Error('Failed to create checkout session');
    }
};