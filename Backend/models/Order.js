import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  sugarLevel: {
    type: String,
    enum: ['none', 'low', 'medium', 'high'],
    default: 'medium'
  },
  iceLevel: {
    type: String,
    enum: ['none', 'low', 'medium', 'high'],
    default: 'medium'
  },
  addOns: [{
    name: String,
    price: Number
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'no-show', 'cancelled'],
    default: 'pending'
  },
  qrToken: {
    type: String,
    required: true,
    unique: true
  },
  orderSource: {
    type: String,
    enum: ['web', 'telegram'],
    required: true
  },
  customerInfo: {
    name: String,
    phone: String,
    telegramUsername: String
  },
  pickupTime: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
  }
}, {
  timestamps: true
});

// Auto-expire orders after 30 minutes
orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Order', orderSchema);
