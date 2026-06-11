import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },
    addressStreet: {
      type: String,
      trim: true,
      default: ''
    },
    addressCity: {
      type: String,
      trim: true,
      default: ''
    },
    addressDistrict: {
      type: String,
      trim: true,
      default: ''
    },
    addressState: {
      type: String,
      trim: true,
      default: ''
    },
    addressZipCode: {
      type: String,
      trim: true,
      default: ''
    },
    addressCountry: {
      type: String,
      trim: true,
      default: 'India'
    },
    role: {
      type: String,
      enum: ['user', 'vendor', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

export default User;
