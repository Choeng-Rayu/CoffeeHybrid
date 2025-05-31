import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/coffeehybrid');

async function testLogin() {
  try {
    console.log('🔍 Testing login for coffeeshop1...');
    
    // Find user by username
    const user = await User.findOne({ username: 'coffeeshop1' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user._id);
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Shop Name:', user.shopName);
    console.log('   Password:', user.password);
    
    // Test password match
    if (user.password === 'seller123') {
      console.log('✅ Password matches');
    } else {
      console.log('❌ Password does not match');
      console.log('   Expected: seller123');
      console.log('   Actual:', user.password);
    }
    
    // Simulate login response
    const loginResponse = {
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        shopName: user.shopName,
        loyaltyPoints: user.loyaltyPoints,
        strikes: user.strikes
      }
    };
    
    console.log('\n📋 Login response would be:');
    console.log(JSON.stringify(loginResponse, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLogin();
