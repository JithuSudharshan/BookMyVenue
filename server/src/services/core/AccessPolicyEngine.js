import { isPaymentRequirementSatisfied } from './PaymentPolicyEngine.js';

/**
 * Core engine determining what a customer is allowed to access
 * based on booking status, payment compliance, and event timeline.
 */
export const getCustomerAccessPolicy = (booking) => {
  const eventDateStr = booking.bookingMode === 'hourly' ? booking.date : booking.startDate;
  
  let daysUntilEvent = 999;
  if (eventDateStr) {
    const eventDate = new Date(eventDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  }
  
  const fullPaymentThresholdDays = booking.pricing?.policyMetadata?.fullPaymentThresholdDays || 7;
  const isWithinCoordinationWindow = daysUntilEvent <= fullPaymentThresholdDays;
  
  const paymentSatisfied = isPaymentRequirementSatisfied(booking);
  
  const isConfirmedOrCompleted = ['confirmed', 'completed'].includes(booking.bookingStatus?.toLowerCase());
  
  // Sensitive info requires a valid active booking, payment compliance, and being inside the coordination window
  const canViewSensitiveInfo = isConfirmedOrCompleted && isWithinCoordinationWindow && paymentSatisfied;
  
  return {
    permissions: {
      canViewVendorContact: canViewSensitiveInfo,
      canViewDirections: canViewSensitiveInfo,
      canContactVendor: canViewSensitiveInfo,
      canDownloadInvoice: booking.paymentStatus !== 'pending',
      canCancel: booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'pending',
      canReview: booking.bookingStatus === 'completed'
    },
    status: {
      isWithinCoordinationWindow,
      paymentSatisfied,
      daysUntilEvent: daysUntilEvent > 0 ? daysUntilEvent : 0,
      coordinationWindowDays: fullPaymentThresholdDays
    }
  };
};
