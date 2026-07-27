import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Venue from './src/models/venueModel.js';
import User from './src/models/userModel.js';
import Vendor from './src/models/vendorModel.js'; // Ensure Vendor is loaded

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  // Find a venue
  const venue = await Venue.findOne().populate({
    path: 'vendorId',
    select: 'email createdAt',
    populate: {
      path: 'profile',
      select: 'fullName firstName profileImage'
    }
  });

  console.log("Venue vendorId:", JSON.stringify(venue.vendorId, null, 2));

  mongoose.disconnect();
};

run().catch(console.error);
