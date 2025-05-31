import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb+srv://choengrayu233:VuC7KNrmUI1bgQ8L@cluster0.bvsjf4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

async function createSellers() {
  try {
    console.log('🏪 Creating seller accounts...');
    
    // Check if sellers already exist
    const existingSellers = await User.find({ role: 'seller' });
    if (existingSellers.length > 0) {
      console.log('✅ Sellers already exist:');
      existingSellers.forEach(seller => {
        console.log(`   - ${seller.username} (${seller.shopName})`);
      });
      process.exit(0);
      return;
    }
    
    const sellersData = [
      {
        username: 'coffeeshop1',
        email: 'shop1@coffeehybrid.com',
        password: 'seller123',
        role: 'seller',
        shopName: 'Coffee Central'
      },
      {
        username: 'coffeeshop2', 
        email: 'shop2@coffeehybrid.com',
        password: 'seller123',
        role: 'seller',
        shopName: 'Bean Paradise'
      },
      {
        username: 'coffeeshop3',
        email: 'shop3@coffeehybrid.com', 
        password: 'seller123',
        role: 'seller',
        shopName: 'Brew Masters'
      }
    ];
    
    for (const sellerData of sellersData) {
      // Create seller (no password hashing as per system requirements)
      const seller = new User({
        username: sellerData.username,
        email: sellerData.email,
        password: sellerData.password, // Plain text password
        role: sellerData.role,
        shopName: sellerData.shopName
      });

      await seller.save();
      console.log(`✅ Created seller: ${sellerData.username} (${sellerData.shopName})`);
    }
    
    console.log('\n🎉 All seller accounts created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Coffee Central: coffeeshop1 / seller123');
    console.log('   Bean Paradise: coffeeshop2 / seller123');
    console.log('   Brew Masters: coffeeshop3 / seller123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sellers:', error);
    process.exit(1);
  }
}

createSellers();
