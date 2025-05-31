import mongoose from 'mongoose';
import Order from './models/Order.js';
import User from './models/User.js';
import Product from './models/Product.js';

mongoose.connect('mongodb+srv://choengrayu233:VuC7KNrmUI1bgQ8L@cluster0.bvsjf4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

async function debugAnalytics() {
  try {
    console.log('🔍 Debugging analytics data relationships...');
    
    // Get seller
    const seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      console.log('❌ No seller found!');
      process.exit(1);
    }
    
    console.log('✅ Seller found:');
    console.log('   ID:', seller._id);
    console.log('   Username:', seller.username);
    console.log('   Shop:', seller.shopName);
    
    // Get products for this seller
    const products = await Product.find({ sellerId: seller._id });
    console.log(`\n📦 Found ${products.length} products for seller:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (ID: ${product._id})`);
    });
    
    // Get orders and check their product relationships
    const orders = await Order.find({ status: 'completed' }).limit(5);
    console.log(`\n📋 Checking ${orders.length} sample orders:`);
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      console.log(`\n   Order ${i + 1}:`);
      console.log(`     ID: ${order._id}`);
      console.log(`     Total: $${order.total}`);
      console.log(`     Items: ${order.items.length}`);
      
      for (let j = 0; j < order.items.length; j++) {
        const item = order.items[j];
        console.log(`       Item ${j + 1}: ${item.name} (ProductID: ${item.productId})`);
        
        // Check if this product belongs to our seller
        const product = await Product.findById(item.productId);
        if (product) {
          console.log(`         Product found: ${product.name}`);
          console.log(`         Product seller: ${product.sellerId}`);
          console.log(`         Matches our seller: ${product.sellerId.toString() === seller._id.toString()}`);
        } else {
          console.log(`         ❌ Product not found in database!`);
        }
      }
    }
    
    // Test the aggregation logic
    console.log('\n🧪 Testing aggregation logic...');
    
    const testAggregation = await Order.aggregate([
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
          status: 'completed'
        }
      },
      {
        $limit: 3
      },
      {
        $project: {
          _id: 1,
          total: 1,
          'items.productId': 1,
          'items.name': 1,
          'productDetails._id': 1,
          'productDetails.name': 1,
          'productDetails.sellerId': 1
        }
      }
    ]);
    
    console.log('\n📊 Aggregation test results:');
    testAggregation.forEach((result, index) => {
      console.log(`   Result ${index + 1}:`);
      console.log(`     Order ID: ${result._id}`);
      console.log(`     Total: $${result.total}`);
      console.log(`     Items: ${result.items?.length || 0}`);
      console.log(`     Product Details: ${result.productDetails?.length || 0}`);
      
      if (result.productDetails && result.productDetails.length > 0) {
        result.productDetails.forEach((product, pIndex) => {
          console.log(`       Product ${pIndex + 1}: ${product.name} (Seller: ${product.sellerId})`);
          console.log(`         Matches our seller: ${product.sellerId.toString() === seller._id.toString()}`);
        });
      }
    });
    
    // Test the corrected aggregation
    console.log('\n🔧 Testing corrected aggregation...');
    
    const correctedAggregation = await Order.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $match: {
          'product.sellerId': seller._id
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $addToSet: '$_id' },
          totalRevenue: { $sum: '$total' },
          totalItemsSold: { $sum: '$items.quantity' }
        }
      },
      {
        $project: {
          totalOrders: { $size: '$totalOrders' },
          totalRevenue: 1,
          totalItemsSold: 1,
          averageOrderValue: { $divide: ['$totalRevenue', { $size: '$totalOrders' }] }
        }
      }
    ]);
    
    console.log('\n✅ Corrected aggregation results:');
    if (correctedAggregation.length > 0) {
      const stats = correctedAggregation[0];
      console.log(`   Total Orders: ${stats.totalOrders}`);
      console.log(`   Total Revenue: $${stats.totalRevenue.toFixed(2)}`);
      console.log(`   Total Items Sold: ${stats.totalItemsSold}`);
      console.log(`   Average Order Value: $${stats.averageOrderValue.toFixed(2)}`);
    } else {
      console.log('   ❌ No results found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugAnalytics();
