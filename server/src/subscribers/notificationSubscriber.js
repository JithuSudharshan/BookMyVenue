import EventBus from '../utils/EventBus.js';
import { DOMAIN_EVENTS } from '../utils/bookingConstants.js';
import notificationService from '../services/notificationService.js';

export function setupNotificationSubscribers() {
  
  // 1. Booking Confirmed (Customer & Vendor)
  EventBus.on(DOMAIN_EVENTS.BOOKING_CONFIRMED, async (payload) => {
    try {
      const { bookingId, bookingNumber, customerId, vendorId, venueId, venueName } = payload;
      
      const metadata = { bookingId, bookingNumber, venueId, venueName };

      // Notify Customer
      await notificationService.sendNotification({
        recipient: customerId,
        title: 'Booking Confirmed',
        message: `Your booking #${bookingNumber} has been confirmed.`,
        type: 'SUCCESS',
        link: `/customer/bookings?id=${bookingId}`,
        metadata
      });

      // Notify Vendor
      await notificationService.sendNotification({
        recipient: vendorId,
        title: 'New Booking',
        message: `You received a new booking #${bookingNumber}.`,
        type: 'INFO',
        link: `/vendor/bookings?id=${bookingId}`,
        metadata
      });

    } catch (err) {
      console.error('[NotificationSubscriber] Error on BOOKING_CONFIRMED:', err);
    }
  });

  // 2. Booking Cancelled (Customer & Vendor)
  EventBus.on(DOMAIN_EVENTS.BOOKING_CANCELLED, async (payload) => {
    try {
      const { bookingId, bookingNumber, customerId, vendorId, venueId, venueName, actorRole, actorId } = payload;
      
      const ref = bookingNumber || bookingId.toString().substring(0,8);
      const title = 'Booking Cancelled';
      const message = `Booking #${ref} has been cancelled.`;
      
      const metadata = { bookingId, bookingNumber: ref, venueId, venueName, actorRole, actorId };

      if (actorRole !== 'vendor' && vendorId) {
        await notificationService.sendNotification({
          recipient: vendorId,
          title,
          message,
          type: 'WARNING',
          link: `/vendor/bookings?id=${bookingId}`,
          metadata
        });
      }
      
      if (actorRole !== 'user' && customerId) {
        await notificationService.sendNotification({
          recipient: customerId,
          title,
          message,
          type: 'WARNING',
          link: `/customer/bookings?id=${bookingId}`,
          metadata
        });
      }
    } catch (err) {
      console.error('[NotificationSubscriber] Error on BOOKING_CANCELLED:', err);
    }
  });

  // 3. Refund Processed (Customer)
  EventBus.on(DOMAIN_EVENTS.REFUND_PROCESSED, async (payload) => {
    try {
      const { bookingId, customerId, amount, bookingNumber, venueId, venueName } = payload;
      const ref = bookingNumber || bookingId.toString().substring(0,8);
      const metadata = { bookingId, bookingNumber: ref, refundAmount: amount, venueId, venueName };
      
      await notificationService.sendNotification({
        recipient: customerId,
        title: 'Refund Processed',
        message: `₹${amount} has been credited to your wallet for booking #${ref}.`,
        type: 'SUCCESS',
        link: `/customer/wallet`,
        metadata
      });
    } catch (err) {
      console.error('[NotificationSubscriber] Error on REFUND_PROCESSED:', err);
    }
  });

  // 4. Vendor Approved (Vendor)
  EventBus.on(DOMAIN_EVENTS.VENDOR_APPROVED, async (payload) => {
    try {
      const { vendorId } = payload;
      await notificationService.sendNotification({
        recipient: vendorId,
        title: 'Vendor Approved',
        message: 'Your vendor account has been approved. You can now add venues.',
        type: 'SUCCESS',
        link: `/vendor/dashboard`,
        metadata: { actorRole: 'admin' }
      });
    } catch (err) {
      console.error('[NotificationSubscriber] Error on VENDOR_APPROVED:', err);
    }
  });

  // 5. Venue Approved / Rejected (Vendor)
  EventBus.on(DOMAIN_EVENTS.VENUE_STATUS_CHANGED, async (payload) => {
    try {
      const { vendorId, venueId, venueName, status } = payload;
      
      const type = status === 'approved' ? 'SUCCESS' : 'ERROR';
      const title = status === 'approved' ? 'Venue Approved' : 'Venue Rejected';
      const message = status === 'approved' 
        ? `Your venue "${venueName}" has been approved.` 
        : `Your venue "${venueName}" has been rejected.`;
        
      const metadata = { venueId, venueName, actorRole: 'admin' };

      await notificationService.sendNotification({
        recipient: vendorId,
        title,
        message,
        type,
        link: `/vendor/venues`,
        metadata
      });
    } catch (err) {
      console.error('[NotificationSubscriber] Error on VENUE_STATUS_CHANGED:', err);
    }
  });

  // 6. Booking Payment Failed (Customer)
  EventBus.on(DOMAIN_EVENTS.PAYMENT_FAILED, async (payload) => {
    try {
      const { bookingId, customerId, bookingNumber, venueId, venueName } = payload;
      const ref = bookingNumber || bookingId.toString().substring(0,8);
      const metadata = { bookingId, bookingNumber: ref, venueId, venueName };
      
      await notificationService.sendNotification({
        recipient: customerId,
        title: 'Payment Failed',
        message: `Payment for booking #${ref} failed. Please try again.`,
        type: 'ERROR',
        link: `/customer/bookings`,
        metadata
      });
    } catch (err) {
      console.error('[NotificationSubscriber] Error on PAYMENT_FAILED:', err);
    }
  });

  // 7. Booking Expired (Customer)
  EventBus.on(DOMAIN_EVENTS.BOOKING_EXPIRED, async (payload) => {
    try {
      const { bookingId, customerId, bookingNumber, venueId, venueName } = payload;
      const ref = bookingNumber || bookingId.toString().substring(0,8);
      const metadata = { bookingId, bookingNumber: ref, venueId, venueName };
      
      await notificationService.sendNotification({
        recipient: customerId,
        title: 'Booking Expired',
        message: 'Your booking session expired before payment was completed.',
        type: 'WARNING',
        link: `/customer/bookings`,
        metadata
      });
    } catch (err) {
      console.error('[NotificationSubscriber] Error on BOOKING_EXPIRED:', err);
    }
  });

  // 8. Balance Requested (Customer)
  EventBus.on(DOMAIN_EVENTS.BALANCE_REQUESTED, async (payload) => {
    try {
      const { bookingId, customerId, bookingNumber, venueId, venueName, balanceAmount } = payload;
      const ref = bookingNumber || bookingId.toString().substring(0,8);
      const metadata = { bookingId, bookingNumber: ref, venueId, venueName };
      
      await notificationService.sendNotification({
        recipient: customerId,
        title: 'Balance Payment Requested',
        message: `Your vendor has requested the balance payment of ₹${balanceAmount} for booking #${ref}.`,
        type: 'WARNING',
        link: `/customer/bookings?id=${bookingId}`,
        metadata
      });
    } catch (err) {
      console.error('[NotificationSubscriber] Error on BALANCE_REQUESTED:', err);
    }
  });

  // 9. Balance Paid (Vendor)
  EventBus.on(DOMAIN_EVENTS.BALANCE_PAID, async (payload) => {
    try {
      const { bookingId, vendorId, bookingNumber, venueId, venueName, amountPaid } = payload;
      const ref = bookingNumber || bookingId.toString().substring(0,8);
      const metadata = { bookingId, bookingNumber: ref, venueId, venueName };
      
      await notificationService.sendNotification({
        recipient: vendorId,
        title: 'Balance Paid',
        message: `Customer has paid the remaining balance of ₹${amountPaid} for booking #${ref}.`,
        type: 'SUCCESS',
        link: `/vendor/bookings?id=${bookingId}`,
        metadata
      });
    } catch (err) {
      console.error('[NotificationSubscriber] Error on BALANCE_PAID:', err);
    }
  });

  // 10. Booking Completed (Customer & Vendor)
  EventBus.on(DOMAIN_EVENTS.BOOKING_COMPLETED, async (payload) => {
    try {
      const { bookingId, bookingNumber, customerId, vendorId, venueId, venueName } = payload;
      const ref = bookingNumber || bookingId.toString().substring(0,8);
      const metadata = { bookingId, bookingNumber: ref, venueId, venueName };
      
      // Notify Customer
      await notificationService.sendNotification({
        recipient: customerId,
        title: 'Event Completed',
        message: `Your event for booking #${ref} is marked as completed. We hope you had a great time!`,
        type: 'SUCCESS',
        link: `/customer/bookings?id=${bookingId}`,
        metadata
      });

      // Notify Vendor (Only if not the actor, e.g., if auto-completed by cron)
      // Actually, notifying vendor is good anyway so they know it's fully closed.
      if (vendorId) {
        await notificationService.sendNotification({
          recipient: vendorId,
          title: 'Booking Completed',
          message: `Booking #${ref} has been successfully completed.`,
          type: 'SUCCESS',
          link: `/vendor/bookings?id=${bookingId}`,
          metadata
        });
      }
    } catch (err) {
      console.error('[NotificationSubscriber] Error on BOOKING_COMPLETED:', err);
    }
  });
}
