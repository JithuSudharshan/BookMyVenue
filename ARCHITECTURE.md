# BookMyVenue Architecture & Booking Lifecycle

This document describes the final, hardened architecture of the BookMyVenue application, focusing on the booking lifecycle, timezone handling, availability engines, and reservation flows prior to payment integration.

## 1. Core Principles
- **Backend as the Source of Truth:** All availability rules, overlap detection, pricing calculations, and capacity limits are strictly enforced on the server. The frontend only consumes and reflects these decisions.
- **Timezone Consistency (IST First):** The system internally assumes the `Asia/Kolkata` (IST) timezone for all booking dates. System clocks can drift or be hosted elsewhere (e.g., UTC on AWS), so we use a centralized `dateUtils.js` module that forces all date calculations into IST boundaries rather than relying on native `new Date()`.
- **Stateless Validation:** Validation modules (`AvailabilityValidatorService`) are independent pure functions wherever possible, ensuring that both pricing calculation and checkout endpoints follow the exact same constraints.

## 2. Booking Session & Race Condition Handling
To handle high-concurrency environments and prevent double-booking:

### The "Hold" Pattern (Active Sessions)
1. **Initiation:** When a user proceeds to checkout, a `BookingSession` is created with a `status` of `active` and a TTL of 10 minutes.
2. **Pre-Save Overlap Detection:** Before the session is saved, the DB is queried for any existing active session that overlaps in time (hourly) or date range (daily). If found, the new request is immediately rejected.
3. **Compound Indexes:** Unique constraints on `[venueId, date, fromTime]` (hourly) or `[venueId, startDate]` (daily) further prevent edge-case race conditions at the database level.
4. **Release:** If 10 minutes pass without payment confirmation, the session expires (managed by TTL indexes or explicit cron/lazy evaluation). The slot becomes free again.

### Hard Blocks (Overrides)
Vendors can block slots manually. This uses `AvailabilityOverride`. It takes absolute priority and is checked before any active session logic.

## 3. Availability Engine
The core availability generator processes:
1. **Operating Hours:** Derives open and close times for the selected day.
2. **Booking Interval:** Generates contiguous slots based on the venue's configured interval (e.g., 60 mins).
3. **Overlap Masking:** Removes slots that overlap with vendor blocks (`AvailabilityOverride`) or existing bookings/active sessions.
4. *(Removed in Hardening)*: Preparation time buffers were intentionally removed to prevent cascading overlap complexity.

## 4. Payment Policy & Pricing Engine
- **Pricing:** Calculated dynamically via `PricingEngineService` based on `durationHours` (hourly) or `days` (daily). Includes guest capacity checks at the source.
- **Payment Split (MVP):** Daily bookings more than 7 days in advance require a 30% deposit. All others (hourly, or close-in daily) require 100% upfront. This split is calculated in `PaymentPolicyEngine`.

## 5. Vendor Operations (Interval Guarding)
To prevent historical data corruption and unexpected availability glitches, interval changes are strictly locked:
- Vendors **cannot** change their `bookingInterval` if there are any upcoming vendor blocks, active booking sessions, or confirmed bookings. They must clear their calendar to change the interval.
- Overrides are now removed reliably via `blockId` rather than array index to prevent race conditions during simultaneous vendor operations.

## Summary
The system is now deterministic, race-resistant, and mathematically sound regarding IST dates. It is fully prepared for Razorpay webhook integration and the creation of the final `Booking` entity.
