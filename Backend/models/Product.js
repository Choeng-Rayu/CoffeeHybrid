import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['hot', 'iced', 'frappe']
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  sizes: [{
    name: {
      type: String,
      required: true,
      enum: ['small', 'medium', 'large']
    },
    priceModifier: {
      type: Number,
      default: 0
    }
  }],
  addOns: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  available: {
    type: Boolean,
    default: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopName: {
    type: String,
    required: true
  },
  preparationTime: {
    type: Number,
    default: 5 // minutes
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);
