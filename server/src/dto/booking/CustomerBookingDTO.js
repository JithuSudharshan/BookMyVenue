/**
 * Data Transfer Object for Customer Booking Responses.
 * Ensures sensitive vendor information (like onboarding docs, admin remarks) is stripped out
 * before sending the booking data to the customer client.
 * 
 * @param {Object} booking - Raw Booking Mongoose document (lean)
 * @param {Object} vendorProfile - Vendor profile document (lean) associated with the booking's vendorId
 * @returns {Object} Safe DTO for customer consumption
 */
export const toCustomerBookingDTO = (booking, vendorProfile) => {
  if (!booking) return null;

  const venue = booking.venueId || {};

  return {
    _id: booking._id, // Keep _id for React keys, but use bookingNumber for display
    bookingNumber: booking.bookingNumber,
    bookingMode: booking.bookingMode,
    
    // Dates & Times
    date: booking.date,
    fromTime: booking.fromTime,
    toTime: booking.toTime,
    durationMinutes: booking.durationMinutes,
    startDate: booking.startDate,
    endDate: booking.endDate,
    nights: booking.nights,
    
    guestCount: booking.guestCount,
    
    // Statuses
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
    
    // Venue Information
    venue: {
      _id: venue._id,
      name: venue.name,
      images: venue.images || [],
      location: venue.location || null, // Customers need full location to find the venue
      rules: venue.rules || [], // Customers need to know venue rules
      checkInTime: venue.checkInTime || null,
      checkOutTime: venue.checkOutTime || null,
    },
    
    // Vendor Information
    vendor: vendorProfile ? {
      displayName: vendorProfile.fullName || vendorProfile.firstName || 'Venue Owner',
      profileImage: vendorProfile.profileImage || null,
      phone: vendorProfile.phone || null,
      email: vendorProfile.email || booking.vendorId?.email || null, // Fallback to User email if populated
    } : null,
    
    // Pricing & Payment Summary
    pricing: {
      totalAmount: booking.pricing?.totalAmount || 0,
      advanceAmount: booking.pricing?.advanceAmount || 0,
      remainingAmount: booking.pricing?.remainingAmount || 0,
      paymentPolicy: booking.pricing?.paymentPolicy || 'full_payment',
      balanceDueDate: booking.pricing?.balanceDueDate || null,
      policyMetadata: booking.pricing?.policyMetadata || {},
    },
    
    // Timeline
    timeline: booking.timeline ?? [],
    
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
};
