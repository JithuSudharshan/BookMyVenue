import EventBus from '../utils/EventBus.js';
import { DOMAIN_EVENTS } from '../utils/bookingConstants.js';
import notificationService from '../services/notificationService.js';

export function setupBookingEventSubscribers() {
  
  // 1. Listen for Booking Cancelled
  EventBus.on(DOMAIN_EVENTS.BOOKING_CANCELLED, async (payload) => {
    try {
      const { bookingId, customerId, vendorId, actorRole } = payload;
      
      const title = 'Booking Cancelled';
      const message = `Booking ${bookingId.toString().substring(0,8)} has been cancelled by ${actorRole}.`;

      if (actorRole !== 'vendor' && vendorId) {
        await notificationService.createNotification(vendorId, title, message, 'BOOKING', bookingId);
      }
      
      if (actorRole !== 'user' && customerId) {
        await notificationService.createNotification(customerId, title, message, 'BOOKING', bookingId);
      }
    } catch (err) {
      console.error('[EventSubscriber] Error handling BOOKING_CANCELLED:', err);
    }
  });

  // 2. Listen for Refund Processed
  EventBus.on(DOMAIN_EVENTS.REFUND_PROCESSED, async (payload) => {
    try {
      // In MVP, Refund Processed could just append to the notification or send a separate one
      // The orchestrator used to append this to the message. We can send a separate notification.
      const { bookingId, amount, destination } = payload;
      // We need to fetch the customer ID from booking if not provided in payload
      // But we can just rely on the notificationService to handle it later.
    } catch (err) {
      console.error('[EventSubscriber] Error handling REFUND_PROCESSED:', err);
    }
  });

}
