import EventBus from '../utils/EventBus.js';
import { DOMAIN_EVENTS } from '../utils/bookingConstants.js';
import notificationService from '../services/notificationService.js';

export function setupNotificationSubscribers() {
  
  // 1. Booking Created (Vendor)
  EventBus.on(DOMAIN_EVENTS.BOOKING_CREATED, async (payload) => {
    try {
      const { bookingId, vendorId, bookingNumber } = payload;
      await notificationService.sendNotification({
        recipient: vendorId,
        title: 'New Booking Request',
        message: `You have a new booking request (#${bookingNumber}).`,
        type: 'INFO',
        link: `/vendor/bookings?id=${bookingId}`
      });
    } catch (err) {
      console.error('[NotificationSubscriber] Error on BOOKING_CREATED:', err);
    }
  });

  // 2. Booking Confirmed (Customer)
  EventBus.on(DOMAIN_EVENTS.BOOKING_CONFIRMED, async (payload) => {
    try {
      const { bookingId, customerId, bookingNumber } = payload;
      await notificationService.sendNotification({
        recipient: customerId,
        title: 'Booking Confirmed',
        message: `Your booking (#${bookingNumber}) has been successfully confirmed.`,
        type: 'SUCCESS',
        link: `/customer/bookings?id=${bookingId}`
      });
    } catch (err) {
      console.error('[NotificationSubscriber] Error on BOOKING_CONFIRMED:', err);
    }
  });

  // 3. Booking Cancelled (Customer + Vendor)
  EventBus.on(DOMAIN_EVENTS.BOOKING_CANCELLED, async (payload) => {
    try {
      const { bookingId, customerId, vendorId, actorRole, bookingNumber } = payload;
      const ref = bookingNumber || bookingId.toString().substring(0,8);
      const title = 'Booking Cancelled';
      const message = `Booking #${ref} has been cancelled by ${actorRole}.`;

      if (actorRole !== 'vendor' && vendorId) {
        await notificationService.sendNotification({
          recipient: vendorId,
          title,
          message,
          type: 'WARNING',
          link: `/vendor/bookings?id=${bookingId}`
        });
      }
      if (actorRole !== 'user' && customerId) {
        await notificationService.sendNotification({
          recipient: customerId,
          title,
          message,
          type: 'WARNING',
          link: `/customer/bookings?id=${bookingId}`
        });
      }
    } catch (err) {
      console.error('[NotificationSubscriber] Error on BOOKING_CANCELLED:', err);
    }
  });

  // 4. Refund Processed (Customer)
  EventBus.on(DOMAIN_EVENTS.REFUND_PROCESSED, async (payload) => {
    try {
      const { bookingId, customerId, amount, bookingNumber } = payload;
      const ref = bookingNumber || bookingId.toString().substring(0,8);
      await notificationService.sendNotification({
        recipient: customerId,
        title: 'Refund Processed',
        message: `A refund of ₹${amount} for booking #${ref} has been processed to your wallet.`,
        type: 'SUCCESS',
        link: `/customer/wallet`
      });
    } catch (err) {
      console.error('[NotificationSubscriber] Error on REFUND_PROCESSED:', err);
    }
  });

  // 5. Vendor Approved (Vendor)
  EventBus.on(DOMAIN_EVENTS.VENDOR_APPROVED, async (payload) => {
    try {
      const { vendorId } = payload;
      await notificationService.sendNotification({
        recipient: vendorId,
        title: 'Profile Approved',
        message: 'Your vendor profile has been approved! You can now add venues.',
        type: 'SUCCESS',
        link: `/vendor/dashboard`
      });
    } catch (err) {
      console.error('[NotificationSubscriber] Error on VENDOR_APPROVED:', err);
    }
  });

  // 6. Venue Status Changed (Vendor)
  EventBus.on(DOMAIN_EVENTS.VENUE_STATUS_CHANGED, async (payload) => {
    try {
      const { vendorId, venueId, venueName, status } = payload;
      const type = status === 'approved' ? 'SUCCESS' : (status === 'rejected' ? 'ERROR' : 'INFO');
      await notificationService.sendNotification({
        recipient: vendorId,
        title: `Venue ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your venue "${venueName}" has been ${status}.`,
        type,
        link: `/vendor/venues`
      });
    } catch (err) {
      console.error('[NotificationSubscriber] Error on VENUE_STATUS_CHANGED:', err);
    }
  });
}
