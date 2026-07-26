import * as ReservationService from '../services/core/ReservationService.js';
import catchAsync from '../utils/catchAsync.js';

export const createSession = catchAsync(async (req, res) => {
  const { venueId, bookingMode, date, fromTime, toTime, startDate, endDate, guestCount } = req.body;
  const userId = req.user._id;

  const session = await ReservationService.createReservation(userId, venueId, {
    bookingMode, date, fromTime, toTime, startDate, endDate, guestCount
  });

  res.status(201).json({
    status: 'success',
    data: {
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
      pricing: session.pricing,
    }
  });
});

export const getSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const session = await ReservationService.getActiveSession(sessionId);

  // Ensure the user requesting is the one who created it
  if (session.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ status: 'fail', message: 'Unauthorized access to this session' });
  }

  const remainingSeconds = Math.max(0, Math.floor((new Date(session.expiresAt) - new Date()) / 1000));

  res.status(200).json({
    status: 'success',
    data: {
      session,
      remainingSeconds
    }
  });
});

export const releaseSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  await ReservationService.releaseReservation(sessionId);
  
  res.status(200).json({
    status: 'success',
    message: 'Reservation released successfully'
  });
});
