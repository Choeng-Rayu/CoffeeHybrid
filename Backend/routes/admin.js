import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const router = express.Router();

// Middleware to check if user is seller or admin
const requireSeller = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'seller' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Seller privileges required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register seller account
router.post('/register-seller', async (req, res) => {
  try {
    const { username, email, password, shopName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or username already exists'
      });
    }

    // Create new seller
    const seller = new User({
      username,
      email,
      password,
      role: 'seller',
      shopName
    });

    await seller.save();

    res.status(201).json({
      message: 'Seller registered successfully',
      seller: {
        id: seller._id,
        username: seller.username,
        email: seller.email,
        role: seller.role,
        shopName: seller.shopName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new product (sellers only)
router.post('/products', requireSeller, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      basePrice,
      image,
      sizes,
      addOns,
      preparationTime,
      featured
    } = req.body;

    const product = new Product({
      name,
      description,
      category,
      basePrice,
      image,
      sizes: sizes || [
        { name: 'small', priceModifier: -0.50 },
        { name: 'medium', priceModifier: 0 },
        { name: 'large', priceModifier: 0.50 }
      ],
      addOns: addOns || [],
      sellerId: req.user._id,
      shopName: req.user.shopName,
      preparationTime: preparationTime || 5,
      featured: featured || false
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller's products
router.get('/products/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (seller's own products only)
router.put('/products/:productId', requireSeller, async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    // Check if product belongs to seller
    const product = await Product.findOne({ 
      _id: productId, 
      sellerId: req.user._id 
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    // Remove userId from updates
    delete updates.userId;
    delete updates.sellerId;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (seller's own products only)
router.delete('/products/:productId', requireSeller, async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product belongs to seller
    const product = await Product.findOne({ 
      _id: productId, 
      sellerId: req.user._id 
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    await Product.findByIdAndDelete(productId);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller's orders
router.get('/orders/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status, limit = 20, page = 1 } = req.query;

    // Find orders that contain products from this seller
    let matchStage = {
      'items.sellerId': sellerId
    };

    if (status) {
      matchStage.status = status;
    }

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $match: {
          'productDetails.sellerId': sellerId
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $skip: (parseInt(page) - 1) * parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller dashboard stats
router.get('/dashboard/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Get product count
    const productCount = await Product.countDocuments({ sellerId });

    // Get order stats
    const orderStats = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $match: {
          'productDetails.sellerId': sellerId
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $match: {
          'productDetails.sellerId': sellerId,
          createdAt: { $gte: today }
        }
      },
      {
        $count: 'todayCount'
      }
    ]);

    res.json({
      success: true,
      stats: {
        productCount,
        orderStats,
        todayOrders: todayOrders[0]?.todayCount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
