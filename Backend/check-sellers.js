import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/coffeehybrid');

async function checkSellers() {
  try {
    console.log('🔍 Checking seller accounts...');
    
    const sellers = await User.find({ role: 'seller' });
    console.log(`Found ${sellers.length} seller accounts:`);
    
    if (sellers.length === 0) {
      console.log('❌ No sellers found! Need to create them.');
    } else {
      sellers.forEach(seller => {
        console.log(`✅ Username: ${seller.username}, Email: ${seller.email}, Shop: ${seller.shopName}`);
      });
    }
    
    // Also check if there are any users at all
    const allUsers = await User.find({});
    console.log(`\nTotal users in database: ${allUsers.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSellers();
