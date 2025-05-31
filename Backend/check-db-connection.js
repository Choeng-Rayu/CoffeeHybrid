import mongoose from 'mongoose';
import Order from './models/Order.js';

// Check current connection
console.log('🔍 Checking database connection...');
console.log('Current connection state:', mongoose.connection.readyState);
console.log('Connection name:', mongoose.connection.name);
console.log('Connection host:', mongoose.connection.host);
console.log('Connection port:', mongoose.connection.port);

mongoose.connect('mongodb://localhost:27017/coffeehybrid');

mongoose.connection.on('connected', async () => {
  try {
    console.log('✅ Connected to MongoDB');
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Collections in database:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Check orders collection specifically
    const ordersCollection = mongoose.connection.db.collection('orders');
    const orderCount = await ordersCollection.countDocuments();
    console.log(`\n📦 Orders collection has ${orderCount} documents`);
    
    // Get all orders directly from collection
    const allOrders = await ordersCollection.find({}).toArray();
    console.log('\n📋 All orders in collection:');
    allOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. ID: ${order._id}`);
      console.log(`      Token: ${order.qrToken}`);
      console.log(`      Status: ${order.status}`);
      console.log(`      Customer: ${order.customerInfo?.name}`);
    });
    
    // Also check using Mongoose model
    console.log('\n🔍 Using Mongoose model:');
    const mongooseOrders = await Order.find({});
    console.log(`Found ${mongooseOrders.length} orders via Mongoose`);
    mongooseOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. Token: ${order.qrToken}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});
