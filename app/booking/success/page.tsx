"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import Section from '@/components/Section';
import Heading from '@/components/Heading';
import Button from '@/components/Button';

function BookingSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const customerName = searchParams.get('customer_name');
    const customerEmail = searchParams.get('customer_email');
    const selectedDate = searchParams.get('selected_date');
    const selectedTime = searchParams.get('selected_time');
    const selectedConsultants = searchParams.get('selected_consultants');
    const totalAmount = searchParams.get('total_amount');
    
    const [isLoading, setIsLoading] = useState(true);
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [processingComplete, setProcessingComplete] = useState(false);

    useEffect(() => {
        const processBooking = async () => {
            if (sessionId && customerName && customerEmail && selectedDate && selectedTime && selectedConsultants && totalAmount) {
                try {
                    // Parse consultants from the selected consultants string
                    const consultants = selectedConsultants.split(' & ');
                    
                    // Call our booking completion API
                    const response = await fetch('/api/booking/complete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sessionId,
                            customerName,
                            customerEmail,
                            selectedDate,
                            selectedTime,
                            selectedConsultants,
                            totalAmount: parseFloat(totalAmount),
                            consultants
                        })
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log('Booking processed:', result);
                        setProcessingComplete(true);
                    } else {
                        console.error('Failed to process booking');
                    }
                } catch (error) {
                    console.error('Error processing booking:', error);
                }
            }
            
            setIsLoading(false);
            setBookingDetails({
                sessionId,
                status: 'completed',
                customerName,
                customerEmail,
                selectedDate,
                selectedTime,
                selectedConsultants,
                totalAmount
            });
        };

        processBooking();
    }, [sessionId, customerName, customerEmail, selectedDate, selectedTime, selectedConsultants, totalAmount]);

    if (isLoading) {
        return (
            <Layout>
                <Section className="pt-32 pb-16">
                    <div className="container mx-auto text-center">
                        <Heading titleLarge="Processing your booking..." className="mb-8" />
                    </div>
                </Section>
            </Layout>
        );
    }

    return (
        <Layout>
            <Section className="pt-32 pb-16">
                <div className="container mx-auto text-center">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <Heading titleLarge="Booking Confirmed!" className="mb-4" />
                            <p className="text-lg text-n-3 mb-8">
                                Thank you for booking your consultation. We&apos;ll send you a confirmation email shortly.
                            </p>
                        </div>

                        <div className="bg-n-7 rounded-lg p-6 mb-8">
                            <h3 className="text-xl font-semibold mb-4">Booking Details</h3>
                            <div className="space-y-2 text-left">
                                <p><strong>Session ID:</strong> {sessionId}</p>
                                <p><strong>Customer:</strong> {customerName}</p>
                                <p><strong>Email:</strong> {customerEmail}</p>
                                <p><strong>Date:</strong> {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p><strong>Time:</strong> {selectedTime && new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                                <p><strong>Consultants:</strong> {selectedConsultants}</p>
                                <p><strong>Amount:</strong> <span className="text-purple-400">${totalAmount}</span></p>
                                <p><strong>Status:</strong> <span className="text-green-400">Confirmed</span></p>
                                <p><strong>Email Receipt:</strong> <span className={processingComplete ? "text-green-400" : "text-yellow-400"}>{processingComplete ? "Sent" : "Sending..."}</span></p>
                                <p><strong>Calendar Event:</strong> <span className={processingComplete ? "text-green-400" : "text-yellow-400"}>{processingComplete ? "Created" : "Creating..."}</span></p>
                                <p><strong>Next Steps:</strong> You&apos;ll receive an email with meeting details and calendar invite.</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button href="/booking" className="bg-transparent text-n-1 hover:bg-n-6">
                                Book Another Session
                            </Button>
                            <Button href="/" className="bg-transparent text-n-1 hover:bg-n-6">
                                Return Home
                            </Button>
                        </div>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}

export default function BookingSuccess() {
    return (
        <Suspense fallback={
            <Layout>
                <Section className="pt-32 pb-16">
                    <div className="container mx-auto text-center">
                        <Heading titleLarge="Loading..." className="mb-8" />
                    </div>
                </Section>
            </Layout>
        }>
            <BookingSuccessContent />
        </Suspense>
    );
}
