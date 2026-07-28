import mongoose from "mongoose";
import Booking from "./src/models/bookingModel.js";

await mongoose.connect('mongodb+srv://jithuspillai2621_db_user:CJWY2RxDGfj4lfct@bookmyvenue.oybyayz.mongodb.net/?appName=BookMyVenue');

await Booking.insertMany([
    {
        userId: new mongoose.Types.ObjectId("687f00000000000000000001"),
        venueId: new mongoose.Types.ObjectId("687f00000000000000000101"),
        slotIds: ["SLOT-001", "SLOT-002"],
        bookingDate: new Date("2026-08-10"),
        guestCount: 150,
        bookingStatus: "Pending",
        paymentStatus: "Pending",
        totalAmount: 120000,
        advanceAmount: 30000,
    },

    {
        userId: new mongoose.Types.ObjectId("687f00000000000000000002"),
        venueId: new mongoose.Types.ObjectId("687f00000000000000000102"),
        slotIds: ["SLOT-005"],
        bookingDate: new Date("2026-08-15"),
        guestCount: 250,
        bookingStatus: "Confirmed",
        paymentStatus: "Partial",
        totalAmount: 250000,
        advanceAmount: 100000,
    },

    {
        userId: new mongoose.Types.ObjectId("687f00000000000000000003"),
        venueId: new mongoose.Types.ObjectId("687f00000000000000000103"),
        slotIds: ["SLOT-010"],
        bookingDate: new Date("2026-08-22"),
        guestCount: 500,
        bookingStatus: "Confirmed",
        paymentStatus: "Completed",
        totalAmount: 450000,
        advanceAmount: 450000,
    },

    {
        userId: new mongoose.Types.ObjectId("687f00000000000000000004"),
        venueId: new mongoose.Types.ObjectId("687f00000000000000000104"),
        slotIds: ["SLOT-003", "SLOT-004"],
        bookingDate: new Date("2026-09-01"),
        guestCount: 80,
        bookingStatus: "Cancelled",
        paymentStatus: "Refunded",
        totalAmount: 60000,
        advanceAmount: 20000,
        cancellationReason: "Emergencies",
        cancellationDescription:
            "Family emergency. Customer requested cancellation one week before the event.",
    },

    {
        userId: new mongoose.Types.ObjectId("687f00000000000000000005"),
        venueId: new mongoose.Types.ObjectId("687f00000000000000000105"),
        slotIds: ["SLOT-008"],
        bookingDate: new Date("2026-09-08"),
        guestCount: 300,
        bookingStatus: "Completed",
        paymentStatus: "Completed",
        totalAmount: 350000,
        advanceAmount: 50000,
    },

    {
        userId: new mongoose.Types.ObjectId("687f00000000000000000006"),
        venueId: new mongoose.Types.ObjectId("687f00000000000000000106"),
        slotIds: ["SLOT-011"],
        bookingDate: new Date("2026-09-15"),
        guestCount: 120,
        bookingStatus: "Cancelled",
        paymentStatus: "Partial",
        totalAmount: 95000,
        advanceAmount: 25000,
        cancellationReason: "Support intervention",
        cancellationDescription:
            "Booking cancelled after duplicate reservation was detected.",
    },

    {
        userId: new mongoose.Types.ObjectId("687f00000000000000000007"),
        venueId: new mongoose.Types.ObjectId("687f00000000000000000107"),
        slotIds: ["SLOT-006"],
        bookingDate: new Date("2026-10-05"),
        guestCount: 200,
        bookingStatus: "Pending",
        paymentStatus: "Pending",
        totalAmount: 180000,
        advanceAmount: 40000,
    },

    {
        userId: new mongoose.Types.ObjectId("687f00000000000000000008"),
        venueId: new mongoose.Types.ObjectId("687f00000000000000000108"),
        slotIds: ["SLOT-015", "SLOT-016"],
        bookingDate: new Date("2026-10-18"),
        guestCount: 600,
        bookingStatus: "Confirmed",
        paymentStatus: "Completed",
        totalAmount: 750000,
        advanceAmount: 200000,
    }
]);

console.log("Bookings inserted");
process.exit();