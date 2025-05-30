import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  telegramId: {
    type: String,
    unique: true,
    sparse: true // Allows null values while maintaining uniqueness
  },
  phoneNumber: {
    type: String,
    sparse: true
  },
  strikes: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer'
  },
  shopName: {
    type: String,
    sparse: true // Only for sellers
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
