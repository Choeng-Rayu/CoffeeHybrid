import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Order from './models/Order.js';
import User from './models/User.js';
import Product from './models/Product.js';

mongoose.connect('mongodb+srv://choengrayu233:VuC7KNrmUI1bgQ8L@cluster0.bvsjf4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

async function createTestOrder() {
  try {
    console.log('🛒 Creating test order...');
    
    // Find a customer user
    let customer = await User.findOne({ role: { $ne: 'seller' } });
    if (!customer) {
      // Create a test customer
      customer = new User({
        username: 'testcustomer',
        email: 'test@example.com',
        password: 'test123',
        role: 'customer'
      });
      await customer.save();
      console.log('✅ Created test customer');
    }
    
    // Find a seller
    const seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      console.log('❌ No seller found! Please create sellers first.');
      process.exit(1);
    }

    // Find a product
    let product = await Product.findOne({});
    if (!product) {
      // Create a test product
      product = new Product({
        name: 'Test Coffee',
        description: 'Test coffee for QR verification',
        category: 'hot',
        basePrice: 4.50,
        preparationTime: 5,
        sellerId: seller._id,
        shopName: seller.shopName,
        sizes: [
          { name: 'medium', priceModifier: 0 }
        ],
        addOns: []
      });
      await product.save();
      console.log('✅ Created test product');
    }
    
    // Generate QR token
    const qrToken = uuidv4();
    console.log('🎫 Generated QR Token:', qrToken);
    
    // Create order
    const order = new Order({
      userId: customer._id,
      items: [{
        productId: product._id,
        name: product.name,
        size: 'medium',
        sugarLevel: 'medium',
        iceLevel: 'medium',
        addOns: [],
        quantity: 1,
        price: product.basePrice
      }],
      total: product.basePrice,
      qrToken: qrToken,
      orderSource: 'web',
      customerInfo: {
        name: customer.username,
        email: customer.email
      }
    });
    
    await order.save();
    
    console.log('✅ Test order created successfully!');
    console.log('📋 Order Details:');
    console.log('   Order ID:', order._id);
    console.log('   Customer:', customer.username);
    console.log('   QR Token:', order.qrToken);
    console.log('   Status:', order.status);
    console.log('   Total:', order.total);
    console.log('   Expires:', order.expiresAt);
    
    console.log('\n🧪 Test this QR token in the scanner:');
    console.log(`   Token: ${order.qrToken}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test order:', error);
    process.exit(1);
  }
}

createTestOrder();
