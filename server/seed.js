import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import CustomerProfile from './src/models/CustomerProfile.js';
import VendorProfile from './src/models/VendorProfile.js';
import Admin from './src/models/Admin.js';
import Venue from './src/models/Venue.js';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected.');

    // 1. Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await CustomerProfile.deleteMany({});
    await VendorProfile.deleteMany({});
    await Admin.deleteMany({});
    await Venue.deleteMany({});
    console.log('Cleared.');

    // 2. Create Admin
    console.log('Creating Admin...');
    await Admin.create({
      name: 'Super Admin',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@bookmyvenue.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'Password123!',
      role: 'super_admin'
    });

    // 3. Create Users & Customer Profiles
    console.log('Creating Users and Customer Profiles...');
    const userSeedData = [
      { email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe', phone: '1234567890' },
      { email: 'jane.smith@example.com', firstName: 'Jane', lastName: 'Smith', phone: '0987654321' },
      { email: 'suspended.user@example.com', firstName: 'Suspended', lastName: 'User', phone: '1112223333', isBlocked: true }
    ];

    for (const data of userSeedData) {
      const user = await User.create({
        email: data.email,
        password: 'Password123!',
        role: 'user',
        isEmailVerified: true,
        isBlocked: data.isBlocked || false
      });

      await CustomerProfile.create({
        userId: user._id,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
      });
    }

    // 4. Create Vendors & Vendor Profiles
    console.log('Creating Vendors and Vendor Profiles...');
    const vendorSeedData = [
      { email: 'vendor.pending1@example.com', businessName: 'Grand Hyatt Events', fullName: 'Alice Hyatt', phone: '5551112222', onboardingStatus: 'pending' },
      { email: 'vendor.pending2@example.com', businessName: 'Sunset Banquets', fullName: 'Bob Sunset', phone: '5553334444', onboardingStatus: 'pending' },
      { email: 'vendor.approved@example.com', businessName: 'Royal Palace', fullName: 'Charlie Royal', phone: '5555556666', onboardingStatus: 'approved' }
    ];

    const vendorProfiles = [];
    for (const data of vendorSeedData) {
      const vendorUser = await User.create({
        email: data.email,
        password: 'Password123!',
        role: 'vendor',
        isEmailVerified: true
      });

      const profile = await VendorProfile.create({
        userId: vendorUser._id,
        businessName: data.businessName,
        fullName: data.fullName,
        phone: data.phone,
        onboardingStatus: data.onboardingStatus
      });
      vendorProfiles.push(profile);
    }

    // 5. Create sample Venues (linked to the approved vendor)
    console.log('Creating sample Venues...');
    const approvedVendor = vendorProfiles.find(v => v.onboardingStatus === 'approved');

    if (approvedVendor) {
      await Venue.create({
        vendorId: approvedVendor._id,
        categoryId: new mongoose.Types.ObjectId(),
        subcategoryId: new mongoose.Types.ObjectId(),
        name: 'Royal Palace Grand Ballroom',
        slug: 'royal-palace-grand-ballroom',
        description: 'An exquisite ballroom with crystal chandeliers, marble floors, and capacity for up to 500 guests. Perfect for weddings, receptions, and grand celebrations.',
        images: [{ url: 'https://placehold.co/800x600?text=Ballroom', isPrimary: true }],
        location: {
          address: '123 Palace Road, MG Nagar',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
        },
        capacity: 500,
        amenities: ['Parking', 'AC', 'Catering', 'DJ', 'Decoration'],
        price: 150000,
        bookingModel: 'daily',
        rules: ['No outside catering', 'Event must end by 11 PM'],
        approval: {
          status: 'approved',
          submittedAt: new Date('2026-06-01'),
          reviewedAt: new Date('2026-06-05'),
        },
        venueStatus: 'active',
      });

      await Venue.create({
        vendorId: approvedVendor._id,
        categoryId: new mongoose.Types.ObjectId(),
        subcategoryId: new mongoose.Types.ObjectId(),
        name: 'Royal Palace Garden Lawn',
        slug: 'royal-palace-garden-lawn',
        description: 'A lush open-air garden lawn ideal for outdoor events, cocktail parties, and intimate gatherings under the stars.',
        images: [{ url: 'https://placehold.co/800x600?text=Garden', isPrimary: true }],
        location: {
          address: '123 Palace Road, MG Nagar',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
        },
        capacity: 200,
        amenities: ['Parking', 'Open Air', 'Lighting', 'Stage'],
        price: 75000,
        bookingModel: 'daily',
        rules: ['No fireworks', 'Bring your own catering'],
        approval: {
          status: 'submitted',
          submittedAt: new Date('2026-06-15'),
        },
        venueStatus: 'inactive',
      });
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

