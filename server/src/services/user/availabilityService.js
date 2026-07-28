import Venue from "../../models/venueModel.js";
import { findOverridesByVenueAndMonth, findOverrideByVenueAndDate } from "../../repositories/vendor/slotOverrideRepository.js";
import { generateHourlyStartTimes, checkDailyAvailability } from "../core/AvailabilityEngine.js";
import AppError from "../../utils/AppError.js";
import { getEffectiveBookingMode } from "../../utils/venueUtils.js";

export const getVenueAvailabilityForDate = async (venueId, requestDate) => {
    const venue = await Venue.findById(venueId).lean();
    if (!venue) throw new AppError("Venue not found", 404);

    const override = await findOverrideByVenueAndDate(venueId, requestDate);

    const bookingConfig = venue.bookingConfig || {};
    const effectiveMode = getEffectiveBookingMode(venue);
    
    if (effectiveMode === 'hourly') {
        const availableStartTimes = generateHourlyStartTimes(bookingConfig, override, requestDate);
        return {
            mode: 'hourly',
            availableStartTimes,
            interval: bookingConfig.bookingInterval || 60
        };
    } else {
        const isAvailable = checkDailyAvailability(bookingConfig, override, requestDate);
        return {
            mode: 'daily',
            isAvailable
        };
    }
};

export const getVenueAvailabilityForMonth = async (venueId, year, month) => {
    // For the calendar view, return the overrides so the frontend can mark dates
    // In a fully ideal scenario, we would pre-calculate checkDailyAvailability for every day
    // But returning overrides is efficient enough for now to draw the calendar block states.
    return await findOverridesByVenueAndMonth(venueId, year, month);
};
