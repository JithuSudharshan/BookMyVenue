import mongoose from 'mongoose';
import AvailabilityOverride from './server/src/models/availabilityOverrideModel.js';
import Venue from './server/src/models/venueModel.js';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const override = await AvailabilityOverride.findOne({ venueId: '6a65c08f3f0905fe7b45e073', date: '2026-07-28' }).lean();
  console.log("OVERRIDE DATA:", JSON.stringify(override, null, 2));
  
  const venue = await Venue.findById('6a65c08f3f0905fe7b45e073').lean();
  console.log("VENUE CONFIG:", JSON.stringify(venue?.bookingConfig, null, 2));
  
  process.exit(0);
};
run();
