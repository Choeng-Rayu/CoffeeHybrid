import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import qr from 'qr-image';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// Create new order
router.post('/', async (req, res) => {
  try {
    const { userId, items, orderSource, customerInfo } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Account is blocked due to no-shows' });
    }

    // Calculate total price
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      let itemPrice = product.basePrice;
      
      // Add size modifier
      if (item.size) {
        const sizeOption = product.sizes.find(s => s.name === item.size);
        if (sizeOption) {
          itemPrice += sizeOption.priceModifier;
        }
      }

      // Add add-ons
      let addOnsPrice = 0;
      const itemAddOns = [];
      if (item.addOns && item.addOns.length > 0) {
        for (const addOn of item.addOns) {
          const productAddOn = product.addOns.find(a => a.name === addOn.name);
          if (productAddOn) {
            addOnsPrice += productAddOn.price;
            itemAddOns.push({
              name: addOn.name,
              price: productAddOn.price
            });
          }
        }
      }

      itemPrice += addOnsPrice;
      const quantity = item.quantity || 1;
      const totalItemPrice = itemPrice * quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        size: item.size || 'medium',
        sugarLevel: item.sugarLevel || 'medium',
        iceLevel: item.iceLevel || 'medium',
        addOns: itemAddOns,
        price: totalItemPrice,
        quantity
      });

      total += totalItemPrice;
    }

    // Generate unique QR token
    const qrToken = uuidv4();

    // Create order
    const order = new Order({
      userId,
      items: orderItems,
      total,
      qrToken,
      orderSource,
      customerInfo
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order._id,
        items: order.items,
        total: order.total,
        qrToken: order.qrToken,
        status: order.status,
        createdAt: order.createdAt,
        expiresAt: order.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get QR code for order
router.get('/:orderId/qr', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Generate QR code
    const qrCode = qr.image(order.qrToken, { type: 'png', size: 10 });
    
    res.setHeader('Content-Type', 'image/png');
    qrCode.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify QR code and complete order
router.post('/verify-qr', async (req, res) => {
  try {
    const { qrToken } = req.body;

    console.log('🔍 QR Verification Request:');
    console.log('   Token received:', qrToken);
    console.log('   Token type:', typeof qrToken);
    console.log('   Token length:', qrToken?.length);

    const order = await Order.findOne({ qrToken }).populate('userId', 'username email');

    if (!order) {
      console.log('❌ Order not found for token:', qrToken);

      // Debug: Check all tokens in database
      const allOrders = await Order.find({}, 'qrToken status');
      console.log('📋 All orders in database:');
      allOrders.forEach((o, index) => {
        console.log(`   ${index + 1}. Token: "${o.qrToken}" Status: ${o.status}`);
        if (o.qrToken === qrToken) {
          console.log('      ✅ EXACT MATCH FOUND!');
        }
      });

      return res.status(404).json({
        success: false,
        error: 'Invalid QR code'
      });
    }

    console.log('✅ Order found:');
    console.log('   Order ID:', order._id);
    console.log('   Status:', order.status);
    console.log('   Customer:', order.userId?.username);
    console.log('   Expires:', order.expiresAt);

    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false,
        error: `Order is already ${order.status}` 
      });
    }

    // Check if order has expired
    if (new Date() > order.expiresAt) {
      order.status = 'no-show';
      await order.save();

      // Add strike to user
      const user = await User.findById(order.userId);
      user.strikes += 1;
      
      // Block user if they have 3 or more strikes
      if (user.strikes >= 3) {
        user.isBlocked = true;
      }
      
      await user.save();

      return res.status(400).json({ 
        success: false,
        error: 'Order has expired and marked as no-show' 
      });
    }

    // Mark order as completed
    order.status = 'completed';
    order.pickupTime = new Date();
    await order.save();

    // Add loyalty points to user (1 point per dollar spent)
    const user = await User.findById(order.userId);
    user.loyaltyPoints += Math.floor(order.total);
    await user.save();

    res.json({
      success: true,
      message: 'Order verified and completed successfully',
      order: {
        id: order._id,
        customer: order.userId.username,
        items: order.items,
        total: order.total,
        pickupTime: order.pickupTime
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's order history
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 10, page = 1 } = req.query;

    let filter = { userId };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        hasNext: page * limit < totalOrders
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order details
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('userId', 'username email')
      .populate('items.productId', 'name description');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order (only if pending)
router.patch('/:orderId/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending orders' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
