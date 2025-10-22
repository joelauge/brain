"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Section from "@/components/Section";
import Heading from "@/components/Heading";
import Button from "@/components/Button";
import Image from "@/components/Image";
import { getAvailableTimeSlots, createBookingEvent, TimeSlot, Consultant } from "@/lib/google-calendar";
import { createCheckoutSession } from "@/lib/stripe";

type BookingData = {
    selectedDate: string | null;
    selectedTime: string | null;
    selectedConsultants: Consultant[];
    customerName: string;
    customerEmail: string;
};

const Booking = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [showTimeSlots, setShowTimeSlots] = useState(false);
    const [bookingData, setBookingData] = useState<BookingData>({
        selectedDate: null,
        selectedTime: null,
        selectedConsultants: [],
        customerName: '',
        customerEmail: ''
    });

    // Helper function to convert 24-hour time to 12-hour format
    const formatTime12Hour = (time24: string): string => {
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({ day: null, date: null, available: false });
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isPast = date < new Date();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isAvailable = !isPast && !isWeekend;
            
            days.push({
                day,
                date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                available: isAvailable
            });
        }
        
        return days;
    };

    const handleDateClick = async (date: string) => {
        setSelectedDate(date);
        setShowTimeSlots(true);
        
        try {
            // Fetch available time slots from Google Calendar
            const availableSlots = await getAvailableTimeSlots(date);
            setTimeSlots(availableSlots);
        } catch (error) {
            console.error('Error fetching time slots:', error);
            // Fallback to mock data
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
            setTimeSlots(mockTimeSlots);
        }
    };

    const handleConsultantClick = (timeSlot: TimeSlot, consultant: Consultant) => {
        setBookingData(prev => {
            const isSelected = prev.selectedConsultants.some(c => c.id === consultant.id);
            let newConsultants;
            
            if (isSelected) {
                // Remove consultant if already selected
                newConsultants = prev.selectedConsultants.filter(c => c.id !== consultant.id);
            } else {
                // Add consultant if not selected
                newConsultants = [...prev.selectedConsultants, consultant];
            }
            
            return {
                ...prev,
                selectedTime: timeSlot.time,
                selectedConsultants: newConsultants
            };
        });
    };

    const handleCheckout = async () => {
        if (!selectedDate || !bookingData.selectedTime || bookingData.selectedConsultants.length === 0) return;
        
        try {
            // Calculate total price
            const totalPrice = bookingData.selectedConsultants.reduce((sum, consultant) => sum + consultant.price, 0);
            const consultantsString = bookingData.selectedConsultants.map(c => c.name).join(' & ');
            
            // Create Stripe checkout session
            const checkoutUrl = await createCheckoutSession({
                selectedDate,
                selectedTime: bookingData.selectedTime,
                selectedPrice: totalPrice,
                selectedConsultants: consultantsString,
                customerName: bookingData.customerName,
                customerEmail: bookingData.customerEmail
            });
            
            // Redirect to Stripe checkout
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('Error processing payment. Please try again.');
        }
    };

    const calendarDays = generateCalendarDays();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const totalPrice = bookingData.selectedConsultants.reduce((sum, consultant) => sum + consultant.price, 0);

    return (
        <Layout>
            <Section className="pt-20 pb-20 md:pt-32 md:pb-32 lg:pt-40 lg:pb-40">
                <div className="container">
                    <div className="max-w-6xl mx-auto">
                        <Heading
                            textAlignClassName="text-center mb-16"
                            titleLarge="Book a BRAIN Consulting Session"
                            textLarge="Schedule your personalized AI consultation with Joel and Dave"
                        />
                        
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Calendar Section */}
                            <div className="bg-n-7/50 backdrop-blur-sm border border-n-6 rounded-3xl p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="h3 text-n-1">Select Dates</h3>
                                    <span className="body-2 text-n-3">
                                        {selectedDate ? '1/10 days selected' : '0/10 days selected'}
                                    </span>
                                </div>
                                
                                {/* Month Navigation */}
                                <div className="flex justify-between items-center mb-6">
                                    <button
                                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                        className="w-8 h-8 flex items-center justify-center text-color-1 hover:bg-n-6 rounded-full transition-colors"
                                    >
                                        ←
                                    </button>
                                    <h4 className="h4 text-n-1">
                                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                    </h4>
                                    <button
                                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                        className="w-8 h-8 flex items-center justify-center text-color-1 hover:bg-n-6 rounded-full transition-colors"
                                    >
                                        →
                                    </button>
                                </div>
                                
                                {/* Days of Week */}
                                <div className="grid grid-cols-7 gap-2 mb-4">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center text-n-3 body-2 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-2">
                                    {calendarDays.map((day, index) => (
                                        <button
                                            key={index}
                                            onClick={() => day.available && day.date && handleDateClick(day.date)}
                                            disabled={!day.available}
                                            className={`
                                                aspect-square rounded-xl flex items-center justify-center transition-all
                                                ${day.day === null ? 'invisible' : ''}
                                                ${day.available 
                                                    ? 'text-n-1 hover:bg-color-1/20 hover:text-color-1 cursor-pointer' 
                                                    : 'text-n-4 cursor-not-allowed'
                                                }
                                                ${selectedDate === day.date ? 'bg-color-1 text-n-8' : ''}
                                            `}
                                        >
                                            {day.day}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Time Slots Dropdown */}
                                {showTimeSlots && selectedDate && (
                                    <div className="mt-6 p-4 bg-n-6 rounded-2xl border border-n-5">
                                        <h5 className="h6 text-n-1 mb-4">Available Times & Consultants</h5>
                                        <div className="space-y-4">
                                            {timeSlots.map((slot, index) => (
                                                <div key={index} className="bg-n-7 rounded-xl p-4">
                                                    <div className="body-2 font-semibold text-n-1 mb-3">{formatTime12Hour(slot.time)}</div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {slot.consultants.map((consultant) => {
                                                            const isSelected = bookingData.selectedConsultants.some(c => c.id === consultant.id);
                                                            const isTimeSelected = bookingData.selectedTime === slot.time;
                                                            return (
                                                                <button
                                                                    key={consultant.id}
                                                                    onClick={() => handleConsultantClick(slot, consultant)}
                                                                    disabled={!consultant.available}
                                                                    className={`
                                                                        p-3 rounded-lg text-center transition-all border-2
                                                                        ${consultant.available 
                                                                            ? 'bg-n-8 hover:bg-color-1/20 text-white hover:text-color-1 border-n-5 hover:border-color-1/50' 
                                                                            : 'bg-n-8/50 text-n-4 cursor-not-allowed border-n-6'
                                                                        }
                                                                        ${isSelected && isTimeSelected 
                                                                            ? 'bg-color-1 text-white border-color-1 shadow-lg shadow-color-1/25' 
                                                                            : ''
                                                                        }
                                                                    `}
                                                                >
                                                                    <div className="body-2 font-semibold">{consultant.name}</div>
                                                                    <div className="caption text-xs">${consultant.price}</div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Purchase Summary */}
                            <div className="space-y-6">
                                {/* Pricing Options */}
                                <div className="bg-n-7/50 backdrop-blur-sm border border-n-6 rounded-3xl p-8">
                                    <h3 className="h3 text-n-1 mb-6">Consultation Options</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-4 border-b border-n-5">
                                            <div>
                                                <h4 className="body-1 text-n-1">Single Consultant</h4>
                                                <p className="caption text-n-3">Joel Auge or David Morin</p>
                                            </div>
                                            <span className="h5 text-color-1">$50</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center py-4 border-b border-n-5">
                                            <div>
                                                <h4 className="body-1 text-n-1">Both Consultants</h4>
                                                <p className="caption text-n-3">Joel Auge & David Morin</p>
                                            </div>
                                            <span className="h5 text-color-1">$100</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Customer Information */}
                                <div className="bg-n-7/50 backdrop-blur-sm border border-n-6 rounded-3xl p-8">
                                    <h3 className="h3 text-n-1 mb-6">Contact Information</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block body-2 text-n-2 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={bookingData.customerName}
                                                onChange={(e) => setBookingData(prev => ({ ...prev, customerName: e.target.value }))}
                                                className="w-full p-3 bg-n-8 border border-n-5 rounded-xl text-n-1 placeholder-n-4 focus:border-color-1 focus:outline-none"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block body-2 text-n-2 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                value={bookingData.customerEmail}
                                                onChange={(e) => setBookingData(prev => ({ ...prev, customerEmail: e.target.value }))}
                                                className="w-full p-3 bg-n-8 border border-n-5 rounded-xl text-n-1 placeholder-n-4 focus:border-color-1 focus:outline-none"
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Booking Summary */}
                                <div className="bg-n-7/50 backdrop-blur-sm border border-n-6 rounded-3xl p-8">
                                    <h3 className="h3 text-n-1 mb-6">Booking Summary</h3>
                                    
                                    <div className="space-y-4">
                                        {bookingData.selectedConsultants.map((consultant, index) => (
                                            <div key={consultant.id} className="flex justify-between">
                                                <span className="body-1 text-n-2">{consultant.name}</span>
                                                <span className="body-1 text-color-1">${consultant.price}</span>
                                            </div>
                                        ))}
                                        
                                        <div className="flex justify-between">
                                            <span className="body-1 text-n-2">Date & Time</span>
                                            <span className="body-1 text-color-1">
                                                {selectedDate && bookingData.selectedTime 
                                                    ? `${selectedDate} at ${formatTime12Hour(bookingData.selectedTime)}` 
                                                    : 'Not selected'
                                                }
                                            </span>
                                        </div>
                                        
                                        <div className="border-t border-n-5 pt-4">
                                            <div className="flex justify-between">
                                                <span className="h5 text-n-1">Total</span>
                                                <span className="h5 text-color-1">${totalPrice}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        className="w-full mt-6"
                                        onClick={handleCheckout}
                                        disabled={!selectedDate || !bookingData.selectedTime || bookingData.selectedConsultants.length === 0 || !bookingData.customerName || !bookingData.customerEmail}
                                    >
                                        $ PAY FOR BOOKING
                                    </Button>
                                    
                                    <div className="mt-8 text-center">
                                        <p className="caption text-n-4 mb-4">Need assistance?</p>
                                        <div className="flex justify-center space-x-6">
                                            <button className="flex items-center space-x-2 text-color-1 hover:text-n-1 transition-colors">
                                                <Image src="/images/icons/phone.svg" width={16} height={16} alt="Call" />
                                                <span className="caption">Call</span>
                                            </button>
                                            <button className="flex items-center space-x-2 text-color-1 hover:text-n-1 transition-colors">
                                                <Image src="/images/icons/mail-01.svg" width={16} height={16} alt="Email" />
                                                <span className="caption">Email</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </Layout>
    );
};

export default Booking;
