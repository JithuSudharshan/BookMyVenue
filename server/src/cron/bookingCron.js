import cron from 'node-cron';
import Booking from '../models/bookingModel.js';
import EventBus from '../utils/EventBus.js';
import { DOMAIN_EVENTS } from '../utils/bookingConstants.js';

export const startBookingCronJobs = () => {
  console.log('[CRON] Initializing booking cron jobs...');

  // Run every day at 02:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Running auto-completion job for past bookings...');
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Find all bookings that are confirmed, fully paid, and happened before today.
      const bookingsToComplete = await Booking.find({
        bookingStatus: 'confirmed',
        paymentStatus: 'completed',
        $or: [
          { bookingMode: 'hourly', date: { $lt: today.toISOString().split('T')[0] } },
          { bookingMode: 'daily', endDate: { $lt: today.toISOString().split('T')[0] } }
        ]
      }).populate('venueId');

      let completedCount = 0;
      for (const booking of bookingsToComplete) {
        try {
          booking.bookingStatus = 'completed';
          booking.timeline.push({ status: 'completed', note: 'Auto-completed by system cron job.' });
          await booking.save();

          EventBus.publish(DOMAIN_EVENTS.BOOKING_COMPLETED, {
            bookingId: booking._id,
            bookingNumber: booking.bookingNumber,
            customerId: booking.userId,
            vendorId: booking.vendorId,
            venueId: booking.venueId._id,
            venueName: booking.venueId.name
          });
          completedCount++;
        } catch (err) {
          console.error(`[CRON] Failed to auto-complete booking ${booking._id}:`, err);
        }
      }
      console.log(`[CRON] Auto-completion job finished. Completed ${completedCount} bookings.`);
    } catch (error) {
      console.error('[CRON] Auto-completion job encountered a fatal error:', error);
    }
  });
};
