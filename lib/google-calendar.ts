// Google Calendar integration for booking system
// Note: This file only contains types and mock functions
// Real Google Calendar API calls are handled in API routes

export type Consultant = {
    id: string;
    name: string;
    available: boolean;
    price: number;
};

export type TimeSlot = {
    time: string;
    available: boolean;
    consultants: Consultant[];
};

export type BookingEvent = {
    date: string;
    time: string;
    customerName: string;
    customerEmail: string;
    consultants: string[];
    sessionId: string;
};

// Mock function to get available time slots for a given date
export async function getAvailableTimeSlots(date: string): Promise<TimeSlot[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock available time slots with both consultants
    const mockTimeSlots: TimeSlot[] = [
        { 
            time: "09:00", 
            available: true, 
            consultants: [
                { id: "joel", name: "Joel Auge", available: true, price: 50 },
                { id: "dave", name: "David Morin", available: true, price: 50 }
            ]
        },
        { 
            time: "10:00", 
            available: true, 
            consultants: [
                { id: "joel", name: "Joel Auge", available: true, price: 50 },
                { id: "dave", name: "David Morin", available: true, price: 50 }
            ]
        },
        { 
            time: "11:00", 
            available: true, 
            consultants: [
                { id: "joel", name: "Joel Auge", available: true, price: 50 },
                { id: "dave", name: "David Morin", available: true, price: 50 }
            ]
        },
        { 
            time: "13:00", 
            available: true, 
            consultants: [
                { id: "joel", name: "Joel Auge", available: true, price: 50 },
                { id: "dave", name: "David Morin", available: true, price: 50 }
            ]
        },
        { 
            time: "14:00", 
            available: true, 
            consultants: [
                { id: "joel", name: "Joel Auge", available: true, price: 50 },
                { id: "dave", name: "David Morin", available: true, price: 50 }
            ]
        },
        { 
            time: "15:00", 
            available: true, 
            consultants: [
                { id: "joel", name: "Joel Auge", available: true, price: 50 },
                { id: "dave", name: "David Morin", available: true, price: 50 }
            ]
        },
        { 
            time: "16:00", 
            available: true, 
            consultants: [
                { id: "joel", name: "Joel Auge", available: true, price: 50 },
                { id: "dave", name: "David Morin", available: true, price: 50 }
            ]
        },
        { 
            time: "17:00", 
            available: true, 
            consultants: [
                { id: "joel", name: "Joel Auge", available: true, price: 50 },
                { id: "dave", name: "David Morin", available: true, price: 50 }
            ]
        },
        { 
            time: "18:00", 
            available: true, 
            consultants: [
                { id: "joel", name: "Joel Auge", available: true, price: 50 },
                { id: "dave", name: "David Morin", available: true, price: 50 }
            ]
        },
    ];
    
    // Randomly make some consultants unavailable to simulate real availability
    return mockTimeSlots.map(slot => ({
        ...slot,
        consultants: slot.consultants.map(consultant => ({
            ...consultant,
            available: Math.random() > 0.2 // 80% chance of being available
        }))
    }));
}

// Mock function to create a booking event in Google Calendar
export async function createBookingEvent(bookingData: BookingEvent): Promise<boolean> {
    // This is now handled by the API route /api/calendar/create-event
    console.log('📅 [CLIENT] Calendar Event Request:', {
        customer: bookingData.customerName,
        date: bookingData.date,
        time: bookingData.time,
        consultants: bookingData.consultants,
        sessionId: bookingData.sessionId
    });
    
    // Call the API route to create the calendar event
    try {
        const response = await fetch('/api/calendar/create-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('📅 Calendar Event Created:', result);
            return true;
        } else {
            console.error('Failed to create calendar event');
            return false;
        }
    } catch (error) {
        console.error('Error creating calendar event:', error);
        return false;
    }
}

// Helper function to check if a date is available for booking
export async function isDateAvailable(date: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock date availability check
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Don't allow past dates
    if (selectedDate < today) {
        return false;
    }
    
    // Don't allow weekends
    if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
        return false;
    }
    
    // Mock: 90% chance of being available
    return Math.random() > 0.1;
}
