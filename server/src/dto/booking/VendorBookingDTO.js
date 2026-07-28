/**
 * Data Transfer Object for Vendor Booking Responses.
 * Ensures sensitive customer information (like addresses, internal IDs) is stripped out
 * before sending the booking data to the vendor client.
 * 
 * Also implements business logic for contact information visibility based on payment policy.
 * 
 * @param {Object} booking - Raw Booking Mongoose document (lean)
 * @param {Object} customerProfile - Customer profile document (lean) associated with the booking's userId
 * @returns {Object} Safe DTO for vendor consumption
 */
export const toVendorBookingDTO = (booking, customerProfile) => {
  if (!booking) return null;

  const isAdvancePayment = booking.pricing?.paymentPolicy === 'advance_payment';
  const showContact = !isAdvancePayment || booking.paymentStatus === 'completed';

  const venue = booking.venueId || {};
  const primaryImage = venue.images?.find((img) => img.isPrimary)?.url || venue.images?.[0]?.url || null;

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
      location: venue.location ? { city: venue.location.city } : null, // Only expose necessary location details if needed
      primaryImage,
    },
    
    // Customer Information (Conditionally exposed)
    customer: customerProfile ? {
      fullName: `${customerProfile.firstName || ''} ${customerProfile.lastName || ''}`.trim(),
      profileImage: customerProfile.profileImage || null,
      email: showContact ? booking.userId?.email : null,
      phone: showContact ? customerProfile.phone : null,
    } : null,
    
    // Pricing & Payment Summary
    pricing: {
      totalAmount: booking.pricing?.totalAmount || 0,
      advanceAmount: booking.pricing?.advanceAmount || 0,
      remainingAmount: booking.pricing?.remainingAmount || 0,
      paymentPolicy: booking.pricing?.paymentPolicy || 'full_payment',
      policyMetadata: booking.pricing?.policyMetadata || {},
    },
    
    // Timeline
    timeline: booking.timeline ?? [],
    
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
};
