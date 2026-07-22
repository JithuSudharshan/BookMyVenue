import Booking from "../../models/bookingModel.js";
import User from "../../models/userModel.js";
import Customer from "../../models/customerModel.js";
import Venue from "../../models/venueModel.js";

export const getAllBookings = async ({
  search,
  bookingStatus,
  date,
  sort,
  page = 1,
  limit = 10,
} = {}) => {
  let query = {};

  if (bookingStatus && bookingStatus !== "All") {
    query.bookingStatus = bookingStatus;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query.bookingDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    let orConditions = [];

    // 1. Partial match on Booking ID
    orConditions.push({
      $expr: {
        $regexMatch: {
          input: { $toString: "$_id" },
          regex: search,
          options: "i"
        }
      }
    });

    // 2. Search by Venue name
    const venues = await Venue.find({ name: searchRegex }).select("_id");
    if (venues.length > 0) {
      orConditions.push({ venueId: { $in: venues.map(v => v._id) } });
    }
    
    // 3. Search by Customer (firstName, lastName, full name, email)
    const profiles = await Customer.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
              regex: search,
              options: "i"
            }
          }
        }
      ]
    }).select("userId");
    const customerUserIds = profiles.map(p => p.userId);

    const users = await User.find({
      role: "customer",
      $or: [
        { email: searchRegex },
        { _id: { $in: customerUserIds } }
      ]
    }).select("_id");
    
    if (users.length > 0) {
      orConditions.push({ userId: { $in: users.map(u => u._id) } });
    }

    query.$or = orConditions;
  }

  let sortObj = { createdAt: -1 };
  if (sort) {
    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith("-") ? -1 : 1;
    sortObj = { [sortField]: sortOrder };
  }

  const total = await Booking.countDocuments(query);
  const skip = (page - 1) * limit;

  const bookings = await Booking.find(query)
    .populate({
      path: "userId",
      select: "email role isBlocked createdAt",
      populate: {
        path: "profile",
        select: "firstName lastName phone"
      }
    })
    .populate("venueId", "name location")
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(total / limit);

  return {
    bookings,
    total,
    page,
    limit,
    totalPages,
  };
};

export const getBookingById = async (id) => {
  return await Booking.findById(id)
    .populate({
      path: "userId",
      populate: {
        path: "profile"
      }
    })
    .populate("venueId")
    .populate("slotIds");
};

export const getBookingStats = async () => {
  const stats = await Booking.aggregate([
    {
      $group: {
        _id: "$bookingStatus",
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    totalBookings: 0,
    Pending: 0,
    Confirmed: 0,
    Cancelled: 0,
    Completed: 0
  };

  stats.forEach(stat => {
    const status = stat._id;
    const count = stat.count;
    if (status in result) {
      result[status] = count;
    }
    result.totalBookings += count;
  });

  return result;
};
