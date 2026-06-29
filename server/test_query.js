import mongoose from 'mongoose';
import User from './src/models/User.js';
import CustomerProfile from './src/models/CustomerProfile.js';

const uri = 'mongodb+srv://sreesha_db_user:hqRuD6rNB2NzA903@bookmyvenue-cluster.cuvs7lt.mongodb.net/bookmyvenue?appName=bookmyvenue-cluster';

async function test() {
  await mongoose.connect(uri);
  
  // Find customer1
  const user = await User.findOne({ email: 'customer1@example.com' });
  
  if (user) {
    // Check if profile exists
    let profile = await CustomerProfile.findOne({ userId: user._id });
    if (!profile) {
      // Create profile
      profile = await CustomerProfile.create({
        userId: user._id,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890'
      });
      console.log('Created dummy profile for customer1');
    }
  }

  const users = await User.find({ role: 'user' }).populate('profile');
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

test();
