import mongoose from 'mongoose';
import Order from './models/Order.js';
import User from './models/User.js';

mongoose.connect('mongodb+srv://choengrayu233:VuC7KNrmUI1bgQ8L@cluster0.bvsjf4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

async function debugQR() {
  try {
    console.log('🔍 Debugging QR tokens...');
    
    // Get all orders
    const orders = await Order.find({}).populate('userId', 'username email');
    console.log(`Found ${orders.length} orders in database:`);
    
    if (orders.length === 0) {
      console.log('❌ No orders found! Please place an order first.');
      process.exit(0);
    }
    
    orders.forEach((order, index) => {
      console.log(`\n📋 Order ${index + 1}:`);
      console.log('   ID:', order._id);
      console.log('   Customer:', order.userId?.username || 'Unknown');
      console.log('   Status:', order.status);
      console.log('   QR Token:', order.qrToken);
      console.log('   QR Token Length:', order.qrToken?.length);
      console.log('   QR Token Type:', typeof order.qrToken);
      console.log('   Created:', order.createdAt);
      console.log('   Expires:', order.expiresAt);
      console.log('   Total:', order.total);
      
      // Check if expired
      const now = new Date();
      const isExpired = now > order.expiresAt;
      console.log('   Is Expired:', isExpired);
      
      if (isExpired) {
        console.log('   ⚠️ This order has expired!');
      }
    });
    
    // Test a specific QR token if provided
    const testToken = process.argv[2];
    if (testToken) {
      console.log(`\n🧪 Testing specific token: ${testToken}`);
      
      const order = await Order.findOne({ qrToken: testToken }).populate('userId', 'username email');
      
      if (order) {
        console.log('✅ Token found in database');
        console.log('   Order ID:', order._id);
        console.log('   Status:', order.status);
        console.log('   Customer:', order.userId?.username);
        
        if (order.status !== 'pending') {
          console.log(`❌ Order status is '${order.status}', not 'pending'`);
        }
        
        if (new Date() > order.expiresAt) {
          console.log('❌ Order has expired');
        }
        
        if (order.status === 'pending' && new Date() <= order.expiresAt) {
          console.log('✅ Order is valid for verification');
        }
      } else {
        console.log('❌ Token NOT found in database');
        
        // Check for similar tokens (in case of whitespace issues)
        const allTokens = await Order.find({}, 'qrToken');
        console.log('\n🔍 All tokens in database:');
        allTokens.forEach((order, index) => {
          console.log(`   ${index + 1}. "${order.qrToken}"`);
          if (order.qrToken.trim() === testToken.trim()) {
            console.log('      ⚠️ This token matches after trimming whitespace!');
          }
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugQR();
